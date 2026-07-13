import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const editor = fs.readFileSync(
  path.join(root, "components/dashboard/editable-service-resource-page.tsx"),
  "utf8",
);
const portalPage = fs.readFileSync(
  path.join(root, "components/portals/portal-resource-page.tsx"),
  "utf8",
);
const portalTypes = fs.readFileSync(path.join(root, "lib/portals/types.ts"), "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(
  editor.includes("viewInEditor?: boolean"),
  "Expected the generic editor to expose an opt-in view-in-editor setting",
);
assert(
  editor.includes('editorIntent === "view"') && editor.includes("startView(record)"),
  "Expected a distinct read-only view intent and action",
);
assert(
  (editor.match(/openInEditor=\{viewInEditor\}/g) ?? []).length >= 2 &&
    (editor.match(/\(viewInEditor \|\| getRecordDetailHref\?\.\(record\)\)/g) ?? []).length >= 3,
  "Expected every default and custom record-row branch to open the opt-in view dialog",
);
assert(
  editor.includes('resolvedEditorMode = viewInEditor ? "dialog"'),
  "Expected the opt-in workflow to force the shared dialog shell",
);
assert(
  editor.includes('editorIntent === "view" ? "View Record"'),
  "Expected the shared dialog to identify view mode",
);
assert(
  editor.includes('editorIntent === "view" ? "Close"') &&
    editor.includes("onEdit"),
  "Expected view mode to close or transition to edit in place",
);
assert(
  editor.includes("readOnly={editorIntent === \"view\"}"),
  "Expected view mode fields to be explicitly read-only",
);
assert(
  editor.includes('field.type === "entity" && field.relation') &&
    editor.includes("adapter={relationshipAdapters[field.relation.adapter]") &&
    editor.includes("disabled"),
  "Expected read-only entity fields to resolve labels through relationship adapters",
);
assert(
  editor.includes('field.type === "entity-record" && field.entityRecord') &&
    editor.includes("recordRequired === false") &&
    editor.includes("selectedConfig.label"),
  "Expected entity-record views to resolve owner labels and handle University without a lookup",
);
assert(
  portalTypes.includes("viewInEditor?: boolean"),
  "Expected portal resource configuration to expose the opt-in",
);
assert(
  portalPage.includes("viewInEditor={scopedResource.viewInEditor}"),
  "Expected PortalResourcePage to pass the opt-in to the generic editor",
);

console.log("editable service resource dialog contract passed");
