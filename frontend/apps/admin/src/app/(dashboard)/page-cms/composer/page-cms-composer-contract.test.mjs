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
const inspectorSource = fs.readFileSync(path.join(adminRoot, "components/page-cms/section-inspector.tsx"), "utf8");

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
  "pageSectionsApi.update(",
  "SectionInspector",
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

for (const requiredSnippet of [
  "definitions.find",
  "onSave={handleSectionSave}",
  "onDirtyChange={setIsFormDirty}",
  "readOnly={!canUpdate}",
  "isReloadRequiredConflict(requestError)",
]) {
  assert(composerSource.includes(requiredSnippet), `Expected inspector persistence behavior: ${requiredSnippet}`);
}
assert(!composerSource.includes("Editor slot"), "Composer must mount the typed inspector instead of a placeholder");
assert(!composerSource.includes("Save section <ExternalLink"), "Composer must not route primary editing through the legacy generic editor");
assert(inspectorSource.includes("onSave"), "Inspector must receive the composer save callback");

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
assert(state.isScopeComplete({ scopeType: "university", scopeId: null }), "University is a complete scope without a relationship");
assert(!state.isScopeComplete({ scopeType: "research", scopeId: null }), "Research cannot load before a relationship is selected");
assert(!state.isScopeComplete({ scopeType: "library", scopeId: null }), "Library cannot load before a relationship is selected");
assert(state.isScopeComplete({ scopeType: "research", scopeId: "research-1" }), "Research becomes complete after a relationship is selected");

const sequence = state.createRequestSequence();
const firstRequest = sequence.begin();
const secondRequest = sequence.begin();
assert(firstRequest.signal.aborted, "starting a new composition load aborts the older request");
assert(!sequence.isCurrent(firstRequest.id), "older composition responses are stale");
assert(sequence.isCurrent(secondRequest.id), "only the newest composition response may update state");
sequence.cancel();
assert(!sequence.isCurrent(secondRequest.id), "cancelling invalidates an in-flight composition response");

assert(state.validationDisplayState({ validation: null, isLoading: false, error: null }) === "unvalidated", "validation begins unvalidated");
assert(state.validationDisplayState({ validation: null, isLoading: true, error: null }) === "loading", "validation reports loading while the request is active");
assert(state.validationDisplayState({ validation: null, isLoading: false, error: "failed" }) === "error", "validation reports request failures");
assert(state.validationDisplayState({ validation: { issues: [] }, isLoading: false, error: null }) === "validated", "only a successful response is validated");

const permissionSet = new Set(["page_sections.create"]);
const capabilities = state.composerCapabilities((permissions) => permissions.some((permission) => permissionSet.has(permission)));
assert(capabilities.canCreate, "create permission enables section creation");
assert(!capabilities.canUpdate, "create permission does not enable section editing");
assert(state.shouldConfirmComposerNavigation({
  dirty: true,
  href: "https://admin.example.test/page-cms",
  currentOrigin: "https://admin.example.test",
  button: 0,
}), "a dirty primary-click internal link requires confirmation");
assert(!state.shouldConfirmComposerNavigation({
  dirty: true,
  href: "https://admin.example.test/page-cms",
  currentOrigin: "https://admin.example.test",
  button: 0,
  ctrlKey: true,
}), "modifier-click navigation remains browser controlled");
assert(!state.shouldConfirmComposerNavigation({
  dirty: true,
  href: "https://external.example.test/page-cms",
  currentOrigin: "https://admin.example.test",
  button: 0,
}), "external navigation is not intercepted by the composer");

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
