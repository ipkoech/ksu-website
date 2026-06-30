import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const base = process.cwd();
const requiredRoutes = [
  "src/app/(protected)/research/content/news/[id]/page.tsx",
  "src/app/(protected)/research/content/blogs/[id]/page.tsx",
  "src/app/(protected)/research/content/events/[id]/page.tsx",
  "src/app/(protected)/research/content/announcements/[id]/page.tsx",
  "src/app/(protected)/research/content/sliders/[id]/page.tsx",
];

const requiredListLinks = [
  ["src/app/(protected)/research/content/news/page.tsx", "/research/content/news/"],
  ["src/app/(protected)/research/content/blogs/page.tsx", "/research/content/blogs/"],
  ["src/app/(protected)/research/content/events/page.tsx", "/research/content/events/"],
  ["src/app/(protected)/research/content/announcements/page.tsx", "/research/content/announcements/"],
  ["src/app/(protected)/research/content/sliders/page.tsx", "/research/content/sliders/"],
];

for (const route of requiredRoutes) {
  assert(existsSync(join(base, route)), `Missing research content detail route: ${route}`);
}

for (const [route, href] of requiredListLinks) {
  const source = readFileSync(join(base, route), "utf8");
  assert(
    source.includes("getRecordDetailHref") && source.includes(href),
    `Missing detail href wiring for ${route}`,
  );
}
