import {
  accommodationsApi,
  academicCalendarsApi,
  alumniApi,
  alumniAssociationsApi,
  announcementsApi,
  artsCultureApi,
  blogsApi,
  clubsApi,
  contactsApi,
  departmentsApi,
  divisionsApi,
  documentsApi,
  eventsApi,
  faqsApi,
  intakesApi,
  newsApi,
  programmesApi,
  schoolsApi,
  searchApi,
  sportsFacilitiesApi,
  studentGovernanceApi,
  wingsApi,
  mainApi,
  type Accommodation,
  type AcademicCalendar,
  type Alumni,
  type AlumniAssociation,
  type Announcement,
  type ArtsCulture,
  type Blog,
  type Club,
  type ContactDirectory,
  type Department,
  type Division,
  type Document,
  type Event,
  type FAQ,
  type Intake,
  type News,
  type Programme,
  type School,
  type SearchPayload,
  type SportsFacility,
  type StudentGovernance,
  type Wing,
} from "@ksu/api-client";
import type {
  PublicCard,
  PublicIconName,
  PublicPageConfig,
} from "@/components/public/section-page";
import {
  getAcademicsPage,
  getAdministrationPage,
  getAlumniPage,
  getAnnouncementsPage,
  getCampusLifePage,
  getEventsPage,
  getNewsPage,
  getSearchPage,
} from "@/lib/public-page-data";
import { researchFrontendUrl } from "@/lib/service-urls";
import { publicFileUrl } from "@/lib/public-media";

type ListEnvelope<T> = {
  data?: T[];
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    pages?: number;
    total_pages?: number;
  };
};
type RecordEnvelope<T> = { data?: T | null };

const officialSources = {
  administration:
    "https://kisiiuniversity.ac.ke/admin_departments/administrative-division",
  schools: "https://kisiiuniversity.ac.ke/schools_departments",
  campusLife: "https://kisiiuniversity.ac.ke/campus-life",
  news: "https://kisiiuniversity.ac.ke/news",
  conferences: "https://digital.kisiiuniversity.ac.ke/conferences",
  research: researchFrontendUrl,
  portal: "https://portal.kisiiuniversity.ac.ke",
  elearning: "https://elearning.kisiiuniversity.ac.ke",
};

const editorialFields =
  "id,title,slug,summary,excerpt,plain_text,rich_text,content,category,published_at,created_at,is_published,author_name";
const eventFields =
  "id,title,slug,summary,plain_text,rich_text,content,start_date,end_date,venue,location,is_virtual,registration_required,published_at,created_at";
const announcementFields =
  "id,title,slug,summary,plain_text,rich_text,content,category,priority,audience,target_audience,published_at,valid_from,valid_to,created_at";
const schoolFields =
  "id,name,code,slug,school_type,about,description,mandate,dean_name,office_location,email,departments_count,cover_image_id";
const programmeFields =
  "id,name,code,slug,level,mode_of_study,duration,department_name,about,objectives,curriculum_overview,entry_requirements,career_prospects,intake_months,accreditation_status,accrediting_body,cover_image_id";
const intakeFields = "id,name,slug,application_start,application_end,is_open";
const academicCalendarFields =
  "id,academic_year,semester,start_date,end_date,registration_start,registration_end,late_registration_end,teaching_start,teaching_end,exam_start,exam_end,results_release,status";
const documentFields =
  "id,title,slug,description,document_type,category,version,published_at";
const divisionFields =
  "id,name,slug,code,division_type,description,head_message,mission,is_active,display_order";
const wingFields =
  "id,name,slug,code,wing_type,description,mandate,service_charter,office_location,email,phone,is_active,display_order";
const departmentFields =
  "id,name,code,slug,department_type,school_id,school_name,about,mandate,head_id,hod_name,email,office_location,cover_image_id,programmes_count,display_order";
const clubFields =
  "id,name,slug,club_type,about,mission,objectives,membership_count,meeting_schedule";
const accommodationFields =
  "id,name,slug,accommodation_type,gender,about,rules,capacity,is_accepting_applications,amenities,email,phone";
const sportsFields = "id,name,slug,facility_type,sport_types,about,location";
const artsFields = "id,title,slug,category,about";
const governanceFields =
  "id,name,slug,acronym,governance_type,about,mandate,constitution,office_location,email,phone";
const faqFields = "id,question,answer,answer_plain_text,category";
const contactFields =
  "id,name,email,phone,building,room_number,physical_address";
const alumniFields =
  "id,current_position,current_employer,graduation_year,bio,achievements,industry,is_mentor_available";
const alumniAssociationFields =
  "id,name,slug,acronym,association_type,region,about,mission,objectives";
const searchFieldParams = {
  news_fields: editorialFields,
  blogs_fields: editorialFields,
  events_fields: eventFields,
  announcements_fields: announcementFields,
  schools_fields: schoolFields,
  departments_fields: departmentFields,
  persons_fields:
    "id,full_name,first_name,last_name,bio,specialization,department_name",
};

const communicationsNav: PublicCard[] = [
  pageCard("News", "/news", "University news.", "news", "Open news"),
  pageCard(
    "Blogs",
    "/blogs",
    "Articles and blog records.",
    "file",
    "Open blogs",
  ),
  pageCard("Events", "/events", "Event records.", "calendar", "Open events"),
  pageCard(
    "Announcements",
    "/announcements",
    "Official public notices.",
    "megaphone",
    "Open notices",
  ),
];

const programmeLevelOptions = [
  { value: "", label: "All levels" },
  { value: "certificate", label: "Certificate" },
  { value: "diploma", label: "Diploma" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "masters", label: "Masters" },
  { value: "phd", label: "PhD" },
];

const programmeModeOptions = [
  { value: "", label: "All modes" },
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "full_time_part_time", label: "Full-time / part-time" },
];

const programmeSortOptions = [
  { value: "", label: "Recommended" },
  { value: "name", label: "Programme name" },
  { value: "level", label: "Academic level" },
  { value: "duration", label: "Duration" },
];

function titleFromSlug(slug?: string) {
  if (!slug) return "Published record";
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatPublicLabel(value?: string | null) {
  const text = value?.trim();
  if (!text) return null;
  return text
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function pageCard(
  title: string,
  href: string,
  body: string,
  icon: PublicIconName = "file",
  action = "Open page",
  external = false,
): PublicCard {
  return { title, href, body, icon, action, external };
}

function infoCard(
  title: string,
  body: string,
  icon: PublicIconName = "file",
  eyebrow?: string,
): PublicCard {
  return { title, body, icon, eyebrow };
}

function externalCard(
  title: string,
  href: string,
  body: string,
  icon: PublicIconName = "file",
  action = "Open official page",
): PublicCard {
  return pageCard(title, href, body, icon, action, true);
}

function stripHtml(value?: string | null) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bestText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const text = stripHtml(value);
    if (text) return text;
  }
  return "";
}

function bestContent(...values: Array<string | null | undefined>) {
  for (const value of values) {
    if (bestText(value)) return value ?? "";
  }
  return "";
}

