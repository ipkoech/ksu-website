import { afterEach, expect, it, vi } from "vitest";
import { fetchCurrentUser, normalizeBackendUser } from "./backend";

afterEach(() => vi.unstubAllGlobals());

it("distinguishes unavailable verification from an expired session", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(async () => new Response("{}", { status: 503 })),
  );
  await expect(fetchCurrentUser()).rejects.toMatchObject({ status: 503 });
});

it("rejects a malformed successful profile instead of authenticating an empty user", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
  await expect(fetchCurrentUser()).rejects.toMatchObject({
    code: "INVALID_RESPONSE",
  });
});

it("requests the account restriction and membership fields that the auth store consumes", async () => {
  const fetch = vi.fn().mockResolvedValue(
    new Response(
      JSON.stringify({
        data: {
          id: "fixture-user",
          email: "fixture@example.invalid",
          roles: [],
          permissions: [],
          service_memberships: ["research"],
          must_change_password: true,
        },
      }),
    ),
  );
  vi.stubGlobal("fetch", fetch);
  const user = await fetchCurrentUser();
  const fields = new URL(String(fetch.mock.calls[0][0])).searchParams
    .get("fields")!
    .split(",");
  expect(fields).toContain("service_memberships");
  expect(fields).toContain("must_change_password");
  expect(user?.mustChangePassword).toBe(true);
  expect(user?.serviceMemberships).toEqual(["research"]);
});

it("returns no user for a definitive unauthenticated response", async () => {
  const fetch = vi.fn().mockResolvedValue(new Response("{}", { status: 401 }));
  vi.stubGlobal("fetch", fetch);
  await expect(fetchCurrentUser()).resolves.toBeNull();
  expect(fetch).toHaveBeenCalledTimes(1);
});

it("preserves backend permission mapping and requires membership, role or scopes for access", () => {
  const user = normalizeBackendUser({
    id: "fixture",
    email: "fixture@example.invalid",
    roles: [],
    permissions: ["users:read"],
  });
  expect(
    user.services.find((service) => service.service === "system")?.scopes,
  ).toContain("users.view");
  expect(user.services.some((service) => service.service === "heri")).toBe(
    false,
  );
});
