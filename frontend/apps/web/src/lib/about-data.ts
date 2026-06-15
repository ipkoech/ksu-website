import {
  divisionsApi,
  governanceApi,
  personsApi,
  schoolsApi,
  universityInfoApi,
} from "@ksu/api-client";
import { publicFileUrl, resolvePublicMediaUrl } from "@/lib/public-media";
import type {
  Board,
  Division,
  Person,
  School,
  StaffAssignment,
  UniversityInfo,
} from "@ksu/api-client";
import type { BoardMember } from "@/components/about/BoardMemberGrid";
import type { LeaderCardData } from "@/components/about/LeaderCard";
import type { TimelineItem } from "@/components/about/Timeline";

export const aboutIntro =
  "Kisii University College was founded in 1965 as a Primary Teachers Training College on 61 acres of land donated by the County Council of Gusii. It later evolved into a constituent college of Egerton University before receiving its charter on February 6, 2013 under the Universities Act 2012.";

export const aboutStats = [
  { value: "1965", label: "Established" },
  { value: "61", label: "Acres Donated" },
  { value: "8", label: "Schools" },
  { value: "1994", label: "Egerton Takeover" },
  { value: "2013", label: "University Charter" },
];

export const quickNavigation = [
  { title: "Overview", href: "/about" },
  { title: "History", href: "/about/history" },
  { title: "Mission, Vision & Values", href: "/about/mission-vision" },
  { title: "Governance", href: "/about/governance" },
  { title: "University Management", href: "/about/university-management" },
  { title: "Quality Assurance", href: "/about/quality-assurance" },
  { title: "Service Charter", href: "/about/service-charter" },
  { title: "Strategic Plan", href: "/about/strategic-plan" },
];

export const historyTimeline: TimelineItem[] = [
  {
    year: "1965",
    title: "Establishment of the institution",
    detail:
      "Kisii University College was founded in 1965 as a Primary Teachers Training College on 61 acres of land donated by the County Council of Gusii.",
  },
  {
    year: "1983",
    title: "Upgrade to Secondary Teachers College",
    detail:
      "The college continued up to 1983 when it was upgraded to a Secondary Teachers College to offer diploma programmes.",
  },
  {
    year: "1994",
    title: "Egerton University campus",
    detail:
      "The Government of Kenya mandated Egerton University to take over the college as its campus in 1994.",
  },
  {
    year: "1999",
    title: "First degree programme introduced",
    detail:
      "The Faculty of Commerce established Bachelor of Business and Management as the first degree programme, running alongside the Post Graduate Diploma in Education.",
  },
  {
    year: "2007",
    title: "Constituent college status",
    detail:
      "On August 23, 2007, Kisii University College was established through Legal Notice No. 163 of 2007 as a constituent college of Egerton University.",
  },
  {
    year: "2013",
    title: "Charter granted",
    detail:
      "On February 6, 2013, former President Mwai Kibaki granted Kisii University a charter through Legal Notice No. 225 in accordance with the Universities Act 2012.",
  },
];

export const coreValues = [
  {
    title: "Transformative Thinking",
    body: "The University champions education, training, learning, and research that prioritize innovation, critical thinking, and exploration of new ideas.",
  },
  {
    title: "Respect",
    body: "KSU is committed to upholding the rights and dignity of all individuals while valuing diverse perspectives and equitable treatment.",
  },
  {
    title: "Inclusivity",
    body: "Guided by Ubuntu, the University is dedicated to a diverse and welcoming community that values each person's background and perspective.",
  },
  {
    title: "Fairness",
    body: "KSU upholds equity through transparent and consistent decision-making, ethical conduct, and impartial treatment of all individuals.",
  },
];

export const officialVision =
  "An inclusive and borderless University that creates positive change in the world";

export const officialMission =
  "Creating a transformative environment that preserves knowledge, enriches the student experience, delivers quality training and research, and promotes community engagement for sustainable development.";

export const officialPhilosophy =
  "Creative, scientific, technological, innovative, and critical thinking, responsive to societal needs and service to humanity.";

export const serviceCharterUrl =
  "https://kisiiuniversity.ac.ke/about/our-service-charter";

