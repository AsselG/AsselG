// Usage: npm run pipeline -- --area sant-cugat [--source <id>]
// Needs ANTHROPIC_API_KEY. To write to the hosted site's store from outside Netlify, also set
// KIDDU_BLOBS_SITE_ID and KIDDU_BLOBS_TOKEN (a Netlify personal access token).
import { runPipeline } from './run';

const arg = (name: string) => { const i = process.argv.indexOf(`--${name}`); return i > 0 ? process.argv[i + 1] : undefined; };

runPipeline({ area: arg('area') ?? 'sant-cugat', only: arg('source') })
  .then((r) => {
    console.error(`[pipeline] run ${r.runId}: fetched ${r.totals.fetched}, changed ${r.totals.changed}, extracted ${r.totals.extracted}, published ${r.totals.published}, queued ${r.totals.queued}, rejected ${r.totals.rejected}, AI calls ${r.aiCalls.total}, cost €${r.costEur.toFixed(4)}${r.budgetReached ? ', BUDGET REACHED' : ''}`);
    console.log(JSON.stringify(r));
  })
  .catch((e) => { console.error('[pipeline] failed:', e); process.exit(1); });
