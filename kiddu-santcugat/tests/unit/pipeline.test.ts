import { describe, expect, it } from 'vitest';
import { allowed, parseRobots } from '../../pipeline/fetch';
import { htmlToText } from '../../pipeline/html';
import { quoteFound, verify } from '../../pipeline/verify';
import { scoreItems } from '../../pipeline/golden';
import { dedupeKey } from '../../lib/gathering';
import type { ExtractedItemT } from '../../pipeline/schema';

const places = [{ id: 'b', name: 'Biblioteca de prova', aliases: ['Carrer de Prova 1'], address: 'Carrer de Prova 1', lat: 41.47, lng: 2.08 }];
const ctx = { now: '2026-11-11T03:00', url: 'https://x/a', places, defaultTown: 'Sant Cugat del Vallès', sourceUrl: 'https://x/a' };
const base: ExtractedItemT = {
  kind: 'event', title: 'Hora del conte', summary: 'Contes.', language: 'ca', themes: ['education'], ageMin: 3, ageMax: 6, price: null, isFree: true,
  indoor: true, start: '2027-06-12T11:00', end: null, placeName: 'Biblioteca de prova', address: null, town: null, bookingUrl: null,
  evidence: { title: 'Hora del conte', date: 'Dissabte 12 de juny de 2027', price: 'gratuïta', age: 'de 3 a 6 anys', place: 'Biblioteca de prova' },
};
const page = 'Hora del conte\nDissabte 12 de juny de 2027, a les 11:00 h. Biblioteca de prova. Per a infants de 3 a 6 anys. Activitat gratuïta.';

describe('robots.txt', () => {
  it('uses the most specific group and the longest rule', () => {
    const r = parseRobots('User-agent: *\nDisallow: /private/\n\nUser-agent: KidduBot\nDisallow: /agenda/old\nAllow: /agenda/old/kids', 'KidduBot/0.1 (+https://x)');
    expect(allowed(r, '/private/x')).toBe(true);           // our group does not forbid it
    expect(allowed(r, '/agenda/old/2020')).toBe(false);
    expect(allowed(r, '/agenda/old/kids/1')).toBe(true);
    expect(allowed(parseRobots('User-agent: *\nDisallow: /private/', 'KidduBot'), '/private/a')).toBe(false);
    expect(allowed(parseRobots('User-agent: *\nDisallow:', 'KidduBot'), '/anything')).toBe(true);
  });
});

describe('page cleaning', () => {
  it('drops scripts, styles, navigation and footers, keeps text and decodes entities', () => {
    const t = htmlToText('<nav>Menu</nav><script>evil()</script><h1>Taller&nbsp;d&#39;art</h1><p>Preu: 5&euro;</p><footer>©</footer>', 1000);
    expect(t).toBe("Taller d'art\nPreu: 5€");
    expect(htmlToText('<p>' + 'a'.repeat(50) + '</p>', 10)).toHaveLength(10);
  });
});

describe('fact checks', () => {
  it('finds quotes ignoring case and spacing, never invented ones', () => {
    expect(quoteFound('dissabte 12  de juny', page)).toBe(true);
    expect(quoteFound('Dissabte 26 de juny', page)).toBe(false);
    expect(quoteFound(null, page)).toBe(false);
  });
  it('a fully supported, placeable event gets full confidence', () => {
    const v = verify(base, page, ctx);
    expect(v.issues).toEqual([]);
    expect(v.confidence).toBe(1);
    expect(v.item.price).toBe(0);
    expect(v.item.lat).toBe(41.47);
  });
  it('an invented date lowers confidence and is flagged', () => {
    const v = verify({ ...base, evidence: { ...base.evidence, date: 'Dissabte 26 de juny' } }, page, ctx);
    expect(v.issues).toContain('Date not found in the source');
    expect(v.confidence).toBeLessThan(0.9);
  });
  it('unknown venues need a location; past events and empty titles are rejected', () => {
    expect(verify({ ...base, placeName: 'Espai Jove' }, page, ctx).issues).toContain('Location unknown: choose a place for the map');
    expect(verify({ ...base, start: '2026-01-01T10:00' }, page, ctx).rejectReason).toBe('past event');
    expect(verify({ ...base, title: '  ' }, page, ctx).rejectReason).toBe('bad title');
  });
  it('drops impossible values instead of trusting them', () => {
    const v = verify({ ...base, ageMin: 9, ageMax: 3, price: -5, isFree: false, bookingUrl: 'javascript:alert(1)' }, page, ctx);
    expect(v.item.ageMax).toBeNull();
    expect(v.item.price).toBeNull();
    expect(v.item.bookingUrl).toBeUndefined();
  });
});

describe('dedupe and golden scoring', () => {
  it('same event from two sites has the same key, accents and case aside', () => {
    expect(dedupeKey({ title: 'Concert Familiar', start: '2027-06-19T12:00', placeName: 'Plaça de Prova', town: 'x' }))
      .toBe(dedupeKey({ title: 'concert familiar', start: '2027-06-19T12:00', placeName: 'Placa de prova', town: 'y' }));
  });
  it('scores title and fields', () => {
    const s = scoreItems([{ title: 'Hora del conte', start: '2027-06-12T11:00', price: 0 }], [{ title: 'hora del conte', start: '2027-06-12T11:00', price: 5 }]);
    expect(s).toEqual({ right: 2, total: 3 });
  });
});
