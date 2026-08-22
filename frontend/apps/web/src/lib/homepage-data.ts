import { cache } from "react";
import {
  blogsApi,
  contactsApi,
  eventsApi,
  getResearchApiBaseUrl,
  intakesApi,
  libraryServiceApi,
  newsApi,
  partnersApi,
  programmesApi,
  researchServiceApi,
  schoolsApi,
  statsApi,
  storiesApi,
  universityInfoApi,
  type Blog,
  type ContactDirectory,
  type Event,
  type Intake,
  type Media,
  type News,
  type Programme,
  type PublicStatsResponse,
  type School,
  type Story,
  type UniversityInfo,
} from "@ksu/api-client";
import {
  getLandingAnnouncements,
  getLandingHeroData,
  type LandingAnnouncement,
  type LandingHeroData,
} from "@/lib/landing-data";
import { getViceChancellor } from "@/lib/get-leadership";
import { publicFileUrl, publicMediaUrl } from "@/lib/public-media";
import {
  heriAfricaFrontendUrl,
  libraryFrontendUrl,
  researchFrontendUrl,
} from "@/lib/service-urls";

export type HomeContactInfo = {
  address: string;
  phone: string;
  email: string;
};

export type HomeSocialLinks = {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  youtube?: string;
  linkedin?: string;
};

export type HomeAction = {
  label: string;
  href: string;
  external?: boolean;
};

export type HomeMetric = {
  value: string;
  label: string;
  detail?: string;
};

export type HomeCard = {
  id?: string;
  title: string;
  body: string;
  href: string;
  action?: string;
  eyebrow?: string;
  external?: boolean;
  imageUrl?: string | null;
  meta?: string | null;
};

export type HomeProgrammeCard = HomeCard & {
  schoolId?: string | null;
  schoolName?: string | null;
  intakeIds?: string[] | null;
};

/** An event card that keeps the raw dates the homepage needs to render a
 *  prominent day/month block and to prove the event has not passed. */
export type HomeEventCard = HomeCard & {
  startDate?: string | null;
  endDate?: string | null;
  venue?: string | null;
  timeLabel?: string | null;
};

/** Filter options for the programme finder, read off the live catalogue so
 *  the selects never assert levels or modes the university does not offer. */
export type HomeProgrammeFilters = {
  levels: string[];
  modes: string[];
};

export type HomeSchoolCard = HomeCard & {
  programmes: HomeProgrammeCard[];
  /** From the cover media record, when the editor has written one. */
  imageAlt?: string | null;
};

export type HomeLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type HomePartner = {
  id: string;
  name: string;
  logoUrl: string;
  href?: string;
};

export type HomeLeader = {
  name: string;
  title: string;
  image?: string | null;
  message?: string | null;
  href?: string;
};

type SchoolWithMedia = School & {
  cover_image?: Partial<Media> | null;
};

type ProgrammeWithMedia = Programme & {
  cover_image?: Partial<Media> | null;
};

/** A record fetched with `include=featured_media(...)`. */
type WithFeaturedMedia<T> = T & {
  featured_media?: Partial<Media> | null;
};

export type HomeIntake = {
  id: string;
  name: string;
  code: string;
  slug: string;
  applicationStart: string;
  applicationEnd: string;
  lateApplicationEnd?: string | null;
  isOpen: boolean;
  isActive: boolean;
  href: string;
};

