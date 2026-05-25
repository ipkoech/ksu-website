import { mainApi, schoolsApi } from "@ksu/api-client";
import type {
  Club,
  Department,
  Document,
  News,
  Person,
  Programme,
  School,
  StaffAssignment,
} from "@ksu/api-client";
import type { Leader } from "@ksu/ui/components";
import { getDean } from "@/lib/get-leadership";

type SchoolResponse = {
  data?: School;
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

type SchoolRelatedRecords = Pick<
  SchoolDetailOverviewData,
  | "departments"
  | "programmes"
  | "staff"
  | "staffAssignments"
  | "clubs"
  | "documents"
  | "news"
  | "counts"
>;

const schoolFields = [
  "id",
  "name",
  "code",
  "slug",
  "school_type",
  "dean_id",
  "establishment_date",
  "about",
  "head_message",
  "mission",
  "vision",
  "mandate",
  "core_values",
  "phone",
  "email",
  "office_location",
  "website",
  "logo_image_id",
  "cover_image_id",
  "brochure_id",
  "is_active",
  "is_public",
  "display_order",
  "created_at",
  "updated_at",
].join(",");

const departmentFields = [
  "id",
  "name",
  "code",
  "slug",
  "department_type",
  "about",
  "mission",
  "vision",
  "office_location",
  "is_active",
  "is_public",
  "display_order",
].join(",");

const programmeFields = [
  "id",
  "name",
  "code",
  "slug",
  "level",
  "mode_of_study",
  "duration",
  "department_id",
  "about",
  "is_active",
  "display_order",
].join(",");

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
  "academic_rank",
  "institutional_role",
  "publications_count",
  "is_active",
  "is_public",
].join(",");

const clubFields = [
  "id",
  "name",
  "slug",
  "club_type",
  "about",
  "mission",
  "objectives",
  "email",
  "phone",
  "membership_count",
  "meeting_schedule",
  "is_active",
  "is_public",
  "display_order",
  "created_at",
  "updated_at",
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
  "photo_id",
  "photo_url",
  "academic_rank",
  "institutional_role",
  "office_location",
  "publications_count",
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

async function getSchoolBySlug(slug: string): Promise<School | null> {
  try {
    const response = await schoolsApi.getBySlug(slug, {
      fields: schoolFields,
      include: `departments:${departmentFields}`,
    });

    return response.data ?? null;
  } catch {
    try {
      const response = await mainApi.get<SchoolResponse>(`/api/v1/schools/${slug}`, {
        fields: schoolFields,
        include: `departments:${departmentFields}`,
      });

      return response.data ?? null;
    } catch {
      return null;
    }
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

async function getSchoolRelatedRecords(
  school: School,
): Promise<SchoolRelatedRecords> {
  const departments = (school.departments ?? [])
    .slice()
    .sort(
      (first, second) =>
        Number(first.display_order ?? 0) - Number(second.display_order ?? 0) ||
        first.name.localeCompare(second.name),
    );
  const [programmes, staff, staffAssignments, clubs, documents, news] =
    await Promise.all([
      getList<Programme>(`/api/v1/schools/${school.slug}/programmes`, {
        fields: programmeFields,
        per_page: 60,
      }),
      getList<Person>(`/api/v1/schools/${school.slug}/staff`, {
        fields: staffFields,
        per_page: 80,
      }),
      getList<StaffAssignment>("/api/v1/public/leadership/list", {
        entity_type: "school",
        entity_id: school.id,
        fields: staffAssignmentFields,
        include: `person:${staffAssignmentPersonFields}`,
      }),
      getList<Club>("/api/v1/clubs", {
        school_id: school.id,
        fields: clubFields,
        per_page: 40,
      }),
      getList<Document>("/api/v1/documents", {
        scope_type: "school",
        scope_id: school.id,
        fields: documentFields,
        per_page: 40,
      }),
      getList<News>("/api/v1/news", {
        scope_type: "school",
        scope_id: school.id,
        fields: newsFields,
        per_page: 40,
      }),
    ]);

  const publicationCount =
    staff.data?.reduce(
      (total, person) => total + Number(person.publications_count ?? 0),
      0,
    ) ?? 0;

  return {
    departments,
    programmes: programmes.data ?? [],
    staff: staff.data ?? [],
    staffAssignments: staffAssignments.data ?? [],
    clubs: clubs.data ?? [],
    documents: documents.data ?? [],
    news: news.data ?? [],
    counts: {
      departments: departments.length,
      programmes: listCount(programmes),
      staff: listCount(staff),
      publications: publicationCount,
      clubs: listCount(clubs),
      documents: listCount(documents),
      news: listCount(news),
    },
  };
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function fallbackSchool(slug: string): School {
  const title = titleFromSlug(slug);

  return {
    id: slug,
    name: title.toLowerCase().includes("school") ? title : `${title} School`,
    code: "",
    slug,
    campus_id: null,
    is_active: true,
    is_public: false,
    display_order: 0,
    created_at: "",
    updated_at: "",
  };
}

export type SchoolDetailOverviewData = {
  school: School;
  dean: Leader | null;
  departments: Department[];
  programmes: Programme[];
  staff: Person[];
  staffAssignments: StaffAssignment[];
  clubs: Club[];
  documents: Document[];
  news: News[];
  counts: {
    departments: number;
    programmes: number;
    staff: number;
    publications: number;
    clubs: number;
    documents: number;
    news: number;
  };
  sourceBacked: boolean;
};

export async function getSchoolDetailOverviewData(
  slug: string,
): Promise<SchoolDetailOverviewData> {
  const school = await getSchoolBySlug(slug);
  const resolvedSchool = school ?? fallbackSchool(slug);
  let dean: Leader | null = null;
  let related: SchoolRelatedRecords = {
    departments: [],
    programmes: [],
    staff: [],
    staffAssignments: [],
    clubs: [],
    documents: [],
    news: [],
    counts: {
      departments: 0,
      programmes: 0,
      staff: 0,
      publications: 0,
      clubs: 0,
      documents: 0,
      news: 0,
    },
  };

  if (school?.id) {
    [dean, related] = await Promise.all([
      getDean(school.id),
      getSchoolRelatedRecords(school),
    ]);
  }

  return {
    school: resolvedSchool,
    dean,
    ...related,
    sourceBacked: Boolean(school),
  };
}
