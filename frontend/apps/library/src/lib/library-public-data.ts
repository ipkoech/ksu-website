import {
  blogsApi,
  eventsApi,
  libraryServiceApi,
  newsApi,
  type Blog,
  type Event,
  type LibraryBranch,
  type LibraryElectronicResource,
  type LibraryExternalLink,
  type LibraryFile,
  type LibraryGuide,
  type LibraryGuideType,
  type LibraryHours,
  type LibraryAssistantContext,
  type LibraryPolicyPage,
  type LibraryPolicyType,
  type LibraryRegulation,
  type LibraryResource,
  type LibraryServiceRecord,
  type LibraryStaff,
  type LibrarySearchResponse,
  type LibraryTodayHours,
  type LibrarySpecialist,
  type LibraryWorkflow,
  type LibraryWorkflowType,
  type LibrarySearchResult,
  type News,
} from "@ksu/api-client";
import type { PublicStatsResponse } from "@ksu/api-client";

export type PublicLibraryData<T> = {
  data: T[];
  meta: { total: number; page: number; per_page: number; pages: number } | null;
  error: string | null;
};

export type CatalogSearchData = {
  branches: PublicLibraryData<LibraryBranch>;
  resources: PublicLibraryData<LibraryResource>;
  selectedLibraryId: string;
  query: string;
  resourceType: string;
  status: string;
};

export type BranchServices = {
  branch: LibraryBranch;
  services: LibraryServiceRecord[];
};

export type BranchHours = {
  branch: LibraryBranch;
  hours: LibraryHours[];
};

export type BranchFiles = {
  branch: LibraryBranch;
  files: LibraryFile[];
};

export type BranchLinks = {
  branch: LibraryBranch;
  links: LibraryExternalLink[];
};

export type BranchStaff = {
  branch: LibraryBranch;
  staff: LibraryStaff[];
};

export type LibraryOverviewData = {
  branches: PublicLibraryData<LibraryBranch>;
  catalog: PublicLibraryData<LibraryResource>;
  electronic: PublicLibraryData<LibraryElectronicResource>;
  services: PublicLibraryData<LibraryServiceRecord>;
  regulations: PublicLibraryData<LibraryRegulation>;
  todayHours: PublicLibraryData<LibraryTodayHours>;
  news: PublicLibraryData<News>;
  events: PublicLibraryData<Event>;
  articles: PublicLibraryData<Blog>;
  stats: PublicStatsResponse | null;
  errors: string[];
};

export type LibraryServicesData = {
  branches: PublicLibraryData<LibraryBranch>;
  groupedServices: BranchServices[];
  regulations: PublicLibraryData<LibraryRegulation>;
  errors: string[];
};

export type LibraryAboutData = {
  branches: PublicLibraryData<LibraryBranch>;
  primaryBranch: LibraryBranch | null;
  errors: string[];
};

export type LibraryHoursData = {
  branches: PublicLibraryData<LibraryBranch>;
  groupedHours: BranchHours[];
  errors: string[];
};

export type LibraryDownloadsData = {
  branches: PublicLibraryData<LibraryBranch>;
  groupedFiles: BranchFiles[];
  errors: string[];
};

export type LibraryLinksData = {
  branches: PublicLibraryData<LibraryBranch>;
  groupedLinks: BranchLinks[];
  errors: string[];
};

export type LibraryStaffData = {
  branches: PublicLibraryData<LibraryBranch>;
  groupedStaff: BranchStaff[];
  errors: string[];
};

export type LibrarySearchData = {
  branches: PublicLibraryData<LibraryBranch>;
  catalog: PublicLibraryData<LibraryResource>;
  electronic: PublicLibraryData<LibraryElectronicResource>;
  unified: LibrarySearchResponse | null;
  editorial: PublicLibraryData<LibrarySearchResult>;
  selectedLibraryId: string;
  query: string;
  errors: string[];
};

export type LibraryGuidesData = {
  branches: PublicLibraryData<LibraryBranch>;
  guides: PublicLibraryData<LibraryGuide>;
  specialists: PublicLibraryData<LibrarySpecialist>;
  query: string;
  guideType: string;
  subject: string;
  courseCode: string;
  audience: string;
  errors: string[];
};

export type LibraryGuideDetailData = {
  branches: PublicLibraryData<LibraryBranch>;
  guide: { data: LibraryGuide | null; error: string | null };
  specialists: PublicLibraryData<LibrarySpecialist>;
  errors: string[];
};

export type LibrarySpecialistsData = {
  branches: PublicLibraryData<LibraryBranch>;
  specialists: PublicLibraryData<LibrarySpecialist>;
  query: string;
  subject: string;
  school: string;
  department: string;
  supportArea: string;
  errors: string[];
};

export type LibraryWorkflowDetailData = {
  branches: PublicLibraryData<LibraryBranch>;
  workflow: { data: LibraryWorkflow | null; error: string | null };
  errors: string[];
};

