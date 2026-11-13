import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, Check, LogOut, Plus, UserPlus, Users } from 'lucide-react';
import { isLang, t, tn } from '@/lib/i18n';
import { dayLabel } from '@/lib/format';
import { dateOf } from '@/lib/time';
import { now as clock } from '@/lib/server-context';
import { popularItems, profileById, upcomingGroupPlans } from '@/lib/social';
import { goingCount, matchesAge, type Profile } from '@/lib/social-logic';
import { groupById, memberOf } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function ClassPage({ params, searchParams }: { params: Promise<{ lang: string; id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { lang, id } = await params;
  if (!isLang(lang)) notFound();
  const group = await groupById(id);
  const me = await memberOf(group);
  if (!group || !me) {
    // Same answer for "no such group" and "not a member": nothing is revealed.
    return (
      <div className="stack">
        <div className="page-head"><h1>{t(lang, 'myClass')}</h1></div>
        <div className="panel" data-testid="private-notice"><p>{t(lang, 'privateNotice')}</p><p className="note">{t(lang, 'classLandingText')}</p></div>
      </div>
    );
  }
  const sp = await searchParams;
  const now = await clock();
  const age = sp.age && /^\d{1,2}$/.test(sp.age) ? Number(sp.age) : undefined;
  const plans = await upcomingGroupPlans(group.id, now);
  const popular = popularItems(plans);
  const ordered = [...group.members].sort((a, b) => (a.id === me.id ? -1 : b.id === me.id ? 1 : a.joinedAt.localeCompare(b.joinedAt)));
  const members = (await Promise.all(ordered.map((m) => profileById(m.id)))).filter((p): p is Profile => !!p);
  const shown = age == null ? members : members.filter((m) => matchesAge(m, age));
  const kids = (m: Profile) => m.kidAges.length === 0 ? t(lang, 'agesNotShared') : t(lang, m.kidAges.length === 1 ? 'kidsOne' : 'kidsMany', { ages: m.kidAges.join(' & ') });

  return (
    <div className="stack">
      <div className="page-head">
        <h1 data-testid="group-name">{group.name}</h1>
        <p>{tn(lang, 'popularCount', members.length)}</p>
      </div>

      <section className="panel" data-testid="upcoming">
        <div className="tabs-row">
          <h2 style={{ margin: 0 }}>{t(lang, 'upcomingPlaydates')}</h2>
          <a className="btn small" href={`/${lang}/plan/new?group=${group.id}`}><Plus className="i" size={16} aria-hidden />{t(lang, 'proposePlaydate')}</a>
        </div>
        {plans.length === 0 ? <p className="note">{t(lang, 'noPlaydates')}</p> : (
          <ul className="list planlist" style={{ marginTop: 12 }}>
            {plans.map((p) => (
              <li key={p.id} className="card" data-testid="group-plan">
                <div>
                  <a className="plan-title" href={`/${lang}/p/${p.id}`}>{p.title}</a>
                  <div className="meta">
                    <span><CalendarDays className="i" size={14} aria-hidden />{dayLabel(dateOf(p.start), lang)}, {p.start.slice(11)}</span>
                    <span data-testid="group-plan-count"><Users className="i" size={14} aria-hidden />{tn(lang, 'going', goingCount(p))}</span>
                  </div>
                  {p.note && <div className="checked">{p.note}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {popular.length > 0 && (
        <section className="panel" data-testid="popular">
          <h2>{t(lang, 'popularTitle')}</h2>
          <ul className="people">
            {popular.map((x) => (
              <li key={x.itemId} data-testid="popular-item"><a href={`/${lang}/item/${x.itemId}`}>{x.title}</a><span className="status" data-testid="popular-count">{tn(lang, 'popularCount', x.families)}</span></li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel" data-testid="families">
        <h2>{t(lang, 'familiesTitle')}</h2>
        <form method="get" className="row" style={{ marginBottom: 10 }}>
          <label className="select-pill"><span>{t(lang, 'childAge')}</span>
            <select name="age" defaultValue={age ?? ''}>
              <option value="">{t(lang, 'anyAge')}</option>
              {Array.from({ length: 15 }, (_, i) => i).map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <button className="btn secondary small" type="submit">{t(lang, 'showFamilies')}</button>
          {age != null && <a className="link" href={`/${lang}/class/${group.id}`}>{t(lang, 'showAll')}</a>}
        </form>
        {shown.length === 0 ? <p className="note">{t(lang, 'noFamilies')}</p> : (
          <ul className="people">
            {shown.map((m) => (
              <li key={m.id} data-testid="family" data-name={m.firstName} data-ages={m.kidAges.join(',')}>
                <span className="person"><span className="avatar" aria-hidden>{m.firstName.slice(0, 1).toUpperCase()}</span><span>{m.firstName}{m.id === me.id ? ` (${t(lang, 'you')})` : ''}</span></span>
                <span className="mini">
                  <span className="status" data-testid="family-kids">{kids(m)}</span>
                  {m.id !== me.id && (
                    me.friendIds.includes(m.id) ? <span className="badge-ok" data-testid="connected"><Check className="i" size={14} aria-hidden />{t(lang, 'connectedBadge')}</span>
                    : m.requestIds.includes(me.id) ? <span className="status" data-testid="request-sent">{t(lang, 'requestSent')}</span>
                    : me.requestIds.includes(m.id) ? <a className="link" href={`/${lang}/me`}>{t(lang, 'wantsToConnect')}</a>
                    : (
                      <form method="post" action="/api/connect" style={{ margin: 0 }}>
                        <input type="hidden" name="lang" value={lang} /><input type="hidden" name="action" value="request" /><input type="hidden" name="id" value={m.id} /><input type="hidden" name="back" value="class" />
                        <button className="btn secondary small" type="submit"><UserPlus className="i" size={15} aria-hidden />{t(lang, 'connectBtn')}</button>
                      </form>
                    )
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="note">{t(lang, 'familyNote')}</p>
      </section>

      <form method="post" action="/api/leave" className="panel">
        <input type="hidden" name="lang" value={lang} /><input type="hidden" name="groupId" value={group.id} />
        <p className="note" style={{ marginTop: 0 }}>{t(lang, 'leaveHelp')}</p>
        <button className="btn danger small" type="submit"><LogOut className="i" size={16} aria-hidden />{t(lang, 'leaveGroup')}</button>
      </form>
    </div>
  );
}
