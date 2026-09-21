import { describe, expect, it } from "vitest";
import {
  normalizeResearchListResponse,
  normalizeResearchRecordResponse,
} from "./research-response-shapes";

describe("Research public response shapes", () => {
  it("normalizes valid list metadata and rejects malformed collections", () => {
    expect(
      normalizeResearchListResponse<{ slug: string }>({
        data: [{ slug: "project-a" }],
        meta: { total: 9, per_page: 25 },
      }),
    ).toEqual({ data: [{ slug: "project-a" }], total: 9, perPage: 25 });

    expect(normalizeResearchListResponse({ data: { slug: "wrong-shape" } })).toBeNull();
    expect(normalizeResearchListResponse({ data: ["wrong-item"] })).toBeNull();
  });

  it("distinguishes a valid missing record from a malformed record", () => {
    expect(normalizeResearchRecordResponse({ data: null })).toBeNull();
    expect(normalizeResearchRecordResponse({ data: { slug: "project-a" } })).toEqual({
      slug: "project-a",
    });
    expect(normalizeResearchRecordResponse({ data: "wrong-shape" })).toBeUndefined();
  });
});