export type LibraryPoliciesData = {
  branches: PublicLibraryData<LibraryBranch>;
  policies: PublicLibraryData<LibraryPolicyPage>;
  policyType: string;
  errors: string[];
};

export type LibraryPolicyDetailData = {
  branches: PublicLibraryData<LibraryBranch>;
  policy: { data: LibraryPolicyPage | null; error: string | null };
  errors: string[];
};

export type LibraryContentData<T> = {
  records: PublicLibraryData<T>;
  query: string;
  errors: string[];
};

const PUBLIC_LIBRARY_TIMEOUT_MS = 3000;

const unavailableMessage =
  "Library records are temporarily unavailable. Try again later or contact the library desk.";

const branchFields =
  "id,name,code,short_name,slug,description,about_content,objectives,mandates,regulations,mission,vision,address,location,email,contact_email,phone,contact_phone,website_url,catalogue_url,ebooks_url,repositories_url,opening_hours,library_type,is_active,is_public,sort_order";
const catalogFields =
  "id,library_id,title,subtitle,authors,author,publisher,publication_year,edition,language,isbn,issn,call_number,resource_type,type,status,location_shelf,location,total_copies,quantity,available_copies,available_quantity,subject_tags,description,url,cover_image,is_loanable,is_available,is_reference_only,is_active";
const electronicFields =
  "id,name,title,slug,provider,description,access_url,url,section_letter,resource_type,type,subjects,coverage_dates,simultaneous_users,access_level,access_type,requires_vpn,requires_registration,is_active,is_available,is_featured,sort_order,logo_image_id,notes";
const serviceFields =
  "id,library_id,name,slug,description,eligibility,service_type,how_to_access,contact_info,is_public,is_active,sort_order,icon_media_id";
const regulationFields =
  "id,library_id,title,slug,category,content,effective_date,status,is_public,sort_order";
const staffFields =
  "id,library_id,person_id,job_title,department,department_section,role,is_public,is_active,bio,specialization,sort_order";
const specialistFields =
  "id,library_id,staff_id,subjects,schools,departments,support_areas,booking_url,is_public,is_active,sort_order";
const guideFields =
  "id,library_id,title,slug,summary,guide_type,subject,course_code,audience,school_id,department_id,owner_staff_id,is_public,is_active,sort_order,created_at,updated_at";
const guideDetailFields =
  "id,library_id,title,slug,summary,guide_type,subject,course_code,audience,school_id,department_id,owner_staff_id,is_public,is_active,sort_order,created_at,updated_at,sections(id,guide_id,heading,content,section_type,resource_links,file_ids,sort_order,is_active)";
const workflowDetailFields =
  "id,library_id,workflow_type,title,slug,summary,audience,is_public,is_active,sort_order,created_at,updated_at,steps(id,workflow_id,title,instructions,link_url,file_id,sort_order,is_active)";
const policyFields =
  "id,library_id,policy_type,title,slug,content,related_regulation_id,file_id,is_public,status,sort_order,created_at,updated_at";
const branchFileFields =
  "id,library_id,media_id,title,description,file_category,access_level,is_public,sort_order,related_entity_type,related_entity_id,file_url,thumbnail_url";
const branchLinkFields =
  "id,library_id,link_type,label,url,description,is_active,opens_in_new_tab,icon,sort_order";
const editorialFields =
  "id,title,slug,summary,excerpt,plain_text,rich_text,content,category,published_at,start_date,end_date,location,venue,is_virtual,created_at";

type OpeningHoursMap = Record<string, string>;

async function safeList<T>(
  load: () => Promise<{ data?: T[]; meta?: unknown }>,
): Promise<PublicLibraryData<T>> {
  const request = load()
    .then((response) => ({
      data: response.data ?? [],
      meta: (response.meta as PublicLibraryData<T>["meta"]) ?? null,
      error: null,
    }))
    .catch(() => ({ data: [], meta: null, error: unavailableMessage }));

  const timeout = new Promise<PublicLibraryData<T>>((resolve) => {
    setTimeout(
      () => resolve({ data: [], meta: null, error: unavailableMessage }),
      PUBLIC_LIBRARY_TIMEOUT_MS,
    );
  });

  return Promise.race([request, timeout]);
}

function normalizeList<T>(
  result: PublicLibraryData<T>,
  normalize: (item: T) => T,
): PublicLibraryData<T> {
  return {
    ...result,
    data: result.data.map(normalize),
  };
}

async function safeStats() {
  try {
    const response = await libraryServiceApi.stats();
    return response.data ?? null;
  } catch {
    return null;
  }
}

async function safeRecord<T>(
  load: () => Promise<{ data?: T | null }>,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await load();
    return { data: response.data ?? null, error: null };
  } catch {
    return { data: null, error: unavailableMessage };
  }
}

