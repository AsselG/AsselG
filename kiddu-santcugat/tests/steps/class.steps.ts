import { expect, type Page } from '@playwright/test';
import { Given, When, Then } from './fixtures';
import type { World } from './fixtures';
import { createGroup, joinGroup, newVisitor, submitPlan } from './social-helpers';

const groupPage = (w: World) => `/en/class/${w.groupId}`;

async function otherParentJoins(browser: import('@playwright/test').Browser, w: World, name: string, age?: number) {
  const p = await newVisitor(browser, w.now);
  await joinGroup(p, w, name, age);
  w.visitors[name] = p;
  return p;
}

async function proposeInGroup(p: Page, w: World, note: string) {
  await p.goto(groupPage(w));
  await p.getByRole('link', { name: 'Propose a playdate' }).click();
  await submitPlan(p, w, { place: 'Central test park', day: 'Saturday', time: '11:00', note });
}

// ---------- shared setup ----------
Given('the AFA created the group {string} with an invite link', async ({ page, world }, name: string) => {
  await createGroup(page, world, name);
  expect(world.inviteUrl).toMatch(/^\/en\/g\/[A-Za-z0-9_-]{16,}$/);
});

Given('I joined {string}', async ({ page, world }, _name: string) => {
  await joinGroup(page, world, 'Ana');
});

Given('I joined {string} as {string} with a child aged {int}', async ({ page, world }, _g: string, name: string, age: number) => {
  await joinGroup(page, world, name, age);
});

Given('another parent joined {string} as {string} with a child aged {int}', async ({ browser, world }, _g: string, name: string, age: number) => {
  await otherParentJoins(browser, world, name, age);
});

Given('another parent joined {string} as {string} without sharing ages', async ({ browser, world }, _g: string, name: string) => {
  await otherParentJoins(browser, world, name);
});

When('I open the group page', async ({ page, world }) => {
  await page.goto(groupPage(world));
});

// ---------- 09: join, group page, leave ----------
When('a parent opens the invite link', async ({ page, world }) => {
  await page.goto(world.inviteUrl!);
  await expect(page.getByTestId('join-group-name')).toHaveText(world.groupName!);
});

