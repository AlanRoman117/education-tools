// Playwright test setup. See docs/testing.md.
// @ts-check
'use strict';

const { defineConfig, devices } = require('@playwright/test');

const CI = !!process.env.CI;
const PORT = 4173;

// Repo checks read files only; they run once instead of on every device.
const REPO_CHECKS = /tests[\\/]repo\.spec\.js$/;
const DEVICE_TESTS_IGNORE = [REPO_CHECKS, /node_modules/, /_site/];

// Set CHROMIUM_PATH to use an installed Chromium when a download isn't possible.
const chromiumLaunch = process.env.CHROMIUM_PATH
  ? { launchOptions: { executablePath: process.env.CHROMIUM_PATH } }
  : {};

module.exports = defineConfig({
  testDir: '.',
  testMatch: ['tests/**/*.spec.js', 'tools/**/*.spec.js'],
  fullyParallel: true,
  forbidOnly: CI,
  retries: 0,
  reporter: CI
    ? [['github'], ['list'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },

  webServer: {
    command: `node scripts/serve.js --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}/index.html`,
    reuseExistingServer: !CI,
    stdout: 'ignore'
  },

  // The devices the tools are used on. metadata.tablet turns on the
  // "fits the screen without scrolling" and tap-size checks.
  projects: [
    {
      name: 'repo-checks',
      testMatch: REPO_CHECKS
    },
    {
      name: 'ipad',
      testIgnore: DEVICE_TESTS_IGNORE,
      use: { ...devices['iPad (gen 7)'] },
      metadata: { tablet: true }
    },
    {
      name: 'ipad-landscape',
      testIgnore: DEVICE_TESTS_IGNORE,
      use: { ...devices['iPad (gen 7) landscape'] },
      metadata: { tablet: true }
    },
    {
      name: 'iphone',
      testIgnore: DEVICE_TESTS_IGNORE,
      use: { ...devices['iPhone 13'] },
      metadata: { tablet: false }
    },
    {
      // ASUS ROG Flow Z13: Windows touchscreen tablet, Chrome/Edge,
      // 2560×1600 at 200% scaling.
      name: 'z13',
      testIgnore: DEVICE_TESTS_IGNORE,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        hasTouch: true,
        ...chromiumLaunch
      },
      metadata: { tablet: true }
    }
  ]
});
