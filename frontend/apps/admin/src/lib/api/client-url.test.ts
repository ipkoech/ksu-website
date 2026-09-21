import { describe, expect, it } from "vitest";
import { isAdminRequestTimeout, resolveAdminApiBaseUrl } from "./client-url";

describe("resolveAdminApiBaseUrl", () => {
  it("adds the v1 prefix to a host root", () => {
    expect(resolveAdminApiBaseUrl(undefined, "https://gateway.example.com/")).toBe(
      "https://gateway.example.com/api/v1",
    );
  });

  it("preserves an already versioned URL", () => {
    expect(resolveAdminApiBaseUrl("https://gateway.example.com/api/v1/", undefined)).toBe(
      "https://gateway.example.com/api/v1",
    );
  });

  it("prefers the explicit API URL and has a safe default", () => {
    expect(resolveAdminApiBaseUrl("https://api.example.com/api/v1", "https://ignored.example.com")).toBe(
      "https://api.example.com/api/v1",
    );
    expect(resolveAdminApiBaseUrl(undefined, undefined)).toBe("http://localhost:8080/api/v1");
  });

  it("recognizes Axios timeout codes", () => {
    expect(isAdminRequestTimeout("ECONNABORTED")).toBe(true);
    expect(isAdminRequestTimeout("ETIMEDOUT")).toBe(true);
    expect(isAdminRequestTimeout("ERR_NETWORK")).toBe(false);
  });
});
