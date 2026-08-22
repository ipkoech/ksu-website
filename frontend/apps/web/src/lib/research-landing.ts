import { getResearchApiBaseUrl, researchServiceApi } from "@ksu/api-client";

export type ResearchLandingTheme = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type ResearchLandingProject = {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  status?: string | null;
  expectedOutcomes?: string | null;
  /** The project's own photography, when the record carries a cover. */
  imageUrl?: string | null;
  /** The published impact statement, as written by the research office. */
  impact?: string | null;
};

export type ResearchLandingData = {
  themes: ResearchLandingTheme[];
  /** Every featured project the research office publishes, in its own order. */
  featuredProjects: ResearchLandingProject[];
  /** The first of those, kept for callers that show a single project. */
  featuredProject: ResearchLandingProject | null;
};

const htmlEntities: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function plainExcerpt(value: unknown, max = 200) {
  if (typeof value !== "string") return null;
  const text = value
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (entity) => htmlEntities[entity] ?? " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return null;
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** Research media is stored relative to the research service, which is a
 *  different origin from the main gateway the page is served through. */
function researchAssetUrl(value: unknown): string | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const path = value.trim();
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return new URL(
    path.startsWith("/") ? path : `/${path}`,
    getResearchApiBaseUrl(),
  ).toString();
}

/** Research themes and the featured project, straight from the research service. */
export async function getResearchLanding(): Promise<ResearchLandingData> {
  const [themesResult, projectsResult] = await Promise.allSettled([
    researchServiceApi.themes.list({
      per_page: 6,
      is_active: true,
      sort: "display_order",
    }),
    // Every featured project, not just the first: the homepage band shows the
    // research office's whole featured set and it decides how many that is.
    researchServiceApi.projects.list({
      per_page: 6,
      is_featured: true,
      is_public: true,
    }),
  ]);

  const themes =
    themesResult.status === "fulfilled"
      ? (themesResult.value.data ?? [])
          .filter((theme) => theme.is_active !== false)
          .slice(0, 4)
          .map((theme) => ({
            id: theme.id,
            name: theme.name ?? theme.title ?? "Research theme",
            slug: theme.slug ?? theme.id,
            description: plainExcerpt(theme.description, 140),
          }))
      : [];

  const featuredProjects =
    projectsResult.status === "fulfilled"
      ? (projectsResult.value.data ?? []).map((project) => ({
          id: project.id,
          title: project.title ?? "Featured research project",
          slug: project.slug ?? project.id,
          summary:
            plainExcerpt(project.summary, 220) ??
            plainExcerpt(project.expected_outcomes, 220),
          status: typeof project.status === "string" ? project.status : null,
          expectedOutcomes: plainExcerpt(project.expected_outcomes, 180),
          imageUrl: researchAssetUrl(project.cover_image_url),
          impact: plainExcerpt(project.impact, 200),
        }))
      : [];

  return {
    themes,
    featuredProjects,
    featuredProject: featuredProjects[0] ?? null,
  };
}
