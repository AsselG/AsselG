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
  catalogue: { include_demo_data: boolean };
  pipeline: {
    user_agent: string; request_delay_ms: number; timeout_ms: number; max_page_chars: number;
    extraction_effort: 'low' | 'medium' | 'high'; eur_per_usd: number;
    prices_usd_per_million_tokens: Record<string, { input: number; output: number }>;
  };
}
export interface Area { name: string; centre: [number, number]; radius_km?: number; includes?: string[]; nearby?: string[] }

/** Built from config/*.yaml by scripts/build-config.mjs (runs before dev, build and tests). */
function merge(a: unknown, b: unknown): unknown {
  if (b === null || typeof b !== 'object' || Array.isArray(b) || a === null || typeof a !== 'object') return b;
  const out: Record<string, unknown> = { ...(a as Record<string, unknown>) };
  for (const [k, v] of Object.entries(b)) out[k] = merge(out[k], v);
  return out;
}

/** Behaviour values from config/site.yaml. Tests (and only tests) may override some with KIDDU_SITE_OVERRIDES. */
export function siteConfig(): SiteConfig {
  const base = generated.site as unknown as SiteConfig;
  const o = process.env.KIDDU_TEST_HOOKS === '1' ? process.env.KIDDU_SITE_OVERRIDES : undefined;
  return o ? (merge(base, JSON.parse(o)) as SiteConfig) : base;
}
export function areaConfig(id?: string): Area & { id: string } {
  const areas = generated.areas as unknown as Record<string, Area>;
  const key = id ?? siteConfig().area.default;
  return { id: key, ...areas[key] };
}
