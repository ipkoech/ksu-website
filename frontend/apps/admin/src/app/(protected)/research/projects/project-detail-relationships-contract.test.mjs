import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const source = readFileSync(join(process.cwd(), "src/app/(protected)/research/projects/[slug]/page.tsx"), "utf8");

assert(
  !source.includes("projectRelations.impactMetrics.list"),
  "Project detail must not call the direct impact-metrics relationship endpoint; use the filterable list API or aggregate detail payload.",
);

assert(
  !source.includes("projectRelations.impactStories.list"),
  "Project detail must not call the direct impact-stories relationship endpoint; use the filterable list API or aggregate detail payload.",
);

assert(
  !source.includes("auditResourceTypes="),
  "Project detail must not render the audit history section.",
);

for (const resource of ["publications", "outputs", "innovations", "impactMetrics", "stories"]) {
  assert(
    source.includes(`${resource}.list({`) && source.includes("fields:"),
    `${resource} relationship fetches should request only display fields.`,
  );
}

assert(
  source.includes('defaultValue="relationships"'),
  "Project detail tabs should open on the relationship mapping workspace.",
);
