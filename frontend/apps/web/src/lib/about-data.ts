import {
  documentsApi,
  governanceApi,
  personsApi,
  schoolsApi,
  universityInfoApi,
  type Board,
  type Document,
  type Person,
  type School,
  type StaffAssignment,
  type UniversityInfo,
} from "@ksu/api-client";
import type { BoardMember } from "@/components/about/BoardMemberGrid";
import type { LeaderCardData } from "@/components/about/LeaderCard";
import { publicFileUrl, resolvePublicMediaUrl } from "@/lib/public-media";

export const aboutNavigation = [
  { title: "About Us", href: "/about" },
  { title: "History", href: "/about/history" },
  { title: "Governance", href: "/about/governance" },
  { title: "Management", href: "/about/university-management" },
  { title: "Quality Assurance", href: "/about/quality-assurance" },
];

export type BackendBoard = Board & { members: BoardMember[] };

export type AboutOverviewData = {
  overview: UniversityInfo | null;
  coverImageUrl: string | null;
  brochureUrl: string | null;
  coreValues: string[];
  quickFacts: Array<{ label: string; value: string }>;
};

export type AboutSchoolSummary = Pick<
  School,
  "id" | "name" | "slug" | "description" | "about" | "departments_count"
>;

export type GovernancePageData = {
  overview: UniversityInfo | null;
  boards: BackendBoard[];
};

export type ManagementPageData = {
  overview: UniversityInfo | null;
  managementBoard: BackendBoard | null;
  senate: BackendBoard | null;
  leaders: LeaderCardData[];
  featuredLeader: LeaderCardData | null;
};

export type QualityAssurancePageData = {
  overview: UniversityInfo | null;
  strategicPriorities: Array<{ title: string; body: string }>;
  documents: Document[];
  brochureUrl: string | null;
};

const universityInfoFields = [
  "id",
  "name",
  "short_name",
  "acronym",
  "slug",
  "motto",
  "overview",
  "vision",
  "mission",
  "core_values",
  "founding_year",
  "institution_type",
  "charter_summary",
  "history_summary",
  "email",
  "phone",
  "website",
  "physical_address",
  "city",
  "county",
  "country",
  "quick_facts",
  "strategic_priorities",
  "cover_image_id",
  "brochure_id",
  "chancellor_id",
  "vc_id",
  "council_chair_id",
  "chancellor_message_title",
  "chancellor_message",
  "vc_message_title",
  "vc_message",
  "council_chair_message_title",
  "council_chair_message",
  "additional_head_messages",
].join(",");

const boardFields = [
  "id",
  "name",
  "slug",
  "board_type",
  "mandate",
  "description",
  "head_message",
  "meeting_schedule",
  "member_count",
  "current_members",
  "quorum",
  "show_member_terms",
  "cover_image_id",
  "is_public",
  "is_active",
  "status",
  "display_order",
].join(",");

const boardMemberFieldSelection = {
  fields: [
    "id",
    "person_id",
    "role",
    "title",
    "role_display",
    "hierarchy_level",
    "display_order",
    "is_acting",
    "show_term_dates",
    "term_years",
    "term_display",
    "start_date",
    "end_date",
    "notes",
  ].join(","),
  include:
    "person:id,slug,title,first_name,middle_name,last_name,full_name,email,phone,photo_id,photo_url,bio,full_bio,qualifications,institutional_role,leadership_message",
};

const personFields = [
  "id",
  "slug",
  "title",
  "first_name",
  "middle_name",
  "last_name",
  "full_name",
  "email",
  "phone",
  "photo_id",
  "photo_url",
  "bio",
  "full_bio",
  "qualifications",
  "institutional_role",
  "leadership_message",
  "is_public",
  "is_active",
  "show_on_directory",
].join(",");

const schoolFields = [
  "id",
  "name",
  "slug",
  "description",
  "about",
  "departments_count",
  "is_public",
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
  "is_public",
  "requires_login",
  "is_active",
  "display_order",
  "updated_at",
].join(",");

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function displayName(person?: Person | null) {
  if (!person) return null;
  const fullName = present(person.full_name);
  if (fullName) return fullName;
  return [person.title, person.first_name, person.middle_name, person.last_name]
    .map((item) => present(item))
    .filter(Boolean)
    .join(" ");
}

function roleLabel(assignment: StaffAssignment) {
  return (
    present(assignment.title) ??
    present(assignment.role_display) ??
    present(assignment.role?.replace(/_/g, " ")) ??
    "Member"
  );
}

