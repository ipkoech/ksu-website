import {
  libraryServiceApi,
  type LibraryBranch,
  type LibraryElectronicResource,
  type LibraryExternalLink,
  type LibraryFile,
  type LibraryHours,
  type LibraryRegulation,
  type LibraryResource,
  type LibraryServiceRecord,
  type LibraryStaff,
} from "@ksu/api-client";
import type { PublicStatsResponse } from "@ksu/api-client";

export type PublicLibraryData<T> = {
  data: T[];
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
  selectedLibraryId: string;
  query: string;
  errors: string[];
};

const PUBLIC_LIBRARY_TIMEOUT_MS = 3000;

const unavailableMessage =
  "Library records are temporarily unavailable. Try again later or contact the library desk.";

async function safeList<T>(
  load: () => Promise<{ data?: T[] }>,
): Promise<PublicLibraryData<T>> {
  const request = load()
    .then((response) => ({ data: response.data ?? [], error: null }))
    .catch(() => ({ data: [], error: unavailableMessage }));

  const timeout = new Promise<PublicLibraryData<T>>((resolve) => {
    setTimeout(
      () => resolve({ data: [], error: unavailableMessage }),
      PUBLIC_LIBRARY_TIMEOUT_MS,
    );
  });

  return Promise.race([request, timeout]);
}

