export type Lang = 'ca' | 'es' | 'en';
export type Theme = 'sport' | 'art' | 'education' | 'fun' | 'nature';
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type Localized = Partial<Record<Lang, string>>;

/** Opening hours: "always", or per weekday a list of [from, to] in local time (HH:MM). Missing = unknown. */
export type OpeningHours = 'always' | Partial<Record<Weekday, [string, string][]>>;

export interface Item {
  id: string;
  type: 'place' | 'event';
  status: 'published' | 'draft' | 'rejected';
  title: Localized;
  description?: Localized;
  descriptionAiGenerated?: boolean;
  /** Language the description was originally written in. */
  originalLanguage?: Lang;
  themes: Theme[];
  ageMin?: number | null;
  ageMax?: number | null;
  /** 0 = free, null/undefined = unknown */
  price?: number | null;
  indoor: boolean;
  lat: number;
  lng: number;
  address?: string;
  town: string;
  placeName?: string;
  openingHours?: OpeningHours;
  facilities?: string[];
  /** Events: local date-times, Europe/Madrid, "YYYY-MM-DDTHH:MM" */
  start?: string;
  end?: string;
  activityLanguages?: Lang[];
  bookingUrl?: string;
  sourceUrl: string;
  /** YYYY-MM-DD */
  lastChecked: string;
}

export interface Catalogue {
  meta: { demo?: boolean; generatedAt?: string; note?: string };
  items: Item[];
}

export type When = 'today' | 'tomorrow' | 'weekend';

export interface Filters {
  theme?: Theme;
  age?: number;
  when?: When;
  free?: boolean;
  indoor?: boolean;
}
