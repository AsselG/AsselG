import { expect } from '@playwright/test';
import { Given, When, Then, site, setNow } from './fixtures';
import { addDays } from '../../lib/time';
import { ensurePlan, newVisitor, submitPlan } from './social-helpers';

Given('I am on the page of {string} playground', async ({ page }, _name: string) => {
  await page.goto('/en/item/p-park'); // "Parc Central" in the spec = the fixture's central park
});

When('I choose Saturday 11:00 and write {string}', async ({ page, world }, note: string) => {
  await submitPlan(page, world, { day: 'Saturday', time: '11:00', note, name: 'Ana' });
});

Then('a plan page is created with a private link', async ({ page, world }) => {
  expect(world.planUrl).toMatch(/^\/en\/p\/[A-Za-z0-9_-]{16,}$/);
  await expect(page.getByTestId('plan-title')).toHaveText('Central test park');
  await expect(page.getByTestId('plan-note')).toHaveText('Bringing a football');
  await expect(page.getByTestId('going-count')).toHaveText('1 family going');
});

Then('I can share the link to WhatsApp with one tap', async ({ page, world }) => {
  const share = page.getByRole('link', { name: 'Share on WhatsApp' });
  const href = (await share.getAttribute('href'))!;
  expect(href).toMatch(/^https:\/\/wa\.me\/\?text=/);
  expect(decodeURIComponent(href)).toContain(world.planUrl!);
  expect(decodeURIComponent(href)).not.toContain('?o=');
});

Given('a friend opens my plan link', async ({ page, browser, world }) => {
  await ensurePlan(page, world);
  const friend = await newVisitor(browser, world.now);
  world.extra.friend = friend;
  await friend.goto(world.planUrl!);
});

When('they enter a first name and choose {string}', async ({ world }, choice: string) => {
  const friend = world.extra.friend;
  await friend.getByLabel('Your first name').fill('Marc');
  await friend.getByRole('button', { name: choice }).click();
  await friend.getByTestId('going-count').waitFor();
});

Then('the plan shows {string}', async ({ world }, text: string) => {
  await expect(world.extra.friend.getByTestId('going-count')).toHaveText(text);
});

Then('no email, phone or child data is asked', async ({ world }) => {
  const friend = world.extra.friend;
  await expect(friend.locator('input[type="email"], input[type="tel"], input[type="file"]')).toHaveCount(0);
  const fields = await friend.locator('input:not([type="hidden"]), textarea, select').evaluateAll((els) =>
    els.map((e) => [e.getAttribute('name'), e.getAttribute('aria-label'), e.id].join(' ')));
  for (const f of fields) expect(f).not.toMatch(/mail|phone|tel|child|kid|photo|school/i);
});

Then('a plan page is not indexed by search engines', async ({ page, world }) => {
  await ensurePlan(page, world);
  const res = await page.request.get(world.planUrl!);
  expect(res.headers()['x-robots-tag'] ?? '').toMatch(/noindex/);
  await page.goto(world.planUrl!);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});

Then('it cannot be found from the public site', async ({ page, world }) => {
  const id = world.planUrl!.split('/').pop()!;
  for (const path of ['/en', '/ca', '/es', '/en/item/p-park']) {
    const html = await (await page.request.get(path)).text();
    expect(html, path).not.toContain(id);
  }
  expect([404, 405]).toContain((await page.request.get('/api/plans')).status());
  expect((await page.request.get('/en/p')).status()).toBe(404);
});

Then('it is deleted automatically the number of days after the plan date set in site config', async ({ page, context, world }) => {
  await ensurePlan(page, world);
  const days = site.plans.delete_days_after_plan as number;
  await setNow(context, `${addDays(world.planDay!, days)}T10:00`);
  expect((await page.goto(world.planUrl!))?.status(), 'still there on the last day').toBe(200);
  await setNow(context, `${addDays(world.planDay!, days + 1)}T10:00`);
  expect((await page.goto(world.planUrl!))?.status(), 'gone the day after').toBe(404);
});

Given('I created a plan', async ({ page, world }) => {
  await ensurePlan(page, world);
});

When('I open my plan with the organiser link and tap {string}', async ({ page, world }, label: string) => {
  await page.goto(world.organiserUrl!);
  await page.getByRole('button', { name: label }).click();
});

Then('everyone who opens the link sees {string}', async ({ browser, world }, text: string) => {
  const other = await newVisitor(browser, world.now);
  await other.goto(world.planUrl!);
  await expect(other.getByTestId('plan-cancelled')).toHaveText(text);
  await expect(other.getByRole('button', { name: "I'm in" })).toHaveCount(0);
});