function shortText(
  value: string | null | undefined,
  fallback: string,
  max = 210,
) {
  const text = bestText(value) || fallback;
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function formatDate(value?: string | null) {
  if (!value) return "Not dated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateRange(start?: string | null, end?: string | null) {
  if (!start && !end) return null;
  if (!start) return `Until ${formatDate(end)}`;
  if (!end) return `From ${formatDate(start)}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function academicCalendarCard(calendar: AcademicCalendar): PublicCard {
  const dates = [
    formatDateRange(calendar.start_date, calendar.end_date),
    calendar.registration_start || calendar.registration_end
      ? `Registration: ${formatDateRange(calendar.registration_start, calendar.registration_end)}`
      : null,
    calendar.teaching_start || calendar.teaching_end
      ? `Teaching: ${formatDateRange(calendar.teaching_start, calendar.teaching_end)}`
      : null,
    calendar.exam_start || calendar.exam_end
      ? `Examinations: ${formatDateRange(calendar.exam_start, calendar.exam_end)}`
      : null,
    calendar.results_release
      ? `Results release: ${formatDate(calendar.results_release)}`
      : null,
  ].filter(Boolean);

  return {
    href: `/academics/calendar?academic_year=${encodeURIComponent(calendar.academic_year)}&semester=${calendar.semester}`,
    title: `${calendar.academic_year} · Semester ${calendar.semester}`,
    body: dates.join(". "),
    icon: "calendar",
    eyebrow:
      calendar.status === "current" ? "Current semester" : "Published calendar",
    metadata: {
      id: calendar.id,
      academicYear: calendar.academic_year,
      semester: String(calendar.semester),
      status: calendar.status,
      startDate: calendar.start_date,
      endDate: calendar.end_date,
      registrationStart: calendar.registration_start,
      registrationEnd: calendar.registration_end,
      lateRegistrationEnd: calendar.late_registration_end,
      teachingStart: calendar.teaching_start,
      teachingEnd: calendar.teaching_end,
      examStart: calendar.exam_start,
      examEnd: calendar.exam_end,
      resultsRelease: calendar.results_release,
    },
  };
}

async function safeList<T>(request: Promise<ListEnvelope<T>>): Promise<T[]> {
  try {
    const response = await request;
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Failed to fetch public records:", error);
    return [];
  }
}

async function safePaginatedList<T>(request: Promise<ListEnvelope<T>>) {
  try {
    const response = await request;
    return {
      data: Array.isArray(response.data) ? response.data : [],
      meta: response.meta,
    };
  } catch (error) {
    console.error("Failed to fetch paginated public records:", error);
    return { data: [] as T[], meta: undefined };
  }
}

async function safeRecord<T>(
  request: Promise<RecordEnvelope<T>>,
): Promise<T | null> {
  try {
    const response = await request;
    return response.data ?? null;
  } catch (error) {
    console.error("Failed to fetch public record:", error);
    return null;
  }
}

function emptyPublishedCard(
  label: string,
  href: string,
  sourceLabel: string,
): PublicCard {
  return externalCard(
    `${titleFromSlug(label)} information`,
    href,
    `Open ${sourceLabel} for current ${label} information and related public guidance.`,
    "file",
    `Open ${sourceLabel}`,
  );
}

function newsCard(item: News): PublicCard {
  return pageCard(
    item.title,
    `/media/news/${item.slug}`,
    shortText(
      item.summary ?? item.plain_text ?? item.rich_text ?? item.content,
      "University news item.",
    ),
    "news",
    item.published_at ? formatDate(item.published_at) : "Read article",
  );
}

function blogCard(item: Blog): PublicCard {
  return pageCard(
    item.title,
    `/media/articles/${item.slug}`,
    shortText(
      item.summary ??
        item.excerpt ??
        item.plain_text ??
        item.rich_text ??
        item.content,
      "University blog post.",
    ),
    "file",
    item.published_at ? formatDate(item.published_at) : "Read post",
  );
}

function eventCard(item: Event): PublicCard {
  const date = formatDate(item.start_date);
  const location =
    item.venue ||
    item.location ||
    (item.is_virtual ? "Virtual event" : "Venue to be confirmed");
  return pageCard(
    item.title,
    `/media/events/${item.slug}`,
    shortText(
      item.summary ?? item.plain_text ?? item.rich_text ?? item.content,
      `${date}. ${location}.`,
    ),
    "calendar",
    date,
  );
}

function announcementCard(item: Announcement): PublicCard {
  return pageCard(
    item.title,
    `/media/announcements/${item.slug}`,
    shortText(
      item.summary ?? item.plain_text ?? item.rich_text ?? item.content,
      `${item.priority || "Notice"} for ${item.audience || "public audiences"}.`,
      150,
    ),
    "megaphone",
    item.published_at
      ? formatDate(item.published_at)
      : item.priority || "Open notice",
  );
}

function schoolCard(item: School): PublicCard {
  return {
    ...pageCard(
      item.name,
      `/academics/schools/${item.slug}`,
      shortText(
        item.about ?? item.description ?? item.mandate,
        "Explore this school’s teaching, departments and academic programmes.",
        230,
      ),
      "building",
      "Explore school",
    ),
    image: publicFileUrl(item.cover_image_id),
    metadata: {
      code: item.code,
      type: formatPublicLabel(item.school_type),
      dean: item.dean_name,
      location: item.office_location,
      email: item.email,
      departments: item.departments_count
        ? `${item.departments_count} department${item.departments_count === 1 ? "" : "s"}`
        : null,
    },
  };
}

function programmeCard(item: Programme): PublicCard {
  const department = item.department_name ?? item.department?.name;
  const facts = [
    formatPublicLabel(item.level),
    item.duration,
    formatPublicLabel(item.mode_of_study),
    department,
  ]
    .filter(Boolean)
    .join(" · ");
  const requirementContext = shortText(
    item.entry_requirements,
    "Open the programme record to review requirements, learning focus, intakes, and application guidance.",
    150,
  );

  return {
    ...pageCard(
      item.name,
      `/academics/programmes/${item.slug}`,
      [facts, requirementContext].filter(Boolean).join(". "),
      "book",
      "View programme",
    ),
    image: publicFileUrl(item.cover_image_id),
    metadata: {
      code: item.code,
      level: formatPublicLabel(item.level),
      duration: item.duration,
      mode: formatPublicLabel(item.mode_of_study),
      department,
      intakeMonths: item.intake_months ?? undefined,
      accreditation: item.accreditation_status
        ? [formatPublicLabel(item.accreditation_status), item.accrediting_body]
            .filter(Boolean)
            .join(" · ")
        : null,
      overview: shortText(
        item.about ?? item.objectives ?? item.curriculum_overview,
        requirementContext,
        220,
      ),
    },
  };
}

function academicDepartmentCard(item: Department): PublicCard {
  const schoolName = item.school_name ?? item.school?.name ?? "Academic school";
  return {
    ...pageCard(
      item.name,
      `/academics/departments/${item.slug}`,
      shortText(
        item.about ?? item.mandate,
        "Explore this department’s teaching, academic programmes and areas of expertise.",
        220,
      ),
      "building",
      "View department",
    ),
    image: publicFileUrl(item.cover_image_id),
    metadata: {
      code: item.code,
      school: schoolName,
      schoolId: item.school_id,
      head: item.hod_name ?? item.head?.full_name,
      email: item.email,
      location: item.office_location,
      programmes: item.programmes_count
        ? `${item.programmes_count} programme${item.programmes_count === 1 ? "" : "s"}`
        : null,
    },
  };
}

function schoolOptions(schools: School[]) {
  return [
    { value: "", label: "All schools" },
    ...schools.map((school) => ({ value: school.id, label: school.name })),
  ];
}

function sortProgrammes(programmes: Programme[], sort?: string) {
  const collator = new Intl.Collator("en", {
    sensitivity: "base",
    numeric: true,
  });
  const records = programmes.slice();

  if (sort === "name") {
    return records.sort((first, second) =>
      collator.compare(first.name, second.name),
    );
  }

  if (sort === "level") {
    return records.sort(
      (first, second) =>
        collator.compare(first.level ?? "", second.level ?? "") ||
        collator.compare(first.name, second.name),
    );
  }

  if (sort === "duration") {
    return records.sort(
      (first, second) =>
        collator.compare(first.duration ?? "", second.duration ?? "") ||
        collator.compare(first.name, second.name),
    );
  }

  return records;
}

function departmentCard(
  item: Department,
  base = "/administration/units",
): PublicCard {
  return pageCard(
    item.name,
    `${base}/${item.slug}`,
    shortText(
      item.about ?? item.mandate ?? item.service_charter,
      "Department record.",
    ),
    "building",
    item.programmes_count
      ? `${item.programmes_count} programmes`
      : "View record",
  );
}

function divisionCard(item: Division): PublicCard {
  return pageCard(
    item.name,
    `/administration/divisions/${item.slug}`,
    shortText(
      item.description ?? item.head_message ?? item.mission,
      "University division record.",
    ),
    "landmark",
    item.code || "View division",
  );
}

function wingCard(item: Wing): PublicCard {
  const slug =
    item.slug === "information-communication-and-technology"
      ? "information-communication-and-technology-ict"
      : item.slug;

  return pageCard(
    item.name,
    `/administration/units/${slug}`,
    shortText(
      item.description ?? item.mandate ?? item.service_charter,
      "Administrative unit record.",
    ),
    "compass",
    item.code || "View unit",
  );
}

function isOvcRecord(item: {
  name?: string | null;
  code?: string | null;
  slug?: string | null;
}) {
  const text =
    `${item.code ?? ""} ${item.name ?? ""} ${item.slug ?? ""}`.toLowerCase();
  return (
    /\bovc\b/.test(text) ||
    text.includes("vice chancellor") ||
    text.includes("vice-chancellor")
  );
}

function sortOrganizationRecords<
  T extends {
    name?: string | null;
    code?: string | null;
    slug?: string | null;
    display_order?: number | null;
  },
>(records: T[]) {
  return records.slice().sort((first, second) => {
    const firstOvc = isOvcRecord(first);
    const secondOvc = isOvcRecord(second);
    if (firstOvc !== secondOvc) return firstOvc ? -1 : 1;

    return (
      Number(first.display_order ?? 100) -
        Number(second.display_order ?? 100) ||
      (first.name ?? "").localeCompare(second.name ?? "")
    );
  });
}

function clubCard(item: Club): PublicCard {
  return pageCard(
    item.name,
    `/campus-life/clubs/${item.slug}`,
    shortText(
      item.about ?? item.mission ?? item.objectives,
      "Student club or society record.",
    ),
    "sparkles",
    item.membership_count
      ? `${item.membership_count} members`
      : item.club_type || "View club",
  );
}

function accommodationCard(item: Accommodation): PublicCard {
  return pageCard(
    item.name,
    `/campus-life/accommodation/${item.slug}`,
    shortText(item.about ?? item.rules, "Accommodation record."),
    "home",
    item.capacity ? `${item.capacity} capacity` : item.gender || "View housing",
  );
}

function sportsCard(item: SportsFacility): PublicCard {
  return pageCard(
    item.name,
    `/campus-life/sports/${item.slug}`,
    shortText(
      item.about,
      item.sport_types?.length
        ? item.sport_types.join(", ")
        : "Sports facility record.",
    ),
    "trophy",
    item.location || item.facility_type || "View facility",
  );
}

function artsCard(item: ArtsCulture): PublicCard {
  return pageCard(
    item.title,
    `/campus-life/gallery/${item.slug}`,
    shortText(item.about, "Arts and culture record."),
    "file",
    item.category || "View record",
  );
}

function governanceCard(item: StudentGovernance): PublicCard {
  return pageCard(
    item.name,
    `/campus-life/student-life/${item.slug}`,
    shortText(
      item.about ?? item.mandate ?? item.constitution,
      "Student governance record.",
    ),
    "users",
    item.acronym || item.governance_type || "View body",
  );
}

function alumniCard(item: Alumni): PublicCard {
  const title = [item.current_position, item.current_employer]
    .filter(Boolean)
    .join(", ");
  return infoCard(
    title || `Class of ${item.graduation_year}`,
    shortText(
      item.bio ?? item.achievements,
      item.industry || "Published alumni profile.",
    ),
    "user",
    item.is_mentor_available
      ? "Mentor available"
      : `Class of ${item.graduation_year}`,
  );
}

function alumniAssociationCard(item: AlumniAssociation): PublicCard {
  return pageCard(
    item.name,
    `/alumni#${item.slug}`,
    shortText(
      item.about ?? item.mission ?? item.objectives,
      "Alumni association record.",
    ),
    "users",
    item.region || item.acronym || item.association_type || "View association",
  );
}

