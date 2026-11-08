import { expect } from '@playwright/test';
import { Given, When, Then, catalogue } from './fixtures';
import { DICTS, LANG_NAMES } from '../../lib/i18n';
import type { Lang } from '../../lib/types';

const codeOf = (name: string) => (Object.entries(LANG_NAMES).find(([, n]) => n === name)![0]) as Lang;

Then('all interface text is in {string}', async ({ page }, name: string) => {
  const lang = codeOf(name);
  await expect(page.locator('html')).toHaveAttribute('lang', lang);
  const d = DICTS[lang];
  await expect(page.getByRole('button', { name: d.nearMe })).toBeVisible();
  await expect(page.getByTestId('when-filters')).toContainText(d.when_weekend);
  await expect(page.locator('footer')).toHaveText(d.privacy);
  for (const other of Object.keys(DICTS).filter((l) => l !== lang) as Lang[]) {
    if (DICTS[other].nearMe !== d.nearMe) await expect(page.getByText(DICTS[other].nearMe, { exact: true })).toHaveCount(0);
  }
});

Then('item descriptions are shown in {string} when a translation exists, otherwise in the original language', async ({ page }, name: string) => {
  const lang = codeOf(name);
  const translated = catalogue.items.find((i) => i.description?.ca && i.description?.es && i.description?.en)!;
  await page.goto(`/${lang}/item/${translated.id}`);
  await expect(page.getByTestId('description')).toHaveText(translated.description![lang]!);
  const single = catalogue.items.find((i) => i.description && Object.keys(i.description).length === 1 && i.originalLanguage)!;
  await page.goto(`/${lang}/item/${single.id}`);
  await expect(page.getByTestId('description')).toHaveText(single.description![single.originalLanguage!]!);
});

Given('my browser language is English', async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
});

When('I open the site for the first time', async ({ page }) => {
  await page.goto('/');
});

Then('the site is in English', async ({ page }) => {
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

When('I open any page', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-testid="pin"]').first().waitFor();
  await page.goto('/en/item/p-park');
});

const TRACKERS = /google-analytics|googletagmanager|doubleclick|facebook|hotjar|clarity\.ms|segment|mixpanel|amplitude/i;

Then('no third-party tracking cookie is set', async ({ context }) => {
  const cookies = await context.cookies();
  for (const c of cookies) expect(c.domain).toMatch(/localhost/);
  expect(cookies.map((c) => c.name).filter((n) => !n.startsWith('kiddu_'))).toEqual([]);
});

Then('only privacy-friendly, cookieless page counts are recorded', async ({ world }) => {
  for (const u of world.requests) expect(u).not.toMatch(TRACKERS);
  const hosts = new Set(world.requests.map((u) => new URL(u).hostname));
  for (const h of hosts) expect(['localhost', 'tile.openstreetmap.org']).toContain(h);
});

Then("no form on the site asks for a child's name, photo or school", async ({ page }) => {
  const pages = ['/en', ...catalogue.items.filter((i) => i.status === 'published').slice(0, 5).map((i) => `/en/item/${i.id}`)];
  for (const p of pages) {
    await page.goto(p);
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
    const fields = await page.locator('input, textarea, select').evaluateAll((els) =>
      els.map((e) => [e.getAttribute('name'), e.getAttribute('aria-label'), e.getAttribute('placeholder'), e.id].join(' ')));
    for (const f of fields) expect(f).not.toMatch(/name|nom|nombre|photo|foto|school|escola|colegio/i);
  }
});
