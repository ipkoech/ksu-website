import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const defaultContractsRoot = path.basename(process.cwd()) === "frontend"
  ? path.join(process.cwd(), "contracts")
  : path.join(process.cwd(), "frontend", "contracts");
const contractsRoot = path.resolve(
  process.argv[2] ?? defaultContractsRoot,
);
const productionRoot = path.join(contractsRoot, "frontend-after-20260907");
const expectedArtifacts = [
  "web-home-production-current",
  "research-projects-production-current",
  "library-home-production-current",
  "heri-home-production-current",
];
const requiredViewports = new Set(["1440x1000", "390x844"]);

function fail(message) {
  throw new Error(`Performance evidence check failed: ${message}`);
}

function finite(value, label, file) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(`${file}: ${label} must be a finite number`);
  }
}

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    fail(`${file}: invalid JSON (${error instanceof Error ? error.message : String(error)})`);
  }
}

for (const artifact of expectedArtifacts) {
  const file = path.join(productionRoot, artifact, "results.json");
  const payload = await readJson(file);
  if (payload.mode !== "production") fail(`${file}: mode must be production`);
  if (payload.network !== "normal") fail(`${file}: expected the normal-network production capture`);
  if (typeof payload.limitations !== "string" || payload.limitations.includes("Development timings")) {
    fail(`${file}: limitations must describe production laboratory timings`);
  }
  if (!Array.isArray(payload.results) || payload.results.length < requiredViewports.size) {
    fail(`${file}: expected at least desktop and mobile viewport results`);
  }

  const seen = new Set();
  for (const result of payload.results) {
    const viewport = `${result.viewport?.width}x${result.viewport?.height}`;
    seen.add(viewport);
    if (result.status !== 200) fail(`${file}: ${viewport} returned HTTP ${result.status}`);
    if (!Array.isArray(result.errors) || result.errors.length > 0) {
      fail(`${file}: ${viewport} reported browser errors`);
    }
    if (result.metrics?.horizontalOverflow !== false) {
      fail(`${file}: ${viewport} reported horizontal overflow`);
    }
    finite(result.metrics?.lcp, `${viewport}.metrics.lcp`, file);
    finite(result.metrics?.ttfbMs, `${viewport}.metrics.ttfbMs`, file);
    finite(result.metrics?.documentLoadMs, `${viewport}.metrics.documentLoadMs`, file);
    finite(result.metrics?.cls, `${viewport}.metrics.cls`, file);
    finite(result.browserRequests, `${viewport}.browserRequests`, file);
    finite(result.metrics?.browserResourceCount, `${viewport}.metrics.browserResourceCount`, file);
    finite(result.metrics?.observableTransferBytes, `${viewport}.metrics.observableTransferBytes`, file);
  }
  for (const viewport of requiredViewports) {
    if (!seen.has(viewport)) fail(`${file}: missing required viewport ${viewport}`);
  }
}

const entries = await readdir(contractsRoot, { withFileTypes: true });
const comparisonFiles = entries
  .filter((entry) => entry.isFile() && entry.name.startsWith("frontend-performance-") && entry.name.endsWith(".json"))
  .map((entry) => path.join(contractsRoot, entry.name));
if (comparisonFiles.length === 0) fail(`no before/after performance comparison artifacts found in ${contractsRoot}`);

for (const file of comparisonFiles) {
  const report = await readJson(file);
  if (report.before?.mode !== report.after?.mode) fail(`${file}: before/after deployment modes differ`);
  if (report.before?.network !== report.after?.network) fail(`${file}: before/after network profiles differ`);
  if (!Array.isArray(report.comparisons) || report.comparisons.length < requiredViewports.size) {
    fail(`${file}: expected desktop and mobile comparison rows`);
  }
  const requiresTablet = /(?:research-projects|library-home)-production-/.test(path.basename(file));
  const comparisonViewports = new Set(report.comparisons.map((comparison) => comparison.viewport));
  if (requiresTablet && !comparisonViewports.has("768x1024")) {
    fail(`${file}: production Research/Library comparison must include the tablet viewport`);
  }
  for (const comparison of report.comparisons) {
    if (!requiredViewports.has(comparison.viewport)) continue;
    for (const key of ["lcpMs", "ttfbMs", "documentLoadMs", "cls", "browserRequests"]) {
      const delta = comparison.deltas?.[key];
      if (!delta || typeof delta.before !== "number" || typeof delta.after !== "number") {
        fail(`${file}: ${comparison.viewport} is missing numeric ${key} before/after values`);
      }
    }
  }
}

console.log(
  `Validated ${expectedArtifacts.length} current production captures and ${comparisonFiles.length} before/after reports.`,
);
