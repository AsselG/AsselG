import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { isAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default async function Login({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  if (await isAdmin()) redirect(`/${lang}/admin`);
  const sp = await searchParams;
  return (
    <div className="stack">
      <div className="page-head"><h1>Admin</h1><p>For the Kiddu editors only.</p></div>
      {sp.error && <p className="alert danger" role="alert" data-testid="login-error">That key is not right.</p>}
      <form className="panel form" method="post" action="/api/admin/login">
        <input type="hidden" name="lang" value={lang} />
        <div className="field"><label htmlFor="key">Admin key</label><input id="key" name="key" type="password" required autoComplete="current-password" /></div>
        <button className="btn" type="submit">Log in</button>
      </form>
    </div>
  );
}
