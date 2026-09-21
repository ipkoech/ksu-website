import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { createServerApiClient } from "./server-client";

beforeEach(() => {
  vi.stubEnv("KSU_MAIN_API_URL", "http://localhost:18123");
  vi.stubEnv("KSU_API_MAX_CONCURRENT_REQUESTS", "2");
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("bounds one origin across request-scoped clients without sharing their headers", async () => {
  let active = 0;
  let peak = 0;
  const identities: string[] = [];
  vi.stubGlobal(
    "fetch",
    vi.fn(async (_url, init) => {
      active++;
      peak = Math.max(peak, active);
      identities.push(new Headers(init.headers).get("authorization")!);
      await new Promise((resolve) => setTimeout(resolve, 10));
      active--;
      return new Response("{}");
    }),
  );
  await Promise.all(
    Array.from({ length: 8 }, (_, id) =>
      createServerApiClient("main", {
        headers: { Authorization: `Bearer test-${id}` },
      }).get("/api/v1/private"),
    ),
  );
  expect(peak).toBe(2);
  expect(new Set(identities).size).toBe(8);
});

it.each(["timeout", "cancel"])(
  "holds a slot through body consumption and removes a queued %s",
  async (kind) => {
    vi.stubEnv("KSU_API_MAX_CONCURRENT_REQUESTS", "1");
    let body!: ReadableStreamDefaultController<Uint8Array>;
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          new ReadableStream({
            start(controller) {
              body = controller;
            },
          }),
        ),
      )
      .mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetch);
    const first = createServerApiClient("main", { timeoutMs: 2000 }).get(
      "/slow-body",
    );
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const controller = new AbortController();
    const queued = createServerApiClient("main").get("/queued", undefined, {
      timeoutMs: kind === "timeout" ? 30 : 2000,
      signal: controller.signal,
    });
    const rejected = expect(queued).rejects.toMatchObject({
      code: kind === "timeout" ? "TIMEOUT" : "CANCELLED",
    });
    if (kind === "cancel") controller.abort();
    await rejected;
    expect(fetch).toHaveBeenCalledOnce();
    body.enqueue(new TextEncoder().encode("{}"));
    body.close();
    await first;
    await createServerApiClient("main").get("/after");
    expect(fetch).toHaveBeenCalledTimes(2);
  },
);
