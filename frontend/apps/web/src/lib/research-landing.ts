import { researchServiceApi } from "@ksu/api-client";

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
};

export type ResearchLandingData = {
  themes: ResearchLandingTheme[];
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

/** Research themes and the featured project, straight from the research service. */
export async function getResearchLanding(): Promise<ResearchLandingData> {
  const [themesResult, projectsResult] = await Promise.allSettled([
    researchServiceApi.themes.list({
      per_page: 6,
      is_active: true,
      sort: "display_order",
    }),
    researchServiceApi.projects.list({
      per_page: 1,
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

  const project =
    projectsResult.status === "fulfilled"
      ? (projectsResult.value.data ?? [])[0]
      : undefined;

  return {
    themes,
    featuredProject: project
      ? {
          id: project.id,
          title: project.title ?? "Featured research project",
          slug: project.slug ?? project.id,
          summary:
            plainExcerpt(project.summary, 220) ??
            plainExcerpt(project.expected_outcomes, 220),
          status: typeof project.status === "string" ? project.status : null,
          expectedOutcomes: plainExcerpt(project.expected_outcomes, 180),
        }
      : null,
  };
}
