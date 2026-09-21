import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@ksu/api-client/transport";
import { createHeriIdempotencyKey, submitContact, validateHeriPayload } from "./api";

afterEach(() => vi.unstubAllGlobals());

describe("HERI response guards", () => {
  it("accepts the root shapes used by public endpoints", () => {
    expect(validateHeriPayload([{ id: "one" }], "/news", "list")).toEqual([
      { id: "one" },
    ]);
    expect(validateHeriPayload({ id: "site" }, "/site", "object")).toEqual({
      id: "site",
    });
  });

  it("rejects malformed roots with a normalized upstream error", () => {
    expect(() => validateHeriPayload({ data: [] }, "/news", "list")).toThrow(
      ApiClientError,
    );
    try {
      validateHeriPayload(null, "/site", "object");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiClientError);
      expect((error as ApiClientError).status).toBe(502);
      expect((error as ApiClientError).code).toBe("INVALID_RESPONSE");
    }
  });
});

describe("HERI command keys", () => {
  it("keeps contact submissions usable without crypto.randomUUID", () => {
    const originalCrypto = globalThis.crypto;
    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: { randomUUID: undefined },
    });
    try {
      expect(createHeriIdempotencyKey()).toMatch(/^[0-9]+-[a-z0-9]+-[a-z0-9]+$/);
    } finally {
      Object.defineProperty(globalThis, "crypto", {
        configurable: true,
        value: originalCrypto,
      });
    }
  });

  it("forwards cancellation to contact submission transport", async () => {
    const controller = new AbortController();
    let transportSignal: AbortSignal | undefined;
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<never>((_resolve, reject) => {
        transportSignal = init?.signal ?? undefined;
        init?.signal?.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const request = submitContact({ name: "Test" }, "contact-key", controller.signal);
    controller.abort();

    await expect(request).rejects.toMatchObject({ code: "CANCELLED" });
    expect(transportSignal?.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