export type HomepageData = {
  hero: LandingHeroData;
  announcements: LandingAnnouncement[];
  contactInfo: HomeContactInfo;
  socialLinks: HomeSocialLinks;
  miniQuickLinks: HomeLink[];
  facts: HomeMetric[];
  researchStats: HomeMetric[];
  libraryStats: HomeMetric[];
  priorityActions: HomeCard[];
  schools: HomeSchoolCard[];
  viceChancellor: HomeLeader | null;
  featuredProgrammes: HomeProgrammeCard[];
  programmesSummary: HomeMetric[];
  programmeFilters: HomeProgrammeFilters;
  activeIntakes: HomeIntake[];
  activeIntakeProgrammes: HomeProgrammeCard[];
  admissionsActions: HomeCard[];
  latestNews: HomeCard[];
  featuredStories: HomeCard[];
  upcomingEvents: HomeEventCard[];
  latestBlog: HomeCard | null;
  latestBlogs: HomeCard[];
  serviceLinks: HomeLink[];
  publicQuickLinks: HomeLink[];
  contactActions: HomeAction[];
  partners: HomePartner[];
};

const fallbackContactInfo: HomeContactInfo = {
  address: "Main Campus, Kisii",
  phone: "+254720875082",
  email: "info@kisiiuniversity.ac.ke",
};

const fallbackSocialLinks: HomeSocialLinks = {
  facebook: "https://facebook.com/kisiiuniversity",
  twitter: "https://twitter.com/kisiiuniversity",
  instagram: "https://instagram.com/kisiiuniversity",
  youtube: "https://youtube.com/kisiiuniversity",
  linkedin: "https://linkedin.com/school/kisiiuniversity",
};

const researchApiBaseUrl = getResearchApiBaseUrl();

const stablePortalLinks: HomeLink[] = [
  {
    label: "HERI AFRICA",
    href: heriAfricaFrontendUrl,
    external: true,
  },
  {
    label: "HUDUMA BORA",
    href: "https://digital.kisiiuniversity.ac.ke/",
    external: true,
  },
  {
    label: "STUDENT PORTAL",
    href: "https://portal.kisiiuniversity.ac.ke",
    external: true,
  },
  {
    label: "CAREERS",
    href: "https://digital.kisiiuniversity.ac.ke/job_portal/open_adverts",
    external: true,
  },
  {
    label: "CONFERENCES",
    href: "https://digital.kisiiuniversity.ac.ke/conferences",
    external: true,
  },
  {
    label: "TENDERS",
    href: "https://digital.kisiiuniversity.ac.ke/procurement_portal/tenders",
    external: true,
  },
  {
    label: "HELP DESK",
    href: "https://digital.kisiiuniversity.ac.ke/ksu_customer_care_centerr",
    external: true,
  },
];

const serviceLinks: HomeLink[] = [
  ...stablePortalLinks,
  { label: "Programmes", href: "/academics/programmes" },
  {
    label: "Library",
    href: libraryFrontendUrl,
    external: true,
  },
  {
    label: "Research",
    href: researchFrontendUrl,
    external: true,
  },
  { label: "Governance", href: "/about/governance" },
  { label: "Quality Assurance", href: "/about/quality-assurance" },
  { label: "Media Desk", href: "/media" },
];

const publicQuickLinks: HomeLink[] = [
  { label: "Admissions Guide", href: "/admissions/how-to-apply" },
  { label: "Programmes", href: "/academics/programmes" },
  { label: "Fees Structure", href: "/admissions/fees" },
  { label: "Downloads", href: "/downloads" },
  {
    label: "Student Portal",
    href: "https://portal.kisiiuniversity.ac.ke",
    external: true,
  },
  {
    label: "Staff Portal",
    href: "https://digital.kisiiuniversity.ac.ke/staff/services/login",
    external: true,
  },
  { label: "Contact Directory", href: "/contact" },
];