export async function getNewsPageConfig(
  segments: string[] = [],
): Promise<PublicPageConfig> {
  const base = getNewsPage(segments);
  const [area, slug] = segments;
  const isCategory = area === "category";

  if (area && !isCategory) {
    const [article, migratedBlog, latest] = await Promise.all([
      safeRecord(newsApi.getBySlug(area, { fields: editorialFields })),
      safeRecord(blogsApi.getBySlug(area, { fields: editorialFields })),
      safeList(
        newsApi.list({
          is_published: true,
          per_page: 6,
          fields: editorialFields,
        }),
      ),
    ]);

    if (!article && migratedBlog) {
      const latestBlogs = await safeList(
        blogsApi.list({
          is_published: true,
          per_page: 6,
          fields: editorialFields,
        }),
      );

      return {
        ...base,
        eyebrow: migratedBlog.category || "Migrated Blog",
        title: migratedBlog.title,
        body: shortText(
          migratedBlog.summary ??
            migratedBlog.excerpt ??
            migratedBlog.plain_text ??
            migratedBlog.rich_text ??
            migratedBlog.content,
          "University article.",
          360,
        ),
        sections: [
          {
            eyebrow: "Article Details",
            title: migratedBlog.title,
            body:
              bestContent(
                migratedBlog.rich_text,
                migratedBlog.content,
                migratedBlog.plain_text,
                migratedBlog.summary,
                migratedBlog.excerpt,
              ) || "Article record.",
            columns: 3,
            cards: [
              infoCard("Category", migratedBlog.category || "Article", "book"),
              infoCard(
                "Published",
                formatDate(
                  migratedBlog.published_at ?? migratedBlog.created_at,
                ),
                "calendar",
              ),
              infoCard("Source", "Migrated blog record", "shield"),
            ],
          },
          {
            eyebrow: "More Articles",
            title: "Latest blog records",
            body: "Legacy blog slugs are preserved through migrated blog records.",
            tone: "dark",
            columns: 3,
            cards: latestBlogs
              .filter((item) => item.slug !== migratedBlog.slug)
              .slice(0, 3)
              .map(blogCard),
          },
        ],
      };
    }

    if (!article) {
      return {
        ...base,
        title: `${titleFromSlug(area)} article not found`,
        body: "We could not find a news article for this address. Browse the latest university news below.",
        sections: [
          {
            eyebrow: "News",
            title: "Latest available records",
            body: "Recent records and related public information.",
            columns: 3,
            cards: latest.length
              ? latest.map(newsCard)
              : [
                  emptyPublishedCard(
                    "news",
                    officialSources.news,
                    "official news",
                  ),
                ],
          },
        ],
      };
    }

    return {
      ...base,
      eyebrow: article.category || "News Article",
      title: article.title,
      body: shortText(
        article.summary ??
          article.plain_text ??
          article.rich_text ??
          article.content,
        "University news article.",
        360,
      ),
      sections: [
        {
          eyebrow: "Article Details",
          title: article.title,
          body:
            bestContent(
              article.rich_text,
              article.content,
              article.plain_text,
              article.summary,
            ) || "Article record.",
          columns: 3,
          cards: [
            infoCard("Category", article.category || "Uncategorized", "book"),
            infoCard(
              "Published",
              formatDate(article.published_at ?? article.created_at),
              "calendar",
            ),
            infoCard(
              "Status",
              article.is_published ? "Published" : "Not published",
              "shield",
            ),
          ],
        },
        {
          eyebrow: "More News",
          title: "Latest public records",
          body: "Related communications remain separated from events and announcements.",
          tone: "dark",
          columns: 3,
          cards: latest
            .filter((item) => item.slug !== article.slug)
            .slice(0, 3)
            .map(newsCard),
        },
      ],
    };
  }

  const records = await safeList(
    newsApi.list({ is_published: true, per_page: 18, fields: editorialFields }),
  );
  const filtered =
    isCategory && slug
      ? records.filter(
          (item) =>
            (item.category ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-") ===
            slug,
        )
      : records;
  const categories = Array.from(
    new Set(records.map((item) => item.category).filter(Boolean)),
  ) as string[];

  return {
    ...base,
    title:
      isCategory && slug ? `${titleFromSlug(slug)} news` : "University news",
    body: filtered.length
      ? "News records."
      : "No matching news records are currently listed.",
    sections: [
      {
        eyebrow: "News",
        title:
          isCategory && slug
            ? `${titleFromSlug(slug)} records`
            : "Latest university communications",
        body: "Cards are generated from news records.",
        columns: 3,
        cards: filtered.length
          ? filtered.map(newsCard)
          : [emptyPublishedCard("news", officialSources.news, "official news")],
      },
      {
        eyebrow: "Categories",
        title: "Available news categories",
        body: "Categories are generated from currently public records.",
        tone: "dark",
        columns: 3,
        cards: categories.length
          ? categories.slice(0, 6).map((category) =>
              pageCard(
                category,
                `/media/news/category/${category
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")}`,
                `Open public records categorized as ${category}.`,
                "book",
                "Open category",
              ),
            )
          : communicationsNav,
      },
    ],
  };
}

export async function getBlogsPageConfig(
  segments: string[] = [],
): Promise<PublicPageConfig> {
  const base = {
    ...getNewsPage(segments),
    sectionLabel: "Articles",
    currentHref: `/blogs${segments.length ? `/${segments.join("/")}` : ""}`,
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "News", href: "/media/news" },
      { label: "Blogs" },
    ],
    eyebrow: "Articles",
    title: "University articles and blogs",
    body: "Articles, blog posts, and migrated public stories from Kisii University.",
    navItems: communicationsNav.filter((item) => item.href !== "/blogs"),
    relatedItems: communicationsNav,
    continueItems: communicationsNav,
  } satisfies PublicPageConfig;
  const [area, slug] = segments;
  const isCategory = area === "category";

  if (area && !isCategory) {
    const [article, latest] = await Promise.all([
      safeRecord(blogsApi.getBySlug(area, { fields: editorialFields })),
      safeList(
        blogsApi.list({
          is_published: true,
          per_page: 6,
          fields: editorialFields,
        }),
      ),
    ]);

    if (!article) {
      return {
        ...base,
        title: `${titleFromSlug(area)} article not found`,
        body: "We could not find an article for this address. Browse the latest articles below.",
        sections: [
          {
            eyebrow: "Articles",
            title: "Latest available records",
            body: "Recent article records and related public information.",
            columns: 3,
            cards: latest.length
              ? latest.map(blogCard)
              : [
                  emptyPublishedCard(
                    "articles",
                    officialSources.news,
                    "official news",
                  ),
                ],
          },
        ],
      };
    }

    return {
      ...base,
      eyebrow: article.category || "Article",
      title: article.title,
      body: shortText(
        article.summary ??
          article.excerpt ??
          article.plain_text ??
          article.rich_text ??
          article.content,
        "University article.",
        360,
      ),
      sections: [
        {
          eyebrow: "Article Details",
          title: article.title,
          body:
            bestContent(
              article.rich_text,
              article.content,
              article.plain_text,
              article.summary,
              article.excerpt,
            ) || "Article record.",
          columns: 3,
          cards: [
            infoCard("Category", article.category || "Article", "book"),
            infoCard(
              "Author",
              article.author_name || "Kisii University",
              "user",
            ),
            infoCard(
              "Published",
              formatDate(article.published_at ?? article.created_at),
              "calendar",
            ),
          ],
        },
        {
          eyebrow: "More Articles",
          title: "Latest article records",
          body: "Related migrated articles and public stories.",
          tone: "dark",
          columns: 3,
          cards: latest
            .filter((item) => item.slug !== article.slug)
            .slice(0, 3)
            .map(blogCard),
        },
      ],
    };
  }

  const records = await safeList(
    blogsApi.list({
      is_published: true,
      per_page: 18,
      fields: editorialFields,
    }),
  );
  const filtered =
    isCategory && slug
      ? records.filter(
          (item) =>
            (item.category ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-") ===
            slug,
        )
      : records;
  const categories = Array.from(
    new Set(records.map((item) => item.category).filter(Boolean)),
  ) as string[];

  return {
    ...base,
    title:
      isCategory && slug
        ? `${titleFromSlug(slug)} articles`
        : "University articles and blogs",
    body: filtered.length
      ? "Article records."
      : "No matching article records are currently listed.",
    sections: [
      {
        eyebrow: "Articles",
        title:
          isCategory && slug
            ? `${titleFromSlug(slug)} records`
            : "Latest articles and blog posts",
        body: "Cards are generated from blog records, including migrated legacy posts.",
        columns: 3,
        cards: filtered.length
          ? filtered.map(blogCard)
          : [
              emptyPublishedCard(
                "articles",
                officialSources.news,
                "official news",
              ),
            ],
      },
      {
        eyebrow: "Categories",
        title: "Available article categories",
        body: "Categories are generated from currently public records.",
        tone: "dark",
        columns: 3,
        cards: categories.length
          ? categories.slice(0, 6).map((category) =>
              pageCard(
                category,
                `/media/articles/category/${category
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/^-|-$/g, "")}`,
                `Open public article records categorized as ${category}.`,
                "book",
                "Open category",
              ),
            )
          : communicationsNav,
      },
    ],
  };
}

