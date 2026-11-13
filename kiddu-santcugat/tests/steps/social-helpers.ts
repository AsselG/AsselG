import { expect, type Browser, type Page } from '@playwright/test';
import { test, type World } from './fixtures';

export const ADMIN_KEY = 'test-admin-key';

export async function newVisitor(browser: Browser, now: string): Promise<Page> {
  const context = await browser.newContext({ ...test.info().project.use, locale: 'en-GB' } as never);
  await context.addCookies([
    { name: 'kiddu_now', value: now, domain: 'localhost', path: '/' },
    { name: 'kiddu_weather', value: 'dry', domain: 'localhost', path: '/' },
  ]);
  return context.newPage();
}

export async function createGroup(page: Page, world: World, name: string) {
  await page.goto(`/en/groups/new?key=${ADMIN_KEY}`);
  await page.getByLabel('Group name').fill(name);
  await page.getByRole('button', { name: 'Create group' }).click();
  const invite = page.getByTestId('invite-url');
  await expect(invite).toBeVisible();
  world.inviteUrl = (await invite.inputValue()).replace(/^https?:\/\/[^/]+/, '');
  world.groupId = (await page.getByTestId('group-created').getAttribute('data-group-id'))!;
  world.groupName = name;
}

export async function joinGroup(page: Page, world: World, name: string, age?: number) {
  await page.goto(world.inviteUrl!);
  const nameField = page.getByLabel('Your first name');
  if (await nameField.count()) {
    await nameField.fill(name);
    if (age != null) await page.getByLabel("Children's ages (optional)").fill(String(age));
    await page.getByRole('button', { name: 'Join the class' }).click();
  } else {
    await page.getByRole('button', { name: new RegExp(`^Join the class as ${name}$`) }).click(); // device already has a family profile
  }
  await page.waitForURL(/\/class\//);
}

export interface ProfileInput { name: string; age?: number; interests?: string[]; languages?: string[] }

export async function createProfile(page: Page, p: ProfileInput) {
  await page.goto('/en/me');
  await page.getByLabel('Your first name').fill(p.name);
  if (p.age != null) await page.getByLabel("Children's ages (optional)").fill(String(p.age));
  for (const i of p.interests ?? []) await page.getByRole('group', { name: 'Interests' }).getByLabel(i, { exact: true }).check();
  for (const l of p.languages ?? []) await page.getByRole('group', { name: 'Languages' }).getByLabel(l, { exact: true }).check();
  await page.getByRole('button', { name: 'Create family profile' }).click();
  await page.getByTestId('profile-name').waitFor();
}

export const pathOf = (url: string) => url.replace(/^https?:\/\/[^/]+/, '');

/** `a` shares the personal link, `b` opens it and connects. */
export async function connect(a: Page, b: Page) {
  await a.goto('/en/me');
  const link = pathOf(await a.getByTestId('my-invite-url').inputValue());
  await b.goto(link);
  await b.getByRole('button', { name: 'Connect' }).click();
  await b.waitForURL(/\/me$/);
}

export async function friendNames(p: Page): Promise<string[]> {
  await p.goto('/en/me');
  await p.getByTestId('profile-name').waitFor();
  return p.getByTestId('friend').evaluateAll((els) => els.map((e) => e.getAttribute('data-name')!));
}

/** Creates a plan from the plan form. audience: 'friends' | 'link'. Returns the plan path. */
export async function createPrivatePlan(page: Page, world: World, o: { place?: string; other?: { name: string; address?: string }; only?: string[]; day?: string; time?: string; group?: string }) {
  await page.goto(`/en/plan/new${o.group ? `?group=${o.group}` : ''}`);
  if (o.other) {
    await page.getByLabel('Where').selectOption({ label: 'Another place (write it below)' });
    await page.getByLabel('Place name').fill(o.other.name);
    if (o.other.address) await page.getByLabel('Address for invited families (optional)').fill(o.other.address);
  } else if (o.place) {
    await page.getByLabel('Where').selectOption({ label: o.place });
  }
  await selectDay(page, o.day ?? 'Saturday');
  await page.getByLabel('Time').fill(o.time ?? '11:00');
  if (!o.group) {
    await page.getByLabel('My connected friends').check();
    if (o.only) {
      const boxes = page.getByRole('group', { name: 'Who is invited' }).getByRole('checkbox');
      for (let i = 0; i < (await boxes.count()); i++) {
        const label = (await boxes.nth(i).getAttribute('data-name'))!;
        if (o.only.includes(label)) await boxes.nth(i).check(); else await boxes.nth(i).uncheck();
      }
    }
  }
  await page.getByRole('button', { name: 'Create plan' }).click();
  await page.waitForURL(/\/p\/[^/?]+/);
  const url = new URL(page.url());
  world.planUrl = url.pathname;
  world.organiserUrl = url.pathname + url.search;
  world.planTitle = (await page.getByTestId('plan-title').textContent()) ?? '';
}

export async function selectDay(page: Page, day: string) {
  const sel = page.getByLabel('Day');
  const labels = await sel.locator('option').allTextContents();
  const label = labels.find((l) => l.startsWith(day));
  expect(label, `no "${day}" in the day list`).toBeTruthy();
  await sel.selectOption({ label });
}

/** Fills and submits the plan form. Works for both "from an item" and "from a group". */
export async function submitPlan(page: Page, world: World, o: { day: string; time: string; note: string; place?: string; name?: string }) {
  const nameField = page.getByLabel('Your first name');
  if (await nameField.count()) await nameField.fill(o.name ?? 'Ana');
  if (o.place) await page.getByLabel('Where').selectOption({ label: o.place });
  await selectDay(page, o.day);
  await page.getByLabel('Time').fill(o.time);
  await page.getByLabel('Note').fill(o.note);
  await page.getByRole('button', { name: 'Create plan' }).click();
  await page.waitForURL(/\/p\/[^/?]+/);
  const url = new URL(page.url());
  world.organiserUrl = url.pathname + url.search;
  world.planUrl = url.pathname;
  world.planTitle = (await page.getByTestId('plan-title').textContent()) ?? '';
  world.planDay = (await page.getByTestId('plan-day').getAttribute('data-day')) ?? undefined;
}

/** A plan created from the public site by "Ana", if the scenario has none yet. */
export async function ensurePlan(page: Page, world: World) {
  if (world.planUrl) return;
  await page.goto('/en/item/p-park');
  await page.getByRole('link', { name: 'Plan with friends' }).click();
  await submitPlan(page, world, { day: 'Saturday', time: '11:00', note: 'Bringing a football', name: 'Ana' });
}
