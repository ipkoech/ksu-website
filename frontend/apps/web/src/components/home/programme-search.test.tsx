import "@testing-library/jest-dom/vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ProgrammeSearchPanel } from "./programme-search";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("./motion-primitives", () => ({
  RevealGroup: ({ children }: { children: React.ReactNode }) => children,
  RevealItem: ({ children }: { children: React.ReactNode }) => children,
}));

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function pendingSearch() {
  let signal!: AbortSignal;
  const fetch = vi.fn((_url, init) => {
    signal = init.signal;
    return new Promise<Response>((_resolve, reject) => {
      signal.addEventListener(
        "abort",
        () => reject(new DOMException("Aborted", "AbortError")),
        { once: true },
      );
    });
  });
  vi.stubGlobal("fetch", fetch);
  const view = render(
    <ProgrammeSearchPanel schools={[]} filters={{ levels: [], modes: [] }} />,
  );
  expect(fetch).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "law" } });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(260);
  });
  expect(fetch).toHaveBeenCalledOnce();
  return { signal, view };
}

it("cancels the old search immediately when the query changes", async () => {
  const { signal } = await pendingSearch();
  fireEvent.change(screen.getByRole("combobox"), {
    target: { value: "biology" },
  });
  expect(signal.aborted).toBe(true);
});

it("cancels the in-flight search when the component unmounts", async () => {
  const { signal, view } = await pendingSearch();
  view.unmount();
  expect(signal.aborted).toBe(true);
});
