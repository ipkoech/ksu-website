import {
  divisionsApi,
  mainApi,
  schoolsApi,
  wingsApi,
  type Department,
  type Division,
  type Document,
  type PaginatedResponse,
  type School,
  type Wing,
} from "@ksu/api-client";
import {
  getScopedEntityMedia,
  type EntityMediaRecord,
} from "@/lib/entity-media-data";
import { getPublicTeam, type PublicTeamData } from "@/lib/public-team-data";
import {
  getPublicPersonProfile,
  type PublicPersonProfile,
} from "@/lib/public-person-data";

type ListResponse<T> = {
  data?: T[];
  meta?: {
    total?: number;
    count?: number;
    per_page?: number;
    pages?: number;
    total_pages?: number;
  };
};

export type AdministrationOfficeKind = "division" | "directorate";

export type DepartmentServiceRecord = {
  id: string;
  department_id?: string | null;
  name: string;
  slug?: string | null;
  description?: string | null;
  requirements?: string | null;
  process?: string | null;
  turnaround_time?: string | null;
  fee?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_active?: boolean;
  display_order?: number | null;
};

export type AdministrationUpdateRecord = EntityMediaRecord;

export type WingWithDivision = Wing & {
  division?: Pick<Division, "id" | "name" | "slug" | "code"> | null;
};

export type AdministrationOfficeEntity =
  | (Division & { entityKind: "division" })
  | (WingWithDivision & { entityKind: "directorate" });

export type AdministrationOfficeDetailData = {
  kind: AdministrationOfficeKind;
  entity: AdministrationOfficeEntity;
  baseHref: string;
  parent?: {
    label: string;
    href: string;
  } | null;
  childWings: Wing[];
  departments: Department[];
  schools: School[];
  services: DepartmentServiceRecord[];
  team: PublicTeamData | null;
  headProfile: PublicPersonProfile | null;
  documents: Document[];
  updates: AdministrationUpdateRecord[];
  counts: {
    childWings: number;
    departments: number;
    schools: number;
    services: number;
    team: number;
    documents: number;
    updates: number;
  };
};

const divisionFields = [
  "id",
  "name",
  "slug",
  "code",
  "division_type",
  "head_id",
  "description",
  "head_message",
  "mission",
  "vision",
  "core_values",
  "email",
  "phone",
  "office_location",
  "operating_hours",
  "cover_image_id",
  "is_public",
  "is_active",
  "display_order",
  "created_at",
  "updated_at",
].join(",");

const wingFields = [
  "id",
  "division_id",
  "name",
  "slug",
  "code",
  "wing_type",
  "head_id",
  "description",
  "head_message",
  "mandate",
  "service_charter",
  "email",
  "phone",
  "office_location",
  "operating_hours",
  "cover_image_id",
  "is_public",
  "is_active",
  "display_order",
  "created_at",
  "updated_at",
].join(",");

const departmentFields = [
  "id",
  "name",
  "slug",
  "code",
  "department_type",
  "wing_id",
  "about",
  "mission",
  "vision",
  "mandate",
  "service_charter",
  "email",
  "phone",
  "office_location",
  "display_order",
  "is_public",
  "is_active",
].join(",");

const schoolFields = [
  "id",
  "name",
  "slug",
  "code",
  "school_type",
  "administrative_wing_id",
  "display_order",
  "is_public",
  "is_active",
].join(",");

const serviceFields = [
  "id",
  "department_id",
  "name",
  "slug",
  "description",
  "requirements",
  "process",
  "turnaround_time",
  "fee",
  "contact_email",
  "contact_phone",
  "is_active",
  "display_order",
].join(",");

const documentFields = [
  "id",
  "title",
  "slug",
  "document_type",
  "category",
  "description",
  "file_id",
  "version",
  "download_count",
  "is_active",
  "is_public",
  "display_order",
  "created_at",
  "updated_at",
].join(",");

function sortByDisplayOrder<T extends { display_order?: number | null; name?: string; title?: string }>(
  items: T[],
) {
  return items
    .slice()
    .sort(
      (first, second) =>
        Number(first.display_order ?? 100) - Number(second.display_order ?? 100) ||
        (first.name ?? first.title ?? "").localeCompare(second.name ?? second.title ?? ""),
    );
}

function listCount<T>(response: ListResponse<T> | PaginatedResponse<T>) {
  const meta = response.meta as { total?: number; count?: number } | undefined;
  return meta?.total ?? meta?.count ?? response.data?.length ?? 0;
}

async function safeList<T>(
  request: Promise<ListResponse<T> | PaginatedResponse<T>>,
): Promise<ListResponse<T> | PaginatedResponse<T>> {
  try {
    return await request;
  } catch (error) {
    console.error("Failed to load administration detail list:", error);
    return { data: [] };
  }
}

