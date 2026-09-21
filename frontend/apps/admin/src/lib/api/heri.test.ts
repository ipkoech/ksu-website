import { beforeEach, describe, expect, it, vi } from "vitest";

const { request } = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock("@ksu/api-client", () => ({
  heriApi: { request },
}));
vi.mock("@ksu/auth", () => ({
  getStoredAccessToken: () => "access-token",
}));

import { heriRequest } from "./heri";

describe("heriRequest", () => {
  beforeEach(() => request.mockReset());

  it("routes authenticated JSON calls through the shared transport", async () => {
    request.mockResolvedValue({ id: "news-1" });
    const controller = new AbortController();

    await expect(
      heriRequest("/admin/news/news-1", {
        method: "PATCH",
        body: JSON.stringify({ title: "Updated" }),
        signal: controller.signal,
      }),
    ).resolves.toEqual({ id: "news-1" });

    expect(request).toHaveBeenCalledWith(
      "PATCH",
      "/admin/news/news-1",
      expect.objectContaining({
        body: { title: "Updated" },
        auth: "session",
        timeoutMs: 15_000,
        signal: controller.signal,
        headers: { authorization: "Bearer access-token" },
      }),
    );
  });
});
