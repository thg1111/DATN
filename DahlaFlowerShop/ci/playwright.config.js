const { defineConfig, devices } = require('@playwright/test');

const baseURL = process.env.FRONTEND_BASE_URL || 'http://127.0.0.1:5500';
const apiBaseURL = process.env.API_BASE_URL || 'https://localhost:7114';

module.exports = defineConfig({
  testDir: './playwright',
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['junit', { outputFile: 'reports/playwright/playwright-junit.xml' }],
    ['html', { outputFolder: 'reports/playwright/html', open: 'never' }]
  ],
  use: {
    baseURL,
    ignoreHTTPSErrors: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1366, height: 768 },
    extraHTTPHeaders: {
      'x-dahla-e2e': 'true'
    }
  },
  metadata: {
    apiBaseURL
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ]
});
