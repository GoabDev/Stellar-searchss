import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for visual regression tests.
 *
 * Snapshots are stored in e2e/snapshots/ and committed to the repository.
 * To update baselines intentionally, run:
 *
 *   npm run test:visual:update
 *
 * See CONTRIBUTING.md → "Visual regression tests" for the full workflow.
 */
export default defineConfig({
  testDir: './e2e',

  // Each test file runs in sequence; no parallel workers so screenshots are
  // deterministic and do not fight over the same Vite preview server port.
  workers: 1,
  fullyParallel: false,

  // Retry once on CI to absorb occasional rendering timing jitter.
  retries: process.env.CI ? 1 : 0,

  // Reporter: compact dot output in CI, rich HTML locally.
  reporter: process.env.CI
    ? [['dot'], ['html', { open: 'never', outputFolder: 'playwright-report' }]]
    : [['list'], ['html', { open: 'on-failure', outputFolder: 'playwright-report' }]],

  use: {
    // The Vite preview server is started by the webServer block below.
    baseURL: 'http://localhost:4173',

    // Chromium only — keeps CI fast and image diffs deterministic.
    ...devices['Desktop Chrome'],

    // Capture screenshot + trace on first retry so diffs are always available.
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',

    // Fixed viewport so layout doesn't depend on the runner's screen size.
    viewport: { width: 1280, height: 800 },

    // Pass reducedMotion via contextOptions (supported in Playwright ≥ 1.12).
    // This stops the CSS `animate-ticker` on LiveTicker and causes Framer Motion
    // to skip animations, giving stable snapshots.
    contextOptions: {
      reducedMotion: 'reduce',
    },
  },

  // Snapshot options — pixel-level tolerance for anti-aliasing differences
  // between local machines and the CI runner.
  expect: {
    toHaveScreenshot: {
      // Allow up to 0.2% of pixels to differ (handles sub-pixel rendering).
      maxDiffPixelRatio: 0.002,
      // Per-pixel threshold — each channel can differ by up to 10/255.
      threshold: 0.1,
      // Disable animations at the assertion level too, as belt-and-suspenders.
      animations: 'disabled',
    },
  },

  // Snapshot directory — stored next to the spec file so they travel with it.
  snapshotDir: './e2e/snapshots',

  // Build the app and serve it with `vite preview` before the test run.
  // Using a production build avoids HMR timing issues and gives a stable DOM.
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    // Generous timeout: the first `npm run build` takes ~30 s on a cold runner.
    timeout: 120_000,
    stderr: 'pipe',
  },
})