function uniqueErrors(...items: Array<string | null | undefined>) {
  return Array.from(new Set(items.filter(Boolean) as string[]));
}

async function collectByBranch<T>(
  branches: LibraryBranch[],
  load: (branch: LibraryBranch) => Promise<PublicLibraryData<T>>,
) {
  return Promise.all(
    branches.map(async (branch) => {
      const result = await load(branch);
      return { branch, result };
    }),
  );
}

function isOpeningHoursMap(value: unknown): value is OpeningHoursMap {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function normalizeBranch(branch: LibraryBranch): LibraryBranch {
  return {
    ...branch,
    slug: branch.slug ?? branch.code ?? branch.id,
    short_name: branch.short_name ?? branch.code ?? null,
    description: branch.description ?? branch.about_content ?? null,
    objectives: branch.objectives ?? branch.mandates ?? null,
    address: branch.address ?? branch.location ?? null,
    email: branch.email ?? branch.contact_email ?? null,
    phone: branch.phone ?? branch.contact_phone ?? null,
    website_url:
      branch.website_url ??
      branch.catalogue_url ??
      branch.ebooks_url ??
      branch.repositories_url ??
      null,
  };
}

function normalizeResource(resource: LibraryResource): LibraryResource {
  const availableCopies =
    resource.available_copies ?? resource.available_quantity ?? undefined;
  const totalCopies = resource.total_copies ?? resource.quantity ?? undefined;
  const isAvailable =
    resource.is_available ??
    (resource.status
      ? resource.status === "available"
      : availableCopies === undefined
        ? undefined
        : availableCopies > 0);

  return {
    ...resource,
    authors: resource.authors ?? resource.author ?? null,
    resource_type: resource.resource_type ?? resource.type ?? undefined,
    status:
      resource.status ??
      (isAvailable === undefined
        ? undefined
        : isAvailable
          ? "available"
          : "unavailable"),
    location_shelf: resource.location_shelf ?? resource.location ?? null,
    available_copies: availableCopies,
    total_copies: totalCopies,
    is_loanable: resource.is_loanable ?? isAvailable,
  };
}

function normalizeElectronicResource(
  resource: LibraryElectronicResource,
): LibraryElectronicResource {
  const name = resource.name ?? resource.title ?? "Untitled resource";

  return {
    ...resource,
    name,
    access_url: resource.access_url ?? resource.url ?? null,
    resource_type: resource.resource_type ?? resource.type ?? "database",
    section_letter: resource.section_letter ?? name.charAt(0).toUpperCase(),
    is_active: resource.is_active ?? resource.is_available,
  };
}

function normalizeService(service: LibraryServiceRecord): LibraryServiceRecord {
  return {
    ...service,
    service_type: service.service_type ?? "service",
    is_public: service.is_public ?? service.is_active,
    is_active: service.is_active ?? service.is_public,
  };
}

function normalizeStaff(member: LibraryStaff): LibraryStaff {
  return {
    ...member,
    job_title: member.job_title ?? member.person?.title ?? null,
    department: member.department ?? member.department_section ?? null,
  };
}

function normalizeSpecialist(specialist: LibrarySpecialist): LibrarySpecialist {
  return {
    ...specialist,
    subjects: specialist.subjects ?? [],
    schools: specialist.schools ?? [],
    departments: specialist.departments ?? [],
    support_areas: specialist.support_areas ?? [],
  };
}

function normalizeGuide(guide: LibraryGuide): LibraryGuide {
  return {
    ...guide,
    sections: guide.sections ?? [],
    specialists: (guide.specialists ?? []).map(normalizeSpecialist),
  };
}

function normalizeWorkflow(workflow: LibraryWorkflow): LibraryWorkflow {
  return {
    ...workflow,
    steps: workflow.steps ?? [],
  };
}

function selectPublishedWorkflow(workflows: LibraryWorkflow[]) {
  return (
    workflows
      .filter((workflow) => workflow.is_public && workflow.is_active)
      .sort((left, right) => left.sort_order - right.sort_order)[0] ?? null
  );
}

function matchesText(
  values: Array<string | string[] | null | undefined>,
  query: string,
) {
  if (!query) return true;
  const normalizedQuery = query.toLowerCase();
  return values.some((value) => {
    const text = Array.isArray(value) ? value.join(" ") : value;
    return text?.toLowerCase().includes(normalizedQuery) ?? false;
  });
}

function openingHoursToRows(branch: LibraryBranch): LibraryHours[] {
  if (!isOpeningHoursMap(branch.opening_hours)) return [];

  return Object.entries(branch.opening_hours).map(([day, value]) => {
    const text = compactText(value);
    const isClosed = /^closed$/i.test(text);
    const [opensAt, closesAt] = text.split(/\s*[-–]\s*/, 2);

    return {
      id: `${branch.id}-${day}`,
      library_id: branch.id,
      day_type: day,
      opens_at: isClosed ? null : compactText(opensAt) || null,
      closes_at: isClosed ? null : compactText(closesAt) || null,
      is_closed: isClosed,
      note: isClosed || closesAt ? null : text || null,
    };
  });
}

export function getPublicBranches() {
  return safeList<LibraryBranch>(() =>
    libraryServiceApi.branches.list({
      fields: branchFields,
      active_only: true,
      page: 1,
      per_page: 100,
    }),
  ).then((result) => normalizeList(result, normalizeBranch));
}

export function getPublicAssistantContexts() {
  return safeList<LibraryAssistantContext>(() =>
    libraryServiceApi.assistantContexts.publicList(),
  );
}

export async function getCatalogSearchData(
  options: {
    libraryId?: string;
    query?: string;
    resourceType?: string;
    status?: string;
    page?: number;
  } = {},
): Promise<CatalogSearchData> {
  const query = options.query?.trim() ?? "";
  const resourceType = options.resourceType?.trim() ?? "";
  const status = options.status?.trim() ?? "";
  const page = options.page ?? 1;
  const branches = await getPublicBranches();
  const selectedLibraryId =
    branches.data.find((branch) => branch.id === options.libraryId)?.id ??
    branches.data[0]?.id ??
    "";

  if (!selectedLibraryId) {
    return {
      branches,
      resources: { data: [], meta: null, error: branches.error },
      selectedLibraryId,
      query,
      resourceType,
      status,
    };
  }

  const resources = normalizeList(
    await safeList<LibraryResource>(() =>
      libraryServiceApi.resources.list({
        fields: catalogFields,
        library_id: selectedLibraryId,
        q: query || undefined,
        resource_type: resourceType || undefined,
        status: status || undefined,
        page,
        per_page: 100,
      }),
    ),
    normalizeResource,
  );

  return {
    branches,
    resources,
    selectedLibraryId,
    query,
    resourceType,
    status,
  };
}

export function getElectronicResources(
  query?: string,
  options: {
    resourceType?: string;
    accessLevel?: string;
    featured?: boolean;
    page?: number;
    perPage?: number;
  } = {},
) {
  return safeList<LibraryElectronicResource>(() =>
    libraryServiceApi.databases.list({
      fields: electronicFields,
      q: query?.trim() || undefined,
      resource_type: options.resourceType?.trim() || undefined,
      access_level: options.accessLevel?.trim() || undefined,
      featured: options.featured,
      page: options.page ?? 1,
      per_page: options.perPage ?? 100,
    }),
  ).then((result) => normalizeList(result, normalizeElectronicResource));
}

async function getBranchServices(branches: LibraryBranch[]) {
  const results = await collectByBranch<LibraryServiceRecord>(
    branches,
    (branch) =>
      safeList<LibraryServiceRecord>(() =>
        libraryServiceApi.services.list({
          fields: serviceFields,
          library_id: branch.id,
          page: 1,
          per_page: 100,
        }),
      ).then((result) => normalizeList(result, normalizeService)),
  );

  return results.map((item) => ({
    branch: item.branch,
    services: item.result,
  }));
}

async function getBranchHours(branches: LibraryBranch[]) {
  const results = await collectByBranch<LibraryHours>(branches, (branch) =>
    safeList<LibraryHours>(() =>
      libraryServiceApi.branches.hours(branch.id),
    ).then((result) =>
      result.data.length > 0
        ? result
        : { data: openingHoursToRows(branch), meta: null, error: result.error },
    ),
  );
  return results.map((item) => ({ branch: item.branch, hours: item.result }));
}

async function getBranchFiles(branches: LibraryBranch[]) {
  const results = await collectByBranch<LibraryFile>(branches, (branch) =>
    safeList<LibraryFile>(() =>
      libraryServiceApi.branches.files(branch.id, { fields: branchFileFields }),
    ),
  );
  return results.map((item) => ({ branch: item.branch, files: item.result }));
}

async function getBranchLinks(branches: LibraryBranch[]) {
  const results = await collectByBranch<LibraryExternalLink>(
    branches,
    (branch) =>
      safeList<LibraryExternalLink>(() =>
        libraryServiceApi.branches.links(branch.id, {
          fields: branchLinkFields,
          active_only: true,
        }),
      ),
  );
  return results.map((item) => ({ branch: item.branch, links: item.result }));
}

async function getBranchStaff(branches: LibraryBranch[]) {
  const results = await collectByBranch<LibraryStaff>(branches, (branch) =>
    safeList<LibraryStaff>(() =>
      libraryServiceApi.staff.list({
        fields: staffFields,
        library_id: branch.id,
        page: 1,
        per_page: 100,
      }),
    ).then((result) => normalizeList(result, normalizeStaff)),
  );
  return results.map((item) => ({ branch: item.branch, staff: item.result }));
}

export async function getLibraryServices() {
  const branches = await getPublicBranches();
  if (branches.data.length === 0) {
    return { data: [], meta: null, error: branches.error };
  }

  const grouped = await getBranchServices(branches.data);
  const data = grouped.flatMap((result) => result.services.data);
  const errors = uniqueErrors(
    branches.error,
    ...grouped.map((result) => result.services.error),
  );

  return {
    data,
    meta: null,
    error: errors[0] ?? null,
  };
}

export async function getLibraryServicesData(): Promise<LibraryServicesData> {
  const branches = await getPublicBranches();
  const [serviceGroups, regulations] = await Promise.all([
    getBranchServices(branches.data),
    safeList<LibraryRegulation>(() =>
      libraryServiceApi.regulations.list({
        fields: regulationFields,
        status: "active",
        page: 1,
        per_page: 100,
      }),
    ),
  ]);

  return {
    branches,
    groupedServices: serviceGroups.map((item) => ({
      branch: item.branch,
      services: item.services.data,
    })),
    regulations,
    errors: uniqueErrors(
      branches.error,
      regulations.error,
      ...serviceGroups.map((item) => item.services.error),
    ),
  };
}

export async function getLibraryOverviewData(): Promise<LibraryOverviewData> {
  const branches = await getPublicBranches();
  const selectedLibraryId = branches.data[0]?.id;

  const [
    catalog,
    electronic,
    services,
    regulations,
    todayHours,
    news,
    events,
    articles,
    stats,
  ] = await Promise.all([
    selectedLibraryId
      ? safeList<LibraryResource>(() =>
          libraryServiceApi.resources.list({
            fields: catalogFields,
            library_id: selectedLibraryId,
            page: 1,
            per_page: 6,
          }),
        ).then((result) => normalizeList(result, normalizeResource))
      : Promise.resolve({ data: [], meta: null, error: branches.error }),
    getElectronicResources(),
    getLibraryServices(),
    safeList<LibraryRegulation>(() =>
      libraryServiceApi.regulations.list({
        fields: regulationFields,
        status: "active",
        page: 1,
        per_page: 4,
      }),
    ),
    safeList<LibraryTodayHours>(() => libraryServiceApi.todayHours()),
    getLibraryNewsData({ perPage: 3 }).then((result) => result.records),
    getLibraryEventsData({ perPage: 3 }).then((result) => result.records),
    getLibraryArticlesData({ perPage: 3 }).then((result) => result.records),
    safeStats(),
  ]);

  return {
    branches,
    catalog,
    electronic,
    services,
    regulations,
    todayHours,
    news,
    events,
    articles,
    stats,
    errors: uniqueErrors(
      branches.error,
      catalog.error,
      electronic.error,
      services.error,
      regulations.error,
      todayHours.error,
      news.error,
      events.error,
      articles.error,
    ),
  };
}

export async function getLibraryAboutData(): Promise<LibraryAboutData> {
  const branches = await getPublicBranches();
  return {
    branches,
    primaryBranch: branches.data[0] ?? null,
    errors: uniqueErrors(branches.error),
  };
}

export function getLibraryTodayHours() {
  return safeList<LibraryTodayHours>(() => libraryServiceApi.todayHours());
}

export async function getLibraryHoursData(): Promise<LibraryHoursData> {
  const branches = await getPublicBranches();
  const grouped = await getBranchHours(branches.data);
  return {
    branches,
    groupedHours: grouped.map((item) => ({
      branch: item.branch,
      hours: item.hours.data,
    })),
    errors: uniqueErrors(
      branches.error,
      ...grouped.map((item) => item.hours.error),
    ),
  };
}

export async function getLibraryDownloadsData(): Promise<LibraryDownloadsData> {
  const branches = await getPublicBranches();
  const grouped = await getBranchFiles(branches.data);
  return {
    branches,
    groupedFiles: grouped.map((item) => ({
      branch: item.branch,
      files: item.files.data,
    })),
    errors: uniqueErrors(
      branches.error,
      ...grouped.map((item) => item.files.error),
    ),
  };
}

export async function getLibraryLinksData(): Promise<LibraryLinksData> {
  const branches = await getPublicBranches();
  const grouped = await getBranchLinks(branches.data);
  return {
    branches,
    groupedLinks: grouped.map((item) => ({
      branch: item.branch,
      links: item.links.data,
    })),
    errors: uniqueErrors(
      branches.error,
      ...grouped.map((item) => item.links.error),
    ),
  };
}

export async function getLibraryStaffData(): Promise<LibraryStaffData> {
  const branches = await getPublicBranches();
  const grouped = await getBranchStaff(branches.data);
  return {
    branches,
    groupedStaff: grouped.map((item) => ({
      branch: item.branch,
      staff: item.staff.data,
    })),
    errors: uniqueErrors(
      branches.error,
      ...grouped.map((item) => item.staff.error),
    ),
  };
}

export async function getLibraryLeadershipData(): Promise<
  PublicLibraryData<LibraryStaff>
> {
  return safeList<LibraryStaff>(() =>
    libraryServiceApi.staff.leadership({
      fields: staffFields,
      page: 1,
      per_page: 100,
    }),
  ).then((result) => normalizeList(result, normalizeStaff));
}

export async function getLibraryGuidesData({
  libraryId,
  query,
  guideType,
  subject,
  courseCode,
  audience,
  perPage = 100,
}: {
  libraryId?: string;
  query?: string;
  guideType?: LibraryGuideType | string;
  subject?: string;
  courseCode?: string;
  audience?: string;
  perPage?: number;
} = {}): Promise<LibraryGuidesData> {
  const trimmedQuery = query?.trim() ?? "";
  const trimmedGuideType = guideType?.trim() ?? "";
  const trimmedSubject = subject?.trim() ?? "";
  const trimmedCourseCode = courseCode?.trim() ?? "";
  const trimmedAudience = audience?.trim() ?? "";
  const branches = await getPublicBranches();
  const selectedLibraryId =
    branches.data.find((branch) => branch.id === libraryId)?.id ?? libraryId;

  const [guidesResult, specialists] = await Promise.all([
    safeList<LibraryGuide>(() =>
      libraryServiceApi.guides.list({
        fields: guideFields,
        library_id: selectedLibraryId || undefined,
        guide_type: (trimmedGuideType as LibraryGuideType) || undefined,
        subject: trimmedSubject || undefined,
        course_code: trimmedCourseCode || undefined,
        audience: trimmedAudience || undefined,
        page: 1,
        per_page: perPage,
        include_total: false,
      }),
    ).then((result) => normalizeList(result, normalizeGuide)),
    safeList<LibrarySpecialist>(() =>
      libraryServiceApi.specialists.list({
        fields: specialistFields,
        library_id: selectedLibraryId || undefined,
        subject: trimmedSubject || undefined,
      }),
    ).then((result) => normalizeList(result, normalizeSpecialist)),
  ]);

  const guides = {
    ...guidesResult,
    data: guidesResult.data.filter((guide) =>
      matchesText(
        [
          guide.title,
          guide.summary,
          guide.subject,
          guide.course_code,
          guide.audience,
        ],
        trimmedQuery,
      ),
    ),
  };

  return {
    branches,
    guides,
    specialists,
    query: trimmedQuery,
    guideType: trimmedGuideType,
    subject: trimmedSubject,
    courseCode: trimmedCourseCode,
    audience: trimmedAudience,
    errors: uniqueErrors(branches.error, guides.error, specialists.error),
  };
}

export async function getLibraryGuideDetail(
  slug: string,
): Promise<LibraryGuideDetailData> {
  const branches = await getPublicBranches();
  const guide = await safeRecord<LibraryGuide>(() =>
    libraryServiceApi.guides.getBySlug(slug, { fields: guideDetailFields }),
  );
  const normalizedGuide = guide.data ? normalizeGuide(guide.data) : null;
  const specialists = normalizedGuide
    ? await safeList<LibrarySpecialist>(() =>
        libraryServiceApi.specialists.list({
          fields: specialistFields,
          library_id: normalizedGuide.library_id ?? undefined,
          subject: normalizedGuide.subject ?? undefined,
        }),
      ).then((result) => normalizeList(result, normalizeSpecialist))
    : { data: [], meta: null, error: null };

  return {
    branches,
    guide: { ...guide, data: normalizedGuide },
    specialists,
    errors: uniqueErrors(branches.error, guide.error, specialists.error),
  };
}

export async function getLibrarySpecialistsData({
  libraryId,
  query,
  subject,
  school,
  department,
  supportArea,
}: {
  libraryId?: string;
  query?: string;
  subject?: string;
  school?: string;
  department?: string;
  supportArea?: string;
} = {}): Promise<LibrarySpecialistsData> {
  const trimmedQuery = query?.trim() ?? "";
  const trimmedSubject = subject?.trim() ?? "";
  const trimmedSchool = school?.trim() ?? "";
  const trimmedDepartment = department?.trim() ?? "";
  const trimmedSupportArea = supportArea?.trim() ?? "";
  const branches = await getPublicBranches();
  const selectedLibraryId =
    branches.data.find((branch) => branch.id === libraryId)?.id ?? libraryId;
  const specialistsResult = normalizeList(
    await safeList<LibrarySpecialist>(() =>
      libraryServiceApi.specialists.list({
        fields: specialistFields,
        library_id: selectedLibraryId || undefined,
        subject: trimmedSubject || undefined,
        school: trimmedSchool || undefined,
        department: trimmedDepartment || undefined,
      }),
    ),
    normalizeSpecialist,
  );
  const specialists = {
    ...specialistsResult,
    data: specialistsResult.data.filter(
      (specialist) =>
        matchesText(
          [
            specialist.subjects,
            specialist.schools,
            specialist.departments,
            specialist.support_areas,
            specialist.booking_url,
          ],
          trimmedQuery,
        ) && matchesText([specialist.support_areas], trimmedSupportArea),
    ),
  };

  return {
    branches,
    specialists,
    query: trimmedQuery,
    subject: trimmedSubject,
    school: trimmedSchool,
    department: trimmedDepartment,
    supportArea: trimmedSupportArea,
    errors: uniqueErrors(branches.error, specialists.error),
  };
}

export async function getLibraryWorkflowDetail(
  workflowType: LibraryWorkflowType,
): Promise<LibraryWorkflowDetailData> {
  const [branches, workflows] = await Promise.all([
    getPublicBranches(),
    safeList<LibraryWorkflow>(() =>
      libraryServiceApi.workflows.list({
        fields: workflowDetailFields,
        workflow_type: workflowType,
        page: 1,
        per_page: 25,
      }),
    ).then((result) => normalizeList(result, normalizeWorkflow)),
  ]);
  const workflow = selectPublishedWorkflow(workflows.data);

  return {
    branches,
    workflow: {
      data: workflow,
      error: workflows.error,
    },
    errors: uniqueErrors(branches.error, workflows.error),
  };
}

export async function getLibraryPoliciesData({
  libraryId,
  policyType,
  perPage = 100,
}: {
  libraryId?: string;
  policyType?: LibraryPolicyType | string;
  perPage?: number;
} = {}): Promise<LibraryPoliciesData> {
  const trimmedPolicyType = policyType?.trim() ?? "";
  const branches = await getPublicBranches();
  const selectedLibraryId =
    branches.data.find((branch) => branch.id === libraryId)?.id ?? libraryId;
  const policies = await safeList<LibraryPolicyPage>(() =>
    libraryServiceApi.policies.list({
      fields: policyFields,
      library_id: selectedLibraryId || undefined,
      policy_type: (trimmedPolicyType as LibraryPolicyType) || undefined,
      status: "active",
      page: 1,
      per_page: perPage,
      include_total: false,
    }),
  );

  return {
    branches,
    policies,
    policyType: trimmedPolicyType,
    errors: uniqueErrors(branches.error, policies.error),
  };
}

export async function getLibraryPolicyDetail(
  slug: string,
): Promise<LibraryPolicyDetailData> {
  const [branches, policy] = await Promise.all([
    getPublicBranches(),
    safeRecord<LibraryPolicyPage>(() =>
      libraryServiceApi.policies.getBySlug(slug, { fields: policyFields }),
    ),
  ]);

  return {
    branches,
    policy,
    errors: uniqueErrors(branches.error, policy.error),
  };
}

export async function getLibraryNewsData({
  query,
  perPage = 12,
}: {
  query?: string;
  perPage?: number;
} = {}): Promise<LibraryContentData<News>> {
  let records = await safeList<News>(() =>
    newsApi.list({
      fields: editorialFields,
      scope_type: "library",
      is_published: true,
      search: query?.trim() || undefined,
      page: 1,
      per_page: perPage,
    }),
  );
  if (records.data.length === 0 && !records.error) {
    records = await safeList<News>(() =>
      newsApi.list({
        fields: editorialFields,
        is_published: true,
        search: query?.trim() || undefined,
        page: 1,
        per_page: perPage,
      }),
    );
  }
  return {
    records,
    query: query?.trim() ?? "",
    errors: uniqueErrors(records.error),
  };
}

export async function getLibraryEventsData({
  query,
  perPage = 12,
}: {
  query?: string;
  perPage?: number;
} = {}): Promise<LibraryContentData<Event>> {
  let records = await safeList<Event>(() =>
    eventsApi.list({
      fields: editorialFields,
      scope_type: "library",
      is_published: true,
      search: query?.trim() || undefined,
      page: 1,
      per_page: perPage,
    }),
  );
  if (records.data.length === 0 && !records.error) {
    records = await safeList<Event>(() =>
      eventsApi.list({
        fields: editorialFields,
        is_published: true,
        search: query?.trim() || undefined,
        page: 1,
        per_page: perPage,
      }),
    );
  }
  return {
    records,
    query: query?.trim() ?? "",
    errors: uniqueErrors(records.error),
  };
}

export async function getLibraryArticlesData({
  query,
  perPage = 12,
}: {
  query?: string;
  perPage?: number;
} = {}): Promise<LibraryContentData<Blog>> {
  let records = await safeList<Blog>(() =>
    blogsApi.list({
      fields: editorialFields,
      scope_type: "library",
      is_published: true,
      search: query?.trim() || undefined,
      page: 1,
      per_page: perPage,
    }),
  );
  if (records.data.length === 0 && !records.error) {
    records = await safeList<Blog>(() =>
      blogsApi.list({
        fields: editorialFields,
        is_published: true,
        search: query?.trim() || undefined,
        page: 1,
        per_page: perPage,
      }),
    );
  }
  return {
    records,
    query: query?.trim() ?? "",
    errors: uniqueErrors(records.error),
  };
}

export const LIBRARY_UPDATE_TYPES = ["news", "events", "articles"] as const;
export type LibraryUpdateType = (typeof LIBRARY_UPDATE_TYPES)[number];

export function isLibraryUpdateType(value: string): value is LibraryUpdateType {
  return (LIBRARY_UPDATE_TYPES as readonly string[]).includes(value);
}

const updateDetailFields = `${editorialFields},is_featured,scope_type`;

export async function getLibraryUpdateDetail(
  type: LibraryUpdateType,
  slug: string,
): Promise<{ data: News | Event | Blog | null; error: string | null }> {
  if (type === "news") {
    return safeRecord<News>(() =>
      newsApi.getBySlug(slug, { fields: updateDetailFields }),
    );
  }
  if (type === "events") {
    return safeRecord<Event>(() =>
      eventsApi.getBySlug(slug, { fields: updateDetailFields }),
    );
  }
  return safeRecord<Blog>(() =>
    blogsApi.getBySlug(slug, { fields: updateDetailFields }),
  );
}

export async function getLibrarySearchData(
  options: { libraryId?: string; query?: string } = {},
): Promise<LibrarySearchData> {
  const query = options.query?.trim() ?? "";
  const branches = await getPublicBranches();
  const selectedLibraryId = options.libraryId
    ? branches.data.find((branch) => branch.id === options.libraryId)?.id ?? ""
    : "";
  const catalogLibraryId = selectedLibraryId || branches.data[0]?.id || "";

  const [catalog, electronic, news, events, articles] = await Promise.all([
    catalogLibraryId
      ? safeList<LibraryResource>(() =>
          libraryServiceApi.resources.list({
            fields: catalogFields,
            library_id: catalogLibraryId,
            q: query || undefined,
            search: query || undefined,
            page: 1,
            per_page: 10,
          }),
        ).then((result) => normalizeList(result, normalizeResource))
      : Promise.resolve({ data: [], meta: null, error: branches.error }),
    getElectronicResources(query),
    query
      ? getLibraryNewsData({ query, perPage: 4 })
      : Promise.resolve({ records: { data: [], meta: null, error: null }, query, errors: [] }),
    query
      ? getLibraryEventsData({ query, perPage: 4 })
      : Promise.resolve({ records: { data: [], meta: null, error: null }, query, errors: [] }),
    query
      ? getLibraryArticlesData({ query, perPage: 4 })
      : Promise.resolve({ records: { data: [], meta: null, error: null }, query, errors: [] }),
  ]);
  const editorial: PublicLibraryData<LibrarySearchResult> = {
    data: [
      ...news.records.data.map((item) => editorialSearchResult(item, "news")),
      ...events.records.data.map((item) => editorialSearchResult(item, "event")),
      ...articles.records.data.map((item) =>
        editorialSearchResult(item, "article"),
      ),
    ],
    meta: null,
    error: uniqueErrors(
      news.records.error,
      events.records.error,
      articles.records.error,
    )[0] ?? null,
  };
  const unified = query
    ? await safeRecord<LibrarySearchResponse>(() =>
        libraryServiceApi.search({
          q: query,
          types:
            "branch,catalog,database,download,external_link,regulation,service,staff,guide,specialist,workflow,policy",
          library_id: selectedLibraryId || undefined,
          limit: 40,
        }),
      )
    : { data: null, error: null };

  return {
    branches,
    catalog,
    electronic,
    unified: unified.data,
    editorial,
    selectedLibraryId,
    query,
    errors: uniqueErrors(
      branches.error,
      catalog.error,
      electronic.error,
      unified.error,
      editorial.error,
    ),
  };
}

function editorialSearchResult(
  item: News | Event | Blog,
  type: "news" | "event" | "article",
): LibrarySearchResult {
  const urlPrefix =
    type === "article" ? "articles" : type === "event" ? "events" : "news";
  return {
    id: item.id,
    type,
    title: item.title,
    description: compactText(
      ("excerpt" in item ? item.excerpt : null) ??
        item.summary ??
        item.plain_text,
    ),
    url: `/${urlPrefix}/${item.slug}`,
    metadata: {
      slug: item.slug,
      category: "category" in item ? item.category : undefined,
      event_type: "event_type" in item ? item.event_type : undefined,
      start_date: "start_date" in item ? item.start_date : undefined,
      published_at: "published_at" in item ? item.published_at : undefined,
    },
  };
}

export function safeExternalUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
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
  if (!value) return "Not dated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function shortText(
  value?: string | null,
  fallback = "Details are being updated.",
  max = 180,
) {
  const text = compactText((value ?? "").replace(/<[^>]*>/g, " ")) || fallback;
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}