export const leadershipFallback: (LeaderCardData & {
  group: "vc" | "dvc" | "registrar" | "dean";
  message?: string;
  biography: string;
  education: string[];
})[] = [
  {
    slug: "prof-dr-nathan-oyori-ogechi",
    name: "Prof. Dr. Nathan Oyori Ogechi",
    role: "Vice Chancellor",
    credentials: "PhD, University of Hamburg, Germany",
    summary:
      "Heads the University Management Board and also serves as Secretary to the University Council on the published governance page.",
    message:
      "Kisii University's public vision is to be an inclusive and borderless university that creates positive change in the world.",
    biography:
      "The published governance and management pages identify Prof. Dr. Nathan Oyori Ogechi as Vice Chancellor and University Council Secretary, with the University Management Board led from the Office of the Vice Chancellor.",
    education: [
      "PhD, University of Hamburg, Germany",
      "MPhil. (Kiswahili Studies), Moi University, Eldoret",
      "B.Ed (Arts), Moi University, Eldoret",
    ],
    group: "vc",
  },
  {
    slug: "dvc-academic-research-student-affairs",
    name: "Prof. Fredrick O. Wanyama, PhD",
    role: "Deputy Vice Chancellor (ARSA)",
    summary:
      "Listed on the published University Management Board page as the Deputy Vice Chancellor for Academic, Research and Student Affairs.",
    biography:
      "Serves on the University Management Board in the Academic, Research and Student Affairs portfolio.",
    education: [],
    group: "dvc",
  },
  {
    slug: "dvc-administration-planning-finance",
    name: "Prof. Nathan Oyaro, PhD",
    role: "DVC AP&F",
    summary:
      "Listed on the published University Management Board page under the Administration, Planning and Finance portfolio.",
    biography:
      "Serves on the University Management Board as the published DVC AP&F.",
    education: [],
    group: "dvc",
  },
  {
    slug: "ag-registrar-ahrcs",
    name: "Dr. Stella Omari, PhD",
    role: "Ag. Registrar AHRCS",
    summary:
      "Listed on the University Management Board page as Acting Registrar AHRCS.",
    biography:
      "Serves on the published management board in the AHRCS registrar role.",
    education: [],
    group: "registrar",
  },
  {
    slug: "ag-registrar-aa",
    name: "Prof. Kennedy Getange, PhD",
    role: "Ag. Registrar AA",
    summary:
      "Listed on the University Management Board page as Acting Registrar AA.",
    biography:
      "Serves on the published management board in the Academic Affairs registrar role.",
    education: [],
    group: "registrar",
  },
  {
    slug: "ag-registrar-reirm",
    name: "Prof. Christopher Ngacho, PhD",
    role: "Ag. Registrar REIRM",
    summary:
      "Listed on the University Management Board page as Acting Registrar REIRM.",
    biography:
      "Serves on the published management board in the REIRM registrar role.",
    education: [],
    group: "registrar",
  },
  {
    slug: "finance-officer",
    name: "CPA Charles M. Mwangi",
    role: "Finance Officer",
    summary:
      "Listed on the published University Management Board page as Finance Officer.",
    biography:
      "Serves on the published management board in the finance portfolio.",
    education: [],
    group: "registrar",
  },
];

