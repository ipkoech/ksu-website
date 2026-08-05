import {
  announcementsApi,
  contactDirectoryApi,
  documentsApi,
  eventsApi,
  faqsApi,
  type Announcement,
  type Campus,
  type Document,
  type Event,
  type FAQ,
  type PublicContactDirectory,
  type PublicContactDirectoryEntry,
  type PublicContactFAQ,
  type PublicUniversityContactSummary,
} from "@ksu/api-client";
import type {
  PublicCard,
  PublicIconName,
  PublicPageConfig,
  PublicPageSection,
} from "@/components/public/section-page";
import { libraryFrontendUrl, researchFrontendUrl } from "@/lib/service-urls";
import { publicFileUrl } from "@/lib/public-media";

type ListEnvelope<T> = { data?: T[] };

const utilityNav = [
  pageCard(
    "Contact",
    "/contact",
    "Main contact channels and service access.",
    "handshake",
  ),
  pageCard(
    "Help Desk",
    "/help-desk",
    "Tickets, feedback, and information requests.",
    "clipboard",
  ),
  pageCard("FAQ", "/faq", "Common questions and answers.", "check"),
  pageCard(
    "Downloads",
    "/downloads",
    "Public forms, brochures, notices, and documents.",
    "file",
  ),
  pageCard(
    "Visitors",
    "/visitors",
    "Guidance for guests, partners, and prospective visitors.",
    "compass",
  ),
  pageCard(
    "Careers",
    "/careers",
    "Open job adverts and application guidance.",
    "users",
  ),
  pageCard(
    "Tenders",
    "/tenders",
    "Procurement notices and supplier opportunities.",
    "clipboard",
  ),
  pageCard(
    "Conferences",
    "/conferences",
    "Conference calls, registration, and events.",
    "calendar",
  ),
  pageCard(
    "Accessibility",
    "/accessibility",
    "Access and inclusive service guidance.",
    "shield",
  ),
  pageCard(
    "Privacy",
    "/privacy",
    "Data privacy and responsible information handling.",
    "shield",
  ),
  pageCard("Terms", "/terms", "Website terms and public use guidance.", "file"),
  pageCard(
    "Sitemap",
    "/sitemap",
    "Directory of key public website sections.",
    "search",
  ),
] satisfies PublicCard[];

const officialLinks = {
  phone: "+254720875082",
  email: "info@kisiiuniversity.ac.ke",
  address: "P.O. Box 408-40200, Kisii, Kenya",
  digital: "https://digital.kisiiuniversity.ac.ke",
  studentPortal: "https://portal.kisiiuniversity.ac.ke",
  elearning: "https://elearning.kisiiuniversity.ac.ke",
  careers: "https://digital.kisiiuniversity.ac.ke/job_portal/open_adverts",
  tenders: "https://digital.kisiiuniversity.ac.ke/procurement_portal/tenders",
  conferences: "https://digital.kisiiuniversity.ac.ke/conferences",
  customerCare:
    "https://digital.kisiiuniversity.ac.ke/ksu_customer_care_center",
  createTicket: "https://digital.kisiiuniversity.ac.ke/create_ticket",
  informationRequest:
    "https://digital.kisiiuniversity.ac.ke/create_request_for_information",
  followInformationRequest:
    "https://digital.kisiiuniversity.ac.ke/follow_up_your_request_for_information",
  feedbackStatus:
    "https://digital.kisiiuniversity.ac.ke/ksu_feedback_check_status_center",
  complaint:
    "https://digital.kisiiuniversity.ac.ke/ksu_feedback_general_cat/complain",
  suggestion:
    "https://digital.kisiiuniversity.ac.ke/ksu_feedback_general_cat/suggestion",
  compliment:
    "https://digital.kisiiuniversity.ac.ke/ksu_feedback_general_cat/compliment",
  library: libraryFrontendUrl,
  research: researchFrontendUrl,
  myloft:
    "https://app.myloft.xyz/user/login?institute=cl4pou55huc740960l7k1mftg",
  catalogue: libraryFrontendUrl,
  repository: "http://repository.kisiiuniversity.ac.ke:8080/xmlui/",
  turnitin: "https://www.turnitinuk.com/login_page.asp",
};

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
  action = "Open external service",
): PublicCard {
  return pageCard(title, href, body, icon, action, true);
}