Then('they can join the group with a first name only', async ({ page, world }) => {
  const fields = await page.locator('form input:not([type="hidden"])').evaluateAll((els) => els.map((e) => e.getAttribute('name')));
  expect(fields.sort()).toEqual(['ages', 'firstName']);
  await expect(page.locator('input[type="email"], input[type="tel"], input[type="file"]')).toHaveCount(0);
  await page.getByLabel('Your first name').fill('Ana');
  await page.getByRole('button', { name: 'Join the class' }).click();
  await page.waitForURL(/\/class\//);
  await expect(page.getByTestId('group-name')).toHaveText(world.groupName!);
  await expect(page.locator('[data-testid="family"][data-name="Ana"]')).toBeVisible();
});

Given('a family in the group proposed a playdate for Saturday', async ({ browser, world }) => {
  const marc = await otherParentJoins(browser, world, 'Marc', 5);
  await proposeInGroup(marc, world, 'Bring scooters');
});

Then('I see upcoming plans shared to the group', async ({ page, world }) => {
  const plans = page.getByTestId('group-plan');
  await expect(plans).toHaveCount(1);
  await expect(plans.first()).toContainText('Central test park');
  await expect(page.getByTestId('upcoming')).toContainText('Upcoming playdates');
});

Then('I see {string} items \\(only counts, no names)', async ({ page }, title: string) => {
  const popular = page.getByTestId('popular');
  await expect(popular).toContainText(title);
  await expect(popular.getByTestId('popular-item')).toHaveCount(1);
  await expect(popular.getByTestId('popular-item').first()).toContainText('Central test park');
  await expect(popular.getByTestId('popular-count').first()).toHaveText('1 family');
  const text = await popular.innerText();
  for (const n of ['Ana', 'Marc']) expect(text).not.toContain(n);
});

Given('I am going to a playdate in the group', async ({ page, browser, world }) => {
  const marc = await otherParentJoins(browser, world, 'Marc', 5);
  await proposeInGroup(marc, world, 'Bring scooters');
  await page.goto(world.planUrl!);
  await page.getByRole('button', { name: "I'm in" }).click();
  await expect(page.getByTestId('going-count')).toHaveText('2 families going');
  await page.goto(groupPage(world));
});

Then('my name is removed from the group and from all its plans', async ({ page, world }) => {
  const marc = world.visitors['Marc'];
  await marc.goto(groupPage(world));
  await expect(marc.locator('[data-testid="family"][data-name="Marc"]')).toBeVisible();
  await expect(marc.locator('[data-testid="family"][data-name="Ana"]')).toHaveCount(0);
  await marc.goto(world.planUrl!);
  await expect(marc.getByTestId('going-count')).toHaveText('1 family going');
  await expect(marc.getByTestId('rsvp-list')).not.toContainText('Ana');
  await page.goto(groupPage(world));
  await expect(page.getByTestId('private-notice')).toBeVisible();
});

// ---------- 12: families ----------
Then('I see {string}, {string} and {string} in the list of families', async ({ page }, a: string, b: string, c: string) => {
  for (const n of [a, b, c]) await expect(page.locator(`[data-testid="family"][data-name="${n}"]`)).toBeVisible();
});

Then('each family shows only a first name and the ages they chose to share', async ({ page }) => {
  await expect(page.locator('[data-testid="family"][data-name="Ana"] [data-testid="family-kids"]')).toHaveText('Child aged 4');
  await expect(page.locator('[data-testid="family"][data-name="Marc"] [data-testid="family-kids"]')).toHaveText('Child aged 5');
  await expect(page.locator('[data-testid="family"][data-name="Lia"] [data-testid="family-kids"]')).toHaveText('Ages not shared');
});

Then('no last name, phone number or email is shown', async ({ page }) => {
  const names = await page.getByTestId('family').evaluateAll((els) => els.map((e) => e.getAttribute('data-name')!));
  for (const n of names) expect(n).not.toMatch(/\s/);
  const text = await page.getByTestId('families').innerText();
  expect(text).not.toMatch(/@/);
  expect(text).not.toMatch(/\d{6,}/);
});

When('I filter families by child age {int}', async ({ page, world }, age: number) => {
  await page.goto(groupPage(world));
  await page.getByLabel('Child age').selectOption(String(age));
  await page.getByRole('button', { name: 'Show families' }).click();
  await page.waitForURL(/age=/);
});

Then('I see {string} and {string} in the list of families', async ({ page }, a: string, b: string) => {
  for (const n of [a, b]) await expect(page.locator(`[data-testid="family"][data-name="${n}"]`)).toBeVisible();
});

Then('I do not see {string} in the list of families', async ({ page }, n: string) => {
  await expect(page.locator(`[data-testid="family"][data-name="${n}"]`)).toHaveCount(0);
});

When('someone who has not joined opens the group page address', async ({ browser, world }) => {
  const outsider = await newVisitor(browser, world.now);
  world.extra.outsider = outsider;
  await outsider.goto(groupPage(world));
});

Then('they do not see any family names', async ({ world }) => {
  const o = world.extra.outsider;
  await expect(o.getByTestId('family')).toHaveCount(0);
  expect(await o.locator('body').innerText()).not.toContain('Marc');
});

Then('they are told to ask the class rep for the invite link', async ({ world }) => {
  const notice = world.extra.outsider.getByTestId('private-notice');
  await expect(notice).toContainText(/class rep/i);
  await expect(notice).toContainText(/invite link/i);
});

When('I choose the place {string}, Saturday 11:00 and write {string}', async ({ page, world }, place: string, note: string) => {
  await submitPlan(page, world, { place, day: 'Saturday', time: '11:00', note });
});

Then('the playdate appears under {string} on the group page', async ({ page, world }, heading: string) => {
  await page.goto(groupPage(world));
  const upcoming = page.getByTestId('upcoming');
  await expect(upcoming).toContainText(heading);
  await expect(upcoming.getByTestId('group-plan')).toHaveCount(1);
  await expect(upcoming.getByTestId('group-plan').first()).toContainText('Central test park');
});

Then('it shows {string}', async ({ page }, text: string) => {
  await expect(page.getByTestId('group-plan').first().getByTestId('group-plan-count')).toHaveText(text);
});

Given('Ana proposed a playdate in the group for Saturday 11:00', async ({ world }) => {
  await proposeInGroup(world.visitors['Ana'], world, 'Bring scooters');
});

When('I open the playdate from the group page and choose {string}', async ({ page, world }, choice: string) => {
  await page.goto(groupPage(world));
  await page.getByTestId('group-plan').first().getByRole('link').first().click();
  await page.waitForURL(/\/p\//);
  await page.getByRole('button', { name: choice }).click();
  await page.getByTestId('going-count').waitFor();
});

Then('the playdate shows {string}', async ({ page }, text: string) => {
  await expect(page.getByTestId('going-count')).toHaveText(text);
});

Then('my name {string} is already filled in', async ({ page }, name: string) => {
  await expect(page.getByTestId('joining-as')).toContainText(name);
  await expect(page.locator('form input[name="name"]')).toHaveCount(0);
  await expect(page.getByTestId('rsvp-list')).toContainText(name);
});

Then('the group page no longer shows {string} to the other families', async ({ world }, name: string) => {
  const marc = world.visitors['Marc'];
  await marc.goto(groupPage(world));
  await expect(marc.locator(`[data-testid="family"][data-name="${name}"]`)).toHaveCount(0);
  await expect(marc.locator('[data-testid="family"][data-name="Marc"]')).toBeVisible();
});

Then('I am no longer a member of the group', async ({ page, world }) => {
  await page.goto(groupPage(world));
  await expect(page.getByTestId('private-notice')).toBeVisible();
  await expect(page.getByTestId('family')).toHaveCount(0);
});
