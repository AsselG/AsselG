import '../globals.css';
import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import { isLang, t } from '@/lib/i18n';
import { Suspense } from 'react';
import LangSwitch from '@/components/LangSwitch';

export const metadata: Metadata = { title: 'Kiddu Sant Cugat', description: 'Things to do with kids in Sant Cugat and around' };
export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return (
    <html lang={lang}>
      <body>
        <header className="top">
          <a className="brand" href={`/${lang}`}><span className="logo" aria-hidden>🏡</span>kiddu</a>
          <Suspense fallback={null}><LangSwitch current={lang} /></Suspense>
        </header>
        <main className="wrap">{children}</main>
        <footer><div><strong>{t(lang, 'madeBy')}</strong></div><div data-testid="privacy">{t(lang, 'privacy')}</div></footer>
      </body>
    </html>
  );
}