export async function getEventsPageConfig(
  segments: string[] = [],
): Promise<PublicPageConfig> {
  const base = getEventsPage(segments);
  const [slug] = segments;

  if (slug === "past") {
    const records = await safeList(
      eventsApi.list({
        is_published: true,
        upcoming: false,
        per_page: 18,
        fields: eventFields,
      }),
    );

    return {
      ...base,
      currentHref: "/events/past",
      eyebrow: "Past Events",
      title: "Past events",
      body: records.length
        ? "Past event records from the public events archive."
        : "No past event records are currently listed.",
      sections: [
        {
          eyebrow: "Past Events",
          title: "Event archive",
          body: "Cards are generated from published event records that are no longer upcoming.",
          columns: 3,
          cards: records.length
            ? records.map(eventCard)
            : [
                emptyPublishedCard(
                  "past events",
                  officialSources.conferences,
                  "conference portal",
                ),
              ],
        },
        {
          eyebrow: "Communication Links",
          title: "News, events, and notices",
          body: "Public communications remain separated by purpose.",
          tone: "dark",
          columns: 3,
          cards: communicationsNav,
        },
      ],
    };
  }

  if (slug) {
    const [event, upcoming] = await Promise.all([
      safeRecord(eventsApi.getBySlug(slug, { fields: eventFields })),
      safeList(
        eventsApi.list({
          is_published: true,
          upcoming: true,
          per_page: 6,
          fields: eventFields,
        }),
      ),
    ]);

    if (!event) {
      return {
        ...base,
        title: `${titleFromSlug(slug)} event not found`,
        body: "We could not find an event for this address. Browse upcoming events below.",
        sections: [
          {
            eyebrow: "Events",
            title: "Upcoming event records",
            body: "Recent records and related public information.",
            columns: 3,
            cards: upcoming.length
              ? upcoming.map(eventCard)
              : [
                  emptyPublishedCard(
                    "event",
                    officialSources.conferences,
                    "conference portal",
                  ),
                ],
          },
        ],
      };
    }

    return {
      ...base,
      title: event.title,
      body: shortText(
        event.summary ?? event.plain_text ?? event.rich_text ?? event.content,
        "University event.",
        360,
      ),
      sections: [
        {
          eyebrow: "Event Details",
          title: event.title,
          body:
            bestContent(
              event.rich_text,
              event.content,
              event.plain_text,
              event.summary,
            ) || "Event record.",
          columns: 3,
          cards: [
            infoCard(
              "Date",
              `${formatDate(event.start_date)}${event.end_date ? ` to ${formatDate(event.end_date)}` : ""}`,
              "calendar",
            ),
            infoCard(
              "Venue",
              event.venue ||
                event.location ||
                (event.is_virtual ? "Virtual" : "To be confirmed"),
              "landmark",
            ),
            infoCard(
              "Registration",
              event.registration_required
                ? "Registration required"
                : "No registration requirement published",
              "clipboard",
            ),
          ],
        },
        {
          eyebrow: "More Events",
          title: "Upcoming events",
          body: "Event cards are generated from event records.",
          tone: "dark",
          columns: 3,
          cards: upcoming
            .filter((item) => item.slug !== event.slug)
            .slice(0, 3)
            .map(eventCard),
        },
      ],
    };
  }

  const [upcoming, allEvents] = await Promise.all([
    safeList(
      eventsApi.list({
        is_published: true,
        upcoming: true,
        per_page: 9,
        fields: eventFields,
      }),
    ),
    safeList(
      eventsApi.list({ is_published: true, per_page: 9, fields: eventFields }),
    ),
  ]);
  const records = upcoming.length ? upcoming : allEvents;

  return {
    ...base,
    body: records.length
      ? "Event records."
      : "No event records are currently listed.",
    sections: [
      {
        eyebrow: "Events",
        title: upcoming.length ? "Upcoming events" : "Latest event records",
        body: "Dates, venues, and registration states come from event records.",
        columns: 3,
        cards: records.length
          ? records.map(eventCard)
          : [
              emptyPublishedCard(
                "event",
                officialSources.conferences,
                "conference portal",
              ),
            ],
      },
      {
        eyebrow: "Communication Links",
        title: "News, events, and notices",
        body: "Public communications remain separated by purpose.",
        tone: "dark",
        columns: 3,
        cards: communicationsNav,
      },
    ],
  };
}

export async function getAnnouncementsPageConfig(
  segments: string[] = [],
): Promise<PublicPageConfig> {
  const base = getAnnouncementsPage();
  const [slug] = segments;

  if (slug) {
    const [announcement, latest] = await Promise.all([
      safeRecord(
        announcementsApi.getBySlug(slug, { fields: announcementFields }),
      ),
      safeList(
        announcementsApi.list({
          is_published: true,
          per_page: 6,
          fields: announcementFields,
        }),
      ),
    ]);

    if (!announcement) {
      return {
        ...base,
        currentHref: `/media/announcements/${slug}`,
        title: `${titleFromSlug(slug)} announcement not found`,
        body: "No matching announcement was found.",
        sections: [
          {
            eyebrow: "Published Announcements",
            title: "Latest notices",
            body: "Records.",
            columns: 3,
            cards: latest.length
              ? latest.map(announcementCard)
              : [
                  emptyPublishedCard(
                    "announcement",
                    officialSources.news,
                    "official news",
                  ),
                ],
          },
        ],
      };
    }

    const detailCards = [
      infoCard(
        "Priority",
        announcement.priority || "Not specified",
        "megaphone",
      ),
      infoCard(
        "Audience",
        announcement.audience ||
          announcement.target_audience?.join(", ") ||
          "Public",
        "users",
      ),
      infoCard(
        "Published",
        formatDate(
          announcement.published_at ??
            announcement.valid_from ??
            announcement.created_at,
        ),
        "calendar",
      ),
      ...(announcement.valid_to
        ? [
            infoCard(
              "Valid until",
              formatDate(announcement.valid_to),
              "calendar",
            ),
          ]
        : []),
    ];
    const relatedAnnouncements = latest
      .filter((item) => item.slug !== announcement.slug)
      .slice(0, 3)
      .map(announcementCard);

    return {
      ...base,
      currentHref: `/media/announcements/${slug}`,
      eyebrow: announcement.category || "Announcement",
      title: announcement.title,
      body: shortText(
        announcement.summary ??
          announcement.plain_text ??
          announcement.rich_text ??
          announcement.content,
        "Announcement.",
        250,
      ),
      scopeTitle: "Announcement",
      scopeCards: detailCards.slice(0, 3),
      asideTitle: "Public notice",
      asideBody: "Official published announcement record.",
      relatedTitle: "Related notices",
      relatedItems: relatedAnnouncements,
      continueTitle: "More communications",
      continueBody: "Browse related news, events, and notices.",
      sections: [
        {
          eyebrow: "Notice",
          title: "Details",
          body:
            bestContent(
              announcement.rich_text,
              announcement.content,
              announcement.plain_text,
              announcement.summary,
            ) || "Announcement.",
          variant: "article",
          tone: "white",
          cards: detailCards,
        },
        ...(relatedAnnouncements.length
          ? [
              {
                eyebrow: "More Notices",
                title: "Latest announcements",
                body: "Other published notices.",
                tone: "dark" as const,
                columns: 3 as const,
                cards: relatedAnnouncements,
              },
            ]
          : []),
      ],
    };
  }

  const records = await safeList(
    announcementsApi.list({
      is_published: true,
      per_page: 12,
      fields: announcementFields,
    }),
  );

  return {
    ...base,
    body: records.length
      ? "Official notices."
      : "No published announcements were returned.",
    sections: [
      {
        eyebrow: "Published Announcements",
        title: "Public notices",
        body: "Priority, audience, and dates come from public records.",
        columns: 3,
        cards: records.length
          ? records.map(announcementCard)
          : [
              emptyPublishedCard(
                "announcement",
                officialSources.news,
                "official news",
              ),
            ],
      },
      {
        eyebrow: "Communication Links",
        title: "News, events, notices",
        body: "Each communication type keeps its own route.",
        tone: "dark",
        columns: 3,
        cards: communicationsNav,
      },
    ],
  };
}