async function safeStats() {
  try {
    const response = await libraryServiceApi.stats();
    return response.data ?? null;
  } catch {
    return null;
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

export function getPublicBranches() {
  return safeList<LibraryBranch>(() =>
    libraryServiceApi.branches.list({
      active_only: true,
      page: 1,
      per_page: 100,
    }),
  );
}

export async function getCatalogSearchData(
  options: {
    libraryId?: string;
    query?: string;
    resourceType?: string;
    status?: string;
  } = {},
): Promise<CatalogSearchData> {
  const query = options.query?.trim() ?? "";
  const resourceType = options.resourceType?.trim() ?? "";
  const status = options.status?.trim() ?? "";
  const branches = await getPublicBranches();
  const selectedLibraryId =
    branches.data.find((branch) => branch.id === options.libraryId)?.id ??
    branches.data[0]?.id ??
    "";

  if (!selectedLibraryId) {
    return {
      branches,
      resources: { data: [], error: branches.error },
      selectedLibraryId,
      query,
      resourceType,
      status,
    };
  }

  const resources = await safeList<LibraryResource>(() =>
    libraryServiceApi.resources.list({
      library_id: selectedLibraryId,
      q: query || undefined,
      resource_type: resourceType || undefined,
      status: status || undefined,
      page: 1,
      per_page: 100,
    }),
  );

  return { branches, resources, selectedLibraryId, query, resourceType, status };
}

export function getElectronicResources(
  query?: string,
  options: {
    resourceType?: string;
    accessLevel?: string;
    featured?: boolean;
  } = {},
) {
  return safeList<LibraryElectronicResource>(() =>
    libraryServiceApi.databases.list({
      q: query?.trim() || undefined,
      resource_type: options.resourceType?.trim() || undefined,
      access_level: options.accessLevel?.trim() || undefined,
      featured: options.featured,
      page: 1,
      per_page: 100,
    }),
  );
}

async function getBranchServices(branches: LibraryBranch[]) {
  const results = await collectByBranch<LibraryServiceRecord>(
    branches,
    (branch) =>
      safeList<LibraryServiceRecord>(() =>
        libraryServiceApi.services.list({
          library_id: branch.id,
          page: 1,
          per_page: 100,
        }),
      ),
  );

  return results.map((item) => ({ branch: item.branch, services: item.result }));
}

async function getBranchHours(branches: LibraryBranch[]) {
  const results = await collectByBranch<LibraryHours>(branches, (branch) =>
    safeList<LibraryHours>(() => libraryServiceApi.branches.hours(branch.id)),
  );
  return results.map((item) => ({ branch: item.branch, hours: item.result }));
}

async function getBranchFiles(branches: LibraryBranch[]) {
  const results = await collectByBranch<LibraryFile>(branches, (branch) =>
    safeList<LibraryFile>(() => libraryServiceApi.branches.files(branch.id)),
  );
  return results.map((item) => ({ branch: item.branch, files: item.result }));
}

async function getBranchLinks(branches: LibraryBranch[]) {
  const results = await collectByBranch<LibraryExternalLink>(
    branches,
    (branch) =>
      safeList<LibraryExternalLink>(() =>
        libraryServiceApi.branches.links(branch.id, { active_only: true }),
      ),
  );
  return results.map((item) => ({ branch: item.branch, links: item.result }));
}

async function getBranchStaff(branches: LibraryBranch[]) {
  const results = await collectByBranch<LibraryStaff>(
    branches,
    (branch) =>
      safeList<LibraryStaff>(() =>
        libraryServiceApi.staff.list({
          library_id: branch.id,
          page: 1,
          per_page: 100,
        }),
      ),
  );
  return results.map((item) => ({ branch: item.branch, staff: item.result }));
}

export async function getLibraryServices() {
  const branches = await getPublicBranches();
  if (branches.data.length === 0) {
    return { data: [], error: branches.error };
  }

  const grouped = await getBranchServices(branches.data);
  const data = grouped.flatMap((result) => result.services.data);
  const errors = uniqueErrors(
    branches.error,
    ...grouped.map((result) => result.services.error),
  );

  return {
    data,
    error: errors[0] ?? null,
  };
}

export async function getLibraryServicesData(): Promise<LibraryServicesData> {
  const branches = await getPublicBranches();
  const [serviceGroups, regulations] = await Promise.all([
    getBranchServices(branches.data),
    safeList<LibraryRegulation>(() =>
      libraryServiceApi.regulations.list({
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

  const [catalog, electronic, services, regulations, stats] = await Promise.all([
    selectedLibraryId
      ? safeList<LibraryResource>(() =>
          libraryServiceApi.resources.list({
            library_id: selectedLibraryId,
            page: 1,
            per_page: 6,
          }),
        )
      : Promise.resolve({ data: [], error: branches.error }),
    getElectronicResources(),
    getLibraryServices(),
    safeList<LibraryRegulation>(() =>
      libraryServiceApi.regulations.list({
        status: "active",
        page: 1,
        per_page: 4,
      }),
    ),
    safeStats(),
  ]);

  return {
    branches,
    catalog,
    electronic,
    services,
    regulations,
    stats,
    errors: uniqueErrors(
      branches.error,
      catalog.error,
      electronic.error,
      services.error,
      regulations.error,
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

export async function getLibraryHoursData(): Promise<LibraryHoursData> {
  const branches = await getPublicBranches();
  const grouped = await getBranchHours(branches.data);
  return {
    branches,
    groupedHours: grouped.map((item) => ({
      branch: item.branch,
      hours: item.hours.data,
    })),
    errors: uniqueErrors(branches.error, ...grouped.map((item) => item.hours.error)),
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
    errors: uniqueErrors(branches.error, ...grouped.map((item) => item.files.error)),
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
    errors: uniqueErrors(branches.error, ...grouped.map((item) => item.links.error)),
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
    errors: uniqueErrors(branches.error, ...grouped.map((item) => item.staff.error)),
  };
}

export async function getLibrarySearchData(
  options: { libraryId?: string; query?: string } = {},
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
            library_id: selectedLibraryId,
            q: query || undefined,
            page: 1,
            per_page: 10,
          }),
        )
      : Promise.resolve({ data: [], error: branches.error }),
    getElectronicResources(query),
  ]);

  return {
    branches,
    catalog,
    electronic,
    selectedLibraryId,
    query,
    errors: uniqueErrors(branches.error, catalog.error, electronic.error),
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
