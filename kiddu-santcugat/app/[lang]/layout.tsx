import '../globals.css';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { isLang, t } from '@/lib/i18n';
import { myGroupId } from '@/lib/session';
import LangSwitch from '@/components/LangSwitch';
import MainNav from '@/components/MainNav';

export const metadata: Metadata = { title: 'Kiddu Sant Cugat', description: 'Things to do with kids in Sant Cugat and around' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const gid = await myGroupId();
  return (
    <html lang={lang}>
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <a className="brand" href={`/${lang}`}><span className="brand-mark" aria-hidden>k</span>kiddu</a>
            <MainNav lang={lang} classHref={gid ? `/${lang}/class/${gid}` : `/${lang}/class`} labels={{ explore: t(lang, 'navExplore'), cls: t(lang, 'navClass') }} />
            <Suspense fallback={null}><LangSwitch current={lang} /></Suspense>
          </div>
        </header>
        <main className="wrap">{children}</main>
        <footer>
          <div>{t(lang, 'mission')}</div>
          <div><strong>{t(lang, 'madeBy')}</strong></div>
          <div data-testid="privacy">{t(lang, 'privacy')}</div>
        </footer>
      </body>
    </html>
  );
}
