import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const [beforeFile, afterFile, outputFile] = process.argv.slice(2);
if (!beforeFile || !afterFile || !outputFile) {
  throw new Error(
    "Usage: node scripts/compare-performance.mjs BEFORE_RESULTS_JSON AFTER_RESULTS_JSON OUTPUT_JSON",
  );
}

const before = JSON.parse(await readFile(path.resolve(beforeFile), "utf8"));
const after = JSON.parse(await readFile(path.resolve(afterFile), "utf8"));
const beforeByViewport = new Map(
  (before.results ?? []).map((item) => [
    `${item.viewport?.width}x${item.viewport?.height}`,
    item,
  ]),
);

const metrics = [
  ["lcp", "lcpMs"],
  ["ttfbMs", "ttfbMs"],
  ["documentLoadMs", "documentLoadMs"],
  ["browserRequests", "browserRequests"],
  ["browserResourceCount", "browserResourceCount"],
  ["observableTransferBytes", "observableTransferBytes"],
  ["cls", "cls"],
  ["inp", "inpMs"],
  ["longTaskCount", "longTaskCount"],
  ["longTaskMaxMs", "longTaskMaxMs"],
];

function number(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function round(value) {
  return value === null ? null : Math.round(value * 1000) / 1000;
}

const comparisons = (after.results ?? []).map((item) => {
  const viewport = `${item.viewport?.width}x${item.viewport?.height}`;
  const original = beforeByViewport.get(viewport);
  const beforeMetrics = original?.metrics ?? {};
  const afterMetrics = item.metrics ?? {};
  const deltas = {};
  for (const [key, outputKey] of metrics) {
    const beforeValue = number(
      key === "lcp"
        ? beforeMetrics.lcp
        : key === "browserRequests"
          ? original?.browserRequests
          : beforeMetrics[key],
    );
    const afterValue = number(
      key === "lcp"
        ? afterMetrics.lcp
        : key === "browserRequests"
          ? item.browserRequests
          : afterMetrics[key],
    );
    deltas[outputKey] = {
      before: beforeValue,
      after: afterValue,
      absolute: beforeValue === null || afterValue === null ? null : round(afterValue - beforeValue),
      percent: beforeValue === null || afterValue === null || beforeValue === 0
        ? null
        : round(((afterValue - beforeValue) / beforeValue) * 100),
    };
  }
  return { viewport, beforeTarget: before.target, afterTarget: after.target, deltas };
});

const report = {
  capturedAt: new Date().toISOString(),
  before: { file: path.resolve(beforeFile), mode: before.mode, network: before.network },
  after: { file: path.resolve(afterFile), mode: after.mode, network: after.network },
  comparisons,
  limitations: [
    "Single local laboratory samples at each viewport; this is not field LCP/INP/CLS data.",
    "Browser resource and transfer counts do not measure server or backend requests.",
    "The captures use reduced motion and no authenticated fixture.",
    "Comparisons are meaningful only for the same route, viewport and deployment mode.",
  ],
};

await writeFile(path.resolve(outputFile), JSON.stringify(report, null, 2) + "\n", {
  flag: "wx",
});
console.log(`Compared ${comparisons.length} viewport captures.`);
