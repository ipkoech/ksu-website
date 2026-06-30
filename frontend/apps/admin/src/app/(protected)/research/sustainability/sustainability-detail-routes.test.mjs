import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const base = process.cwd();
const requiredRoutes = [
  "src/app/(protected)/research/sustainability/partners/[slug]/page.tsx",
  "src/app/(protected)/research/sustainability/activities/[id]/page.tsx",
];

const requiredListLinks = [
  ["src/app/(protected)/research/sustainability/partners/page.tsx", "/research/sustainability/partners"],
  ["src/app/(protected)/research/sustainability/activities/page.tsx", "/research/sustainability/activities/"],
];

for (const route of requiredRoutes) {
  assert(existsSync(join(base, route)), `Missing sustainability detail route: ${route}`);
}

for (const [route, href] of requiredListLinks) {
  const source = readFileSync(join(base, route), "utf8");
  assert(
    (source.includes("detailBaseHref") || source.includes("getRecordDetailHref")) &&
      source.includes(href),
    `Missing sustainability detail href wiring for ${route}`,
  );
}
