import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("Admin public cache revalidation helper", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("NEXT_PUBLIC_LIBRARY_FRONTEND_URL", "http://localhost:3003/");
    vi.stubEnv("NEXT_PUBLIC_LIBRARY_FRONTEND_BASE_PATH", "");
    vi.stubEnv("NEXT_PUBLIC_PUBLIC_FRONTEND_URL", "");
    vi.stubEnv("NEXT_PUBLIC_PUBLIC_FRONTEND_BASE_PATH", "");
    vi.stubEnv("NEXT_PUBLIC_RESEARCH_FRONTEND_URL", "");
    vi.stubEnv("NEXT_PUBLIC_RESEARCH_FRONTEND_BASE_PATH", "");
    vi.stubEnv("NEXT_PUBLIC_HERI_AFRICA_FRONTEND_URL", "");
    vi.stubEnv("NEXT_PUBLIC_HERI_AFRICA_FRONTEND_BASE_PATH", "");
    vi.stubEnv("NEXT_PUBLIC_HERI_FRONTEND_URL", "");
    vi.stubEnv("NEXT_PUBLIC_HERI_FRONTEND_BASE_PATH", "");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("posts to the owning frontend with browser credentials", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));
    const { getPublicFrontendUrl, revalidatePublicContent } = await import(
      "./public-revalidation"
    );

    expect(getPublicFrontendUrl("library")).toBe("http://localhost:3003");
    await revalidatePublicContent("library", "branches");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3003/api/revalidate",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ resource: "branches" }),
      }),
    );
  });

  it("does nothing when the owning frontend is not configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_LIBRARY_FRONTEND_URL", "");
    const fetchMock = vi.spyOn(globalThis, "fetch");
    const { revalidatePublicContent } = await import("./public-revalidation");

    await revalidatePublicContent("library", "branches");

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to the legacy HERI URL when the Africa URL is blank", async () => {
    vi.stubEnv("NEXT_PUBLIC_HERI_FRONTEND_URL", "https://heri.example.test/");
    const { getPublicFrontendUrl } = await import("./public-revalidation");

    expect(getPublicFrontendUrl("heri")).toBe("https://heri.example.test");
  });

  it("adds a configured standalone base path exactly once", async () => {
    vi.stubEnv("NEXT_PUBLIC_LIBRARY_FRONTEND_URL", "https://public.example.test");
    vi.stubEnv("NEXT_PUBLIC_LIBRARY_FRONTEND_BASE_PATH", "/library/");
    const { getPublicFrontendUrl, revalidatePublicContent } = await import(
      "./public-revalidation"
    );

    expect(getPublicFrontendUrl("library")).toBe(
      "https://public.example.test/library",
    );
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));
    await revalidatePublicContent("library", "catalog");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://public.example.test/library/api/revalidate",
      expect.any(Object),
    );

    vi.resetModules();
    vi.stubEnv(
      "NEXT_PUBLIC_LIBRARY_FRONTEND_URL",
      "https://public.example.test/library/",
    );
    const { getPublicFrontendUrl: getConfiguredUrl } = await import(
      "./public-revalidation"
    );
    expect(getConfiguredUrl("library")).toBe(
      "https://public.example.test/library",
    );
  });

  it("reports a non-success response and always clears its timeout", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 503 }));
    const clearTimeoutMock = vi.spyOn(globalThis, "clearTimeout");
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { revalidatePublicContent } = await import("./public-revalidation");

    await revalidatePublicContent("library", "branches");

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(warning).toHaveBeenCalledWith(
      "library public cache revalidation returned HTTP 503.",
    );
    expect(clearTimeoutMock).toHaveBeenCalledOnce();
  });

  it("treats an aborted revalidation as an expected unavailable backend", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(
      new DOMException("timed out", "AbortError"),
    );
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { revalidatePublicContent } = await import("./public-revalidation");

    await revalidatePublicContent("library", "branches");

    expect(warning).not.toHaveBeenCalled();
  });
});