export const governanceFallback: (Board & { members: BoardMember[] })[] = [
  {
    id: "council",
    slug: "university-council",
    name: "University Council",
    board_type: "Council",
    description:
      "The University Council is the supreme governing body responsible for policy oversight, fiduciary stewardship, and institutional accountability.",
    mandate:
      "Provides strategic oversight, approves policy, and safeguards the university's public mandate under the charter and Universities Act framework.",
    meeting_schedule: "Not published on the current council page",
    show_member_terms: true,
    is_public: true,
    is_active: true,
    status: "active",
    display_order: 1,
    created_at: "",
    updated_at: "",
    members: [
      { name: "Dr. Sara Jerop Ruto, PhD", role: "Chairperson, University Council" },
      { name: "Prof. Dr. Nathan Oyori Ogechi", role: "Vice Chancellor, University Council Secretary" },
      { name: "Dr. Samson Eric Muchelule", role: "Member, University Council" },
      { name: "Dr. Scholastica M. Ndambuki, PhD", role: "Member, University Council" },
      { name: "Ms. Elizabeth Mwangi", role: "Member, University Council" },
      { name: "Prof. Rev. Peter Mageto", role: "Member, University Council" },
      { name: "Dr. Mwenda Makathimo", role: "Member, University Council" },
      { name: "Dr. Pamela Awuor Ochieng", role: "Member, University Council" },
      { name: "Mr. Josphat Sawe", role: "Member, University Council" },
    ],
  },
  {
    id: "senate",
    slug: "senate",
    name: "Senate",
    board_type: "Senate",
    description:
      "The strategic plan describes Senate as the University's academic authority, responsible for curriculum development, educational standards, and research initiatives.",
    mandate:
      "Oversees academic standards, programme quality, examinations, and scholarly direction.",
    meeting_schedule: "Not published on the referenced About pages",
    show_member_terms: true,
    is_public: true,
    is_active: true,
    status: "active",
    display_order: 2,
    created_at: "",
    updated_at: "",
    members: [
      { name: "Published via institutional governance structures", role: "Academic authority" },
    ],
  },
  {
    id: "management-board",
    slug: "management-board",
    name: "Management Board",
    board_type: "Management Board",
    description:
      "The University Management Board handles day-to-day administration and implementation of university policies and the strategic plan.",
    mandate:
      "Aligns institutional operations, performance management, and execution of council and senate decisions.",
    meeting_schedule: "Not published on the current management board page",
    show_member_terms: true,
    is_public: true,
    is_active: true,
    status: "active",
    display_order: 3,
    created_at: "",
    updated_at: "",
    members: [
      { name: "Prof. Dr. Nathan O. Ogechi", role: "Vice Chancellor" },
      { name: "Prof. Fredrick O. Wanyama, PhD", role: "Deputy Vice Chancellor (ARSA)" },
      { name: "Prof. Nathan Oyaro, PhD", role: "DVC AP&F" },
      { name: "Dr. Stella Omari, PhD", role: "Ag. Registrar AHRCS" },
      { name: "Prof. Kennedy Getange, PhD", role: "Ag. Registrar AA" },
      { name: "Prof. Christopher Ngacho, PhD", role: "Ag. Registrar REIRM" },
      { name: "CPA Charles M. Mwangi", role: "Finance Officer" },
    ],
  },
];

export const accreditations = [
  {
    acronym: "CUE",
    title: "Commission for University Education",
    body: "The About page states that Kisii University was granted its charter on February 6, 2013 in accordance with the Universities Act 2012.",
  },
  {
    acronym: "QMS",
    title: "Quality Management Systems",
    body: "The 2024/2025–2028/2029 Strategic Plan states that approved policies, QMS operating procedures, and planned audits will support implementation and continual improvement.",
  },
  {
    acronym: "SC",
    title: "Service Charter",
    body: "The About area links to the university's service charter as part of its public-facing accountability and service commitment framework.",
  },
];

export const strategicPlanHighlights = [
  {
    title: "Quality in Education, Training, and Learning",
    body: "The strategic plan identifies this as the first Key Result Area and links it to competent, well-rounded graduates and rigorous academic standards.",
  },
  {
    title: "Knowledge Preservation, Generation, and Communication",
    body: "KSU positions knowledge creation, preservation, and dissemination as a continuous cycle that strengthens its intellectual foundation and public impact.",
  },
  {
    title: "Collaborations, Partnerships, and Community Outreach",
    body: "The plan emphasizes engagement with other universities, research institutions, government, industry, and communities.",
  },
  {
    title: "Cancer Management and Research",
    body: "The 2024/2025–2028/2029 plan identifies cancer management and research as the university's niche area.",
  },
];

export const strategicDocuments = [
  {
    title: "Strategic Plan 2024/2025–2028/2029",
    body: "The current published strategic plan sets the university's vision, mission, values, key result areas, and implementation framework.",
    href: "https://kisiiuniversity.ac.ke/storage/public/downloads/KISII%20UNIVERSITY%20%20STRATEGIC%20%20PLAN%202024%20-%202028-6.pdf",
  },
  {
    title: "University Council Page",
    body: "Published council membership and selected qualifications for the chairperson, secretary, and members.",
    href: "https://kisiiuniversity.ac.ke/board_/kisii-university-council",
  },
  {
    title: "Our Service Charter",
    body: "The public service charter linked from the About area.",
    href: "https://kisiiuniversity.ac.ke/about/our-service-charter",
  },
];

