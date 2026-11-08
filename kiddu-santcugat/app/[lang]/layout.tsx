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
          <a className="brand" href={`/${lang}`}><b>k</b>kiddu</a>
          <Suspense fallback={null}><LangSwitch current={lang} /></Suspense>
        </header>
        <main className="wrap">{children}</main>
        <footer>{t(lang, 'privacy')}</footer>
      </body>
    </html>
  );
}
