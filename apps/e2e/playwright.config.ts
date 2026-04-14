import { defineConfig, devices } from "@playwright/test";
import path from "path";

const E2E_DIR = __dirname;
const EXAMPLE_DIR = path.resolve(E2E_DIR, "../example");

export default defineConfig({
  testDir: "./tests",
  // Per-test timeout (includes waiting for tests to run inside the app)
  timeout: 120_000,
  expect: { timeout: 30_000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "dev",
      testMatch: "**/dev.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:3333",
      },
    },
    {
      name: "build",
      testMatch: "**/build.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: "http://localhost:4173",
      },
    },
  ],
  webServer: [
    {
      // fieldtest --ui starts a Vite dev server with the test runner on port 3333.
      // BROWSER=none prevents Vite from opening the system browser automatically.
      name: "fieldtest-dev",
      command: "BROWSER=none pnpm exec fieldtest --ui",
      cwd: EXAMPLE_DIR,
      port: 3333,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      // serve-build.mjs runs `fieldtest --build` then serves the static output.
      // The build step takes longer, so use a higher timeout.
      name: "fieldtest-build",
      command: "node serve-build.mjs",
      cwd: E2E_DIR,
      port: 4173,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
  ],
});
