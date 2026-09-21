import { beforeEach, describe, expect, it, vi } from "vitest";
import { divisionsApi, mainApi, wingsApi } from "@ksu/api-client/server";
import { unstable_noStore as noStore } from "next/cache";

import { getAdministrationDivisionDetailData } from "./administration-office-detail-data";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }));
vi.mock("@ksu/api-client/server", async () => {
  const actual = await vi.importActual<typeof import("@ksu/api-client/server")>(
    "@ksu/api-client/server",
  );
  return {
    ...actual,
    divisionsApi: { getBySlug: vi.fn() },
    mainApi: { get: vi.fn() },
    wingsApi: { listByDivision: vi.fn(), getBySlug: vi.fn() },
  };
});
vi.mock("@/lib/entity-media-data", () => ({
  getScopedEntityMedia: vi.fn().mockResolvedValue([]),
}));
vi.mock("@/lib/public-team-data", () => ({
  getPublicTeam: vi.fn().mockResolvedValue({ assignments: [], counts: { assignments: 0 } }),
}));
vi.mock("@/lib/public-person-data", () => ({
  getPublicPersonProfile: vi.fn().mockResolvedValue(null),
}));

describe("administration office detail response validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(divisionsApi.getBySlug).mockResolvedValue({
      data: {
        id: "division-1",
        name: "Academic Affairs",
        slug: "academic-affairs",
        division_type: "division",
        is_active: true,
      },
    } as never);
    vi.mocked(wingsApi.listByDivision).mockResolvedValue({ data: { invalid: true } } as never);
    vi.mocked(mainApi.get).mockResolvedValue({ data: [] } as never);
  });

  it("drops malformed child collections and marks the response request-scoped", async () => {
    const result = await getAdministrationDivisionDetailData("academic-affairs");

    expect(result).toMatchObject({
      kind: "division",
      entity: { id: "division-1" },
      childWings: [],
      departments: [],
      documents: [],
      updates: [],
    });
    expect(noStore).toHaveBeenCalled();
  });
});
