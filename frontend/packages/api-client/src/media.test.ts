import { afterEach, expect, it, vi } from "vitest";
import { resolveMainMediaUrl } from "./media";
import { getMainApiBaseUrl } from "./service-urls";

afterEach(() => vi.unstubAllEnvs());

it("uses public media configuration even when backend fetching uses an internal origin", () => {
  vi.stubEnv("KSU_MAIN_API_URL", "http://private-backend:8000");
  vi.stubEnv("NEXT_PUBLIC_MAIN_API_URL", "https://gateway.example.com");
  expect(getMainApiBaseUrl()).toBe("http://private-backend:8000");
  expect(resolveMainMediaUrl("uploads/uploads/photo.jpg")).toBe(
    "https://gateway.example.com/uploads/photo.jpg",
  );
});

it("does not disclose an internal origin when the public main URL is absent", () => {
  vi.stubEnv("KSU_MAIN_API_URL", "http://private-backend:8000");
  vi.stubEnv("NEXT_PUBLIC_MAIN_API_URL", "");
  vi.stubEnv("NEXT_PUBLIC_API_URL", "https://gateway.example.com/api/v1");
  expect(resolveMainMediaUrl("photo.jpg")).toBe(
    "https://gateway.example.com/uploads/photo.jpg",
  );
  vi.stubEnv("NEXT_PUBLIC_API_URL", "");
  expect(resolveMainMediaUrl("photo.jpg")).toBe(
    "http://localhost:8000/uploads/photo.jpg",
  );
});

it("preserves already resolved media URLs", () => {
  expect(resolveMainMediaUrl("https://cdn.example.com/photo.jpg")).toBe(
    "https://cdn.example.com/photo.jpg",
  );
  expect(resolveMainMediaUrl(null)).toBeUndefined();
});