export const administrativeDivisionFallback: Array<{
  title: string;
  code: string;
  description: string;
  units: string[];
}> = [
  {
    title: "Office of the Vice-Chancellor",
    code: "OVC",
    description:
      "Executive leadership office responsible for institutional direction and public representation.",
    units: ["Vice Chancellor"],
  },
  {
    title: "Division of Administration, Planning & Finance",
    code: "APF",
    description:
      "Parent division for administration, planning, finance, and support services.",
    units: [
      "Administration, Human Resource and Central Services",
      "Finance",
      "Information Communication and Technology",
      "Planning",
      "Medical Services",
      "Internal Audit",
      "Legal",
      "Procurement and Supplies",
      "Corporate Communication",
    ],
  },
  {
    title: "Division of Academic, Research & Student Affairs",
    code: "ARSA",
    description:
      "Parent division for academic affairs, research, and student-facing university functions.",
    units: [
      "Academic Affairs",
      "Research, Extension, Innovation and Resource Mobilization",
      "E-Learning",
      "Student Affairs",
    ],
  },
];

const overviewFallback: Pick<
  UniversityInfo,
  | "name"
  | "overview"
  | "vision"
  | "mission"
  | "core_values"
  | "charter_summary"
  | "history_summary"
  | "chancellor_message_title"
  | "chancellor_message"
  | "vc_message_title"
  | "vc_message"
  | "phone"
  | "website"
  | "postal_address"
  | "quick_facts"
> = {
  name: "Kisii University",
  overview: aboutIntro,
  vision: officialVision,
  mission: officialMission,
  core_values: coreValues.map((item) => item.title).join("; "),
  charter_summary:
    "Kisii University was granted its charter on February 6, 2013 through Legal Notice No. 225 in accordance with the Universities Act 2012.",
  history_summary:
    "The institution was founded in 1965, upgraded in 1983, became an Egerton University campus in 1994, became a constituent college in 2007, and received its charter in 2013.",
  chancellor_message_title: "Message from the Chancellor",
  chancellor_message:
    "The Chancellor is the titular head of the University and confers degrees and other awards in consultation with the University Council and Senate.",
  vc_message_title: "Message from the Vice Chancellor",
  vc_message:
    "On behalf of the University Council, Management, and the wider university community, the Vice Chancellor welcomes students to a fast-growing and dynamic institution committed to academic excellence, research, integrity, professionalism, and social responsibility.",
  phone: "+254720875082",
  website: "https://kisiiuniversity.ac.ke",
  postal_address: "P.O. Box 408-40200, Kisii, Kenya",
  quick_facts: {
    founding_year: 1965,
    charter_year: 2013,
    schools: 8,
    acres: 61,
    first_degree_year: 1999,
  },
};

function toLeaderCardFromPerson(person: Person): LeaderCardData {
  return {
    slug: person.slug,
    name:
      person.title && !person.first_name.startsWith(person.title)
        ? `${person.title} ${person.first_name} ${person.last_name}`
        : `${person.first_name} ${person.last_name}`,
    role: person.academic_rank || person.person_type || "University Leader",
    credentials:
      person.qualifications?.[0]
        ? `${person.qualifications[0].degree} in ${person.qualifications[0].field}`
        : undefined,
    email: person.email,
    phone: person.phone,
    summary:
      person.bio ||
      person.full_bio ||
      "No detailed public profile summary is currently published for this leader.",
    photoUrl: resolvePublicMediaUrl(person.photo_url) ?? undefined,
  };
}

function boardMemberName(assignment: StaffAssignment) {
  const person = assignment.person;
  const fullName = person?.full_name?.trim();
  if (fullName) return fullName;

  if (person) {
    return [person.title, person.first_name, person.middle_name, person.last_name]
      .filter(Boolean)
      .join(" ");
  }

  return assignment.title || assignment.role;
}

function boardMemberPhotoUrl(assignment: StaffAssignment) {
  return publicFileUrl(assignment.person?.photo_id) ?? resolvePublicMediaUrl(assignment.person?.photo_url);
}

function toBoardMembers(assignments: StaffAssignment[]): BoardMember[] {
  return assignments.map((assignment) => ({
    name: boardMemberName(assignment),
    role: assignment.role_display || assignment.role || assignment.title || "Member",
    photoUrl: boardMemberPhotoUrl(assignment),
  }));
}

const boardMemberFieldSelection = {
  fields: [
    "id",
    "person_id",
    "role",
    "title",
    "role_display",
    "display_order",
  ].join(","),
  include:
    "person:id,slug,title,first_name,middle_name,last_name,full_name,photo_id,photo_url",
};

function mapSchoolToDean(school: School): LeaderCardData | null {
  if (!school.dean_name) {
    return null;
  }

  return {
    slug: `dean-${school.slug}`,
    name: school.dean_name,
    role: `Dean, ${school.name}`,
    email: school.dean_email ?? undefined,
    summary:
      school.about ||
      school.description ||
      `Academic leadership for ${school.name}.`,
  };
}