function plainText(value?: string | null) {
  return (value ?? "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, length: number) {
  return value.length > length
    ? `${value.slice(0, length - 1).trim()}…`
    : value;
}

function present(value: unknown) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function firstPhone(contact?: ContactDirectory | null) {
  const phone = contact?.phone?.find((item) => present(item));
  return phone ?? null;
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

async function safe<T>(
  task: Promise<T>,
  fallback: T,
  label = "homepage data",
  logFailure = true,
): Promise<T> {
  try {
    return await task;
  } catch (error) {
    if (logFailure && !isAbortError(error)) {
      console.warn(`Failed to load ${label}:`, error);
    }
    return fallback;
  }
}

async function getUniversityInfo(): Promise<UniversityInfo | null> {
  const response = await universityInfoApi.getCurrent({
    fields:
      "id,name,short_name,motto,overview,mission,founding_year,institution_type,charter_summary,email,phone,physical_address,city,county,social_links,quick_facts,vc_message_title,vc_message",
  });
  return response.data ?? null;
}

async function getMainContact() {
  const response = await contactsApi.list({
    is_main: true,
    per_page: 1,
    fields:
      "id,name,email,phone,physical_address,building,room_number,is_main,is_public,status",
  });
  return response.data?.[0] ?? null;
}

async function getSchoolsList() {
  const response = await schoolsApi.list({
    per_page: 8,
    fields:
      "id,name,code,slug,description,about,cover_image_id,departments_count",
    include:
      "cover_image(id,public_url,cdn_url,thumbnail_url,storage_path,alt_text,title)",
  });
  return (response.data ?? []) as SchoolWithMedia[];
}

async function getProgrammesList() {
  const response = await programmesApi.list({
    per_page: 100,
    fields:
      "id,name,slug,level,mode_of_study,duration,department_id,department_name,cover_image_id,display_order,intake_ids",
    include:
      "cover_image(id,public_url,cdn_url,thumbnail_url,storage_path,alt_text,title),department(id,name,school_id,school_name,school(id,name,code,slug))",
  });
  return (response.data ?? []) as ProgrammeWithMedia[];
}

async function getProgrammesBySchool(schools: SchoolWithMedia[]) {
  const entries = await Promise.all(
    schools.map(async (school) => {
      const response = await programmesApi.list({
        school_id: school.id,
        per_page: 3,
        fields:
          "id,name,slug,level,mode_of_study,duration,department_id,department_name,cover_image_id,display_order",
        include:
          "cover_image(id,public_url,cdn_url,thumbnail_url,storage_path,alt_text,title),department(id,name,school_id,school_name,school(id,name,code,slug))",
      });

      return [school.id, normalizeFeaturedProgrammes(response.data ?? [])] as const;
    }),
  );

  return new Map(entries);
}

async function getLatestNews() {
  const response = await newsApi.list({
    is_published: true,
    per_page: 3,
    fields:
      "id,title,slug,summary,plain_text,category,published_at,is_main,is_featured,featured_media_id,created_at",
    include: "featured_media(id,public_url,cdn_url,thumbnail_url,storage_path,alt_text,title)",
  });
  return response.data ?? [];
}

async function getUpcomingEvents() {
  const response = await eventsApi.list({
    is_published: true,
    upcoming: true,
    // The homepage calendar plots a month at a time, so it needs more than
    // the three the old list rendered. Still bounded: a calendar showing a
    // year of events is a listings page, not a homepage section.
    per_page: 24,
    fields:
      "id,title,slug,summary,plain_text,event_type,start_date,end_date,location,venue,featured_media_id,is_featured,published_at,created_at",
    include: "featured_media(id,public_url,cdn_url,thumbnail_url,storage_path,alt_text,title)",
  });
  return response.data ?? [];
}

async function getLatestBlogs() {
  const response = await blogsApi.list({
    is_published: true,
    per_page: 3,
    fields:
      "id,title,slug,summary,excerpt,plain_text,category,published_at,author_name,featured_media_id,created_at",
    include: "featured_media(id,public_url,cdn_url,thumbnail_url,storage_path,alt_text,title)",
  });
  return response.data ?? [];
}

async function getFeaturedStories() {
  const response = await storiesApi.list({
    is_featured: true,
    per_page: 7,
    fields:
      "id,title,slug,summary,plain_text,story_type,category,published_at,featured_media_id,featured_media,contributor_name_snapshot,created_at",
    include: "featured_media(id,public_url,cdn_url,thumbnail_url,storage_path,alt_text,title)",
  });
  return response.data ?? [];
}

async function getActiveIntakes() {
  const response = await intakesApi.list({
    per_page: 4,
    fields:
      "id,name,code,slug,application_start,application_end,late_application_end,is_active,is_open,cover_image_id,created_at,updated_at",
  });
  const records = response.data ?? [];
  return Promise.all(
    records.map(async (record) => {
      try {
        const detail = await intakesApi.getBySlug(record.slug, {
          fields:
            "id,name,code,slug,application_start,application_end,late_application_end,is_active,is_open",
          include:
            "programmes:programme(id,name,slug,level,mode_of_study,duration,department_id,department_name)",
        });
        return detail.data ?? record;
      } catch {
        return record;
      }
    }),
  );
}

const getResearchPartners = cache(async () => {
  const response = await partnersApi.list({
    status: "active",
    is_active: true,
    per_page: 24,
    fields:
      "id,name,slug,acronym,website,logo_url,social_links,status,is_active,is_featured,display_order",
  });
  return response.data ?? [];
});

const getHomepageStats = cache(async () => {
  const response = await statsApi.get({ scope: "university" });
  return response.data ?? null;
});

const getResearchStats = cache(async () => {
  const response = await researchServiceApi.stats();
  return response.data ?? null;
});

const getLibraryStats = cache(async () => {
  const response = await libraryServiceApi.stats();
  return response.data ?? null;
});

function normalizeSocialLinks(value: unknown): HomeSocialLinks {
  if (!value || typeof value !== "object") return fallbackSocialLinks;
  const source = value as Record<string, unknown>;

  return {
    facebook: present(source.facebook) ?? fallbackSocialLinks.facebook,
    twitter:
      present(source.twitter) ??
      present(source.x) ??
      fallbackSocialLinks.twitter,
    instagram: present(source.instagram) ?? fallbackSocialLinks.instagram,
    youtube: present(source.youtube) ?? fallbackSocialLinks.youtube,
    linkedin: present(source.linkedin) ?? fallbackSocialLinks.linkedin,
  };
}

function buildContactInfo(
  university: UniversityInfo | null,
  contact: ContactDirectory | null,
): HomeContactInfo {
  const address =
    present(contact?.physical_address) ??
    present(university?.physical_address) ??
    [present(university?.city), present(university?.county)]
      .filter(Boolean)
      .join(", ") ??
    fallbackContactInfo.address;

  return {
    address: address || fallbackContactInfo.address,
    phone:
      firstPhone(contact) ??
      present(university?.phone) ??
      fallbackContactInfo.phone,
    email:
      present(contact?.email) ??
      present(university?.email) ??
      fallbackContactInfo.email,
  };
}

function buildFacts(
  schools: School[],
  programmes: Programme[],
  stats?: PublicStatsResponse | null,
): HomeMetric[] {
  if (stats?.stats?.length) {
    const visibleStats = stats.stats.filter((stat) => Number(stat.value) > 0);
    if (visibleStats.length) {
      return visibleStats.slice(0, 4).map((stat) => ({
        value: `${stat.value}${stat.suffix ?? ""}`,
        label: stat.label,
      }));
    }
  }

  return [
    {
      value: `${schools.length}`,
      label: "Schools",
    },
    {
      value: `${programmes.length}`,
      label: "Programmes",
    },
  ].filter((metric) => Number(metric.value) > 0);
}

/**
 * Present a statistic the way a reader scans it.
 *
 * The services return bare numbers with a unit suffix, which concatenated
 * naively gives "12947500KES" — technically the right figure and unreadable
 * at a glance. Currency codes move in front of a compacted amount, counts get
 * thousands separators, and a trailing unit like "Ha" stays where it is.
 */
function formatStatValue(value: number | string, suffix?: string | null) {
  const numeric = Number(value);
  const unit = (suffix ?? "").trim();
  if (!Number.isFinite(numeric)) return `${value}${unit}`;

  const isCurrency = /^[A-Z]{3}$/.test(unit);
  const compact =
    Math.abs(numeric) >= 10_000
      ? new Intl.NumberFormat("en-KE", {
          notation: "compact",
          maximumFractionDigits: 1,
        }).format(numeric)
      : new Intl.NumberFormat("en-KE", { maximumFractionDigits: 1 }).format(
          numeric,
        );

  if (isCurrency) return `${unit} ${compact}`;
  return unit ? `${compact} ${unit}` : compact;
}

function normalizeStats(stats?: PublicStatsResponse | null): HomeMetric[] {
  return (
    stats?.stats
      ?.filter((stat) => Number(stat.value) > 0)
      .map((stat) => ({
        value: formatStatValue(stat.value, stat.suffix),
        label: stat.label,
        detail: stat.description,
      })) ?? []
  );
}

function schoolBody(school: School) {
  return truncate(
    plainText(school.description) ||
      plainText(school.about) ||
      "Departments, programmes, academic advising, and student progression.",
    132,
  );
}

function normalizeSchools(
  schools: SchoolWithMedia[],
  programmesBySchool: Map<string, HomeProgrammeCard[]>,
): HomeSchoolCard[] {
  return schools.map((school) => ({
    id: school.id,
    title: school.name,
    eyebrow: school.code || "School",
    body: schoolBody(school),
    href: `/academics/schools/${school.slug}`,
    action: "View school",
    imageUrl:
      publicMediaUrl(school.cover_image) ??
      publicFileUrl(school.cover_image_id),
    imageAlt: present(school.cover_image?.alt_text),
    programmes: programmesBySchool.get(school.id) ?? [],
  }));
}

function normalizeFeaturedProgrammes(
  programmes: ProgrammeWithMedia[],
): HomeProgrammeCard[] {
  return programmes.slice(0, 24).map((programme) => ({
    id: programme.id,
    title: programme.name,
    eyebrow: programme.level || "Programme",
    body: [
      programme.department_name,
      programme.duration,
      programme.mode_of_study,
    ]
      .map((item) => present(item))
      .filter(Boolean)
      .join(" · "),
    href: `/academics/programmes/${programme.slug}`,
    action: "View programme",
    imageUrl:
      publicMediaUrl(programme.cover_image) ??
      publicFileUrl(programme.cover_image_id),
    meta: programme.level,
    schoolId: present(programme.department?.school_id),
    schoolName:
      present(programme.department?.school?.name) ??
      present(programme.department?.school_name),
    intakeIds: programme.intake_ids ?? null,
  }));
}

function buildProgrammeSummary(programmes: Programme[]): HomeMetric[] {
  const modes = new Set(
    programmes.map((programme) => programme.mode_of_study).filter(Boolean),
  );

  return [
    {
      value: programmes.length ? `${programmes.length}+` : "0",
      label: "Programmes",
      detail: "Published academic programmes.",
    },
    {
      value: modes.size ? `${modes.size}` : "0",
      label: "Study modes",
      detail: "Available delivery modes.",
    },
  ].filter((metric) => Number.parseInt(metric.value, 10) > 0);
}

/**
 * Distinct study levels and modes across the published catalogue. The finder
 * selects are built from these rather than a hardcoded list, so a level the
 * university does not currently offer is never presented as searchable.
 */
function buildProgrammeFilters(programmes: Programme[]): HomeProgrammeFilters {
  const collect = (pick: (programme: Programme) => string | null | undefined) =>
    Array.from(
      new Set(
        programmes
          .map((programme) => present(pick(programme)))
          .filter((value): value is string => value !== null),
      ),
    ).sort((first, second) => first.localeCompare(second));

  return {
    levels: collect((programme) => programme.level),
    modes: collect((programme) => programme.mode_of_study),
  };
}

function normalizeNews(news: WithFeaturedMedia<News>[]): HomeCard[] {
  return news.map((item) => ({
    id: item.id,
    title: item.title,
    eyebrow: item.category || "News",
    body: truncate(
      plainText(item.summary) ||
        plainText(item.plain_text) ||
        plainText(item.content) ||
        "Read the latest public update from Kisii University.",
      132,
    ),
    href: `/media/news/${item.slug}`,
    action: "Read update",
    imageUrl:
      publicMediaUrl(item.featured_media) ??
      publicFileUrl(item.featured_media_id),
    meta: formatDisplayDate(item.published_at ?? item.created_at),
  }));
}

/**
 * Upcoming events, with the raw dates kept alongside the display copy.
 *
 * The listing is already requested with `upcoming: true`, but a cached page
 * outlives the events on it: an event that closed since the last revalidate
 * would otherwise still be presented as upcoming. Anything whose end (or
 * start, when there is no end) is in the past is dropped here.
 */
function normalizeEvents(events: WithFeaturedMedia<Event>[]): HomeEventCard[] {
  const now = Date.now();

  return events
    .filter((item) => {
      const boundary = present(item.end_date) ?? present(item.start_date);
      if (!boundary) return true;
      const time = new Date(boundary).getTime();
      return Number.isNaN(time) || time >= now;
    })
    .map((item) => ({
      id: item.id,
      title: item.title,
      eyebrow: item.event_type || "Event",
      body: truncate(
        plainText(item.summary) ||
          plainText(item.plain_text) ||
          plainText(item.content) ||
          "View event details, venue, and schedule information.",
        110,
      ),
      href: `/media/events/${item.slug}`,
      action: "View event",
      imageUrl:
        publicMediaUrl(item.featured_media) ??
        publicFileUrl(item.featured_media_id),
      meta: [
        formatDisplayDate(item.start_date),
        present(item.venue) ?? present(item.location),
      ]
        .filter(Boolean)
        .join(" · "),
      startDate: present(item.start_date),
      endDate: present(item.end_date),
      venue: present(item.venue) ?? present(item.location),
      timeLabel: formatTimeRange(item.start_date, item.end_date),
    }));
}

/** "10:00 AM - 4:00 PM" when the record carries clock times, else nothing.
 *  A date-only value (`2026-05-20`) parses to midnight and would otherwise
 *  advertise every event as starting at 12:00 AM. */
function formatTimeRange(start?: string | null, end?: string | null) {
  const formatted = [start, end].map((value) => {
    const text = present(value);
    if (!text || !/\d{2}:\d{2}/.test(text)) return null;
    const date = new Date(text);
    if (Number.isNaN(date.getTime())) return null;
    return new Intl.DateTimeFormat("en-KE", {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  });

  if (!formatted[0]) return null;
  return formatted[1] ? `${formatted[0]} - ${formatted[1]}` : formatted[0];
}

function normalizeBlog(item?: WithFeaturedMedia<Blog>): HomeCard | null {
  if (!item) return null;

  return {
    id: item.id,
    title: item.title,
    eyebrow: item.category || "Blog",
    body: truncate(
      plainText(item.summary) ||
        plainText(item.excerpt) ||
        plainText(item.plain_text) ||
        plainText(item.content) ||
        "Read the latest university article.",
      126,
    ),
    href: `/media/articles/${item.slug}`,
    action: "Read blog",
    imageUrl:
      publicMediaUrl(item.featured_media) ??
      publicFileUrl(item.featured_media_id),
    meta: [
      formatDisplayDate(item.published_at ?? item.created_at),
      present(item.author_name),
    ]
      .filter(Boolean)
      .join(" · "),
  };
}

function normalizeStories(stories: Story[]): HomeCard[] {
  return stories.map((item) => ({
    id: item.id,
    title: item.title,
    eyebrow: item.category || item.story_type || "Story",
    body: truncate(
      plainText(item.summary) ||
        plainText(item.plain_text) ||
        "Read a featured story from the Kisii University community.",
      132,
    ),
    href: `/stories/${item.slug}`,
    action: "Read story",
    imageUrl:
      publicMediaUrl(item.featured_media as Partial<Media> | null) ??
      publicFileUrl(item.featured_media_id),
    meta: [
      formatDisplayDate(item.published_at ?? item.created_at),
      present(item.contributor_name_snapshot),
    ]
      .filter(Boolean)
      .join(" · "),
  }));
}

function normalizeIntakes(intakes: Intake[]): HomeIntake[] {
  return intakes
    .filter((item) => item.is_active || item.is_open)
    .map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      slug: item.slug,
      applicationStart: item.application_start,
      applicationEnd: item.application_end,
      lateApplicationEnd: item.late_application_end,
      isOpen: item.is_open,
      isActive: item.is_active,
      href: `/admissions/intakes/${item.slug}`,
    }))
    .sort(
      (first, second) =>
        Number(second.isOpen) - Number(first.isOpen) ||
        new Date(first.applicationStart).getTime() -
          new Date(second.applicationStart).getTime(),
    );
}

function formatDisplayDate(value?: string | null) {
  const text = present(value);
  if (!text) return null;
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function resolveResearchAssetUrl(value: string) {
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  // Partner brand marks are served from this app's own /public, not by the
  // research service. Resolving them against the research API base would
  // point every logo at the gateway, which has no such route.
  if (value.startsWith("/images/")) return value;
  return new URL(
    value.startsWith("/") ? value : `/${value}`,
    researchApiBaseUrl,
  ).toString();
}

function partnerLogoUrl(record: Record<string, unknown>) {
  const logoUrl = present(record.logo_url);
  if (logoUrl) return resolveResearchAssetUrl(logoUrl);

  const socialLinks = record.social_links;
  if (socialLinks && typeof socialLinks === "object") {
    const assetPath = present(
      (socialLinks as Record<string, unknown>).asset_path,
    );
    if (assetPath) return resolveResearchAssetUrl(assetPath);
  }

  return null;
}

function normalizePartners(records: Record<string, unknown>[]): HomePartner[] {
  return records
    .map((record): HomePartner | null => {
      const id = present(record.id);
      const name = present(record.name) ?? present(record.acronym);
      const logoUrl = partnerLogoUrl(record);
      if (!id || !name || !logoUrl) return null;
      const href = present(record.website);

      return {
        id,
        name,
        logoUrl,
        ...(href ? { href } : {}),
      };
    })
    .filter((partner): partner is HomePartner => partner !== null);
}

export async function getHomepageData(): Promise<HomepageData> {
  const [
    hero,
    announcements,
    university,
    contact,
    schools,
    programmes,
    latestNews,
    upcomingEvents,
    latestBlogs,
    featuredStories,
    activeIntakes,
    partners,
    homepageStats,
    researchStats,
    libraryStats,
    viceChancellor,
  ] = await Promise.all([
    getLandingHeroData(),
    getLandingAnnouncements(),
    safe(getUniversityInfo(), null, "university info"),
    safe(getMainContact(), null, "main contact"),
    safe(getSchoolsList(), [], "schools"),
    safe(getProgrammesList(), [], "programmes"),
    safe(getLatestNews(), [], "latest news"),
    safe(getUpcomingEvents(), [], "events"),
    safe(getLatestBlogs(), [], "blogs"),
    safe(getFeaturedStories(), [], "featured stories"),
    safe(getActiveIntakes(), [], "intakes"),
    safe(getResearchPartners(), [], "research partners", false),
    safe(getHomepageStats(), null, "homepage stats", false),
    safe(getResearchStats(), null, "research stats", false),
    safe(getLibraryStats(), null, "library stats", false),
    safe(getViceChancellor(), null, "vice chancellor", false),
  ]);

  const contactInfo = buildContactInfo(university, contact);
  const viceChancellorMessage =
    plainText(university?.vc_message) || viceChancellor?.message || null;
  const featuredProgrammes = normalizeFeaturedProgrammes(programmes);
  const activeIntakeRecord = activeIntakes.find((intake) => intake.is_open) ?? activeIntakes[0];
  const activeIntakeProgrammes = normalizeFeaturedProgrammes(
    (activeIntakeRecord?.programmes ?? [])
      .filter((item) => item.is_active && item.programme)
      .map((item) => item.programme) as ProgrammeWithMedia[],
  ).slice(0, 6);
  const programmesBySchool = await safe(
    getProgrammesBySchool(schools),
    new Map<string, HomeProgrammeCard[]>(),
    "school programmes",
    false,
  );

  return {
    hero,
    announcements,
    contactInfo,
    socialLinks: normalizeSocialLinks(university?.social_links),
    miniQuickLinks: stablePortalLinks,
    facts: buildFacts(schools, programmes, homepageStats),
    researchStats: normalizeStats(researchStats),
    libraryStats: normalizeStats(libraryStats),
    priorityActions: [
      {
        title: "Prospective Students",
        body: "Compare programmes, entry routes, and admissions steps.",
        href: "/admissions/how-to-apply",
        action: "Start here",
        eyebrow: "Admissions",
      },
      {
        title: "Students & Staff",
        body: "Reach learning systems, student services, library services, and staff tools.",
        href: "https://portal.kisiiuniversity.ac.ke",
        action: "Open portal",
        eyebrow: "Digital services",
        external: true,
      },
      {
        title: "Partners & Public",
        body: "Find research, governance, news, service information, and public contacts.",
        href: researchFrontendUrl,
        action: "Explore research",
        eyebrow: "Public engagement",
        external: true,
      },
    ],
    schools: normalizeSchools(schools, programmesBySchool),
    viceChancellor: viceChancellor
      ? {
          name: viceChancellor.name,
          title: viceChancellor.title,
          image: viceChancellor.image,
          message: viceChancellorMessage,
          href: viceChancellor.slug
            ? `/staff/${viceChancellor.slug}`
            : "/about/university-management",
        }
      : null,
    featuredProgrammes,
    programmesSummary: buildProgrammeSummary(programmes),
    programmeFilters: buildProgrammeFilters(programmes),
    activeIntakes: normalizeIntakes(activeIntakes),
    activeIntakeProgrammes,
    admissionsActions: [
      {
        title: "Explore programmes",
        body: "Compare schools, study levels, and available programme routes.",
        href: "/academics/programmes",
        action: "Browse programmes",
      },
      {
        title: "Check requirements",
        body: "Review entry requirements, documents, and current application guidance.",
        href: "/admissions/how-to-apply",
        action: "View requirements",
      },
      {
        title: "Apply with confidence",
        body: "Use the admissions guide to prepare and submit your application.",
        href: "/admissions/how-to-apply",
        action: "Apply now",
      },
    ],
    latestNews: normalizeNews(latestNews),
    featuredStories: normalizeStories(featuredStories),
    upcomingEvents: normalizeEvents(upcomingEvents),
    latestBlog: normalizeBlog(latestBlogs[0]),
    latestBlogs: latestBlogs
      .map((item) => normalizeBlog(item))
      .filter((card): card is HomeCard => card !== null),
    serviceLinks,
    publicQuickLinks,
    contactActions: [
      {
        label: contactInfo.email,
        href: `mailto:${contactInfo.email}`,
      },
      {
        label: "Contact the university",
        href: `mailto:${contactInfo.email}`,
      },
    ],
    partners: normalizePartners(partners),
  };
}
