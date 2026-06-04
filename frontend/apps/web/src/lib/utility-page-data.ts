import {
  announcementsApi,
  contactsApi,
  documentsApi,
  eventsApi,
  faqsApi,
  type Announcement,
  type ContactDirectory,
  type Document,
  type Event,
  type FAQ,
} from "@ksu/api-client";
import type {
  PublicCard,
  PublicIconName,
  PublicPageConfig,
  PublicPageSection,
} from "@/components/public/section-page";
import { libraryFrontendUrl, researchFrontendUrl } from "@/lib/service-urls";

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

function contactCard(contact: ContactDirectory): PublicCard {
  const parts = [
    contact.email,
    contact.phone?.join(", "),
    contact.physical_address,
    contact.building,
    contact.room_number,
  ].filter(Boolean);

  return infoCard(
    contact.name,
    parts.join(" · ") || "Published contact record.",
    "handshake",
    contact.contact_type ?? "Contact",
  );
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

export async function getContactPageConfig(): Promise<PublicPageConfig> {
  const contacts = await safeList(
    contactsApi.list({
      is_main: true,
      per_page: 12,
      fields:
        "id,name,contact_type,email,phone,physical_address,building,room_number,is_main,is_public,status",
    }),
  );

  return utilityConfig({
    currentHref: "/contact",
    eyebrow: "Contact",
    title: "Contact Kisii University",
    body: "Find the main university contact channels and official service pathways for enquiries, support requests, feedback, and information requests.",
    primaryAction: {
      label: "Email the university",
      href: `mailto:${officialLinks.email}`,
      external: true,
    },
    secondaryActions: [
      {
        label: "Customer care centre",
        href: officialLinks.customerCare,
        external: true,
      },
      {
        label: "Request information",
        href: officialLinks.informationRequest,
        external: true,
      },
    ],
    sections: [
      {
        eyebrow: "Main channels",
        title: "University contact points",
        body: "Use the published contacts below for general enquiries, telephone support, postal correspondence, and service-specific follow-up.",
        columns: 3,
        cards: contacts.length
          ? contacts.map(contactCard)
          : [
              infoCard(
                "General enquiries",
                officialLinks.email,
                "handshake",
                "Email",
              ),
              infoCard("Telephone", officialLinks.phone, "handshake", "Phone"),
              infoCard(
                "Postal address",
                officialLinks.address,
                "home",
                "Address",
              ),
            ],
      },
      {
        eyebrow: "Service requests",
        title: "Use the right service channel",
        body: "The digital customer-care channels support tickets, complaints, compliments, suggestions, and information requests.",
        tone: "dark",
        columns: 3,
        cards: [
          externalCard(
            "Raise a ticket",
            officialLinks.createTicket,
            "Open a support request through the official digital portal.",
            "clipboard",
          ),
          externalCard(
            "Raise a complaint",
            officialLinks.complaint,
            "Submit a complaint through the official feedback channel.",
            "megaphone",
          ),
          externalCard(
            "Request information",
            officialLinks.informationRequest,
            "Ask for public information through the official request workflow.",
            "file",
          ),
        ],
      },
    ],
  });
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

export function getHelpDeskPageConfig(): PublicPageConfig {
  return utilityConfig({
    currentHref: "/help-desk",
    eyebrow: "Help Desk",
    title: "Customer care and service support",
    body: "Use the official Kisii University digital service channels to raise support tickets, submit feedback, request information, and follow up on existing requests.",
    primaryAction: {
      label: "Open customer care centre",
      href: officialLinks.customerCare,
      external: true,
    },
    secondaryActions: [
      {
        label: "Raise a ticket",
        href: officialLinks.createTicket,
        external: true,
      },
      {
        label: "Request information",
        href: officialLinks.informationRequest,
        external: true,
      },
    ],
    relatedItems: [
      pageCard(
        "Contact",
        "/contact",
        "Main contact channels and service access.",
        "handshake",
      ),
      pageCard("FAQ", "/faq", "Common questions and answers.", "check"),
      pageCard(
        "Student support",
        "/campus-life/support",
        "Student wellbeing and service guidance.",
        "heart",
      ),
      pageCard(
        "Downloads",
        "/downloads",
        "Forms, brochures, notices, and documents.",
        "file",
      ),
    ],
    sections: [
      {
        eyebrow: "Requests",
        title: "Service request pathways",
        body: "Start with the pathway that matches what you need. These actions open the official digital portal used for public service requests and follow-up.",
        columns: 3,
        cards: [
          externalCard(
            "Raise a ticket",
            officialLinks.createTicket,
            "Create a support ticket for a university service issue or request.",
            "clipboard",
          ),
          externalCard(
            "Check ticket status",
            "https://digital.kisiiuniversity.ac.ke/check_your_requests/%D7%9C%D7%99%D7%A6%D7%95%D7%A8%20%D7%9B%D7%A8%D7%98%D7%99%D7%A1",
            "Follow up on an existing ticket submitted through the service portal.",
            "search",
          ),
          externalCard(
            "Request information",
            officialLinks.informationRequest,
            "Submit a public information request through the official workflow.",
            "file",
          ),
          externalCard(
            "Follow up information request",
            officialLinks.followInformationRequest,
            "Track a previously submitted information request.",
            "check",
          ),
          externalCard(
            "Monitor feedback status",
            officialLinks.feedbackStatus,
            "Check the status of feedback submitted through the digital portal.",
            "search",
          ),
          pageCard(
            "General contact",
            "/contact",
            "Use the contact page for email, phone, postal address, and office contacts.",
            "handshake",
          ),
        ],
      },
      {
        eyebrow: "Feedback",
        title: "Complaints, suggestions, and compliments",
        body: "Use the dedicated feedback forms so each submission enters the correct official service workflow.",
        tone: "dark",
        columns: 3,
        cards: [
          externalCard(
            "Raise a complaint",
            officialLinks.complaint,
            "Submit a complaint through the official feedback channel.",
            "megaphone",
          ),
          externalCard(
            "Write a suggestion",
            officialLinks.suggestion,
            "Send a suggestion for university service improvement.",
            "sparkles",
          ),
          externalCard(
            "Make a compliment",
            officialLinks.compliment,
            "Recognize positive service or provide a compliment.",
            "check",
          ),
        ],
      },
    ],
    continueItems: [
      pageCard(
        "Contact",
        "/contact",
        "Main contact channels and service access.",
        "handshake",
      ),
      pageCard("FAQ", "/faq", "Common questions and answers.", "check"),
      pageCard(
        "Student support",
        "/campus-life/support",
        "Student wellbeing and service guidance.",
        "heart",
      ),
      pageCard(
        "Downloads",
        "/downloads",
        "Public documents and forms.",
        "file",
      ),
      pageCard(
        "Accessibility",
        "/accessibility",
        "Access and inclusive service guidance.",
        "shield",
      ),
      pageCard(
        "Sitemap",
        "/sitemap",
        "Browse public website sections.",
        "search",
      ),
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

export function getPrivacyPageConfig(): PublicPageConfig {
  return utilityConfig({
    currentHref: "/privacy",
    eyebrow: "Privacy",
    title: "Data privacy statement",
    body: "Kisii University handles personal information responsibly for teaching, research, administration, service delivery, security, and public engagement.",
    primaryAction: { label: "Contact the university", href: "/contact" },
    secondaryActions: [
      { label: "Service charter", href: "/about/service-charter" },
    ],
    sections: [
      {
        eyebrow: "Data handling",
        title: "How public website information is handled",
        body: "This page provides a public access point for data privacy guidance while the formal policy record is maintained through official university governance and service channels. Optional website analytics use a random session ID and basic page context, and can be declined or changed from the footer analytics preferences control.",
        variant: "article",
        cards: [
          infoCard("Purpose", "Service delivery and communication", "check"),
          infoCard("Access", "Use official channels for requests", "handshake"),
          infoCard(
            "Governance",
            "Aligned to institutional accountability",
            "shield",
          ),
        ],
      },
      {
        eyebrow: "Related records",
        title: "Privacy-adjacent public information",
        body: "Use these routes for service commitments, official contacts, and information requests.",
        columns: 3,
        cards: [
          pageCard(
            "Service charter",
            "/about/service-charter",
            "Public service commitments and accountability.",
            "clipboard",
          ),
          pageCard(
            "Contact",
            "/contact",
            "Ask for privacy or information support through official channels.",
            "handshake",
          ),
          externalCard(
            "Request information",
            officialLinks.informationRequest,
            "Submit an information request through the digital portal.",
            "file",
          ),
        ],
      },
    ],
  });
}

export function getTermsPageConfig(): PublicPageConfig {
  return utilityConfig({
    currentHref: "/terms",
    eyebrow: "Terms",
    title: "Website terms of use",
    body: "Use this website as an official public information service. Where a process is hosted in an external university system, follow the instructions shown in that system.",
    sections: [
      {
        eyebrow: "Use",
        title: "Public website use guidance",
        body: "Information is provided for public reference and may link to official application, procurement, research, library, or service portals. Users should verify time-sensitive notices, deadlines, and forms through the linked official records.",
        variant: "article",
        cards: [
          infoCard("Accuracy", "Use current official records", "check"),
          infoCard(
            "External systems",
            "Follow linked portal instructions",
            "compass",
          ),
          infoCard("Support", "Use official contact channels", "handshake"),
        ],
      },
    ],
  });
}

export function getAccessibilityPageConfig(): PublicPageConfig {
  return utilityConfig({
    currentHref: "/accessibility",
    eyebrow: "Accessibility",
    title: "Accessibility and inclusive access",
    body: "Kisii University provides public information and service access for diverse users, including students, staff, visitors, partners, and applicants.",
    primaryAction: { label: "Contact support", href: "/contact" },
    sections: [
      {
        eyebrow: "Access",
        title: "Inclusive public services",
        body: "Use the official support channels for accessibility requests, reasonable accommodation guidance, or help accessing university information.",
        columns: 3,
        cards: [
          pageCard(
            "Student support",
            "/campus-life/support",
            "Wellbeing, health, accessibility, and support information.",
            "heart",
          ),
          pageCard(
            "Contact",
            "/contact",
            "Request help with access to public information.",
            "handshake",
          ),
          externalCard(
            "Customer care centre",
            officialLinks.customerCare,
            "Open the official support portal.",
            "clipboard",
          ),
        ],
      },
    ],
  });
}

export function getVisitorsPageConfig(): PublicPageConfig {
  return utilityConfig({
    currentHref: "/visitors",
    eyebrow: "Visitors",
    title: "Visitor information",
    body: "Use this page to find public information routes for visiting Kisii University, contacting offices, exploring schools, and accessing services.",
    primaryAction: { label: "Contact the university", href: "/contact" },
    sections: [
      {
        eyebrow: "Plan a visit",
        title: "Useful visitor routes",
        body: "Visitors can use these public pathways to understand the university, academic structure, services, events, and support channels.",
        columns: 3,
        cards: [
          pageCard(
            "About Kisii University",
            "/about",
            "Institutional overview, history, mission, and leadership.",
            "landmark",
          ),
          pageCard(
            "Campus life",
            "/campus-life",
            "Student experience, sports, accommodation, clubs, and support.",
            "heart",
          ),
          pageCard(
            "Events",
            "/events",
            "Public events, conferences, and university calendar records.",
            "calendar",
          ),
          pageCard(
            "Schools",
            "/academics/schools",
            "Academic schools, departments, programmes, and contacts.",
            "building",
          ),
          pageCard(
            "Contact",
            "/contact",
            "Main contact details and support request options.",
            "handshake",
          ),
          externalCard(
            "Student/staff portal",
            officialLinks.studentPortal,
            "Open the official portal for authenticated services.",
            "user",
          ),
        ],
      },
    ],
  });
}

export function getSitemapPageConfig(): PublicPageConfig {
  return utilityConfig({
    currentHref: "/sitemap",
    eyebrow: "Sitemap",
    title: "Website sitemap",
    body: "Browse the main public areas of the Kisii University website and the utility pages added for public service access.",
    primaryAction: { label: "Search website", href: "/search" },
    sections: [
      {
        eyebrow: "Main site",
        title: "Primary public sections",
        body: "Core public pages and section entry points.",
        columns: 4,
        cards: [
          pageCard("Home", "/", "Main landing page.", "home"),
          pageCard("About", "/about", "Institutional information.", "landmark"),
          pageCard(
            "Admissions",
            "/admissions",
            "Application pathways and intakes.",
            "graduation",
          ),
          pageCard(
            "Academics",
            "/academics",
            "Schools, departments, and programmes.",
            "book",
          ),
          pageCard(
            "Administration",
            "/administration",
            "Divisions and administrative units.",
            "building",
          ),
          pageCard(
            "Campus Life",
            "/campus-life",
            "Student experience and support.",
            "heart",
          ),
          pageCard("News", "/news", "University news records.", "news"),
          pageCard("Events", "/events", "Public event records.", "calendar"),
        ],
      },
      {
        eyebrow: "Utilities",
        title: "Public utility routes",
        body: "Service, legal, and navigation pages.",
        tone: "dark",
        columns: 4,
        cards: utilityNav.filter((item) => item.href !== "/sitemap"),
      },
    ],
  });
}

export async function getCareersPageConfig(): Promise<PublicPageConfig> {
  const notices = await safeList(
    announcementsApi.list({
      is_published: true,
      search: "career job vacancy advert",
      per_page: 6,
      fields:
        "id,title,slug,summary,plain_text,rich_text,content,published_at,priority,audience",
    }),
  );

  return utilityConfig({
    currentHref: "/careers",
    eyebrow: "Careers",
    title: "Careers and job adverts",
    body: "Open job adverts and career-related notices. Formal applications are handled through the official digital job portal.",
    primaryAction: {
      label: "Open job portal",
      href: officialLinks.careers,
      external: true,
    },
    secondaryActions: [{ label: "Contact HR", href: "/contact" }],
    sections: [
      {
        eyebrow: "Current notices",
        title: "Career-related public notices",
        body: notices.length
          ? "These notices are loaded from published announcement records."
          : "No career notices were returned. Use the official job portal for current adverts.",
        columns: 3,
        cards: notices.length
          ? notices.map(announcementCard)
          : [
              externalCard(
                "Open job adverts",
                officialLinks.careers,
                "View current open adverts on the official job portal.",
                "users",
              ),
              pageCard(
                "Contact",
                "/contact",
                "Ask for HR or recruitment support through official channels.",
                "handshake",
              ),
            ],
      },
    ],
  });
}

export async function getTendersPageConfig(): Promise<PublicPageConfig> {
  const notices = await safeList(
    announcementsApi.list({
      is_published: true,
      search: "tender procurement supplier prequalification",
      per_page: 6,
      fields:
        "id,title,slug,summary,plain_text,rich_text,content,published_at,priority,audience",
    }),
  );

  return utilityConfig({
    currentHref: "/tenders",
    eyebrow: "Tenders",
    title: "Tenders and procurement notices",
    body: "Access procurement notices, supplier opportunities, and tender-related public information through official university channels.",
    primaryAction: {
      label: "Open tenders portal",
      href: officialLinks.tenders,
      external: true,
    },
    secondaryActions: [{ label: "Downloads", href: "/downloads" }],
    sections: [
      {
        eyebrow: "Procurement",
        title: "Tender-related notices",
        body: notices.length
          ? "These notices are loaded from published announcement records."
          : "No tender notices were returned. Use the official procurement portal for current tender opportunities.",
        columns: 3,
        cards: notices.length
          ? notices.map(announcementCard)
          : [
              externalCard(
                "Tenders portal",
                officialLinks.tenders,
                "Open current tenders and procurement notices.",
                "clipboard",
              ),
              pageCard(
                "Downloads",
                "/downloads",
                "Find public documents and forms.",
                "file",
              ),
            ],
      },
    ],
  });
}

export async function getConferencesPageConfig(): Promise<PublicPageConfig> {
  const events = await safeList(
    eventsApi.list({
      is_published: true,
      search: "conference",
      per_page: 9,
      fields:
        "id,title,slug,summary,plain_text,rich_text,content,start_date,venue,location,is_virtual",
    }),
  );

  return utilityConfig({
    currentHref: "/conferences",
    eyebrow: "Conferences",
    title: "Conferences and calls",
    body: "Find conference events, calls for papers, registration links, and multidisciplinary engagement opportunities.",
    primaryAction: {
      label: "Open conference portal",
      href: officialLinks.conferences,
      external: true,
    },
    secondaryActions: [
      { label: "Events", href: "/media/events" },
      { label: "Research", href: officialLinks.research, external: true },
    ],
    sections: [
      {
        eyebrow: "Conference records",
        title: "Published conference events",
        body: events.length
          ? "These records are loaded from published event data."
          : "No conference events were returned. Use the official conference portal for current calls and registration.",
        columns: 3,
        cards: events.length
          ? events.map(eventCard)
          : [
              externalCard(
                "Conference portal",
                officialLinks.conferences,
                "Open current conference calls and registration.",
                "calendar",
              ),
              pageCard(
                "Events",
                "/events",
                "Browse public university events.",
                "calendar",
              ),
              externalCard(
                "Research portal",
                officialLinks.research,
                "Open research, innovation, and partnership information.",
                "search",
              ),
            ],
      },
    ],
  });
}