export async function getSearchPageConfig(
  query?: string,
): Promise<PublicPageConfig> {
  const base = getSearchPage(query);
  const trimmed = query?.trim();
  const payload =
    trimmed && trimmed.length >= 2
      ? await safeRecord<SearchPayload>(
          searchApi.query({
            q: trimmed,
            limit_per_type: 6,
            ...searchFieldParams,
          }),
        )
      : null;
  const results = payload?.results;
  const resultCards = [
    ...(results?.news ?? []).map(newsCard),
    ...(results?.blogs ?? []).map(blogCard),
    ...(results?.events ?? []).map(eventCard),
    ...(results?.announcements ?? []).map(announcementCard),
    ...(results?.schools ?? []).map(schoolCard),
    ...(results?.departments ?? []).map((item) =>
      pageCard(
        item.name,
        item.department_type === "academic"
          ? `/academics/departments/${item.slug}`
          : `/administration/units/${item.slug}`,
        shortText(item.about ?? item.mandate, "Department record."),
        "building",
        item.department_type || "Open record",
      ),
    ),
    ...(results?.persons ?? []).map((item) =>
      infoCard(
        item.full_name || `${item.first_name} ${item.last_name}`,
        shortText(item.bio ?? item.specialization, "Person record."),
        "user",
        item.department_name,
      ),
    ),
  ];

  return {
    ...base,
    body: !trimmed
      ? "Enter a query from the public search field to return public records."
      : trimmed.length < 2
        ? "Search queries must include at least two characters."
        : resultCards.length
          ? `Showing public public search results for "${trimmed}".`
          : `No public records matched "${trimmed}".`,
    asideBody:
      "Search results come across news, blogs, events, announcements, people, schools, and departments.",
    sections: [
      {
        eyebrow: "Search Results",
        title: trimmed ? `Results for "${trimmed}"` : "Search public records",
        body: "Results are grouped.",
        columns: 3,
        cards: resultCards.length
          ? resultCards
          : [
              pageCard(
                "Admissions",
                "/admissions",
                "Admissions pathways and application guidance.",
                "graduation",
                "Open admissions",
              ),
              pageCard(
                "Programmes",
                "/academics/programmes",
                "Browse programme records.",
                "book",
                "Browse programmes",
              ),
              pageCard(
                "A-Z Index",
                "/az-index",
                "Browse public routes.",
                "search",
                "Open index",
              ),
            ],
      },
    ],
    continueItems: resultCards.length
      ? resultCards.slice(0, 9)
      : base.continueItems,
  };
}

export async function getAdministrationPageConfig(
  segments: string[] = [],
): Promise<PublicPageConfig> {
  const base = getAdministrationPage(segments);
  const [area, slug] = segments;

  if (area === "divisions" && slug) {
    const [divisions, units] = await Promise.all([
      safeList(
        divisionsApi.list({
          is_active: true,
          per_page: 20,
          fields: divisionFields,
        }),
      ),
      safeList(
        departmentsApi.list({
          department_type: "administrative",
          per_page: 20,
          fields: departmentFields,
        }),
      ),
    ]);
    const division = divisions.find((item) => item.slug === slug);

    return {
      ...base,
      title: division?.name ?? `${titleFromSlug(slug)} division`,
      body: division
        ? shortText(
            division.description ?? division.head_message ?? division.mission,
            "University division record.",
            360,
          )
        : "We could not find that division record.",
      sections: [
        {
          eyebrow: "Division Record",
          title: division?.name ?? "Division record not found",
          body:
            division?.description ??
            "Division details are shown when the public record exists.",
          columns: 3,
          cards: division
            ? [
                infoCard("Code", division.code, "file"),
                infoCard(
                  "Type",
                  division.division_type || "Division",
                  "landmark",
                ),
                infoCard(
                  "Status",
                  division.is_active ? "Active" : "Inactive",
                  "shield",
                ),
              ]
            : [
                emptyPublishedCard(
                  "division",
                  officialSources.administration,
                  "administrative division",
                ),
              ],
        },
        {
          eyebrow: "Administrative Units",
          title: "Units under public administration",
          body: "Administrative unit cards come from department records.",
          tone: "dark",
          columns: 4,
          cards: units.length
            ? units.map((item) => departmentCard(item))
            : [
                emptyPublishedCard(
                  "administrative unit",
                  officialSources.administration,
                  "administrative division",
                ),
              ],
        },
      ],
    };
  }

  const [divisions, units] = await Promise.all([
    safeList(
      divisionsApi.list({
        is_active: true,
        per_page: 20,
        fields: divisionFields,
      }),
    ),
    safeList(
      departmentsApi.list({
        department_type: "administrative",
        per_page: 40,
        fields: departmentFields,
      }),
    ),
  ]);
  const wings = (
    await Promise.all(
      divisions.map((division) =>
        safeList(
          wingsApi.listByDivision(division.id, {
            is_active: true,
            fields: wingFields,
          }),
        ),
      ),
    )
  ).flat();

  if (area === "directorates" && slug) {
    const wing = wings.find((item) => item.slug === slug);

    return {
      ...base,
      title: wing?.name ?? `${titleFromSlug(slug)} directorate`,
      body: wing
        ? shortText(
            wing.description ?? wing.mandate ?? wing.service_charter,
            "Administrative wing record.",
            360,
          )
        : "We could not find that directorate or wing record.",
      sections: [
        {
          eyebrow: "Directorate Record",
          title: wing?.name ?? "Directorate record not found",
          body: wing
            ? bestText(wing.description, wing.mandate, wing.service_charter)
            : "Directorate details are shown when the public record exists.",
          columns: 3,
          cards: wing
            ? [
                infoCard("Code", wing.code, "file"),
                infoCard("Type", wing.wing_type || "Wing", "compass"),
                infoCard(
                  "Office",
                  wing.office_location || "Not published",
                  "landmark",
                ),
                infoCard("Email", wing.email || "Not published", "handshake"),
                infoCard("Phone", wing.phone || "Not published", "handshake"),
                infoCard(
                  "Status",
                  wing.is_active ? "Active" : "Inactive",
                  "shield",
                ),
              ]
            : [
                emptyPublishedCard(
                  "directorate",
                  officialSources.administration,
                  "administrative division",
                ),
              ],
        },
      ],
    };
  }

  return {
    ...base,
    body: "Administration pages use published division, wing, and administrative department records.",
    sections:
      area === "organization"
        ? [
            {
              eyebrow: "Executive Offices",
              title: "Offices and administrative divisions",
              body: "The Office of the Vice Chancellor leads the public organization structure, followed by published administrative divisions.",
              columns: 3,
              cards: divisions.length
                ? sortOrganizationRecords(divisions).map(divisionCard)
                : [
                    emptyPublishedCard(
                      "division",
                      officialSources.administration,
                      "administrative division",
                    ),
                  ],
            },
            {
              eyebrow: "Directorates",
              title: "Directorates and specialized offices",
              body: "Directorates and wings are arranged from published organization records.",
              columns: 3,
              cards: wings.length
                ? sortOrganizationRecords(wings).map(wingCard)
                : [
                    emptyPublishedCard(
                      "directorate",
                      officialSources.administration,
                      "administrative division",
                    ),
                  ],
            },
            {
              eyebrow: "Operational Units",
              title: "Administrative unit records",
              body: "Unit records come from administrative departments.",
              columns: 4,
              cards: units.length
                ? sortOrganizationRecords(units).map((item) =>
                    departmentCard(item),
                  )
                : [
                    emptyPublishedCard(
                      "administrative unit",
                      officialSources.administration,
                      "administrative division",
                    ),
                  ],
            },
          ]
        : area === "directorates"
          ? [
              {
                eyebrow: "Wings and Directorates",
                title: "Published administrative wings",
                body: "Directorate and wing cards are generated from organization records.",
                columns: 3,
                cards: wings.length
                  ? wings.map(wingCard)
                  : [
                      emptyPublishedCard(
                        "directorate",
                        officialSources.administration,
                        "administrative division",
                      ),
                    ],
              },
            ]
          : area === "units"
            ? [
                {
                  eyebrow: "Administrative Units",
                  title: "Administrative department records",
                  body: "Unit cards come from administrative department records.",
                  columns: 4,
                  cards: units.length
                    ? units.map((item) => departmentCard(item))
                    : [
                        emptyPublishedCard(
                          "administrative unit",
                          officialSources.administration,
                          "administrative division",
                        ),
                      ],
                },
              ]
            : [
                {
                  eyebrow: "Administrative Divisions",
                  title: "Published divisions",
                  body: "Division cards come from organization records.",
                  columns: 3,
                  cards: divisions.length
                    ? divisions.map(divisionCard)
                    : [
                        emptyPublishedCard(
                          "division",
                          officialSources.administration,
                          "administrative division",
                        ),
                      ],
                },
                {
                  eyebrow: "Administrative Units",
                  title: "Unit records",
                  body: "Administrative units come from department records.",
                  tone: "dark",
                  columns: 4,
                  cards: units.length
                    ? units.slice(0, 12).map((item) => departmentCard(item))
                    : [
                        emptyPublishedCard(
                          "administrative unit",
                          officialSources.administration,
                          "administrative division",
                        ),
                      ],
                },
              ],
    hideContinue: area === "organization",
  };
}

