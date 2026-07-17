import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const workspace = await readFile(
  path.join(root, "profile/school-profile-workspace.tsx"),
  "utf8",
);
const dialogs = await readFile(
  path.join(root, "profile/school-profile-dialogs.tsx"),
  "utf8",
);
const page = await readFile(
  path.join(root, "../../app/(protected)/schools/profile/page.tsx"),
  "utf8",
);

for (const section of [
  "Overview",
  "Leadership",
  "Message & About",
  "Mission & Vision",
  "Contacts",
  "Media",
  "Visibility",
  "Preview",
]) {
  assert.match(workspace, new RegExp(section), `Profile workspace must include ${section}.`);
}
assert.match(dialogs, /SchoolProfileDialog/, "Profile edits must use focused dialogs.");
assert.match(dialogs, /SchoolMediaPicker/, "Profile media must use the reusable multi-media picker.");
assert.match(dialogs, /fieldErrors/, "Save errors must be presented beside their fields.");
assert.match(
  dialogs,
  /invalidateQueries[\s\S]*schoolPortalQueryKeys\.(profile|root)/,
  "Successful saves must invalidate scoped school queries.",
);
assert.match(page, /<SchoolProfileWorkspace\s*\/>/, "The profile route must render the workspace.");
