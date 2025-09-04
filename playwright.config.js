const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  // No specific test directory needed for a scraping script
  // testDir: './tests',
  
  // Timeout for the entire test run.
  timeout: 5 * 60 * 1000, // 5 minutes

  // Global settings for all projects.
  use: {
    // Use headless mode for CI/automation
    headless: true,
    
    // Browser to use.
    browserName: 'chromium',

    // Capture screenshot only on failure.
    screenshot: 'only-on-failure',

    // Record video only on first retry.
    video: 'on-first-retry',
  },

  // Configure projects for major browsers.
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});