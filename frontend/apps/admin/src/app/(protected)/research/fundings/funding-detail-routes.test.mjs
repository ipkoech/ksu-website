import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const base = process.cwd();
const fundingWorkspaceSource = readFileSync(join(base, "src/app/(protected)/research/fundings/_components/funding-workspace.tsx"), "utf8");
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
  const source = readFileSync(path, "utf8");
  assert(existsSync(path), `Missing funding detail route: ${route}`);
  assert(!source.includes("auditResourceTypes"), `Funding detail route should not render audit history: ${route}`);
  assert(source.includes("...FundingDetailChrome("), `Funding detail route should use action-first Funding detail chrome: ${route}`);
}

assert(
  fundingWorkspaceSource.includes("function FundingDetailChrome") &&
    fundingWorkspaceSource.includes("hideHeader: true") &&
    fundingWorkspaceSource.includes("showBackAction: false") &&
    fundingWorkspaceSource.includes("showDetailGuide: false") &&
    fundingWorkspaceSource.includes("actionsSlot") &&
    fundingWorkspaceSource.includes('className="ml-auto"'),
  "FundingDetailChrome should provide the Projects-style detail header props.",
);
