import { describe, expect, it, vi } from "vitest";
import { generateSlugParams } from "./research-static-params";

describe("generateSlugParams", () => {
  it("projects valid slugs and preserves the loader filters", async () => {
    const list = vi.fn(async (params?: Record<string, string | number | boolean | undefined>) => ({
      data: [{ slug: "published-record" }, {}, { slug: "" }],
      params,
    }));

    await expect(generateSlugParams(list, { category: "featured" })).resolves.toEqual([
      { slug: "published-record" },
    ]);
    expect(list).toHaveBeenCalledWith({
      per_page: 50,
      fields: "slug",
      is_public: true,
      is_active: true,
      category: "featured",
    });
  });

  it("skips static params for a transient upstream failure while preserving runtime routes", async () => {
    const failure = Object.assign(new Error("research service unavailable"), { status: 503 });
    const list = async () => {
      throw failure;
    };

    await expect(generateSlugParams(list)).resolves.toEqual([]);
  });

  it("still propagates non-transient upstream failures", async () => {
    const failure = new Error("research service unavailable");
    const list = async () => {
      throw failure;
    };

    await expect(generateSlugParams(list)).rejects.toBe(failure);
  });

  it("rejects a malformed successful slug envelope", async () => {
    const list = async () => ({ data: { invalid: true } }) as never;

    await expect(generateSlugParams(list)).rejects.toThrow(
      "Malformed Research slug response",
    );
  });
});
