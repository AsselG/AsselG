import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { isLang, t } from '@/lib/i18n';
import { profileByInvite } from '@/lib/social';
import { currentProfile } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

/** A family's personal "connect with me" link. */
export default async function ConnectInvite({ params, searchParams }: { params: Promise<{ lang: string; token: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { lang, token } = await params;
  if (!isLang(lang)) notFound();
  const inviter = await profileByInvite(token);
  if (!inviter) notFound();
  const me = await currentProfile();
  if (me && (me.id === inviter.id || me.friendIds.includes(inviter.id))) redirect(`/${lang}/me`);
  const sp = await searchParams;
  return (
    <div className="stack">
      <div className="page-head"><h1 data-testid="connect-from">{t(lang, 'connectFrom', { name: inviter.firstName })}</h1><p>{t(lang, 'connectExplain')}</p></div>
      {sp.error && <p className="alert danger" role="alert">{t(lang, 'needName')}</p>}
      <form className="panel form" method="post" action="/api/connect">
        <input type="hidden" name="lang" value={lang} /><input type="hidden" name="action" value="invite" /><input type="hidden" name="token" value={token} />
        {!me && (
          <>
            <div className="field"><label htmlFor="firstName">{t(lang, 'fieldName')}</label><input id="firstName" name="firstName" type="text" required maxLength={30} autoComplete="given-name" /></div>
            <div className="field"><label htmlFor="ages">{t(lang, 'kidAges')}</label><input id="ages" name="ages" type="text" inputMode="numeric" maxLength={30} placeholder="4, 6" /><span className="help">{t(lang, 'kidAgesHelp')}</span></div>
          </>
        )}
        <button className="btn" type="submit">{t(lang, 'connectBtn')}</button>
      </form>
    </div>
  );
}
