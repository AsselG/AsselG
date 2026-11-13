import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { KeyRound, Share2, Trash2, UserPlus } from 'lucide-react';
import { LANG_NAMES, isLang, t } from '@/lib/i18n';
import { siteConfig } from '@/lib/config';
import { profileById } from '@/lib/social';
import { currentProfile, origin } from '@/lib/session';
import type { Profile } from '@/lib/social-logic';
import ProfileFields from '@/components/ProfileFields';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function Me({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const sp = await searchParams;
  const me = await currentProfile();
  const themes = siteConfig().themes;

  if (!me) {
    return (
      <div className="stack">
        <div className="page-head"><h1>{t(lang, 'profileTitle')}</h1><p>{t(lang, 'profileIntro')}</p></div>
        {sp.need === 'profile' && <p className="alert warn" role="alert" data-testid="need-profile">{t(lang, 'needProfile')}</p>}
        {sp.error && <p className="alert danger" role="alert">{t(lang, 'needName')}</p>}
        <form className="panel form" method="post" action="/api/profile" data-testid="profile-create-form">
          <input type="hidden" name="lang" value={lang} />
          <ProfileFields lang={lang} themes={themes} />
          <button className="btn" type="submit">{t(lang, 'profileCreate')}</button>
        </form>
      </div>
    );
  }

  const base = await origin();
  const inviteUrl = `${base}/${lang}/f/${me.inviteToken}`;
  const friends = (await Promise.all(me.friendIds.map(profileById))).filter((p): p is Profile => !!p);
  const requests = (await Promise.all(me.requestIds.map(profileById))).filter((p): p is Profile => !!p);
  const kids = (p: Profile) => p.kidAges.length === 0 ? t(lang, 'agesNotShared') : t(lang, p.kidAges.length === 1 ? 'kidsOne' : 'kidsMany', { ages: p.kidAges.join(' & ') });
  const interests = (p: Profile) => p.interests.map((x) => t(lang, `theme_${x}` as const)).join(', ');
  const langs = (p: Profile) => p.languages.map((l) => LANG_NAMES[l]).join(', ');
  const wa = `https://wa.me/?text=${encodeURIComponent(`${t(lang, 'connectFrom', { name: me.firstName })} ${inviteUrl}`)}`;

  return (
    <div className="stack">
      <div className="page-head"><h1>{t(lang, 'profileTitle')}</h1></div>
      {sp.error === 'limit' && <p className="alert warn" role="alert">{t(lang, 'limitReached')}</p>}

      <section className="panel" data-testid="profile-card">
        <div className="person" style={{ gap: 12 }}>
          <span className="avatar" style={{ width: 44, height: 44, fontSize: 18 }} aria-hidden>{me.firstName.slice(0, 1).toUpperCase()}</span>
          <div>
            <h2 style={{ margin: 0 }} data-testid="profile-name">{me.firstName}</h2>
            <div className="note" style={{ margin: 0 }} data-testid="profile-kids">{kids(me)}</div>
          </div>
        </div>
        <div className="tags">
          {me.interests.length > 0 && <span className="tag" data-testid="profile-interests">{interests(me)}</span>}
          {me.languages.length > 0 && <span className="tag" data-testid="profile-languages">{langs(me)}</span>}
        </div>
        <details style={{ marginTop: 14 }}>
          <summary className="link" style={{ cursor: 'pointer' }}>{t(lang, 'editProfile')}</summary>
          <form className="form" method="post" action="/api/profile/update" style={{ marginTop: 12 }}>
            <input type="hidden" name="lang" value={lang} />
            <ProfileFields lang={lang} themes={themes} profile={me} />
            <button className="btn secondary" type="submit">{t(lang, 'saveProfile')}</button>
          </form>
        </details>
      </section>

      {requests.length > 0 && (
        <section className="panel" data-testid="requests">
          <h2>{t(lang, 'requestsTitle')}</h2>
          <ul className="people">
            {requests.map((r) => (
              <li key={r.id} className="friend-row" data-testid="request" data-name={r.firstName}>
                <span className="person"><span className="avatar" aria-hidden>{r.firstName.slice(0, 1).toUpperCase()}</span><span>{r.firstName}<span className="note" style={{ display: 'block', margin: 0 }}>{kids(r)}</span></span></span>
                <span className="mini">
                  {(['accept', 'decline'] as const).map((a) => (
                    <form key={a} method="post" action="/api/connect"><input type="hidden" name="lang" value={lang} /><input type="hidden" name="action" value={a} /><input type="hidden" name="id" value={r.id} />
                      <button className={a === 'accept' ? 'btn small' : 'btn secondary small'} type="submit">{t(lang, a)}</button></form>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel" data-testid="friends">
        <h2>{t(lang, 'connectedFamilies')}</h2>
        {friends.length === 0 ? <p className="note">{t(lang, 'noFriends')}</p> : (
          <ul className="people">
            {friends.map((f) => (
              <li key={f.id} className="friend-row" data-testid="friend" data-name={f.firstName}>
                <span className="person"><span className="avatar" aria-hidden>{f.firstName.slice(0, 1).toUpperCase()}</span>
                  <span>{f.firstName}<span className="note" style={{ display: 'block', margin: 0 }} data-testid="friend-kids">{kids(f)}</span>
                    {(f.interests.length > 0 || f.languages.length > 0) && <span className="note" style={{ display: 'block', margin: 0 }}>{[interests(f), langs(f)].filter(Boolean).join(' · ')}</span>}
                  </span>
                </span>
                <form method="post" action="/api/connect"><input type="hidden" name="lang" value={lang} /><input type="hidden" name="action" value="remove" /><input type="hidden" name="id" value={f.id} />
                  <button className="btn secondary small" type="submit">{t(lang, 'removeConn')}</button></form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel">
        <h2><UserPlus className="i" size={18} aria-hidden /> {t(lang, 'myLinkTitle')}</h2>
        <p className="note">{t(lang, 'myLinkHelp')}</p>
        <div className="copybox"><input type="text" readOnly aria-label={t(lang, 'myLinkTitle')} data-testid="my-invite-url" value={inviteUrl} /></div>
        <p style={{ marginBottom: 0 }}><a className="btn secondary small" href={wa} target="_blank" rel="noopener"><Share2 className="i" size={16} aria-hidden />{t(lang, 'sendWhatsApp')}</a></p>
      </section>

      <section className="panel">
        <h2><KeyRound className="i" size={18} aria-hidden /> {t(lang, 'recoveryTitle')}</h2>
        <p className="note">{t(lang, 'recoveryHelp')}</p>
        <input type="text" readOnly aria-label={t(lang, 'recoveryTitle')} data-testid="recovery-url" value={`${base}/${lang}/restore/${me.recoveryToken}`} />
        <form method="post" action="/api/profile/recovery" style={{ marginTop: 10 }}><input type="hidden" name="lang" value={lang} /><button className="btn secondary small" type="submit">{t(lang, 'recoveryReset')}</button></form>
      </section>

      <form className="panel form" method="post" action="/api/profile/delete">
        <input type="hidden" name="lang" value={lang} />
        <h2 style={{ margin: 0 }}><Trash2 className="i" size={18} aria-hidden /> {t(lang, 'deleteTitle')}</h2>
        <p className="note" style={{ margin: 0 }}>{t(lang, 'deleteHelp')}</p>
        <label className="checks" style={{ display: 'block' }}><span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><input type="checkbox" name="confirm" value="yes" required />{t(lang, 'deleteConfirm')}</span></label>
        <button className="btn danger small" type="submit">{t(lang, 'deleteBtn')}</button>
      </form>
    </div>
  );
}
