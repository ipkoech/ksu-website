import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();

const pages = [
  "centers/page.tsx",
  "programs/page.tsx",
  "themes/page.tsx",
  "expertise-tags/page.tsx",
  "innovations/page.tsx",
  "impact/page.tsx",
  "settings/general/page.tsx",
  "settings/services/page.tsx",
  "settings/resources/page.tsx",
  "settings/guidelines/page.tsx",
];

for (const page of pages) {
  const source = readFileSync(join(root, "src/app/(protected)/research", page), "utf8");
  assert(source.includes("listFilters="), `${page} must define prompt-level filters.`);
  assert(source.includes("recordColumns="), `${page} must define prompt-level columns.`);
  assert(source.includes("StatusBadge"), `${page} must surface operational status.`);
  assert(!source.includes('label: "UUID"'), `${page} must not expose raw UUID fields.`);
}

for (const page of [
  "centers/page.tsx",
  "programs/page.tsx",
  "innovations/page.tsx",
  "settings/general/page.tsx",
  "settings/services/page.tsx",
  "settings/resources/page.tsx",
  "settings/guidelines/page.tsx",
]) {
  const source = readFileSync(join(root, "src/app/(protected)/research", page), "utf8");
  assert(source.includes('editorMode="sheet"'), `${page} must use a side sheet for complex records.`);
}
