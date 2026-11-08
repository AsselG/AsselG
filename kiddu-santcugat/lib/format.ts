import type { Item, Lang } from './types';
import { LOCALES, t } from './i18n';
import { dateOf, parseNaive, weekdayOf } from './time';
import { isOpenOnDay } from './filters';

export function ageLabel(item: Item, lang: Lang): string {
  const { ageMin: min, ageMax: max } = item;
  if (min != null && max != null) return t(lang, 'ages', { min, max });
  if (min != null) return t(lang, 'agesFrom', { min });
  if (max != null) return t(lang, 'agesUpTo', { max });
  return t(lang, 'ageNotSpecified');
}

export function priceLabel(item: Item, lang: Lang): string {
  if (item.price === 0) return t(lang, 'free');
  if (item.price == null) return t(lang, 'priceUnknown');
  return `€${item.price % 1 === 0 ? item.price : item.price.toFixed(2)}`;
}

export function dayLabel(day: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(parseNaive(day));
}

export function longDate(day: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(parseNaive(day));
}

/** "Sat 14 Nov, 11:00" for events; "Open today 10:00–20:00" for places. */
export function whenLabel(item: Item, lang: Lang, now: string): string {
  if (item.type === 'event' && item.start) {
    return `${dayLabel(dateOf(item.start), lang)}, ${item.start.slice(11)}${item.end ? `–${item.end.slice(11)}` : ''}`;
  }
  const h = item.openingHours;
  if (!h) return t(lang, 'hoursUnknown');
  if (h === 'always') return t(lang, 'alwaysOpen');
  const today = dateOf(now);
  const open = isOpenOnDay(item, today);
  const ranges = h[weekdayOf(today)] ?? [];
  return open
    ? t(lang, 'openOn', { day: t(lang, 'todayWord'), hours: ranges.map(([a, b]) => `${a}–${b}`).join(', ') })
    : t(lang, 'closedOn', { day: t(lang, 'todayWord') });
}

export function distanceLabel(km: number): string {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
