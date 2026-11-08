import type { Item, Lang, Theme } from './types';
import type { VisibleItem } from './filters';
import { pick, t } from './i18n';
import { ageLabel, distanceLabel, longDate, priceLabel, whenLabel } from './format';
import { hasAge } from './filters';

export const THEME_ICON: Record<Theme, string> = { sport: '⚽', art: '🎨', education: '📚', fun: '🎈', nature: '🌳' };

export interface CardView {
  id: string;
  type: Item['type'];
  title: string;
  themes: Theme[];
  themeLabels: string[];
  icon: string;
  lat: number;
  lng: number;
  indoor: boolean;
  age: string;
  ageSpecified: boolean;
  ageMin: number | null;
  ageMax: number | null;
  price: string;
  when: string;
  distance: string;
  distanceKm: number;
  lastChecked: string;
  stale: boolean;
}

export function toCard(v: VisibleItem, lang: Lang, now: string): CardView {
  const i = v.item;
  return {
    id: i.id,
    type: i.type,
    title: pick(i.title, lang, i.originalLanguage),
    themes: i.themes,
    themeLabels: i.themes.map((th) => t(lang, `theme_${th}` as const)),
    icon: THEME_ICON[i.themes[0]] ?? '📍',
    lat: i.lat,
    lng: i.lng,
    indoor: i.indoor,
    age: ageLabel(i, lang),
    ageSpecified: hasAge(i),
    ageMin: i.ageMin ?? null,
    ageMax: i.ageMax ?? null,
    price: priceLabel(i, lang),
    when: whenLabel(i, lang, now),
    distance: distanceLabel(v.distanceKm),
    distanceKm: v.distanceKm,
    lastChecked: t(lang, 'lastChecked', { date: longDate(i.lastChecked, lang) }),
    stale: v.stale,
  };
}
