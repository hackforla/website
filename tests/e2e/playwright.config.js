// playwright.config.js
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: '.',
  outputDir: './test-results',
  use: { baseURL: 'http://hfla_site:4000' },
  webServer: {
    url: 'http://hfla_site:4000',
    reuseExistingServer: true,
  }
})