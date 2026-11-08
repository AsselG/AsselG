import { expect } from '@playwright/test';
import { Given, When, Then, catalogue, site, FIXED_NOW, cardIds, pinIds } from './fixtures';
import { daysBetween, addDays } from '../../lib/time';

When('I open the page of a place, for example a trampoline park', async ({ page, world }) => {
  world.itemId = 'p-trampoline';
  await page.goto(`/en/item/${world.itemId}`);
});

Then('I see address, opening hours, age range, price, indoor\\/outdoor, facilities', async ({ page }) => {
  for (const id of ['address', 'opening-hours', 'age', 'price', 'setting', 'facilities']) {
    await expect(page.getByTestId(id), id).not.toBeEmpty();
  }
  await expect(page.getByTestId('opening-hours')).toContainText('16:00–21:00');
  await expect(page.getByTestId('setting')).toHaveText('Indoor');
});

Then('I see a link to the official source', async ({ page, world }) => {
  const item = catalogue.items.find((i) => i.id === world.itemId)!;
  await expect(page.getByTestId('source')).toHaveAttribute('href', item.sourceUrl);
});

Then('I see {string} that opens my maps app', async ({ page, world }, label: string) => {
  const item = catalogue.items.find((i) => i.id === world.itemId)!;
  const link = page.getByTestId('directions');
  await expect(link).toContainText(label);
  await expect(link).toHaveAttribute('href', new RegExp(`google\\.com/maps/dir/.*destination=${item.lat},${item.lng}`));
});

When('I open the page of an event', async ({ page, world }) => {
  world.itemId = 'e-workshop-today';
  await page.goto(`/en/item/${world.itemId}`);
});

Then('I see date, start and end time, place, age range, price and booking link if any', async ({ page, world }) => {
  const item = catalogue.items.find((i) => i.id === world.itemId)!;
  await expect(page.getByTestId('date')).toContainText('11 November 2026');
  await expect(page.getByTestId('time')).toHaveText(`${item.start!.slice(11)}–${item.end!.slice(11)}`);
  await expect(page.getByTestId('place')).toHaveText(item.placeName!);
  await expect(page.getByTestId('age')).toHaveText(`Ages ${item.ageMin}–${item.ageMax}`);
  await expect(page.getByTestId('price')).toHaveText('Free');
  await expect(page.getByTestId('booking')).toHaveAttribute('href', item.bookingUrl!);
});

Then('I see the language of the activity \\(ca\\/es\\/en)', async ({ page }) => {
  await expect(page.getByTestId('activity-language')).toHaveText('Català, English');
});

Given('an event ended yesterday', async ({ world }) => {
  const yesterday = addDays(FIXED_NOW.slice(0, 10), -1);
  const ev = catalogue.items.find((i) => i.type === 'event' && i.end?.startsWith(yesterday));
  expect(ev, 'fixture needs an event that ended yesterday').toBeTruthy();
  world.itemId = ev!.id;
});

Then('I do not see that event in the map or the list', async ({ page, world }) => {
  const cards = await cardIds(page);
  expect(cards).not.toContain(world.itemId);
  expect(await pinIds(page, cards.length)).not.toContain(world.itemId);
});

Then('its page shows {string} with similar upcoming items', async ({ page, world }, text: string) => {
  await page.goto(`/en/item/${world.itemId}`);
  await expect(page.getByTestId('finished')).toHaveText(text);
  await expect(page.getByTestId('similar-item').first()).toBeVisible();
});

Given('an item was last checked more days ago than the freshness limit in site config', async ({ page, world }) => {
  const today = FIXED_NOW.slice(0, 10);
  const age = (d: string) => daysBetween(d, today);
  const stale = catalogue.items.find((i) => i.status === 'published' && age(i.lastChecked) > site.freshness.warn_after_days && age(i.lastChecked) <= site.freshness.hide_after_days);
  const hidden = catalogue.items.find((i) => i.status === 'published' && age(i.lastChecked) > site.freshness.hide_after_days);
  expect(stale, 'fixture needs a stale item').toBeTruthy();
  expect(hidden, 'fixture needs an item past the hide limit').toBeTruthy();
  world.staleId = stale!.id;
  world.hiddenId = hidden!.id;
  await page.goto('/');
});

Then('its card shows {string}', async ({ page, world }, text: string) => {
  const card = page.locator(`[data-testid="item-card"][data-id="${world.staleId}"]`);
  await expect(card.getByTestId('card-stale')).toContainText(text);
  const fresh = page.locator(`[data-testid="item-card"]:not([data-id="${world.staleId}"]) [data-testid="card-stale"]`);
  await expect(fresh).toHaveCount(0);
});

Then('if it is older than the hide limit it is not shown at all', async ({ page, world }) => {
  expect(await cardIds(page)).not.toContain(world.hiddenId);
  const r = await page.goto(`/en/item/${world.hiddenId}`);
  expect(r?.status()).toBe(404);
});

When('an item description was generated or translated by AI', async ({ page, world }) => {
  const ai = catalogue.items.find((i) => i.descriptionAiGenerated);
  expect(ai).toBeTruthy();
  world.itemId = ai!.id;
  await page.goto(`/en/item/${world.itemId}`);
});

Then('the page shows a small {string} label', async ({ page }, text: string) => {
  await expect(page.getByTestId('ai-label')).toHaveText(text);
  const human = catalogue.items.find((i) => i.description && !i.descriptionAiGenerated)!;
  await page.goto(`/en/item/${human.id}`);
  await expect(page.getByTestId('ai-label')).toHaveCount(0);
});
