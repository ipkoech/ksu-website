import { beforeEach, describe, expect, it, vi } from "vitest";
import { getResearchApiBaseUrl, researchServiceApi } from "@ksu/api-client/server";
import { unstable_noStore as noStore } from "next/cache";

import { getResearchLanding } from "./research-landing";

vi.mock("server-only", () => ({}));
vi.mock("next/cache", () => ({ unstable_noStore: vi.fn() }));
vi.mock("@ksu/api-client/server", () => ({
  getResearchApiBaseUrl: vi.fn(() => "https://research.example.test"),
  researchServiceApi: {
    themes: { list: vi.fn() },
    projects: { list: vi.fn() },
  },
}));

const response = <T>(data: T[]) => ({
  data,
  meta: { page: 1, per_page: data.length, total: data.length, pages: 1 },
});

describe("getResearchLanding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(researchServiceApi.themes.list).mockResolvedValue(response([]));
    vi.mocked(researchServiceApi.projects.list).mockResolvedValue(response([]));
  });

  it("projects validated research collections into homepage display data", async () => {
    vi.mocked(researchServiceApi.themes.list).mockResolvedValue(
      response([
        {
          id: "theme-1",
          name: "Climate resilience",
          slug: "climate-resilience",
          description: "<p>Climate adaptation research</p>",
          is_active: true,
        },
      ]),
    );
    vi.mocked(researchServiceApi.projects.list).mockResolvedValue(
      response([
        {
          id: "project-1",
          title: "Water security",
          slug: "water-security",
          summary: "A public project",
          is_public: true,
          is_featured: true,
          cover_image_url: "/media/water.jpg",
          created_at: "2026-09-08T00:00:00Z",
          updated_at: "2026-09-08T00:00:00Z",
        },
      ]),
    );

    await expect(getResearchLanding()).resolves.toMatchObject({
      themes: [{ id: "theme-1", name: "Climate resilience" }],
      featuredProjects: [
        {
          id: "project-1",
          title: "Water security",
          imageUrl: "https://research.example.test/media/water.jpg",
        },
      ],
    });
    expect(noStore).not.toHaveBeenCalled();
    expect(getResearchApiBaseUrl).toHaveBeenCalled();
  });

  it("drops malformed successful collections and opts out of caching", async () => {
    vi.mocked(researchServiceApi.themes.list).mockResolvedValue({ data: "invalid" } as never);
    vi.mocked(researchServiceApi.projects.list).mockResolvedValue({ data: null } as never);

    await expect(getResearchLanding()).resolves.toEqual({
      themes: [],
      featuredProjects: [],
      featuredProject: null,
    });
    expect(noStore).toHaveBeenCalledTimes(2);
  });
});
