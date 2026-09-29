import { defineConfig, devices } from "@playwright/test";
const baseURL = process.env.RESEARCH_ADMIN_TEST_URL ?? "http://127.0.0.1:3101";
if (!["localhost", "127.0.0.1"].includes(new URL(baseURL).hostname)) {
  throw new Error("Fault-injection browser tests require a local Research app, not production.");
}
export default defineConfig({
  testDir: "./e2e", testMatch: "admin-workspace.spec.ts", fullyParallel: false,
  timeout: 45_000, retries: 0, reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "desktop", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.RESEARCH_ADMIN_TEST_URL ? undefined : {
    command: "pnpm dev --hostname 127.0.0.1 --port 3101", url: baseURL,
    reuseExistingServer: !process.env.CI, timeout: 180_000,
  },
});
