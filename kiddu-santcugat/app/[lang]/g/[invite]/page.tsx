import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { isLang, t } from '@/lib/i18n';
import { groupByInvite } from '@/lib/social';
import { currentProfile, memberOf } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function Join({ params, searchParams }: { params: Promise<{ lang: string; invite: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { lang, invite } = await params;
  if (!isLang(lang)) notFound();
  const group = await groupByInvite(invite);
  if (!group) notFound();
  if (await memberOf(group)) redirect(`/${lang}/class/${group.id}`);
  const sp = await searchParams;
  const me = await currentProfile();
  return (
    <div className="stack">
      <div className="page-head">
        <h1 data-testid="join-group-name">{group.name}</h1>
        <p>{t(lang, 'joinIntro')}</p>
      </div>
      {sp.error && <p className="alert danger" role="alert">{t(lang, 'needName')}</p>}
      <form className="panel form" method="post" action="/api/join">
        <input type="hidden" name="lang" value={lang} /><input type="hidden" name="invite" value={invite} />
        {!me && (
          <>
            <div className="field"><label htmlFor="firstName">{t(lang, 'fieldName')}</label><input id="firstName" name="firstName" type="text" required maxLength={30} autoComplete="given-name" /></div>
            <div className="field">
              <label htmlFor="ages">{t(lang, 'kidAges')}</label>
              <input id="ages" name="ages" type="text" inputMode="numeric" maxLength={30} placeholder="4, 6" />
              <span className="help">{t(lang, 'kidAgesHelp')}</span>
            </div>
          </>
        )}
        <button className="btn" type="submit">{me ? t(lang, 'joinAs', { name: me.firstName }) : t(lang, 'joinButton')}</button>
        <p className="note">{t(lang, 'familyNote')}</p>
      </form>
    </div>
  );
}
