import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { Users } from 'lucide-react';
import { isLang, t } from '@/lib/i18n';
import { currentProfile } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function ClassLanding({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const gid = (await currentProfile())?.groupIds[0];
  if (gid) redirect(`/${lang}/class/${gid}`);
  return (
    <div className="stack">
      <div className="page-head"><h1>{t(lang, 'myClass')}</h1></div>
      <div className="panel" data-testid="private-notice">
        <p className="eyebrow"><Users className="i" size={15} aria-hidden />{t(lang, 'navClass')}</p>
        <p>{t(lang, 'classLandingText')}</p>
      </div>
    </div>
  );
}
