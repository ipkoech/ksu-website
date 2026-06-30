import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const adminRoot = join(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const sharedList = readFileSync(
  join(adminRoot, "src/components/dashboard/editable-service-resource-page.tsx"),
  "utf8",
);
const mentorshipApplications = readFileSync(
  join(adminRoot, "src/app/(protected)/research/capacity/mentorship-applications/page.tsx"),
  "utf8",
);
const scholarshipApplications = readFileSync(
  join(adminRoot, "src/app/(protected)/research/capacity/scholarship-applications/page.tsx"),
  "utf8",
);

assert(sharedList.includes("workflowEditorTarget"), "Shared resource page must support workflow editor side sheets.");
assert(sharedList.includes("workflowFields"), "Workflow side sheets must render workflow-specific fields.");
assert(sharedList.includes("buildWorkflowPayload"), "Workflow side sheets must build endpoint-specific payloads.");
assert(sharedList.includes("SheetTitle>{workflowEditorTarget"), "Workflow editor must use a sheet, not only a confirm dialog.");

assert(mentorshipApplications.includes('mode: "sheet"'), "Mentorship application actions must open review/match side sheets.");
assert(mentorshipApplications.includes("review_notes"), "Mentorship review sheet must collect review notes.");
assert(mentorshipApplications.includes("mentor_id"), "Mentorship match sheet must collect a mentor assignment.");

assert(scholarshipApplications.includes('mode: "sheet"'), "Scholarship application actions must open review/award side sheets.");
assert(scholarshipApplications.includes("review_score"), "Scholarship review sheet must collect reviewer scoring.");
assert(scholarshipApplications.includes("awarded_amount"), "Scholarship award sheet must collect award metadata.");
