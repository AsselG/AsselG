import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Check, Eye, EyeOff, Trash2 } from 'lucide-react';
import { isLang, pick, t, tn } from '@/lib/i18n';
import { casalWeeks, loadCasals } from '@/lib/casals';
import { fullDate, weekLabel } from '@/lib/format';
import { daysBetween, dateOf } from '@/lib/time';
import { now as clock } from '@/lib/server-context';
import { profileById } from '@/lib/social';
import { currentProfile } from '@/lib/session';
import type { Profile } from '@/lib/social-logic';
import type { Casal } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function CasalPlan({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const me = await currentProfile();
  if (!me) redirect(`/${lang}/me?need=profile`);
  const today = dateOf(await clock());
  const casals = loadCasals().casals.filter((c) => c.status === 'published');
  const byId = new Map(casals.map((c) => [c.id, c]));
  const weeks = casalWeeks(casals);
  const friends = (await Promise.all(me.friendIds.map(profileById))).filter((p): p is Profile => !!p && p.shareCasals);

  const note = (c: Casal) => {
    const opens = daysBetween(today, c.registrationOpens);
    if (opens > 0) return tn(lang, 'regNoteFuture', opens, { date: fullDate(c.registrationOpens, lang) });
    if (daysBetween(today, c.registrationDeadline) >= 0) return t(lang, 'regNoteOpen', { date: fullDate(c.registrationDeadline, lang) });
    return t(lang, 'regNoteClosed', { date: fullDate(c.registrationDeadline, lang) });
  };
  const hidden = (action: string, c?: { casalId: string; turn: string }) => (
    <>
      <input type="hidden" name="lang" value={lang} /><input type="hidden" name="action" value={action} />
      {c && <><input type="hidden" name="casalId" value={c.casalId} /><input type="hidden" name="turn" value={c.turn} /></>}
    </>
  );

  return (
    <div className="stack">
      <div className="page-head"><h1>{t(lang, 'myCasalPlan')}</h1><p>{t(lang, 'casalPlanIntro')}</p></div>
      <section className="panel">
        <form method="post" action="/api/casals" className="mini">
          {hidden('share')}<input type="hidden" name="value" value={me.shareCasals ? 'off' : 'on'} />
          <button className={me.shareCasals ? 'btn secondary small' : 'btn small'} type="submit">
            {me.shareCasals ? <EyeOff className="i" size={16} aria-hidden /> : <Eye className="i" size={16} aria-hidden />}
            {me.shareCasals ? t(lang, 'shareCasalsOff') : t(lang, 'shareCasalsOn')}
          </button>
        </form>
        <p className="note">{t(lang, 'shareCasalsHelp')}</p>
        <a className="link" href={`/${lang}/casals`}>{t(lang, 'backToCasals')}</a>
      </section>

      <ul className="list" style={{ gap: 12 }}>
        {weeks.map((w) => {
          const label = weekLabel(w.start, w.end, lang);
          const mine = me.casals.filter((c) => c.turn === w.start && byId.has(c.casalId));
          const theirs = friends.flatMap((f) => f.casals.filter((c) => c.turn === w.start && byId.has(c.casalId)).map((c) => ({ f, c })));
          return (
            <li key={w.start} className={`weekrow${mine.length === 0 ? ' gap' : ''}`} data-testid="week-row" data-label={label} data-start={w.start}>
              <h3>{label}</h3>
              {mine.length === 0 && <p className="note" style={{ margin: 0 }}>{t(lang, 'nothingPlanned')}</p>}
              {mine.map((c) => {
                const casal = byId.get(c.casalId)!;
                const done = c.status === 'registered';
                return (
                  <div key={c.casalId} className={`choice${done ? ' done' : ''}`} data-testid="my-choice">
                    <div className="mini" style={{ justifyContent: 'space-between' }}>
                      <span className="name">{pick(casal.name, lang)}</span>
                      <span className="tag" data-testid="choice-status">{done ? t(lang, 'statusRegistered') : t(lang, 'statusInterested')}</span>
                    </div>
                    {!done && <div className="note" style={{ margin: 0 }} data-testid="registration-note">{note(casal)}</div>}
                    <div className="mini">
                      {!done && (
                        <form method="post" action="/api/casals">{hidden('registered', c)}
                          <button className="btn secondary small" type="submit"><Check className="i" size={15} aria-hidden />{t(lang, 'markRegistered')}</button></form>
                      )}
                      <form method="post" action="/api/casals">{hidden('remove', c)}
                        <button className="btn secondary small" type="submit"><Trash2 className="i" size={15} aria-hidden />{t(lang, 'removeChoice')}</button></form>
                    </div>
                  </div>
                );
              })}
              {theirs.map(({ f, c }) => (
                <div key={`${f.id}${c.casalId}`} className="friendchoice" data-testid="friend-choice" data-name={f.firstName}>
                  <span className="avatar" aria-hidden>{f.firstName.slice(0, 1).toUpperCase()}</span>
                  <span><strong>{f.firstName}</strong> · {pick(byId.get(c.casalId)!.name, lang)}</span>
                </div>
              ))}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
