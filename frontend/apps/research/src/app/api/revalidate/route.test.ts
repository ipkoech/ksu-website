import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }));
vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));
vi.mock("@ksu/api-client/server", () => ({
  createServerApiClient: vi.fn(),
}));

import { POST } from "./route";

function request(body: unknown, headers?: Record<string, string>) {
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

describe("research revalidation route", () => {
  beforeEach(() => {
    revalidatePath.mockReset();
    revalidateTag.mockReset();
    process.env.REVALIDATION_SECRET = "deployment-secret";
  });

  it("revalidates the mapped public paths after deployment-secret authorization", async () => {
    const response = await POST(
      request(
        { resource: "research-projects" },
        { "x-revalidation-secret": "deployment-secret" },
      ) as never,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      revalidated: true,
      paths: ["/projects", "/projects/[slug]", "/", "/search"],
    });
    expect(revalidatePath.mock.calls).toEqual([
      ["/projects"],
      ["/projects/[slug]"],
      ["/"],
      ["/search"],
    ]);
    expect(revalidateTag.mock.calls).toEqual([
      ["research-content"],
      ["research-overview"],
      ["research-site-context"],
      ["research-announcements"],
      ["ksu-public-content"],
    ]);
  });

  it("rejects unknown resources without invalidating any path", async () => {
    const response = await POST(
      request(
        { resource: "unknown" },
        { "x-revalidation-secret": "deployment-secret" },
      ) as never,
    );

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      revalidated: false,
      error: "Unknown resource: unknown",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("accepts content aliases used by the research Admin workspaces", async () => {
    const response = await POST(
      request(
        { resource: "research-blogs" },
        { "x-revalidation-secret": "deployment-secret" },
      ) as never,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      revalidated: true,
      paths: ["/news", "/news/[slug]", "/"],
    });
    expect(revalidatePath.mock.calls).toEqual([
      ["/news"],
      ["/news/[slug]"],
      ["/"],
    ]);
    expect(revalidateTag).toHaveBeenCalledTimes(5);
  });

  it("revalidates the public profile after a context update", async () => {
    const response = await POST(
      request(
        { resource: "profile" },
        { "x-revalidation-secret": "deployment-secret" },
      ) as never,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      revalidated: true,
      paths: ["/about", "/team", "/", "/search"],
    });
    expect(revalidatePath.mock.calls).toEqual([
      ["/about"],
      ["/team"],
      ["/"],
      ["/search"],
    ]);
  });

  it("maps newly covered public research resource families", async () => {
    const response = await POST(
      request(
        { resource: "research-impact-metrics" },
        { "x-revalidation-secret": "deployment-secret" },
      ) as never,
    );

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      revalidated: true,
      paths: ["/impact-metrics", "/"],
    });
    expect(revalidatePath.mock.calls).toEqual([
      ["/impact-metrics"],
      ["/"],
    ]);
  });
});
