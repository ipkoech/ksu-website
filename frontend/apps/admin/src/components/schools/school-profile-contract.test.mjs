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
  "About the school",
  "Dean’s message",
  "Mission, vision & mandate",
  "Contact & location",
  "Leadership",
  "Brand & media",
  "Publishing status",
  "Profile completeness",
]) {
  assert.match(
    workspace,
    new RegExp(section.replaceAll(" ", "\\s+")),
    `Profile workspace must include ${section}.`,
  );
}
assert.match(
  workspace,
  /school\.profile\.manage/,
  "Profile editing must use the seeded manage permission.",
);
assert.match(
  workspace,
  /Edit profile/,
  "Profile editing must begin from one clear page-level action.",
);
assert.match(
  workspace,
  /Unsaved changes/,
  "Profile editing must expose a persistent unsaved state.",
);
assert.match(
  workspace,
  /Save profile/,
  "Profile editing must use one coordinated save action.",
);
assert.match(
  workspace,
  /beforeunload/,
  "Unsaved profile changes must be protected during navigation.",
);
assert.match(
  workspace,
  /DeanSelector/,
  "Leadership editing must use a searchable person selector.",
);
assert.match(
  dialogs,
  /SchoolMediaPicker/,
  "Profile media must use the reusable multi-media picker.",
);
assert.match(
  workspace,
  /fieldErrors/,
  "Save errors must be presented beside their fields.",
);
assert.match(
  workspace,
  /invalidateQueries[\s\S]*schoolPortalQueryKeys\.(profile|root)/,
  "Successful saves must invalidate scoped school queries.",
);
assert.match(
  page,
  /<SchoolProfileWorkspace\s*\/>/,
  "The profile route must render the workspace.",
);
