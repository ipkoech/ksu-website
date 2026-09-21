import { describe, expect, it } from "vitest";
import { createServerApiClient, type BackendService } from "./server-client";

// Explicit local, read-only smoke check. It never logs response data or sends mutations.
describe.skipIf(process.env.KSU_API_INTEGRATION !== "1")(
  "local backend server transport",
  () => {
    const cases: Array<[BackendService, string, string]> = [
      ["main", "KSU_MAIN_API_URL", "/api/v1/stats?scope=homepage"],
      ["research", "KSU_RESEARCH_API_URL", "/api/v1/projects?per_page=1"],
      [
        "library",
        "KSU_LIBRARY_API_URL",
        "/api/v1/library/branches/?per_page=1",
      ],
      ["heri", "KSU_HERI_API_URL", "/api/v1/heri/site"],
    ];
    it.each(cases)(
      "fetches %s public data on the server",
      async (service, variable, path) => {
        const configured = process.env[variable];
        if (
          !configured ||
          !["localhost", "127.0.0.1", "[::1]"].includes(
            new URL(configured).hostname,
          )
        ) {
          throw new Error(
            `${variable} must explicitly identify a loopback test backend`,
          );
        }
        const payload = await createServerApiClient(service).get<
          Record<string, unknown>
        >(path, undefined, { cache: "no-store", auth: "none" });
        expect(payload).toBeTypeOf("object");
        if (service === "heri") {
          expect(payload.name).toBeTypeOf("string");
          expect(payload.contact).toBeTypeOf("object");
          expect(payload.social_links).toBeTypeOf("object");
        } else {
          expect(payload.data).toBeDefined();
        }
        expect(() => JSON.stringify(payload)).not.toThrow();
      },
    );
  },
);
