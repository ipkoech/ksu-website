import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  // A cold Next dev runtime can spend over a minute compiling a large route
  // before the first response; keep the browser gate reliable without
  // weakening its assertions.
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["line"], ["html", { open: "never" }]] : "line",
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "web",
      testDir: "./apps/web/e2e",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.WEB_E2E_BASE_URL ?? "http://localhost:3000",
      },
    },
    {
      name: "web-responsive-audit",
      testDir: "./apps/web",
      testMatch: "page-cms-visual-audit.spec.ts",
      use: {
        ...devices["Desktop Chrome"],
        baseURL:
          process.env.PAGE_CMS_AUDIT_BASE_URL ??
          process.env.WEB_E2E_BASE_URL ??
          "http://localhost:3000",
      },
    },
    {
      name: "admin",
      testDir: "./apps/admin/e2e",
      use: {
        ...devices["Desktop Chrome"],
        baseURL:
          process.env.ADMIN_E2E_BASE_URL ??
          process.env.SCHOOL_PORTAL_E2E_BASE_URL ??
          "http://localhost:3001",
      },
    },
    {
      name: "library",
      testDir: "./apps/library/e2e",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.LIBRARY_E2E_BASE_URL ?? "http://localhost:3003",
      },
    },
    {
      name: "research",
      testDir: "./apps/research/e2e",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: process.env.RESEARCH_E2E_BASE_URL ?? "http://localhost:3002",
      },
    },
    {
      name: "heri",
      testDir: "./apps/heri-africa/e2e",
      use: {
        ...devices["Desktop Chrome"],
        baseURL:
          process.env.HERI_E2E_BASE_URL ??
          "http://localhost:3000/heri-africa/",
      },
    },
    {
      name: "heri-mobile",
      testDir: "./apps/heri-africa/e2e",
      use: {
        ...devices["Pixel 5"],
        baseURL:
          process.env.HERI_E2E_BASE_URL ??
          "http://localhost:3000/heri-africa/",
      },
    },
  ],
});
