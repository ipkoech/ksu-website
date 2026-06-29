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
  total: number;
  perPage: number;
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
  stats: PublicStatsResponse | null;
  errors: string[];
};

export type ProjectListFilters = {
  search?: string;
  projectType?: string;
  status?: string;
  centerId?: string;
  programId?: string;
  projectId?: string;
  partnerId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
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
  scholarshipType?: string;
  resourceType?: string;
  serviceType?: string;
  guidelineType?: string;
  centerId?: string;
  projectId?: string;
  partnerId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
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

const researchPublicListFields =
  "id,title,name,slug,code,summary,abstract,description,about,mission,vision,mandate,objectives,functions,services_summary,leadership_message,strategic_priorities,category,status,is_active,is_public,is_featured,project_type,publication_type,grant_type,center_type,farm_type,program_type,output_type,innovation_type,partner_type,consultancy_type,fund_type,event_type,article_type,news_type,resource_type,service_type,guideline_type,scholarship_type,delivery_mode,access_type,development_stage,ip_status,commercialization_status,partnership_level,client_type,center_id,program_id,project_id,partner_id,year,start_date,end_date,deadline,event_date,published_at,publication_date,cover_image_url,logo_url,url,pdf_url,website";

const researchPublicDetailFields = `${researchPublicListFields},background,objectives,methodology,expected_outcomes,impact,deliverables,budget,currency,funder_name,journal_name,publisher,volume,issue,pages,article_number,conference_name,conference_location,conference_date,book_title,editors,edition,isbn,issn,doi,pmid,arxiv_id,is_open_access,impact_factor,quartile,h_index,funding_acknowledgment,contact_email,contact_phone,email,phone,address,location,venue,registration_url,application_url,download_url,file_url,eligibility,requirements,benefits,scope,content,body,rich_text,plain_text,mission,vision,mandate,head_message,office_location,social_links`;

async function safeList<T>(
  load: () => Promise<{
    data?: T[];
    meta?: { total?: number; per_page?: number };
  }>,
): Promise<PublicResearchData<T>> {
  const defaults = {
    data: [] as T[],
    total: 0,
    perPage: 100,
    error: unavailableMessage,
  };
  const request = load()
    .then((response) => ({
      data: response.data ?? [],
      total: response.meta?.total ?? 0,
      perPage: response.meta?.per_page ?? 100,
      error: null,
    }))
    .catch(() => ({ ...defaults }));

  const timeout = new Promise<PublicResearchData<T>>((resolve) => {
    setTimeout(() => resolve({ ...defaults }), PUBLIC_RESEARCH_TIMEOUT_MS);
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

export function getProjects(
  filters: string | ProjectListFilters = {},
  page = 1,
) {
  const params = typeof filters === "string" ? { search: filters } : filters;

  return safeList<ResearchProject>(() =>
    researchServiceApi.projects.list({
      fields: researchPublicListFields,
      search: params.search?.trim() || undefined,
      project_type: params.projectType || undefined,
      status: params.status || undefined,
      center_id: params.centerId || undefined,
      program_id: params.programId || undefined,
      project_id: params.projectId || undefined,
      year: parseYear(params.year),
      sort: params.sort || undefined,
      order: params.order,
      is_active: params.isActive ?? true,
      is_featured: params.isFeatured,
      is_public: true,
      page,
      per_page: 100,
    }),
  );
}

export function getProjectBySlug(slug: string) {
  return safeRecord<ResearchProject>(() =>
    researchServiceApi.projects.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getPublications(search?: string) {
  return safeList<ResearchPublication>(() =>
    researchServiceApi.publications.list({
      fields: researchPublicListFields,
      search: search?.trim() || undefined,
      status: "published",
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getPublicationsFiltered(
  filters: GenericListFilters = {},
  page = 1,
) {
  return safeList<ResearchPublication>(() =>
    researchServiceApi.publications.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      status: filters.status || "published",
      publication_type: filters.publicationType || undefined,
      access_type: filters.accessType || undefined,
      center_id: filters.centerId || undefined,
      project_id: filters.projectId || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: filters.isActive ?? true,
      is_featured: filters.isFeatured,
      is_public: true,
      page,
      per_page: 100,
    }),
  );
}

export function getProjectPublications(projectId: string) {
  return safeList<ResearchPublication>(() =>
    researchServiceApi.publications.list({
      fields: researchPublicListFields,
      project_id: projectId,
      status: "published",
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getCenterPublications(centerId: string) {
  return safeList<ResearchPublication>(() =>
    researchServiceApi.publications.list({
      fields: researchPublicListFields,
      center_id: centerId,
      status: "published",
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getPublicationBySlug(slug: string) {
  return safeRecord<ResearchPublication>(() =>
    researchServiceApi.publications.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getGrants(search?: string) {
  return safeList<ResearchGrant>(() =>
    researchServiceApi.grants.list({
      fields: researchPublicListFields,
      search: search?.trim() || undefined,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getGrantsFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGrant>(() =>
    researchServiceApi.grants.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      grant_type: filters.grantType || undefined,
      category: filters.category || undefined,
      status: filters.status || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: filters.isActive ?? true,
      is_featured: filters.isFeatured,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getGrantBySlug(slug: string) {
  return safeRecord<ResearchGrant>(() =>
    researchServiceApi.grants.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getInnovations(search?: string) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.innovations.list({
      fields: researchPublicListFields,
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
      fields: researchPublicListFields,
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
      is_active: filters.isActive ?? true,
      is_featured: filters.isFeatured,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getInnovationBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.innovations.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getPartners(search?: string) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.partners.list({
      fields: researchPublicListFields,
      search: search?.trim() || undefined,
      status: "active",
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getPartnersFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.partners.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      partner_id: filters.partnerId || undefined,
      partnership_level: filters.partnershipLevel || undefined,
      status: filters.status || "active",
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getPartnerBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.partners.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getCenters() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.centers.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getCentersFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.centers.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      center_type: filters.centerType || undefined,
      status: filters.status || undefined,
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: filters.isActive ?? true,
      is_featured: filters.isFeatured,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getCenterProjects(centerId: string) {
  return safeList<ResearchProject>(() =>
    researchServiceApi.projects.list({
      fields: researchPublicListFields,
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
    researchServiceApi.centers.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getFacilities() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.farms.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getFacilitiesFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.farms.list({
      fields: researchPublicListFields,
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
    researchServiceApi.farms.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getFarmProjects() {
  return safeList<ResearchProject>(() =>
    researchServiceApi.projects.list({
      fields: researchPublicListFields,
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
      fields: researchPublicListFields,
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
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      event_type: "workshop",
      page: 1,
      per_page: 100,
    }),
  );
}

export function getPrograms() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.programs.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getProgramsFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.programs.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      status: filters.status || undefined,
      category: filters.category || undefined,
      center_id: filters.centerId || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: filters.isActive ?? true,
      is_featured: filters.isFeatured,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getProgramBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.programs.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getProgramProjects(programId: string) {
  return safeList<ResearchProject>(() =>
    researchServiceApi.projects.list({
      fields: researchPublicListFields,
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
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getFocusAreas() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.focusAreas.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getExpertiseTags() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.expertiseTags.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getJournals() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.journals.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getOutputs() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.outputs.list({
      fields: researchPublicListFields,
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
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      status: filters.status || undefined,
      output_type: filters.outputType || undefined,
      access_type: filters.accessType || undefined,
      center_id: filters.centerId || undefined,
      project_id: filters.projectId || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: filters.isActive ?? true,
      is_featured: filters.isFeatured,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getRelatedOutputs(filters: RelationshipFilters) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.outputs.list({
      fields: researchPublicListFields,
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
    researchServiceApi.outputs.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getConsultancies() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.consultancies.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getConsultanciesFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.consultancies.list({
      fields: researchPublicListFields,
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
    researchServiceApi.consultancies.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getFunders() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.funders.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getEndowments() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.endowments.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getEndowmentsFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.endowments.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      fund_type: filters.fundType || undefined,
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

export function getEndowmentBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.endowments.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getGrantGuidelines() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.grantGuidelines.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getGrantGuidelineBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.grantGuidelines.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getImpactMetrics() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.impactMetrics.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getStories() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.stories.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getStoryBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.stories.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getSustainability() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.sustainability.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getSustainabilityBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.sustainability.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getSustainabilityPartners() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.partners.list({
      fields: researchPublicListFields,
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
      fields: researchPublicListFields,
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
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getTrainingFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.training.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      program_type: filters.programType || undefined,
      delivery_mode: filters.deliveryMode || undefined,
      category: filters.category || undefined,
      center_id: filters.centerId || undefined,
      status: filters.status || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: filters.isActive ?? true,
      is_featured: filters.isFeatured,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getTrainingBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.training.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getMentorship() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.mentorship.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getMentorshipFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.mentorship.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      program_type: filters.programType || undefined,
      center_id: filters.centerId || undefined,
      status: filters.status || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: filters.isActive ?? true,
      is_featured: filters.isFeatured,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getMentorshipBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.mentorship.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getScholarships() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.scholarships.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getScholarshipsFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.scholarships.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      scholarship_type: filters.scholarshipType || undefined,
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

export function getScholarshipBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.scholarships.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getEvents() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.events.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getEventsFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.events.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      event_type: filters.eventType || undefined,
      category: filters.category || undefined,
      center_id: filters.centerId || undefined,
      status: filters.status || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: filters.isActive ?? true,
      is_featured: filters.isFeatured,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getEventBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.events.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getArticles() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.articles.list({
      fields: researchPublicListFields,
      status: "published",
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getArticlesFiltered(
  filters: GenericListFilters = {},
  page = 1,
) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.articles.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      article_type: filters.articleType || undefined,
      category: filters.category || undefined,
      center_id: filters.centerId || undefined,
      project_id: filters.projectId || undefined,
      status: filters.status || "published",
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: filters.isActive ?? true,
      is_featured: filters.isFeatured,
      is_public: true,
      page,
      per_page: 100,
    }),
  );
}

export function getArticleBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.articles.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getResources() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.resources.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getResourcesFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.resources.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      resource_type: filters.resourceType || undefined,
      category: filters.category || undefined,
      center_id: filters.centerId || undefined,
      access_type: filters.accessType || undefined,
      status: filters.status || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: filters.isActive ?? true,
      is_featured: filters.isFeatured,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getResourceBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.resources.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getServices() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.services.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getServicesFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.services.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      service_type: filters.serviceType || undefined,
      category: filters.category || undefined,
      center_id: filters.centerId || undefined,
      status: filters.status || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: filters.isActive ?? true,
      is_featured: filters.isFeatured,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getServiceBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.services.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getGuidelines() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.guidelines.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getGuidelinesFiltered(filters: GenericListFilters = {}) {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.guidelines.list({
      fields: researchPublicListFields,
      search: filters.search?.trim() || undefined,
      guideline_type: filters.guidelineType || undefined,
      category: filters.category || undefined,
      status: filters.status || undefined,
      year: parseYear(filters.year),
      sort: filters.sort || undefined,
      order: filters.order,
      is_active: filters.isActive ?? true,
      is_featured: filters.isFeatured,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getGuidelineBySlug(slug: string) {
  return safeRecord<ResearchGenericRecord>(() =>
    researchServiceApi.guidelines.getBySlug(slug, {
      fields: researchPublicDetailFields,
    }),
  );
}

export function getBoards() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.boards.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getDonationImpacts() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.donationImpacts.list({
      fields: researchPublicListFields,
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
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export function getDonationSettings() {
  return safeList<ResearchGenericRecord>(() =>
    researchServiceApi.donationSettings.list({
      fields: researchPublicListFields,
      is_active: true,
      is_public: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export async function getResearchOverviewData(): Promise<ResearchOverviewData> {
  const [
    projects,
    publications,
    grants,
    innovations,
    partners,
    stats,
  ] = await Promise.all([
    getProjects(),
    getPublications(),
    getGrants(),
    getInnovations(),
    getPartners(),
    safeStats(),
  ]);

  return {
    projects,
    publications,
    grants,
    innovations,
    partners,
    stats,
    errors: uniqueErrors(
      projects.error,
      publications.error,
      grants.error,
      innovations.error,
      partners.error,
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

type ListFn = (params?: Record<string, string | number | boolean | undefined>) => Promise<{ data?: Array<{ slug?: string }> }>;

export async function generateSlugParams(listFn: ListFn, filterExtra: Record<string, string | number | boolean | undefined> = {}): Promise<{ slug: string }[]> {
  try {
    const response = await listFn({ per_page: 50, fields: "slug", is_public: true, is_active: true, ...filterExtra });
    return (response.data ?? []).filter((item) => item.slug).map((item) => ({ slug: item.slug! }));
  } catch {
    return [];
  }
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
