import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

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

function getInterfaceProperties(source, interfaceName) {
  const sourceFile = ts.createSourceFile("page-cms.ts", source, ts.ScriptTarget.Latest, true);
  const declaration = sourceFile.statements.find(
    (statement) => ts.isInterfaceDeclaration(statement) && statement.name.text === interfaceName,
  );
  assert(declaration, `Expected interface ${interfaceName}`);
  return new Map(
    declaration.members
      .filter(ts.isPropertySignature)
      .map((member) => [member.name.getText(sourceFile), member.type?.getText(sourceFile)]),
  );
}

function getConstStringValues(source, constantName) {
  const sourceFile = ts.createSourceFile("page-cms.ts", source, ts.ScriptTarget.Latest, true);
  const declaration = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => statement.declarationList.declarations)
    .find((item) => ts.isIdentifier(item.name) && item.name.text === constantName);
  assert(declaration?.initializer, `Expected ${constantName} declaration`);

  let initializer = declaration.initializer;
  while (ts.isAsExpression(initializer) || ts.isSatisfiesExpression(initializer)) {
    initializer = initializer.expression;
  }
  assert(ts.isArrayLiteralExpression(initializer), `${constantName} must be a string array`);
  return initializer.elements.map((element) => {
    assert(ts.isStringLiteral(element), `${constantName} must contain string values`);
    return element.text;
  });
}

const apiSource = read("lib/api/page-cms.ts");
for (const method of ["definitions", "searchSources", "previewPage", "validatePage", "reorderSections", "reorderItems"]) {
  assert(apiSource.includes(`${method}:`), `Expected Page CMS API method: ${method}`);
}
const canonicalSourceTypes = getConstStringValues(apiSource, "PAGE_CMS_SOURCE_TYPES");
const catalogSourceTypes = getConstStringValues(apiSource, "PAGE_CMS_CATALOG_SOURCE_TYPES");
assert(canonicalSourceTypes.includes("intake"), "Canonical source types must retain future layout references");
assert(
  JSON.stringify(catalogSourceTypes) === JSON.stringify(["programme", "news", "event", "person", "research_partner", "public_stat"]),
  "Only server-supported source types may use the catalog endpoint",
);

const previewItemProperties = getInterfaceProperties(apiSource, "PagePreviewItem");
for (const property of [
  "id",
  "page_section_id",
  "item_type",
  "source",
  "display_order",
  "is_enabled",
]) {
  assert(previewItemProperties.has(property), `Preview item must expose server field ${property}`);
}
assert(!previewItemProperties.has("revision"), "Preview item must not promise a revision absent from the server response");
const previewProperties = getInterfaceProperties(apiSource, "PageCmsPreview");
assert(previewProperties.get("sections") === "PagePreviewSection[]", "Preview sections must use the server preview section contract");
for (const property of ["page_key", "scope_type", "scope_id", "issues", "sections"]) {
  assert(previewProperties.has(property), `Preview response must expose server field ${property}`);
}
const previewSectionProperties = getInterfaceProperties(apiSource, "PagePreviewSection");
for (const property of ["workflow_status", "revision", "items", "media"]) {
  assert(previewSectionProperties.has(property), `Preview section must expose server field ${property}`);
}
assert(previewSectionProperties.get("items") === "PagePreviewItem[]", "Preview sections must contain preview items");
assert(previewSectionProperties.get("media") === "Record<string, PagePreviewMediaLink[]>", "Preview section media must preserve media-link groups");

const previewSource = ts.createSourceFile("page-cms.ts", apiSource, ts.ScriptTarget.Latest, true).statements.find(
  (statement) => ts.isInterfaceDeclaration(statement) && statement.name.text === "PagePreviewResolvedSource",
);
assert(
  previewSource?.heritageClauses?.some((clause) => clause.types.some((type) => type.expression.getText() === "PageCmsSourceSummary")),
  "Resolved preview sources must preserve the catalog source contract",
);

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
  "queryFn: ({ signal })",
  "{ signal }",
]) {
  assert(sourcePicker.includes(required), `Expected source picker behavior: ${required}`);
}
for (const forbidden of ["name=\"source_id\"", "name='source_id'", "placeholder=\"Source ID"] ) {
  assert(!sourcePicker.includes(forbidden), `Source picker must not expose raw source IDs: ${forbidden}`);
}

