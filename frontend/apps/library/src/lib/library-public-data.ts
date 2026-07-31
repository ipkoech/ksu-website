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
  type LibraryHours,
  type LibraryRegulation,
  type LibraryResource,
  type LibraryServiceRecord,
  type LibraryStaff,
  type LibrarySearchResponse,
  type LibraryAssistantContext,
  type LibraryTodayHours,
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
  selectedLibraryId: string;
  query: string;
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
  "id,library_id,person_id,person,job_title,department,department_section,role,is_public,is_active,bio,specialization,sort_order";
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
  } = {},
) {
  const page = options.page ?? 1;
  return safeList<LibraryElectronicResource>(() =>
    libraryServiceApi.databases.list({
      fields: electronicFields,
      q: query?.trim() || undefined,
      resource_type: options.resourceType?.trim() || undefined,
      access_level: options.accessLevel?.trim() || undefined,
      featured: options.featured,
      page,
      per_page: 100,
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
        : { data: openingHoursToRows(branch), meta: result.meta ?? null, error: result.error },
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

export async function getLibraryNewsData({
  query,
  perPage = 12,
  page = 1,
}: {
  query?: string;
  perPage?: number;
  page?: number;
} = {}): Promise<LibraryContentData<News>> {
  const records = await safeList<News>(() =>
    newsApi.list({
      fields: editorialFields,
      scope_type: "library",
      is_published: true,
      search: query?.trim() || undefined,
      page,
      per_page: perPage,
    }),
  );
  return {
    records,
    query: query?.trim() ?? "",
    errors: uniqueErrors(records.error),
  };
}

export async function getLibraryEventsData({
  query,
  perPage = 12,
  page = 1,
}: {
  query?: string;
  perPage?: number;
  page?: number;
} = {}): Promise<LibraryContentData<Event>> {
  const records = await safeList<Event>(() =>
    eventsApi.list({
      fields: editorialFields,
      scope_type: "library",
      is_published: true,
      search: query?.trim() || undefined,
      page,
      per_page: perPage,
    }),
  );
  return {
    records,
    query: query?.trim() ?? "",
    errors: uniqueErrors(records.error),
  };
}

export async function getLibraryArticlesData({
  query,
  perPage = 12,
  page = 1,
}: {
  query?: string;
  perPage?: number;
  page?: number;
} = {}): Promise<LibraryContentData<Blog>> {
  const records = await safeList<Blog>(() =>
    blogsApi.list({
      fields: editorialFields,
      scope_type: "library",
      is_published: true,
      search: query?.trim() || undefined,
      page,
      per_page: perPage,
    }),
  );
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
  options: { libraryId?: string; query?: string; type?: string } = {},
): Promise<LibrarySearchData> {
  const query = options.query?.trim() ?? "";
  const branches = await getPublicBranches();
  const selectedLibraryId =
    branches.data.find((branch) => branch.id === options.libraryId)?.id ??
    branches.data[0]?.id ??
    "";

  const [catalog, electronic] = await Promise.all([
    selectedLibraryId
      ? safeList<LibraryResource>(() =>
          libraryServiceApi.resources.list({
            fields: catalogFields,
            library_id: selectedLibraryId,
            q: query || undefined,
            search: query || undefined,
            page: 1,
            per_page: 10,
          }),
        ).then((result) => normalizeList(result, normalizeResource))
      : Promise.resolve({ data: [], meta: null, error: branches.error }),
    getElectronicResources(query),
  ]);
  const unified = query
    ? await safeRecord<LibrarySearchResponse>(() =>
        libraryServiceApi.search({
          q: query,
          library_id: selectedLibraryId || undefined,
          types: options.type && options.type !== "everything" ? options.type : undefined,
          limit: 40,
        }),
      )
    : { data: null, error: null };

  return {
    branches,
    catalog,
    electronic,
    unified: unified.data,
    selectedLibraryId,
    query,
    errors: uniqueErrors(
      branches.error,
      catalog.error,
      electronic.error,
      unified.error,
    ),
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
