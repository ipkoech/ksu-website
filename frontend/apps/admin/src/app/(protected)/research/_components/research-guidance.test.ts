import {
  getResearchDetailGuidance,
  getResearchFieldHelp,
  getResearchGuidance,
  researchFirstLoginTour,
} from "./research-guidance";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const projects = getResearchGuidance("Projects");
const reports = getResearchGuidance("Research Reports");
const projectDetail = getResearchDetailGuidance("Research Project");

assert(researchFirstLoginTour.length >= 4, "research tour should cover the main admin workflow");
assert(projects?.steps.some((step) => step.includes("project basics")), "projects guide should explain first action");
assert(projects?.emptyState.title === "No draft projects", "projects empty state should be specific");
assert(reports?.steps.some((step) => step.includes("standard report")), "reports guide should explain standard reports");
assert(reports?.emptyState.primaryActionLabel === "Open exports", "reports empty state should point to exports");
assert(projectDetail?.relationships.includes("Publications"), "project detail guide should include relationship review");
assert(projectDetail?.publishChecklist.some((step) => step.includes("public visibility")), "detail guide should explain publish readiness");
assert(
  getResearchFieldHelp("is_public")?.includes("public research portal"),
  "public field should explain public portal visibility",
);