const pickerState = await importTypeScriptModule("components/page-cms/source-record-picker-state.ts");
assert(
  pickerState.isCatalogSearchableSourceType("programme", catalogSourceTypes),
  "Programme must be catalog searchable",
);
assert(
  !pickerState.isCatalogSearchableSourceType("intake", catalogSourceTypes),
  "Unsupported canonical source types must be rejected before catalog requests",
);

const selectionContext = {
  sourceType: "news",
  layoutVariant: "news_grid",
  scopeType: "school",
  scopeId: "school-a",
};
assert(
  pickerState.selectionMatchesContext({ ...selectionContext, selectionContext }, selectionContext),
  "A selection captured in the current context must remain valid",
);
assert(
  !pickerState.selectionMatchesContext(
    { ...selectionContext, selectionContext },
    { ...selectionContext, scopeId: "school-b" },
  ),
  "A selection captured for another scope must be invalidated",
);
assert(
  !pickerState.selectionMatchesContext(
    { ...selectionContext, selectionContext },
    { ...selectionContext, layoutVariant: "events_list" },
  ),
  "A selection captured for another layout must be invalidated",
);
assert(
  !pickerState.selectionMatchesContext(
    { ...selectionContext, selectionContext },
    { ...selectionContext, sourceType: "event" },
  ),
  "A selection captured for another source type must be invalidated",
);
assert(
  !pickerState.selectionMatchesContext({ ...selectionContext }, selectionContext),
  "Selections without captured context must fail closed",
);

const legacySelection = { sourceType: "news", sourceId: "legacy-news" };
const staleSelection = { ...legacySelection, selectionContext };
const staleScope = { ...selectionContext, scopeId: "school-b" };
const staleInvalidationKey = pickerState.selectionInvalidationKey(staleSelection, staleScope);
assert(staleInvalidationKey, "Stale controlled selections must produce an invalidation key");
assert(
  pickerState.shouldNotifySelectionInvalidation(staleSelection, staleScope, null),
  "A stale controlled selection must notify its owner once",
);
assert(
  !pickerState.shouldNotifySelectionInvalidation(staleSelection, staleScope, staleInvalidationKey),
  "The same stale controlled selection must not repeatedly notify its owner",
);
assert(
  pickerState.shouldNotifySelectionInvalidation(
    staleSelection,
    { ...staleScope, scopeId: "school-c" },
    staleInvalidationKey,
  ),
  "A context change must notify again when a parent retains a stale controlled selection",
);
assert(
  pickerState.shouldNotifySelectionInvalidation(legacySelection, selectionContext, null),
  "Legacy controlled selections without context must be cleared",
);
assert(
  !pickerState.shouldNotifySelectionInvalidation(
    { ...legacySelection, selectionContext },
    selectionContext,
    staleInvalidationKey,
  ),
  "A current controlled selection must not be cleared after an earlier invalidation",
);

const results = [
  { id: "unavailable", selectable: false },
  { id: "first", selectable: true },
  { id: "second", selectable: true },
  { id: "disabled", selectable: false },
];
assert(pickerState.nextSelectableIndex(results, -1, 1) === 1, "Initial focus must skip unavailable results");
assert(pickerState.nextSelectableIndex(results, 1, 1) === 2, "Down traversal must move to the next selectable result");
assert(pickerState.nextSelectableIndex(results, 2, 1) === 2, "Traversal must remain on the final selectable result");
assert(pickerState.nextSelectableIndex(results, 2, -1) === 1, "Up traversal must skip unavailable results");
assert(pickerState.nextSelectableIndex([{ id: "only", selectable: false }], -1, 1) === -1, "No active descendant is allowed when no result is selectable");

console.log("Page CMS picker contract checks passed.");