function stripHtml(value?: string | null) {
  return (value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shortText(
  value: string | null | undefined,
  fallback: string,
  max = 180,
) {
  const text = stripHtml(value) || fallback;
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
}

function formatDate(value?: string | null) {
  if (!value) return "Current notice";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

async function safeList<T>(request: Promise<ListEnvelope<T>>): Promise<T[]> {
  try {
    const response = await request;
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Failed to fetch utility page data:", error);
    return [];
  }
}

export type ContactPageFilters = {
  q?: string;
  contactType?: string;
  scopeType?: string;
  page: number;
};

export type ContactSocialLink = {
  platform: string;
  label: string;
  href: string;
};

export type ContactServiceChannel = {
  title: string;
  body: string;
  href: string;
  icon: "ticket" | "complaint" | "compliment" | "suggestion" | "information";
};

export type ContactPageConfig = {
  breadcrumb: { label: string; href?: string }[];
  title: string;
  body: string;
  heroImageUrl: string;
  institution: PublicUniversityContactSummary | null;
  email: string;
  phone: string;
  alternatePhone: string | null;
  postalAddress: string;
  physicalAddress: string | null;
  mainContacts: PublicContactDirectoryEntry[];
  contacts: PublicContactDirectoryEntry[];
  contactsMeta: PublicContactDirectory["contacts"]["meta"];
  campuses: Campus[];
  faqs: PublicContactFAQ[];
  socialLinks: ContactSocialLink[];
  serviceChannels: ContactServiceChannel[];
  filters: ContactPageFilters;
};

const socialPlatformAliases: Record<string, { platform: string; label: string }> = {
  facebook: { platform: "facebook", label: "Facebook" },
  fb: { platform: "facebook", label: "Facebook" },
  twitter: { platform: "x", label: "X / Twitter" },
  x: { platform: "x", label: "X / Twitter" },
  instagram: { platform: "instagram", label: "Instagram" },
  ig: { platform: "instagram", label: "Instagram" },
  linkedin: { platform: "linkedin", label: "LinkedIn" },
  youtube: { platform: "youtube", label: "YouTube" },
  tiktok: { platform: "tiktok", label: "TikTok" },
  website: { platform: "website", label: "Website" },
};

function socialLinkValue(value: unknown) {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  return typeof record.url === "string"
    ? record.url
    : typeof record.href === "string"
      ? record.href
      : null;
}

function normalizeSocialLinks(value?: Record<string, unknown> | null) {
  const links: ContactSocialLink[] = [];
  const seen = new Set<string>();

  for (const [rawPlatform, rawValue] of Object.entries(value ?? {})) {
    const href = socialLinkValue(rawValue)?.trim();
    const alias = socialPlatformAliases[rawPlatform.trim().toLowerCase()];
    if (!href || !alias) continue;

    try {
      const url = new URL(href);
      if (url.protocol !== "https:" && url.protocol !== "http:") continue;
      const normalizedHref = url.toString();
      if (seen.has(normalizedHref)) continue;
      seen.add(normalizedHref);
      links.push({ ...alias, href: normalizedHref });
    } catch {
      // Managed social links are optional; malformed values are not rendered.
    }
  }

  return links;
}

async function getPublicContactDirectory(
  filters: ContactPageFilters,
): Promise<PublicContactDirectory | null> {
  try {
    const response = await contactDirectoryApi.get({
      q: filters.q,
      contact_type: filters.contactType,
      scope_type: filters.scopeType,
      page: filters.page,
      per_page: 12,
    });
    return response.data ?? null;
  } catch (error) {
    console.error("Failed to fetch public contact directory:", error);
    return null;
  }
}

function utilityConfig({
  currentHref,
  eyebrow,
  title,
  body,
  sections,
  primaryAction,
  secondaryActions,
  relatedItems,
  continueItems,
}: {
  currentHref: string;
  eyebrow: string;
  title: string;
  body: string;
  sections: PublicPageSection[];
  primaryAction?: PublicPageConfig["primaryAction"];
  secondaryActions?: PublicPageConfig["secondaryActions"];
  relatedItems?: PublicCard[];
  continueItems?: PublicCard[];
}): PublicPageConfig {
  return {
    sectionLabel: "Public information",
    currentHref,
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: "Public information", href: "/sitemap" },
      { label: eyebrow },
    ],
    navLabel: "Public information navigation",
    navItems: utilityNav
      .filter((item) => item.href !== currentHref)
      .slice(0, 8),
    eyebrow,
    title,
    body,
    primaryAction,
    secondaryActions,
    scopeCards: [
      infoCard("Access", "Official public route", "check", "Status"),
      infoCard("Records", "API-backed where available", "file", "Content"),
      infoCard(
        "Service",
        "Links to the right office or portal",
        "handshake",
        "Action",
      ),
    ],
    asideTitle: "Use official channels",
    asideBody:
      "These utility pages consolidate public service routes, institutional information, and official external systems used by Kisii University.",
    relatedTitle: "Utility pages",
    relatedItems:
      relatedItems ??
      utilityNav.filter((item) => item.href !== currentHref).slice(0, 4),
    sections,
    continueTitle: "Continue through public information",
    continueBody:
      "Use the related utility pages for service requests, official records, legal information, and website navigation.",
    continueItems:
      continueItems ??
      utilityNav.filter((item) => item.href !== currentHref).slice(0, 6),
  };
}

function faqCard(faq: FAQ): PublicCard {
  return infoCard(
    faq.question,
    shortText(
      faq.answer_plain_text ?? faq.answer_rich_text ?? faq.answer,
      "FAQ answer.",
    ),
    "check",
    faq.category ?? "FAQ",
  );
}

function documentCard(document: Document): PublicCard {
  return pageCard(
    document.title,
    `/api/files/${document.file_id}`,
    shortText(document.description, "Public document."),
    "file",
    document.category ?? document.document_type ?? "Download",
  );
}

function announcementCard(item: Announcement): PublicCard {
  return pageCard(
    item.title,
    `/media/announcements/${item.slug}`,
    shortText(
      item.summary ?? item.plain_text ?? item.rich_text ?? item.content,
      "Official notice.",
    ),
    "megaphone",
    formatDate(item.published_at),
  );
}

function eventCard(item: Event): PublicCard {
  return pageCard(
    item.title,
    `/media/events/${item.slug}`,
    shortText(
      item.summary ?? item.plain_text ?? item.rich_text ?? item.content,
      "Conference or event record.",
    ),
    "calendar",
    formatDate(item.start_date),
  );
}

export async function getContactPageConfig(
  filters: ContactPageFilters,
): Promise<ContactPageConfig> {
  const directory = await getPublicContactDirectory(filters);
  const institution = directory?.institution;
  const email = institution?.email ?? officialLinks.email;
  const phone = institution?.phone ?? officialLinks.phone;
  const postalAddress = institution?.postal_address ?? officialLinks.address;

  return {
    breadcrumb: [{ label: "Home", href: "/" }, { label: "Contact" }],
    title: "Contact Kisii University",
    body: "Find the main university contact channels and official service pathways for enquiries, support requests, feedback, and information requests.",
    heroImageUrl:
      publicFileUrl(institution?.cover_image_id) ??
      "/images/about/about-overview.webp",
    institution: institution ?? null,
    email,
    phone,
    alternatePhone: institution?.alternate_phone ?? null,
    postalAddress,
    physicalAddress: institution?.physical_address ?? null,
    mainContacts: directory?.main_contacts ?? [],
    contacts: directory?.contacts.items ?? [],
    contactsMeta: directory?.contacts.meta ?? {
      page: filters.page,
      per_page: 12,
      total: 0,
      pages: 0,
    },
    campuses: directory?.campuses ?? [],
    faqs: directory?.faqs ?? [],
    socialLinks: normalizeSocialLinks(institution?.social_links),
    filters,
    serviceChannels: [
      {
        title: "Raise a support ticket",
        body: "Get technical or service support from the customer care team.",
        href: officialLinks.createTicket,
        icon: "ticket",
      },
      {
        title: "Submit a complaint",
        body: "Report a service issue through the official feedback channel.",
        href: officialLinks.complaint,
        icon: "complaint",
      },
      {
        title: "Send a compliment",
        body: "Recognise a team or member of staff for excellent service.",
        href: officialLinks.compliment,
        icon: "compliment",
      },
      {
        title: "Make a suggestion",
        body: "Share an idea that can help improve university services.",
        href: officialLinks.suggestion,
        icon: "suggestion",
      },
      {
        title: "Request public information",
        body: "Submit an official request under the Access to Information process.",
        href: officialLinks.informationRequest,
        icon: "information",
      },
    ],
  };
}

export async function getFaqPageConfig(): Promise<PublicPageConfig> {
  const faqs = await safeList(
    faqsApi.list({
      per_page: 24,
      fields:
        "id,question,answer,answer_plain_text,answer_rich_text,category,display_order,is_main,is_public,status",
    }),
  );

  return utilityConfig({
    currentHref: "/faq",
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    body: "Browse common public questions about admissions, student services, campus life, and university support channels.",
    primaryAction: { label: "Contact support", href: "/contact" },
    secondaryActions: [
      {
        label: "Customer care centre",
        href: officialLinks.customerCare,
        external: true,
      },
    ],
    sections: [
      {
        eyebrow: "Questions",
        title: "Published FAQs",
        body: faqs.length
          ? "These questions are loaded from the public FAQ records."
          : "No public FAQ records were returned. Use the official support channels for current assistance.",
        columns: 2,
        cards: faqs.length
          ? faqs.map(faqCard)
          : [
              externalCard(
                "Customer care centre",
                officialLinks.customerCare,
                "Open the official service centre.",
                "handshake",
              ),
              externalCard(
                "Request information",
                officialLinks.informationRequest,
                "Ask for information through the official portal.",
                "file",
              ),
            ],
      },
    ],
  });
}

export async function getDownloadsPageConfig(): Promise<PublicPageConfig> {
  const documents = await safeList(
    documentsApi.list({
      per_page: 24,
      fields:
        "id,title,slug,document_type,category,description,file_id,is_public,requires_login,download_count,is_active,display_order",
    }),
  );

  return utilityConfig({
    currentHref: "/downloads",
    eyebrow: "Downloads",
    title: "Public downloads",
    body: "Access public forms, brochures, booklets, notices, and documents published for students, applicants, staff, suppliers, and visitors.",
    primaryAction: { label: "Search website", href: "/search" },
    secondaryActions: [
      { label: "Admissions", href: "/admissions" },
      { label: "A-Z index", href: "/az-index" },
    ],
    sections: [
      {
        eyebrow: "Documents",
        title: "Published document records",
        body: documents.length
          ? "These downloads are loaded from public document records."
          : "No public document records were returned. Use the key official resources below while the downloads index is populated.",
        columns: 3,
        cards: documents.length
          ? documents.map(documentCard)
          : [
              pageCard(
                "Admissions brochure and forms",
                "/admissions",
                "Application forms, brochures, intakes, and admission guidance.",
                "graduation",
              ),
              pageCard(
                "School downloads",
                "/academics/schools",
                "School-level documents appear on school download pages.",
                "building",
              ),
              pageCard(
                "Department downloads",
                "/administration/units",
                "Administrative forms and notices appear on unit pages.",
                "file",
              ),
            ],
      },
      {
        eyebrow: "External resources",
        title: "Library and academic resource access",
        body: "Some resources are operated through official external systems.",
        tone: "dark",
        columns: 4,
        cards: [
          externalCard(
            "Library website",
            officialLinks.library,
            "Open library services and support.",
            "library",
          ),
          externalCard(
            "MyLoft e-resources",
            officialLinks.myloft,
            "Access subscribed electronic resources.",
            "book",
          ),
          externalCard(
            "Institutional repository",
            officialLinks.repository,
            "Open the university repository.",
            "file",
          ),
          externalCard(
            "Turnitin",
            officialLinks.turnitin,
            "Open Turnitin access.",
            "check",
          ),
        ],
      },
    ],
  });
}