export async function getAcademicsPageConfig(
  segments: string[] = [],
  searchParams: {
    level?: string;
    mode_of_study?: string;
    q?: string;
    school_id?: string;
    sort?: string;
    page?: number;
    academic_year?: string;
    semester?: string;
  } = {},
): Promise<PublicPageConfig> {
  const base = { ...getAcademicsPage(segments), hideContinue: true };
  const [area, slug] = segments;
  const query = searchParams.q?.trim() || undefined;
  const level = searchParams.level?.trim() || undefined;
  const mode = searchParams.mode_of_study?.trim() || undefined;
  const schoolId = searchParams.school_id?.trim() || undefined;
  const sort = searchParams.sort?.trim() || undefined;
  const page = Math.max(1, searchParams.page ?? 1);
  const selectedAcademicYear = searchParams.academic_year?.trim() || undefined;
  const selectedSemester = searchParams.semester?.trim() || undefined;

  if (area === "programmes" && slug) {
    const programme = await safeRecord(
      programmesApi.getBySlug(slug, { fields: programmeFields }),
    );

    return {
      ...base,
      title: programme?.name ?? `${titleFromSlug(slug)} programme`,
      body: programme
        ? shortText(
            programme.about ??
              programme.objectives ??
              programme.entry_requirements,
            "Programme record.",
            360,
          )
        : "We could not find that programme record.",
      sections: [
        {
          eyebrow: "Programme Record",
          title: programme?.name ?? "Programme record not found",
          body: programme
            ? bestText(
                programme.about,
                programme.objectives,
                programme.curriculum_overview,
                programme.entry_requirements,
              )
            : "Programme details are shown when the public record exists.",
          columns: 3,
          cards: programme
            ? [
                infoCard(
                  "Level",
                  programme.level || "Not specified",
                  "graduation",
                ),
                infoCard(
                  "Duration",
                  programme.duration || "Not specified",
                  "calendar",
                ),
                infoCard(
                  "Mode",
                  programme.mode_of_study || "Not specified",
                  "book",
                ),
                infoCard(
                  "Department",
                  programme.department_name || "Not specified",
                  "building",
                ),
                infoCard(
                  "Entry Requirements",
                  shortText(
                    programme.entry_requirements,
                    "No entry requirements published.",
                    160,
                  ),
                  "check",
                ),
                infoCard(
                  "Career Prospects",
                  shortText(
                    programme.career_prospects,
                    "No career prospects published.",
                    160,
                  ),
                  "sparkles",
                ),
              ]
            : [
                emptyPublishedCard(
                  "programme",
                  officialSources.schools,
                  "schools and departments",
                ),
              ],
        },
      ],
    };
  }

  const [
    schools,
    allSchools,
    programmesResponse,
    intakes,
    academicCalendars,
    calendarDocs,
    examDocs,
    academicDepartments,
  ] = await Promise.all([
    safeList(
      schoolsApi.list({ per_page: 24, search: query, fields: schoolFields }),
    ),
    safeList(schoolsApi.list({ per_page: 100, fields: "id,name" })),
    safePaginatedList(
      programmesApi.list({
        per_page: area === "programmes" ? 12 : 100,
        page: area === "programmes" ? page : undefined,
        level,
        q: query,
        school_id: schoolId,
        mode_of_study: mode,
        fields: programmeFields,
      }),
    ),
    safeList(intakesApi.list({ per_page: 8, fields: intakeFields })),
    safeList(
      academicCalendarsApi.list({
        per_page: 20,
        fields: academicCalendarFields,
      }),
    ),
    safeList(
      documentsApi.list({
        category: "academic-calendar",
        per_page: 6,
        fields: documentFields,
      }),
    ),
    safeList(
      documentsApi.list({
        category: "examinations",
        per_page: 6,
        fields: documentFields,
      }),
    ),
    safeList(
      departmentsApi.list({
        per_page: 100,
        department_type: "academic",
        school_id: schoolId,
        search: query,
        fields: departmentFields,
      }),
    ),
  ]);
  const programmes = sortProgrammes(programmesResponse.data, sort);
  const activeFilters = [
    level ? formatPublicLabel(level) : null,
    mode ? formatPublicLabel(mode) : null,
    schoolId
      ? (allSchools.find((school) => school.id === schoolId)?.name ??
        "Selected school")
      : null,
    query,
  ].filter(Boolean);

  if (area === "schools") {
    return {
      ...base,
      body: schools.length
        ? "Academic schools."
        : "No school records are currently listed.",
      sections: [
        {
          eyebrow: "Academic Schools",
          title: "School records",
          body: "Browse schools, departments, and academic pathways. Use search to narrow the grid.",
          columns: 4,
          filters: {
            action: "/academics/schools",
            query,
            queryPlaceholder: "Search schools",
            submitLabel: "Search",
            clearHref: "/academics/schools",
          },
          cards: schools.length
            ? schools.map(schoolCard)
            : [
                emptyPublishedCard(
                  "school",
                  officialSources.schools,
                  "schools and departments",
                ),
              ],
        },
      ],
    };
  }

  if (area === "programmes") {
    const filterLabel = activeFilters.join(" · ");
    return {
      ...base,
      title: filterLabel
        ? `${titleFromSlug(filterLabel)} programmes`
        : base.title,
      body: programmes.length
        ? "Search, filter, and compare backend-backed academic programme records."
        : "No programmes match the current filters.",
      sections: [
        {
          eyebrow: "Programme Finder",
          title: filterLabel
            ? `Programmes matching ${filterLabel}`
            : "Programmes",
          body: "Programme cards show level, duration, study mode, department, and requirement context. Search by name, filter by level, school, or study mode, then open the programme record for application guidance.",
          columns: 3,
          pagination: {
            page: programmesResponse.meta?.page ?? page,
            perPage: programmesResponse.meta?.per_page ?? 12,
            total: programmesResponse.meta?.total ?? programmes.length,
            pages:
              programmesResponse.meta?.pages ??
              programmesResponse.meta?.total_pages ??
              1,
          },
          filters: {
            action: "/academics/programmes",
            query,
            queryPlaceholder: "Search programmes",
            level,
            levelOptions: programmeLevelOptions,
            schoolId,
            schoolOptions: schoolOptions(allSchools),
            mode,
            modeOptions: programmeModeOptions,
            sort,
            sortOptions: programmeSortOptions,
            submitLabel: "Filter",
            clearHref: "/academics/programmes",
          },
          cards: programmes.map(programmeCard),
        },
      ],
      relatedTitle: "Admissions",
      relatedItems: intakes
        .slice(0, 1)
        .map((intake) =>
          pageCard(
            intake.name,
            `/admissions/intakes/${intake.slug}`,
            `Applications: ${formatDate(intake.application_start)} to ${formatDate(intake.application_end)}.`,
            "calendar",
            intake.is_open ? "Open intake" : "View intake",
          ),
        ),
    };
  }

  if (area === "departments") {
    return {
      ...base,
      title: "Academic departments",
      body: academicDepartments.length
        ? "Browse academic departments by school, discipline and published expertise."
        : "No academic departments match the current filters.",
      sections: [
        {
          eyebrow: "Academic Departments",
          title: "Department directory",
          body: "Departments are grouped by their academic school. Search by name or discipline, or choose a school to narrow the directory.",
          columns: 3,
          filters: {
            action: "/academics/departments",
            query,
            queryPlaceholder: "Search departments",
            schoolId,
            schoolOptions: schoolOptions(allSchools),
            submitLabel: "Filter",
            clearHref: "/academics/departments",
          },
          cards: academicDepartments.length
            ? academicDepartments.map(academicDepartmentCard)
            : [],
        },
      ],
    };
  }

  if (area === "calendar") {
    const structuredCalendarCards = academicCalendars
      .slice()
      .sort(
        (first, second) =>
          new Date(first.start_date).getTime() -
          new Date(second.start_date).getTime(),
      )
      .map(academicCalendarCard);
    const intakeCards = intakes.map((item: Intake) =>
      pageCard(
        item.name,
        `/admissions/intakes/${item.slug}`,
        `Applications: ${formatDate(item.application_start)} to ${formatDate(item.application_end)}.`,
        "calendar",
        item.is_open ? "Open intake" : "View intake",
      ),
    );
    const documentCards = calendarDocs.map((item: Document) =>
      pageCard(
        item.title,
        `/downloads/${item.slug}`,
        shortText(item.description, "Academic calendar document."),
        "file",
        "Open document",
      ),
    );
    const selectedCalendar =
      academicCalendars.find(
        (item) =>
          (!selectedAcademicYear ||
            item.academic_year === selectedAcademicYear) &&
          (!selectedSemester || String(item.semester) === selectedSemester),
      ) ??
      academicCalendars.find((item) => item.status === "current") ??
      academicCalendars[0];
    const composition = selectedCalendar
      ? await safeRecord(
          mainApi.get<
            RecordEnvelope<{
              calendar?: Record<string, unknown>;
              events?: Array<Record<string, unknown>>;
              documents?: Array<Record<string, unknown>>;
            }>
          >("/api/v1/academic-calendars/composition/current", {
            academic_year: selectedCalendar.academic_year,
            semester: selectedCalendar.semester,
          }),
        )
      : null;

    return {
      ...base,
      body: "Calendar-facing content is generated from intake and academic calendar document records.",
      sections: [
        {
          eyebrow: "Academic Calendar",
          title: "Published semester dates",
          body: "Registration, teaching, examination, and results periods come from published academic calendar records. Intake windows and official documents provide related guidance.",
          columns: 3,
          cards: [
            ...structuredCalendarCards,
            ...intakeCards.map((card) => ({
              ...card,
              eyebrow: "Intake window",
            })),
            ...documentCards.map((card) => ({
              ...card,
              eyebrow: "Official document",
            })),
          ].length
            ? [
                ...structuredCalendarCards,
                ...intakeCards.map((card) => ({
                  ...card,
                  eyebrow: "Intake window",
                })),
                ...documentCards.map((card) => ({
                  ...card,
                  eyebrow: "Official document",
                })),
              ]
            : [
                emptyPublishedCard(
                  "calendar",
                  officialSources.schools,
                  "schools and departments",
                ),
              ],
        },
      ],
      relatedTitle: "Calendar composition",
      relatedItems: [],
      scopeCards: selectedCalendar
        ? [
            {
              ...academicCalendarCard(selectedCalendar),
              metadata: {
                ...academicCalendarCard(selectedCalendar).metadata,
                normalizedEvents: JSON.stringify(composition?.events ?? []),
                relatedDocuments: JSON.stringify(composition?.documents ?? []),
              },
            },
          ]
        : [],
    };
  }

  if (area === "examinations") {
    const currentCalendar =
      academicCalendars.find((item) => item.status === "current") ??
      academicCalendars[0];
    const publishedTimetables = await safeList<Record<string, unknown>>(
      mainApi.get<ListEnvelope<Record<string, unknown>>>(
        "/api/v1/timetables",
        currentCalendar
          ? { calendar_id: currentCalendar.id, timetable_type: "examination" }
          : { timetable_type: "examination" },
      ),
    );
    return {
      ...base,
      body: "Examination information brings together timetable, notice, and document links.",
      sections: [
        {
          eyebrow: "Examination Records",
          title: "Examination documents",
          body: "Timetables, notices, and examination documents for students and staff.",
          columns: 3,
          cards: examDocs.length
            ? examDocs.map((item) => ({
                ...pageCard(
                  item.title,
                  `/downloads/${item.slug}`,
                  shortText(item.description, "Examination document."),
                  "clipboard",
                  "Open document",
                ),
                metadata: {
                  type:
                    formatPublicLabel(item.document_type) ?? "Official notice",
                  version: item.version,
                },
              }))
            : [
                emptyPublishedCard(
                  "examination",
                  officialSources.schools,
                  "schools and departments",
                ),
              ],
        },
      ],
      scopeCards: [
        {
          title: currentCalendar
            ? `${currentCalendar.academic_year} · Semester ${currentCalendar.semester}`
            : "Current examination period",
          body:
            currentCalendar?.exam_start || currentCalendar?.exam_end
              ? (formatDateRange(
                  currentCalendar.exam_start,
                  currentCalendar.exam_end,
                ) ?? "")
              : "Examination dates will appear when published.",
          metadata: {
            academicYear: currentCalendar?.academic_year,
            semester: currentCalendar ? String(currentCalendar.semester) : null,
            examStart: currentCalendar?.exam_start,
            examEnd: currentCalendar?.exam_end,
            timetableData: JSON.stringify(publishedTimetables),
          },
        },
      ],
    };
  }

  return {
    ...base,
    sections: [
      {
        eyebrow: "Academic Schools",
        title: "School records",
        body: "School cards are generated from current public academic records. Use search to narrow the grid.",
        columns: 4,
        filters: {
          action: "/academics/schools",
          query,
          queryPlaceholder: "Search schools",
          submitLabel: "Search",
          clearHref: "/academics",
        },
        cards: schools.length
          ? schools.slice(0, 8).map(schoolCard)
          : [
              emptyPublishedCard(
                "school",
                officialSources.schools,
                "schools and departments",
              ),
            ],
      },
      {
        eyebrow: "Programme Finder",
        title: "Programme records",
        body: "Programme cards are generated from current public academic records. Search by name or filter by level, school, and study mode.",
        tone: "dark",
        columns: 3,
        filters: {
          action: "/academics",
          query,
          queryPlaceholder: "Search programmes",
          level,
          levelOptions: programmeLevelOptions,
          schoolId,
          schoolOptions: schoolOptions(allSchools),
          mode,
          modeOptions: programmeModeOptions,
          sort,
          sortOptions: programmeSortOptions,
          submitLabel: "Filter",
          clearHref: "/academics",
        },
        cards: programmes.length
          ? programmes.slice(0, 6).map(programmeCard)
          : [
              emptyPublishedCard(
                "programme",
                officialSources.schools,
                "schools and departments",
              ),
            ],
      },
    ],
  };
}

