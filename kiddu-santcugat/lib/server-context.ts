import 'server-only';
import { cookies } from 'next/headers';
import { areaConfig, siteConfig } from './config';
import { toNaive } from './time';
import type { Context } from './filters';

const hooks = () => process.env.KIDDU_TEST_HOOKS === '1';

/** Current local time. Tests can fix it with the kiddu_now cookie (only when KIDDU_TEST_HOOKS=1). */
export async function now(): Promise<string> {
  if (hooks()) {
    const c = (await cookies()).get('kiddu_now')?.value;
    if (c && /^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(c)) return c;
  }
  return toNaive(new Date());
}

export async function filterContext(): Promise<Context> {
  const site = siteConfig();
  const area = areaConfig();
  return {
    now: await now(),
    center: area.centre,
    radiusKm: area.radius_km ?? site.area.default_radius_km,
    warnAfterDays: site.freshness.warn_after_days,
    hideAfterDays: site.freshness.hide_after_days,
  };
}

/** Rain probability today (0..1) or null when unknown. Open-Meteo, no key, cached 1 hour. */
export async function rainProbabilityToday(center: [number, number]): Promise<number | null> {
  if (hooks()) {
    const c = (await cookies()).get('kiddu_weather')?.value;
    if (c === 'rain') return 0.9;
    if (c === 'dry') return 0.05;
  }
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${center[0]}&longitude=${center[1]}&daily=precipitation_probability_max&forecast_days=1&timezone=Europe%2FMadrid`;
    const r = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(3000) });
    if (!r.ok) return null;
    const j = await r.json();
    const v = j?.daily?.precipitation_probability_max?.[0];
    return typeof v === 'number' ? v / 100 : null;
  } catch {
    return null;
  }
}
