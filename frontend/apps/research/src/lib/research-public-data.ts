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

export type PublicResearchRecord<T> = {
  data: T | null;
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

export type ProjectListFilters = {
  search?: string;
  projectType?: string;
  status?: string;
  centerId?: string;
  projectId?: string;
  partnerId?: string;
  year?: string;
  sort?: string;
  order?: "asc" | "desc";
};

export type GenericListFilters = {
  search?: string;
  status?: string;
  category?: string;
  grantType?: string;
  centerType?: string;
  farmType?: string;
  publicationType?: string;
  outputType?: string;
  accessType?: string;
  innovationType?: string;
  developmentStage?: string;
  ipStatus?: string;
  commercializationStatus?: string;
  partnerType?: string;
  partnershipLevel?: string;
  consultancyType?: string;
  clientType?: string;
  fundType?: string;
  programType?: string;
  deliveryMode?: string;
  eventType?: string;
  newsType?: string;
  articleType?: string;
  centerId?: string;
  projectId?: string;
  partnerId?: string;
  year?: string;
  sort?: string;
  order?: "asc" | "desc";
};

export type RelationshipFilters = {
  projectId?: string;
  centerId?: string;
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

async function safeRecord<T>(
  load: () => Promise<{ data?: T }>,
): Promise<PublicResearchRecord<T>> {
  const request = load()
    .then((response) => ({ data: response.data ?? null, error: null }))
    .catch(() => ({ data: null, error: unavailableMessage }));

  const timeout = new Promise<PublicResearchRecord<T>>((resolve) => {
    setTimeout(
      () => resolve({ data: null, error: unavailableMessage }),
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

export function getProjects(filters: string | ProjectListFilters = {}) {
  const params =
    typeof filters === "string" ? { search: filters } : filters;

  return safeList<ResearchProject>(() =>
    researchServiceApi.projects.list({
      search: params.search?.trim() || undefined,
      project_type: params.projectType || undefined,
      status: params.status || undefined,
      center_id: params.centerId || undefined,
      project_id: params.projectId || undefined,
      year: parseYear(params.year),
      sort: params.sort || undefined,
      order: params.order,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getProjectBySlug(slug: string) {
  return safeRecord<ResearchProject>(() => researchServiceApi.projects.getBySlug(slug));
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

export function getPublicationsFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchPublication>(() =>
    researchServiceApi.publications.list({
      search: filters.search?.trim() || undefined,
      status: filters.status || "published",
      publication_type: filters.publicationType || undefined,
      access_type: filters.accessType || undefined,
      center_id: filters.centerId || undefined,
      project_id: filters.projectId || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getProjectPublications(projectId: string) {
  return safeList<ResearchPublication>(() =>
    researchServiceApi.publications.list({
      project_id: projectId,
      status: "published",
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getCenterPublications(centerId: string) {
  return safeList<ResearchPublication>(() =>
    researchServiceApi.publications.list({
      center_id: centerId,
      status: "published",
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getPublicationBySlug(slug: string) {
  return safeRecord<ResearchPublication>(() =>
    researchServiceApi.publications.getBySlug(slug),
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

export function getGrantsFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGrant>(() =>
    researchServiceApi.grants.list({
      search: filters.search?.trim() || undefined,
      grant_type: filters.grantType || undefined,
      category: filters.category || undefined,
      status: filters.status || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getGrantBySlug(slug: string) {
  return safeRecord<ResearchGrant>(() => researchServiceApi.grants.getBySlug(slug));
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

export function getInnovationsFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.innovations.list({
      search: filters.search?.trim() || undefined,
      innovation_type: filters.innovationType || undefined,
      development_stage: filters.developmentStage || undefined,
      ip_status: filters.ipStatus || undefined,
      commercialization_status: filters.commercializationStatus || undefined,
      category: filters.category || undefined,
      center_id: filters.centerId || undefined,
      project_id: filters.projectId || undefined,
      status: filters.status || undefined,
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getInnovationBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.innovations.getBySlug(slug),
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

export function getPartnersFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.partners.list({
      search: filters.search?.trim() || undefined,
      partner_id: filters.partnerId || undefined,
      partnership_level: filters.partnershipLevel || undefined,
      status: filters.status || "active",
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getPartnerBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.partners.getBySlug(slug),
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

export function getCentersFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.centers.list({
      search: filters.search?.trim() || undefined,
      center_type: filters.centerType || undefined,
      status: filters.status || undefined,
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getCenterProjects(centerId: string) {
  return safeList<ResearchProject>(() =>
    researchServiceApi.projects.list({
      center_id: centerId,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getCenterBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.centers.getBySlug(slug),
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

export function getFacilitiesFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.farms.list({
      search: filters.search?.trim() || undefined,
      farm_type: filters.farmType || undefined,
      center_id: filters.centerId || undefined,
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getFarmBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.farms.getBySlug(slug),
  );
}

export function getFarmProjects() {
  return safeList<ResearchProject>(() =>
    researchServiceApi.projects.list({
      is_active: true,
      is_public: true,
      project_type: "action",
      page: 1,
      per_page: 100,
    }),
  );
}

export function getFarmPartners() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.partners.list({
      is_active: true,
      is_public: true,
      status: "active",
      partner_type: "community",
      page: 1,
      per_page: 100,
    }),
  );
}

export function getFarmActivities() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.events.list({
      is_active: true,
      event_type: "workshop",
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

export function getProgramsFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.programs.list({
      search: filters.search?.trim() || undefined,
      status: filters.status || undefined,
      category: filters.category || undefined,
      center_id: filters.centerId || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getProgramBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.programs.getBySlug(slug),
  );
}

export function getProgramProjects(programId: string) {
  return safeList<ResearchProject>(() =>
    researchServiceApi.projects.list({
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
      program_id: programId,
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

export function getOutputsFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.outputs.list({
      search: filters.search?.trim() || undefined,
      status: filters.status || undefined,
      output_type: filters.outputType || undefined,
      access_type: filters.accessType || undefined,
      center_id: filters.centerId || undefined,
      project_id: filters.projectId || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getRelatedOutputs(filters: RelationshipFilters) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.outputs.list({
      project_id: filters.projectId || undefined,
      center_id: filters.centerId || undefined,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getOutputBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.outputs.getBySlug(slug),
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

export function getConsultanciesFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.consultancies.list({
      search: filters.search?.trim() || undefined,
      consultancy_type: filters.consultancyType || undefined,
      client_type: filters.clientType || undefined,
      partner_type: filters.partnerType || undefined,
      center_id: filters.centerId || undefined,
      status: filters.status || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getConsultancyBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.consultancies.getBySlug(slug),
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

export function getEndowmentsFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.endowments.list({
      search: filters.search?.trim() || undefined,
      fund_type: filters.fundType || undefined,
      status: filters.status || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getEndowmentBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.endowments.getBySlug(slug),
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

export function getGrantGuidelineBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.grantGuidelines.getBySlug(slug),
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

export function getStoryBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.stories.getBySlug(slug),
  );
}

export function getSustainability() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.sustainability.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getSustainabilityBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.sustainability.getBySlug(slug),
  );
}

export function getSustainabilityPartners() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.partners.list({
      is_active: true,
      is_public: true,
      status: "active",
      page: 1,
      per_page: 100,
    }),
  );
}

export function getSustainabilityActivities() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.events.list({
      is_active: true,
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

export function getTrainingFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.training.list({
      search: filters.search?.trim() || undefined,
      program_type: filters.programType || undefined,
      delivery_mode: filters.deliveryMode || undefined,
      category: filters.category || undefined,
      center_id: filters.centerId || undefined,
      status: filters.status || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getTrainingBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.training.getBySlug(slug),
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

export function getMentorshipFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.mentorship.list({
      search: filters.search?.trim() || undefined,
      program_type: filters.programType || undefined,
      center_id: filters.centerId || undefined,
      status: filters.status || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getMentorshipBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.mentorship.getBySlug(slug),
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

export function getScholarshipBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.scholarships.getBySlug(slug),
  );
}

export function getEvents() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.events.list({
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getEventsFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.events.list({
      search: filters.search?.trim() || undefined,
      event_type: filters.eventType || undefined,
      category: filters.category || undefined,
      center_id: filters.centerId || undefined,
      status: filters.status || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getEventBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.events.getBySlug(slug),
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

export function getArticlesFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.articles.list({
      search: filters.search?.trim() || undefined,
      article_type: filters.articleType || undefined,
      category: filters.category || undefined,
      center_id: filters.centerId || undefined,
      project_id: filters.projectId || undefined,
      status: filters.status || "published",
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getArticleBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.articles.getBySlug(slug),
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

export function getResourceBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.resources.getBySlug(slug),
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

export function getServiceBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.services.getBySlug(slug),
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

export function getGuidelineBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.guidelines.getBySlug(slug),
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

export function getUpdatesFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.news.list({
      search: filters.search?.trim() || undefined,
      news_type: filters.newsType || undefined,
      category: filters.category || undefined,
      center_id: filters.centerId || undefined,
      project_id: filters.projectId || undefined,
      status: filters.status || "published",
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getNewsBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.news.getBySlug(slug),
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

function parseYear(value?: string) {
  if (!value) return undefined;
  const year = Number(value);
  return Number.isInteger(year) ? year : undefined;
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
