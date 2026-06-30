import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const base = process.cwd();
const requiredRoutes = [
  "src/app/(protected)/research/farm/projects/[slug]/page.tsx",
  "src/app/(protected)/research/farm/partnerships/[slug]/page.tsx",
  "src/app/(protected)/research/farm/activities/[id]/page.tsx",
  "src/app/(protected)/research/farm/impact-stories/[slug]/page.tsx",
  "src/app/(protected)/research/farm/focus-areas/[slug]/page.tsx",
];

const requiredListLinks = [
  ["src/app/(protected)/research/farm/projects/page.tsx", "/research/farm/projects"],
  ["src/app/(protected)/research/farm/partnerships/page.tsx", "/research/farm/partnerships"],
  ["src/app/(protected)/research/farm/activities/page.tsx", "/research/farm/activities/"],
  ["src/app/(protected)/research/farm/impact-stories/page.tsx", "/research/farm/impact-stories"],
  ["src/app/(protected)/research/farm/focus-areas/page.tsx", "/research/farm/focus-areas"],
];

for (const route of requiredRoutes) {
  assert(existsSync(join(base, route)), `Missing farm detail route: ${route}`);
}

for (const [route, href] of requiredListLinks) {
  const source = readFileSync(join(base, route), "utf8");
  assert(
    (source.includes("detailBaseHref") || source.includes("detailHref") || source.includes("getRecordDetailHref")) &&
      source.includes(href),
    `Missing farm detail href wiring for ${route}`,
  );
}
