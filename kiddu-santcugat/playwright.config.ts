import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { MILESTONE_FEATURES, SKIP_TAGS } from './tests/milestone';

const PORT = 3100;
const testDir = defineBddConfig({
  features: MILESTONE_FEATURES,
  steps: ['tests/steps/*.ts'],
  tags: SKIP_TAGS,
});

export default defineConfig({
  testDir,
  fullyParallel: true,
  workers: 4,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    ...devices['Pixel 7'],
    locale: 'en-GB',
    trace: 'off',
  },
  webServer: [{
    command: 'node tests/fixtures/source-site/server.mjs',
    url: 'http://127.0.0.1:3101/robots.txt',
    reuseExistingServer: false,
  }, {
    command: `rm -rf .test-store && npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    timeout: 240_000,
    stdout: 'ignore',
    reuseExistingServer: false,
    env: { CATALOGUE_PATH: 'tests/fixtures/catalogue.json', CASALS_PATH: 'tests/fixtures/casals.json', KIDDU_TEST_HOOKS: '1', KIDDU_STORE_DIR: '.test-store', KIDDU_ADMIN_KEY: 'test-admin-key', KIDDU_PLACES_PATH: 'tests/fixtures/places.json' },
  }],
});
