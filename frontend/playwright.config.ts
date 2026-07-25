import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./apps/admin/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "line",
  use: {
    baseURL: process.env.SCHOOL_PORTAL_E2E_BASE_URL ?? "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } }],
});
