import { beforeEach, expect, it, vi } from "vitest";
import { mainApi } from "@ksu/api-client/server";
import { ApiClientError } from "../../../../packages/api-client/src/transport";
import { unstable_noStore as noStore } from "next/cache";
import { getComposedHomepage } from "./homepage-composition-data";

vi.mock("server-only", () => ({}));
vi.mock("@ksu/api-client/server", async () => {
  const { ApiClientError } =
    await import("../../../../packages/api-client/src/transport");
  return { ApiClientError, mainApi: { get: vi.fn() } };
});
vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

it("preserves a valid empty CMS composition without treating it as an outage", async () => {
  const data = {
    page_key: "homepage",
    scope_type: "global",
    sections: [],
    partnership_spotlights: [],
  };
  vi.mocked(mainApi.get).mockResolvedValue({ data });
  expect(await getComposedHomepage()).toMatchObject({ data, error: null });
  expect(noStore).not.toHaveBeenCalled();
});

it("returns a sanitized serializable outage and does not cache the degraded page", async () => {
  vi.mocked(mainApi.get).mockRejectedValue(
    new ApiClientError("internal-database-host", 503),
  );
  const result = await getComposedHomepage();
  expect(result.error).toEqual({
    code: "UPSTREAM_UNAVAILABLE",
    message: "Homepage content is temporarily unavailable.",
    status: 503,
  });
  expect(JSON.stringify(result)).not.toContain("internal-database-host");
  expect(noStore).toHaveBeenCalledOnce();
});

it("distinguishes malformed successful data from a valid empty composition", async () => {
  vi.mocked(mainApi.get).mockResolvedValue(null);
  expect(await getComposedHomepage()).toMatchObject({
    error: { code: "INVALID_RESPONSE" },
  });
  expect(noStore).toHaveBeenCalledOnce();
});

it("allows a backend without the optional composition endpoint", async () => {
  vi.mocked(mainApi.get).mockRejectedValue(
    new ApiClientError("Not found", 404),
  );
  expect(await getComposedHomepage()).toMatchObject({
    data: null,
    error: null,
  });
  expect(noStore).not.toHaveBeenCalled();
});
