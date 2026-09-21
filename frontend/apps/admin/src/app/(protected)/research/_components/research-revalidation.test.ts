import { describe, expect, it } from "vitest";
import { inferResearchRevalidationResource } from "./research-revalidation";

describe("research public revalidation resource inference", () => {
  it("maps public resource families and scoped variants to route keys", () => {
    expect(inferResearchRevalidationResource(["research", "projects"])).toBe("projects");
    expect(inferResearchRevalidationResource(["research", "farm", "projects"])).toBe("farms");
    expect(inferResearchRevalidationResource(["research", "fundings", "reports"])).toBe("grants");
    expect(inferResearchRevalidationResource(["research", "donation-settings"])).toBe("donations");
    expect(inferResearchRevalidationResource(["research", "innovation-output", "competition-entries"])).toBe("competitions");
    expect(inferResearchRevalidationResource(["research", "capacity", "mentorship-applications"])).toBe("mentorship");
    expect(inferResearchRevalidationResource(["research", "innovation-output", "startups"])).toBe("startups");
    expect(inferResearchRevalidationResource(["research", "incubation"])).toBe("incubation");
    expect(inferResearchRevalidationResource(["research", "competitions"])).toBe("competitions");
    expect(inferResearchRevalidationResource(["research", "technology-transfer"])).toBe("technology-transfer");
    expect(inferResearchRevalidationResource(["research", "profile"])).toBe("profile");
    expect(inferResearchRevalidationResource(["research", "content"])).toBe("content");
    expect(inferResearchRevalidationResource(["research", "stories"])).toBe("stories");
    expect(inferResearchRevalidationResource(["research", "settings", "guidelines"])).toBe("guidelines");
    expect(inferResearchRevalidationResource(["admin", "private-only"])).toBeUndefined();
  });
});
