import { expect } from '@playwright/test';
import { Given, When, Then, site } from './fixtures';
import { adminLogin, bumpPages, expectPublic, fakeSiteLog, queuedFromSantCugat, runPipeline, SITE, storeDocs, t } from './pipeline-helpers';

// ---------- 11: nightly gathering ----------
When('the nightly pipeline runs', async ({ world }) => {
  await queuedFromSantCugat(world);
});

Then('it fetches every enabled source in sources config, respecting robots.txt', async ({ world }) => {
  const log = await fakeSiteLog(world.ns);
  const paths = log.map((e) => e.path);
  expect(paths).toContain('/agenda.html');
  expect(paths).toContain('/teatre.html');
  expect(paths.some((p) => p.startsWith('/private/'))).toBe(false);
  for (const e of log) expect(e.ua).toMatch(/KidduBot/);
  const run = world.runs[0];
  expect(run.sources.find((s: { id: string }) => s.id.startsWith('private-')).status).toBe('blocked-robots');
});

Then('it sends changed pages only to the extraction model', async ({ world }) => {
  const first = world.runs[0];
  expect(first.totals.changed).toBe(2);
  expect(first.aiCalls.total).toBe(2);
  const second = await queuedFromSantCugat(world);
  expect(second.totals.changed).toBe(0);
  expect(second.aiCalls.total).toBe(0);
  expect(second.sources.filter((s: { status: string }) => s.status === 'unchanged')).toHaveLength(2);
});

Then('it stores a run report with counts: fetched, changed, extracted, published, queued, rejected, cost', async ({ page, world }) => {
  const run = world.runs[0];
  await adminLogin(page);
  await page.goto('/en/admin/runs');
  const row = page.locator(`[data-testid="run-row"][data-id="${run.runId}"]`);
  for (const k of ['fetched', 'changed', 'extracted', 'published', 'queued', 'rejected']) {
    await expect(row.getByTestId(`run-${k}`), k).toHaveText(String(run.totals[k]));
  }
  await expect(row.getByTestId('run-cost')).toHaveText(/€\d+\.\d{2}/);
  expect(run.totals.extracted).toBe(5);
  expect(run.totals.queued).toBeGreaterThan(0);
});

Then('every extracted item validates against the item JSON schema', async ({ world }) => {
  await runPipeline(world, { pages: ['agenda.html', 'broken.html', 'broken2.html'] });
  type D = { item: Record<string, unknown>; sources: unknown[] };
  const drafts = storeDocs<D>('draft:').filter((d) => String(d.item.title && Object.values(d.item.title as object)[0]).includes(world.ns));
  expect(drafts.length).toBeGreaterThanOrEqual(4);
  for (const d of drafts) {
    const i = d.item;
    expect(['event', 'place']).toContain(i.type);
    expect(Object.values(i.title as object)[0]).toEqual(expect.any(String));
    expect(Array.isArray(i.themes) && (i.themes as string[]).every((x) => ['sport', 'art', 'education', 'fun', 'nature'].includes(x))).toBe(true);
    if (i.start != null) expect(i.start).toMatch(/^\d{4}-\d\d-\d\dT\d\d:\d\d$/);
    for (const k of ['ageMin', 'ageMax']) if (i[k] != null) expect(Number.isInteger(i[k]) && (i[k] as number) >= 0 && (i[k] as number) <= 17).toBe(true);
    if (i.price != null) expect(i.price).toBeGreaterThanOrEqual(0);
    expect(d.sources.length).toBeGreaterThan(0);
  }
});

Then('invalid outputs are retried once with the higher model and then rejected', async ({ world }) => {
  const run = world.runs[world.runs.length - 1];
  expect(run.aiCalls['claude-sonnet-5-5']).toBe(2); // broken.html and broken2.html, once each
  expect(run.totals.invalid).toBe(1);               // broken2.html failed twice: rejected
  expect(run.sources.find((s: { id: string }) => s.id.startsWith('broken2-')).status).toBe('invalid-output');
  type D = { item: { title: Record<string, string> }; model: string };
  const festa = storeDocs<D>('draft:').find((d) => Object.values(d.item.title)[0] === t(world, 'Festa de prova'));
  expect(festa?.model).toBe('claude-sonnet-5-5');
});

Given('the monthly AI budget in site config is reached', async ({ world }) => {
  await runPipeline(world, { pages: ['agenda.html'], overrides: { publishing: { auto_publish: true } } });
  world.overrides = { ai: { monthly_budget_eur: 0 } };
});

Then("the pipeline stops calling AI and only refreshes existing items' freshness checks", async ({ world }) => {
  await bumpPages(world.ns);
  const run = await runPipeline(world, { pages: ['agenda.html'], now: '2026-11-12T03:00' });
  expect(run.budgetReached).toBe(true);
  expect(run.aiCalls.total).toBe(0);
  expect(run.totals.freshnessChecked).toBeGreaterThanOrEqual(1);
  type I = { title: Record<string, string>; lastChecked: string };
  const hora = storeDocs<I>('item:').find((i) => Object.values(i.title)[0] === t(world, 'Hora del conte'));
  expect(hora?.lastChecked).toBe('2026-11-12');
});

