import {
  accommodationsApi,
  artsCultureApi,
  clubsApi,
  contactsApi,
  faqsApi,
  sportsFacilitiesApi,
  storiesApi,
  studentGovernanceApi,
  testimonialsApi,
  mainApi,
  type Accommodation,
  type ArtsCulture,
  type Club,
  type ContactDirectory,
  type FAQ,
  type SportsFacility,
  type Story,
  type StudentGovernance,
  type Testimonial,
} from "@ksu/api-client";

type ListEnvelope<T> = { data?: T[] };
type RecordEnvelope<T> = { data?: T | null };
type CampusLifeFilters = {
  q?: string;
  type?: string;
  status?: string;
};
type QueryValue = string | number | boolean | undefined;
type QueryParams = Record<string, QueryValue>;

const clubListFields =
  "id,name,slug,club_type,about,mission,objectives,membership_count,meeting_schedule,membership_fee,email,phone,is_active,is_public,display_order";
const clubDetailFields =
  "id,name,slug,club_type,about,mission,objectives,membership_count,meeting_schedule,membership_fee,email,phone,is_active,is_public,display_order";
const accommodationFields =
  "id,name,slug,accommodation_type,gender,about,amenities,rules,total_rooms,capacity,fee_per_semester,fee_per_year,is_active,is_accepting_applications";
const sportsFields =
  "id,name,slug,facility_type,sport_types,about,location,email,phone,is_active";
const artsFields = "id,title,slug,category,about,is_active";
const governanceFields =
  "id,name,slug,acronym,governance_type,about,constitution,mandate,term_start,term_end,email,phone,office_location,is_active";
const faqFields =
  "id,question,answer,answer_plain_text,category,display_order,is_main,is_public,status";
const contactFields =
  "id,name,contact_type,email,phone,extension,physical_address,building,room_number,operating_hours,is_main,is_public,status";
const testimonialFields =
  "id,name,role,quote,testimonial_type,photo_id,is_featured,display_order";
const storyFields =
  "id,title,slug,summary,category,story_type,source_type,reading_minutes,published_at,featured_media_id";
/** The whole register, in one page. 71 records today; the cap allows growth. */
const ROSTER_PER_PAGE = 100;

export interface CampusLifePageData {
  clubs: Club[];
  accommodations: Accommodation[];
  sports: SportsFacility[];
  arts: ArtsCulture[];
  governance: StudentGovernance[];
  faqs: FAQ[];
  contacts: ContactDirectory[];
  testimonials: Testimonial[];
  detail?: {
    club?: Club | null;
    accommodation?: Accommodation | null;
    sport?: SportsFacility | null;
    art?: ArtsCulture | null;
    governance?: StudentGovernance | null;
    story?: Story | null;
  };
  totals?: {
    clubs?: number;
    accommodations?: number;
    sports?: number;
    arts?: number;
    governance?: number;
  };
  page?: number;
  editorial?: LifeAroundStudiesEditorial | null;
  /**
   * Every registered club, unpaginated, for the landing's roster.
   *
   * The roster's argument is the shape of the whole register — twenty-nine
   * county associations beside seventeen professional bodies — so a page of
   * twenty-four would not just truncate it, it would misstate it.
   */
  roster?: Club[];
  /** Published student-life stories, newest first, for the landing's chapters. */
  stories?: Story[];
}

/** Media envelope returned by the campus-life composition endpoint. */
export interface CampusLifeMedia {
  id?: string | null;
  url?: string | null;
  public_url?: string | null;
  cdn_url?: string | null;
  thumbnail_url?: string | null;
  alt_text?: string | null;
}

/** A published club activity with a start time, used by the "this week" rail. */
export interface CampusLifeActivity {
  id: string;
  title?: string | null;
  description?: string | null;
  activity_type?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
  location?: string | null;
  club?: { id: string; name: string } | null;
  cover_image?: CampusLifeMedia | null;
}

/** Shared shape of the club / sport / governance summaries in the composition. */
export interface CampusLifeRecordSummary {
  id: string;
  name?: string | null;
  slug?: string | null;
  href?: string | null;
  description?: string | null;
  acronym?: string | null;
  governance_type?: string | null;
  email?: string | null;
  phone?: string | null;
  office_location?: string | null;
  cover_image?: CampusLifeMedia | null;
}

