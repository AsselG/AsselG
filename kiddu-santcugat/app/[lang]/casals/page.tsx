import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Check, Clock, Euro, Languages, Plus } from 'lucide-react';
import { LANG_NAMES, isLang, pick, t } from '@/lib/i18n';
import { loadCasals, casalWeeks } from '@/lib/casals';
import { siteConfig } from '@/lib/config';
import { fullDate, weekLabel } from '@/lib/format';
import { currentProfile } from '@/lib/session';
import { ThemeIcon } from '@/components/Icons';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Casals' };

export default async function Casals({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const sp = await searchParams;
  const cat = loadCasals();
  const published = cat.casals.filter((c) => c.status === 'published');
  const weeks = casalWeeks(published);
  const age = sp.age && /^\d{1,2}$/.test(sp.age) ? Number(sp.age) : undefined;
  const week = weeks.find((w) => w.start === sp.week)?.start;
  const shown = published.filter((c) => (age == null || (age >= c.ageMin && age <= c.ageMax)) && (!week || c.turns.some((x) => x.start === week)));
  const me = await currentProfile();
  const chosen = new Set((me?.casals ?? []).map((c) => `${c.casalId}|${c.turn}`));
  void siteConfig;

  return (
    <div className="stack">
      <div className="page-head"><h1>{t(lang, 'casalsTitle')}</h1><p>{t(lang, 'casalsIntro')}</p></div>
      {cat.meta.demo && <p className="banner" role="note">{t(lang, 'demoBanner')}</p>}
      <div className="row">
        {me ? <a className="btn small" href={`/${lang}/casals/plan`}>{t(lang, 'myCasalPlan')}</a>
          : <a className="btn small" href={`/${lang}/me?need=profile`}>{t(lang, 'createProfileToPlan')}</a>}
      </div>

      <form method="get" className="filters" aria-label="Filters">
        <div className="row">
          <label className="select-pill"><span>{t(lang, 'childAge')}</span>
            <select name="age" defaultValue={age ?? ''}>
              <option value="">{t(lang, 'anyAge')}</option>
              {Array.from({ length: 15 }, (_, i) => i).map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label className="select-pill"><span>{t(lang, 'weekFilter')}</span>
            <select name="week" defaultValue={week ?? ''}>
              <option value="">{t(lang, 'anyWeek')}</option>
              {weeks.map((w) => <option key={w.start} value={w.start}>{weekLabel(w.start, w.end, lang)}</option>)}
            </select>
          </label>
          <button className="btn secondary small" type="submit">{t(lang, 'showCasals')}</button>
          {(age != null || week) && <a className="link" href={`/${lang}/casals`}>{t(lang, 'showAll')}</a>}
        </div>
      </form>

      {shown.length === 0 ? <p className="empty">{t(lang, 'noCasals')}</p> : (
        <ul className="list two">
          {shown.map((c) => {
            const th = c.themes[0];
            return (
              <li key={c.id} className={`casal-card t-${th}`} data-testid="casal-card" data-id={c.id} data-name={pick(c.name, lang)}>
                <div className="eyebrow" style={{ color: 'var(--c)' }}><ThemeIcon theme={th} size={16} />{c.themes.map((x) => t(lang, `theme_${x}` as const)).join(' · ')}</div>
                <h3>{pick(c.name, lang)}</h3>
                <div className="meta">
                  <span>{c.provider} · {c.town}</span>
                  <span><Euro className="i" size={14} aria-hidden /><span data-testid="casal-price">{c.pricePerWeek == null ? t(lang, 'priceUnknown') : t(lang, 'perWeek', { n: c.pricePerWeek })}</span></span>
                  <span><Clock className="i" size={14} aria-hidden /><span data-testid="casal-hours">{c.hours}</span></span>
                  <span><Languages className="i" size={14} aria-hidden />{c.languages.map((l) => LANG_NAMES[l]).join(', ')}</span>
                </div>
                {c.extendedCare && <div className="note" style={{ margin: 0 }}>{t(lang, 'extendedCare', { hours: c.extendedCare })}</div>}
                <div className="note" style={{ margin: 0 }} data-testid="casal-registration">{t(lang, 'regOpens', { date: fullDate(c.registrationOpens, lang) })}</div>
                <div className="weeks" data-testid="casal-weeks">
                  {c.turns.map((tu) => {
                    const label = weekLabel(tu.start, tu.end, lang);
                    const on = chosen.has(`${c.id}|${tu.start}`);
                    return (
                      <form key={tu.start} method="post" action="/api/casals">
                        <input type="hidden" name="lang" value={lang} /><input type="hidden" name="action" value="add" />
                        <input type="hidden" name="casalId" value={c.id} /><input type="hidden" name="turn" value={tu.start} />
                        <button type="submit" disabled={on} aria-label={label}>{on ? <Check className="i" size={14} aria-hidden /> : <Plus className="i" size={14} aria-hidden />} {label}</button>
                      </form>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
