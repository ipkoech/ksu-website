import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminRoot = path.resolve(__dirname, "../..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  const filePath = path.join(adminRoot, relativePath);
  assert(fs.existsSync(filePath), `Expected Page CMS picker file: ${relativePath}`);
  return fs.readFileSync(filePath, "utf8");
}

const apiSource = read("lib/api/page-cms.ts");
for (const method of ["definitions", "searchSources", "previewPage", "validatePage", "reorderSections", "reorderItems"]) {
  assert(apiSource.includes(`${method}:`), `Expected Page CMS API method: ${method}`);
}

const scopePicker = read("components/page-cms/page-scope-picker.tsx");
assert(scopePicker.includes("scopeLabel"), "Scope picker must return a user-facing scope label");
assert(scopePicker.includes("schoolRelationshipAdapter"), "Scope picker must use searchable school relationships");
assert(scopePicker.includes("researchCenterRelationshipAdapter"), "Scope picker must use searchable research relationships");
assert(scopePicker.includes("libraryBranchRelationshipAdapter"), "Scope picker must use searchable library relationships");
for (const forbidden of ["name=\"scope_id\"", "name='scope_id'", "placeholder=\"Scope ID"] ) {
  assert(!scopePicker.includes(forbidden), `Scope picker must not expose raw scope IDs: ${forbidden}`);
}

const sourcePicker = read("components/page-cms/source-record-picker.tsx");
assert(apiSource.includes('`/page-section-sources/${sourceType}`'), "Source picker must use the Page CMS source catalog route");
for (const required of [
  "pageCmsApi.searchSources(",
  "delay = 250",
  "role=\"combobox\"",
  "role=\"option\"",
  "secondary_label",
  "label",
  "selectable",
  "disabled={!source.selectable}",
  "aria-activedescendant",
  "Clear selected source",
]) {
  assert(sourcePicker.includes(required), `Expected source picker behavior: ${required}`);
}
for (const forbidden of ["name=\"source_id\"", "name='source_id'", "placeholder=\"Source ID"] ) {
  assert(!sourcePicker.includes(forbidden), `Source picker must not expose raw source IDs: ${forbidden}`);
}

console.log("Page CMS picker contract checks passed.");