async function getDepartmentServices(
  departments: Department[],
): Promise<DepartmentServiceRecord[]> {
  const results = await Promise.all(
    departments.map((department) =>
      safeList<DepartmentServiceRecord>(
        mainApi.get<ListResponse<DepartmentServiceRecord>>(
          `/api/v1/departments/${department.slug}/services`,
          { fields: serviceFields, per_page: 80 },
        ),
      ),
    ),
  );

  const services = results.flatMap((response) => response.data ?? []);
  const seen = new Set<string>();

  return sortByDisplayOrder(
    services.filter((service) => {
      if (seen.has(service.id)) return false;
      seen.add(service.id);
      return true;
    }),
  );
}

async function getDocuments(scopeType: "division" | "wing", scopeId: string) {
  return safeList<Document>(
    mainApi.get<PaginatedResponse<Document>>("/api/v1/documents", {
      scope_type: scopeType,
      scope_id: scopeId,
      fields: documentFields,
      per_page: 40,
    }),
  );
}

async function getHeadProfile(headId?: string | null) {
  return headId ? getPublicPersonProfile(headId) : null;
}

async function getDepartmentsForWings(wings: Wing[]) {
  const responses = await Promise.all(
    wings.map((wing) =>
      safeList<Department>(
        mainApi.get<PaginatedResponse<Department>>("/api/v1/departments", {
          wing_id: wing.id,
          department_type: "administrative",
          fields: departmentFields,
          per_page: 100,
        }),
      ),
    ),
  );

  const seen = new Set<string>();
  const departments = responses
    .flatMap((response) => response.data ?? [])
    .filter((department) => {
      if (seen.has(department.id)) return false;
      seen.add(department.id);
      return true;
    });

  return sortByDisplayOrder(departments);
}

export async function getAdministrationDivisionDetailData(
  slug: string,
): Promise<AdministrationOfficeDetailData | null> {
  try {
    const division = (await divisionsApi.getBySlug(slug, { fields: divisionFields })).data;
    if (!division?.id) return null;

    const wingsResponse = await safeList<Wing>(
      wingsApi.listByDivision(division.id, {
        is_active: true,
        fields: wingFields,
      }),
    );
    const childWings = sortByDisplayOrder(wingsResponse.data ?? []);

    const [departments, team, documents, updates] = await Promise.all([
      getDepartmentsForWings(childWings),
      getPublicTeam("division", division.id),
      getDocuments("division", division.id),
      getScopedEntityMedia("division", division.id, division.name),
    ]);
    const headProfile = await getHeadProfile(division.head_id);
    const services = await getDepartmentServices(departments);

    return {
      kind: "division",
      entity: { ...division, entityKind: "division" },
      baseHref: `/administration/divisions/${division.slug}`,
      parent: { label: "Administration", href: "/administration" },
      childWings,
      departments,
      schools: [],
      services,
      team,
      headProfile,
      documents: sortByDisplayOrder(documents.data ?? []),
      updates,
      counts: {
        childWings: listCount(wingsResponse),
        departments: departments.length,
        schools: 0,
        services: services.length,
        team: team?.counts?.assignments ?? team?.assignments.length ?? 0,
        documents: listCount(documents),
        updates: updates.length,
      },
    };
  } catch (error) {
    console.error("Failed to load division detail:", error);
    return null;
  }
}

export async function getAdministrationDirectorateDetailData(
  slug: string,
): Promise<AdministrationOfficeDetailData | null> {
  try {
    const wing = (await wingsApi.getBySlug(slug, {
      fields: wingFields,
      include: "division:id,name,slug,code",
    })).data as WingWithDivision | undefined;
    if (!wing?.id) return null;

    const [departmentsResponse, schoolsResponse, team, documents, updates] = await Promise.all([
      safeList<Department>(
        mainApi.get<PaginatedResponse<Department>>("/api/v1/departments", {
          wing_id: wing.id,
          department_type: "administrative",
          fields: departmentFields,
          per_page: 100,
        }),
      ),
      safeList<School>(
        schoolsApi.list({
          administrative_wing_id: wing.id,
          fields: schoolFields,
          per_page: 100,
        }),
      ),
      getPublicTeam("wing", wing.id),
      getDocuments("wing", wing.id),
      getScopedEntityMedia("wing", wing.id, wing.name),
    ]);
    const departments = sortByDisplayOrder(departmentsResponse.data ?? []);
    const headProfile = await getHeadProfile(wing.head_id);
    const services = await getDepartmentServices(departments);

    return {
      kind: "directorate",
      entity: { ...wing, entityKind: "directorate" },
      baseHref: `/administration/units/${wing.slug}`,
      parent: wing.division?.slug
        ? {
            label: wing.division.name,
            href: `/administration/divisions/${wing.division.slug}`,
          }
        : { label: "Administration", href: "/administration" },
      childWings: [],
      departments,
      schools: sortByDisplayOrder(schoolsResponse.data ?? []),
      services,
      team,
      headProfile,
      documents: sortByDisplayOrder(documents.data ?? []),
      updates,
      counts: {
        childWings: 0,
        departments: listCount(departmentsResponse),
        schools: listCount(schoolsResponse),
        services: services.length,
        team: team?.counts?.assignments ?? team?.assignments.length ?? 0,
        documents: listCount(documents),
        updates: updates.length,
      },
    };
  } catch (error) {
    console.error("Failed to load directorate detail:", error);
    return null;
  }
}
