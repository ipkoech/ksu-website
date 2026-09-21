import { beforeEach, describe, expect, it, vi } from "vitest";
import { programmesApi, testimonialsApi } from "@ksu/api-client/server";
import { unstable_noStore as noStore } from "next/cache";

import { getProgrammeDetailData } from "./programme-detail-data";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }));
vi.mock("@ksu/api-client/server", async () => {
  const actual = await vi.importActual<typeof import("@ksu/api-client/server")>(
    "@ksu/api-client/server",
  );
  return {
    ...actual,
    programmesApi: { getBySlug: vi.fn(), list: vi.fn() },
    testimonialsApi: { list: vi.fn() },
  };
});

describe("programme detail response validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(programmesApi.getBySlug).mockResolvedValue({ data: "invalid" } as never);
    vi.mocked(programmesApi.list).mockResolvedValue({ data: [] } as never);
    vi.mocked(testimonialsApi.list).mockResolvedValue({ data: [] } as never);
  });

  it("does not treat a malformed programme record as source-backed content", async () => {
    const result = await getProgrammeDetailData("broken-programme");

    expect(result).toMatchObject({
      slug: "broken-programme",
      programme: null,
      relatedProgrammes: [],
      testimonials: [],
      sourceBacked: false,
    });
    expect(noStore).toHaveBeenCalled();
  });

  it("drops malformed related collections while preserving the valid programme", async () => {
    vi.mocked(programmesApi.getBySlug).mockResolvedValue({
      data: {
        id: "programme-1",
        slug: "computer-science",
        name: "Computer Science",
        department_id: "department-1",
      },
    } as never);
    vi.mocked(programmesApi.list).mockResolvedValue({ data: { invalid: true } } as never);

    const result = await getProgrammeDetailData("computer-science");

    expect(result.programme).toMatchObject({ id: "programme-1" });
    expect(result.relatedProgrammes).toEqual([]);
    expect(noStore).toHaveBeenCalled();
  });
});
