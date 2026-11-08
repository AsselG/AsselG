import { expect } from '@playwright/test';
import { Given, When, Then, catalogue, area, site, cardIds, pinIds, km } from './fixtures';
import { distanceKm } from '../../lib/geo';

Given('the catalogue contains published items in {string} and nearby towns', async ({}, town: string) => {
  const published = catalogue.items.filter((i) => i.status === 'published');
  expect(published.some((i) => i.town === town)).toBe(true);
  expect(published.some((i) => i.town !== town)).toBe(true);
});

When('I open the home page', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('result-count').waitFor();
});

Given('I am on the home page', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('result-count').waitFor();
});

Then('I see a map centred on {string}', async ({ page }, name: string) => {
  const map = page.getByTestId('map');
  await expect(map).toBeVisible();
  await expect(map).toHaveAttribute('data-area', name);
  await expect(map).toHaveAttribute('data-center-lat', String(area.centre[0]));
  await expect(map).toHaveAttribute('data-center-lng', String(area.centre[1]));
  await expect(page.getByTestId('area-name')).toHaveText(name);
});

Then('the map shows only items within the default radius from site config', async ({ page }) => {
  const radius = area.radius_km ?? site.area.default_radius_km;
  const cards = await cardIds(page);
  const pins = await pinIds(page, cards.length);
  expect(pins.length).toBeGreaterThan(0);
  for (const id of pins) {
    const it = catalogue.items.find((i) => i.id === id)!;
    expect(distanceKm(area.centre[0], area.centre[1], it.lat, it.lng), id).toBeLessThanOrEqual(radius);
  }
  const outside = catalogue.items.filter((i) => distanceKm(area.centre[0], area.centre[1], i.lat, i.lng) > radius).map((i) => i.id);
  expect(outside.length, 'fixture needs an item outside the radius').toBeGreaterThan(0);
  for (const id of outside) expect(pins).not.toContain(id);
});

Then('I see a list of the same items under the map, ordered by distance', async ({ page }) => {
  const cards = await cardIds(page);
  const pins = await pinIds(page, cards.length);
  expect([...cards].sort()).toEqual([...pins].sort());
  const mapBox = (await page.getByTestId('map').boundingBox())!;
  const listBox = (await page.getByTestId('item-list').boundingBox())!;
  expect(listBox.y).toBeGreaterThan(mapBox.y);
  const d = await page.getByTestId('card-distance').allTextContents();
  const kms = d.map(km);
  expect(kms).toEqual([...kms].sort((a, b) => a - b));
});

When('I tap an item in the list', async ({ page, world }) => {
  await pinIds(page, 1);
  const card = page.getByTestId('item-card').nth(1);
  world.selectedId = (await card.getAttribute('data-id'))!;
  await card.getByTestId('card-meta').click();
});

Then('the map highlights the same item', async ({ page, world }) => {
  await expect(page.locator(`[data-testid="pin"][data-id="${world.selectedId}"]`)).toHaveClass(/selected/);
  await expect(page.locator('[data-testid="pin"].selected')).toHaveCount(1);
});

When('I tap a pin on the map', async ({ page, world }) => {
  const ids = await cardIds(page);
  await pinIds(page, ids.length);
  const map = (await page.getByTestId('map').boundingBox())!;
  // A pin the parent can actually see: inside the map, and far down the list so the list has to scroll.
  for (const id of [...ids].reverse()) {
    const b = await page.locator(`[data-testid="pin"][data-id="${id}"]`).boundingBox();
    if (b && b.x > map.x && b.y > map.y && b.x + b.width < map.x + map.width && b.y + b.height < map.y + map.height) {
      world.selectedId = id;
      break;
    }
  }
  expect(world.selectedId, 'no visible pin').toBeTruthy();
  await page.locator(`[data-testid="pin"][data-id="${world.selectedId}"]`).click();
});

Then('the list scrolls to the same item', async ({ page, world }) => {
  const card = page.locator(`[data-testid="item-card"][data-id="${world.selectedId}"]`);
  await expect(card).toHaveClass(/selected/);
  await expect(card).toBeInViewport();
});

When('I tap {string}', async ({ page }, label: string) => {
  await page.getByRole('button', { name: label }).click();
});

Then('the browser asks for my location', async ({ page }) => {
  await expect.poll(() => page.evaluate(() => (window as any).__geoCalls)).toBe(1);
});

Then('if I refuse, the map stays centred on the active area and shows a short note', async ({ page }) => {
  await expect(page.getByTestId('location-note')).toBeVisible();
  await expect(page.getByTestId('map')).toHaveAttribute('data-center-lat', String(area.centre[0]));
  const d = await page.getByTestId('card-distance').allTextContents();
  const kms = d.map(km);
  expect(kms).toEqual([...kms].sort((a, b) => a - b));
});

Then('my location is never sent to the server or stored', async ({ page, world, context }) => {
  for (const u of world.requests) expect(u).not.toMatch(/[?&](lat|lng|lon|latitude|longitude)=/i);
  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
  expect(stored).not.toMatch(/lat|lng|longitude|latitude/i);
  const cookies = await context.cookies();
  expect(cookies.map((c) => c.name).sort()).toEqual(['kiddu_now', 'kiddu_weather']);
});

When('I look at any item card', async ({ page }) => {
  await page.goto('/');
  expect((await cardIds(page)).length).toBeGreaterThan(0);
});

Then('I see its title, theme icon, age range, price label, distance and when it happens or opens', async ({ page }) => {
  const cards = page.getByTestId('item-card');
  const n = await cards.count();
  for (let i = 0; i < n; i++) {
    const c = cards.nth(i);
    for (const part of ['card-title', 'card-icon', 'card-age', 'card-price', 'card-distance', 'card-when']) {
      await expect(c.getByTestId(part), part).not.toBeEmpty();
    }
  }
});

Then('I see a {string} date', async ({ page }, _label: string) => {
  const texts = await page.getByTestId('card-checked').allTextContents();
  expect(texts.length).toBeGreaterThan(0);
  for (const t of texts) expect(t).toMatch(/^Last checked .*\b20\d\d\b/);
});
