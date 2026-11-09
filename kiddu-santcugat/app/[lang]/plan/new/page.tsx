import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang, pick, t, LOCALES } from '@/lib/i18n';
import { loadCatalogue } from '@/lib/catalogue';
import { visibleItems } from '@/lib/filters';
import { filterContext } from '@/lib/server-context';
import { groupById, memberOf } from '@/lib/session';
import { addDays, dateOf, parseNaive } from '@/lib/time';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function NewPlan({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const sp = await searchParams;
  const ctx = await filterContext();
  const items = loadCatalogue().items;
  const item = sp.item ? items.find((i) => i.id === sp.item && i.status === 'published') : undefined;
  const group = sp.group ? await groupById(sp.group) : null;
  const member = await memberOf(group);
  const today = dateOf(ctx.now);
  const days = Array.from({ length: 15 }, (_, n) => addDays(today, n));
  const fmt = new Intl.DateTimeFormat(LOCALES[lang], { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' });
  const places = visibleItems(items, {}, ctx).map((v) => v.item).sort((a, b) => pick(a.title, lang, a.originalLanguage).localeCompare(pick(b.title, lang, b.originalLanguage)));

  return (
    <div className="stack">
      <div className="page-head">
        <h1>{t(lang, 'planWithFriends')}</h1>
        <p>{t(lang, 'planIntro')}</p>
      </div>
      {sp.error && <p className="alert danger" role="alert">{t(lang, 'needName')}</p>}
      <form className="panel form" method="post" action="/api/plans">
        <input type="hidden" name="lang" value={lang} />
        {item && <input type="hidden" name="item" value={item.id} />}
        {member && group && <input type="hidden" name="group" value={group.id} />}
        {member ? (
          <p className="note" data-testid="organising-as">{t(lang, 'organisingAs', { name: member.firstName })}</p>
        ) : (
          <div className="field"><label htmlFor="name">{t(lang, 'fieldName')}</label><input id="name" name="name" type="text" required maxLength={30} autoComplete="given-name" /></div>
        )}
        {item ? (
          <div className="field"><span className="label">{t(lang, 'fieldWhere')}</span><strong data-testid="plan-place">{pick(item.title, lang, item.originalLanguage)}</strong></div>
        ) : (
          <>
            <div className="field">
              <label htmlFor="where">{t(lang, 'fieldWhere')}</label>
              <select id="where" name="item">
                {places.map((p) => <option key={p.id} value={p.id}>{pick(p.title, lang, p.originalLanguage)}</option>)}
                <option value="other">{t(lang, 'otherPlace')}</option>
              </select>
            </div>
            <div className="field"><label htmlFor="placeName">{t(lang, 'otherPlaceLabel')}</label><input id="placeName" name="placeName" type="text" maxLength={60} /></div>
          </>
        )}
        <div className="field">
          <label htmlFor="day">{t(lang, 'fieldDay')}</label>
          <select id="day" name="date">{days.map((d) => <option key={d} value={d}>{fmt.format(parseNaive(d))}</option>)}</select>
        </div>
        <div className="field"><label htmlFor="time">{t(lang, 'fieldTime')}</label><input id="time" name="time" type="time" defaultValue="10:00" required /></div>
        <div className="field"><label htmlFor="note">{t(lang, 'fieldNote')}</label><input id="note" name="note" type="text" maxLength={140} placeholder={t(lang, 'notePlaceholder')} /></div>
        <button className="btn" type="submit">{t(lang, 'createPlan')}</button>
      </form>
    </div>
  );
}
