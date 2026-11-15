import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { requireAdmin } from '@/lib/admin';
import { firstText, listDrafts } from '@/lib/gathering';
import AdminNav from '@/components/AdminNav';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin · review queue', robots: { index: false, follow: false } };

export default async function Queue({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  await requireAdmin();
  const status = (await searchParams).status === 'rejected' ? 'rejected' : 'pending';
  const [drafts, pending] = await Promise.all([listDrafts(status), listDrafts('pending')]);
  drafts.sort((a, b) => a.confidence - b.confidence || (a.item.start ?? '').localeCompare(b.item.start ?? ''));
  return (
    <div className="stack">
      <div className="page-head"><h1>{status === 'rejected' ? 'Rejected' : 'Review queue'}</h1><p>{status === 'rejected' ? 'Never shown to families and never queued again.' : 'Lowest confidence first. Nothing here is public until you publish it.'}</p></div>
      <AdminNav lang={lang} active="queue" pending={pending.length} />
      <p className="row"><a className="link" href={`/${lang}/admin/queue`}>Waiting ({pending.length})</a><a className="link" href={`/${lang}/admin/queue?status=rejected`}>Rejected</a></p>
      {drafts.length === 0 ? <p className="empty">Nothing here.</p> : (
        <ul className="list two">
          {drafts.map((d) => (
            <li key={d.id} className="card" style={{ gridTemplateColumns: '1fr', cursor: 'default' }} data-testid="draft" data-title={firstText(d.item.title)}>
              <div>
                <div className="theme-label" style={{ color: d.confidence >= 0.9 ? 'var(--sport)' : d.confidence >= 0.6 ? 'var(--fun)' : 'var(--danger)' }}>
                  {Math.round(d.confidence * 100)}% confidence · <span data-testid="draft-sources">{d.sources.length} source{d.sources.length === 1 ? '' : 's'}</span>
                </div>
                <h3>{firstText(d.item.title)}</h3>
                <div className="meta"><span>{d.item.start?.replace('T', ' ') ?? 'No date'}</span><span>{d.item.placeName ?? d.item.town}</span><span>{d.item.price === 0 ? 'Free' : d.item.price != null ? `€${d.item.price}` : 'Price ?'}</span></div>
                {d.issues.length > 0 && <div className="warn">{d.issues.join(' · ')}</div>}
                {d.rejectReason && <div className="note">Rejected: {d.rejectReason}</div>}
                <p style={{ margin: '10px 0 0' }}><a className="btn secondary small" href={`/${lang}/admin/queue/${d.id}`}>Review</a></p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
