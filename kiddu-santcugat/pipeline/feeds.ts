import { decodeEntities, htmlToText } from './html';
import { matchPlace, norm, type Place } from '../lib/places';
import type { DraftItem } from '../lib/gathering';
import type { Theme } from '../lib/types';
import type { Verified } from './verify';

/** One <item> of an RSS agenda feed in the format santcugat.cat publishes (extra fields: datainici, datafi, hora, lloc, x, y, tipus). */
export interface FeedItem { guid: string; title: string; link: string; description: string; tipus: string; datainici: string; datafi: string; hora: string; lloc: string; x: string; y: string }

const tag = (block: string, name: string) => {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  if (!m) return '';
  return decodeEntities(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')).trim();
};

export function parseRss(xml: string): FeedItem[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].map(([, b]) => ({
    guid: tag(b, 'guid'), title: htmlToText(tag(b, 'title'), 300).replace(/\n/g, ' '), link: tag(b, 'link'),
    description: htmlToText(tag(b, 'description'), 4000).replace(/\n/g, ' '),
    tipus: tag(b, 'tipus'), datainici: tag(b, 'datainici'), datafi: tag(b, 'datafi'), hora: tag(b, 'hora'), lloc: tag(b, 'lloc').replace(/\s+/g, ' '), x: tag(b, 'x'), y: tag(b, 'y'),
  }));
}

const isoDate = (d: string) => { const m = d.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : null; };
const times = (h: string) => [...h.matchAll(/\b([01]?\d|2[0-3])[:.h]([0-5]\d)\b/g)].map((m) => `${m[1].padStart(2, '0')}:${m[2]}`);
const coord = (v: string) => { const n = Number(v.replace(',', '.')); return v.trim() && Number.isFinite(n) ? n : null; };

/** Ages stated for the children taking part. "Menors de 12 anys han de venir acompanyats" is about supervision, so it is ignored. */
export function agesFrom(text: string): { min: number | null; max: number | null } {
  const range = text.match(/\bde\s+(\d{1,2})\s+a\s+(\d{1,2})\s+anys\b/i) ?? text.match(/\b(\d{1,2})\s*[-–]\s*(\d{1,2})\s*anys\b/i);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };
  const from = text.match(/\bEdat:\s*\+?\s*(\d{1,2})/i) ?? text.match(/\ba partir de\s+(\d{1,2})\s+anys\b/i) ?? text.match(/\+\s?(\d{1,2})\s+anys\b/i);
  return { min: from ? Number(from[1]) : null, max: null };
}
export function priceFrom(text: string): number | null {
  if (/\bgratu[iï]t/i.test(text) || /\bentrada lliure\b/i.test(text)) return 0;
  const m = text.match(/(\d{1,3}(?:[.,]\d{1,2})?)\s*€/);
  return m ? Number(m[1].replace(',', '.')) : null;
}
const THEME_WORDS: [Theme, RegExp][] = [
  ['sport', /\b(cursa|esport|futbol|bàsquet|natació|patinatge|race|hoquei)/i],
  ['nature', /\b(natura|bosc|hort|parc natural|collserola|animals|excursió)/i],
  ['education', /\b(conte|contes|llegim|lectura|biblioteca|ciència|taller de robòtica|museu)/i],
  ['art', /\b(titelles|teatre|màgia|música|concert|dansa|dibuix|pintura|art|circ|òpera|espectacle)/i],
];
export function themesFrom(text: string): Theme[] {
  const t = THEME_WORDS.filter(([, re]) => re.test(text)).map(([th]) => th).slice(0, 2);
  return t.length ? t : ['fun'];
}
const OUTDOOR = /\b(placa|parc|jardins|carrer|rambla|platja|bosc|camp|passeig)\b/;

/** Builds a draft from a structured feed item. Facts come from the feed; the town hall's own text is not copied. */
export function feedToDraft(f: FeedItem, ctx: { now: string; places: Place[]; defaultTown: string }): Verified {
  const issues: string[] = [];
  let confidence = 1;
  const title = f.title.replace(/\s+/g, ' ').trim();
  const day = isoDate(f.datainici);
  if (!title || !day) return { item: null as never, evidence: { title: null, date: null, price: null, age: null, place: null }, issues: ['Title or date missing'], confidence: 0, rejectReason: 'bad item' };
  const [t1, t2] = times(f.hora);
  if (!t1) { issues.push('Time missing'); confidence -= 0.1; }
  const start = `${day}T${t1 ?? '00:00'}`;
  if (start.slice(0, 10) < ctx.now.slice(0, 10)) return { item: null as never, evidence: { title, date: null, price: null, age: null, place: null }, issues: ['Already happened'], confidence: 0, rejectReason: 'past event' };
  const endDay = isoDate(f.datafi) ?? day;
  const end = t2 ? `${endDay}T${t2}` : endDay !== day ? `${endDay}T23:59` : undefined;
  let lat = coord(f.y), lng = coord(f.x);
  if (lat == null || lng == null || lat < 40 || lat > 43 || lng < 0 || lng > 4) { lat = null; lng = null; }
  const place = matchPlace(ctx.places, f.lloc);
  if (lat == null && place) { lat = place.lat; lng = place.lng; }
  if (lat == null) { issues.push('Location unknown: choose a place for the map'); confidence -= 0.25; }
  const text = `${title} ${f.description} ${f.tipus}`;
  const ages = agesFrom(f.description);
  const item: DraftItem = {
    id: '', type: 'event', status: 'draft', title: { ca: title }, originalLanguage: 'ca', descriptionAiGenerated: false,
    themes: themesFrom(text), ageMin: ages.min, ageMax: ages.max, price: priceFrom(f.description),
    indoor: !OUTDOOR.test(` ${norm(f.lloc)} `), lat, lng,
    placeName: f.lloc || undefined, address: place?.address, town: ctx.defaultTown,
    start, end, sourceUrl: /^https?:\/\//.test(f.link) ? f.link : '', lastChecked: ctx.now.slice(0, 10),
  };
  return { item, evidence: { title, date: `${f.datainici} ${f.hora}`.trim(), price: null, age: null, place: f.lloc || null }, issues, confidence: Math.max(0, Math.round(confidence * 100) / 100) };
}
