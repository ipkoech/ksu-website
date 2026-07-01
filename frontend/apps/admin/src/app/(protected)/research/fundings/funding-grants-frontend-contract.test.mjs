import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const grantsListSource = readFileSync(join(root, "src/app/(protected)/research/grants/page.tsx"), "utf8");
const grantDetailSource = readFileSync(join(root, "src/app/(protected)/research/grants/[slug]/page.tsx"), "utf8");
const funderDetailSource = readFileSync(join(root, "src/app/(protected)/research/fundings/funders/[id]/page.tsx"), "utf8");
const apiSource = readFileSync(join(root, "../../packages/api-client/src/research/index.ts"), "utf8");
const editableResourceSource = readFileSync(join(root, "src/components/dashboard/editable-service-resource-page.tsx"), "utf8");
const applicationsSource = readFileSync(join(root, "src/app/(protected)/research/fundings/applications/page.tsx"), "utf8");
const reportsSource = readFileSync(join(root, "src/app/(protected)/research/fundings/reports/page.tsx"), "utf8");
const guidelinesSource = readFileSync(join(root, "src/app/(protected)/research/fundings/guidelines/page.tsx"), "utf8");
const endowmentsSource = readFileSync(join(root, "src/app/(protected)/research/fundings/endowments/page.tsx"), "utf8");

assert(
  grantsListSource.includes('name: "funder_id"') &&
    grantsListSource.includes('adapter: "researchFunder"') &&
    grantsListSource.includes("funder_id: values.funder_id || null"),
  "Grants listing/editing should use funder_id through the readable researchFunder selector.",
);

assert(
  apiSource.includes("grantRelations") &&
    apiSource.includes("funderRelations") &&
    apiSource.includes("/api/v1/grants/id/${grantId}/${relation}") &&
    apiSource.includes("/api/v1/funders/id/${funderId}/${relation}"),
  "Research API client should expose grant and funder relationship endpoints.",
);

assert(
  grantDetailSource.includes("GrantDetailActions") &&
    grantDetailSource.includes("GrantEditSheet") &&
    grantDetailSource.includes("researchServiceApi.grantRelations.projects.list") &&
    grantDetailSource.includes("researchServiceApi.grantRelations.themes.add") &&
    grantDetailSource.includes('adapter={relationshipAdapters.researchFunder') &&
    grantDetailSource.includes("RichTextEditor") &&
    grantDetailSource.includes("MediaPicker") &&
    !grantDetailSource.includes('label: "Endowments"'),
  "Grant detail should use the final design: inline actions, edit sheet, readable funder selector, media, and backend-aligned relationships without endowments.",
);

assert(
  funderDetailSource.includes("researchServiceApi.funderRelations.grants.list") &&
    funderDetailSource.includes("researchServiceApi.funderRelations.projects.list") &&
    !funderDetailSource.includes("search = String(funder.name"),
  "Funder detail should use real backend relationship endpoints instead of name-searching grants.",
);

assert(
  editableResourceSource.includes('"entity-multi"') &&
    editableResourceSource.includes("MultiEntityPicker") &&
    editableResourceSource.includes("field.type === \"entity-multi\""),
  "Editable resource forms should support readable multi-attachment media selectors.",
);

for (const [label, source] of [
  ["applications", applicationsSource],
  ["reports", reportsSource],
  ["endowments", endowmentsSource],
]) {
  assert(
    source.includes('name: "attachment_media_ids"') &&
      source.includes('type: "entity-multi"') &&
      source.includes('adapter: "media"'),
    `${label} forms should use readable media multi-select for file attachments.`,
  );
}

assert(
  guidelinesSource.includes('name: "document_id"') &&
    guidelinesSource.includes('type: "media"') &&
    guidelinesSource.includes('uploadRole: "grant-guideline-document"'),
  "Grant guideline creation should use the media picker for guideline documents.",
);
