import { describe, expect, it } from "vitest";
import {
  canRevalidateResearch,
  matchesRevalidationSecret,
} from "./revalidation-policy";

describe("research revalidation authorization", () => {
  it("accepts only explicit content-management permissions", () => {
    expect(canRevalidateResearch(["research:write"])).toBe(true);
    expect(canRevalidateResearch(["admin:*"])).toBe(true);
    expect(canRevalidateResearch(["research:read"])).toBe(false);
    expect(canRevalidateResearch(["users:write"])).toBe(false);
    expect(canRevalidateResearch("research:write")).toBe(false);
  });

  it("compares deployment secrets without accepting missing or different values", () => {
    expect(matchesRevalidationSecret("deployment-secret", "deployment-secret")).toBe(true);
    expect(matchesRevalidationSecret("deployment-secret", "other-secret")).toBe(false);
    expect(matchesRevalidationSecret(null, "deployment-secret")).toBe(false);
    expect(matchesRevalidationSecret("deployment-secret", undefined)).toBe(false);
  });
});
