import { beforeEach, expect, it, vi } from "vitest";
import { contactsApi, universityInfoApi } from "@ksu/api-client/server";
import { unstable_noStore as noStore } from "next/cache";
import { getSiteChromeData } from "./homepage-data";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
vi.mock("next/navigation", () => ({ unstable_rethrow: vi.fn() }));
vi.mock("./landing-data", () => ({}));
vi.mock("./get-leadership", () => ({}));
vi.mock("@ksu/api-client/server", async () => {
  const { ApiClientError } =
    await import("../../../../packages/api-client/src/transport");
  return {
    ApiClientError,
    getResearchApiBaseUrl: () => "http://localhost:8001",
    contactsApi: { list: vi.fn() },
    universityInfoApi: { getCurrent: vi.fn() },
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

it("preserves contact precedence and public social links without loading homepage-only content", async () => {
  vi.mocked(universityInfoApi.getCurrent).mockResolvedValue({
    data: {
      email: "university@example.com",
      phone: "100",
      physical_address: "University road",
      social_links: { x: "https://social.example.com/university" },
      overview: "Unneeded long homepage content",
    },
  } as never);
  vi.mocked(contactsApi.list).mockResolvedValue({
    data: [
      {
        email: "contact@example.com",
        phone: ["", "200"],
        physical_address: "Contact office",
      },
    ],
  } as never);
  const result = await getSiteChromeData();
  expect(result.contactInfo).toEqual({
    email: "contact@example.com",
    phone: "200",
    address: "Contact office",
  });
  expect(result.socialLinks.twitter).toBe(
    "https://social.example.com/university",
  );
  expect(
    result.miniQuickLinks.some((link) => link.label === "STUDENT PORTAL"),
  ).toBe(true);
  expect(Object.keys(result).sort()).toEqual([
    "contactInfo",
    "miniQuickLinks",
    "socialLinks",
  ]);
  expect(JSON.stringify(result)).not.toContain(
    "Unneeded long homepage content",
  );
  expect(universityInfoApi.getCurrent).toHaveBeenCalledOnce();
  expect(contactsApi.list).toHaveBeenCalledOnce();
  expect(noStore).not.toHaveBeenCalled();
});

it("keeps available university contacts when the directory fails, without caching degraded HTML", async () => {
  vi.mocked(universityInfoApi.getCurrent).mockResolvedValue({
    data: {
      email: "university@example.com",
      phone: "100",
      physical_address: "University road",
    },
  } as never);
  vi.mocked(contactsApi.list).mockRejectedValue(
    new Error("upstream unavailable"),
  );
  const result = await getSiteChromeData();
  expect(result.contactInfo).toEqual({
    email: "university@example.com",
    phone: "100",
    address: "University road",
  });
  expect(noStore).toHaveBeenCalledOnce();
});
