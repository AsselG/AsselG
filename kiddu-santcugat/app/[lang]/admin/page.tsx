import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';
import { isLang } from '@/lib/i18n';
import { requireAdmin } from '@/lib/admin';
import { listDrafts, listItems, listRuns, monthSpend, type SourceResult } from '@/lib/gathering';
import { siteConfig } from '@/lib/config';
import { now as clock } from '@/lib/server-context';
import AdminNav from '@/components/AdminNav';
import { RunCounts, SOURCE_STATUS } from '@/components/AdminBits';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default async function Dashboard({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  await requireAdmin();
  const now = await clock();
  const [pending, items, runs, spend] = await Promise.all([listDrafts('pending'), listItems(), listRuns(), monthSpend(now)]);
  const budget = Number(siteConfig().ai.monthly_budget_eur);
  const month = now.slice(0, 7);
  const budgetHit = runs.find((r) => r.startedAt.slice(0, 7) === month && r.budgetReached);
  const last = runs[0];
  // Latest status of each source over the last runs.
  const sources = new Map<string, SourceResult & { at: string }>();
  for (const r of runs.slice(0, 200)) for (const s of r.sources) if (!sources.has(s.id)) sources.set(s.id, { ...s, at: r.startedAt });
  const failing = [...sources.values()].filter((s) => s.status === 'error' || s.status === 'invalid-output');

  return (
    <div className="stack" data-testid="admin-dashboard">
      <div className="page-head"><h1>Admin</h1><p>AI gathering of events and activities · Sant Cugat del Vallès</p></div>
      <AdminNav lang={lang} active="dashboard" pending={pending.length} />
      {budgetHit && <p className="alert danger" role="alert" data-testid="alert-budget"><TriangleAlert className="i" size={16} aria-hidden /> AI budget reached this month ({budgetHit.startedAt.slice(0, 10)}): the pipeline only checks freshness until next month or until the budget in config/site.yaml is raised.</p>}
      {failing.length > 0 && <p className="alert warn" role="alert" data-testid="alert-sources">{failing.length} source(s) failed in their last run: {failing.map((s) => s.name).join(', ')}.</p>}

      <div className="list two">
        <section className="panel"><h2>Waiting for review</h2><p style={{ fontSize: 32, fontWeight: 700, margin: 0 }} data-testid="queue-count">{pending.length}</p><a className="link" href={`/${lang}/admin/queue`}>Open the review queue</a></section>
        <section className="panel"><h2>AI spend this month</h2><p style={{ fontSize: 22, fontWeight: 700, margin: 0 }} data-testid="month-spend">€{spend.toFixed(2)} of €{budget.toFixed(2)}</p><p className="note">Published items: {items.length}</p></section>
      </div>

      <section className="panel" data-testid="last-run">
        <h2>Last run</h2>
        {last ? (<><p className="note" style={{ marginTop: 0 }}>{last.startedAt.replace('T', ' ')} · run {last.runId}{last.budgetReached ? ' · budget reached' : ''}</p><RunCounts run={last} /></>) : <p className="note">The pipeline has not run yet.</p>}
      </section>

      <section className="panel">
        <h2>Sources</h2>
        {sources.size === 0 ? <p className="note">No source has been read yet.</p> : (
          <table className="admin-table">
            <thead><tr><th>Source</th><th>Status</th><th>Last read</th><th>Found</th></tr></thead>
            <tbody>
              {[...sources.values()].map((s) => (
                <tr key={s.id} data-testid="source-row" data-id={s.id}>
                  <td><a href={s.url} target="_blank" rel="noopener">{s.name}</a></td>
                  <td data-testid="source-status">{SOURCE_STATUS[s.status]}{s.error ? `: ${s.error}` : ''}</td>
                  <td>{s.at.replace('T', ' ')}</td><td>{s.extracted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <p className="note">Sources are listed in config/sources.yaml. Add or switch them off there.</p>
      </section>
    </div>
  );
}
