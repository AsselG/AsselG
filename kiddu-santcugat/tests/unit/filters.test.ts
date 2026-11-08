import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import YAML from 'yaml';
import { visibleItems, parseFilters, isExpired } from '../../lib/filters';
import { periodDays, weekdayOf, daysBetween } from '../../lib/time';
import { pickLang, pick, LANGS } from '../../lib/i18n';
import type { Catalogue } from '../../lib/types';

const cat: Catalogue = JSON.parse(fs.readFileSync('tests/fixtures/catalogue.json', 'utf8'));
const ctx = { now: '2026-11-11T10:00', center: [41.4721, 2.0861] as [number, number], radiusKm: 8, warnAfterDays: 30, hideAfterDays: 90 };
const ids = (f = {}, c = ctx) => visibleItems(cat.items, f, c).map((v) => v.item.id);

describe('time', () => {
  it('knows weekdays and weekend periods', () => {
    expect(weekdayOf('2026-11-11')).toBe('wed');
    expect(periodDays('weekend', '2026-11-11T10:00')).toEqual(['2026-11-14', '2026-11-15']);
    expect(periodDays('weekend', '2026-11-14T10:00')).toEqual(['2026-11-14', '2026-11-15']);
    expect(periodDays('weekend', '2026-11-15T10:00')).toEqual(['2026-11-15']);
    expect(periodDays('tomorrow', '2026-11-14T10:00')).toEqual(['2026-11-15']);
    expect(daysBetween('2026-11-01', '2026-11-11')).toBe(10);
  });
});

describe('visibleItems', () => {
  it('hides drafts, far, expired and too-old items', () => {
    const v = ids();
    for (const hidden of ['p-draft', 'p-far', 'e-expired', 'p-old-museum']) expect(v).not.toContain(hidden);
    expect(v).toContain('p-climbing');
  });
  it('marks stale items between warn and hide limits', () => {
    const stale = visibleItems(cat.items, {}, ctx).filter((x) => x.stale).map((x) => x.item.id);
    expect(stale).toEqual(['p-climbing']);
  });
  it('sorts by distance, unknown ages last when filtering by age', () => {
    const v = visibleItems(cat.items, { age: 4 }, ctx);
    expect(v[v.length - 1].item.id).toBe('p-library');
    expect(v.map((x) => x.item.id)).not.toContain('e-workshop-today');
  });
  it('an event stays visible until it ends', () => {
    const ev = cat.items.find((i) => i.id === 'e-workshop-today')!;
    expect(isExpired(ev, '2026-11-11T18:00')).toBe(false);
    expect(isExpired(ev, '2026-11-11T18:31')).toBe(true);
  });
  it('free and indoor filters', () => {
    for (const v of visibleItems(cat.items, { free: true }, ctx)) expect(v.item.price).toBe(0);
    for (const v of visibleItems(cat.items, { indoor: true }, ctx)) expect(v.item.indoor).toBe(true);
  });
});

describe('parseFilters', () => {
  it('ignores unknown values', () => {
    expect(parseFilters({ theme: 'hacking', age: 'x', when: 'never', free: '1' }, ['sport'])).toEqual({ free: true });
    expect(parseFilters({ theme: 'sport', age: '6', when: 'weekend', indoor: '1' }, ['sport'])).toEqual({ theme: 'sport', age: 6, when: 'weekend', indoor: true });
  });
});

describe('i18n', () => {
  it('config languages are all supported', () => {
    const site = YAML.parse(fs.readFileSync('config/site.yaml', 'utf8'));
    for (const l of site.languages) expect(LANGS).toContain(l);
  });
  it('picks the browser language with fallback', () => {
    expect(pickLang('en-US,en;q=0.9')).toBe('en');
    expect(pickLang('fr-FR,es;q=0.8')).toBe('es');
    expect(pickLang('de')).toBe('ca');
    expect(pickLang(null)).toBe('ca');
  });
  it('falls back to the original language', () => {
    expect(pick({ ca: 'Hola' }, 'en', 'ca')).toBe('Hola');
  });
});
