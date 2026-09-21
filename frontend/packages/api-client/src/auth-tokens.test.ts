import { afterEach, expect, it, vi } from "vitest";
import {
  refreshStoredAccessToken,
  setSessionRefreshEnabled,
} from "./auth-tokens";
import { ApiClient } from "./client";

afterEach(() => {
  setSessionRefreshEnabled(true);
  vi.unstubAllGlobals();
});

it("aborts refresh on logout and ignores a late result from the previous session", async () => {
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  let resolve!: (value: Response) => void;
  let signal!: AbortSignal;
  const fetch = vi.fn().mockImplementation((_url, options) => {
    signal = options.signal;
    return new Promise<Response>((done) => {
      resolve = done;
    });
  });
  vi.stubGlobal("fetch", fetch);
  const previous = refreshStoredAccessToken("http://localhost:9878");
  setSessionRefreshEnabled(false);
  expect(signal.aborted).toBe(true);
  resolve(new Response("{}"));
  await expect(previous).resolves.toBe(false);
  await expect(refreshStoredAccessToken("http://localhost:9878")).resolves.toBe(
    false,
  );
  expect(fetch).toHaveBeenCalledTimes(1);
  setSessionRefreshEnabled(true);
  fetch.mockResolvedValue(new Response("{}"));
  await expect(refreshStoredAccessToken("http://localhost:9878")).resolves.toBe(
    true,
  );
});

it("preserves an upstream refresh failure without expiring the session", async () => {
  const dispatchEvent = vi.fn();
  vi.stubGlobal("window", { dispatchEvent });
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response("{}", { status: 503 })),
  );
  await expect(
    refreshStoredAccessToken("http://localhost:9877"),
  ).rejects.toMatchObject({ status: 503, code: "REFRESH_FAILED" });
  expect(dispatchEvent).not.toHaveBeenCalled();
});

it("shares one refresh between clients without a cancelled waiter cancelling others", async () => {
  vi.stubGlobal("window", { dispatchEvent: vi.fn() });
  let completeRefresh!: (response: Response) => void;
  let announceRefresh!: () => void;
  const started = new Promise<void>((resolve) => {
    announceRefresh = resolve;
  });
  let refreshed = false;
  const fetch = vi.fn().mockImplementation(async (url: string) => {
    if (url.endsWith("/auth/refresh")) {
      announceRefresh();
      return new Promise<Response>((resolve) => {
        completeRefresh = resolve;
      });
    }
    return new Response("{}", { status: refreshed ? 200 : 401 });
  });
  vi.stubGlobal("fetch", fetch);
  const abort = new AbortController();
  const first = new ApiClient({ baseUrl: "http://localhost" }).get(
    "/first",
    undefined,
    { signal: abort.signal },
  );
  const firstResult = expect(first).rejects.toMatchObject({
    code: "CANCELLED",
  });
  const second = new ApiClient({ baseUrl: "http://localhost" }).get("/second");
  await started;
  abort.abort();
  await firstResult;
  refreshed = true;
  completeRefresh(new Response("{}"));
  await expect(second).resolves.toEqual({});
  expect(
    fetch.mock.calls.filter((call) => call[0].endsWith("/auth/refresh")),
  ).toHaveLength(1);
});

it("does not retain refresh failure after a new session becomes available", async () => {
  const dispatchEvent = vi.fn();
  vi.stubGlobal("window", { dispatchEvent });
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response("{}", { status: 401 }))
    .mockResolvedValueOnce(new Response("{}"));
  vi.stubGlobal("fetch", fetch);
  await expect(refreshStoredAccessToken("http://localhost:9876")).resolves.toBe(
    false,
  );
  await expect(refreshStoredAccessToken("http://localhost:9876")).resolves.toBe(
    true,
  );
  expect(dispatchEvent).toHaveBeenCalledTimes(1);
});

it("never starts a cookie refresh in a server runtime", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  await expect(refreshStoredAccessToken()).resolves.toBe(false);
  expect(fetch).not.toHaveBeenCalled();
});
