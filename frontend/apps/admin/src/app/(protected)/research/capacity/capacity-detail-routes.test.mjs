import { existsSync } from "node:fs";
import { join } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const base = process.cwd();
const requiredRoutes = [
  "src/app/(protected)/research/capacity/training/[id]/page.tsx",
  "src/app/(protected)/research/capacity/mentorship/[id]/page.tsx",
  "src/app/(protected)/research/capacity/mentorship-applications/[id]/page.tsx",
  "src/app/(protected)/research/capacity/mentorship-matches/[id]/page.tsx",
  "src/app/(protected)/research/capacity/scholarships/[id]/page.tsx",
  "src/app/(protected)/research/capacity/scholarship-applications/[id]/page.tsx",
  "src/app/(protected)/research/capacity/consultancies/[id]/page.tsx",
];

for (const route of requiredRoutes) {
  assert(existsSync(join(base, route)), `Missing capacity detail route: ${route}`);
}
