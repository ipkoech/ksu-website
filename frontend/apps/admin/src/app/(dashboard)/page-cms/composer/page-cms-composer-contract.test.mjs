import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const composerRoot = path.resolve(__dirname);
const adminRoot = path.resolve(__dirname, "../../../..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  const filePath = path.join(composerRoot, relativePath);
  assert(fs.existsSync(filePath), `Expected composer file: ${relativePath}`);
  return fs.readFileSync(filePath, "utf8");
}

async function importTypeScriptModule(relativePath) {
  const source = read(relativePath);
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(output).toString("base64")}`);
}

const pageSource = read("page.tsx");
const routeSource = read("[pageKey]/page.tsx");
const composerSource = read("[pageKey]/client-page.tsx");
const templatePickerSource = fs.readFileSync(path.join(adminRoot, "components/page-cms/section-template-picker.tsx"), "utf8");
const completenessSource = fs.readFileSync(path.join(adminRoot, "components/page-cms/completeness-panel.tsx"), "utf8");

assert(pageSource.includes("/page-cms/composer/homepage"), "Composer entry route must open the homepage composition");
assert(routeSource.includes("ComposerClientPage"), "Page-key route must render the client composer");

for (const requiredSnippet of [
  "PageScopePicker",
  "SortableSectionOutline",
  "pageCmsApi.getPage(",
  "pageCmsApi.definitions(",
  "pageCmsApi.validatePage(",
  "pageCmsApi.previewPage(",
  "pageCmsApi.reorderSections(",
  "pageSectionsApi.create(",
  "pageSectionsApi.workflow(",
  "scope_type",
  "scope_id",
  "section",
  "router.replace(",
  "beforeunload",
  "Save Order",
  "Page outline",
  "Section editor",
  "Validation",
  "Preview",
  "Reload required",
  "page_sections.publish",
  "page_sections.manage",
  "homepage.publish",
  "sticky bottom-0",
]) {
  assert(composerSource.includes(requiredSnippet), `Expected composer behavior: ${requiredSnippet}`);
}

assert(!/Scope ID|scope ID|scope_id[^\n]{0,90}placeholder/i.test(composerSource), "Composer must not expose raw scope IDs");

for (const requiredSnippet of [
  "pageCmsApi.definitions(",
  "supportsPageScope",
  "allowedScopes",
  "onSelect",
  "Create section",
]) {
  assert(templatePickerSource.includes(requiredSnippet), `Expected template picker behavior: ${requiredSnippet}`);
}

for (const requiredSnippet of [
  "PageCmsValidationResult",
  "role=\"alert\"",
  "blocking",
  "No validation issues",
]) {
  assert(completenessSource.includes(requiredSnippet), `Expected completeness behavior: ${requiredSnippet}`);
}

const state = await importTypeScriptModule("composer-state.ts");
assert(
  state.composerHref("homepage", { scopeType: "school", scopeId: "school-1", sectionId: "section-1" })
    === "/page-cms/composer/homepage?scope_type=school&scope_id=school-1&section=section-1",
  "Composer URLs must preserve scope and selected section",
);
assert(
  state.composerHref("homepage", { scopeType: "university", scopeId: null, sectionId: null })
    === "/page-cms/composer/homepage?scope_type=university",
  "University URLs must omit empty scope and selection values",
);

const definitions = [
  { key: "hero_admissions", allowed_scopes: ["university", "school"] },
  { key: "research_cards", allowed_scopes: ["research"] },
];
assert(
  state.filterDefinitionsForScope(definitions, "school").map((definition) => definition.key).join(",") === "hero_admissions",
  "Only definitions supported by the active scope may be created",
);
assert(
  state.createSectionPayloadFromDefinition({ key: "hero_admissions" }, {
    pageKey: "homepage",
    scopeType: "school",
    scopeId: "school-1",
    nextDisplayOrder: 30,
  }).layout_variant === "hero_admissions",
  "New sections must use the backend definition variant",
);
assert(
  state.isReloadRequiredConflict({ response: { status: 409 } }),
  "HTTP 409 must require a reload rather than overwrite local work",
);
assert(!state.isReloadRequiredConflict({ response: { status: 500 } }), "Only HTTP 409 is a reload-required conflict");

console.log("Page CMS composer contract checks passed.");
