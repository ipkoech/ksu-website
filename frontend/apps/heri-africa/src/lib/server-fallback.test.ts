import { afterEach, describe, expect, it, vi } from "vitest";

const { noStore } = vi.hoisted(() => ({ noStore: vi.fn() }));
vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_noStore: noStore }));

import {
  markUncacheableIfFailed,
  uncachedFallback,
} from "./server-fallback";

describe("HERI server fallback cache policy", () => {
  afterEach(() => noStore.mockClear());

  it("marks a fallback response as request-scoped", () => {
    expect(uncachedFallback([])).toEqual([]);
    expect(noStore).toHaveBeenCalledOnce();
  });

  it("marks aggregate pages uncacheable only when a backend request failed", () => {
    markUncacheableIfFailed([
      { status: "fulfilled", value: [] },
      { status: "fulfilled", value: [] },
    ]);
    expect(noStore).not.toHaveBeenCalled();

    markUncacheableIfFailed([
      { status: "fulfilled", value: [] },
      { status: "rejected", reason: new Error("fixture unavailable") },
    ]);
    expect(noStore).toHaveBeenCalledOnce();
  });
});
