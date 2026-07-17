import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const [studio, editor, workflow, uploader, publications, registry, route] =
  await Promise.all([
    "content/school-content-studio.tsx",
    "content/content-editor-sheet.tsx",
    "content/content-workflow-panel.tsx",
    "media/media-batch-uploader.tsx",
    "publications/school-publications-page.tsx",
    "../../lib/portals/registry.ts",
    "../../app/(protected)/schools/[resource]/page.tsx",
  ].map((file) => readFile(path.join(root, file), "utf8")));

for (const type of ["news", "event", "story", "announcement", "calendar_entry", "gallery_link", "document", "download"]) {
  assert.match(studio, new RegExp(`"${type}"`), `Content studio must support ${type}.`);
}
assert.match(editor, /localStorage/, "Editor must autosave local recovery.");
assert.match(editor, /Save to server/, "Server save must remain explicit.");
assert.match(editor, /rich_text/, "Editor must support rich text content.");
assert.match(editor, /MediaPicker/, "Editor must preview/select media and documents.");
assert.match(workflow, /submit|withdraw/, "Workflow controls must support submission and withdrawal.");
assert.match(workflow, /revision_notes|rejection_reason/, "CoCMS feedback must be prominent.");
assert.match(workflow, /contentWorkflowApi\.logs/, "Workflow history must load from the server.");
assert.match(uploader, /multiple/, "Media uploader must accept concurrent files.");
assert.match(uploader, /Promise\.allSettled/, "Media uploads must be concurrent and isolated.");
assert.match(uploader, /retry|Progress|display_order/i, "Uploader needs retry, progress and ordering.");
assert.match(publications, /department_id/, "Publication authoring must associate a department.");
assert.match(publications, /submit|withdraw|reviewer_comments/, "Publication review workflow must be visible.");
assert.doesNotMatch(registry, /School Profiles/, "Obsolete generic school profile navigation must be removed.");
assert.doesNotMatch(registry, /School Validation/, "Obsolete validation navigation must be removed.");
for (const resource of ["content", "media", "publications"]) {
  assert.match(route, new RegExp(`case "${resource}"`), `Route must render ${resource}.`);
}
