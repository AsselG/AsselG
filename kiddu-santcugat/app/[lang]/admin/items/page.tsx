import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { requireAdmin } from '@/lib/admin';
import { firstText, listDrafts, listItems } from '@/lib/gathering';
import AdminNav from '@/components/AdminNav';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin · published', robots: { index: false, follow: false } };

export default async function Items({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  await requireAdmin();
  const [items, pending] = await Promise.all([listItems(), listDrafts('pending')]);
  items.sort((a, b) => (a.start ?? '9').localeCompare(b.start ?? '9'));
  return (
    <div className="stack">
      <div className="page-head"><h1>Published</h1><p>Gathered items families can see now.</p></div>
      <AdminNav lang={lang} active="items" pending={pending.length} />
      {items.length === 0 ? <p className="empty">Nothing published yet.</p> : (
        <ul className="people">
          {items.map((i) => (
            <li key={i.id} className="friend-row" data-testid="admin-item" data-title={firstText(i.title)}>
              <span><a href={`/${lang}/item/${i.id}`}><strong>{firstText(i.title)}</strong></a>
                <span className="note" style={{ display: 'block', margin: 0 }}>{i.start?.replace('T', ' ') ?? 'place'} · {i.placeName ?? i.town} · checked {i.lastChecked} · <span className="tag" data-testid="origin">{i.origin ?? 'editor'}</span></span></span>
              <form method="post" action="/api/admin/item"><input type="hidden" name="lang" value={lang} /><input type="hidden" name="action" value="unpublish" /><input type="hidden" name="id" value={i.id} />
                <button className="btn secondary small" type="submit">Unpublish</button></form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