function toBoardMembers(assignments: StaffAssignment[]): BoardMember[] {
  return assignments
    .filter((assignment) => assignment.is_public !== false)
    .sort((first, second) => {
      const firstLevel = first.hierarchy_level ?? 99;
      const secondLevel = second.hierarchy_level ?? 99;
      if (firstLevel !== secondLevel) return firstLevel - secondLevel;
      return (first.display_order ?? 100) - (second.display_order ?? 100);
    })
    .map((assignment) => ({
      name:
        displayName(assignment.person) ??
        present(assignment.title) ??
        "Published member",
      role: roleLabel(assignment),
      note: assignment.term_display ?? assignment.notes ?? undefined,
      photoUrl:
        publicFileUrl(assignment.person?.photo_id) ??
        resolvePublicMediaUrl(assignment.person?.photo_url),
    }));
}

function toLeaderCard(person: Person): LeaderCardData {
  const name = displayName(person) ?? "Published leader";
  return {
    slug: person.slug || person.id,
    name,
    role:
      present(person.institutional_role?.replace(/_/g, " ")) ??
      present(person.academic_rank?.replace(/_/g, " ")) ??
      "University leader",
    credentials:
      person.qualifications?.[0]
        ? [
            person.qualifications[0].degree,
            person.qualifications[0].field,
            person.qualifications[0].institution,
          ]
            .map((item) => present(item))
            .filter(Boolean)
            .join(", ")
        : undefined,
    email: person.email,
    phone: person.phone ?? undefined,
    summary:
      person.leadership_message ??
      person.bio ??
      person.full_bio ??
      "Public profile details are not currently published.",
    photoUrl:
      publicFileUrl(person.photo_id) ??
      resolvePublicMediaUrl(person.photo_url) ??
      undefined,
  };
}

function isNotFoundError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    (error as { status?: unknown }).status === 404
  );
}

export function splitCoreValues(value?: string | null) {
  return (value ?? "")
    .split(/[\n;|]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getPhilosophy(overview?: UniversityInfo | null) {
  const priorities = overview?.strategic_priorities;
  if (!priorities) return null;

  if (Array.isArray(priorities)) {
    const item = priorities.find((entry) => {
      const title =
        present(entry.title as string | undefined) ??
        present(entry.name as string | undefined);
      return title?.toLowerCase().includes("philosophy");
    });
    return (
      present(item?.body as string | undefined) ??
      present(item?.description as string | undefined) ??
      present(item?.summary as string | undefined)
    );
  }

  return present(priorities.philosophy as string | undefined);
}

export function normalizeQuickFacts(value?: Record<string, unknown> | null) {
  if (!value) return [];

  return Object.entries(value)
    .map(([key, rawValue]) => {
      const formattedValue = present(rawValue as string | number | null);
      if (!formattedValue) return null;

      return {
        label: key
          .replace(/[_-]+/g, " ")
          .replace(/\b\w/g, (character) => character.toUpperCase()),
        value: formattedValue,
      };
    })
    .filter((item): item is { label: string; value: string } => Boolean(item));
}

export function normalizeStrategicPriorities(
  value?: UniversityInfo["strategic_priorities"],
) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const title =
        present(item.title as string | undefined) ??
        present(item.name as string | undefined);
      const body =
        present(item.body as string | undefined) ??
        present(item.description as string | undefined) ??
        present(item.summary as string | undefined);

      return title && body ? { title, body } : null;
    })
    .filter((item): item is { title: string; body: string } => Boolean(item));
}

