import type {
  PublicCard,
  PublicPageConfig,
  PublicPageSection,
} from "@/components/public/section-page";
import type { AdmissionsPageData } from "@/lib/get-admissions";

function titleFromSlug(slug?: string) {
  if (!slug) return "Published record";

  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function pageCard(
  title: string,
  href: string,
  body: string,
  icon: PublicCard["icon"] = "file",
  action = "Open page",
): PublicCard {
  return { title, href, body, icon, action };
}

function externalCard(
  title: string,
  href: string,
  body: string,
  icon: PublicCard["icon"] = "file",
  action = "Open official page",
): PublicCard {
  return { title, href, body, icon, action, external: true };
}

function infoCard(
  title: string,
  body: string,
  icon: PublicCard["icon"] = "file",
  eyebrow?: string,
): PublicCard {
  return { title, body, icon, eyebrow };
}

const administrationNav = [
  pageCard(
    "Administration",
    "/administration",
    "Administrative structure and public service context.",
    "landmark",
  ),
  pageCard(
    "Divisions",
    "/administration/divisions",
    "Senior administrative divisions and responsibilities.",
    "building",
  ),
  pageCard(
    "Administrative Units",
    "/administration/units",
    "Offices and units supporting university operations.",
    "users",
  ),
  pageCard(
    "Organization",
    "/administration/organization",
    "A public structure view of reporting relationships.",
    "shield",
  ),
];

const admissionsNav = [
  pageCard(
    "Admissions",
    "/admissions",
    "Admissions pathways and application guidance.",
    "graduation",
  ),
  pageCard(
    "Undergraduate",
    "/admissions/undergraduate",
    "Undergraduate entry routes and preparation.",
    "book",
  ),
  pageCard(
    "Postgraduate",
    "/admissions/postgraduate",
    "Postgraduate study pathways and records.",
    "library",
  ),
  pageCard(
    "International",
    "/admissions/international",
    "Guidance for international applicants.",
    "compass",
  ),
  pageCard(
    "Requirements",
    "/admissions/requirements",
    "Entry requirements and document guidance.",
    "clipboard",
  ),
  pageCard(
    "Fees",
    "/admissions/fees",
    "Fee information access with official fee references.",
    "file",
  ),
  pageCard(
    "Scholarships",
    "/admissions/scholarships",
    "Financial aid and support references.",
    "sparkles",
  ),
  pageCard(
    "How to Apply",
    "/admissions/how-to-apply",
    "Step-by-step public application guidance.",
    "check",
  ),
  pageCard(
    "Current Intakes",
    "/admissions/intakes",
    "Intake records .",
    "calendar",
  ),
];

const academicsNav = [
  pageCard(
    "Academics",
    "/academics",
    "Schools, programmes, and academic resources.",
    "graduation",
  ),
  pageCard(
    "Schools",
    "/academics/schools",
    "Academic schools and school-level records.",
    "building",
  ),
  pageCard(
    "Programmes",
    "/academics/programmes",
    "Programme finder and programme records.",
    "book",
  ),
  pageCard(
    "Academic Calendar",
    "/academics/calendar",
    "Academic calendar reference page.",
    "calendar",
  ),
  pageCard(
    "Examinations",
    "/academics/examinations",
    "Exam information and public records.",
    "clipboard",
  ),
];

const campusNav = [
  pageCard(
    "Campus Life",
    "/campus-life",
    "Student experience and campus resources.",
    "heart",
  ),
  pageCard(
    "Student Life",
    "/campus-life/student-life",
    "Student experience overview.",
    "users",
  ),
  pageCard(
    "Clubs & Societies",
    "/campus-life/clubs",
    "Club records and student community pathways.",
    "sparkles",
  ),
  pageCard(
    "Sports & Recreation",
    "/campus-life/sports",
    "Sports participation and recreation references.",
    "trophy",
  ),
  pageCard(
    "Accommodation",
    "/campus-life/accommodation",
    "Housing guidance and accommodation pathways.",
    "home",
  ),
  pageCard(
    "Student Support",
    "/campus-life/support",
    "Support services and student wellbeing pathways.",
    "handshake",
  ),
  pageCard(
    "Gallery",
    "/campus-life/gallery",
    "Photo, video, arts, and culture highlights.",
    "file",
  ),
];

const newsNav = [
  pageCard("News", "/news", "University news records.", "news"),
  pageCard("Events", "/events", "Event records and calendar context.", "calendar"),
  pageCard(
    "Announcements",
    "/announcements",
    "Official public announcements and notices.",
    "megaphone",
  ),
];

const toolbarUtilityNav = [
  pageCard("Staff Portal", "/m/staff", "Staff tools and public staff resources.", "user"),
  pageCard("Alumni", "/alumni", "Alumni relations and public engagement.", "users"),
  pageCard("A-Z Index", "/az-index", "Alphabetical access to public website sections.", "search"),
  pageCard("Search", "/search", "Search entry point for public website content.", "search"),
];

const publicInfoScope = [
  infoCard("Overview", "Key public information", "file", "Section"),
  infoCard("Records", "Current entries and links", "check", "Content"),
  infoCard("Actions", "Useful next steps", "shield", "Navigation"),
];

function siteConfig({
  currentHref,
  sectionLabel,
  navItems,
  eyebrow,
  title,
  body,
  sections,
  relatedItems,
  primaryAction,
  secondaryActions,
  asideBody,
  continueItems,
}: {
  currentHref: string;
  sectionLabel: string;
  navItems: PublicCard[];
  eyebrow: string;
  title: string;
  body: string;
  sections: PublicPageSection[];
  relatedItems?: PublicCard[];
  primaryAction?: PublicPageConfig["primaryAction"];
  secondaryActions?: PublicPageConfig["secondaryActions"];
  asideBody: string;
  continueItems?: PublicCard[];
}): PublicPageConfig {
  return {
    sectionLabel,
    currentHref,
    breadcrumb: [
      { label: "Home", href: "/" },
      { label: sectionLabel, href: navItems[0]?.href },
      { label: eyebrow },
    ],
    navLabel: `${sectionLabel} section navigation`,
    navItems: navItems.filter((item) => item.href !== currentHref),
    eyebrow,
    title,
    body,
    primaryAction,
    secondaryActions,
    scopeCards: publicInfoScope,
    asideTitle: "Explore this section",
    asideBody,
    relatedTitle: "Related pages",
    relatedItems: relatedItems ?? navItems.filter((item) => item.href !== currentHref),
    sections,
    continueTitle: `Continue through ${sectionLabel}`,
    continueBody:
      "Use the related public pathways to move through this section without leaving the frontend shell.",
    continueItems: continueItems ?? navItems.filter((item) => item.href !== currentHref),
  };
}

const adminUnits = [
  "Finance Office",
  "Human Resources",
  "Information Communication and Technology",
  "Planning",
  "Medical Services",
  "Internal Audit",
  "Legal",
  "Procurement and Supplies",
  "Corporate Communication",
  "Student Affairs",
];

function administrationSections(kind: string, label?: string): PublicPageSection[] {
  const unitCards = adminUnits.map((unit) =>
    pageCard(
      unit,
      `/administration/units/${unit.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
      `${unit} supports university operations through public service, administration, and institutional coordination.`,
      "building",
      "View unit",
    ),
  );

  if (kind === "organization") {
    return [
      {
        eyebrow: "Organization Structure",
        title: "Public structure and reporting responsibilities",
        body: "The organization page explains how executive offices, divisions, and administrative units relate to university service delivery.",
        columns: 3,
        cards: [
          infoCard("Office of the Vice Chancellor", "Executive leadership and public representation.", "user"),
          infoCard("Administrative Divisions", "Academic, research, student affairs, administration, planning, and finance portfolios.", "building"),
          infoCard("Administrative Units", "Functional units that support day-to-day university services.", "users"),
        ],
      },
      {
        eyebrow: "Related Administration",
        title: "Move from structure into detail pages",
        body: "The structure page links to divisions, units, and directorates for responsibilities, services, and public contacts.",
        tone: "dark",
        columns: 3,
        cards: administrationNav.slice(1),
      },
    ];
  }

  if (kind === "unit-detail") {
    return [
      {
        eyebrow: "Unit Overview",
        title: `${label} public information`,
        body: "Unit pages bring together the office overview, team, services, downloads, notices, and contact pathways.",
        columns: 3,
        cards: [
          pageCard("About", `/administration/units/${label?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, "Public description and reporting context.", "file", "Open overview"),
          pageCard("Team", `/administration/units/${label?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/team`, "Staff and office roles associated with this unit.", "users", "View team"),
          pageCard("Services", `/administration/units/${label?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/services`, "Public services, procedures, and support responsibilities.", "clipboard", "View services"),
          pageCard("News", `/administration/units/${label?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/news`, "Updates, notices, and communications from this unit.", "news", "View news"),
          pageCard("Downloads", `/administration/units/${label?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/downloads`, "Downloads and forms appear when attached to the unit.", "file", "View downloads"),
          pageCard("Contact", `/administration/units/${label?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/contact`, "Office contact channels and visitor guidance.", "handshake", "View contact"),
        ],
      },
    ];
  }

  return [
    {
      eyebrow: "Administrative Framework",
      title: "Divisions, units, and public service pathways",
      body: "Administration pages use the public structure seeded into the About data and avoid unsupported service desks or contact details.",
      columns: 3,
      cards: [
        pageCard("Division of Academic, Research & Student Affairs", "/administration/divisions/academic-research-student-affairs", "Academic affairs, research, e-learning, and student-facing university functions.", "graduation", "View division"),
        pageCard("Division of Administration, Planning & Finance", "/administration/divisions/administration-planning-finance", "Administration, planning, finance, ICT, procurement, and support services.", "building", "View division"),
        pageCard("Office of the Vice Chancellor", "/about/university-management", "Executive leadership context remains available through the leadership route.", "user", "View leadership"),
      ],
    },
    {
      eyebrow: "Administrative Units",
      title: "Administrative unit directory",
      body: "Unit cards summarize administrative functions and link to their public information pages.",
      columns: 4,
      cards: kind === "units" ? unitCards : unitCards.slice(0, 8),
    },
    {
      eyebrow: "Public Service Context",
      title: "Administration connects to service accountability",
      body: "Service commitments and accountability remain tied to the published service charter.",
      tone: "dark",
      columns: 3,
      cards: [
        pageCard("Our Service Charter", "/about/service-charter", "Open the public service charter access point.", "clipboard", "Open charter"),
        pageCard("Quality Assurance", "/about/quality-assurance", "Review quality, standards, and accountability references.", "shield", "View quality"),
        pageCard("Governance", "/about/governance", "Review public oversight and governance bodies.", "landmark", "View governance"),
      ],
    },
  ];
}

