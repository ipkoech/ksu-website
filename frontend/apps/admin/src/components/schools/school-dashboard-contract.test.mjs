import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const dashboard = await readFile(path.join(root, "dashboard/school-dashboard.tsx"), "utf8");
const chart = await readFile(path.join(root, "dashboard/school-trend-chart.tsx"), "utf8");
const page = await readFile(path.join(root, "../../app/(protected)/schools/page.tsx"), "utf8");

for (const range of ["7d", "30d", "90d", "12m"]) {
  assert.match(dashboard, new RegExp(`"${range}"`), `Dashboard must support ${range}.`);
}
for (const section of [
  "summary_cards",
  "distributions",
  "attention_items",
  "recent_activity",
  "quick_links",
  "profile_completeness",
]) {
  assert.match(dashboard, new RegExp(section), `Dashboard must render ${section}.`);
}
assert.match(chart, /aria-label=/, "Trend charts must have an accessible summary.");
assert.match(chart, /<svg/, "Trend data must be visualized.");
assert.match(dashboard, /SchoolDashboard/, "Dashboard component must be exported.");
assert.match(page, /<SchoolDashboard\s*\/>/, "The schools index must use the operational dashboard.");
