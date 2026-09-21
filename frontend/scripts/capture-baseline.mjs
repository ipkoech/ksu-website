import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

// Read-only captures. Pass a loopback URL so accidental production targets fail.
const [target, output, mode = "development", network = "normal"] = process.argv.slice(2);
if (!target || !output || !["development", "production"].includes(mode) || !["normal", "slow"].includes(network)) {
  throw new Error("Usage: node scripts/capture-baseline.mjs URL NEW_OUTPUT_DIRECTORY [development|production] [normal|slow]");
}
const url = new URL(target);
if (!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) {
  throw new Error("Baseline capture requires a local/test frontend on loopback.");
}
const directory = path.resolve(output);
await mkdir(path.dirname(directory), { recursive: true });
await mkdir(directory); // Refuse to overwrite an earlier measurement.
const browser = await chromium.launch({ channel: "chromium" });
const results = [];
const viewports = [
  { width: 1440, height: 1000 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
];
try {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport, reducedMotion: "reduce", colorScheme: "light" });
    const blockedWrites = [];
    await context.route("**/*", (route) => {
      const request = route.request();
      if (!["GET", "HEAD", "OPTIONS"].includes(request.method())) {
        blockedWrites.push({ method: request.method(), url: request.url() });
        return route.abort("blockedbyclient");
      }
      return route.continue();
    });
    const page = await context.newPage();
    const errors = [];
    let browserRequests = 0;
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", () => browserRequests++);
    if (network === "slow") {
      const session = await context.newCDPSession(page);
      await session.send("Network.enable");
      await session.send("Network.emulateNetworkConditions", {
        offline: false, latency: 150, downloadThroughput: 200_000, uploadThroughput: 100_000,
      });
    }
    await page.addInitScript(() => {
      window.__baseline = {
        lcp: null,
        cls: 0,
        inp: null,
        longTaskCount: 0,
        longTaskMaxMs: 0,
      };
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) window.__baseline.lcp = entry.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) window.__baseline.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const duration = entry.duration;
            if (typeof duration === "number" && Number.isFinite(duration)) {
              window.__baseline.inp = Math.max(window.__baseline.inp ?? 0, duration);
            }
          }
        }).observe({ type: "event", buffered: true, durationThreshold: 16 });
      } catch {
        // Event timing is unavailable in some Chromium/headless versions.
      }
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            window.__baseline.longTaskCount += 1;
            window.__baseline.longTaskMaxMs = Math.max(
              window.__baseline.longTaskMaxMs,
              entry.duration,
            );
          }
        }).observe({ type: "longtask", buffered: true });
      } catch {
        // Long-task timing is unavailable in some Chromium/headless versions.
      }
    });
    const response = await page.goto(target, { waitUntil: "load", timeout: 180_000 });
    await page.evaluate(() => document.fonts.ready);
    // Bounded observation period, not an assertion that all dynamic work is idle.
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(directory, `${viewport.width}.png`), fullPage: true });
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const resources = performance.getEntriesByType("resource");
      return {
        ...window.__baseline,
        ttfbMs: navigation?.responseStart,
        documentLoadMs: navigation?.loadEventEnd,
        browserResourceCount: resources.length,
        observableTransferBytes: resources.reduce((total, item) => total + item.transferSize, 0),
        horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    results.push({ viewport, status: response?.status(), finalUrl: page.url(), browserRequests, blockedWrites, errors, metrics });
    await context.close();
  }
} finally {
  await browser.close();
  const timingLimit = mode === "development"
    ? "Development-server timings are not production performance."
    : "Production timings are single local laboratory samples, not field performance.";
  await writeFile(path.join(directory, "results.json"), JSON.stringify({
    target, mode, network, capturedAt: new Date().toISOString(),
    limitations: `Single samples with reduced motion and no scripted interaction; no authenticated fixtures. Cross-origin transfer sizes can be unavailable. Browser counts do not measure server/backend requests. ${timingLimit} Event timing and long-task fields are laboratory observations when supported, not field INP.`,
    results,
  }, null, 2) + "\n");
}
console.log(`Captured ${results.length} viewports in ${directory}`);
