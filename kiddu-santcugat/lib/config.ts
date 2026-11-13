import 'server-only';
import generated from './generated/config.json';

export interface SiteConfig {
  area: { default: string; default_radius_km: number; min_items_to_show_area: number };
  languages: string[];
  default_language: string;
  themes: string[];
  freshness: { warn_after_days: number; hide_after_days: number };
  plans: { delete_days_after_plan: number; max_rsvps_per_plan: number };
  feedback: { hide_after_reports: number };
  publishing: { auto_publish: boolean; auto_publish_min_confidence: number };
  ai: Record<string, string | number>;
  weather: { rainy_day_chip_min_rain_probability: number };
  profile: { max_friends: number };
  casals: { season: string; share_with_friends_default: boolean; registration_soon_days: number };
}
export interface Area { name: string; centre: [number, number]; radius_km?: number; includes?: string[]; nearby?: string[] }

/** Built from config/*.yaml by scripts/build-config.mjs (runs before dev, build and tests). */
export function siteConfig(): SiteConfig {
  return generated.site as SiteConfig;
}
export function areaConfig(id?: string): Area & { id: string } {
  const areas = generated.areas as unknown as Record<string, Area>;
  const key = id ?? siteConfig().area.default;
  return { id: key, ...areas[key] };
}
