import type { ExtractedItemT } from './schema';
import type { DraftItem, Evidence } from '../lib/gathering';
import { matchPlace, type Place } from '../lib/places';
import type { Lang } from '../lib/types';

const squash = (s: string) => s.normalize('NFC').toLowerCase().replace(/[’‘`]/g, "'").replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();

/** A quote counts only if it appears in the page text (ignoring case and spacing). */
export const quoteFound = (quote: string | null, pageText: string) => !!quote && squash(pageText).includes(squash(quote));

export interface Verified { item: DraftItem; evidence: Evidence; issues: string[]; confidence: number; rejectReason?: string }

/**
 * Our own checks on what the model returned. The model's word is never enough:
 * each fact needs a quote we can find on the page, and the event must be in the future and placeable on the map.
 */
export function verify(x: ExtractedItemT, pageText: string, ctx: { now: string; url: string; places: Place[]; defaultTown: string; sourceUrl: string }): Verified {
  const issues: string[] = [];
  let confidence = 1;
  const title = x.title.replace(/\s+/g, ' ').trim();
  if (!title || title.length > 120) return { item: null as never, evidence: x.evidence, issues: ['Title missing or too long'], confidence: 0, rejectReason: 'bad title' };
  if (x.kind === 'event') {
    if (!x.start || !/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(x.start)) { issues.push('Date missing'); confidence -= 0.35; }
    else if (x.start < ctx.now) return { item: null as never, evidence: x.evidence, issues: ['Already happened'], confidence: 0, rejectReason: 'past event' };
  }
  const check = (field: keyof Evidence, label: string, weight: number, required: boolean) => {
    const q = x.evidence[field];
    if (q == null) { if (required) { issues.push(`${label} not found in the source`); confidence -= weight; } return; }
    if (!quoteFound(q, pageText)) { issues.push(`${label} not found in the source`); confidence -= weight; }
  };
  check('title', 'Title', 0.4, true);
  if (x.kind === 'event' && x.start) check('date', 'Date', 0.35, true);
  check('price', 'Price', 0.1, false);
  check('age', 'Age', 0.1, false);
  check('place', 'Place', 0.1, false);
  const place = matchPlace(ctx.places, x.placeName, x.address);
  if (!place) { issues.push('Location unknown: choose a place for the map'); confidence -= 0.25; }
  if (x.themes.length === 0) { issues.push('No theme'); confidence -= 0.05; }
  if (x.indoor == null) { issues.push('Indoor or outdoor unknown'); confidence -= 0.05; }
  const ageMin = x.ageMin != null && x.ageMin >= 0 && x.ageMin <= 17 ? x.ageMin : null;
  const ageMax = x.ageMax != null && x.ageMax >= 0 && x.ageMax <= 17 && (ageMin == null || x.ageMax >= ageMin) ? x.ageMax : null;
  const price = x.isFree ? 0 : x.price != null && x.price >= 0 && x.price <= 500 ? x.price : null;
  const lang = x.language as Lang;
  const item: DraftItem = {
    id: '', type: x.kind, status: 'draft',
    title: { [lang]: title }, description: x.summary ? { [lang]: x.summary.slice(0, 300) } : undefined,
    descriptionAiGenerated: true, originalLanguage: lang,
    themes: x.themes.length ? x.themes : ['fun'],
    ageMin, ageMax, price, indoor: !!x.indoor,
    lat: place?.lat ?? null, lng: place?.lng ?? null,
    address: place?.address ?? x.address ?? undefined, town: x.town ?? ctx.defaultTown,
    placeName: place?.name ?? x.placeName ?? undefined,
    start: x.kind === 'event' ? x.start ?? undefined : undefined,
    end: x.kind === 'event' && x.end && /^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(x.end) && (!x.start || x.end >= x.start) ? x.end : undefined,
    bookingUrl: x.bookingUrl && /^https?:\/\//.test(x.bookingUrl) ? x.bookingUrl : undefined,
    sourceUrl: ctx.sourceUrl, lastChecked: ctx.now.slice(0, 10),
  };
  return { item, evidence: x.evidence, issues, confidence: Math.max(0, Math.round(confidence * 100) / 100) };
}
