import type { Filters, Item } from './types';
import { dateOf, daysBetween, periodDays, weekdayOf } from './time';
import { distanceKm } from './geo';

export interface Context {
  now: string; // naive local
  center: [number, number];
  radiusKm: number;
  warnAfterDays: number;
  hideAfterDays: number;
}

export interface VisibleItem {
  item: Item;
  distanceKm: number;
  stale: boolean;
}

export function isExpired(item: Item, now: string): boolean {
  return item.type === 'event' && !!item.end && item.end < now;
}

export function ageDays(item: Item, now: string): number {
  return daysBetween(item.lastChecked, dateOf(now));
}

export function isOpenOnDay(item: Item, day: string): boolean | undefined {
  const h = item.openingHours;
  if (!h) return undefined;
  if (h === 'always') return true;
  const ranges = h[weekdayOf(day)];
  return !!ranges && ranges.length > 0;
}

function matchesWhen(item: Item, days: string[], now: string): boolean {
  if (item.type === 'event') {
    if (!item.start) return false;
    const startDay = dateOf(item.start);
    const endDay = item.end ? dateOf(item.end) : startDay;
    return days.some((d) => d >= startDay && d <= endDay) && !isExpired(item, now);
  }
  // Places: open on at least one day of the period. Unknown hours are not shown for a time filter.
  return days.some((d) => isOpenOnDay(item, d) === true);
}

export function isFree(item: Item): boolean {
  return item.price === 0;
}

export function hasAge(item: Item): boolean {
  return item.ageMin != null || item.ageMax != null;
}

/** Applies publication, radius, expiry and freshness rules, then the visitor's filters. */
export function visibleItems(items: Item[], f: Filters, ctx: Context): VisibleItem[] {
  const days = f.when ? periodDays(f.when, ctx.now) : null;
  const out: VisibleItem[] = [];
  for (const item of items) {
    if (item.status !== 'published') continue;
    const d = distanceKm(ctx.center[0], ctx.center[1], item.lat, item.lng);
    if (d > ctx.radiusKm) continue;
    if (isExpired(item, ctx.now)) continue;
    const age = ageDays(item, ctx.now);
    if (age > ctx.hideAfterDays) continue;
    if (f.theme && !item.themes.includes(f.theme)) continue;
    if (f.age != null && hasAge(item)) {
      const min = item.ageMin ?? 0;
      const max = item.ageMax ?? 99;
      if (f.age < min || f.age > max) continue;
    }
    if (f.free && !isFree(item)) continue;
    if (f.indoor && !item.indoor) continue;
    if (days && !matchesWhen(item, days, ctx.now)) continue;
    out.push({ item, distanceKm: d, stale: age > ctx.warnAfterDays });
  }
  out.sort((a, b) => {
    if (f.age != null) {
      const ha = hasAge(a.item) ? 0 : 1;
      const hb = hasAge(b.item) ? 0 : 1;
      if (ha !== hb) return ha - hb;
    }
    return a.distanceKm - b.distanceKm;
  });
  return out;
}

export function parseFilters(sp: Record<string, string | string[] | undefined>, themes: string[]): Filters {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined));
  const f: Filters = {};
  const theme = one('theme');
  if (theme && themes.includes(theme)) f.theme = theme as Filters['theme'];
  const age = one('age');
  if (age && /^\d{1,2}$/.test(age)) f.age = Number(age);
  const when = one('when');
  if (when === 'today' || when === 'tomorrow' || when === 'weekend') f.when = when;
  if (one('free') === '1') f.free = true;
  if (one('indoor') === '1') f.indoor = true;
  return f;
}

export function similarUpcoming(item: Item, items: Item[], ctx: Context, limit = 3): Item[] {
  return visibleItems(items, {}, ctx)
    .map((v) => v.item)
    .filter((i) => i.id !== item.id && i.themes.some((t) => item.themes.includes(t)))
    .slice(0, limit);
}
