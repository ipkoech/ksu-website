import { existsSync } from "node:fs";
import { join } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const base = process.cwd();
const requiredRoutes = [
  "src/app/(protected)/research/programs/[id]/page.tsx",
  "src/app/(protected)/research/themes/[id]/page.tsx",
  "src/app/(protected)/research/expertise-tags/[id]/page.tsx",
  "src/app/(protected)/research/outputs/[id]/page.tsx",
  "src/app/(protected)/research/innovations/[id]/page.tsx",
  "src/app/(protected)/research/impact/[id]/page.tsx",
];

for (const route of requiredRoutes) {
  assert(existsSync(join(base, route)), `Missing core research detail route: ${route}`);
}
