import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import YAML from 'yaml';
import { areaConfig, siteConfig } from '../lib/config';
import {
  dedupeKey, draftIdOf, firstText, getDraft, getItem, getPageCache, itemIdOf, listItems, monthSpend, publishDraft,
  saveDraft, saveItem, savePageCache, saveRun, type Draft, type RunReport, type SourceResult,
} from '../lib/gathering';
import { loadPlaces } from '../lib/places';
import { toNaive } from '../lib/time';
import { htmlToText } from './html';
import { PoliteFetcher } from './fetch';
import { makeExtractor, type Extractor, type ExtractResult } from './extract';
import { verify, type Verified } from './verify';
import { feedToDraft, parseRss } from './feeds';

export interface SourceDef { id: string; name?: string; type: string; url?: string; enabled: boolean; note?: string }
interface SourcesFile { blocklist?: string[]; areas: Record<string, SourceDef[]> }

export function loadSources(): SourcesFile {
  const p = process.env.KIDDU_SOURCES_PATH ?? path.join(process.cwd(), 'config', 'sources.yaml');
  return YAML.parse(fs.readFileSync(p, 'utf8'));
}

const now = () => (process.env.KIDDU_TEST_HOOKS === '1' && process.env.KIDDU_NOW) || toNaive(new Date());
const hash = (s: string) => createHash('sha1').update(s).digest('hex');
const log = (...a: unknown[]) => console.error('[pipeline]', ...a);

