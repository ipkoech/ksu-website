import {
  contactsApi,
  newsApi,
  programmesApi,
  researchServiceApi,
  schoolsApi,
  universityInfoApi,
  type ContactDirectory,
  type News,
  type Programme,
  type School,
  type UniversityInfo,
} from "@ksu/api-client";
import {
  getLandingAnnouncements,
  getLandingHeroData,
  type LandingAnnouncement,
  type LandingHeroData,
} from "@/lib/landing-data";
import { publicFileUrl } from "@/lib/public-media";

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
  title: string;
  body: string;
  href: string;
  action?: string;
  eyebrow?: string;
  external?: boolean;
  imageUrl?: string | null;
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

export type HomepageData = {
  hero: LandingHeroData;
  announcements: LandingAnnouncement[];
  contactInfo: HomeContactInfo;
  socialLinks: HomeSocialLinks;
  miniQuickLinks: HomeLink[];
  facts: HomeMetric[];
  priorityActions: HomeCard[];
  schools: HomeCard[];
  programmesSummary: HomeMetric[];
  admissionsActions: HomeCard[];
  latestNews: HomeCard[];
  serviceLinks: HomeLink[];
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

const researchApiBaseUrl =
  process.env.NEXT_PUBLIC_RESEARCH_API_URL || "http://localhost:8001";

const stablePortalLinks: HomeLink[] = [
  {
    label: "Student Portal",
    href: "https://portal.kisiiuniversity.ac.ke",
    external: true,
  },
  { label: "Staff Portal", href: "/m/staff" },
  {
    label: "E-Learning",
    href: "https://elearning.kisiiuniversity.ac.ke",
    external: true,
  },
  { label: "Alumni", href: "/alumni" },
  { label: "A-Z Index", href: "/az-index" },
];

const serviceLinks: HomeLink[] = [
  ...stablePortalLinks,
  { label: "Programmes", href: "/academics/programmes" },
  {
    label: "Library",
    href: "https://library.kisiiuniversity.ac.ke",
    external: true,
  },
  {
    label: "Research",
    href: "https://research.kisiiuniversity.ac.ke",
    external: true,
  },
  { label: "Governance", href: "/about/governance" },
  { label: "Quality Assurance", href: "/about/quality-assurance" },
  { label: "News & Events", href: "/news" },
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
  return value.length > length ? `${value.slice(0, length - 1).trim()}...` : value;
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

async function safe<T>(
  task: Promise<T>,
  fallback: T,
  label = "homepage data",
  logFailure = true,
): Promise<T> {
  try {
    return await task;
  } catch (error) {
    if (logFailure) {
      console.warn(`Failed to load ${label}:`, error);
    }
    return fallback;
  }
}

async function getUniversityInfo(): Promise<UniversityInfo | null> {
  const response = await universityInfoApi.getCurrent({
    fields:
      "id,name,short_name,motto,overview,mission,founding_year,institution_type,charter_summary,email,phone,physical_address,city,county,social_links,quick_facts",
  });
  return response.data ?? null;
}

async function getMainContact() {
  const response = await contactsApi.list({
    is_main: true,
    per_page: 1,
    fields: "id,name,email,phone,physical_address,building,room_number,is_main,is_public,status",
  });
  return response.data?.[0] ?? null;
}

async function getSchoolsList() {
  const response = await schoolsApi.list({
    per_page: 8,
    fields: "id,name,code,slug,description,about,cover_image_id,departments_count",
  });
  return response.data ?? [];
}

async function getProgrammesList() {
  const response = await programmesApi.list({
    per_page: 100,
    fields: "id,name,slug,level,mode_of_study,duration,department_name",
  });
  return response.data ?? [];
}

async function getLatestNews() {
  const response = await newsApi.list({
    is_published: true,
    per_page: 4,
    fields: "id,title,slug,summary,plain_text,category,published_at,is_main,is_featured",
  });
  return response.data ?? [];
}

async function getResearchPartners() {
  const response = await researchServiceApi.partners.list({
    status: "active",
    is_active: true,
    per_page: 24,
    fields:
      "id,name,slug,acronym,website,logo_url,social_links,status,is_active,is_featured,display_order",
  });
  return response.data ?? [];
}

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
    [present(university?.city), present(university?.county)].filter(Boolean).join(", ") ??
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
  university: UniversityInfo | null,
  schools: School[],
  programmes: Programme[],
): HomeMetric[] {
  const quickFacts = university?.quick_facts ?? {};
  const founded =
    present((quickFacts as Record<string, unknown>).founding_year) ??
    present(university?.founding_year);
  const charterYear =
    present((quickFacts as Record<string, unknown>).charter_year) ??
    present((quickFacts as Record<string, unknown>).chartered_year);

  return [
    {
      value: present(university?.institution_type) ?? "Public University",
      label: "Institution",
      detail:
        present(university?.charter_summary) ??
        "Chartered public institution serving Kenya and beyond.",
    },
    {
      value: schools.length ? `${schools.length} Schools` : "Schools",
      label: "Academic structure",
      detail: "Backend-backed schools and academic units.",
    },
    {
      value: programmes.length ? `${programmes.length}+ Programmes` : "Programmes",
      label: "Study pathways",
      detail: "Certificate, diploma, undergraduate, and postgraduate routes.",
    },
    {
      value: charterYear ? `Chartered ${charterYear}` : founded ? `Founded ${founded}` : "Established",
      label: "Institutional record",
      detail: "A long record of public service and professional training.",
    },
  ];
}

function schoolBody(school: School) {
  return truncate(
    plainText(school.description) ||
      plainText(school.about) ||
      "Departments, programmes, academic advising, and student progression.",
    132,
  );
}

function normalizeSchools(schools: School[]): HomeCard[] {
  return schools.map((school) => ({
    title: school.name.replace(/^School of /, "").replace(/^Faculty of /, ""),
    eyebrow: school.code || "School",
    body: schoolBody(school),
    href: `/academics/schools/${school.slug}`,
    action: "View school",
    imageUrl: publicFileUrl(school.cover_image_id),
  }));
}

function buildProgrammeSummary(programmes: Programme[]): HomeMetric[] {
  const levels = new Set(programmes.map((programme) => programme.level).filter(Boolean));
  const modes = new Set(programmes.map((programme) => programme.mode_of_study).filter(Boolean));

  return [
    {
      value: programmes.length ? `${programmes.length}+` : "0",
      label: "Programmes",
      detail: "Published academic programmes.",
    },
    {
      value: levels.size ? `${levels.size}` : "0",
      label: "Study levels",
      detail: "Distinct programme levels.",
    },
    {
      value: modes.size ? `${modes.size}` : "0",
      label: "Study modes",
      detail: "Available delivery modes.",
    },
  ];
}

function normalizeNews(news: News[]): HomeCard[] {
  return news.map((item) => ({
    title: item.title,
    eyebrow: item.category || "News",
    body: truncate(
      plainText(item.summary) ||
        plainText(item.plain_text) ||
        plainText(item.content) ||
        "Read the latest public update from Kisii University.",
      132,
    ),
    href: `/news/${item.slug}`,
    action: "Read update",
  }));
}

function resolveResearchAssetUrl(value: string) {
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  return new URL(value.startsWith("/") ? value : `/${value}`, researchApiBaseUrl).toString();
}

function partnerLogoUrl(record: Record<string, unknown>) {
  const logoUrl = present(record.logo_url);
  if (logoUrl) return resolveResearchAssetUrl(logoUrl);

  const socialLinks = record.social_links;
  if (socialLinks && typeof socialLinks === "object") {
    const assetPath = present((socialLinks as Record<string, unknown>).asset_path);
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
    partners,
  ] = await Promise.all([
    getLandingHeroData(),
    getLandingAnnouncements(),
    safe(getUniversityInfo(), null, "university info"),
    safe(getMainContact(), null, "main contact"),
    safe(getSchoolsList(), [], "schools"),
    safe(getProgrammesList(), [], "programmes"),
    safe(getLatestNews(), [], "latest news"),
    safe(getResearchPartners(), [], "research partners", false),
  ]);

  const contactInfo = buildContactInfo(university, contact);

  return {
    hero,
    announcements,
    contactInfo,
    socialLinks: normalizeSocialLinks(university?.social_links),
    miniQuickLinks: stablePortalLinks,
    facts: buildFacts(university, schools, programmes),
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
        href: "https://research.kisiiuniversity.ac.ke",
        action: "Explore research",
        eyebrow: "Public engagement",
        external: true,
      },
    ],
    schools: normalizeSchools(schools),
    programmesSummary: buildProgrammeSummary(programmes),
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
    serviceLinks,
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
