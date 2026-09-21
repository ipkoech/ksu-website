import { afterEach, describe, expect, it, vi } from "vitest";

const { noStore, rethrow } = vi.hoisted(() => ({
  noStore: vi.fn(),
  rethrow: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_noStore: noStore }));
vi.mock("next/navigation", () => ({ unstable_rethrow: rethrow }));
vi.mock("@ksu/api-client/server", () => ({
  ApiClientError: class ApiClientError extends Error {
    constructor(
      message: string,
      public status: number,
    ) {
      super(message);
    }
  },
}));

import {
  markUncacheableIfFailed,
  publicFallback,
  uncachedPublicFallback,
} from "./public-fetch";
import { ApiClientError } from "@ksu/api-client/server";

afterEach(() => {
  noStore.mockClear();
  rethrow.mockClear();
});

describe("public fallback cache policy", () => {
  it("marks collection fallbacks request-scoped even when the upstream status is unknown", () => {
    expect(uncachedPublicFallback([])).toEqual([]);
    expect(noStore).toHaveBeenCalledOnce();
  });

  it("keeps an upstream outage from being cached as an empty page", () => {
    expect(publicFallback(new Error("gateway unavailable"), [])).toEqual([]);
    expect(rethrow).toHaveBeenCalledOnce();
    expect(noStore).toHaveBeenCalledOnce();
  });

  it("allows a real missing record to retain normal not-found caching", () => {
    expect(publicFallback(new ApiClientError("Missing", 404), null)).toBeNull();
    expect(rethrow).toHaveBeenCalledOnce();
    expect(noStore).not.toHaveBeenCalled();
  });

  it("marks partial aggregate results dynamic only when a source failed", () => {
    markUncacheableIfFailed([
      { status: "fulfilled", value: [] },
      { status: "fulfilled", value: [] },
    ]);
    expect(noStore).not.toHaveBeenCalled();

    markUncacheableIfFailed([
      { status: "fulfilled", value: [] },
      { status: "rejected", reason: new Error("backend unavailable") },
    ]);
    expect(noStore).toHaveBeenCalledOnce();
  });
});
