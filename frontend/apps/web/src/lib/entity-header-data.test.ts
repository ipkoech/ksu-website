import { beforeEach, describe, expect, it, vi } from "vitest";
import { mainApi } from "@ksu/api-client/server";
import { unstable_noStore as noStore } from "next/cache";

import { getAcademicsEntityHeader } from "./entity-header-data";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }));
vi.mock("@ksu/api-client/server", async () => {
  const actual = await vi.importActual<typeof import("@ksu/api-client/server")>(
    "@ksu/api-client/server",
  );
  return { ...actual, mainApi: { get: vi.fn() } };
});

describe("entity header response validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mainApi.get).mockResolvedValue({ data: "invalid" } as never);
  });

  it("uses the route fallback when item and collection envelopes are malformed", async () => {
    const result = await getAcademicsEntityHeader(["departments", "computer-science"]);

    expect(result).toMatchObject({
      eyebrow: "Academic Department",
      title: "Computer Science Department",
      href: "/academics/departments/computer-science",
    });
    expect(noStore).toHaveBeenCalled();
  });
});