export async function getCampusLifePageConfig(
  segments: string[] = [],
): Promise<PublicPageConfig> {
  const base = getCampusLifePage(segments);
  const [area, slug] = segments;

  if (area === "clubs" && slug) {
    const club = await safeRecord(
      clubsApi.getBySlug(slug, { fields: clubFields }),
    );
    return {
      ...base,
      title: club?.name ?? `${titleFromSlug(slug)} club`,
      body: club
        ? shortText(
            club.about ?? club.mission ?? club.objectives,
            "Club record.",
            360,
          )
        : "We could not find that club record.",
      sections: [
        {
          eyebrow: "Club Record",
          title: club?.name ?? "Club record not found",
          body: club
            ? bestText(club.about, club.mission, club.objectives)
            : "Club details are shown when the public record exists.",
          columns: 3,
          cards: club
            ? [
                infoCard("Type", club.club_type || "Club", "sparkles"),
                infoCard(
                  "Membership",
                  club.membership_count
                    ? `${club.membership_count} members`
                    : "Not published",
                  "users",
                ),
                infoCard(
                  "Meeting Schedule",
                  club.meeting_schedule || "Not published",
                  "calendar",
                ),
              ]
            : [
                emptyPublishedCard(
                  "club",
                  officialSources.campusLife,
                  "campus life",
                ),
              ],
        },
      ],
    };
  }

  if (area === "sports" && slug) {
    const facility = await safeRecord(
      sportsFacilitiesApi.getBySlug(slug, { fields: sportsFields }),
    );
    return {
      ...base,
      title: facility?.name ?? `${titleFromSlug(slug)} sport and recreation`,
      body: facility
        ? shortText(facility.about, "Sports facility record.", 360)
        : "We could not find that sports facility record.",
      sections: [
        {
          eyebrow: "Sports Facility",
          title: facility?.name ?? "Sports facility not found",
          body:
            facility?.about ||
            "Sports facility details are shown when the public record exists.",
          columns: 3,
          cards: facility
            ? [
                infoCard(
                  "Facility Type",
                  facility.facility_type || "Not specified",
                  "trophy",
                ),
                infoCard(
                  "Sports",
                  facility.sport_types?.join(", ") || "Not specified",
                  "users",
                ),
                infoCard(
                  "Location",
                  facility.location || "Not published",
                  "landmark",
                ),
              ]
            : [
                emptyPublishedCard(
                  "sports facility",
                  officialSources.campusLife,
                  "campus life",
                ),
              ],
        },
      ],
    };
  }

  if (area === "accommodation" && slug) {
    const housing = await safeRecord(
      accommodationsApi.getBySlug(slug, { fields: accommodationFields }),
    );
    return {
      ...base,
      title: housing?.name ?? `${titleFromSlug(slug)} accommodation`,
      body: housing
        ? shortText(
            housing.about ?? housing.rules,
            "Accommodation record.",
            360,
          )
        : "We could not find that accommodation record.",
      sections: [
        {
          eyebrow: "Accommodation Record",
          title: housing?.name ?? "Accommodation record not found",
          body: housing
            ? bestText(housing.about, housing.rules)
            : "Accommodation details are shown when the public record exists.",
          columns: 3,
          cards: housing
            ? [
                infoCard(
                  "Type",
                  housing.accommodation_type || "Not specified",
                  "home",
                ),
                infoCard("Gender", housing.gender || "Not specified", "users"),
                infoCard(
                  "Capacity",
                  housing.capacity ? `${housing.capacity}` : "Not published",
                  "building",
                ),
                infoCard(
                  "Applications",
                  housing.is_accepting_applications
                    ? "Accepting applications"
                    : "Not accepting applications",
                  "clipboard",
                ),
                infoCard(
                  "Amenities",
                  housing.amenities?.join(", ") || "Not published",
                  "sparkles",
                ),
                infoCard(
                  "Contact",
                  [housing.email, housing.phone].filter(Boolean).join(" · ") ||
                    "Not published",
                  "handshake",
                ),
              ]
            : [
                emptyPublishedCard(
                  "accommodation",
                  officialSources.campusLife,
                  "campus life",
                ),
              ],
        },
      ],
    };
  }

  if (area === "gallery" && slug) {
    const item = await safeRecord(
      artsCultureApi.getBySlug(slug, { fields: artsFields }),
    );
    return {
      ...base,
      title: item?.title ?? `${titleFromSlug(slug)} gallery record`,
      body: item
        ? shortText(item.about, "Arts and culture record.", 360)
        : "We could not find that arts and culture record.",
      sections: [
        {
          eyebrow: "Arts and Culture",
          title: item?.title ?? "Gallery record not found",
          body:
            item?.about ||
            "Gallery details are shown when the public record exists.",
          columns: 3,
          cards: item
            ? [
                infoCard("Category", item.category || "Not specified", "file"),
                infoCard(
                  "Status",
                  item.is_active ? "Active" : "Inactive",
                  "shield",
                ),
                infoCard("Source", "Arts and culture", "check"),
              ]
            : [
                emptyPublishedCard(
                  "gallery",
                  officialSources.campusLife,
                  "campus life",
                ),
              ],
        },
      ],
    };
  }

  if (area === "student-life" && slug) {
    const body = await safeRecord(
      studentGovernanceApi.getBySlug(slug, { fields: governanceFields }),
    );
    return {
      ...base,
      title: body?.name ?? `${titleFromSlug(slug)} student body`,
      body: body
        ? shortText(
            body.about ?? body.mandate ?? body.constitution,
            "Student governance record.",
            360,
          )
        : "We could not find that student governance record.",
      sections: [
        {
          eyebrow: "Student Governance",
          title: body?.name ?? "Student governance record not found",
          body: body
            ? bestText(body.about, body.mandate, body.constitution)
            : "Student governance details are shown when the public record exists.",
          columns: 3,
          cards: body
            ? [
                infoCard("Acronym", body.acronym || "Not published", "file"),
                infoCard(
                  "Type",
                  body.governance_type || "Not specified",
                  "users",
                ),
                infoCard(
                  "Term",
                  [formatDate(body.term_start), formatDate(body.term_end)]
                    .filter((value) => value !== "Not dated")
                    .join(" to ") || "Not published",
                  "calendar",
                ),
                infoCard(
                  "Office",
                  body.office_location || "Not published",
                  "landmark",
                ),
                infoCard("Email", body.email || "Not published", "handshake"),
                infoCard("Phone", body.phone || "Not published", "handshake"),
              ]
            : [
                emptyPublishedCard(
                  "student governance",
                  officialSources.campusLife,
                  "campus life",
                ),
              ],
        },
      ],
    };
  }

  const [clubs, accommodations, sports, arts, governance, faqs, contacts] =
    await Promise.all([
      safeList(clubsApi.list({ per_page: 12, fields: clubFields })),
      safeList(
        accommodationsApi.list({ per_page: 8, fields: accommodationFields }),
      ),
      safeList(sportsFacilitiesApi.list({ per_page: 8, fields: sportsFields })),
      safeList(artsCultureApi.list({ per_page: 8, fields: artsFields })),
      safeList(
        studentGovernanceApi.list({ per_page: 6, fields: governanceFields }),
      ),
      safeList(
        faqsApi.list({
          scope_type: "student_life",
          per_page: 6,
          fields: faqFields,
        }),
      ),
      safeList(
        contactsApi.list({
          scope_type: "student_life",
          per_page: 6,
          fields: contactFields,
        }),
      ),
    ]);

  if (area === "clubs") {
    return {
      ...base,
      body: clubs.length
        ? "Clubs and societies."
        : "No club records are currently listed.",
      sections: [
        {
          eyebrow: "Clubs and Societies",
          title: "Club records",
          body: "Club cards are generated from student life records.",
          columns: 3,
          cards: clubs.length
            ? clubs.map(clubCard)
            : [
                emptyPublishedCard(
                  "club",
                  officialSources.campusLife,
                  "campus life",
                ),
              ],
        },
      ],
    };
  }

  if (area === "sports") {
    return {
      ...base,
      body: sports.length
        ? "Sports and recreation records."
        : "No sports facility records are currently listed.",
      sections: [
        {
          eyebrow: "Sports and Recreation",
          title: "Sports facilities",
          body: "Facility cards are generated from sports records.",
          columns: 3,
          cards: sports.length
            ? sports.map(sportsCard)
            : [
                emptyPublishedCard(
                  "sports",
                  officialSources.campusLife,
                  "campus life",
                ),
              ],
        },
      ],
    };
  }

  if (area === "accommodation") {
    return {
      ...base,
      body: accommodations.length
        ? "Accommodation records."
        : "No accommodation records are currently listed.",
      sections: [
        {
          eyebrow: "Accommodation",
          title: "Housing records",
          body: "Accommodation cards are generated from student housing records.",
          columns: 3,
          cards: accommodations.length
            ? accommodations.map(accommodationCard)
            : [
                emptyPublishedCard(
                  "accommodation",
                  officialSources.campusLife,
                  "campus life",
                ),
              ],
        },
      ],
    };
  }

  if (area === "support") {
    const faqCards = faqs.map((item: FAQ) =>
      infoCard(
        item.question,
        shortText(
          item.answer_plain_text ?? item.answer_rich_text ?? item.answer,
          "Student support FAQ.",
        ),
        "handshake",
        item.category || "FAQ",
      ),
    );
    const contactCards = contacts.map((item: ContactDirectory) =>
      infoCard(
        item.name,
        [item.email, item.phone?.join(", "), item.building, item.room_number]
          .filter(Boolean)
          .join(" · ") || "Student support contact.",
        "user",
        item.contact_type || "Contact",
      ),
    );
    return {
      ...base,
      body: "Student support brings together FAQs, contacts, wellbeing guidance, and service pathways.",
      sections: [
        {
          eyebrow: "Student Support",
          title: "Support records",
          body: "FAQs and contacts help students find support services and next steps.",
          columns: 3,
          cards: [...faqCards, ...contactCards].length
            ? [...faqCards, ...contactCards]
            : [
                externalCard(
                  "Customer care centre",
                  "https://digital.kisiiuniversity.ac.ke",
                  "Use the official customer care centre for support requests, complaints, compliments, suggestions, and information requests.",
                  "handshake",
                  "Open customer care",
                ),
              ],
        },
      ],
    };
  }

  if (area === "student-life") {
    return {
      ...base,
      body: governance.length
        ? "Student governance and student life records."
        : "Student life records summarize representative bodies, activities, and support links.",
      sections: [
        {
          eyebrow: "Student Governance",
          title: "Student bodies",
          body: "Student governance cards come from student life records.",
          columns: 3,
          cards: governance.length
            ? governance.map(governanceCard)
            : [
                emptyPublishedCard(
                  "student governance",
                  officialSources.campusLife,
                  "campus life",
                ),
              ],
        },
      ],
    };
  }

  if (area === "gallery") {
    return {
      ...base,
      body: arts.length
        ? "Arts, culture, and gallery records."
        : "No gallery records are currently listed .",
      sections: [
        {
          eyebrow: "Gallery and Culture",
          title: "Arts and culture records",
          body: "Gallery cards are generated from arts and culture records.",
          columns: 3,
          cards: arts.length
            ? arts.map(artsCard)
            : [
                emptyPublishedCard(
                  "gallery",
                  officialSources.campusLife,
                  "campus life",
                ),
              ],
        },
      ],
    };
  }

  return {
    ...base,
    body: "Campus Life brings together student life, clubs, housing, sports, arts, governance, FAQs, and contact pathways.",
    sections: [
      {
        eyebrow: "Clubs and Societies",
        title: "Club records",
        body: "Club cards are generated from student life records.",
        columns: 3,
        cards: clubs.length
          ? clubs.slice(0, 6).map(clubCard)
          : [
              emptyPublishedCard(
                "club",
                officialSources.campusLife,
                "campus life",
              ),
            ],
      },
      {
        eyebrow: "Housing, Sports, and Student Bodies",
        title: "Student experience records",
        body: "Student services are grouped across housing, sports, governance, and support pathways.",
        tone: "dark",
        columns: 3,
        cards: [
          ...(accommodations.length
            ? accommodations.slice(0, 3).map(accommodationCard)
            : []),
          ...(sports.length ? sports.slice(0, 3).map(sportsCard) : []),
          ...(governance.length
            ? governance.slice(0, 3).map(governanceCard)
            : []),
        ].length
          ? [
              ...(accommodations.length
                ? accommodations.slice(0, 3).map(accommodationCard)
                : []),
              ...(sports.length ? sports.slice(0, 3).map(sportsCard) : []),
              ...(governance.length
                ? governance.slice(0, 3).map(governanceCard)
                : []),
            ]
          : [
              emptyPublishedCard(
                "campus life",
                officialSources.campusLife,
                "campus life",
              ),
            ],
      },
    ],
  };
}

