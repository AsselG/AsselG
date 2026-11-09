import { notFound } from 'next/navigation';
import { isLang, pick, t, LANG_NAMES } from '@/lib/i18n';
import { loadCatalogue } from '@/lib/catalogue';
import { ageDays, isExpired, similarUpcoming } from '@/lib/filters';
import { filterContext } from '@/lib/server-context';
import { ageLabel, longDate, priceLabel, distanceLabel } from '@/lib/format';
import { dateOf } from '@/lib/time';
import { distanceKm } from '@/lib/geo';
import { THEME_ICON } from '@/lib/view';
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

  const Fact = ({ icon, label, children, id }: { icon: string; label: string; children: React.ReactNode; id: string }) => (
    <div className="fact"><dt><span aria-hidden>{icon} </span>{label}</dt><dd data-testid={id}>{children}</dd></div>
  );
  return (
    <article data-testid="item-detail" data-type={item.type}>
      <header className={`detail-hero soft-${item.themes[0]}`}>
        <a className="back" href={`/${L}`}>← {t(L, 'back')}</a>
        {expired && <p className="finished" role="alert" data-testid="finished">{t(L, 'finished')}</p>}
        <div className="big" aria-hidden>{THEME_ICON[item.themes[0]]}</div>
        <h1>{pick(item.title, L, item.originalLanguage)}</h1>
        {age > ctx.warnAfterDays && <p className="warn" data-testid="stale">⚠️ {t(L, 'stale')}</p>}
        {description && (
          <>
            {item.descriptionAiGenerated && <span className="ai" data-testid="ai-label">{t(L, 'aiLabel')}</span>}
            <p className="desc" data-testid="description">{description}</p>
          </>
        )}
      </header>

      <div className="actions">
        <a className="btn coral" data-testid="directions" href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`} target="_blank" rel="noopener">
          <span aria-hidden>🧭</span>{t(L, 'directions')}
        </a>
        {item.bookingUrl && (
          <a className="btn" data-testid="booking" href={item.bookingUrl} rel="noopener" target="_blank"><span aria-hidden>🎟️</span>{t(L, 'bookingLink')}</a>
        )}
        <a data-testid="source" href={item.sourceUrl} target="_blank" rel="noopener">{t(L, 'source')} ↗</a>
      </div>

      <dl className="facts">
        {item.type === 'event' && item.start && (
          <>
            <Fact icon="📅" label={t(L, 'date')} id="date">{longDate(dateOf(item.start), L)}</Fact>
            <Fact icon="🕒" label={t(L, 'time')} id="time">{item.start.slice(11)}{item.end ? `–${item.end.slice(11)}` : ''}</Fact>
            <Fact icon="🏛️" label={t(L, 'place')} id="place">{item.placeName ?? item.town}</Fact>
          </>
        )}
        <Fact icon="📍" label={t(L, 'address')} id="address">
          {item.address ?? item.town} · {distanceLabel(distanceKm(ctx.center[0], ctx.center[1], item.lat, item.lng))}
        </Fact>
        {item.type === 'place' && (
          <Fact icon="🕒" label={t(L, 'openingHours')} id="opening-hours">
            {!h ? t(L, 'hoursUnknown') : h === 'always' ? t(L, 'alwaysOpen') : (
              <ul>{WEEK.map((w) => (<li key={w}>{t(L, w)}: {h[w]?.length ? h[w]!.map(([a, b]) => `${a}–${b}`).join(', ') : '—'}</li>))}</ul>
            )}
          </Fact>
        )}
        <Fact icon="👶" label={t(L, 'ageRange')} id="age">{ageLabel(item, L)}</Fact>
        <Fact icon="💶" label={t(L, 'price')} id="price">{priceLabel(item, L)}</Fact>
        <Fact icon={item.indoor ? '🏠' : '🌤️'} label={t(L, 'setting')} id="setting">{t(L, item.indoor ? 'indoor' : 'outdoor')}</Fact>
        {item.facilities?.length ? <Fact icon="🚻" label={t(L, 'facilities')} id="facilities">{item.facilities.join(', ')}</Fact> : null}
        {item.activityLanguages?.length ? (
          <Fact icon="💬" label={t(L, 'language')} id="activity-language">{item.activityLanguages.map((x) => LANG_NAMES[x]).join(', ')}</Fact>
        ) : null}
      </dl>
      <p className="checked">{t(L, 'lastChecked', { date: longDate(item.lastChecked, L) })}</p>
      {expired && similar.length > 0 && (
        <section className="similar" data-testid="similar">
          <h2 className="section-title">{t(L, 'similar')}</h2>
          <ul>
            {similar.map((s) => (
              <li key={s.id}><a data-testid="similar-item" data-id={s.id} href={`/${L}/item/${s.id}`}>{THEME_ICON[s.themes[0]]} {pick(s.title, L, s.originalLanguage)}</a></li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