export interface LifeAroundStudiesEditorial {
  section: {
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    items?: Array<{
      id: string;
      title?: string | null;
      subtitle?: string | null;
      body_text?: string | null;
      cta_label?: string | null;
      cta_url?: string | null;
      audience?: string | null;
      source_type?: string | null;
      is_featured?: boolean;
      content?: Record<string, unknown> | null;
    }>;
  };
  stats: Record<string, number>;
  clubs: CampusLifeRecordSummary[];
  sports: CampusLifeRecordSummary[];
  accommodation: CampusLifeRecordSummary[];
  arts: CampusLifeRecordSummary[];
  governance: CampusLifeRecordSummary[];
  activities: CampusLifeActivity[];
  faqs: Array<Record<string, unknown>>;
  contacts: Array<Record<string, unknown>>;
}

async function safeList<T>(promise: Promise<ListEnvelope<T>>): Promise<T[]> {
  try {
    const result = await promise;
    return result.data ?? [];
  } catch (error) {
    console.error("Failed to fetch campus life list:", error);
    return [];
  }
}

async function safeListWithCount<T>(
  promise: Promise<ListEnvelope<T> & { meta?: { total?: number } }>,
): Promise<{ data: T[]; total: number }> {
  try {
    const result = await promise;
    const meta = result.meta as { total?: number } | undefined;
    return {
      data: result.data ?? [],
      total: meta?.total ?? result.data?.length ?? 0,
    };
  } catch (error) {
    console.error("Failed to fetch campus life list:", error);
    return { data: [], total: 0 };
  }
}

async function safeRecord<T>(
  promise: Promise<RecordEnvelope<T>>,
): Promise<T | null> {
  try {
    const result = await promise;
    return result.data ?? null;
  } catch (error) {
    console.error("Failed to fetch campus life record:", error);
    return null;
  }
}

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function baseParams(perPage: number, fields: string): QueryParams {
  return { per_page: perPage, fields };
}

function statusParams(
  status: string | undefined,
  targetArea: string,
): QueryParams {
  const value = clean(status);
  if (value === "active") return { is_active: true };
  if (value === "inactive") return { is_active: false };
  if (targetArea === "accommodation" && value === "accepting") {
    return { is_accepting_applications: true };
  }
  if (targetArea === "accommodation" && value === "closed") {
    return { is_accepting_applications: false };
  }
  return {};
}

function listParamsForArea(
  area: string | undefined,
  targetArea: string,
  perPage: number,
  fields: string,
  filters?: CampusLifeFilters,
  typeParam?: string,
  page?: number,
) {
  const params = baseParams(perPage, fields);
  if (area === targetArea) {
    if (typeParam) params[typeParam] = clean(filters?.type);
    if (targetArea === "clubs") params.q = clean(filters?.q);
    Object.assign(params, statusParams(filters?.status, targetArea));
    if (page !== undefined) params.page = page;
  }
  return params;
}