export async function getOverviewData(): Promise<UniversityInfo | null> {
  try {
    const response = await universityInfoApi.getCurrent({
      fields: universityInfoFields,
      include: "cover_image,brochure,main_campus,vc,chancellor,council_chair",
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch university info:", error);
    return null;
  }
}

export async function getAboutSchools(): Promise<AboutSchoolSummary[]> {
  try {
    const response = await schoolsApi.list({
      per_page: 8,
      fields: schoolFields,
    });
    return (response.data ?? [])
      .filter((school) => school.is_public !== false && school.is_active !== false)
      .sort(
        (first, second) =>
          (first.display_order ?? 100) - (second.display_order ?? 100),
      )
      .map((school) => ({
        id: school.id,
        name: school.name,
        slug: school.slug,
        description: school.description,
        about: school.about,
        departments_count: school.departments_count,
      }));
  } catch (error) {
    console.error("Failed to fetch about schools:", error);
    return [];
  }
}

async function getBoardMembers(slug: string) {
  try {
    const response = await governanceApi.getBoardMembersBySlug(
      slug,
      boardMemberFieldSelection,
    );
    return toBoardMembers(response.data ?? []);
  } catch (error) {
    if (!isNotFoundError(error)) {
      console.error(`Failed to fetch board members for ${slug}:`, error);
    }
    return [];
  }
}

export async function getGovernanceData(): Promise<GovernancePageData> {
  const [overview, boardsResponse] = await Promise.allSettled([
    getOverviewData(),
    governanceApi.listBoards({
      per_page: 50,
      is_public: true,
      fields: boardFields,
    }),
  ]);
  const boards =
    boardsResponse.status === "fulfilled" ? boardsResponse.value.data ?? [] : [];

  if (boardsResponse.status === "rejected") {
    console.error("Failed to fetch governance boards:", boardsResponse.reason);
  }

  return {
    overview: overview.status === "fulfilled" ? overview.value : null,
    boards: await Promise.all(
      boards.map(async (board) => ({
        ...board,
        members: board.slug ? await getBoardMembers(board.slug) : [],
      })),
    ),
  };
}

export async function getGovernanceBoard(slug: string) {
  try {
    const [boardResponse, members] = await Promise.all([
      governanceApi.getBoardBySlug(slug, { fields: boardFields }),
      getBoardMembers(slug),
    ]);
    return { ...boardResponse.data, members };
  } catch (error) {
    if (!isNotFoundError(error)) {
      console.error(`Failed to fetch governance board ${slug}:`, error);
    }
    return null;
  }
}

export async function getManagementData(): Promise<ManagementPageData> {
  const [overview, managementBoard, senate, persons] = await Promise.allSettled([
    getOverviewData(),
    getGovernanceBoard("management-board"),
    getGovernanceBoard("senate"),
    personsApi.list({
      per_page: 100,
      status: "active",
      fields: personFields,
    }),
  ]);
  const publicPeople =
    persons.status === "fulfilled"
      ? (persons.value.data ?? []).filter((person) => person.is_public !== false)
      : [];

  if (persons.status === "rejected") {
    console.error("Failed to fetch public leaders:", persons.reason);
  }

  const leaders = publicPeople
    .filter((person) => present(person.institutional_role))
    .map(toLeaderCard);
  const overviewValue = overview.status === "fulfilled" ? overview.value : null;
  const featuredLeader =
    leaders.find((leader) => leader.slug === overviewValue?.vc_id) ??
    leaders.find((leader) => leader.role.toLowerCase().includes("vc")) ??
    leaders.find((leader) => leader.role.toLowerCase().includes("vice chancellor")) ??
    leaders[0] ??
    null;

  return {
    overview: overviewValue,
    managementBoard:
      managementBoard.status === "fulfilled" ? managementBoard.value : null,
    senate: senate.status === "fulfilled" ? senate.value : null,
    leaders,
    featuredLeader,
  };
}

async function getQualityDocuments() {
  const requests = ["quality-assurance", "strategic-plan", "service-charter"].map(
    (category) =>
      documentsApi.list({
        category,
        scope_type: "university",
        per_page: 12,
        fields: documentFields,
      }),
  );
  const settled = await Promise.allSettled(requests);
  return settled
    .flatMap((result) => (result.status === "fulfilled" ? result.value.data ?? [] : []))
    .filter((document, index, all) => {
      if (document.is_public === false || document.is_active === false) return false;
      return all.findIndex((item) => item.id === document.id) === index;
    })
    .sort((first, second) => first.display_order - second.display_order);
}

export async function getQualityAssuranceData(): Promise<QualityAssurancePageData> {
  const [overview, documents] = await Promise.all([
    getOverviewData(),
    getQualityDocuments(),
  ]);

  return {
    overview,
    strategicPriorities: normalizeStrategicPriorities(
      overview?.strategic_priorities,
    ),
    documents,
    brochureUrl: publicFileUrl(overview?.brochure_id),
  };
}

export async function getLeaderProfile(slug: string) {
  try {
    const response = await personsApi.getBySlug(slug, {
      fields: [
        personFields,
        "alternative_email",
        "alternative_phone",
        "office_location",
        "office_phone",
        "education_background",
        "professional_memberships",
        "awards_honors",
        "cv_file_id",
      ].join(","),
      include: "photo,cv_file,department",
    });
    const person = response.data;

    return {
      ...toLeaderCard(person),
      message:
        person.leadership_message ??
        person.full_bio ??
        person.bio ??
        "Public leadership message is not currently published.",
      biography:
        person.full_bio ??
        person.bio ??
        "Public biography is not currently published.",
      education:
        person.qualifications?.map((qualification) =>
          [
            qualification.degree,
            qualification.field,
            qualification.institution,
            qualification.year,
          ]
            .map((item) => present(item))
            .filter(Boolean)
            .join(", "),
        ) ?? [],
    };
  } catch (error) {
    console.error(`Failed to fetch leader profile ${slug}:`, error);
    return null;
  }
}