export function getAdministrationPage(segments: string[] = []): PublicPageConfig {
  const currentHref = `/administration${segments.length ? `/${segments.join("/")}` : ""}`;
  const [area, slug, subpage] = segments;
  const recordTitle = titleFromSlug(slug);
  const title =
    area === "divisions" && slug
      ? `${recordTitle} division`
      : area === "units" && slug
        ? `${recordTitle} administrative unit`
        : area === "directorates" && slug
          ? `${recordTitle} directorate`
          : area === "organization"
            ? "University administrative structure"
            : area === "divisions"
              ? "Administrative divisions"
              : area === "units"
                ? "Administrative units"
                : area === "directorates"
                  ? "Directorates and specialized functions"
                  : "University administration";
  const body =
    subpage === "team" || subpage === "staff"
      ? "Staff and office roles associated with this administrative unit."
      : subpage === "services"
        ? "Services, procedures, and support responsibilities for this administrative unit."
        : subpage === "downloads" || subpage === "documents"
          ? "Downloads and forms appear here when attached to the public unit record."
          : subpage === "news"
            ? "Updates, notices, and communications connected to this administrative unit."
            : subpage === "contact"
              ? "Contact details appear here when the public unit record provides them."
          : "Kisii University's administration pages organize divisions, units, directorates, and service pathways for public reference.";

  return siteConfig({
    currentHref,
    sectionLabel: "Administration",
    navItems: administrationNav,
    eyebrow: area ? titleFromSlug(area) : "Administration",
    title,
    body,
    primaryAction: { label: "View Divisions", href: "/administration/divisions" },
    secondaryActions: [
      { label: "Administrative Units", href: "/administration/units" },
      { label: "Organization Structure", href: "/administration/organization" },
    ],
    asideBody:
      "Use this section to move between university divisions, administrative units, directorates, service information, and governance context.",
    sections:
      area === "organization"
        ? administrationSections("organization")
        : area === "units" && slug
          ? administrationSections("unit-detail", recordTitle)
          : administrationSections(area === "units" ? "units" : "default"),
  });
}

const officialAdmissionsLinks = {
  overview: "https://kisiiuniversity.ac.ke/admission",
  howToApply: "https://kisiiuniversity.ac.ke/admission/how-to-apply",
  onlineApplication: "https://digital.kisiiuniversity.ac.ke/new_student_landing_page",
  admissionCenter: "https://digital.kisiiuniversity.ac.ke/students/admissions/center",
  undergraduate: "https://kisiiuniversity.ac.ke/admission/undergraduate-application",
  postgraduate: "https://kisiiuniversity.ac.ke/admission/postgraduate-education",
  international: "https://kisiiuniversity.ac.ke/admission/international-students",
  diploma: "https://kisiiuniversity.ac.ke/admission/diploma-application",
  certificate: "https://kisiiuniversity.ac.ke/admission/certificatebridging-application",
  brochurePage: "https://kisiiuniversity.ac.ke/admission/kisii-university-2025-brochure",
  brochurePdf:
    "https://kisiiuniversity.ac.ke/storage/public/downloads//KISII%20UNIVERSITY%20COURSE%20BROCHURE.pdf",
  undergraduateForm:
    "https://kisiiuniversity.ac.ke/storage/public/downloads//APPLICATION%20FORM%20FOR%20UNDERGRADUATE.pdf",
  kuccps: "https://kuccps.net/",
  contact: "https://kisiiuniversity.ac.ke/index.php/contact",
  campusLife: "https://kisiiuniversity.ac.ke/campus-life",
  schoolsDepartments: "https://kisiiuniversity.ac.ke/schools_departments",
  about: "https://kisiiuniversity.ac.ke/index.php/about_us",
} as const;

