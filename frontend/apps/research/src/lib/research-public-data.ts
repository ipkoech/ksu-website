import {
  researchServiceApi,
  type ResearchGenericRecord,
  type ResearchGrant,
  type ResearchProject,
  type ResearchPublication,
} from "@ksu/api-client";
import type { PublicStatsResponse } from "@ksu/api-client";

export type PublicResearchData<T> = {
  data: T[];
  error: string | null;
};

export type ResearchOverviewData = {
  projects: PublicResearchData<ResearchProject>;
  publications: PublicResearchData<ResearchPublication>;
  grants: PublicResearchData<ResearchGrant>;
  innovations: PublicResearchData<ResearchGenericRecord>;
  partners: PublicResearchData<ResearchGenericRecord>;
  updates: PublicResearchData<ResearchGenericRecord>;
  stats: PublicStatsResponse | null;
  errors: string[];
};

const PUBLIC_RESEARCH_TIMEOUT_MS = 3000;

const unavailableMessage =
  "Research records are temporarily unavailable. Try again later or contact the research office.";

async function safeList<T>(
  load: () => Promise<{ data?: T[] }>,
): Promise<PublicResearchData<T>> {
  const request = load()
    .then((response) => ({ data: response.data ?? [], error: null }))
    .catch(() => ({ data: [], error: unavailableMessage }));

  const timeout = new Promise<PublicResearchData<T>>((resolve) => {
    setTimeout(
      () => resolve({ data: [], error: unavailableMessage }),
      PUBLIC_RESEARCH_TIMEOUT_MS,
    );
  });

  return Promise.race([request, timeout]);
}

async function safeStats() {
  try {
    const response = await researchServiceApi.stats();
    return response.data ?? null;
  } catch {
    return null;
  }
}

function uniqueErrors(...items: Array<string | null | undefined>) {
  return Array.from(new Set(items.filter(Boolean) as string[]));
}

export function getProjects(search?: string) {
  return safeList<ResearchProject>(() =>
    researchServiceApi.projects.list({
      search: search?.trim() || undefined,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getPublications(search?: string) {
  return safeList<ResearchPublication>(() =>
    researchServiceApi.publications.list({
      search: search?.trim() || undefined,
      status: "published",
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getGrants(search?: string) {
  return safeList<ResearchGrant>(() =>
    researchServiceApi.grants.list({
      search: search?.trim() || undefined,
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getInnovations(search?: string) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.innovations.list({
      search: search?.trim() || undefined,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getPartners(search?: string) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.partners.list({
      search: search?.trim() || undefined,
      status: "active",
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getCenters() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.centers.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getFacilities() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.farms.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getPrograms() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.programs.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getThemes() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.themes.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getFocusAreas() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.focusAreas.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getExpertiseTags() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.expertiseTags.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getJournals() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.journals.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getOutputs() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.outputs.list({
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getConsultancies() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.consultancies.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getFunders() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.funders.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getEndowments() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.endowments.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getGrantGuidelines() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.grantGuidelines.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getImpactMetrics() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.impactMetrics.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getStories() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.stories.list({
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getSustainability() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.sustainability.list({
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getTraining() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.training.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getMentorship() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.mentorship.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getScholarships() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.scholarships.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getEvents() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.events.list({
      status: "published",
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getArticles() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.articles.list({
      status: "published",
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getResources() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.resources.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getServices() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.services.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getGuidelines() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.guidelines.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getBoards() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.boards.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getBoardMembers() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.boardMembers.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getOffices() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.offices.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getOfficeStaff() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.officeStaff.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getDonationImpacts() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.donationImpacts.list({
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getDonationStories() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.donationStories.list({
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getUpdates() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.news.list({
      status: "published",
      is_active: true,
      page: 1,
      per_page: 6,
    }),
  );
}

export async function getResearchOverviewData(): Promise<ResearchOverviewData> {
  const [projects, publications, grants, innovations, partners, updates, stats] =
    await Promise.all([
      getProjects(),
      getPublications(),
      getGrants(),
      getInnovations(),
      getPartners(),
      getUpdates(),
      safeStats(),
    ]);

  return {
    projects,
    publications,
    grants,
    innovations,
    partners,
    updates,
    stats,
    errors: uniqueErrors(
      projects.error,
      publications.error,
      grants.error,
      innovations.error,
      partners.error,
      updates.error,
    ),
  };
}

export function compactText(value?: string | number | null) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}

export function formatLabel(value?: string | null) {
  return compactText(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return compactText(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
