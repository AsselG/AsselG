import { expect } from '@playwright/test';
import { When, Then } from './fixtures';
import { adminLogin, expectPublic, openDraft, runPipeline, storeDocs, t } from './pipeline-helpers';

type D = { item: { title: Record<string, string>; start?: string; placeName?: string; lat: number | null; lng: number | null; ageMin?: number | null; price?: number | null; description?: Record<string, string> }; issues: string[]; model: string };
const drafts = (ns: string) => storeDocs<D>('draft:').filter((d) => Object.values(d.item.title)[0].includes(ns));
const byTitle = (ns: string, start: string) => drafts(ns).find((d) => Object.values(d.item.title)[0].startsWith(start))!;

When("the pipeline reads the town hall children's feed", async ({ world }) => {
  await runPipeline(world, { pages: ['agenda.rss'] });
});

Then('the upcoming events are queued with the date, time, place and map location given by the feed', async ({ world }) => {
  const taller = byTitle(world.ns, 'Taller de prova');
  expect(taller.item.start).toBe('2027-06-20T17:30');
  expect(taller.item.placeName).toBe('Biblioteca de prova');
  expect([taller.item.lat, taller.item.lng]).toEqual([41.4715, 2.088]);
  expect(byTitle(world.ns, 'Festa de prova').item.start).toBe('2027-06-21T10:00');
  expect(world.runs[0].totals.queued).toBe(2);
});

Then('no AI was used for them', async ({ world }) => {
  expect(world.runs[0].aiCalls.total).toBe(0);
  expect(world.runs[0].costEur).toBe(0);
  for (const d of drafts(world.ns)) expect(d.model).toBe('feed');
});

Then('events that already happened are not queued', async ({ world }) => {
  expect(drafts(world.ns).some((d) => Object.values(d.item.title)[0].startsWith('Contes passats'))).toBe(false);
  expect(world.runs[0].totals.rejected).toBe(1);
});

Then('an event without coordinates is flagged {string}', async ({ world }, issue: string) => {
  const festa = byTitle(world.ns, 'Festa de prova');
  expect(festa.item.lat).toBeNull();
  expect(festa.issues).toContain(issue);
});

Then('an event described as {string} is for ages from {int}', async ({ world }, _text: string, age: number) => {
  expect(byTitle(world.ns, 'Taller de prova').item.ageMin).toBe(age);
});

Then('an event described as {string} is free', async ({ world }, _text: string) => {
  expect(byTitle(world.ns, 'Festa de prova').item.price).toBe(0);
});

When('the editor publishes one of its events', async ({ page, world }) => {
  await adminLogin(page);
  await openDraft(page, world, 'Taller de prova "Dibuix"');
  await page.getByRole('button', { name: 'Publish' }).click();
});

Then("families see the facts and a link to the town hall page, but not the town hall's description text", async ({ page, world }) => {
  const title = t(world, 'Taller de prova "Dibuix"');
  await expectPublic(page, title, true);
  await page.getByTestId('card-title').filter({ hasText: title }).click();
  await expect(page.getByTestId('source')).toHaveAttribute('href', `https://example.org/activitat/taller-${world.ns}`);
  await expect(page.getByTestId('age')).toHaveText('From 6 years');
  expect(await page.locator('body').innerText()).not.toContain('Aprendrem a dibuixar amb filferro');
});
