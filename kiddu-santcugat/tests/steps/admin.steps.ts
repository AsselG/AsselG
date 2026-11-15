import { expect } from '@playwright/test';
import { Given, When, Then, site } from './fixtures';
import { adminLogin, bumpPages, expectPublic, openDraft, queuedFromSantCugat, t } from './pipeline-helpers';
import { newVisitor } from './social-helpers';

When('someone who is not an editor opens the admin console', async ({ browser, world }) => {
  const v = await newVisitor(browser, world.now);
  world.extra.outsider = v;
  const res = await v.goto('/en/admin');
  (world as unknown as { status: number }).status = res?.status() ?? 0;
});

Then('they see a page that does not exist', async ({ world }) => {
  expect((world as unknown as { status: number }).status).toBe(404);
  expect((await world.extra.outsider.request.get('/en/admin/queue')).status()).toBe(404);
});

When('I log in to the admin console with a wrong key', async ({ page }) => {
  await adminLogin(page, 'not-the-key');
});
Then('I am told the key is wrong', async ({ page }) => {
  await expect(page.getByTestId('login-error')).toBeVisible();
});
When('I log in to the admin console with the admin key', async ({ page }) => {
  await adminLogin(page);
});
Then('I see the admin dashboard', async ({ page }) => {
  await expect(page.getByTestId('admin-dashboard')).toBeVisible();
});

When('I open the admin dashboard', async ({ page }) => {
  await page.goto('/en/admin');
});

Then('I see the last run with its counts and its AI cost', async ({ page }) => {
  const last = page.getByTestId('last-run');
  for (const k of ['fetched', 'changed', 'extracted', 'published', 'queued', 'rejected']) await expect(last.getByTestId(`run-${k}`)).toHaveText(/^\d+$/);
  await expect(last.getByTestId('run-cost')).toHaveText(/€\d+\.\d{2}/);
});

Then('I see how many drafts wait for review', async ({ page }) => {
  await expect(page.getByTestId('queue-count')).toHaveText(/^[1-9]\d*$/);
});

Then('I see the AI spend this month against the budget in site config', async ({ page }) => {
  await expect(page.getByTestId('month-spend')).toContainText(`€${Number(site.ai.monthly_budget_eur).toFixed(2)}`);
});

Then('I see each source with its status, including sources blocked by robots.txt', async ({ page, world }) => {
  for (const [prefix, status] of [['agenda-html', 'OK'], ['teatre-html', 'OK'], ['private-secret-html', 'Blocked by robots.txt']]) {
    await expect(page.locator(`[data-testid="source-row"][data-id="${prefix}-${world.ns}"]`).getByTestId('source-status')).toHaveText(status);
  }
});

When('I open the draft {string}', async ({ page, world }, name: string) => {
  await openDraft(page, world, name);
});

Then('it is flagged {string}', async ({ page }, issue: string) => {
  await expect(page.getByTestId('issue').filter({ hasText: issue })).toHaveCount(1);
});

Then('its confidence is below the auto-publish threshold', async ({ page }) => {
  const v = Number(await page.getByTestId('confidence').getAttribute('data-value'));
  expect(v).toBeLessThan(site.publishing.auto_publish_min_confidence);
});

When('I try to publish the draft {string} without a location', async ({ page, world }, name: string) => {
  await openDraft(page, world, name);
  await page.getByRole('button', { name: 'Publish' }).click();
});

Then('I am told it needs a location for the map', async ({ page }) => {
  await expect(page.getByTestId('admin-error')).toContainText('needs a location');
});

When('I choose the known place {string} and publish', async ({ page }, place: string) => {
  await page.getByLabel('Known place').selectOption({ label: place });
  await page.getByRole('button', { name: 'Publish' }).click();
});

Then('families see {string} on the public site with its source link and the AI label', async ({ page, world }, name: string) => {
  await expectPublic(page, t(world, name), true);
  await page.getByTestId('card-title').filter({ hasText: t(world, name) }).click();
  await expect(page.getByTestId('source')).toHaveAttribute('href', new RegExp(`localhost:3101/agenda.html\\?ns=${world.ns}`));
  await expect(page.getByTestId('ai-label')).toBeVisible();
});

When('I reject the draft {string} with the reason {string}', async ({ page, world }, name: string, reason: string) => {
  await openDraft(page, world, name);
  await page.getByLabel('Reason for rejecting').fill(reason);
  await page.getByRole('button', { name: 'Reject' }).click();
});

When('the pipeline runs again after the page changed', async ({ world }) => {
  await bumpPages(world.ns);
  const run = await queuedFromSantCugat(world);
  expect(run.totals.changed).toBeGreaterThanOrEqual(1);
  expect(run.totals.skipped).toBeGreaterThanOrEqual(1);
});

Then('{string} is not in the review queue', async ({ page, world }, name: string) => {
  await page.goto('/en/admin/queue');
  await expect(page.locator(`[data-testid="draft"][data-title="${t(world, name)}"]`)).toHaveCount(0);
});

Then('families do not see {string}', async ({ page, world }, name: string) => {
  await expectPublic(page, t(world, name), false);
});

Given('I published the draft {string}', async ({ page, world }, name: string) => {
  await openDraft(page, world, name);
  await page.getByRole('button', { name: 'Publish' }).click();
  await expectPublic(page, t(world, name), true);
});

When('I unpublish {string}', async ({ page, world }, name: string) => {
  await page.goto('/en/admin/items');
  await page.locator(`[data-testid="admin-item"][data-title="${t(world, name)}"]`).getByRole('button', { name: 'Unpublish' }).click();
});
