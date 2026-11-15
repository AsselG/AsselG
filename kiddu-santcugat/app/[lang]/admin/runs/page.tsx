import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLang } from '@/lib/i18n';
import { requireAdmin } from '@/lib/admin';
import { listDrafts, listRuns } from '@/lib/gathering';
import AdminNav from '@/components/AdminNav';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin · runs', robots: { index: false, follow: false } };

export default async function Runs({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  await requireAdmin();
  const [runs, pending] = await Promise.all([listRuns(), listDrafts('pending')]);
  const cols = ['fetched', 'changed', 'extracted', 'published', 'queued', 'rejected'] as const;
  return (
    <div className="stack">
      <div className="page-head"><h1>Runs</h1><p>Every pipeline run with its counts and AI cost.</p></div>
      <AdminNav lang={lang} active="runs" pending={pending.length} />
      <div className="panel" style={{ overflowX: 'auto' }}>
        <table className="admin-table">
          <thead><tr><th>Started</th>{cols.map((c) => <th key={c}>{c}</th>)}<th>AI calls</th><th>Cost</th><th>Notes</th></tr></thead>
          <tbody>
            {runs.slice(0, 200).map((r) => (
              <tr key={r.runId} data-testid="run-row" data-id={r.runId}>
                <td>{r.startedAt.replace('T', ' ')}</td>
                {cols.map((c) => <td key={c} data-testid={`run-${c}`}>{r.totals[c]}</td>)}
                <td>{r.aiCalls.total}</td>
                <td data-testid="run-cost">€{r.costEur.toFixed(4)}</td>
                <td>{[r.budgetReached && 'budget reached', r.totals.escalated && `${r.totals.escalated} retried`, r.totals.invalid && `${r.totals.invalid} invalid`].filter(Boolean).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