export async function getCampusLifeData(
  segments: string[] = [],
  filters: CampusLifeFilters = {},
  page: number = 1,
): Promise<CampusLifePageData> {
  const [area, slug] = segments;

  /**
   * Fetch one collection, but only when the current route actually renders it.
   *
   * Each area displays exactly one collection, so fetching the other four cost
   * four unused round trips on every interior page view. Areas the route does
   * not render resolve to empty without touching the network; the landing needs
   * none of them, because it composes from `roster`, `stories` and `editorial`.
   */
  async function fetchArea<T>(
    targetArea: string,
    perPage: number,
    fields: string,
    apiCall: (params: QueryParams) => Promise<ListEnvelope<T>>,
    typeParam: string,
  ): Promise<{ data: T[]; total: number }> {
    if (area !== targetArea) return { data: [], total: 0 };
    const params = listParamsForArea(
      area,
      targetArea,
      perPage,
      fields,
      filters,
      typeParam,
      page,
    );
    return safeListWithCount(
      apiCall(params) as Promise<ListEnvelope<T> & { meta?: { total?: number } }>,
    );
  }

  const [
    clubsResult,
    accommodationsResult,
    sportsResult,
    artsResult,
    governanceResult,
    faqs,
    contacts,
    testimonials,
  ] = await Promise.all([
    fetchArea("clubs", 24, clubListFields, clubsApi.list.bind(clubsApi), "club_type"),
    fetchArea("accommodation", 16, accommodationFields, accommodationsApi.list.bind(accommodationsApi), "accommodation_type"),
    fetchArea("sports", 16, sportsFields, sportsFacilitiesApi.list.bind(sportsFacilitiesApi), "facility_type"),
    fetchArea("gallery", 16, artsFields, artsCultureApi.list.bind(artsCultureApi), "category"),
    fetchArea("student-life", 12, governanceFields, studentGovernanceApi.list.bind(studentGovernanceApi), "governance_type"),
    // The support area and the landing both answer practical questions.
    area === "support" || !area
      ? safeList(
          faqsApi.list({
            scope_type: "student_life",
            per_page: 8,
            fields: faqFields,
          }),
        )
      : Promise.resolve<FAQ[]>([]),
    area === "support"
      ? safeList(
          contactsApi.list({
            scope_type: "student_life",
            per_page: 8,
            fields: contactFields,
          }),
        )
      : Promise.resolve<ContactDirectory[]>([]),
    area
      ? Promise.resolve<Testimonial[]>([])
      : safeList(
          testimonialsApi.list({
            per_page: 6,
            fields: testimonialFields,
          }),
        ),
  ]);

  const detail: CampusLifePageData["detail"] = {};
  let editorial: LifeAroundStudiesEditorial | null = null;
  let roster: Club[] = [];
  let stories: Story[] = [];

  if (!area) {
    // The landing composes from three sources that no interior page uses. They
    // are independent, so they go out together rather than in sequence.
    const [editorialResult, rosterResult, storiesResult] = await Promise.all([
      mainApi
        .get<{ data?: LifeAroundStudiesEditorial }>("/api/v1/campus-life/homepage")
        .then((response) => response.data ?? null)
        .catch((error) => {
          console.warn("Failed to fetch Life Around Studies composition:", error);
          return null;
        }),
      safeList(
        clubsApi.list({ per_page: ROSTER_PER_PAGE, fields: clubListFields }),
      ),
      // The campus-life stories are the seeded Corporate Communication
      // features. Admissions and graduation notices are official news and
      // belong on the homepage, not here, so the whole editorial set is fetched
      // and the landing filters it rather than taking a mixed first page.
      safeList(storiesApi.list({ per_page: 30, fields: storyFields })),
    ]);
    editorial = editorialResult;
    roster = rosterResult;
    stories = storiesResult;
  }

  if (area === "clubs" && slug) {
    detail.club = await safeRecord(
      clubsApi.getBySlug(slug, { fields: clubDetailFields }),
    );
  }

  if (area === "accommodation" && slug) {
    detail.accommodation = await safeRecord(
      accommodationsApi.getBySlug(slug, { fields: accommodationFields }),
    );
  }

  if (area === "sports" && slug) {
    detail.sport = await safeRecord(
      sportsFacilitiesApi.getBySlug(slug, { fields: sportsFields }),
    );
  }

  if (area === "gallery" && slug) {
    detail.art = await safeRecord(
      artsCultureApi.getBySlug(slug, { fields: artsFields }),
    );
  }

  if (area === "student-life" && slug) {
    detail.governance = await safeRecord(
      studentGovernanceApi.getBySlug(slug, { fields: governanceFields }),
    );
  }

  // /campus-life/stories/<slug> opens a story directly; there is no category
  // index in between. The sibling list rides along for the "keep reading" row.
  if (area === "stories" && slug) {
    const [record, siblings] = await Promise.all([
      safeRecord(storiesApi.getBySlug(slug)),
      safeList(storiesApi.list({ per_page: 12, fields: storyFields })),
    ]);
    detail.story = record;
    stories = siblings;
  }

  return {
    clubs: clubsResult.data,
    accommodations: accommodationsResult.data,
    sports: sportsResult.data,
    arts: artsResult.data,
    governance: governanceResult.data,
    faqs,
    contacts,
    testimonials,
    detail,
    totals: {
      clubs: clubsResult.total,
      accommodations: accommodationsResult.total,
      sports: sportsResult.total,
      arts: artsResult.total,
      governance: governanceResult.total,
    },
    page,
    editorial,
    roster,
    stories,
  };
}