export async function runPipeline(opts: { area: string; only?: string; extractor?: Extractor }): Promise<RunReport> {
  const site = siteConfig();
  const pc = site.pipeline;
  const area = areaConfig(opts.area);
  const started = now();
  const run: RunReport = {
    runId: `${started.replace(/[-:T]/g, '').slice(0, 12)}-${randomBytes(3).toString('hex')}`, area: opts.area,
    startedAt: started, finishedAt: started, budgetReached: false,
    aiCalls: { total: 0 }, tokens: { input: 0, output: 0 }, costEur: 0,
    totals: { fetched: 0, changed: 0, extracted: 0, published: 0, queued: 0, rejected: 0, unchanged: 0, skipped: 0, escalated: 0, invalid: 0, freshnessChecked: 0 },
    sources: [],
  };
  const file = loadSources();
  const blocklist = (file.blocklist ?? []).map((d) => d.toLowerCase());
  const sources = (file.areas[opts.area] ?? []).filter((s) => !opts.only || s.id === opts.only);
  const fetcher = new PoliteFetcher({ userAgent: pc.user_agent, delayMs: pc.request_delay_ms, timeoutMs: pc.timeout_ms });
  const extractor = opts.extractor ?? makeExtractor();
  const places = loadPlaces();
  const budget = Number(site.ai.monthly_budget_eur);
  let spent = await monthSpend(started);
  const primary = String(site.ai.extraction_model), fallback = String(site.ai.escalation_model);
  const effort = pc.extraction_effort;

  const charge = (model: string, r: ExtractResult) => {
    run.aiCalls[model] = (run.aiCalls[model] ?? 0) + 1;
    run.aiCalls.total += 1;
    run.tokens.input += r.usage.input; run.tokens.output += r.usage.output;
    const price = pc.prices_usd_per_million_tokens[model] ?? { input: 0, output: 0 };
    const eur = ((r.usage.input * price.input + r.usage.output * price.output) / 1_000_000) * pc.eur_per_usd;
    run.costEur += eur; spent += eur;
  };

  /** Keeps published items from this page marked as checked today: the page is still there. */
  const refreshFreshness = async (url: string) => {
    for (const it of await listItems()) {
      if ((it.sources ?? [it.sourceUrl]).includes(url) && it.lastChecked !== started.slice(0, 10)) {
        it.lastChecked = started.slice(0, 10); await saveItem(it); run.totals.freshnessChecked += 1;
      }
    }
  };

  for (const s of sources) {
    const r: SourceResult = { id: s.id, name: s.name ?? s.id, url: s.url ?? '', status: 'ok', extracted: 0, queued: 0, published: 0, rejected: 0 };
    run.sources.push(r);
    if (!s.enabled || !['web', 'rss'].includes(s.type) || !s.url) { r.status = 'disabled'; continue; }
    const host = new URL(s.url).hostname.toLowerCase();
    if (blocklist.some((d) => host === d || host.endsWith(`.${d}`))) { r.status = 'blocklisted'; continue; }
    if (!(await fetcher.isAllowed(s.url))) { r.status = 'blocked-robots'; continue; }
    const page = await fetcher.page(s.url);
    if (!page.ok) { r.status = 'error'; r.error = page.error; continue; }
    run.totals.fetched += 1;
    const isFeed = s.type === 'rss';
    const text = isFeed ? page.html : htmlToText(page.html, pc.max_page_chars);
    const h = hash(text);
    const cache = await getPageCache(s.url);
    if (cache?.hash === h) { r.status = 'unchanged'; run.totals.unchanged += 1; await refreshFreshness(s.url); continue; }
    run.totals.changed += 1;

    // Structured official feeds: facts come straight from the feed, no AI involved.
    let candidates: { v: Verified; excerpt: string }[];
    let model = 'feed';
    if (isFeed) {
      candidates = parseRss(text).map((f) => ({ v: feedToDraft(f, { now: started, places, defaultTown: area.name }), excerpt: `${f.title}\n${f.datainici} ${f.hora}\n${f.lloc}\n\n${f.description}`.slice(0, 6000) }));
    } else {
      if (spent >= budget) { run.budgetReached = true; r.status = 'skipped-budget'; await refreshFreshness(s.url); continue; }
      const input = { url: s.url, text, today: started.slice(0, 10), areaName: area.name, effort };
      let res = await extractor.extract({ ...input, model: primary });
      charge(primary, res);
      model = primary;
      if (!res.ok) {
        log(`${s.id}: ${res.error} with ${primary}; retrying once with ${fallback}`);
        run.totals.escalated += 1;
        if (spent >= budget) { run.budgetReached = true; r.status = 'skipped-budget'; continue; }
        res = await extractor.extract({ ...input, model: fallback });
        charge(fallback, res);
        model = fallback;
      }
      if (!res.ok) { r.status = 'invalid-output'; r.error = res.error; run.totals.invalid += 1; continue; }
      const excerpt = text.slice(0, 6000);
      candidates = res.data.items.map((x) => ({ v: verify(x, text, { now: started, url: s.url!, places, defaultTown: area.name, sourceUrl: s.url! }), excerpt }));
    }

    for (const { v, excerpt } of candidates) {
      run.totals.extracted += 1; r.extracted += 1;
      if (v.rejectReason) { run.totals.rejected += 1; r.rejected += 1; continue; }
      const key = dedupeKey({ title: firstText(v.item.title), start: v.item.start ?? null, placeName: v.item.placeName ?? null, town: v.item.town });
      const id = draftIdOf(key);
      const src = { sourceId: s.id, url: s.url, excerpt, fetchedAt: started };
      const existing = await getDraft(id);
      if (existing) {
        if (!existing.sources.some((x2) => x2.url === s.url)) existing.sources.push(src);
        else existing.sources = existing.sources.map((x2) => (x2.url === s.url ? src : x2));
        if (existing.status === 'rejected') { run.totals.skipped += 1; await saveDraft(existing); continue; }      // rejected before: never re-queued
        if (existing.status === 'published') {
          const it = await getItem(itemIdOf(id));
          if (it) { it.lastChecked = started.slice(0, 10); it.sources = existing.sources.map((x2) => x2.url); await saveItem(it); }
          run.totals.skipped += 1; await saveDraft(existing); continue;
        }
        if (!existing.edited) { existing.item = { ...v.item, id }; existing.evidence = v.evidence; existing.issues = v.issues; existing.confidence = Math.max(existing.confidence, v.confidence); existing.model = model; }
        existing.updatedAt = started; existing.runId = run.runId;
        await saveDraft(existing); run.totals.skipped += 1; continue;
      }
      const d: Draft = { id, key, status: 'pending', item: { ...v.item, id }, evidence: v.evidence, issues: v.issues, confidence: v.confidence, model, sources: [src], runId: run.runId, createdAt: started, updatedAt: started };
      const auto = site.publishing.auto_publish && v.confidence >= site.publishing.auto_publish_min_confidence && v.issues.length === 0 && d.item.lat != null;
      if (auto) { await publishDraft(d, 'auto', started); run.totals.published += 1; r.published += 1; }
      else { await saveDraft(d); run.totals.queued += 1; r.queued += 1; }
    }
    await savePageCache({ url: s.url, hash: h, fetchedAt: started });
  }
  run.costEur = Math.round(run.costEur * 10000) / 10000;
  run.finishedAt = now();
  await saveRun(run);
  return run;
}
