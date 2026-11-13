import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { connect, createProfile, friendNames, newVisitor, pathOf } from './social-helpers';

const group = (w: { groupId?: string }) => `/en/class/${w.groupId}`;

Given('I have a family profile as {string} with a child aged {int}', async ({ page }, name: string, age: number) => {
  await createProfile(page, { name, age });
});

Given('another parent has a family profile as {string} with a child aged {int}', async ({ browser, world }, name: string, age: number) => {
  const p = await newVisitor(browser, world.now);
  await createProfile(p, { name, age });
  world.visitors[name] = p;
});

Given('I am connected with {string}', async ({ page, world }, name: string) => {
  await connect(world.visitors[name], page);
});

Given('{string} is connected with {string}', async ({ world }, a: string, b: string) => {
  await connect(world.visitors[b], world.visitors[a]);
});

When('I create my family profile as {string} with a child aged {int} interested in {string} and {string} and speaking {string} and {string}',
  async ({ page }, name: string, age: number, i1: string, i2: string, l1: string, l2: string) => {
    await createProfile(page, { name, age, interests: [i1, i2], languages: [l1, l2] });
  });

Then('my profile shows {string}, {string}, {string} and {string}', async ({ page }, name: string, kids: string, interests: string, langs: string) => {
  await expect(page.getByTestId('profile-name')).toHaveText(name);
  await expect(page.getByTestId('profile-kids')).toHaveText(kids);
  await expect(page.getByTestId('profile-interests')).toHaveText(interests);
  await expect(page.getByTestId('profile-languages')).toHaveText(langs);
});

Then('the profile form has no field for a last name, photo, phone, email or address', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto('/en/me');
  await expect(page.locator('input[type="email"], input[type="tel"], input[type="file"]')).toHaveCount(0);
  const fields = await page.locator('form input:not([type="hidden"]), form textarea, form select').evaluateAll((els) =>
    els.map((e) => [e.getAttribute('name'), e.getAttribute('aria-label'), e.id].join(' ')));
  expect(fields.length).toBeGreaterThan(0);
  for (const f of fields) expect(f).not.toMatch(/last|surname|family ?name|phone|tel|mail|photo|address/i);
});

When('I open the class invite link', async ({ page, world }) => {
  await page.goto(world.inviteUrl!);
});

Then('I can join the class with one tap as {string}', async ({ page }, name: string) => {
  await expect(page.getByLabel('Your first name')).toHaveCount(0);
  await page.getByRole('button', { name: `Join the class as ${name}` }).click();
  await page.waitForURL(/\/class\//);
});

Then('the class page shows {string} with {string}', async ({ page }, name: string, kids: string) => {
  const row = page.locator(`[data-testid="family"][data-name="${name}"]`);
  await expect(row).toBeVisible();
  await expect(row.getByTestId('family-kids')).toHaveText(kids);
});

When('Marc shares his personal link and I open it and connect', async ({ page, world }) => {
  await connect(world.visitors['Marc'], page);
});

Then('{string} is in my list of connected families', async ({ page }, name: string) => {
  expect(await friendNames(page)).toContain(name);
});
Then('{string} is not in my list of connected families', async ({ page }, name: string) => {
  expect(await friendNames(page)).not.toContain(name);
});
Then('{string} is in the list of connected families of Marc', async ({ world }, name: string) => {
  expect(await friendNames(world.visitors['Marc'])).toContain(name);
});
Then('{string} is not in the list of connected families of Marc', async ({ world }, name: string) => {
  expect(await friendNames(world.visitors['Marc'])).not.toContain(name);
});

When('I ask to connect with {string} from the class page', async ({ page, world }, name: string) => {
  await page.goto(group(world));
  await page.locator(`[data-testid="family"][data-name="${name}"]`).getByRole('button', { name: 'Connect' }).click();
  await expect(page.locator(`[data-testid="family"][data-name="${name}"]`).getByTestId('request-sent')).toBeVisible();
});

Then('Marc sees a connection request from {string}', async ({ world }, name: string) => {
  const marc = world.visitors['Marc'];
  await marc.goto('/en/me');
  await expect(marc.locator(`[data-testid="request"][data-name="${name}"]`)).toBeVisible();
});

When('Marc accepts the request from {string}', async ({ world }, name: string) => {
  const marc = world.visitors['Marc'];
  await marc.goto('/en/me');
  await marc.locator(`[data-testid="request"][data-name="${name}"]`).getByRole('button', { name: 'Accept' }).click();
});

When('Marc declines the request from {string}', async ({ world }, name: string) => {
  const marc = world.visitors['Marc'];
  await marc.goto('/en/me');
  await marc.locator(`[data-testid="request"][data-name="${name}"]`).getByRole('button', { name: 'Decline' }).click();
});

When('I open my family page', async ({ page }) => {
  await page.goto('/en/me');
  await page.getByTestId('profile-name').waitFor();
});

When('I remove the connection with {string}', async ({ page }, name: string) => {
  await page.goto('/en/me');
  await page.locator(`[data-testid="friend"][data-name="${name}"]`).getByRole('button', { name: 'Remove' }).click();
});

When('I open my recovery link on another phone', async ({ page, browser, world }) => {
  await page.goto('/en/me');
  const link = pathOf(await page.getByTestId('recovery-url').inputValue());
  const other = await newVisitor(browser, world.now);
  world.extra.other = other;
  await other.goto(link);
});

Then('the other phone shows my family profile {string}', async ({ world }, name: string) => {
  const other = world.extra.other;
  await other.goto('/en/me');
  await expect(other.getByTestId('profile-name')).toHaveText(name);
});

When('I delete my family', async ({ page }) => {
  await page.goto('/en/me');
  await page.getByLabel('I want to delete my family and everything linked to it').check();
  await page.getByRole('button', { name: 'Delete my family' }).click();
});

Then('I no longer have a family profile', async ({ page }) => {
  await page.goto('/en/me');
  await expect(page.getByTestId('profile-create-form')).toBeVisible();
  await expect(page.getByTestId('profile-name')).toHaveCount(0);
});