Then('I get an alert', async ({ page }) => {
  await adminLogin(page);
  await page.goto('/en/admin');
  await expect(page.getByTestId('alert-budget')).toBeVisible();
});

// ---------- 07: editor controls ----------
Given('auto-publish is {string} in site config', async ({ world }, v: string) => {
  world.overrides = { publishing: { auto_publish: v === 'on' } };
});

Given('the AI extracted an item with confidence above the auto-publish threshold', async ({ world }) => {
  const run = await runPipeline(world, { pages: ['agenda.html'] });
  expect(run.totals.published).toBeGreaterThanOrEqual(1);
});

Given('its source page is reachable', async ({ world }) => {
  expect((await fetch(`${SITE}/agenda.html?ns=${world.ns}`)).status).toBe(200);
});

Then('the item is published and marked {string}', async ({ page, world }, mark: string) => {
  await adminLogin(page);
  await page.goto('/en/admin/items');
  const row = page.locator(`[data-testid="admin-item"][data-title="${t(world, 'Hora del conte')}"]`);
  await expect(row.getByTestId('origin')).toHaveText(mark);
  await expectPublic(page, t(world, 'Hora del conte'), true);
  void site;
});

Given('the AI extracted an item with confidence below the threshold', async ({ world }) => {
  await runPipeline(world, { pages: ['agenda.html'] });
});

Then('the item is in the review queue and not public', async ({ page, world }) => {
  await adminLogin(page);
  await page.goto('/en/admin/queue');
  await expect(page.locator(`[data-testid="draft"][data-title="${t(world, 'Taller de titelles')}"]`)).toBeVisible();
  await expectPublic(page, t(world, 'Taller de titelles'), false);
});

Given('the pipeline has queued drafts from the Sant Cugat sources', async ({ world }) => {
  await queuedFromSantCugat(world);
});

Given('I am logged in as editor', async ({ page }) => {
  await adminLogin(page);
  await expect(page.getByTestId('admin-dashboard')).toBeVisible();
});

When('I open the review queue', async ({ page }) => {
  await page.goto('/en/admin/queue');
});

Then('I see each draft next to its source text', async ({ page, world }) => {
  for (const name of ['Hora del conte', 'Teatre de prova']) {
    await page.goto('/en/admin/queue');
    await page.locator(`[data-testid="draft"][data-title="${t(world, name)}"]`).getByRole('link', { name: 'Review' }).click();
    await expect(page.getByTestId('source-text').first()).toContainText(t(world, name));
    await expect(page.getByLabel('Title')).toHaveValue(t(world, name));
  }
});

Then('I can approve, edit fields, or reject with a reason', async ({ page, world }) => {
  const open = async (name: string) => {
    await page.goto('/en/admin/queue');
    await page.locator(`[data-testid="draft"][data-title="${t(world, name)}"]`).getByRole('link', { name: 'Review' }).click();
  };
  await open('Concert familiar');
  await page.getByRole('button', { name: 'Publish' }).click();
  await open('Hora del conte');
  await page.getByLabel('Title').fill(`${t(world, 'Hora del conte')} (edited)`);
  await page.getByRole('button', { name: 'Publish' }).click();
  await open('Teatre de prova');
  await page.getByLabel('Reason for rejecting').fill('Date not confirmed by the theatre');
  await page.getByRole('button', { name: 'Reject' }).click();
  await expectPublic(page, t(world, 'Concert familiar'), true);
  await expectPublic(page, `${t(world, 'Hora del conte')} (edited)`, true);
  await expectPublic(page, t(world, 'Teatre de prova'), false);
  await page.goto('/en/admin/queue?status=rejected');
  await expect(page.locator(`[data-testid="draft"][data-title="${t(world, 'Teatre de prova')}"]`)).toContainText('Date not confirmed by the theatre');
});

Given('two drafts describe the same event at the same place and time', async ({ world }) => {
  await runPipeline(world, { pages: ['agenda.html', 'teatre.html'] });
});

Then('the queue shows them as one item with two sources', async ({ page, world }) => {
  await adminLogin(page);
  await page.goto('/en/admin/queue');
  const cards = page.locator(`[data-testid="draft"][data-title="${t(world, 'Concert familiar')}"]`);
  await expect(cards).toHaveCount(1);
  await expect(cards.getByTestId('draft-sources')).toHaveText('2 sources');
});

Given('a source domain is in the blocklist in sources config', async ({ world }) => {
  const run = await runPipeline(world, { pages: ['agenda.html'], blocked: true });
  expect(run.sources[0].status).toBe('blocklisted');
});

Then('no item from that domain enters the queue', async ({ page, world }) => {
  expect(await fakeSiteLog(world.ns)).toEqual([]);
  await adminLogin(page);
  await page.goto('/en/admin/queue');
  await expect(page.locator(`[data-testid="draft"][data-title*="${world.ns}"]`)).toHaveCount(0);
});
