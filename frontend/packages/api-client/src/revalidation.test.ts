import { describe, expect, it } from "vitest";
import {
  canRevalidatePublicContent,
  PUBLIC_CONTENT_CACHE_TAG,
} from "./revalidation";

describe("public cache revalidation contract", () => {
  it("uses a stable tag and only content-management permissions", () => {
    expect(PUBLIC_CONTENT_CACHE_TAG).toBe("ksu-public-content");
    expect(canRevalidatePublicContent(["content.manage"])).toBe(true);
    expect(canRevalidatePublicContent(["research:read"])).toBe(false);
    expect(canRevalidatePublicContent("content.manage")).toBe(false);
  });
});