function parseAdmissionDate(value?: string | null) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatAdmissionDate(value?: string | null) {
  const date = parseAdmissionDate(value);
  if (!date) return value ?? "date to be confirmed";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function isPastAdmissionDate(value?: string | null) {
  const date = parseAdmissionDate(value);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function cardText(text: string | null | undefined, fallback: string) {
  const value = (text || fallback).trim();
  return value.length > 220 ? `${value.slice(0, 217)}...` : value;
}

function admissionInfoHref(contentType: string, slug: string) {
  if (contentType === "how_to_apply") return "/admissions/how-to-apply";
  if (contentType === "international_students") return "/admissions/international";
  if (contentType === "brochure") return officialAdmissionsLinks.brochurePage;
  if (contentType === "booklet") return officialAdmissionsLinks.overview;
  if (contentType === "graduation") return "/academics";
  return `/admissions/${slug}`;
}

function admissionInfoCards(
  data: AdmissionsPageData | undefined,
  predicate?: (contentType: string) => boolean,
) {
  return (data?.admissionInfo ?? [])
    .filter((item) => (predicate ? predicate(item.contentType) : true))
    .slice(0, 6)
    .map((item) => {
      const href = item.externalUrl || admissionInfoHref(item.contentType, item.slug);
      const external =
        Boolean(item.externalUrl) ||
        href.startsWith("https://") ||
        href.startsWith("http://");

      return {
        title: item.title,
        href,
        body: cardText(item.summary ?? item.content, "Admissions record."),
        icon: "file" as const,
        action: external ? "Open official page" : "Open record",
        external,
      };
    });
}

function normalizeAdmissionValue(value?: string | null) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function admissionAudienceMatches(
  item: AdmissionsPageData["admissionInfo"][number],
  levels: string[],
) {
  const normalizedLevels = levels.map(normalizeAdmissionValue);
  return (item.audienceLevels ?? []).some((level) =>
    normalizedLevels.includes(normalizeAdmissionValue(level)),
  );
}

function admissionTypeMatches(
  item: AdmissionsPageData["admissionInfo"][number],
  types: string[],
) {
  const normalizedTypes = types.map(normalizeAdmissionValue);
  return normalizedTypes.includes(normalizeAdmissionValue(item.contentType));
}

function admissionRecordsForArea(
  area: string | undefined,
  data: AdmissionsPageData | undefined,
) {
  const records = data?.admissionInfo ?? [];

  if (!area) return records;

  if (area === "how-to-apply") {
    const exact = records.filter((item) =>
      admissionTypeMatches(item, ["how_to_apply", "application"]) ||
      item.slug === "how-to-apply",
    );
    return exact.length
      ? exact
      : records.filter((item) =>
          admissionTypeMatches(item, ["application_procedure"]),
        );
  }

  if (area === "undergraduate") {
    return records.filter((item) =>
      admissionTypeMatches(item, ["undergraduate", "application_procedure"]) &&
      admissionAudienceMatches(item, ["undergraduate", "bachelors", "bachelor", "diploma", "certificate"]),
    );
  }

  if (area === "postgraduate") {
    return records.filter((item) =>
      admissionTypeMatches(item, ["postgraduate", "application_procedure"]) &&
      admissionAudienceMatches(item, ["postgraduate", "masters", "phd", "doctoral"]),
    );
  }

  if (area === "international") {
    return records.filter((item) =>
      admissionTypeMatches(item, ["international", "international_students"]) ||
      item.slug.includes("international"),
    );
  }

  if (area === "requirements") {
    return records.filter((item) =>
      admissionTypeMatches(item, ["requirements", "entry_requirements"]),
    );
  }

  if (area === "fees") {
    return records.filter((item) =>
      admissionTypeMatches(item, ["fees", "fee_structure", "fee_information"]),
    );
  }

  if (area === "scholarships") {
    return records.filter((item) =>
      admissionTypeMatches(item, ["scholarships", "financial_aid", "funding"]),
    );
  }

  return records.filter((item) => item.slug === area);
}

function admissionRecordCard(
  item: AdmissionsPageData["admissionInfo"][number],
): PublicCard {
  const href = item.externalUrl || admissionInfoHref(item.contentType, item.slug);
  const external =
    Boolean(item.externalUrl) ||
    href.startsWith("https://") ||
    href.startsWith("http://");

  return {
    title: item.title,
    href,
    body: cardText(item.summary ?? item.content, "Admissions guidance."),
    icon: "file",
    action: external ? "Open official page" : "Read guidance",
    external,
  };
}

function admissionRecordFacts(
  item: AdmissionsPageData["admissionInfo"][number],
): PublicCard[] {
  const cards: PublicCard[] = [
    infoCard(
      "Guidance type",
      item.contentType.replace(/_/g, " "),
      "clipboard",
    ),
    infoCard(
      "Audience",
      item.audienceLevels?.length ? item.audienceLevels.join(", ") : "All applicants",
      "users",
    ),
  ];

  if (item.externalUrl) {
    cards.push(
      externalCard(
        "Official action",
        item.externalUrl,
        "Open the linked admissions resource for forms, submission, or live application steps.",
        "shield",
      ),
    );
  }

  if (item.attachmentUrl) {
    cards.push(
      externalCard(
        "Download attachment",
        item.attachmentUrl,
        "Open the attached admissions document.",
        "file",
        "Open document",
      ),
    );
  }

  return cards;
}

function admissionRecordSection(
  area: string | undefined,
  data: AdmissionsPageData | undefined,
): PublicPageSection | null {
  const records = admissionRecordsForArea(area, data);

  if (!records.length) return null;

  if (records.length === 1 && records[0].content) {
    const record = records[0];
    return {
      eyebrow: "Admissions Guidance",
      title: record.title,
      body: record.content ?? record.summary ?? "",
      variant: "article",
      cards: admissionRecordFacts(record),
    };
  }

  return {
    eyebrow: "Admissions Guidance",
    title: area ? `${titleFromSlug(area)} guidance` : "Published admissions guidance",
    body:
      area === "undergraduate"
        ? "Use the published guidance below to compare undergraduate, diploma, certificate, and bridging application routes."
        : area === "postgraduate"
          ? "Use the published guidance below to prepare postgraduate application records before selecting a programme."
          : "Use the published admissions guidance below before continuing to applications, intakes, or programme selection.",
    columns: 3,
    cards: records.slice(0, 6).map(admissionRecordCard),
  };
}

function withAdmissionRecordSection(
  area: string | undefined,
  sections: PublicPageSection[],
  data?: AdmissionsPageData,
) {
  const recordSection = admissionRecordSection(area, data);
  return recordSection ? [recordSection, ...sections] : sections;
}

function intakeCards(data: AdmissionsPageData | undefined): PublicCard[] {
  const intakes = data?.intakes ?? [];

  if (!intakes.length) {
    return [
      externalCard(
        "Official active intakes",
        officialAdmissionsLinks.onlineApplication,
        "Use the online application portal to confirm open intakes, reporting dates, deadlines, and programme availability before applying.",
        "calendar",
        "Check active intakes",
      ),
      externalCard(
        "Admission documents centre",
        officialAdmissionsLinks.admissionCenter,
        "Admitted applicants can search by registration, admission number, or KCSE index/year format to access admission documents and monitor approvals.",
        "clipboard",
        "Open admission centre",
      ),
      pageCard(
        "Academic calendar",
        "/academics/calendar",
        "Use published calendar records alongside the official portal when planning reporting, registration, teaching, and examination periods.",
        "calendar",
        "View calendar",
      ),
    ];
  }

  return intakes.slice(0, 6).map((intake) => {
    const deadline = intake.lateApplicationEnd || intake.applicationEnd;
    const hasEnded = isPastAdmissionDate(deadline);
    const status = hasEnded
      ? "Deadline has passed in the intake record"
      : intake.isOpen
        ? "Open in the intake record"
        : "Scheduled or closed in the intake record";
    const lateText = intake.lateApplicationEnd
      ? ` Late applications: ${formatAdmissionDate(intake.lateApplicationEnd)}.`
      : "";

    return pageCard(
      intake.name,
      `/admissions/intakes/${intake.slug}`,
      `${status}. Application window: ${formatAdmissionDate(intake.applicationStart)} to ${formatAdmissionDate(intake.applicationEnd)}.${lateText} Verify status in the official application portal before submission.`,
      "calendar",
      "View intake",
    );
  });
}

const admissionsSourceCards = [
  externalCard(
    "Official admissions overview",
    officialAdmissionsLinks.overview,
    "The university admissions overview links applicants to undergraduate, postgraduate, diploma, certificate, international, brochure, and application resources.",
    "graduation",
  ),
  externalCard(
    "Online application portal",
    officialAdmissionsLinks.onlineApplication,
    "Create an application account, select an active intake, make a new application, or continue a saved application through the digital system.",
    "clipboard",
    "Apply online",
  ),
  externalCard(
    "Online admission centre",
    officialAdmissionsLinks.admissionCenter,
    "Access admission documents, self-register, and monitor admission progress using the details requested by the university portal.",
    "shield",
    "Open centre",
  ),
  externalCard(
    "Course information booklet",
    officialAdmissionsLinks.brochurePdf,
    "The course booklet lists programmes, minimum qualifications, modes of study, duration, tuition references, and school placement.",
    "book",
    "Open booklet",
  ),
];

const applicantRouteCards = [
  externalCard(
    "Government-sponsored applicants",
    officialAdmissionsLinks.howToApply,
    "KUCCPS coordinates placement for government-sponsored undergraduate applicants. Placement depends on application, minimum requirements, merit, and approved placement criteria.",
    "landmark",
    "Read KSU guidance",
  ),
  externalCard(
    "Self-sponsored applicants",
    officialAdmissionsLinks.onlineApplication,
    "Self-sponsored undergraduate and postgraduate applications are handled online, with available courses, open intakes, deadlines, reporting dates, and requirements shown in the system.",
    "clipboard",
    "Start application",
  ),
  externalCard(
    "Admitted students",
    officialAdmissionsLinks.admissionCenter,
    "After admission, use the admission centre to access documents, self-register, and track admission progress and approvals.",
    "check",
    "Open admission centre",
  ),
];

const institutionContextCards = [
  externalCard(
    "Chartered public university",
    officialAdmissionsLinks.about,
    "Kisii University traces its roots to a teachers training college founded in 1965 and was granted its university charter on 6 February 2013.",
    "landmark",
    "Read about KSU",
  ),
  externalCard(
    "Eight academic schools",
    officialAdmissionsLinks.schoolsDepartments,
    "Applicants can explore pathways across agriculture, arts and social sciences, business, education, health sciences, information science, law, and pure and applied sciences.",
    "building",
    "View schools",
  ),
  externalCard(
    "Student life and support",
    officialAdmissionsLinks.campusLife,
    "The campus-life page highlights organized student groups, undergraduate residences, Dean of Students support, career services, and student activities.",
    "heart",
    "Explore campus life",
  ),
  externalCard(
    "Digital services",
    "https://portal.kisiiuniversity.ac.ke",
    "After joining, students use official digital systems such as the student portal, e-learning, library resources, and institutional support channels.",
    "library",
    "Open portal",
  ),
];

function admissionsSections(
  kind: string,
  label?: string,
  data?: AdmissionsPageData,
): PublicPageSection[] {
  if (kind === "how-to-apply") {
    return [
      {
        eyebrow: "Application Routes",
        title: "Start from the correct applicant pathway",
        body: "Kisii University's official guidance separates government-sponsored placement from self-sponsored online applications.",
        columns: 3,
        cards: applicantRouteCards,
      },
      {
        eyebrow: "Application Steps",
        title: "Prepare, apply, and track using official systems",
        body: "This process organizes payment channels and deadlines. Applicants should confirm the live intake and programme requirements in the university portal before submitting.",
        columns: 3,
        cards: [
          infoCard("Check requirements", "Confirm the minimum entry route for certificate, diploma, degree, postgraduate diploma, masters, or PhD study.", "check"),
          infoCard("Choose a programme", "Compare the course booklet, school pages, and programme records before selecting an intake.", "book"),
          infoCard("Prepare documents", "Gather academic certificates, transcripts where applicable, identification details, and any referee or proposal documents required for the level.", "file"),
          infoCard("Create an account", "Use the online application portal registration flow and keep the email and password used for tracking the application.", "user"),
          infoCard("Submit and track", "Submit through the official portal, then use the admission centre for admission documents and approval progress.", "shield"),
          externalCard("Official how-to-apply page", officialAdmissionsLinks.howToApply, "Open the university's current public application instructions before relying on admissions guidance.", "file"),
        ],
      },
      {
        eyebrow: "Official References",
        title: "Use these before payment or document submission",
        body: "Application fees, payment instructions, deadlines, reporting dates, and admission documents should be trusted only from official records.",
        tone: "dark",
        columns: 3,
        cards: admissionsSourceCards,
      },
    ];
  }

  if (kind === "undergraduate") {
    return [
      {
        eyebrow: "Undergraduate Entry",
        title: "Certificate, diploma, and bachelor's pathways",
        body: "The undergraduate admissions page publishes general entry criteria and points applicants to official forms.",
        columns: 3,
        cards: [
          externalCard("Certificate courses", officialAdmissionsLinks.undergraduate, "General certificate admission is based on KCSE mean grade C- or equivalent, O-Level Division III, or A-Level subsidiary-pass routes.", "file", "View criteria"),
          externalCard("Diploma courses", officialAdmissionsLinks.undergraduate, "General diploma admission includes KCSE mean grade C, KCSE C- plus certificate, O-Level Division III, or A-Level subsidiary-pass routes.", "clipboard", "View criteria"),
          externalCard("Bachelor's degrees", officialAdmissionsLinks.undergraduate, "General degree admission includes KCSE C+ or equivalent, progression through certificate and diploma, A-Level principal-pass routes, HND, or equivalent Senate-recognized qualifications.", "graduation", "View criteria"),
        ],
      },
      {
        eyebrow: "Programme Fit",
        title: "Requirements differ by school and programme",
        body: "Applicants should combine the general undergraduate criteria with programme-specific subject clusters and professional regulator rules where they apply.",
        columns: 3,
        cards: [
          externalCard("Course booklet", officialAdmissionsLinks.brochurePdf, "Review programme-specific qualifications, modes of study, durations, tuition references, and intake notes.", "book", "Open booklet"),
          pageCard("All programmes", "/academics/programmes", "Browse programmes and compare levels, departments, and school placement.", "search", "Browse programmes"),
          pageCard("Academic schools", "/academics/schools", "Review the academic schools that own departments and programmes before applying.", "building", "View schools"),
          externalCard("Undergraduate form", officialAdmissionsLinks.undergraduateForm, "Use the official form only when the current application route asks for a downloadable form.", "file", "Open form"),
          externalCard("Diploma application", officialAdmissionsLinks.diploma, "Diploma applicants can access official diploma application resources from the university admissions page.", "clipboard", "Open page"),
          externalCard("Certificate or bridging", officialAdmissionsLinks.certificate, "Certificate and bridging applicants can access the official application resource from the university admissions page.", "check", "Open page"),
        ],
      },
    ];
  }

  if (kind === "postgraduate") {
    return [
      {
        eyebrow: "Postgraduate Admissions",
        title: "Graduate study is coordinated through academic affairs",
        body: "The official postgraduate page states that Academic Affairs coordinates graduate programmes, while the Research Office supports graduate scholarships and research grants.",
        columns: 3,
        cards: [
          externalCard("Online postgraduate application", officialAdmissionsLinks.postgraduate, "Postgraduate admissions are published for January and September intakes, with application through the online application system.", "clipboard", "Read guidance"),
          infoCard("Doctor of Philosophy", "Applicants should hold a master's degree or Senate-recognized equivalent and submit a research proposal showing capacity for original research.", "library"),
          infoCard("Masters degree", "Applicants generally need at least Upper Second Class Honours in a relevant discipline, or lower qualifications considered with postgraduate diploma evidence.", "graduation"),
          infoCard("Postgraduate diploma", "Applicants for postgraduate diploma programmes should have at least a pass degree according to the official criteria.", "book"),
          externalCard("Postgraduate form", officialAdmissionsLinks.postgraduate, "Open the official postgraduate page for downloadable application and referee forms where required.", "file", "Open forms"),
          pageCard("Postgraduate programmes", "/academics/programmes", "Filter programme records by postgraduate levels and school placement.", "search", "Browse programmes"),
        ],
      },
      {
        eyebrow: "Required Documents",
        title: "Prepare records before starting the application",
        body: "Document requirements vary by postgraduate level. The official page separates postgraduate diploma, masters, fellowship, and PhD document bundles.",
        columns: 3,
        cards: [
          infoCard("Academic certificates", "Prepare KCSE or O-Level certificates plus certified undergraduate degree certificates and transcripts where required.", "file"),
          infoCard("Progression evidence", "Applicants using KCSE C or C- progression routes should attach the diploma or certificate evidence listed by the official postgraduate guidance.", "check"),
          infoCard("PhD proposal", "PhD by thesis-only and other doctoral routes may require a proposal in addition to certified academic records.", "clipboard"),
          infoCard("Foreign qualifications", "Applicants from foreign universities should show evidence of accreditation status where the official guidance requires it.", "shield"),
          infoCard("Language and translation", "Non-English speaking country records may require proof of English proficiency and English translations.", "compass"),
          externalCard("Official postgraduate guidance", officialAdmissionsLinks.postgraduate, "Use the university page as the official reference for the latest required documents.", "file"),
        ],
      },
    ];
  }

  if (kind === "intake-detail") {
    const intake = data?.intakes.find((item) => item.slug === label);
    const deadline = intake?.lateApplicationEnd || intake?.applicationEnd;
    const hasEnded = isPastAdmissionDate(deadline);
    const status = intake
      ? hasEnded
        ? "The recorded application deadline has passed."
        : intake.isOpen
          ? "This intake is marked open in the admissions record."
          : "This intake is scheduled or closed in the admissions record."
      : "Confirm this intake in the official application portal.";

    return [
      {
        eyebrow: "Intake Record",
        title: `${intake?.name ?? titleFromSlug(label)} intake details`,
        body: intake
          ? `${status} The recorded application window runs from ${formatAdmissionDate(intake.applicationStart)} to ${formatAdmissionDate(intake.applicationEnd)}${intake.lateApplicationEnd ? `, with late applications to ${formatAdmissionDate(intake.lateApplicationEnd)}` : ""}.`
          : "This intake route summarizes the next action in the official application portal.",
        columns: 3,
        cards: [
          infoCard(
            "Application window",
            intake
              ? `${formatAdmissionDate(intake.applicationStart)} to ${formatAdmissionDate(intake.applicationEnd)}`
              : "Confirm opening and closing dates before starting an application.",
            "calendar",
          ),
          infoCard(
            "Current status",
            status,
            intake?.isOpen && !hasEnded ? "check" : "shield",
          ),
          pageCard("Eligible programmes", "/academics/programmes", "Browse programmes by level, school, department, and requirements.", "book", "Browse programmes"),
          externalCard("Application action", officialAdmissionsLinks.onlineApplication, "Use the official portal before submitting any application or payment details.", "clipboard", "Open portal"),
        ],
      },
    ];
  }

  if (kind === "international") {
    return [
      {
        eyebrow: "International Applicants",
        title: "Apply through the same official admissions controls",
        body: "The public international page points applicants to the application process, while postgraduate guidance clarifies foreign-qualification checks, language evidence, and translations.",
        columns: 3,
        cards: [
          externalCard("Online application", officialAdmissionsLinks.onlineApplication, "Create an application account and use the official portal to select a programme and open intake.", "clipboard", "Apply online"),
          infoCard("Certified academic records", "Prepare certified academic certificates and transcripts requested for the level of study.", "file"),
          infoCard("Passport and identity details", "International applicants should prepare passport details and any immigration documentation requested by the admissions office.", "compass"),
          infoCard("Accreditation evidence", "Where a qualification comes from a foreign university, official postgraduate guidance requires evidence of institutional accreditation status.", "shield"),
          infoCard("English evidence", "Applicants from non-English speaking countries may need proof of English proficiency and English translations.", "check"),
          externalCard("International page", officialAdmissionsLinks.international, "Open the current university page for international applicants.", "file"),
        ],
      },
      {
        eyebrow: "Joining Kisii University",
        title: "Academic and student-life context for international students",
        body: "Applicants can review the university history, schools, campus life, library, e-learning, and student support pathways before arrival.",
        tone: "dark",
        columns: 3,
        cards: institutionContextCards,
      },
    ];
  }

  if (kind === "requirements") {
    return [
      {
        eyebrow: "General Requirements",
        title: "Minimum entry routes by level of study",
        body: "These cards summarize the official general criteria. Programme-specific requirements remain decisive and should be checked in the course booklet or programme record.",
        columns: 3,
        cards: [
          externalCard("Certificate", officialAdmissionsLinks.undergraduate, "General certificate entry includes KCSE C- or equivalent, O-Level Division III, or A-Level subsidiary passes.", "file", "View page"),
          externalCard("Diploma", officialAdmissionsLinks.undergraduate, "General diploma entry includes KCSE C, KCSE C- plus certificate, O-Level Division III, or A-Level subsidiary passes.", "clipboard", "View page"),
          externalCard("Bachelor's degree", officialAdmissionsLinks.undergraduate, "General degree entry includes KCSE C+ or equivalent plus multiple Senate-recognized progression routes.", "graduation", "View page"),
          externalCard("Postgraduate diploma", officialAdmissionsLinks.postgraduate, "Postgraduate diploma applicants should have at least a pass degree under the official criteria.", "book", "View page"),
          externalCard("Masters", officialAdmissionsLinks.postgraduate, "Masters applicants generally need Upper Second Class Honours in a relevant discipline or accepted lower qualifications with postgraduate diploma evidence.", "library", "View page"),
          externalCard("PhD", officialAdmissionsLinks.postgraduate, "PhD applicants should hold a relevant master's degree or equivalent and provide a research proposal where required.", "sparkles", "View page"),
        ],
      },
      {
        eyebrow: "Programme-Specific Checks",
        title: "Subject clusters, regulators, and equivalencies matter",
        body: "Applicants should not rely only on the general minimum. Professional programmes and school-specific pathways may add subject thresholds, accreditation requirements, or regulator conditions.",
        tone: "dark",
        columns: 3,
        cards: [
          externalCard("Course booklet", officialAdmissionsLinks.brochurePdf, "Use the booklet for programme-specific qualifications, mode of study, duration, and tuition references.", "book", "Open booklet"),
          pageCard("Programme records", "/academics/programmes", "Browse programmes by level, school, department, and requirements.", "search", "Browse records"),
          externalCard("KUCCPS placement", officialAdmissionsLinks.kuccps, "Government-sponsored applicants should also verify programme placement requirements through KUCCPS.", "landmark", "Open KUCCPS"),
        ],
      },
    ];
  }

  if (kind === "fees") {
    return [
      {
        eyebrow: "Fee Records",
        title: "Fees are programme-specific and must come from official records",
        body: "The official course booklet includes tuition references by programme, but payment instructions and full fee schedules should be confirmed from current university records before payment.",
        columns: 3,
        cards: [
          externalCard("Course booklet tuition", officialAdmissionsLinks.brochurePdf, "Open the official course booklet for programme-level tuition references, qualification routes, duration, and mode of study.", "file", "Open booklet"),
          pageCard("Programme fees", "/academics/programmes", "Review programme pages for fee, duration, and study-mode context.", "book", "Browse programmes"),
          externalCard("Admissions office contact", officialAdmissionsLinks.contact, "Use official contact channels for fee confirmation, deadlines, and payment guidance.", "handshake", "Contact KSU"),
        ],
      },
      {
        eyebrow: "Cost Planning",
        title: "Review the full joining cost before reporting",
        body: "Admissions content separates tuition from other approved charges, accommodation, student services, and programme-specific requirements while keeping amounts tied to official records.",
        columns: 3,
        cards: [
          infoCard("Tuition", "Programme tuition varies by school, level, duration, and mode of study. Confirm against the course booklet and current fee schedule.", "graduation"),
          infoCard("Application and forms", "Application fees and downloadable forms should be taken only from the official portal, admission pages, or current university documents.", "clipboard"),
          infoCard("Accommodation and services", "Accommodation, medical, student activity, and other service charges should be confirmed from current joining instructions or official fee schedules.", "home"),
        ],
      },
    ];
  }

  if (kind === "scholarships") {
    return [
      {
        eyebrow: "Financial Support",
        title: "Official funding notices and support",
        body: "The postgraduate guidance notes Research Office support in administering graduate scholarships and research grants. Other funding opportunities should be checked through official notices.",
        columns: 3,
        cards: [
          externalCard("Graduate scholarships and grants", officialAdmissionsLinks.postgraduate, "Research Office support is referenced by the official postgraduate admissions page for graduate scholarships and research grants.", "sparkles", "View page"),
          infoCard("Government sponsorship", "Government-sponsored undergraduate placement is coordinated through KUCCPS; sponsorship status should be verified through KUCCPS and university admission records.", "landmark"),
          infoCard("External sponsors", "Applicants with county, employer, NGO, or private sponsorship should follow the sponsor's award letter requirements and university fee-clearance instructions.", "handshake"),
          pageCard("Research opportunities", "/research", "Open research pages for university research context and published funding opportunities .", "library", "Open research"),
          pageCard("Announcements", "/announcements", "Scholarship calls, bursary notices, and deadlines should be published as official announcements .", "megaphone", "View notices"),
          externalCard("Admissions contact", officialAdmissionsLinks.contact, "Contact the university through official channels before relying on third-party funding claims.", "shield", "Contact KSU"),
        ],
      },
    ];
  }

  if (kind === "intakes") {
    return [
      {
        eyebrow: "Current Intakes",
        title: "Current intake records with official verification",
        body: "Review published intake records, then verify live application status in the official portal before submitting.",
        columns: 3,
        cards: intakeCards(data),
      },
      {
        eyebrow: "Intake Preparation",
        title: "Prepare before an intake opens or closes",
        body: "Applicants should have programme choice, requirements, documents, and application account details ready before the published deadline.",
        tone: "dark",
        columns: 3,
        cards: [
          pageCard("Choose a programme", "/academics/programmes", "Compare programme records by school, level, department, and duration.", "search", "Browse programmes"),
          externalCard("Application portal", officialAdmissionsLinks.onlineApplication, "Confirm active intakes, reporting dates, deadlines, and application actions in the official portal.", "clipboard", "Open portal"),
          externalCard("Admission documents", officialAdmissionsLinks.admissionCenter, "Placed and admitted applicants should use the admission centre for admission letters, documents, registration, and progress tracking.", "file", "Open centre"),
        ],
      },
    ];
  }

  return [
    {
      eyebrow: "Admissions Pathways",
      title: "Guidance by applicant route",
      body: "Admissions content now starts with the public routes applicants actually use: KUCCPS placement, self-sponsored online application, and admitted-student document access.",
      columns: 3,
      cards: applicantRouteCards,
    },
    {
      eyebrow: "Study Pathways",
      title: "Find the correct academic level and school",
      body: "Admissions connects applicants to eight academic schools, the course booklet, programme records, and level-specific requirements.",
      columns: 3,
      cards: [
        pageCard("Undergraduate Admissions", "/admissions/undergraduate", "Certificate, diploma, and bachelor's degree entry routes with official general criteria.", "graduation", "Learn more"),
        pageCard("Postgraduate Admissions", "/admissions/postgraduate", "Postgraduate diploma, masters, fellowship, and PhD application context.", "library", "Learn more"),
        pageCard("International Students", "/admissions/international", "International applicant document preparation, qualification checks, and campus context.", "compass", "Learn more"),
        pageCard("Entry Requirements", "/admissions/requirements", "General requirements plus programme-specific checks.", "check", "View requirements"),
        pageCard("Fees", "/admissions/fees", "Official fee records, course booklet references, and cost-planning guidance.", "file", "View fees"),
        pageCard("Current Intakes", "/admissions/intakes", "Published intake records with portal verification.", "calendar", "View intakes"),
      ],
    },
    {
      eyebrow: "Institution Context",
      title: "What applicants should know about Kisii University",
      body: "Prospective students can review the institution's chartered status, academic structure, student support, and campus-life context before applying.",
      tone: "dark",
      columns: 3,
      cards: institutionContextCards,
    },
    {
      eyebrow: "Official Sources",
      title: "Records and application systems",
      body: "These links point applicants to university-controlled systems and pages for application, admission documents, programme discovery, and contact verification.",
      columns: 3,
      cards: [
        ...admissionsSourceCards,
        ...admissionInfoCards(data).slice(0, 2),
      ],
    },
    {
      eyebrow: "Intake Records",
      title: "Current intake status must be verified live",
      body: "Published intake records can guide planning, but live admissions status belongs to the official online application portal.",
      columns: 3,
      cards: intakeCards(data),
    },
  ];
}

function admissionsBody(area?: string) {
  if (area === "undergraduate") {
    return "Undergraduate admissions covers certificate, diploma, and bachelor's degree entry routes, including general minimum criteria and programme-specific requirement checks.";
  }

  if (area === "postgraduate") {
    return "Postgraduate admissions covers postgraduate diploma, masters, fellowship, and PhD pathways coordinated through Academic Affairs and supported by official application records.";
  }

  if (area === "international") {
    return "International admissions guides applicants through programme choice, certified records, foreign-qualification checks, language documentation, and official online application steps.";
  }

  if (area === "requirements") {
    return "Entry requirements combine general level-based criteria with programme-specific subject clusters, regulator requirements, and Senate-recognized equivalencies.";
  }

  if (area === "fees") {
    return "Fees content points to official fee records, programme tuition references, and university contact channels while keeping payment instructions and amounts tied to verified guidance.";
  }

  if (area === "scholarships") {
    return "Scholarship and financial-support content is limited to public funding pathways, official notices, research-grant support, and sponsorship verification.";
  }

  if (area === "how-to-apply") {
    return "How to apply explains the KUCCPS, self-sponsored, and admitted-student pathways, then directs applicants to official systems for live intakes and document access.";
  }

  if (area === "intakes") {
    return "Current intakes uses published intake records and keeps applicants anchored to the official online application portal for live status.";
  }

  return "Admissions guidance brings together official application pathways, entry criteria, programme discovery, current intake records, fees context, funding guidance, and student-life information for prospective Kisii University students.";
}

function admissionsContinueItems(area?: string): PublicCard[] {
  if (area === "fees") {
    return [
      externalCard("Course booklet", officialAdmissionsLinks.brochurePdf, "Open official programme tuition references and requirements.", "file", "Open booklet"),
      pageCard("Programmes", "/academics/programmes", "Review programme records, duration, study mode, and fee context.", "book", "Browse programmes"),
      externalCard("Contact KSU", officialAdmissionsLinks.contact, "Confirm current fee schedules and payment guidance through official channels.", "handshake", "Contact"),
    ];
  }

  if (area === "intakes") {
    return [
      externalCard("Online application", officialAdmissionsLinks.onlineApplication, "Confirm live intakes and start or continue an application.", "clipboard", "Open portal"),
      pageCard("How to Apply", "/admissions/how-to-apply", "Review application steps before submitting.", "check", "View guide"),
      pageCard("Requirements", "/admissions/requirements", "Confirm the correct entry route.", "file", "View requirements"),
    ];
  }

  return [
    pageCard("How to Apply", "/admissions/how-to-apply", "Step-by-step official application guidance.", "check", "View guide"),
    pageCard("Entry Requirements", "/admissions/requirements", "General and programme-specific requirement checks.", "clipboard", "View requirements"),
    pageCard("Current Intakes", "/admissions/intakes", "Published intake records with portal verification.", "calendar", "View intakes"),
    pageCard("Programmes", "/academics/programmes", "Compare academic programmes before applying.", "book", "Browse programmes"),
    externalCard("Online Application", officialAdmissionsLinks.onlineApplication, "Start or continue a self-sponsored application in the university portal.", "arrow", "Apply online"),
    externalCard("Admission Centre", officialAdmissionsLinks.admissionCenter, "Access admission documents and track progress after placement or admission.", "shield", "Open centre"),
  ];
}

function admissionsRelatedItems(area?: string): PublicCard[] {
  const records = [
    pageCard("Undergraduate", "/admissions/undergraduate", "Certificate, diploma, and bachelor's entry pathways.", "graduation", "Open"),
    pageCard("Postgraduate", "/admissions/postgraduate", "Postgraduate diploma, masters, and PhD pathways.", "library", "Open"),
    pageCard("International", "/admissions/international", "International applicant preparation.", "compass", "Open"),
    pageCard("Requirements", "/admissions/requirements", "Entry criteria and programme-specific checks.", "clipboard", "Open"),
    pageCard("Fees", "/admissions/fees", "Official fee records and cost planning.", "file", "Open"),
    pageCard("Scholarships", "/admissions/scholarships", "Funding and sponsorship guidance.", "sparkles", "Open"),
    pageCard("How to Apply", "/admissions/how-to-apply", "Application steps and official systems.", "check", "Open"),
    pageCard("Current Intakes", "/admissions/intakes", "Intake records and status verification.", "calendar", "Open"),
  ];

  const href = area ? `/admissions/${area}` : "/admissions";
  return records.filter((item) => item.href !== href);
}

export function getAdmissionsPage(
  segments: string[] = [],
  data?: AdmissionsPageData,
): PublicPageConfig {
  const currentHref = `/admissions${segments.length ? `/${segments.join("/")}` : ""}`;
  const [area, id] = segments;
  const knownArea = [
    "undergraduate",
    "postgraduate",
    "international",
    "requirements",
    "fees",
    "scholarships",
    "how-to-apply",
    "intakes",
  ].includes(area ?? "");
  const directRecord =
    area && !knownArea ? admissionRecordsForArea(area, data)[0] : undefined;
  const intakeRecord =
    area === "intakes" && id
      ? data?.intakes.find((item) => item.slug === id)
      : undefined;
  const title =
    area === "undergraduate"
      ? "Undergraduate admissions"
      : area === "postgraduate"
        ? "Postgraduate admissions"
        : area === "international"
          ? "International student admissions"
          : area === "requirements"
            ? "Entry requirements"
            : area === "fees"
              ? "Fees and official fee records"
              : area === "scholarships"
                ? "Scholarships and financial support"
                : area === "how-to-apply"
                  ? "How to apply"
                  : area === "intakes" && id
                    ? `${intakeRecord?.name ?? titleFromSlug(id)} intake`
                    : area === "intakes"
                      ? "Current intakes"
                      : directRecord
                        ? directRecord.title
                        : "Admissions at Kisii University";
  const sections =
    area === "how-to-apply"
      ? withAdmissionRecordSection(
          "how-to-apply",
          admissionsSections("how-to-apply", undefined, data),
          data,
        )
      : area === "intakes" && id
        ? admissionsSections("intake-detail", id, data)
        : withAdmissionRecordSection(
            area,
            admissionsSections(area ?? "default", undefined, data),
            data,
          );

  return siteConfig({
    currentHref,
    sectionLabel: "Admissions",
    navItems: admissionsNav,
    eyebrow: area ? titleFromSlug(area) : "Admissions",
    title,
    body:
      directRecord?.summary ??
      (intakeRecord
        ? `Application window: ${formatAdmissionDate(intakeRecord.applicationStart)} to ${formatAdmissionDate(intakeRecord.applicationEnd)}${intakeRecord.lateApplicationEnd ? `, late applications to ${formatAdmissionDate(intakeRecord.lateApplicationEnd)}` : ""}.`
        : admissionsBody(area)),
    primaryAction: {
      label: area === "intakes" ? "Check Active Intakes" : "Apply Online",
      href: officialAdmissionsLinks.onlineApplication,
      external: true,
    },
    secondaryActions: [
      { label: "How to Apply", href: "/admissions/how-to-apply" },
      { label: "Browse Programmes", href: "/academics/programmes" },
    ],
    asideBody:
      "Use this section to compare pathways, prepare documents, review intakes, and continue to the official application portal.",
    relatedItems: admissionsRelatedItems(area),
    continueItems: admissionsContinueItems(area),
    sections,
  });
}

const schoolCards = [
  pageCard("School of Agriculture and Natural Resources Management", "/academics/schools/school-of-agriculture-and-natural-resources-management", "Official academic school listed by Kisii University.", "building", "View school"),
  pageCard("School of Arts and Social Sciences", "/academics/schools/school-of-arts-and-social-sciences", "Official academic school listed by Kisii University.", "building", "View school"),
  pageCard("School of Business and Economics", "/academics/schools/school-of-business-and-economics", "Official academic school listed by Kisii University.", "building", "View school"),
  pageCard("School of Education and Human Resource Development", "/academics/schools/school-of-education-and-human-resource-development", "Official academic school listed by Kisii University.", "building", "View school"),
  pageCard("School of Health Sciences", "/academics/schools/school-of-health-sciences", "Official academic school listed by Kisii University.", "building", "View school"),
  pageCard("School of Information Science and Technology", "/academics/schools/school-of-information-science-and-technology", "Official academic school listed by Kisii University.", "building", "View school"),
  pageCard("School of Law", "/academics/schools/school-of-law", "Official academic school listed by Kisii University.", "building", "View school"),
  pageCard("School of Pure and Applied Sciences", "/academics/schools/school-of-pure-and-applied-sciences", "Official academic school listed by Kisii University.", "building", "View school"),
];

function academicsSections(
  kind: string,
  label?: string,
  options: { baseHref?: string; isAcademicDepartment?: boolean } = {},
): PublicPageSection[] {
  if (kind === "school-detail") {
    const base =
      options.baseHref ??
      `/academics/schools/${label?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    return [
      {
        eyebrow: "School Mini-site",
        title: `${label} school records`,
        body: "School pages bring together the overview, departments, programmes, staff, publications, clubs, documents, and contacts for each academic school.",
        columns: 3,
        cards: [
          pageCard("About", base, "School overview, mission, and public record context.", "file", "View about"),
          pageCard("Departments", `${base}/departments`, "Department records for this school.", "building", "View departments"),
          pageCard("Programmes", `${base}/programmes`, "Programme records scoped to this school.", "book", "View programmes"),
          pageCard("Staff", `${base}/staff`, "Academic and administrative staff associated with this school.", "users", "View staff"),
          pageCard("Publications", `${base}/publications`, "Research output and publications associated with the school.", "file", "View publications"),
          pageCard("News", `${base}/news`, "School updates, notices, and announcements.", "news", "View news"),
          pageCard("Documents", `${base}/documents`, "School documents appear when attached to records.", "clipboard", "View documents"),
          pageCard("Clubs", `${base}/clubs`, "Student groups and school-associated activities.", "sparkles", "View clubs"),
          pageCard("Contact", `${base}/contact`, "School contact channels and visitor guidance.", "handshake", "View contact"),
        ],
      },
    ];
  }

  if (kind === "department-detail") {
    const base =
      options.baseHref ??
      `/academics/departments/${label?.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
    const isAcademicDepartment = options.isAcademicDepartment ?? true;

    return [
      {
        eyebrow: isAcademicDepartment ? "Academic Department" : "Department",
        title: `${label} department records`,
        body: "Department pages bring together the overview, team, programmes, services, news, downloads, and contact information.",
        columns: 3,
        cards: [
          pageCard("About", base, "Department overview, mission, and mandate context.", "file", "View about"),
          pageCard("Staff", `${base}/staff`, "Academic and administrative staff associated with this department.", "users", "View staff"),
          ...(isAcademicDepartment
            ? [
                pageCard(
                  "Programmes",
                  `${base}/programmes`,
                  "Programme records scoped to this department.",
                  "book",
                  "View programmes",
                ),
              ]
            : []),
          pageCard("Publications", `${base}/publications`, "Research output and publications associated with the department.", "file", "View publications"),
          pageCard("Services", `${base}/services`, "Academic, administrative, or student-facing services.", "clipboard", "View services"),
          pageCard("News", `${base}/news`, "Department updates, notices, and announcements.", "news", "View news"),
          pageCard("Documents", `${base}/documents`, "Department documents appear when attached to records.", "clipboard", "View documents"),
          pageCard("Contact", `${base}/contact`, "Department contact channels and visitor guidance.", "handshake", "View contact"),
        ],
      },
    ];
  }

  if (kind === "programme-detail") {
    return [
      {
        eyebrow: "Programme Record",
        title: `${label} programme detail`,
        body: "Programme pages organize the overview, entry requirements, curriculum context, tutors, and frequently asked questions.",
        columns: 3,
        cards: [
          infoCard("Overview", "Programme summary and academic context.", "book"),
          infoCard("Requirements", "Entry requirements, subject expectations, and admission guidance.", "check"),
          infoCard("Curriculum", "Learning structure, study focus, and progression context.", "clipboard"),
          infoCard("Tutors", "Teaching staff should come from staff assignments.", "users"),
        ],
      },
    ];
  }

  if (kind === "examinations") {
    return [
      {
        eyebrow: "Examinations",
        title: "Exam timetables, notices, and guidance",
        body: "The examinations page brings together timetable access, results guidance, and examination office notices.",
        columns: 3,
        cards: [
          infoCard("Timetables", "Access examination timetable information and related notices.", "calendar"),
          infoCard("Results guidance", "Results access belongs to official student systems and published instructions.", "shield"),
          infoCard("Notices", "Review examination office notices and public updates.", "megaphone"),
        ],
      },
      {
        eyebrow: "Academic Links",
        title: "Connect examinations back to academic pathways",
        body: "Visitors can continue to programme, school, and academic calendar pages without leaving the public shell.",
        tone: "dark",
        columns: 3,
        cards: [
          pageCard("Academic Calendar", "/academics/calendar", "Open academic dates and term-cycle guidance.", "calendar", "Open calendar"),
          pageCard("Programmes", "/academics/programmes", "Browse programmes by level, department, and school.", "book", "Browse programmes"),
          pageCard("Schools", "/academics/schools", "Review academic schools and school-level context.", "building", "View schools"),
        ],
      },
    ];
  }

  return [
    {
      eyebrow: "Academic Schools",
      title: "Schools and school-level records",
      body: "Academic pages help visitors move through schools, departments, programmes, and academic resources.",
      columns: 4,
      cards: kind === "schools" ? schoolCards : schoolCards.slice(0, 8),
    },
    {
      eyebrow: "Programme Finder",
      title: "Programme discovery by level, school, and department",
      body: "Programme pages help applicants compare levels, duration, departments, requirements, and study modes.",
      tone: "dark",
      columns: 3,
      cards: [
        pageCard("All Programmes", "/academics/programmes", "Browse programmes by level, department, and school.", "book", "Browse programmes"),
        pageCard("Undergraduate Admissions", "/admissions/undergraduate", "Connect programme discovery to undergraduate admissions.", "graduation", "View admissions"),
        pageCard("Postgraduate Admissions", "/admissions/postgraduate", "Connect programme discovery to postgraduate admissions.", "library", "View admissions"),
      ],
    },
    {
      eyebrow: "Academic Resources",
      title: "Calendar, library, and learning pathways",
      body: "Academic resource links stay aligned with the public navigation and avoid unsupported download claims.",
      columns: 3,
      cards: [
        pageCard("Academic Calendar", "/academics/calendar", "Open academic dates and calendar guidance.", "calendar", "Open calendar"),
        { ...pageCard("Library", "/library", "Library access follows the public header route.", "library", "Open library") },
        { ...pageCard("E-Learning", "https://elearning.kisiiuniversity.ac.ke", "E-learning is linked as an external university service.", "book", "Open e-learning"), external: true },
      ],
    },
  ];
}

export function getAcademicsPage(segments: string[] = []): PublicPageConfig {
  const currentHref = `/academics${segments.length ? `/${segments.join("/")}` : ""}`;
  const [area, slug, child, childSlug, tab] = segments;
  const schoolLabel = titleFromSlug(slug);
  const deptLabel = titleFromSlug(area === "departments" ? slug : childSlug);
  const title =
    area === "schools" && slug && child === "departments" && childSlug
      ? `${deptLabel} department`
      : area === "departments" && slug
        ? `${deptLabel} department`
      : area === "schools" && slug && child
        ? `${schoolLabel} ${titleFromSlug(child)}`
        : area === "schools" && slug
          ? `${schoolLabel} school`
          : area === "schools"
            ? "Academic schools"
            : area === "programmes" && slug
              ? `${titleFromSlug(slug)} programme`
            : area === "programmes"
              ? "Academic programmes"
              : area === "calendar"
                ? "Academic calendar"
                : area === "examinations"
                  ? "Examinations"
                  : "Academics at Kisii University";

  const isDepartmentDetail =
    (area === "schools" && Boolean(slug) && child === "departments" && Boolean(childSlug)) ||
    (area === "departments" && Boolean(slug));
  const isSchoolDetail = area === "schools" && Boolean(slug) && !isDepartmentDetail;
  const isProgrammeDetail = area === "programmes" && Boolean(slug);
  const schoolBaseHref = slug ? `/academics/schools/${slug}` : undefined;
  const departmentBaseHref =
    area === "departments" && slug
      ? `/academics/departments/${slug}`
      : slug && childSlug
        ? `/academics/schools/${slug}/departments/${childSlug}`
        : undefined;

  return siteConfig({
    currentHref,
    sectionLabel: "Academics",
    navItems: academicsNav,
    eyebrow: tab ? titleFromSlug(tab) : area ? titleFromSlug(area) : "Academics",
    title,
    body:
      "Academics pages organize schools, departments, programmes, staff, publications, and calendar references.",
    primaryAction: { label: "Browse Programmes", href: "/academics/programmes" },
    secondaryActions: [
      { label: "View Schools", href: "/academics/schools" },
      { label: "Admissions", href: "/admissions" },
    ],
    asideBody:
      "Use this section to browse academic schools, compare programmes, review departments, and connect academic information with admissions.",
    sections: isProgrammeDetail
      ? academicsSections("programme-detail", titleFromSlug(slug))
      : isDepartmentDetail
        ? academicsSections("department-detail", deptLabel, {
            baseHref: departmentBaseHref,
            isAcademicDepartment: true,
          })
      : isSchoolDetail
        ? academicsSections("school-detail", schoolLabel, { baseHref: schoolBaseHref })
        : academicsSections(area === "schools" ? "schools" : area === "examinations" ? "examinations" : "default"),
  });
}

export function getStaffPortalPage(): PublicPageConfig {
  return siteConfig({
    currentHref: "/m/staff",
    sectionLabel: "Staff Tools",
    navItems: toolbarUtilityNav,
    eyebrow: "Staff Portal",
    title: "Staff portal access",
    body:
      "Staff and students use the official Kisii University portal for authenticated records and internal services. This public page keeps that access point separate from public website content.",
    primaryAction: {
      label: "Open Staff/Student Portal",
      href: "https://portal.kisiiuniversity.ac.ke",
      external: true,
    },
    secondaryActions: [
      {
        label: "E-Learning",
        href: "https://elearning.kisiiuniversity.ac.ke",
        external: true,
      },
      { label: "Administration", href: "/administration" },
    ],
    asideBody:
      "Authenticated staff workflows stay in the official staff portal for private records and transactions.",
    sections: [
      {
        eyebrow: "Staff Access",
        title: "Official access points and public resources",
        body: "The public site links to official staff services while keeping restricted records inside authenticated systems.",
        columns: 3,
        cards: [
          externalCard("Staff/Student Portal", "https://portal.kisiiuniversity.ac.ke", "Official authenticated portal for staff and student services.", "shield", "Open portal"),
          externalCard("E-Learning", "https://elearning.kisiiuniversity.ac.ke", "Official e-learning system for teaching and learning support.", "book", "Open e-learning"),
          pageCard("Administration", "/administration", "Administrative divisions, units, and public service context.", "landmark", "Open administration"),
        ],
      },
      {
        eyebrow: "Source Boundaries",
        title: "Private workflows stay in authenticated systems",
        body: "The public website does not invent staff dashboards, payroll, HR, or records workflows.",
        tone: "dark",
        columns: 3,
        cards: [
          infoCard("Authentication", "Handled by the official portal.", "shield"),
          infoCard("Records", "Private records remain outside the public frontend.", "file"),
          pageCard("Public News", "/news", "University communications remain available publicly.", "news", "Open news"),
        ],
      },
    ],
  });
}

export function getAlumniPage(): PublicPageConfig {
  return siteConfig({
    currentHref: "/alumni",
    sectionLabel: "Alumni",
    navItems: toolbarUtilityNav,
    eyebrow: "Alumni",
    title: "Alumni relations and public engagement",
    body:
      "The alumni toolbar link resolves as a public page for alumni engagement, institutional news, events, and published alumni records.",
    primaryAction: { label: "University News", href: "/media/news" },
    secondaryActions: [
      { label: "Events", href: "/media/events" },
      { label: "About Kisii University", href: "/about" },
    ],
    asideBody:
      "Use this section to explore alumni records, chapters, benefits, contacts, giving, and event pathways.",
    sections: [
      {
        eyebrow: "Alumni Engagement",
        title: "Keep graduates connected to university updates",
        body: "This page gives alumni a public path back to institutional information without inventing alumni chapters, membership counts, benefits, or personal stories.",
        columns: 3,
        cards: [
          pageCard("News", "/news", "University news records.", "news", "Read news"),
          pageCard("Events", "/events", "University event records.", "calendar", "View events"),
          pageCard("Announcements", "/announcements", "Official public notices .", "megaphone", "View notices"),
        ],
      },
      {
        eyebrow: "Future Alumni Records",
        title: "Ready for public alumni content",
        body: "Alumni pages can include office records, verified chapters, giving pathways, and event registration as those programmes are published.",
        tone: "dark",
        columns: 3,
        cards: [
          infoCard("Office records", "Contacts and office details require published public records.", "building"),
          infoCard("Chapters", "Alumni groups should come from verified records.", "users"),
          infoCard("Opportunities", "Mentorship, giving, and event actions require official workflows.", "sparkles"),
        ],
      },
    ],
  });
}

export function getAzIndexPage(): PublicPageConfig {
  const indexCards = [
    pageCard("About", "/about", "Institutional overview, history, mission, governance, and leadership.", "landmark", "Open"),
    pageCard("Academics", "/academics", "Schools, programmes, calendar, and examinations.", "graduation", "Open"),
    pageCard("Admissions", "/admissions", "Admissions pathways, requirements, fees, and how to apply.", "clipboard", "Open"),
    pageCard("Administration", "/administration", "Divisions, units, directorates, and organization structure.", "building", "Open"),
    pageCard("Campus Life", "/campus-life", "Student life, clubs, sports, accommodation, support, and gallery.", "heart", "Open"),
    pageCard("News", "/news", "University news records.", "news", "Open"),
    pageCard("Events", "/events", "University event records.", "calendar", "Open"),
    pageCard("Announcements", "/announcements", "Official public notices .", "megaphone", "Open"),
    pageCard("Staff Portal", "/m/staff", "Staff tools access context.", "user", "Open"),
    pageCard("Alumni", "/alumni", "Alumni engagement and public updates.", "users", "Open"),
  ];

  return siteConfig({
    currentHref: "/az-index",
    sectionLabel: "A-Z Index",
    navItems: toolbarUtilityNav,
    eyebrow: "A-Z Index",
    title: "A-Z public website index",
    body:
      "The A-Z toolbar link now resolves to an alphabetical access point for public website sections and public support pages.",
    primaryAction: { label: "Search", href: "/search" },
    secondaryActions: [{ label: "Home", href: "/" }],
    asideBody:
      "The index lists public routes only. New entries should be added after a route exists and has been verified.",
    sections: [
      {
        eyebrow: "Public Index",
        title: "Implemented routes by public section",
        body: "These entries keep toolbar navigation aligned with real frontend pages.",
        columns: 4,
        cards: indexCards,
      },
    ],
    continueItems: indexCards,
  });
}

export function getSearchPage(query?: string): PublicPageConfig {
  const trimmedQuery = query?.trim();
  const searchCards = [
    pageCard("Admissions", "/admissions", "Admissions pathways and application guidance.", "graduation", "Open admissions"),
    pageCard("Programmes", "/academics/programmes", "Programme discovery and public programme records.", "book", "Browse programmes"),
    pageCard("Schools", "/academics/schools", "Academic schools and school-level records.", "building", "View schools"),
    pageCard("News", "/news", "University news records.", "news", "Open news"),
    pageCard("Events", "/events", "Event records.", "calendar", "Open events"),
    pageCard("A-Z Index", "/az-index", "Browse public routes.", "search", "Open index"),
  ];

  return siteConfig({
    currentHref: trimmedQuery ? `/search?q=${encodeURIComponent(trimmedQuery)}` : "/search",
    sectionLabel: "Search",
    navItems: toolbarUtilityNav,
    eyebrow: "Search",
    title: trimmedQuery ? `Search results for "${trimmedQuery}"` : "Search the public website",
    body: trimmedQuery
      ? "Search results are shown from the aggregated public search service when a query is provided."
      : "Use the toolbar search entry point to query public website records.",
    primaryAction: { label: "A-Z Index", href: "/az-index" },
    secondaryActions: [{ label: "Admissions", href: "/admissions" }],
    asideBody:
      "Search news, programmes, schools, departments, events, people, and public notices from one place.",
    sections: [
      {
        eyebrow: "Suggested Pathways",
        title: trimmedQuery ? "Start with verified public sections" : "Common public destinations",
        body: "These links remain useful starting points when a search has no exact matches.",
        columns: 3,
        cards: searchCards,
      },
    ],
    continueItems: searchCards,
  });
}

function campusSections(kind: string, label?: string): PublicPageSection[] {
  if (kind === "detail") {
    return [
      {
        eyebrow: "Campus Life Record",
        title: `${label} public page`,
        body: "Detail pages bring together records, media, staff contacts, service guidance, and student experience information.",
        columns: 3,
        cards: [
          infoCard("Overview", "Context and purpose for this student experience area.", "file"),
          infoCard("Records", "Activities, contacts, documents, and updates.", "check"),
          infoCard("Related support", "Students can continue to support and service pages.", "handshake"),
        ],
      },
    ];
  }

  return [
    {
      eyebrow: "Student Experience",
      title: "Student experience and campus resources",
      body: "Campus Life pages describe student experience areas, services, activities, facilities, and support pathways.",
      columns: 3,
      cards: campusNav.slice(1),
    },
    {
      eyebrow: "Support Pathways",
      title: "Student support is presented as public guidance",
      body: "Support pages guide students to wellbeing, health, accessibility, and service pathways.",
      tone: "dark",
      columns: 3,
      cards: [
        pageCard("Counseling Support", "/campus-life/support/counseling", "Counseling support guidance and wellbeing pathways.", "heart", "Open counseling"),
        pageCard("Health Support", "/campus-life/support/health", "Health service guidance and student support pathways.", "check", "Open health"),
        pageCard("Disability Support", "/campus-life/support/disability", "Accessibility and disability support guidance.", "handshake", "Open support"),
      ],
    },
  ];
}

export function getCampusLifePage(segments: string[] = []): PublicPageConfig {
  const currentHref = `/campus-life${segments.length ? `/${segments.join("/")}` : ""}`;
  const [area, slug, child] = segments;
  const label = titleFromSlug(child ?? slug ?? area);
  const title =
    area === "student-life"
      ? "Student life"
      : area === "clubs" && slug
        ? `${titleFromSlug(slug)} club`
        : area === "clubs"
          ? "Clubs and societies"
          : area === "sports" && slug
            ? `${titleFromSlug(slug)} sport and recreation`
            : area === "sports"
              ? "Sports and recreation"
              : area === "accommodation"
                ? "Student accommodation"
                : area === "support" && slug
                  ? `${titleFromSlug(slug)} support`
                  : area === "support"
                    ? "Student support"
                    : area === "gallery" && slug === "photos" && child
                      ? `${titleFromSlug(child)} gallery album`
                      : area === "gallery"
                        ? "Campus gallery"
                        : "Campus life";

  return siteConfig({
    currentHref,
    sectionLabel: "Campus Life",
    navItems: campusNav,
    eyebrow: area ? titleFromSlug(area) : "Campus Life",
    title,
    body:
      "Campus Life pages introduce student experience, clubs, sports, accommodation, support, and gallery routes.",
    primaryAction: { label: "Student Support", href: "/campus-life/support" },
    secondaryActions: [
      { label: "Clubs & Societies", href: "/campus-life/clubs" },
      { label: "Sports & Recreation", href: "/campus-life/sports" },
    ],
    asideBody:
      "Use this section to explore student activities, campus resources, support services, accommodation, sport, and culture.",
    sections: area && area !== "support" && area !== "gallery" ? campusSections("detail", label) : campusSections("default"),
  });
}

const newsCategoryCards = [
  pageCard("Academic News", "/news/category/academics", "Academic news and university updates.", "book", "Open category"),
  pageCard("Research News", "/news/category/research", "Research-related university news.", "sparkles", "Open category"),
  pageCard("Events News", "/news/category/events", "Event-related university news.", "calendar", "Open category"),
];

function newsSections(kind: string, label?: string): PublicPageSection[] {
  if (kind === "article") {
    return [
      {
        eyebrow: "Article Record",
        title: `${label} news article`,
        body: "Article detail pages display university news content, related updates, and publication context.",
        columns: 3,
        cards: [
          infoCard("Article content", "Title, summary, category, and publication date.", "news"),
          infoCard("Attachments", "Documents, media, and supporting files.", "file"),
          infoCard("Related news", "Continue to other university news and updates.", "arrow"),
        ],
      },
    ];
  }

  return [
    {
      eyebrow: "News Listing",
      title: "University communications",
      body: "News pages are built for public article listings and current public guidance when no records are published.",
      columns: 3,
      cards: newsCategoryCards,
    },
    {
      eyebrow: "Communication Hub",
      title: "News, events, and announcements stay separated",
      body: "The public communication routes distinguish articles, event records, and official announcements.",
      tone: "dark",
      columns: 3,
      cards: newsNav,
    },
  ];
}

export function getNewsPage(segments: string[] = []): PublicPageConfig {
  const currentHref = `/news${segments.length ? `/${segments.join("/")}` : ""}`;
  const isCategory = segments[0] === "category";
  const label = titleFromSlug(isCategory ? segments[1] : segments[0]);

  return siteConfig({
    currentHref,
    sectionLabel: "News",
    navItems: newsNav,
    eyebrow: isCategory ? "News Category" : segments[0] ? "News Article" : "News",
    title: isCategory ? `${label} news` : segments[0] ? `${label} article` : "University news",
    body:
      "News pages use published communication records and organize articles, dates, authors, or newsletter workflows.",
    primaryAction: { label: "Events", href: "/media/events" },
    secondaryActions: [{ label: "Announcements", href: "/media/announcements" }],
    asideBody:
      "News content should come. Use this section to follow university news, announcements, events, and public communications.",
    sections: segments[0] && !isCategory ? newsSections("article", label) : newsSections("listing"),
  });
}

export function getEventsPage(segments: string[] = []): PublicPageConfig {
  const currentHref = `/events${segments.length ? `/${segments.join("/")}` : ""}`;
  const label = titleFromSlug(segments[0]);

  return siteConfig({
    currentHref,
    sectionLabel: "Events",
    navItems: newsNav,
    eyebrow: segments[0] ? "Event Detail" : "Events",
    title: segments[0] ? `${label} event` : "University events",
    body:
      "Events pages are prepared for event records, dates, venues, and registration guidance when those fields are available.",
    primaryAction: { label: "News", href: "/media/news" },
    secondaryActions: [{ label: "Announcements", href: "/media/announcements" }],
    asideBody:
      "Event dates, locations, and registration states should come from event records. The frontend organizes schedules.",
    sections: [
      {
        eyebrow: "Event Records",
        title: segments[0] ? "Event details" : "Upcoming and published events",
        body: "Event cards render public records  and otherwise keep a clear public empty state.",
        columns: 3,
        cards: [
          infoCard("Event title", "Comes from the event record.", "calendar"),
          infoCard("Date and venue", "Event date, time, venue, and access details.", "landmark"),
          infoCard("Registration", "Registration guidance and event participation details.", "clipboard"),
        ],
      },
      {
        eyebrow: "Communication Links",
        title: "Continue through public communications",
        body: "Events sit alongside news and official announcements.",
        tone: "dark",
        columns: 3,
        cards: newsNav,
      },
    ],
  });
}

export function getAnnouncementsPage(): PublicPageConfig {
  return siteConfig({
    currentHref: "/announcements",
    sectionLabel: "Announcements",
    navItems: newsNav,
    eyebrow: "Announcements",
    title: "University announcements",
    body: "Official notices with priority, audience, and publication dates.",
    primaryAction: { label: "News", href: "/media/news" },
    secondaryActions: [{ label: "Events", href: "/media/events" }],
    asideBody: "Only public records are shown. Unsupported dates and urgency labels are avoided.",
    sections: [
      {
        eyebrow: "Announcement Records",
        title: "Public notices",
        body: "Records appear here. Otherwise, an empty state is shown.",
        columns: 3,
        cards: [
          infoCard("Priority", "From the announcement record.", "megaphone"),
          infoCard("Audience", "Relevant audience, priority, and notice context.", "users"),
          infoCard("Dates", "Start and end dates for the notice.", "calendar"),
        ],
      },
      {
        eyebrow: "Communication Links",
        title: "News, events, notices",
        body: "Each communication type keeps its own route.",
        tone: "dark",
        columns: 3,
        cards: newsNav,
      },
    ],
  });
}
