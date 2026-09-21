import {
  getResearchDetailGuidance,
  getResearchFieldHelp,
  getResearchGuidance,
  researchFirstLoginTour,
} from "./research-guidance";
import { describe, expect, it } from "vitest";

describe("research guidance", () => {
  it("covers the core research authoring workflow", () => {
    const projects = getResearchGuidance("Projects");
    const reports = getResearchGuidance("Research Reports");
    const projectDetail = getResearchDetailGuidance("Research Project");

    expect(researchFirstLoginTour.length).toBeGreaterThanOrEqual(4);
    expect(projects?.steps.some((step) => step.includes("project basics"))).toBe(true);
    expect(projects?.emptyState.title).toBe("No draft projects");
    expect(reports?.steps.some((step) => step.includes("standard report"))).toBe(true);
    expect(reports?.emptyState.primaryActionLabel).toBe("Open exports");
    expect(projectDetail?.relationships.includes("Publications")).toBe(true);
    expect(projectDetail?.publishChecklist.some((step) => step.includes("public visibility"))).toBe(true);
    expect(getResearchFieldHelp("is_public")?.includes("public research portal")).toBe(true);
  });
});
