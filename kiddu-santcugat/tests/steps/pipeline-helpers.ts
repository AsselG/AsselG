import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { expect, type Page } from '@playwright/test';
import type { World, RunSummary } from './fixtures';

const exec = promisify(execFile);
export const SITE = 'http://localhost:3101';
export const STORE = '.test-store';

/** Runs the real pipeline CLI against the fake Sant Cugat site, with the fake model. */
export async function runPipeline(world: World, o: { pages: string[]; blocked?: boolean; now?: string; overrides?: Record<string, unknown> }): Promise<RunSummary> {
  const ns = world.ns;
  const host = o.blocked ? 'http://127.0.0.1:3101' : SITE;
  const sources = o.pages.map((p) => ({ id: `${p.replace(/\W+/g, '-')}-${ns}`, name: `Test ${p}`, type: p.endsWith('.rss') ? 'rss' : 'web', enabled: true, url: `${host}/${p}?ns=${ns}` }));
  fs.mkdirSync('test-results', { recursive: true });
  const file = path.resolve('test-results', `sources-${ns}-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify({ blocklist: o.blocked ? ['127.0.0.1'] : [], areas: { 'sant-cugat': sources } }));
  const { stdout } = await exec('node', ['--conditions=react-server', '--import', 'tsx', 'pipeline/cli.ts', '--area', 'sant-cugat'], {
    env: {
      ...process.env, KIDDU_STORE_DIR: STORE, KIDDU_SOURCES_PATH: file, KIDDU_EXTRACTOR: 'mock', KIDDU_MOCK_DIR: 'tests/fixtures/extractions',
      KIDDU_PLACES_PATH: 'tests/fixtures/places.json', CATALOGUE_PATH: 'tests/fixtures/catalogue.json', KIDDU_TEST_HOOKS: '1',
      KIDDU_NOW: o.now ?? '2026-11-11T03:00', KIDDU_SITE_OVERRIDES: JSON.stringify({ pipeline: { request_delay_ms: 0 }, ...world.overrides, ...(o.overrides ?? {}) }),
    },
    timeout: 120_000,
  });
  const summary = JSON.parse(stdout.trim().split('\n').pop()!);
  world.runs.push(summary);
  return summary;
}

export const queuedFromSantCugat = (world: World) => runPipeline(world, { pages: ['agenda.html', 'teatre.html', 'private/secret.html'] });

export async function fakeSiteLog(ns: string): Promise<{ host: string; path: string; ua: string }[]> {
  return (await fetch(`http://127.0.0.1:3101/__log?ns=${ns}`)).json();
}
export const bumpPages = (ns: string) => fetch(`http://127.0.0.1:3101/__bump?ns=${ns}`);

/** Store documents written by the pipeline (the test store is a folder of JSON files). */
export function storeDocs<T>(prefix: string): T[] {
  if (!fs.existsSync(STORE)) return [];
  return fs.readdirSync(STORE).filter((f) => decodeURIComponent(f).startsWith(prefix)).map((f) => JSON.parse(fs.readFileSync(path.join(STORE, f), 'utf8')) as T);
}

export async function adminLogin(page: Page, key = 'test-admin-key') {
  await page.goto('/en/admin/login');
  await page.getByLabel('Admin key').fill(key);
  await page.getByRole('button', { name: 'Log in' }).click();
}

export const t = (world: World, name: string) => `${name} ${world.ns}`;
const attr = (v: string) => v.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export async function openDraft(page: Page, world: World, name: string) {
  await page.goto('/en/admin/queue');
  await page.locator(`[data-testid="draft"][data-title="${attr(t(world, name))}"]`).getByRole('link', { name: 'Review' }).click();
  await page.waitForURL(/\/admin\/queue\/[^/]+$/);
}

export async function publicTitles(page: Page): Promise<string[]> {
  await page.goto('/en');
  await page.getByTestId('result-count').waitFor();
  return page.getByTestId('card-title').allTextContents();
}

export async function expectPublic(page: Page, title: string, visible: boolean) {
  const titles = await publicTitles(page);
  if (visible) expect(titles).toContain(title); else expect(titles).not.toContain(title);
}
