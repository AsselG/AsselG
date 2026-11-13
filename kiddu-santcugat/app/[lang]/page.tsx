import { notFound } from 'next/navigation';
import { isLang, DICTS } from '@/lib/i18n';
import { loadCatalogue } from '@/lib/catalogue';
import { areaConfig, siteConfig } from '@/lib/config';
import { parseFilters, visibleItems } from '@/lib/filters';
import { filterContext, rainProbabilityToday } from '@/lib/server-context';
import { toCard } from '@/lib/view';
import { plansForProfile } from '@/lib/social';
import { currentProfile } from '@/lib/session';
import { goingCount } from '@/lib/social-logic';
import { dayLabel } from '@/lib/format';
import { dateOf } from '@/lib/time';
import { t, tn } from '@/lib/i18n';
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

  // Private plans this family may see. Only plans at a catalogue place get a map pin; homes never do.
  const me = await currentProfile();
  const mine = me ? (await plansForProfile(me, ctx.now)).map(({ plan, role }) => {
    const item = plan.itemId ? catalogue.items.find((i) => i.id === plan.itemId && i.status === 'published') : undefined;
    const name = plan.organiserName;
    return {
      id: plan.id, title: plan.title, lat: item?.lat ?? null, lng: item?.lng ?? null,
      when: `${dayLabel(dateOf(plan.start), lang)}, ${plan.start.slice(11)}`,
      going: tn(lang, 'going', goingCount(plan)),
      role: role === 'organiser' ? t(lang, 'organisedByYou') : role === 'class' ? t(lang, 'classPlaydateBy', { name }) : t(lang, 'invitedBy', { name }),
    };
  }) : [];

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
      plans={mine}
    />
  );
}
