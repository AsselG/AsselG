import { notFound } from 'next/navigation';
import { isLang, DICTS } from '@/lib/i18n';
import { loadCatalogue } from '@/lib/catalogue';
import { areaConfig, siteConfig } from '@/lib/config';
import { parseFilters, visibleItems } from '@/lib/filters';
import { filterContext, rainProbabilityToday } from '@/lib/server-context';
import { toCard } from '@/lib/view';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function Home({
  params, searchParams,
}: { params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const site = siteConfig();
  const area = areaConfig();
  const ctx = await filterContext();
  const filters = parseFilters(await searchParams, site.themes);
  const catalogue = loadCatalogue();
  const cards = visibleItems(catalogue.items, filters, ctx).map((v) => toCard(v, lang, ctx.now));
  const rain = await rainProbabilityToday(ctx.center);
  const rainy = rain != null && rain >= site.weather.rainy_day_chip_min_rain_probability;

  return (
    <HomeClient
      lang={lang}
      dict={DICTS[lang]}
      areaName={area.name}
      center={ctx.center}
      radiusKm={ctx.radiusKm}
      themes={site.themes}
      filters={filters}
      cards={cards}
      rainy={rainy}
      demo={!!catalogue.meta.demo}
      now={ctx.now}
    />
  );
}
