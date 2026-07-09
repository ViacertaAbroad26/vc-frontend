import { defineConfig, devices } from "@playwright/test";

const PORT = 5173;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "unauthenticated", use: { ...devices["Desktop Chrome"] }, testMatch: /auth\.spec\.ts/ },
    {
      name: "student",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/student.json" },
      testMatch: /student\.spec\.ts/,
    },
    {
      name: "advisor",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/advisor.json" },
      testMatch: /(advisor|role-gating)\.spec\.ts/,
    },
  ],
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
        webServer: {
          command: "pnpm --filter @viacerta/web dev",
          url: baseURL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }),
});
