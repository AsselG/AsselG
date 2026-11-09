import { notFound } from 'next/navigation';
import { isLang, pick, t, LANG_NAMES } from '@/lib/i18n';
import { loadCatalogue } from '@/lib/catalogue';
import { ageDays, isExpired, similarUpcoming } from '@/lib/filters';
import { filterContext } from '@/lib/server-context';
import { ageLabel, longDate, priceLabel, distanceLabel } from '@/lib/format';
import { dateOf } from '@/lib/time';
import { distanceKm } from '@/lib/geo';
import { ThemeIcon } from '@/components/Icons';
import { Accessibility, ArrowLeft, Baby, CalendarDays, Clock, Euro, House, Landmark, Languages, MapPin, Navigation, Ticket, TriangleAlert, Users } from 'lucide-react';
import type { Lang, Weekday } from '@/lib/types';

export const dynamic = 'force-dynamic';
const WEEK: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default async function ItemPage({ params }: { params: Promise<{ lang: string; id: string }> }) {
  const { lang, id } = await params;
  if (!isLang(lang)) notFound();
  const L = lang as Lang;
  const catalogue = loadCatalogue();
  const item = catalogue.items.find((i) => i.id === id && i.status === 'published');
  if (!item) notFound();
  const ctx = await filterContext();
  const age = ageDays(item, ctx.now);
  if (age > ctx.hideAfterDays) notFound();
  const expired = isExpired(item, ctx.now);
  const description = pick(item.description, L, item.originalLanguage);
  const similar = expired ? similarUpcoming(item, catalogue.items, ctx) : [];
  const h = item.openingHours;

  const Fact = ({ icon, label, children, id }: { icon: React.ReactNode; label: string; children: React.ReactNode; id: string }) => (
    <div className="fact"><dt>{icon}{label}</dt><dd data-testid={id}>{children}</dd></div>
  );
  const ic = (I: typeof Clock) => <I className="i" size={16} aria-hidden />;
  const theme = item.themes[0];
  return (
    <article data-testid="item-detail" data-type={item.type} className={`t-${theme}`}>
      <a className="back" href={`/${L}`}><ArrowLeft className="i" size={16} aria-hidden />{t(L, 'back')}</a>
      {expired && <p className="finished" role="alert" data-testid="finished">{t(L, 'finished')}</p>}
      <header className="detail-head">
        <div className="eyebrow" style={{ color: 'var(--c)' }}><ThemeIcon theme={theme} size={16} />{item.themes.map((x) => t(L, `theme_${x}` as const)).join(' · ')}</div>
        <h1>{pick(item.title, L, item.originalLanguage)}</h1>
        {age > ctx.warnAfterDays && <p className="warn" data-testid="stale"><TriangleAlert className="i" size={14} aria-hidden />{t(L, 'stale')}</p>}
        {description && (
          <>
            <p className="desc" data-testid="description">{description}</p>
            {item.descriptionAiGenerated && <span className="ai" data-testid="ai-label">{t(L, 'aiLabel')}</span>}
          </>
        )}
      </header>

      <div className="actions">
        {!expired && <a className="btn" data-testid="plan-with-friends" href={`/${L}/plan/new?item=${item.id}`}><Users className="i" size={18} aria-hidden />{t(L, 'planWithFriends')}</a>}
        <a className="btn secondary" data-testid="directions" href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`} target="_blank" rel="noopener">
          <Navigation className="i" size={17} aria-hidden />{t(L, 'directions')}
        </a>
        {item.bookingUrl && (
          <a className="btn secondary" data-testid="booking" href={item.bookingUrl} rel="noopener" target="_blank"><Ticket className="i" size={17} aria-hidden />{t(L, 'bookingLink')}</a>
        )}
        <a className="link" data-testid="source" href={item.sourceUrl} target="_blank" rel="noopener">{t(L, 'source')} ↗</a>
      </div>

      <dl className="facts">
        {item.type === 'event' && item.start && (
          <>
            <Fact icon={ic(CalendarDays)} label={t(L, 'date')} id="date">{longDate(dateOf(item.start), L)}</Fact>
            <Fact icon={ic(Clock)} label={t(L, 'time')} id="time">{item.start.slice(11)}{item.end ? `–${item.end.slice(11)}` : ''}</Fact>
            <Fact icon={ic(Landmark)} label={t(L, 'place')} id="place">{item.placeName ?? item.town}</Fact>
          </>
        )}
        <Fact icon={ic(MapPin)} label={t(L, 'address')} id="address">
          {item.address ?? item.town} · {distanceLabel(distanceKm(ctx.center[0], ctx.center[1], item.lat, item.lng))}
        </Fact>
        {item.type === 'place' && (
          <Fact icon={ic(Clock)} label={t(L, 'openingHours')} id="opening-hours">
            {!h ? t(L, 'hoursUnknown') : h === 'always' ? t(L, 'alwaysOpen') : (
              <ul>{WEEK.map((w) => (<li key={w}>{t(L, w)}: {h[w]?.length ? h[w]!.map(([a, b]) => `${a}–${b}`).join(', ') : '—'}</li>))}</ul>
            )}
          </Fact>
        )}
        <Fact icon={ic(Baby)} label={t(L, 'ageRange')} id="age">{ageLabel(item, L)}</Fact>
        <Fact icon={ic(Euro)} label={t(L, 'price')} id="price">{priceLabel(item, L)}</Fact>
        <Fact icon={ic(House)} label={t(L, 'setting')} id="setting">{t(L, item.indoor ? 'indoor' : 'outdoor')}</Fact>
        {item.facilities?.length ? <Fact icon={ic(Accessibility)} label={t(L, 'facilities')} id="facilities">{item.facilities.join(', ')}</Fact> : null}
        {item.activityLanguages?.length ? (
          <Fact icon={ic(Languages)} label={t(L, 'language')} id="activity-language">{item.activityLanguages.map((x) => LANG_NAMES[x]).join(', ')}</Fact>
        ) : null}
      </dl>
      <p className="checked">{t(L, 'lastChecked', { date: longDate(item.lastChecked, L) })}</p>
      {expired && similar.length > 0 && (
        <section className="similar" data-testid="similar">
          <div className="section-head"><h2>{t(L, 'similar')}</h2></div>
          <ul>
            {similar.map((x) => (
              <li key={x.id}><a data-testid="similar-item" data-id={x.id} href={`/${L}/item/${x.id}`}>{pick(x.title, L, x.originalLanguage)}</a></li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
