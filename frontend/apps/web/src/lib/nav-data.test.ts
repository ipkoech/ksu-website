import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clubsApi,
  departmentsApi,
  divisionsApi,
  schoolsApi,
  wingsApi,
} from "@ksu/api-client";

import { getNavData } from "./nav-data";

vi.mock("@ksu/api-client", () => ({
  schoolsApi: { list: vi.fn() },
  divisionsApi: { list: vi.fn() },
  departmentsApi: { list: vi.fn() },
  clubsApi: { list: vi.fn() },
  wingsApi: { listByDivision: vi.fn() },
}));

const response = <T>(data: T[]) => ({
  data,
  meta: {
    page: 1,
    per_page: data.length,
    total: data.length,
    pages: 1,
  },
});

describe("getNavData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(schoolsApi.list).mockResolvedValue(response([]));
    vi.mocked(divisionsApi.list).mockResolvedValue(response([]));
    vi.mocked(departmentsApi.list).mockResolvedValue(response([]));
    vi.mocked(clubsApi.list).mockResolvedValue(response([]));
    vi.mocked(wingsApi.listByDivision).mockResolvedValue(response([]));
  });

  it("retries a transient navigation request failure", async () => {
    vi.mocked(schoolsApi.list)
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(
        response([
          {
            id: "school-1",
            name: "School of Business",
            code: "SOBE",
            slug: "school-of-business",
            is_active: true,
            display_order: 1,
            created_at: "2026-07-30T00:00:00Z",
            updated_at: "2026-07-30T00:00:00Z",
          },
        ]),
      );

    const result = await getNavData();

    expect(schoolsApi.list).toHaveBeenCalledTimes(2);
    expect(result.schools).toEqual([
      {
        id: "school-1",
        name: "School of Business",
        slug: "school-of-business",
      },
    ]);
  });

  it("uses fallback navigation without escalating a handled outage", async () => {
    const outage = new TypeError("fetch failed");
    vi.mocked(schoolsApi.list).mockRejectedValue(outage);
    vi.mocked(divisionsApi.list).mockRejectedValue(outage);
    vi.mocked(departmentsApi.list).mockRejectedValue(outage);
    vi.mocked(clubsApi.list).mockRejectedValue(outage);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const warningSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await getNavData();

    expect(result).toEqual({
      schools: [],
      departments: [],
      divisions: [],
      wings: [],
      adminUnits: [],
      clubs: [],
    });
    expect(errorSpy).not.toHaveBeenCalled();
    expect(warningSpy).toHaveBeenCalledWith(
      "Navigation data unavailable; using the fallback menu.",
      {
        schools: "fetch failed",
        divisions: "fetch failed",
        departments: "fetch failed",
        clubs: "fetch failed",
      },
    );
  });
});
