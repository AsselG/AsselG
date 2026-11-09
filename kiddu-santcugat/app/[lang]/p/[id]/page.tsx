import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, MapPin, Share2, Users, XCircle } from 'lucide-react';
import { isLang, t, tn } from '@/lib/i18n';
import { dayLabel } from '@/lib/format';
import { dateOf } from '@/lib/time';
import { now as clock, } from '@/lib/server-context';
import { getPlan } from '@/lib/social';
import { goingCount } from '@/lib/social-logic';
import { groupById, memberOf, organiserToken, origin } from '@/lib/session';
import { siteConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function PlanPage({ params, searchParams }: { params: Promise<{ lang: string; id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { lang, id } = await params;
  if (!isLang(lang)) notFound();
  const sp = await searchParams;
  const plan = await getPlan(id, await clock());
  if (!plan) notFound();
  const group = plan.groupId ? await groupById(plan.groupId) : null;
  const member = await memberOf(group);
  const token = await organiserToken(plan.id, sp.o);
  const isOrganiser = !!token && token === plan.organiserToken;
  const url = `${await origin()}/${lang}/p/${plan.id}`;
  const when = `${dayLabel(dateOf(plan.start), lang)}, ${plan.start.slice(11)}`;
  const status = { going: t(lang, 'statusGoing'), maybe: t(lang, 'statusMaybe'), no: t(lang, 'statusNo') };
  const share = `https://wa.me/?text=${encodeURIComponent(`${t(lang, 'shareText', { title: plan.title, when })} ${url}`)}`;

  return (
    <div className="stack">
      <article className="panel">
        {plan.cancelled && <p className="alert danger" role="alert" data-testid="plan-cancelled">{t(lang, 'planCancelled')}</p>}
        <p className="eyebrow"><Users className="i" size={15} aria-hidden />{t(lang, 'planWithFriends')}</p>
        <h1 style={{ fontSize: 26, margin: '6px 0 10px' }} data-testid="plan-title">{plan.title}</h1>
        <p className="meta" style={{ margin: 0 }}>
          <span data-testid="plan-day" data-day={dateOf(plan.start)}><CalendarDays className="i" size={15} aria-hidden />{when}</span>
          {plan.itemId && <span><MapPin className="i" size={15} aria-hidden /><a href={`/${lang}/item/${plan.itemId}`}>{t(lang, 'place')}</a></span>}
        </p>
        {plan.note && <p style={{ margin: '12px 0 0', fontSize: 16 }} data-testid="plan-note">{plan.note}</p>}
        {plan.organiserName && <p className="note">{t(lang, 'planBy', { name: plan.organiserName })}</p>}
        <p style={{ margin: '14px 0 0' }}><span className="pill" data-testid="going-count">{tn(lang, 'going', goingCount(plan))}</span></p>

        <h2 style={{ fontSize: 15, margin: '16px 0 0' }}>{t(lang, 'whoIsGoing')}</h2>
        <ul className="people" data-testid="rsvp-list">
          {plan.rsvps.map((r) => (
            <li key={r.id}><span className="person"><span className="avatar" aria-hidden>{r.firstName.slice(0, 1).toUpperCase()}</span>{r.firstName}</span><span className="status">{status[r.status]}</span></li>
          ))}
        </ul>

        {!plan.cancelled && (
          <form method="post" action={`/api/plans/${plan.id}/rsvp`} className="form" style={{ marginTop: 16 }}>
            <input type="hidden" name="lang" value={lang} />
            {member ? (
              <p className="note" data-testid="joining-as">{t(lang, 'joiningAs', { name: member.firstName })}</p>
            ) : (
              <div className="field"><label htmlFor="rsvp-name">{t(lang, 'fieldName')}</label><input id="rsvp-name" name="name" type="text" required maxLength={30} autoComplete="given-name" /></div>
            )}
            <div className="answers">
              <button className="btn" name="status" value="going" type="submit">{t(lang, 'answerIn')}</button>
              <button className="btn secondary" name="status" value="maybe" type="submit">{t(lang, 'answerMaybe')}</button>
              <button className="btn secondary" name="status" value="no" type="submit">{t(lang, 'answerNo')}</button>
            </div>
          </form>
        )}
        {!plan.cancelled && (
          <p style={{ marginTop: 16 }}><a className="btn secondary" href={share} target="_blank" rel="noopener"><Share2 className="i" size={17} aria-hidden />{t(lang, 'shareWhatsApp')}</a></p>
        )}
        <p className="note">{t(lang, 'planPrivate', { days: siteConfig().plans.delete_days_after_plan })}</p>
      </article>

      {isOrganiser && !plan.cancelled && (
        <section className="panel" data-testid="organiser-area">
          <h2>{t(lang, 'organiserArea')}</h2>
          <p className="note">{t(lang, 'keepLink')}</p>
          <input type="text" readOnly aria-label={t(lang, 'keepLink')} value={`${url}?o=${plan.organiserToken}`} />
          <form method="post" action={`/api/plans/${plan.id}/cancel`} style={{ marginTop: 12 }}>
            <input type="hidden" name="lang" value={lang} /><input type="hidden" name="o" value={plan.organiserToken} />
            <button className="btn danger" type="submit"><XCircle className="i" size={17} aria-hidden />{t(lang, 'cancelPlan')}</button>
          </form>
        </section>
      )}
    </div>
  );
}
