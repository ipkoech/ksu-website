import { describe, expect, it } from "vitest";
import {
  normalizePublicListResponse,
  normalizePublicRecordResponse,
} from "./web-response-shapes";

describe("Web public response shapes", () => {
  it("normalizes public collections and rejects malformed data", () => {
    expect(
      normalizePublicListResponse<{ slug: string }>({
        data: [{ slug: "story-a" }],
        meta: { total: 3 },
      }),
    ).toEqual({ data: [{ slug: "story-a" }], meta: { total: 3 } });

    expect(normalizePublicListResponse({ data: { slug: "wrong-shape" } })).toBeNull();
    expect(normalizePublicListResponse({ data: ["wrong-item"] })).toBeNull();
  });

  it("distinguishes missing records from malformed record payloads", () => {
    expect(normalizePublicRecordResponse({ data: null })).toBeNull();
    expect(normalizePublicRecordResponse({ data: { slug: "story-a" } })).toEqual({
      slug: "story-a",
    });
    expect(normalizePublicRecordResponse({ data: 42 })).toBeUndefined();
  });
});
