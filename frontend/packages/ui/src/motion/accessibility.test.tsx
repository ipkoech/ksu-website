import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLiveAnnounce } from "./accessibility";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("live announcement lifecycle", () => {
  it("clears both the delayed and announcement cleanup timers on unmount", () => {
    const view = renderHook(() => useLiveAnnounce());

    act(() => view.result.current.announce("Updated", 100));
    expect(vi.getTimerCount()).toBe(1);

    act(() => vi.advanceTimersByTime(100));
    expect(vi.getTimerCount()).toBe(1);

    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
