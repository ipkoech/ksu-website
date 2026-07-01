import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const centerSource = readFileSync(join(root, "src/app/(protected)/research/centers/page.tsx"), "utf8");
const programSource = readFileSync(join(root, "src/app/(protected)/research/programs/page.tsx"), "utf8");

const expectedCenterFields = [
  "id",
  "name",
  "slug",
  "code",
  "acronym",
  "center_type",
  "status",
  "is_active",
  "is_featured",
].join(",");

const expectedProgramFields = [
  "id",
  "name",
  "slug",
  "code",
  "status",
  "is_active",
  "is_featured",
].join(",");

assert(
  centerSource.includes(`const CENTER_LIST_FIELDS = "${expectedCenterFields}"`) &&
    centerSource.includes("listParams={{ fields: CENTER_LIST_FIELDS }}"),
  "Research centers listing should use backend field selection with slim display fields.",
);

assert(
  programSource.includes(`const PROGRAM_LIST_FIELDS = "${expectedProgramFields}"`) &&
    programSource.includes("listParams={{ fields: PROGRAM_LIST_FIELDS }}"),
  "Research programs listing should use backend field selection with slim display fields.",
);

for (const [label, source] of [
  ["centers", centerSource],
  ["programs", programSource],
]) {
  assert(
    !source.includes("PublicationRelationCell") &&
      !source.includes("adapterKey=") &&
      !source.includes("formatPublicationDate") &&
      !source.includes('key: "director"') &&
      !source.includes('key: "department"') &&
      !source.includes('key: "lead"') &&
      !source.includes('key: "dates"'),
    `${label} listing rows should not request relationship/date fields for display-only tables.`,
  );
}
