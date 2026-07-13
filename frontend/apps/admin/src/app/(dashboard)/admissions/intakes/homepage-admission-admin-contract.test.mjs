import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "../../../../../../../..");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function read(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  assert(fs.existsSync(filePath), `Expected file to exist: ${relativePath}`);
  return fs.readFileSync(filePath, "utf8");
}

const apiSource = read("frontend/packages/api-client/src/main/api.ts");
for (const snippet of [
  "getHomepageAdmission: (id: string)",
  "updateHomepageAdmission: (id: string, data: IntakeHomepageAdmissionUpdate)",
  "/homepage-admission",
]) {
  assert(apiSource.includes(snippet), `Expected intake API support: ${snippet}`);
}

const hookSource = read("frontend/packages/api-client/src/hooks/use-intakes.ts");
for (const snippet of [
  "useIntakeHomepageAdmission",
  "useUpdateIntakeHomepageAdmission",
  "queryKeys.intakes.homepageAdmission(id)",
]) {
  assert(hookSource.includes(snippet), `Expected intake query support: ${snippet}`);
}

const editorSource = read(
  "frontend/apps/admin/src/app/(dashboard)/admissions/intakes/[id]/client-page.tsx",
);
const homepageAdmissionSource = read(
  "frontend/apps/admin/src/app/(dashboard)/admissions/intakes/[id]/homepage-admission-form.tsx",
);
assert(
  editorSource.includes("<HomepageAdmissionForm intakeId={intake.id}"),
  "Expected the existing intake editor to render the homepage admission form.",
);
for (const snippet of [
  "Homepage Admission",
  "Application Window",
  "Application Actions",
  "Admission Letter",
  "Reporting",
  "Feature this intake on the homepage",
  "Download Admission Letter",
  "useIntakeHomepageAdmission",
  "useUpdateIntakeHomepageAdmission",
]) {
  assert(homepageAdmissionSource.includes(snippet), `Expected intake editor control: ${snippet}`);
}

assert(
  !homepageAdmissionSource.includes("Applications are currently closed"),
  "The intake editor must not introduce a public closed-applications state.",
);
