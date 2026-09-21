import { afterEach, describe, expect, it, vi } from "vitest";
import { createServer } from "node:http";
import { ApiClient, ApiClientError } from "./client";

afterEach(() => vi.unstubAllGlobals());

describe("API transport boundaries", () => {
  it("preserves framework control flow without retrying or converting it to a network error", async () => {
    const controlFlow = new Error("Framework request-time rendering signal");
    const fetch = vi.fn().mockRejectedValue(controlFlow);
    vi.stubGlobal("fetch", fetch);
    const client = new ApiClient({
      baseUrl: "http://localhost",
      runtime: "server",
      rethrowError(error) {
        if (error === controlFlow) throw error;
      },
    });
    await expect(
      client.get("/private", undefined, { cache: "no-store" }),
    ).rejects.toBe(controlFlow);
    expect(fetch).toHaveBeenCalledOnce();
  });
  it("does not automatically replay a mutation after refreshing authentication", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 401 }));
    const refreshSession = vi.fn().mockResolvedValue(true);
    vi.stubGlobal("fetch", fetch);
    const client = new ApiClient({
      baseUrl: "http://localhost",
      runtime: "browser",
      refreshSession,
    });
    await expect(
      client.post("/create", { name: "example" }),
    ).rejects.toMatchObject({ code: "AUTH_RETRY_REQUIRED" });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(refreshSession).toHaveBeenCalledTimes(1);
  });

  it("does not retry before a long Retry-After cooldown", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response("{}", { status: 429, headers: { "Retry-After": "30" } }),
      );
    vi.stubGlobal("fetch", fetch);
    await expect(
      new ApiClient({ baseUrl: "http://localhost" }).get("/busy"),
    ).rejects.toMatchObject({ status: 429 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("normalizes backend validation errors and preserves their field locations", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            detail: [{ loc: ["body", "email"], msg: "Invalid email" }],
          }),
          { status: 422 },
        ),
      ),
    );
    await expect(
      new ApiClient({ baseUrl: "http://localhost" }).post("/create", {}),
    ).rejects.toMatchObject({
      status: 422,
      errors: { "body.email": ["Invalid email"] },
    });
  });

  it("downloads binary data inside the transport", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("column\nvalue", {
          headers: { "content-type": "text/csv" },
        }),
      ),
    );
    const blob = await new ApiClient({ baseUrl: "http://localhost" }).download(
      "/export",
    );
    expect(await blob.text()).toBe("column\nvalue");
    expect(blob.type).toBe("text/csv");
  });

  it("replays at most once after successful browser refresh", async () => {
    const fetch = vi
      .fn()
      .mockImplementation(async () => new Response("{}", { status: 401 }));
    const refreshSession = vi.fn().mockResolvedValue(true);
    vi.stubGlobal("fetch", fetch);
    const client = new ApiClient({
      baseUrl: "http://localhost",
      runtime: "browser",
      refreshSession,
    });
    await expect(client.get("/private")).rejects.toMatchObject({ status: 401 });
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("cancels an outstanding request using the caller signal", async () => {
    const controller = new AbortController();
    let actualSignal: AbortSignal | undefined;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(
        (_url, options) =>
          new Promise((_resolve, reject) => {
            actualSignal = options.signal;
            actualSignal!.addEventListener(
              "abort",
              () => reject(actualSignal!.reason),
              { once: true },
            );
          }),
      ),
    );
    const request = new ApiClient({ baseUrl: "http://localhost" }).get(
      "/data",
      undefined,
      { signal: controller.signal },
    );
    controller.abort();
    await expect(request).rejects.toMatchObject({ code: "CANCELLED" });
    expect(actualSignal?.aborted).toBe(true);
  });

  it("retries a transient GET once but never a write", async () => {
    const fetch = vi
      .fn()
      .mockImplementation(
        async () =>
          new Response("{}", { status: 503, headers: { "Retry-After": "0" } }),
      );
    vi.stubGlobal("fetch", fetch);
    const client = new ApiClient({ baseUrl: "http://localhost" });
    await expect(client.get("/data")).rejects.toMatchObject({ status: 503 });
    expect(fetch).toHaveBeenCalledTimes(2);
    fetch.mockClear();
    await expect(client.post("/data", { value: 1 })).rejects.toMatchObject({
      status: 503,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("adds idempotency keys to writes while preserving explicit command keys", async () => {
    const fetch = vi.fn().mockImplementation(() => Promise.resolve(new Response("{}")));
    vi.stubGlobal("fetch", fetch);
    const client = new ApiClient({ baseUrl: "http://localhost" });

    await client.post("/generated", { value: 1 });
    expect(fetch.mock.calls[0][1].headers.get("Idempotency-Key")).toMatch(
      /^.{8,}$/,
    );

    await client.post("/explicit", undefined, {
      headers: { "Idempotency-Key": "stable-command-key" },
    });
    expect(fetch.mock.calls[1][1].headers.get("Idempotency-Key")).toBe(
      "stable-command-key",
    );
  });

  it("leaves multipart boundary generation to fetch", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetch);
    const body = new FormData();
    body.append("file", new Blob(["example"]), "example.txt");
    await new ApiClient({ baseUrl: "http://localhost" }).post("/upload", body);
    expect(fetch.mock.calls[0][1].headers.has("content-type")).toBe(false);
    expect(fetch.mock.calls[0][1].body).toBe(body);
  });

  it("preserves binary request bodies for raw upload endpoints", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetch);
    const body = new Blob(["example"], { type: "text/plain" });
    await new ApiClient({ baseUrl: "http://localhost" }).post("/upload", body, {
      headers: { "Content-Type": "text/plain" },
    });
    expect(fetch.mock.calls[0][1].body).toBe(body);
    expect(fetch.mock.calls[0][1].headers.get("content-type")).toBe("text/plain");
  });

  it.each([false, 0, "", null])("preserves the JSON body %s", async (body) => {
    const fetch = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetch);
    await new ApiClient({ baseUrl: "http://localhost" }).post("/data", body);
    expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify(body));
  });

  it("never refreshes browser credentials on the server", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response("{}", { status: 401 }));
    vi.stubGlobal("fetch", fetch);
    await expect(
      new ApiClient({ baseUrl: "http://localhost" }).get("/private"),
    ).rejects.toMatchObject({ status: 401 });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not cache authorization-bearing requests, regardless of header case", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetch);
    await new ApiClient({
      baseUrl: "http://localhost",
      headers: { authorization: "Bearer test" },
    }).get("/private", undefined, { next: { revalidate: 300 } });
    expect(fetch.mock.calls[0][1].cache).toBe("no-store");
    expect(fetch.mock.calls[0][1].next).toBeUndefined();
  });

  it("does not let the browser HTTP cache hide fresh public data by default", async () => {
    const fetch = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetch);
    await new ApiClient({
      baseUrl: "http://localhost",
      runtime: "browser",
      credentials: "omit",
    }).get("/public");
    expect(fetch.mock.calls[0][1].cache).toBe("no-store");
    expect(fetch.mock.calls[0][1].next).toBeUndefined();
  });

  it("normalizes a null error body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("null", { status: 400 })),
    );
    await expect(
      new ApiClient({ baseUrl: "http://localhost" }).get("/data"),
    ).rejects.toBeInstanceOf(ApiClientError);
  });

  it("normalizes invalid JSON on a successful response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("not json")));
    await expect(
      new ApiClient({ baseUrl: "http://localhost" }).get("/data"),
    ).rejects.toMatchObject({ status: 200, code: "INVALID_RESPONSE" });
  });

  it("accepts an empty 204 response without attempting JSON decoding", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
    await expect(
      new ApiClient({ baseUrl: "http://localhost" }).delete("/data"),
    ).resolves.toBeUndefined();
  });

  it.each([403, 404, 500])("normalizes HTTP status %s consistently", async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: "Backend failure" }), { status })),
    );
    await expect(
      new ApiClient({ baseUrl: "http://localhost" }).get("/data"),
    ).rejects.toMatchObject({ status, message: "Backend failure" });
  });

  it("keeps the deadline active while an actual HTTP response body stalls", async () => {
    const server = createServer((_request, response) => {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.write('{"data":');
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", resolve),
    );
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("Missing test listener");
    try {
      const client = new ApiClient({
        baseUrl: `http://127.0.0.1:${address.port}`,
        timeoutMs: 100,
      });
      await expect(client.get("/slow-body")).rejects.toMatchObject({
        code: "TIMEOUT",
      });
    } finally {
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  }, 2000);
});
