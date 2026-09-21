import { beforeEach, describe, expect, it, vi } from "vitest";
import { publicEntityApi } from "@ksu/api-client/server";
import { unstable_noStore as noStore } from "next/cache";

import { getEntityContent } from "./entity-media-data";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }));
vi.mock("@ksu/api-client/server", async () => {
  const actual = await vi.importActual<typeof import("@ksu/api-client/server")>(
    "@ksu/api-client/server",
  );
  return { ...actual, publicEntityApi: { content: vi.fn() } };
});

describe("entity media response validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects malformed content records instead of returning them to display DTOs", async () => {
    vi.mocked(publicEntityApi.content).mockResolvedValue({
      data: { entity: {}, content_type: "all", records: "invalid", meta: {} },
    } as never);

    await expect(getEntityContent("school", "school-1", "all")).resolves.toBeNull();
    expect(noStore).toHaveBeenCalled();
  });
});
