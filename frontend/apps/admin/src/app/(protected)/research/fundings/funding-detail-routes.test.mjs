import { existsSync } from "node:fs";
import { join } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const base = process.cwd();
const requiredRoutes = [
  "src/app/(protected)/research/fundings/applications/[id]/page.tsx",
  "src/app/(protected)/research/fundings/reviews/[id]/page.tsx",
  "src/app/(protected)/research/fundings/reports/[id]/page.tsx",
  "src/app/(protected)/research/fundings/guidelines/[id]/page.tsx",
  "src/app/(protected)/research/fundings/funders/[id]/page.tsx",
  "src/app/(protected)/research/fundings/endowments/[id]/page.tsx",
];

for (const route of requiredRoutes) {
  assert(existsSync(join(base, route)), `Missing funding detail route: ${route}`);
}
