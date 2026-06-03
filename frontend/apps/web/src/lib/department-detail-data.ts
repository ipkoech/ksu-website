import { departmentsApi, mainApi, statsApi } from "@ksu/api-client";
import { resolvePublicMediaUrl } from "@/lib/public-media";
import type {
  Department,
  Document,
  News,
  Person,
  Programme,
  PublicStatsResponse,
  StaffAssignment,
} from "@ksu/api-client";
import type { Leader } from "@ksu/ui/components";
import { getHOD, getLeaderByRole } from "@/lib/get-leadership";
import {
  getScopedEntityMedia,
  type EntityMediaRecord,
} from "@/lib/entity-media-data";
import { getPublicTeam, type PublicTeamData } from "@/lib/public-team-data";

type DepartmentResponse = {
  data?: DepartmentWithRelations;
};

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

type DepartmentParent = {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  division_id?: string | null;
  division?: DepartmentParent | null;
};

export type DepartmentServiceRecord = {
  id: string;
  department_id?: string;
  name: string;
  slug: string;
  description?: string | null;
  requirements?: string | null;
  process?: string | null;
  turnaround_time?: string | null;
  fee?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  is_active?: boolean;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
};

export type DepartmentWithRelations = Department & {
  school?: DepartmentParent | null;
  wing?: DepartmentParent | null;
};

export type ProgrammeTutorPerson = Pick<
  Person,
  | "id"
  | "slug"
  | "title"
  | "first_name"
  | "middle_name"
  | "last_name"
  | "full_name"
  | "academic_rank"
  | "institutional_role"
>;

export type ProgrammeTutorRecord = {
  id: string;
  role?: string | null;
  is_lead?: boolean;
  person_id?: string | null;
  person?: ProgrammeTutorPerson | null;
};

export type ProgrammeIntakeRecord = {
  id: string;
  slots_available?: number | null;
  application_deadline?: string | null;
  is_active?: boolean;
  intake?: {
    id: string;
    name: string;
    slug?: string | null;
    application_start?: string | null;
    application_end?: string | null;
    is_open?: boolean;
  } | null;
};

export type ProgrammeWithRelations = Programme & {
  tutors?: ProgrammeTutorRecord[];
  intakes?: ProgrammeIntakeRecord[];
};

type DepartmentRelatedRecords = Pick<
  DepartmentDetailData,
  | "leader"
  | "programmes"
  | "staff"
  | "staffAssignments"
  | "team"
  | "services"
  | "documents"
  | "news"
  | "updates"
  | "counts"
>;

const departmentFields = [
  "id",
  "name",
  "code",
  "slug",
  "department_type",
  "school_id",
  "wing_id",
  "parent_department_id",
  "head_id",
  "postgraduate_coordinator_id",
  "establishment_date",
  "about",
  "head_message",
  "mission",
  "vision",
  "mandate",
  "core_values",
  "service_charter",
  "guidelines",
  "phone",
  "email",
  "office_location",
  "cover_image_id",
  "student_count",
  "postgraduate_student_count",
  "is_active",
  "is_public",
  "allows_staff_management",
  "display_order",
  "programmes_count",
  "created_at",
  "updated_at",
].join(",");

const departmentRelationInclude = [
  "school:id,name,slug,code",
  "wing(id,name,slug,code,division_id,division(id,name,slug,code))",
].join(";");

const programmeFields = [
  "id",
  "name",
  "code",
  "slug",
  "level",
  "mode_of_study",
  "duration",
  "credits_required",
  "department_id",
  "about",
  "objectives",
  "career_prospects",
  "entry_requirements",
  "intake_months",
  "is_active",
  "display_order",
].join(",");

const programmeRelationInclude = [
  "tutors:id,role,is_lead,person_id,person(id,slug,title,first_name,middle_name,last_name,full_name,academic_rank,institutional_role)",
  "intakes:id,slots_available,application_deadline,is_active,intake(id,name,slug,application_start,application_end,is_open)",
  "department:id,name,slug,code",
].join(";");

const staffFields = [
  "id",
  "slug",
  "title",
  "first_name",
  "middle_name",
  "last_name",
  "full_name",
  "email",
  "photo_id",
  "photo_url",
  "academic_rank",
  "institutional_role",
  "office_location",
  "publications_count",
  "is_active",
  "is_public",
].join(",");

const staffAssignmentFields = [
  "id",
  "person_id",
  "entity_type",
  "entity_id",
  "role",
  "title",
  "hierarchy_level",
  "reports_to_id",
  "is_primary",
  "is_acting",
  "is_public",
  "start_date",
  "end_date",
  "term_years",
  "term_renewable",
  "show_term_dates",
  "status",
  "display_order",
  "role_display",
  "term_display",
  "is_current",
  "created_at",
  "updated_at",
].join(",");

const staffAssignmentPersonFields = [
  "id",
  "slug",
  "title",
  "first_name",
  "middle_name",
  "last_name",
  "full_name",
  "email",
  "bio",
  "leadership_message",
  "photo_id",
  "photo_url",
  "academic_rank",
  "institutional_role",
  "office_location",
  "publications_count",
].join(",");

