import { afterEach, describe, expect, it, vi } from "vitest";
import { withBackendTimeout } from "./backend-timeout";

afterEach(() => {
  vi.useRealTimers();
});

describe("withBackendTimeout", () => {
  it("returns the backend value and clears the fallback timer", async () => {
    vi.useFakeTimers();
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");

    await expect(
      withBackendTimeout(Promise.resolve("fresh"), "fallback", 1000),
    ).resolves.toBe("fresh");

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("returns the fallback at the deadline", async () => {
    vi.useFakeTimers();
    const onTimeout = vi.fn();
    let resolveRequest!: (value: string) => void;
    const request = new Promise<string>((resolve) => {
      resolveRequest = resolve;
    });
    const result = withBackendTimeout(request, "fallback", 250, onTimeout);

    await vi.advanceTimersByTimeAsync(250);
    await expect(result).resolves.toBe("fallback");
    expect(onTimeout).toHaveBeenCalledOnce();
    resolveRequest("late");
  });
});
