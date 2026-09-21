import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCountUp, useImageRotation } from "./hooks";

vi.mock("framer-motion", () => ({ useInView: () => true, useAnimation: () => ({ start: vi.fn() }) }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 16));
  vi.stubGlobal("cancelAnimationFrame", (handle: number) => window.clearTimeout(handle));
});
afterEach(() => {
  cleanup();
  document.documentElement.removeAttribute("data-a11y-reduce-motion");
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("motion lifecycle", () => {
  it("cancels a delayed count-up when its view unmounts", () => {
    const view = renderHook(() => useCountUp(10, { delay: 1000 }));
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("updates a completed counter when fresh backend data changes its value", () => {
    const view = renderHook(({ value }) => useCountUp(value, { duration: 100 }), { initialProps: { value: 10 } });
    act(() => { vi.advanceTimersByTime(200); });
    expect(view.result.current.count).toBe(10);
    view.rerender({ value: 25 });
    act(() => { vi.advanceTimersByTime(200); });
    expect(view.result.current.count).toBe(25);
  });

  it("displays counters immediately with the application's reduced-motion preference", () => {
    document.documentElement.setAttribute("data-a11y-reduce-motion", "true");
    const view = renderHook(() => useCountUp(42));
    expect(view.result.current.count).toBe(42);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops image rotation when reduced motion is enabled while mounted", async () => {
    const view = renderHook(() => useImageRotation(["a.jpg", "b.jpg"], 1000));
    act(() => { vi.advanceTimersByTime(1000); });
    expect(view.result.current.isTransitioning).toBe(true);
    await act(async () => {
      document.documentElement.setAttribute("data-a11y-reduce-motion", "true");
    });
    expect(view.result.current.isTransitioning).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cleans up both the rotation interval and an in-flight image transition", () => {
    const view = renderHook(() => useImageRotation(["a.jpg", "b.jpg"], 1000));
    act(() => { vi.advanceTimersByTime(1000); });
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps a valid image when new data shrinks the image list", () => {
    const view = renderHook(({ images }) => useImageRotation(images, 5000), { initialProps: { images: ["a.jpg", "b.jpg"] } });
    act(() => { vi.advanceTimersByTime(6000); });
    expect(view.result.current.currentIndex).toBe(1);
    view.rerender({ images: ["new.jpg"] });
    expect(view.result.current.currentImage).toBe("new.jpg");
  });
});
