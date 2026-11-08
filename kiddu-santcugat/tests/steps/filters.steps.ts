import { expect } from '@playwright/test';
import { Given, When, Then, setNow, cardIds, test } from './fixtures';
import { LANG_NAMES } from '../../lib/i18n';

const DAY_NOW: Record<string, string> = { Wednesday: '2026-11-11T10:00', Saturday: '2026-11-14T10:00' };

/** Expected results for the time-filter examples, from the fixture catalogue (features/02). */
const EXPECTED: Record<string, string[]> = {
  'Wednesday|Today': ['e-workshop-today', 'p-park', 'p-trampoline', 'p-library', 'p-climbing', 'p-indoor-play'],
  'Wednesday|This weekend': ['e-concert-sat', 'e-nature-walk-sat', 'e-football-sun', 'p-park', 'p-trampoline', 'p-library', 'p-climbing', 'p-indoor-play'],
  'Saturday|Tomorrow': ['e-football-sun', 'p-park', 'p-trampoline', 'p-climbing', 'p-indoor-play'],
};

async function ensureHome(page: import('@playwright/test').Page) {
  if (!/\/(ca|es|en)/.test(page.url())) {
    await page.goto('/');
    await page.getByTestId('result-count').waitFor();
  }
}

When('I select the theme {string}', async ({ page }, theme: string) => {
  await ensureHome(page);
  await page.getByTestId('theme-filters').getByRole('link', { name: theme, exact: true }).click();
  await page.waitForURL(/theme=/);
});

Then('I only see items tagged {string}', async ({ page }, theme: string) => {
  const themes = await page.getByTestId('item-card').evaluateAll((els) => els.map((e) => e.getAttribute('data-themes')!));
  expect(themes.length, `no ${theme} items in fixture`).toBeGreaterThan(0);
  for (const t of themes) expect(t.split(' ')).toContain(theme.toLowerCase());
});

When('I set the child age to {int}', async ({ page }, age: number) => {
  await ensureHome(page);
  await page.getByTestId('age-select').selectOption(String(age));
  await page.waitForURL(new RegExp(`age=${age}`));
  await page.getByTestId('result-count').waitFor();
});

Then('I only see items whose age range includes {int}', async ({ page }, age: number) => {
  const rows = await page.getByTestId('item-card').evaluateAll((els) =>
    els.map((e) => ({ spec: e.getAttribute('data-age-specified') === 'true', min: e.getAttribute('data-age-min'), max: e.getAttribute('data-age-max') })));
  expect(rows.filter((r) => r.spec).length).toBeGreaterThan(0);
  for (const r of rows.filter((x) => x.spec)) {
    expect(r.min === '' ? 0 : Number(r.min)).toBeLessThanOrEqual(age);
    expect(r.max === '' ? 99 : Number(r.max)).toBeGreaterThanOrEqual(age);
  }
});

Then('items with no age information are shown last with the label {string}', async ({ page }, label: string) => {
  const flags = await page.getByTestId('item-card').evaluateAll((els) => els.map((e) => e.getAttribute('data-age-specified') === 'true'));
  const firstUnspecified = flags.indexOf(false);
  expect(firstUnspecified, 'fixture needs an item without age').toBeGreaterThan(-1);
  expect(flags.slice(firstUnspecified).every((f) => !f)).toBe(true);
  const unspecified = page.locator('[data-testid="item-card"][data-age-specified="false"]');
  for (let i = 0; i < (await unspecified.count()); i++) {
    await expect(unspecified.nth(i).getByTestId('card-age')).toHaveText(label);
  }
});

Given('today is {string}', async ({ context, world }, day: string) => {
  world.now = DAY_NOW[day];
  expect(world.now, `no fixed date for ${day}`).toBeTruthy();
  await setNow(context, world.now);
});

/** Shared by 02 ("Today", "This weekend"…) and 08 ("Català", "Español", "English"). */
When('I choose {string}', async ({ page, world }, choice: string) => {
  await ensureHome(page);
  if ((Object.values(LANG_NAMES) as string[]).includes(choice)) {
    world.lang = choice;
    await page.getByRole('navigation', { name: 'Language' }).getByRole('link', { name: choice, exact: true }).click();
    await page.waitForLoadState('domcontentloaded');
    return;
  }
  world.when = choice;
  await page.getByTestId('when-filters').getByRole('link', { name: choice, exact: true }).click();
  await page.waitForURL(/when=/);
  await page.getByTestId('result-count').waitFor();
});

Then('I only see events happening in that period and places open in that period', async ({ page, world }) => {
  const day = Object.entries(DAY_NOW).find(([, v]) => v === world.now)![0];
  const expected = EXPECTED[`${day}|${world.when}`];
  expect(expected, 'missing expectation for this example').toBeTruthy();
  expect((await cardIds(page)).sort()).toEqual([...expected].sort());
});

When('I switch on {string}', async ({ page }, label: string) => {
  await ensureHome(page);
  await page.getByRole('link', { name: label, exact: true }).click();
  await page.waitForURL(/free=1/);
});

Then('I only see items with price 0 or labelled free', async ({ page }) => {
  const prices = await page.getByTestId('card-price').allTextContents();
  expect(prices.length).toBeGreaterThan(0);
  for (const p of prices) expect(p).toBe('Free');
});

Given('the weather forecast for the active area says rain today', async ({ context }) => {
  await context.addCookies([{ name: 'kiddu_weather', value: 'rain', domain: 'localhost', path: '/' }]);
});

Then('I see a {string} suggestion chip', async ({ page }, label: string) => {
  await expect(page.getByTestId('rainy-chip')).toContainText(label);
});

When('I tap it', async ({ page }) => {
  await page.getByTestId('rainy-chip').click();
  await page.waitForURL(/indoor=1/);
});

Then('I only see indoor items', async ({ page }) => {
  const flags = await page.getByTestId('item-card').evaluateAll((els) => els.map((e) => e.getAttribute('data-indoor')));
  expect(flags.length).toBeGreaterThan(0);
  for (const f of flags) expect(f).toBe('true');
});

Given('I selected {string}, age {int} and {string}', async ({ page, world }, theme: string, age: number, when: string) => {
  await page.goto('/');
  await page.getByTestId('theme-filters').getByRole('link', { name: theme, exact: true }).click();
  await page.waitForURL(/theme=/);
  await page.getByTestId('age-select').selectOption(String(age));
  await page.waitForURL(/age=/);
  await page.getByTestId('when-filters').getByRole('link', { name: when, exact: true }).click();
  await page.waitForURL(/when=/);
  world.cardIds = await cardIds(page);
  world.selectedId = `${theme}|${age}|${when}`;
});

When('I copy the page link and open it on another phone', async ({ page, browser, world }) => {
  world.url = page.url();
});

Then('the same filters are applied', async ({ browser, world }) => {
  const [theme, age, when] = world.selectedId!.split('|');
  const other = await browser.newContext({ ...test.info().project.use, locale: 'en-GB' } as any);
  await other.addCookies([{ name: 'kiddu_now', value: world.now, domain: 'localhost', path: '/' }]);
  const p2 = await other.newPage();
  await p2.goto(world.url!);
  await expect(p2.getByTestId('theme-filters').getByRole('link', { name: theme, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(p2.getByTestId('when-filters').getByRole('link', { name: when, exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(p2.getByTestId('age-select')).toHaveValue(age);
  expect((await cardIds(p2)).sort()).toEqual([...world.cardIds!].sort());
  await other.close();
});
