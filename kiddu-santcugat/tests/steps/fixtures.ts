import { test as base, createBdd } from 'playwright-bdd';
import fs from 'node:fs';
import YAML from 'yaml';
import type { Catalogue } from '../../lib/types';

export const FIXED_NOW = '2026-11-11T10:00'; // Wednesday
export const catalogue: Catalogue = JSON.parse(fs.readFileSync('tests/fixtures/catalogue.json', 'utf8'));
export const site = YAML.parse(fs.readFileSync('config/site.yaml', 'utf8'));
export const areas = YAML.parse(fs.readFileSync('config/areas.yaml', 'utf8')).areas;
export const area = areas[site.area.default];

export interface World {
  now: string;
  selectedId?: string;
  itemId?: string;
  staleId?: string;
  hiddenId?: string;
  url?: string;
  cardIds?: string[];
  lang?: string;
  when?: string;
  requests: string[];
}

export const test = base.extend<{ world: World }>({
  world: async ({}, use) => {
    await use({ now: FIXED_NOW, requests: [] });
  },
  context: async ({ context }, use) => {
    await context.addCookies([
      { name: 'kiddu_now', value: FIXED_NOW, domain: 'localhost', path: '/' },
      { name: 'kiddu_weather', value: 'dry', domain: 'localhost', path: '/' },
    ]);
    // Geolocation stub: records the request and refuses it (the refusal scenario).
    await context.addInitScript(() => {
      (window as any).__geoCalls = 0;
      const geo = {
        getCurrentPosition: (_ok: unknown, err: (e: unknown) => void) => {
          (window as any).__geoCalls++;
          setTimeout(() => err({ code: 1, message: 'denied' }), 10);
        },
        watchPosition: () => 0,
        clearWatch: () => {},
      };
      Object.defineProperty(navigator, 'geolocation', { value: geo, configurable: true });
    });
    await use(context);
  },
  page: async ({ page, world }, use) => {
    page.on('request', (r) => world.requests.push(r.url()));
    await use(page);
  },
});

export const { Given, When, Then } = createBdd(test);

export async function setNow(context: import('@playwright/test').BrowserContext, now: string) {
  await context.addCookies([{ name: 'kiddu_now', value: now, domain: 'localhost', path: '/' }]);
}

export async function cardIds(page: import('@playwright/test').Page): Promise<string[]> {
  await page.getByTestId('result-count').waitFor();
  return page.getByTestId('item-card').evaluateAll((els) => els.map((e) => e.getAttribute('data-id')!));
}

export async function pinIds(page: import('@playwright/test').Page, expected: number): Promise<string[]> {
  if (expected > 0) await page.locator('[data-testid="pin"]').first().waitFor();
  return page.locator('[data-testid="pin"]').evaluateAll((els) => els.map((e) => e.getAttribute('data-id')!));
}

export function km(text: string): number {
  const m = text.match(/([\d.]+)\s*(km|m)\b/);
  if (!m) throw new Error(`no distance in "${text}"`);
  return m[2] === 'km' ? Number(m[1]) : Number(m[1]) / 1000;
}
