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

  return (
    <article className="detail" data-testid="item-detail" data-type={item.type}>
      <p><a href={`/${L}`}>← {t(L, 'back')}</a></p>
      {expired && <p className="finished" role="alert" data-testid="finished">{t(L, 'finished')}</p>}
      <h1>{THEME_ICON[item.themes[0]]} {pick(item.title, L, item.originalLanguage)}</h1>
      {age > ctx.warnAfterDays && <p className="warn" data-testid="stale">⚠️ {t(L, 'stale')}</p>}
      {description && (
        <section>
          {item.descriptionAiGenerated && <span className="ai" data-testid="ai-label">{t(L, 'aiLabel')}</span>}
          <p data-testid="description">{description}</p>
        </section>
      )}
      <dl>
        {item.type === 'event' && item.start && (
          <>
            <dt>{t(L, 'date')}</dt><dd data-testid="date">{longDate(dateOf(item.start), L)}</dd>
            <dt>{t(L, 'time')}</dt><dd data-testid="time">{item.start.slice(11)}{item.end ? `–${item.end.slice(11)}` : ''}</dd>
            <dt>{t(L, 'place')}</dt><dd data-testid="place">{item.placeName ?? item.town}</dd>
          </>
        )}
        <dt>{t(L, 'address')}</dt>
        <dd data-testid="address">{item.address ?? item.town} · {distanceLabel(distanceKm(ctx.center[0], ctx.center[1], item.lat, item.lng))}</dd>
        {item.type === 'place' && (
          <>
            <dt>{t(L, 'openingHours')}</dt>
            <dd data-testid="opening-hours">
              {!h ? t(L, 'hoursUnknown') : h === 'always' ? t(L, 'alwaysOpen') : (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {WEEK.map((w) => (
                    <li key={w}>{t(L, w)}: {h[w]?.length ? h[w]!.map(([a, b]) => `${a}–${b}`).join(', ') : '—'}</li>
                  ))}
                </ul>
              )}
            </dd>
          </>
        )}
        <dt>{t(L, 'ageRange')}</dt><dd data-testid="age">{ageLabel(item, L)}</dd>
        <dt>{t(L, 'price')}</dt><dd data-testid="price">{priceLabel(item, L)}</dd>
        <dt>{t(L, 'setting')}</dt><dd data-testid="setting">{t(L, item.indoor ? 'indoor' : 'outdoor')}</dd>
        {item.facilities?.length ? (<><dt>{t(L, 'facilities')}</dt><dd data-testid="facilities">{item.facilities.join(', ')}</dd></>) : null}
        {item.activityLanguages?.length ? (
          <><dt>{t(L, 'language')}</dt><dd data-testid="activity-language">{item.activityLanguages.map((x) => LANG_NAMES[x]).join(', ')}</dd></>
        ) : null}
        {item.bookingUrl && (<><dt>{t(L, 'booking')}</dt><dd><a data-testid="booking" href={item.bookingUrl} rel="noopener" target="_blank">{t(L, 'bookingLink')}</a></dd></>)}
      </dl>
      <p>
        <a className="btn" data-testid="directions" href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`} target="_blank" rel="noopener">
          🧭 {t(L, 'directions')}
        </a>{' '}
        <a data-testid="source" href={item.sourceUrl} target="_blank" rel="noopener">{t(L, 'source')} ↗</a>
      </p>
      <p className="checked">{t(L, 'lastChecked', { date: longDate(item.lastChecked, L) })}</p>
      {expired && similar.length > 0 && (
        <section data-testid="similar">
          <h2>{t(L, 'similar')}</h2>
          <ul>
            {similar.map((s) => (
              <li key={s.id}><a data-testid="similar-item" data-id={s.id} href={`/${L}/item/${s.id}`}>{pick(s.title, L, s.originalLanguage)}</a></li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
