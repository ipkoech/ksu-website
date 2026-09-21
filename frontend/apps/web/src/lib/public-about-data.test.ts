import { afterEach, describe, expect, it, vi } from "vitest";

const { get } = vi.hoisted(() => ({ get: vi.fn() }));

vi.mock("server-only", () => ({}));

vi.mock("@ksu/api-client/server", () => ({
  ApiClientError: class ApiClientError extends Error {
    constructor(
      message: string,
      public status: number,
      public errors?: Record<string, string[]>,
      public code?: string,
    ) {
      super(message);
    }
  },
  mainApi: { get },
}));

import {
  resolveAboutMedia,
  getPublicAboutData,
  getPublicFactsData,
  getPublicInstitutionalPage,
} from "./public-about-data";

afterEach(() => vi.clearAllMocks());

describe("getPublicInstitutionalPage", () => {
  it("returns a validated page DTO", async () => {
    get.mockResolvedValueOnce({
      data: {
        id: "page-1",
        slug: "service-charter",
        title: "Service Charter",
        introduction: "How the university serves the public.",
        sections: [],
      },
    });

    await expect(getPublicInstitutionalPage("service-charter")).resolves.toMatchObject({
      id: "page-1",
      sections: [],
    });
  });

  it("surfaces malformed upstream data as an invalid response", async () => {
    get.mockResolvedValueOnce({ data: [] });

    await expect(getPublicInstitutionalPage("service-charter")).rejects.toMatchObject({
      status: 502,
      code: "INVALID_RESPONSE",
    });
  });
});

describe("public About response validation", () => {
  it("accepts the bounded About and facts DTOs", async () => {
    get.mockResolvedValueOnce({
      data: {
        university: { name: "Kisii University" },
        content: null,
        history: { milestones: [] },
      },
    });
    get.mockResolvedValueOnce({
      data: {
        edition: { reporting_year: 2026 },
        groups: [],
        available_years: [2026],
      },
    });

    await expect(getPublicAboutData()).resolves.toMatchObject({
      university: { name: "Kisii University" },
    });
    await expect(getPublicFactsData()).resolves.toMatchObject({
      edition: { reporting_year: 2026 },
    });
  });

  it("rejects malformed facts data instead of rendering an invalid DTO", async () => {
    get.mockResolvedValueOnce({ data: { edition: null } });

    await expect(getPublicFactsData()).rejects.toMatchObject({
      status: 502,
      code: "INVALID_RESPONSE",
    });
  });
});


describe("managed About media", () => {
  it("serves nested upload assets through their existing file IDs", () => {
    const asset = {id:"123",url:"/uploads/seed/institutional/campus-forest-walk.jpg"};
    expect(resolveAboutMedia({content:{identity_media:asset}})).toEqual({content:{identity_media:{id:"123",url:"/api/files/123"}}});
    expect(asset.url).toBe("/uploads/seed/institutional/campus-forest-walk.jpg");
  });
  it("preserves external media and absent photos", () => {
    const value = {image:{id:"123",url:"https://example.org/photo.jpg"},photo:null};
    expect(resolveAboutMedia(value)).toEqual(value);
  });
});
