import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath, revalidateTag, headers, createServerApiClient } =
  vi.hoisted(() => ({
    revalidatePath: vi.fn(),
    revalidateTag: vi.fn(),
    headers: vi.fn(async () => new Headers()),
    createServerApiClient: vi.fn(),
  }));

vi.mock("next/cache", () => ({ revalidatePath, revalidateTag }));
vi.mock("next/headers", () => ({ headers }));
vi.mock("server-only", () => ({}));
vi.mock("./server", () => ({ createServerApiClient }));

import { OPTIONS, POST } from "./revalidation-route";

function request(body: unknown, init: RequestInit = {}) {
  return new Request("http://localhost/api/revalidate", {
    method: "POST",
    headers: { "content-type": "application/json", ...init.headers },
    body: JSON.stringify(body),
  });
}

describe("public cache revalidation route", () => {
  beforeEach(() => {
    revalidatePath.mockReset();
    revalidateTag.mockReset();
    headers.mockResolvedValue(new Headers());
    createServerApiClient.mockReset();
    createServerApiClient.mockReturnValue({
      get: vi.fn().mockResolvedValue({ permissions: ["content.manage"] }),
    });
  });

  it("requires content-management permission and clears the shared tag", async () => {
    const response = await POST(request({ resource: "projects" }) as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      revalidated: true,
      resource: "projects",
      tag: "ksu-public-content",
    });
    expect(revalidateTag).toHaveBeenCalledWith("ksu-public-content");
    expect(revalidatePath).toHaveBeenCalledWith("/", "layout");
  });

  it("rejects a session without a content-management permission", async () => {
    createServerApiClient.mockReturnValue({
      get: vi.fn().mockResolvedValue({ permissions: ["content:read"] }),
    });

    const response = await POST(request({ resource: "projects" }) as never);

    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects an unapproved browser origin before reading the session", async () => {
    const response = await OPTIONS(
      new Request("http://localhost/api/revalidate", {
        method: "OPTIONS",
        headers: { origin: "https://untrusted.example" },
      }) as never,
    );

    expect(response.status).toBe(403);
    expect(createServerApiClient).not.toHaveBeenCalled();
  });
});
