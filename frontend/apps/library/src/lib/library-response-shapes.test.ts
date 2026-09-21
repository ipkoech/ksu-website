import { describe, expect, it } from "vitest";
import {
  normalizeLibraryListResponse,
  normalizeLibraryRecordResponse,
} from "./library-response-shapes";

describe("Library public response shapes", () => {
  it("keeps valid records and metadata while rejecting malformed collections", () => {
    expect(
      normalizeLibraryListResponse<{ slug: string }>({
        data: [{ slug: "guide-a" }],
        meta: { total: 4, page: 1, per_page: 20, pages: 1 },
      }),
    ).toEqual({
      data: [{ slug: "guide-a" }],
      meta: { total: 4, page: 1, per_page: 20, pages: 1 },
    });

    expect(normalizeLibraryListResponse({ data: { slug: "wrong-shape" } })).toBeNull();
    expect(normalizeLibraryListResponse({ data: ["wrong-item"] })).toBeNull();

    expect(normalizeLibraryRecordResponse({ data: { total: 4 } })).toEqual({ total: 4 });
    expect(normalizeLibraryRecordResponse({ data: "wrong-shape" })).toBeUndefined();
  });
});
