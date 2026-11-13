import { expect, type Page } from '@playwright/test';
import { Given, When, Then, FIXED_NOW } from './fixtures';
import { daysBetween } from '../../lib/time';

const card = (p: Page, name: string) => p.locator(`[data-testid="casal-card"][data-name="${name}"]`);
const row = (p: Page, week: string) => p.locator(`[data-testid="week-row"][data-label="${week}"]`);

async function addWeek(p: Page, week: string, casal: string) {
  await p.goto('/en/casals');
  await card(p, casal).getByRole('button', { name: week, exact: true }).click();
}

When('I open the casals page', async ({ page }) => {
  await page.goto('/en/casals');
});

Then('I see the casals {string}, {string} and {string}', async ({ page }, a: string, b: string, c: string) => {
  for (const n of [a, b, c]) await expect(card(page, n)).toBeVisible();
});

Then('each casal shows its weeks, price per week, hours and when registration opens', async ({ page }) => {
  const cards = page.getByTestId('casal-card');
  expect(await cards.count()).toBeGreaterThanOrEqual(3);
  for (let i = 0; i < (await cards.count()); i++) {
    const c = cards.nth(i);
    expect(await c.getByTestId('casal-weeks').getByRole('button').count()).toBeGreaterThan(0);
    await expect(c.getByTestId('casal-price')).toHaveText(/€\d+/);
    await expect(c.getByTestId('casal-hours')).toHaveText(/\d\d:\d\d–\d\d:\d\d/);
    await expect(c.getByTestId('casal-registration')).toContainText('2027');
  }
});

When('I filter casals by child age {int}', async ({ page }, age: number) => {
  await page.goto('/en/casals');
  await page.getByLabel('Child age').selectOption(String(age));
  await page.getByRole('button', { name: 'Show casals' }).click();
  await page.waitForURL(/age=/);
});

When('I filter casals by the week {string}', async ({ page }, week: string) => {
  await page.goto('/en/casals');
  await page.getByLabel('Week').selectOption({ label: week });
  await page.getByRole('button', { name: 'Show casals' }).click();
  await page.waitForURL(/week=/);
});

Then('I see the casals {string} and {string}', async ({ page }, a: string, b: string) => {
  for (const n of [a, b]) await expect(card(page, n)).toBeVisible();
});

Then('I do not see the casal {string}', async ({ page }, n: string) => {
  await expect(card(page, n)).toHaveCount(0);
});

When('I try to add week {string} of {string} without a family profile', async ({ page }, week: string, casal: string) => {
  await addWeek(page, week, casal);
});

Then('I am asked to create my family profile first', async ({ page }) => {
  await page.waitForURL(/\/me/);
  await expect(page.getByTestId('need-profile')).toBeVisible();
  await expect(page.getByTestId('profile-create-form')).toBeVisible();
});

When('I add week {string} of {string} to my casal plan', async ({ page }, week: string, casal: string) => {
  await addWeek(page, week, casal);
  await page.waitForURL(/\/casals\/plan/);
});

Given('I added week {string} of {string} to my casal plan', async ({ page }, week: string, casal: string) => {
  await addWeek(page, week, casal);
  await page.waitForURL(/\/casals\/plan/);
});

When('I open my casal plan', async ({ page }) => {
  await page.goto('/en/casals/plan');
});

Then('my casal plan shows {string} with {string} as {string}', async ({ page }, week: string, casal: string, status: string) => {
  await page.goto('/en/casals/plan');
  const choice = row(page, week).getByTestId('my-choice').filter({ hasText: casal });
  await expect(choice).toHaveCount(1);
  await expect(choice.getByTestId('choice-status')).toHaveText(status);
});

Then('it tells me registration opens on {string}, in the number of days from today', async ({ page }, date: string) => {
  const note = page.getByTestId('registration-note').first();
  const days = daysBetween(FIXED_NOW.slice(0, 10), '2027-03-15');
  await expect(note).toContainText(date);
  await expect(note).toContainText(`${days} days`);
});

Then('the week {string} says {string}', async ({ page }, week: string, text: string) => {
  await expect(row(page, week)).toContainText(text);
});

Then('the week {string} does not say {string}', async ({ page }, week: string, text: string) => {
  await expect(row(page, week)).toBeVisible();
  await expect(row(page, week)).not.toContainText(text);
});

When('I mark {string} in week {string} as registered', async ({ page }, casal: string, week: string) => {
  await page.goto('/en/casals/plan');
  await row(page, week).getByTestId('my-choice').filter({ hasText: casal }).getByRole('button', { name: 'Mark as registered' }).click();
});

Given('Marc added week {string} of {string} and shows his casal plan to his friends', async ({ world }, week: string, casal: string) => {
  const marc = world.visitors['Marc'];
  await addWeek(marc, week, casal);
  await marc.waitForURL(/\/casals\/plan/);
  await marc.getByRole('button', { name: 'Show my casal plan to my friends' }).click();
  await expect(marc.getByRole('button', { name: 'Stop sharing my casal plan' })).toBeVisible();
});

Given('Marc added week {string} of {string} without sharing', async ({ world }, week: string, casal: string) => {
  const marc = world.visitors['Marc'];
  await addWeek(marc, week, casal);
  await marc.waitForURL(/\/casals\/plan/);
  await expect(marc.getByRole('button', { name: 'Show my casal plan to my friends' })).toBeVisible();
});

Then('I see {string} with {string} in week {string}', async ({ page }, name: string, casal: string, week: string) => {
  const f = row(page, week).locator(`[data-testid="friend-choice"][data-name="${name}"]`);
  await expect(f).toBeVisible();
  await expect(f).toContainText(casal);
});

Then('I do not see {string} in week {string}', async ({ page }, name: string, week: string) => {
  await expect(row(page, week)).toBeVisible();
  await expect(row(page, week).locator(`[data-testid="friend-choice"][data-name="${name}"]`)).toHaveCount(0);
});
