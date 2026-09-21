import { afterEach, expect, it, vi } from "vitest";
import {
  getHeriApiBaseUrl,
  getHeriPublicApiUrl,
} from "./service-urls";

afterEach(() => vi.unstubAllEnvs());

it("uses the configured HERI public URL for browser requests", () => {
  vi.stubEnv("NEXT_PUBLIC_HERI_API_URL", "https://gateway.example/heri/");

  expect(getHeriPublicApiUrl()).toBe("https://gateway.example/heri");
});

it("derives the HERI public URL from the configured main gateway", () => {
  vi.stubEnv("NEXT_PUBLIC_HERI_API_URL", "");
  vi.stubEnv("NEXT_PUBLIC_MAIN_API_URL", "https://gateway.example/api/v1/");

  expect(getHeriPublicApiUrl()).toBe(
    "https://gateway.example/api/v1/heri",
  );
});

it("keeps server HERI requests on the internal service origin", () => {
  vi.stubEnv("KSU_HERI_API_URL", "http://heri.internal:8003/");
  vi.stubEnv("NEXT_PUBLIC_HERI_API_URL", "https://gateway.example/api/v1/heri");

  expect(getHeriApiBaseUrl()).toBe("http://heri.internal:8003");
  expect(getHeriPublicApiUrl()).toBe("https://gateway.example/api/v1/heri");
});
