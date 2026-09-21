import { randomUUID } from "node:crypto";
import { expect, it } from "vitest";
import { ApiTransport } from "./transport";

it.skipIf(process.env.KSU_PUBLIC_COMMAND_INTEGRATION !== "1")(
  "creates and replays a newsletter command only on the disposable backend",
  async () => {
    const client = new ApiTransport({
      baseUrl: "http://127.0.0.1:18080",
      credentials: "omit",
      runtime: "server",
    });
    const keys = await client.get<{ keys: Array<{ kid: string }> }>(
      "/api/v1/auth/jwks",
      undefined,
      { cache: "no-store" },
    );
    expect(keys.keys[0]?.kid).toBe("frontend-disposable-test");
    const path = "/api/v1/newsletters/subscribe";
    const payload = {
      email: `newsletter-${randomUUID()}@frontend.example.com`,
      frequency: "all",
      categories: ["news", "events", "articles"],
    };
    const options = {
      auth: "none" as const,
      headers: { "Idempotency-Key": randomUUID() },
    };
    const created = await client.post<{ data: { id: string; email: string } }>(
      path,
      payload,
      options,
    );
    expect(created.data.id).toBeTypeOf("string");
    expect(created.data.email).toBe(payload.email);
    const replay = await client.post(path, payload, options);
    expect(replay).toEqual(created);
    await expect(
      client.post(path, { ...payload, frequency: "weekly" }, options),
    ).rejects.toMatchObject({ status: 409 });
  },
);

it.skipIf(process.env.KSU_PUBLIC_COMMAND_INTEGRATION !== "1")(
  "submits a story contributor request and rejects a duplicate email only on the disposable backend",
  async () => {
    const client = new ApiTransport({
      baseUrl: "http://127.0.0.1:18080",
      credentials: "omit",
      runtime: "server",
    });
    const keys = await client.get<{ keys: Array<{ kid: string }> }>(
      "/api/v1/auth/jwks",
      undefined,
      { cache: "no-store" },
    );
    expect(keys.keys[0]?.kid).toBe("frontend-disposable-test");
    const path = "/api/v1/stories/account-requests";
    const payload = {
      full_name: "Frontend Integration Contributor",
      email: `contributor-${randomUUID()}@example.com`,
      phone: null,
      affiliation: "Frontend integration fixture",
      contributor_type: "external",
      reason_for_request: "Verify the public contributor request workflow.",
    };
    const options = {
      auth: "none" as const,
      headers: { "Idempotency-Key": randomUUID() },
    };
    const created = await client.post<{
      data: { id: string; email: string; status?: string };
    }>(path, payload, options);
    expect(created.data.id).toBeTypeOf("string");
    expect(created.data.email).toBe(payload.email);
    expect(created.data.status).toBe("pending");

    await expect(
      client.post(path, payload, {
        ...options,
        headers: { "Idempotency-Key": randomUUID() },
      }),
    ).rejects.toMatchObject({ status: 409 });
  },
);
