import { existsSync, readFileSync } from "node:fs";
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
  const path = join(base, route);
  assert(existsSync(path), `Missing funding detail route: ${route}`);
  assert(!readFileSync(path, "utf8").includes("auditResourceTypes"), `Funding detail route should not render audit history: ${route}`);
}
