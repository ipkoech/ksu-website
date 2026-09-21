import { beforeEach, describe, expect, it, vi } from "vitest";
import { mainApi } from "@ksu/api-client/server";
import { unstable_noStore as noStore } from "next/cache";

import { getPublicTeam } from "./public-team-data";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }));
vi.mock("@ksu/api-client/server", async () => {
  const actual = await vi.importActual<typeof import("@ksu/api-client/server")>(
    "@ksu/api-client/server",
  );
  return { ...actual, mainApi: { get: vi.fn() } };
});

describe("public team response validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects malformed assignment/person collections", async () => {
    vi.mocked(mainApi.get).mockResolvedValue({
      data: { assignments: "invalid", persons: [] },
    } as never);

    await expect(getPublicTeam("school", "school-1")).resolves.toBeNull();
    expect(noStore).toHaveBeenCalled();
  });
});
