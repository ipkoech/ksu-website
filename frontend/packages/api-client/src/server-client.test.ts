import { afterEach, expect, it, vi } from "vitest";
import { createServerApiClient } from "./server-client";

afterEach(() => vi.unstubAllGlobals());

it("isolates credentials between concurrent server loaders and anonymous requests", async () => {
  const fetch = vi.fn().mockImplementation(async () => new Response("{}"));
  vi.stubGlobal("fetch", fetch);
  const first = createServerApiClient("main", {
    headers: {
      cookie: "ksu_access=first; ksu_refresh=secret; unrelated=value",
      "x-untrusted": "ignored",
    },
  });
  const second = createServerApiClient("main", {
    headers: { authorization: "Bearer second" },
  });
  const publicClient = createServerApiClient("main");
  await Promise.all([
    first.get("/first"),
    second.get("/second"),
    publicClient.get("/public"),
  ]);
  const requests = fetch.mock.calls.map((call) => call[1]);
  expect(requests[0].headers.get("cookie")).toBe("ksu_access=first");
  expect(requests[0].headers.has("x-untrusted")).toBe(false);
  expect(requests[0].cache).toBe("no-store");
  expect(requests[1].headers.get("authorization")).toBe("Bearer second");
  expect(requests[1].headers.has("cookie")).toBe(false);
  expect(requests[1].cache).toBe("no-store");
  expect(requests[2].headers.has("authorization")).toBe(false);
  expect(requests[2].headers.has("cookie")).toBe(false);
  expect(requests[2].next.revalidate).toBe(300);
  expect(requests[2].next.tags).toContain("ksu-public-content");
});
