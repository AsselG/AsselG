import { expect } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import { createPrivatePlan, newVisitor } from './social-helpers';

const pin = (page: import('@playwright/test').Page, title: string) => page.locator(`[data-testid="plan-pin"][data-title="${title}"]`);

async function openHome(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByTestId('result-count').waitFor();
  await page.locator('[data-testid="pin"]').first().waitFor();
}

Given('Marc invited his friends to a playdate at {string} on Saturday 11:00', async ({ world }, place: string) => {
  await createPrivatePlan(world.visitors['Marc'], world, { place });
});

Given('Marc invited only {string} to a playdate at {string} on Saturday 11:00', async ({ world }, only: string, place: string) => {
  await createPrivatePlan(world.visitors['Marc'], world, { place, only: [only] });
});

Given('Marc invited his friends to a playdate at his place {string} with address {string} on Saturday 11:00', async ({ world }, name: string, address: string) => {
  await createPrivatePlan(world.visitors['Marc'], world, { other: { name, address } });
  world.groupName = address; // remembered for the address checks
});

Given('I created a playdate at {string} for my friends on Saturday 11:00', async ({ page, world }, place: string) => {
  await createPrivatePlan(page, world, { place });
});

When('Lia opens the playdate link', async ({ world }) => {
  await world.visitors['Lia'].goto(world.planUrl!);
});

When('someone who is not connected to Marc opens the playdate link', async ({ browser, world }) => {
  const outsider = await newVisitor(browser, world.now);
  world.extra.outsider = outsider;
  await outsider.goto(world.planUrl!);
});

Then('Lia is told this event is private and sees none of its details', async ({ world }) => {
  const lia = world.visitors['Lia'];
  await expect(lia.getByTestId('private-event')).toBeVisible();
  const text = await lia.locator('body').innerText();
  expect(text).not.toContain(world.planTitle!);
  expect(text).not.toContain('Saturday');
  await expect(lia.getByTestId('rsvp-list')).toHaveCount(0);
});

Then('they are told this event is private and see none of its details', async ({ world }) => {
  const o = world.extra.outsider;
  await expect(o.getByTestId('private-event')).toBeVisible();
  const text = await o.locator('body').innerText();
  expect(text).not.toContain(world.planTitle!);
  await expect(o.getByRole('button', { name: "I'm in" })).toHaveCount(0);
});

Then("Lia's map shows no invitation pin", async ({ world }) => {
  const lia = world.visitors['Lia'];
  await openHome(lia);
  await expect(lia.locator('[data-testid="plan-pin"]')).toHaveCount(0);
  await expect(lia.getByTestId('my-plans')).toHaveCount(0);
});

Then('I see an invitation pin at {string} on the map', async ({ page }, title: string) => {
  await expect(pin(page, title).first()).toBeVisible();
});

Then('{string} lists {string} with {string}', async ({ page }, heading: string, title: string, role: string) => {
  const section = page.getByTestId('my-plans');
  await expect(section).toContainText(heading);
  const card = section.getByTestId('my-plan').filter({ hasText: title });
  await expect(card).toHaveCount(1);
  await expect(card).toContainText(role);
});

Then('the map has no invitation pin for {string}', async ({ page }, title: string) => {
  await expect(page.locator('[data-testid="plan-pin"]').first()).toHaveCount(0).catch(() => {});
  await expect(pin(page, title)).toHaveCount(0);
});

Then('I can read the address {string} on the playdate page', async ({ page, world }, address: string) => {
  await page.goto(world.planUrl!);
  await expect(page.getByTestId('plan-address')).toHaveText(address);
});

Then('someone who is not connected to Marc cannot read the address', async ({ browser, world }) => {
  const o = await newVisitor(browser, world.now);
  await o.goto(world.planUrl!);
  expect(await o.locator('body').innerText()).not.toContain(world.groupName!);
});

When('I open the invitation from my list and choose {string}', async ({ page }, choice: string) => {
  await openHome(page);
  await page.getByTestId('my-plan').first().getByRole('link').first().click();
  await page.waitForURL(/\/p\//);
  await page.getByRole('button', { name: choice }).click();
  await page.getByTestId('going-count').waitFor();
});

Then('Marc sees {string} in the list of who is going', async ({ world }, name: string) => {
  const marc = world.visitors['Marc'];
  await marc.goto(world.planUrl!);
  await expect(marc.getByTestId('rsvp-list')).toContainText(name);
});

Given('Marc proposed a playdate in the class at {string} on Saturday 11:00', async ({ world }, place: string) => {
  const marc = world.visitors['Marc'];
  await marc.goto(world.inviteUrl!);
  await marc.getByRole('button', { name: 'Join the class as Marc' }).click();
  await marc.waitForURL(/\/class\//);
  await createPrivatePlan(marc, world, { place, group: world.groupId });
});