const departmentServiceFields = [
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
  "created_at",
  "updated_at",
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
  "created_at",
  "updated_at",
].join(",");

const newsFields = [
  "id",
  "title",
  "slug",
  "summary",
  "category",
  "tags",
  "published_at",
  "is_featured",
  "is_main",
  "is_public",
  "is_published",
  "status",
  "view_count",
  "created_at",
  "updated_at",
].join(",");

async function getDepartmentBySlug(
  slug: string,
): Promise<DepartmentWithRelations | null> {
  const params = {
    fields: departmentFields,
    include: departmentRelationInclude,
  };

  try {
    const response = await departmentsApi.getBySlug(slug, params);
    return (response.data as DepartmentWithRelations | undefined) ?? null;
  } catch {
    try {
      const response = await mainApi.get<DepartmentResponse>(
        `/api/v1/departments/${slug}`,
        params,
      );

      return response.data ?? null;
    } catch {
      return null;
    }
  }
}

async function getDepartmentStats(slug: string): Promise<PublicStatsResponse | null> {
  try {
    const response = await statsApi.get({ scope: "department", slug });
    return response.data ?? null;
  } catch {
    return null;
  }
}

async function getList<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<ListResponse<T>> {
  try {
    return await mainApi.get<ListResponse<T>>(path, params);
  } catch {
    return { data: [] };
  }
}