export async function getAlumniPageConfig(): Promise<PublicPageConfig> {
  const base = getAlumniPage();
  const [profiles, associations, events] = await Promise.all([
    safeList(alumniApi.list({ per_page: 6, fields: alumniFields })),
    safeList(
      alumniAssociationsApi.list({
        per_page: 6,
        fields: alumniAssociationFields,
      }),
    ),
    safeList(
      eventsApi.list({ is_published: true, per_page: 6, fields: eventFields }),
    ),
  ]);

  return {
    ...base,
    body: "Alumni content now uses published alumni profiles, association records, and public event records .",
    asideBody:
      "Use this section to explore alumni associations, profiles, mentorship, and event links.",
    sections: [
      {
        eyebrow: "Alumni Associations",
        title: "Published alumni groups",
        body: "Association records highlight alumni groups and regional networks.",
        columns: 3,
        cards: associations.length
          ? associations.map(alumniAssociationCard)
          : [
              emptyPublishedCard(
                "alumni association",
                officialSources.news,
                "official news",
              ),
            ],
      },
      {
        eyebrow: "Alumni Profiles and Events",
        title: "Published alumni engagement",
        body: "Profiles and events highlight alumni engagement and university activities.",
        tone: "dark",
        columns: 3,
        cards: [
          ...profiles.map(alumniCard),
          ...events.slice(0, 3).map(eventCard),
        ].length
          ? [...profiles.map(alumniCard), ...events.slice(0, 3).map(eventCard)]
          : [
              emptyPublishedCard(
                "alumni",
                officialSources.news,
                "official news",
              ),
            ],
      },
    ],
  };
}
