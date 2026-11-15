// Golden-set check: npm run pipeline:golden
// tests/golden/<name>.html is a saved real page; <name>.expected.json lists what a careful person found on it.
// Fails (exit 1) when field accuracy is below ai.golden_set_min_field_accuracy. Run it before changing the prompt or the model.
import fs from 'node:fs';
import path from 'node:path';
import { siteConfig } from '../lib/config';
import { htmlToText } from './html';
import { makeExtractor } from './extract';

interface Expected { title: string; start?: string | null; price?: number | null; ageMin?: number | null; ageMax?: number | null; placeName?: string | null }
const FIELDS = ['start', 'price', 'ageMin', 'ageMax', 'placeName'] as const;
const n = (s: unknown) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

export function scoreItems(expected: Expected[], got: Record<string, unknown>[]): { right: number; total: number } {
  let right = 0, total = 0;
  for (const e of expected) {
    total += 1 + FIELDS.filter((f) => e[f] !== undefined).length;
    const g = got.find((x) => n(x.title) === n(e.title));
    if (!g) continue;
    right += 1;
    for (const f of FIELDS) if (e[f] !== undefined && n(g[f]) === n(e[f])) right += 1;
  }
  return { right, total };
}

async function main() {
  const dir = path.join(process.cwd(), process.env.KIDDU_GOLDEN_DIR ?? 'tests/golden');
  const pages = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.html')) : [];
  const site = siteConfig();
  const ex = makeExtractor();
  let right = 0, total = 0;
  for (const p of pages) {
    const expected: Expected[] = JSON.parse(fs.readFileSync(path.join(dir, p.replace(/\.html$/, '.expected.json')), 'utf8'));
    const text = htmlToText(fs.readFileSync(path.join(dir, p), 'utf8'), site.pipeline.max_page_chars);
    const res = await ex.extract({ url: `https://golden.local/${p}`, text, today: process.env.KIDDU_GOLDEN_TODAY ?? '2026-11-01', areaName: 'Sant Cugat del Vallès', model: String(site.ai.extraction_model), effort: site.pipeline.extraction_effort });
    const got = res.ok ? (res.data.items as unknown as Record<string, unknown>[]) : [];
    const s = scoreItems(expected, got);
    right += s.right; total += s.total;
    console.error(`${p}: ${s.right}/${s.total}`);
  }
  const accuracy = total ? right / total : 0;
  const min = Number(site.ai.golden_set_min_field_accuracy);
  console.log(JSON.stringify({ pages: pages.length, accuracy, min, pass: pages.length >= 50 && accuracy >= min }));
  if (pages.length < 50) console.error(`Only ${pages.length} golden pages; the spec asks for 50 hand-checked pages.`);
  process.exit(accuracy >= min && pages.length >= 50 ? 0 : 1);
}

if (process.argv[1]?.endsWith('golden.ts')) main();