function listCount<T>(response: ListResponse<T>) {
  return response.meta?.total ?? response.meta?.count ?? response.data?.length ?? 0;
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function fallbackDepartment(
  slug: string,
  fallbackType: DepartmentDetailKind,
): DepartmentWithRelations {
  const title = titleFromSlug(slug);

  return {
    id: slug,
    name: title.toLowerCase().includes("department")
      ? title
      : `${title} Department`,
    code: "",
    slug,
    department_type: fallbackType,
    is_active: true,
    is_public: false,
    display_order: 0,
    created_at: "",
    updated_at: "",
  };
}

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function personName(person: Person) {
  const fullName = present(person.full_name);
  if (fullName) return fullName;

  return (
    [person.title, person.first_name, person.middle_name, person.last_name]
      .map((value) => present(value))
      .filter(Boolean)
      .join(" ") || "Department leader"
  );
}

function personImage(person: Person) {
  const photoUrl = present(person.photo_url);
  return resolvePublicMediaUrl(photoUrl);
}

function leaderFromAssignment(assignment?: StaffAssignment | null): Leader | null {
  if (!assignment?.person) return null;
  const person = assignment.person;
  const fallbackTitle = assignment.role?.replace(/_/g, " ") || "Department lead";

  return {
    id: person.id,
    name: personName(person),
    title:
      present(assignment.title) ??
      present(assignment.role_display) ??
      (assignment.is_acting ? `Acting ${fallbackTitle}` : fallbackTitle),
    image: personImage(person),
    message: person.leadership_message || person.bio || null,
    slug: person.slug,
  };
}

function sortByDisplayOrder<T extends { display_order?: number; name?: string }>(
  items: T[],
) {
  return items
    .slice()
    .sort(
      (first, second) =>
        Number(first.display_order ?? 100) - Number(second.display_order ?? 100) ||
        (first.name ?? "").localeCompare(second.name ?? ""),
    );
}

async function getDepartmentLeader(
  department: DepartmentWithRelations,
  isAcademic: boolean,
  staffAssignments: StaffAssignment[],
) {
  const roleLeader = isAcademic
    ? await getHOD(department.id)
    : await getLeaderByRole("director", "department", department.id);

  if (roleLeader) return roleLeader;

  if (!isAcademic) {
    const head = await getLeaderByRole("head", "department", department.id);
    if (head) return head;
  }

  const primaryAssignment =
    staffAssignments.find((assignment) => assignment.is_primary) ??
    staffAssignments[0];

  return leaderFromAssignment(primaryAssignment);
}

async function getDepartmentRelatedRecords(
  department: DepartmentWithRelations,
  isAcademic: boolean,
): Promise<DepartmentRelatedRecords> {
  const [
    programmes,
    staff,
    staffAssignments,
    team,
    services,
    documents,
    news,
    updates,
  ] = await Promise.all([
    isAcademic
      ? getList<ProgrammeWithRelations>(`/api/v1/departments/${department.slug}/programmes`, {
          fields: programmeFields,
          include: programmeRelationInclude,
          per_page: 80,
        })
      : Promise.resolve({ data: [] } satisfies ListResponse<ProgrammeWithRelations>),
    getList<Person>(`/api/v1/departments/${department.slug}/staff`, {
      fields: staffFields,
      per_page: 80,
    }),
    getList<StaffAssignment>("/api/v1/public/leadership/list", {
      entity_type: "department",
      entity_id: department.id,
      fields: staffAssignmentFields,
      include: `person:${staffAssignmentPersonFields}`,
    }),
    getPublicTeam("department", department.id),
    getList<DepartmentServiceRecord>(
      `/api/v1/departments/${department.slug}/services`,
      { fields: departmentServiceFields },
    ),
    getList<Document>("/api/v1/documents", {
      scope_type: "department",
      scope_id: department.id,
      fields: documentFields,
      per_page: 40,
    }),
    getList<News>("/api/v1/news", {
      scope_type: "department",
      scope_id: department.id,
      fields: newsFields,
      per_page: 40,
    }),
    getScopedEntityMedia("department", department.id, department.name),
  ]);

  const sortedProgrammes = sortByDisplayOrder(programmes.data ?? []);
  const sortedServices = sortByDisplayOrder(services.data ?? []);
  const publicationCount =
    staff.data?.reduce(
      (total, person) => total + Number(person.publications_count ?? 0),
      0,
    ) ?? 0;
  const leader = await getDepartmentLeader(
    department,
    isAcademic,
    staffAssignments.data ?? [],
  );

  return {
    leader,
    programmes: sortedProgrammes,
    staff: staff.data ?? [],
    staffAssignments: staffAssignments.data ?? [],
    team,
    services: sortedServices,
    documents: documents.data ?? [],
    news: news.data ?? [],
    updates,
    counts: {
      programmes: listCount(programmes),
      staff: listCount(staff),
      publications: publicationCount,
      services: listCount(services),
      documents: listCount(documents),
      news: listCount(news),
    },
  };
}

export type DepartmentDetailKind = "academic" | "administrative" | "support";

export type DepartmentDetailData = {
  department: DepartmentWithRelations;
  leader: Leader | null;
  programmes: ProgrammeWithRelations[];
  programmeSearchQuery: string | null;
  staff: Person[];
  staffAssignments: StaffAssignment[];
  team: PublicTeamData | null;
  services: DepartmentServiceRecord[];
  documents: Document[];
  news: News[];
  updates: EntityMediaRecord[];
  stats: PublicStatsResponse | null;
  counts: {
    programmes: number;
    staff: number;
    publications: number;
    services: number;
    documents: number;
    news: number;
  };
  isAcademic: boolean;
  sourceBacked: boolean;
};

export async function getDepartmentDetailData(
  slug: string,
  fallbackType: DepartmentDetailKind,
  programmeSearchQuery?: string | null,
): Promise<DepartmentDetailData> {
  const department = await getDepartmentBySlug(slug);
  const resolvedDepartment = department ?? fallbackDepartment(slug, fallbackType);
  const departmentType = department?.department_type ?? fallbackType;
  const isAcademic = departmentType === "academic";
  const emptyRelated: DepartmentRelatedRecords = {
    leader: null,
    programmes: [],
    staff: [],
    staffAssignments: [],
    team: null,
    services: [],
    documents: [],
    news: [],
    updates: [],
    counts: {
      programmes: 0,
      staff: 0,
      publications: 0,
      services: 0,
      documents: 0,
      news: 0,
    },
  };
  const [related, stats] = department?.id
    ? await Promise.all([
        getDepartmentRelatedRecords(department, isAcademic),
        getDepartmentStats(department.slug),
      ])
    : [emptyRelated, null];

  return {
    department: resolvedDepartment,
    ...related,
    programmes: filterProgrammes(related.programmes, programmeSearchQuery),
    programmeSearchQuery: present(programmeSearchQuery),
    stats,
    counts: stats ? mergeDepartmentCounts(related.counts, stats) : related.counts,
    isAcademic,
    sourceBacked: Boolean(department),
  };
}

function statValue(stats: PublicStatsResponse, key: string) {
  const item = stats.stats.find((entry) => entry.key === key);
  return typeof item?.value === "number" ? item.value : null;
}

function mergeDepartmentCounts(
  fallback: DepartmentDetailData["counts"],
  stats: PublicStatsResponse,
): DepartmentDetailData["counts"] {
  return {
    programmes: statValue(stats, "programmes") ?? fallback.programmes,
    staff: statValue(stats, "staff") ?? fallback.staff,
    publications: statValue(stats, "publications") ?? fallback.publications,
    services: statValue(stats, "services") ?? fallback.services,
    documents: statValue(stats, "downloads") ?? fallback.documents,
    news: statValue(stats, "news") ?? fallback.news,
  };
}

function programmeSearchText(programme: ProgrammeWithRelations) {
  return [
    programme.name,
    programme.code,
    programme.level,
    programme.mode_of_study,
    programme.duration,
    programme.about,
    programme.objectives,
    programme.career_prospects,
    programme.entry_requirements,
    ...(programme.tutors ?? []).flatMap((tutor) => [
      tutor.role,
      tutor.person?.full_name,
      tutor.person?.title,
      tutor.person?.first_name,
      tutor.person?.middle_name,
      tutor.person?.last_name,
      tutor.person?.academic_rank,
      tutor.person?.institutional_role,
    ]),
  ]
    .map((value) => present(value))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function filterProgrammes(
  programmes: ProgrammeWithRelations[],
  query?: string | null,
) {
  const search = present(query)?.toLowerCase();
  if (!search) return programmes;

  const terms = search.split(/\s+/).filter(Boolean);
  return programmes.filter((programme) => {
    const haystack = programmeSearchText(programme);
    return terms.every((term) => haystack.includes(term));
  });
}
