import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang, t } from '@/lib/i18n';
import { groupById } from '@/lib/social';
import { origin } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

export default async function NewGroup({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const sp = await searchParams;
  const admin = process.env.KIDDU_ADMIN_KEY;
  if (!admin || sp.key !== admin) notFound();
  const created = sp.created ? await groupById(sp.created) : null;
  return (
    <div className="stack">
      <div className="page-head"><h1>{t(lang, 'groupNew')}</h1></div>
      {created && (
        <section className="panel" data-testid="group-created" data-group-id={created.id}>
          <h2>{t(lang, 'groupCreated')}: {created.name}</h2>
          <div className="field">
            <label htmlFor="invite">{t(lang, 'inviteLink')}</label>
            <input id="invite" type="text" readOnly data-testid="invite-url" value={`${await origin()}/${lang}/g/${created.inviteToken}`} />
            <span className="help">{t(lang, 'inviteHint')}</span>
          </div>
        </section>
      )}
      <form className="panel form" method="post" action="/api/groups">
        <input type="hidden" name="lang" value={lang} /><input type="hidden" name="key" value={sp.key} />
        <div className="field"><label htmlFor="name">{t(lang, 'groupName')}</label><input id="name" name="name" type="text" required maxLength={60} placeholder="P4 - Class A" /></div>
        <button className="btn" type="submit">{t(lang, 'createGroup')}</button>
      </form>
    </div>
  );
}
