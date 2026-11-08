import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

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
}
export interface Area { name: string; centre: [number, number]; radius_km?: number; includes?: string[]; nearby?: string[] }

const root = process.cwd();
const read = (f: string) => YAML.parse(fs.readFileSync(path.join(root, 'config', f), 'utf8'));

export function siteConfig(): SiteConfig {
  return read('site.yaml');
}
export function areaConfig(id?: string): Area & { id: string } {
  const areas = read('areas.yaml').areas as Record<string, Area>;
  const key = id ?? siteConfig().area.default;
  return { id: key, ...areas[key] };
}