export async function getLeadershipData() {
  try {
    const schoolsResponse = await schoolsApi.list({
      per_page: 24,
      fields: "id,name,slug,dean_name,dean_email,about,description",
    });
    const deanCards = (schoolsResponse.data ?? [])
      .map(mapSchoolToDean)
      .filter((value): value is LeaderCardData => value !== null);

    return {
      featuredLeader: leadershipFallback.find((leader) => leader.group === "vc")!,
      deputies: leadershipFallback.filter((leader) => leader.group === "dvc"),
      registrars: leadershipFallback.filter((leader) => leader.group === "registrar"),
      deans: deanCards,
    };
  } catch {
    // Fallback content for unavailable data.
  }

  return {
    featuredLeader: leadershipFallback.find((leader) => leader.group === "vc")!,
    deputies: leadershipFallback.filter((leader) => leader.group === "dvc"),
    registrars: leadershipFallback.filter((leader) => leader.group === "registrar"),
    deans: [],
  };
}

export async function getOverviewData() {
  try {
    const response = await universityInfoApi.getCurrent();
    return response.data;
  } catch {
    return overviewFallback;
  }
}

export async function getLeaderProfile(slug: string) {
  try {
    const response = await personsApi.getBySlug(slug, {
      fields:
        "id,slug,title,first_name,middle_name,last_name,full_name,email,phone,photo_id,photo_url,bio,full_bio,qualifications,academic_rank,person_type",
    });
    const person = response.data;

    return {
      ...toLeaderCardFromPerson(person),
      message:
        person.full_bio ||
        "The university remains committed to academic quality, institutional integrity, and public service.",
      biography:
        person.full_bio ||
        person.bio ||
        "No detailed public biography is currently published for this leader.",
      education:
        person.qualifications?.map(
          (qualification) =>
            `${qualification.degree} in ${qualification.field}, ${qualification.institution}${qualification.year ? ` (${qualification.year})` : ""}`,
        ) ?? [],
    };
  } catch {
    const fallbackLeader = leadershipFallback.find((leader) => leader.slug === slug);
    if (!fallbackLeader) {
      return null;
    }

    return {
      ...fallbackLeader,
      message:
        fallbackLeader.message ||
        "This profile is based on the currently published public leadership pages of Kisii University.",
    };
  }
}

export async function getGovernanceData() {
  try {
    const response = await governanceApi.listBoards({ per_page: 20, is_public: true });
    const boards = response.data ?? [];

    if (boards.length > 0) {
      return await Promise.all(
        boards.map(async (board) => {
          const fallbackMembers =
            governanceFallback.find((fallbackBoard) => fallbackBoard.slug === board.slug)
              ?.members ?? [];

          if (!board.slug) {
            return {
              ...board,
              members: fallbackMembers,
            };
          }

          try {
            const membersResponse = await governanceApi.getBoardMembersBySlug(
              board.slug,
              boardMemberFieldSelection,
            );

            return {
              ...board,
              members: toBoardMembers(membersResponse.data ?? []),
            };
          } catch {
            return {
              ...board,
              members: fallbackMembers,
            };
          }
        }),
      );
    }
  } catch {
    // Fall back to prompt-aligned static content.
  }

  return governanceFallback;
}

export async function getGovernanceBoard(slug: string) {
  try {
    const [boardResponse, membersResponse] = await Promise.all([
      governanceApi.getBoardBySlug(slug),
      governanceApi.getBoardMembersBySlug(slug, boardMemberFieldSelection),
    ]);

    return {
      ...boardResponse.data,
      members: toBoardMembers(membersResponse.data ?? []),
    };
  } catch {
    return governanceFallback.find((board) => board.slug === slug) ?? null;
  }
}

export async function getAdministrativeDivisions() {
  try {
    const response = await divisionsApi.list({
      per_page: 20,
      fields: "id,name,code,description",
    });
    const divisions = response.data ?? [];

    if (divisions.length > 0) {
      return divisions.map((division: Division) => ({
        title: division.name,
        code: division.code,
        description:
          division.description ||
          "Administrative division information will be updated from current institutional records.",
        units:
          administrativeDivisionFallback.find((item) => item.code === division.code)
            ?.units ?? [],
      }));
    }
  } catch {
    // Use fallback divisions.
  }

  return administrativeDivisionFallback;
}
