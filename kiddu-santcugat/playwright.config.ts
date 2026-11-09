import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';
import { MILESTONE_FEATURES } from './tests/milestone';

const PORT = 3100;
const testDir = defineBddConfig({
  features: MILESTONE_FEATURES,
  steps: ['tests/steps/*.ts'],
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
  webServer: {
    command: `rm -rf .test-store && npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/en`,
    timeout: 240_000,
    reuseExistingServer: false,
    env: { CATALOGUE_PATH: 'tests/fixtures/catalogue.json', KIDDU_TEST_HOOKS: '1', KIDDU_STORE_DIR: '.test-store', KIDDU_ADMIN_KEY: 'test-admin-key' },
  },
});
