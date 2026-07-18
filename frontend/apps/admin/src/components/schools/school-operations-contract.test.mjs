import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => readFile(path.join(root, name), "utf8");
const [team, sheet, teamImport, departments, programmes, academicImport, route, workspace, publications, content, media, inquiries, audit, dashboard] =
  await Promise.all([
    read("team/school-team-page.tsx"),
    read("team/team-member-sheet.tsx"),
    read("team/team-import-dialog.tsx"),
    read("academics/school-departments-page.tsx"),
    read("academics/school-programmes-page.tsx"),
    read("imports/school-import-dialog.tsx"),
    read("../../app/(protected)/schools/[resource]/page.tsx"),
    read("shared/school-workspace.tsx"),
    read("publications/school-publications-page.tsx"),
    read("content/school-content-studio.tsx"),
    read("media/media-batch-uploader.tsx"),
    read("inquiries/school-inquiry-inbox.tsx"),
    read("audit/school-audit-page.tsx"),
    read("dashboard/school-dashboard.tsx"),
  ]);

for (const group of [
  "Leadership",
  "CODs & Coordinators",
  "Administrative Staff",
  "Lecturers",
  "Support Staff",
]) {
  assert.match(team, new RegExp(group), `Team must group ${group}.`);
}
assert.match(team, /useSearchParams/, "Team filters must be URL-addressable.");
assert.match(sheet, /replacement_person_id|acknowledge_vacancy/, "Leadership lifecycle safeguards are required.");
assert.match(sheet, /schoolPortalApi\.team/, "Team mutations must use scoped portal endpoints.");
assert.match(teamImport, /template|preview|progress|failed/i, "Team imports need template, preview, progress and failure handling.");
assert.match(departments, /schoolPortalApi\.departments/, "Departments must use scoped CRUD.");
assert.match(programmes, /schoolPortalApi\.programmes/, "Programmes must use scoped CRUD.");
assert.match(academicImport, /all_or_nothing|partial/, "Academic import commit modes are required.");
assert.match(academicImport, /exportFailedRows/, "Failed rows must be exportable.");
for (const resource of ["team", "departments", "programmes"]) {
  assert.match(route, new RegExp(`case "${resource}"`), `Route must render ${resource}.`);
}

assert.match(workspace, /SchoolWorkspaceHeader/, "School pages need one consistent, school-aware header.");
assert.match(workspace, /SchoolMetricGrid/, "School pages need a shared at-a-glance metric language.");
for (const [name, source] of Object.entries({
  dashboard,
  team,
  departments,
  programmes,
  publications,
  content,
  media,
  inquiries,
  audit,
})) {
  assert.match(source, /SchoolWorkspace/, `${name} must use the shared school workspace design.`);
}
