import type { RunReport, SourceResult } from '@/lib/gathering';

export const SOURCE_STATUS: Record<SourceResult['status'], string> = {
  ok: 'OK', unchanged: 'Unchanged', 'blocked-robots': 'Blocked by robots.txt', blocklisted: 'Blocklisted', error: 'Error',
  'invalid-output': 'AI output invalid', 'skipped-budget': 'Skipped: budget reached', disabled: 'Disabled',
};

export function RunCounts({ run }: { run: RunReport }) {
  const cells = ['fetched', 'changed', 'extracted', 'published', 'queued', 'rejected'] as const;
  return (
    <div className="row" style={{ gap: 16 }}>
      {cells.map((c) => (
        <div key={c}><div className="note" style={{ margin: 0 }}>{c}</div><div style={{ fontWeight: 700, fontSize: 18 }} data-testid={`run-${c}`}>{run.totals[c]}</div></div>
      ))}
      <div><div className="note" style={{ margin: 0 }}>AI cost</div><div style={{ fontWeight: 700, fontSize: 18 }} data-testid="run-cost">€{run.costEur.toFixed(4)}</div></div>
    </div>
  );
}
