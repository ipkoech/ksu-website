import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  ExternalLink,
  FileText,
  GraduationCap,
  Landmark,
  Library,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type {
  AdmissionsInfoSummary,
  AdmissionsIntakeSummary,
  AdmissionsPageData,
} from "@/lib/get-admissions";
import { ScrollReveal } from "@ksu/ui/components";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { PublicActionLink } from "@/components/public/public-primitives";

type AdmissionsArea =
  | "landing"
  | "undergraduate"
  | "diploma"
  | "certificate-bridging"
  | "postgraduate"
  | "international"
  | "requirements"
  | "fees"
  | "scholarships"
  | "how-to-apply"
  | "brochures"
  | "booklets"
  | "graduation-booklets"
  | "intakes"
  | "intake-detail"
  | "record";

type AdmissionsContentProps = {
  segments: string[];
  data: AdmissionsPageData;
};

type RouteLink = {
  title: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

type HeroImageConfig = {
  src: string;
  alt: string;
};

type TableRow = {
  label: string;
  cells: string[];
};

const officialLinks = {
  overview: "https://kisiiuniversity.ac.ke/admission",
  howToApply: "https://kisiiuniversity.ac.ke/admission/how-to-apply",
  onlineApplication:
    "https://digital.kisiiuniversity.ac.ke/new_student_landing_page",
  admissionCenter:
    "https://digital.kisiiuniversity.ac.ke/students/admissions/center",
  undergraduate:
    "https://kisiiuniversity.ac.ke/admission/undergraduate-application",
  postgraduate:
    "https://kisiiuniversity.ac.ke/admission/postgraduate-education",
  international:
    "https://kisiiuniversity.ac.ke/admission/international-students",
  diploma: "https://kisiiuniversity.ac.ke/admission/diploma-application",
  certificate:
    "https://kisiiuniversity.ac.ke/admission/certificatebridging-application",
  brochurePdf:
    "https://kisiiuniversity.ac.ke/storage/public/downloads//KISII%20UNIVERSITY%20COURSE%20BROCHURE.pdf",
  undergraduateForm:
    "https://kisiiuniversity.ac.ke/storage/public/downloads//APPLICATION%20FORM%20FOR%20UNDERGRADUATE.pdf",
  kuccps: "https://kuccps.net/",
  contact: "https://kisiiuniversity.ac.ke/index.php/contact",
  schoolsDepartments: "https://kisiiuniversity.ac.ke/schools_departments",
};

const navItems: RouteLink[] = [
  {
    title: "Admissions",
    href: "/admissions",
    description: "Start here for application pathways and current actions.",
    icon: GraduationCap,
  },
  {
    title: "Undergraduate",
    href: "/admissions/undergraduate",
    description: "Certificate, diploma, and degree entry routes.",
    icon: BookOpenCheck,
  },
  {
    title: "Diploma",
    href: "/admissions/diploma",
    description: "Diploma routes, requirements, and application guidance.",
    icon: ClipboardCheck,
  },
  {
    title: "Certificate/Bridging",
    href: "/admissions/certificate-bridging",
    description: "Certificate and bridging application pathways.",
    icon: CheckCircle2,
  },
  {
    title: "Postgraduate",
    href: "/admissions/postgraduate",
    description: "Postgraduate diploma, masters, fellowship, and PhD study.",
    icon: Library,
  },
  {
    title: "International",
    href: "/admissions/international",
    description: "Preparation for applicants with foreign qualifications.",
    icon: Compass,
  },
  {
    title: "Requirements",
    href: "/admissions/requirements",
    description: "General entry routes and programme-specific checks.",
    icon: ClipboardCheck,
  },
  {
    title: "Fees",
    href: "/admissions/fees",
    description: "Fee references, cost planning, and payment verification.",
    icon: FileText,
  },
  {
    title: "Scholarships",
    href: "/admissions/scholarships",
    description: "Funding, sponsorship, and scholarship guidance.",
    icon: Sparkles,
  },
  {
    title: "How to Apply",
    href: "/admissions/how-to-apply",
    description: "Step-by-step application and tracking process.",
    icon: CheckCircle2,
  },
  {
    title: "Current Intakes",
    href: "/admissions/intakes",
    description: "Published intake windows with official verification.",
    icon: CalendarDays,
  },
  {
    title: "Brochures",
    href: "/admissions/brochures",
    description: "Programme brochures and course booklet references.",
    icon: FileText,
  },
  {
    title: "Booklets",
    href: "/admissions/booklets",
    description: "Admissions booklets and applicant references.",
    icon: Library,
  },
  {
    title: "Graduation Booklets",
    href: "/admissions/graduation-booklets",
    description: "Graduation booklets and graduand guidance.",
    icon: GraduationCap,
  },
];

const heroImages: Record<AdmissionsArea, HeroImageConfig> = {
  landing: {
    src: "/images/Home/OurKSU-82.jpg",
    alt: "University students walking across campus",
  },
  undergraduate: {
    src: "/images/Home/KSUGreenLandscaping.jpg",
    alt: "Undergraduate students studying together",
  },
  diploma: {
    src: "/images/Home/OurKSU-82.jpg",
    alt: "Students in a classroom discussion",
  },
  "certificate-bridging": {
    src: "/images/Home/KSUGreenLandscaping.jpg",
    alt: "Students collaborating on coursework",
  },
  postgraduate: {
    src: "/images/Home/um-hero.jpg",
    alt: "Graduate students working in a library",
  },
  international: {
    src: "/images/Home/OurKSU-82.jpg",
    alt: "Campus path with international student planning context",
  },
  requirements: {
    src: "/images/Home/VCProfSUKUBA.jpg",
    alt: "Application documents and checklist",
  },
  fees: {
    src: "/images/Home/um-hero.jpg",
    alt: "Financial planning documents",
  },
  scholarships: {
    src: "/images/Home/OurKSU-82.jpg",
    alt: "Students on campus after class",
  },
  "how-to-apply": {
    src: "/images/Home/KSUGreenLandscaping.jpg",
    alt: "Applicant using a laptop for an online application",
  },
  brochures: {
    src: "/images/Home/um-hero.jpg",
    alt: "Printed academic brochures and books",
  },
  booklets: {
    src: "/images/Home/OurKSU-82.jpg",
    alt: "Booklets arranged on a study desk",
  },
  "graduation-booklets": {
    src: "/images/Home/VCProfSUKUBA.jpg",
    alt: "Graduation ceremony audience",
  },
  intakes: {
    src: "/images/Home/KSUGreenLandscaping.jpg",
    alt: "Academic calendar planning on a desk",
  },
  "intake-detail": {
    src: "/images/Home/um-hero.jpg",
    alt: "Calendar and application deadline planning",
  },
  record: {
    src: "/images/Home/OurKSU-82.jpg",
    alt: "Admissions record checklist on a desk",
  },
};

const applicationSteps = [
  {
    title: "Choose your level and route",
    body: "Decide whether you are applying through KUCCPS placement, a self-sponsored online application, postgraduate admission, or an international applicant route.",
  },
  {
    title: "Confirm the programme requirements",
    body: "Use the course booklet and programme pages to verify level, school, subject requirements, duration, and study mode before opening an application.",
  },
  {
    title: "Prepare academic and identity records",
    body: "Have certificates, transcripts where required, identity details, passport details for international applicants, and any proposal or referee documents ready.",
  },
  {
    title: "Apply through the official system",
    body: "Use the university online application portal or the official form only where current guidance asks for a downloadable form.",
  },
  {
    title: "Track admission and registration",
    body: "After admission or placement, use the admission centre to access admission documents, self-register, and monitor approvals.",
  },
];

const requirementRows: TableRow[] = [
  {
    label: "Certificate",
    cells: [
      "KCSE C- or equivalent",
      "O-Level Division III or A-Level subsidiary pass routes may apply",
      "Confirm course-specific subjects before submitting",
    ],
  },
  {
    label: "Diploma",
    cells: [
      "KCSE C or equivalent",
      "KCSE C- with a relevant certificate may be considered",
      "Professional programmes may set higher cluster requirements",
    ],
  },
  {
    label: "Bachelor's degree",
    cells: [
      "KCSE C+ or equivalent",
      "Diploma, HND, A-Level, and Senate-recognized progression routes may apply",
      "KUCCPS and self-sponsored routes must both meet programme criteria",
    ],
  },
  {
    label: "Postgraduate diploma",
    cells: [
      "At least a pass degree",
      "Relevant discipline or professional background may be required",
      "Attach certified degree certificate and transcript where requested",
    ],
  },
  {
    label: "Masters",
    cells: [
      "Upper Second Class Honours or accepted equivalent",
      "Lower qualifications may require postgraduate diploma evidence",
      "Programme and school requirements remain decisive",
    ],
  },
  {
    label: "PhD",
    cells: [
      "Relevant masters degree or Senate-recognized equivalent",
      "Research proposal may be required",
      "Foreign qualification checks and translations may apply",
    ],
  },
];

const feeRows: TableRow[] = [
  {
    label: "Tuition",
    cells: [
      "Programme-specific",
      "Confirm in the current course booklet and official fee schedule",
      "Depends on level, school, duration, and mode of study",
    ],
  },
  {
    label: "Application charges",
    cells: [
      "Current amount only from official guidance",
      "Pay only through approved university channels",
      "Keep payment evidence for application tracking",
    ],
  },
  {
    label: "Student services",
    cells: [
      "May include registration, examination, medical, ICT, library, and activity charges",
      "Confirm during admission or reporting",
      "Some charges are annual while others are once-off",
    ],
  },
  {
    label: "Living costs",
    cells: [
      "Accommodation, meals, transport, and learning materials vary by student",
      "Review joining instructions before reporting",
      "International students should include immigration and travel costs",
    ],
  },
];

const supportRows: TableRow[] = [
  {
    label: "KUCCPS placement",
    cells: [
      "Government-sponsored undergraduate applicants",
      "Verify through KUCCPS and university admission records",
      "Placement still requires programme eligibility",
    ],
  },
  {
    label: "Graduate support",
    cells: [
      "Research Office support may include graduate scholarships and research grants",
      "Check official postgraduate and research notices",
      "Deadlines and eligibility can change by call",
    ],
  },
  {
    label: "External sponsors",
    cells: [
      "County, employer, NGO, or private sponsorship",
      "Prepare sponsor letters and payment commitments",
      "Confirm fee-clearance requirements with the university",
    ],
  },
  {
    label: "Official announcements",
    cells: [
      "Scholarship and bursary calls should appear as official notices",
      "Avoid third-party claims that are not published by the university",
      "Confirm deadlines before sharing documents or payments",
    ],
  },
];

function areaFromSegments(segments: string[], data: AdmissionsPageData) {
  const [area, id] = segments;
  const known = navItems
    .map((item) => item.href.replace("/admissions", "").replace(/^\//, ""))
    .filter(Boolean);

  if (area === "intakes" && id) {
    return {
      area: "intake-detail" as AdmissionsArea,
      record: undefined,
      intake: data.intakes.find((item) => item.slug === id),
    };
  }

  if (area === "certificate" || area === "bridging") {
    return { area: "certificate-bridging" as AdmissionsArea };
  }

  if (area === "brochure") {
    return { area: "brochures" as AdmissionsArea };
  }

  if (area === "booklet") {
    return { area: "booklets" as AdmissionsArea };
  }

  if (area === "graduation" || area === "graduation-booklet") {
    return { area: "graduation-booklets" as AdmissionsArea };
  }

  if (!area) return { area: "landing" as AdmissionsArea };
  if (known.includes(area)) return { area: area as AdmissionsArea };

  return {
    area: "record" as AdmissionsArea,
    record: data.admissionInfo.find((item) => item.slug === area),
  };
}

function titleFromSlug(slug?: string) {
  if (!slug) return "Admissions guidance";

  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function parseAdmissionDate(value?: string | null) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatAdmissionDate(value?: string | null) {
  const date = parseAdmissionDate(value);
  if (!date) return value ?? "To be confirmed";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function intakeDeadline(intake: AdmissionsIntakeSummary) {
  return intake.lateApplicationEnd || intake.applicationEnd;
}

function isPastDate(value?: string | null) {
  const date = parseAdmissionDate(value);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}

function intakeStatus(intake: AdmissionsIntakeSummary) {
  if (isPastDate(intakeDeadline(intake))) return "Deadline passed";
  return intake.isOpen ? "Open" : "Scheduled or closed";
}

function daysUntil(value?: string | null) {
  const date = parseAdmissionDate(value);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / 86400000);
}

function intakeStatusClass(intake: AdmissionsIntakeSummary) {
  const status = intakeStatus(intake);
  const remainingDays = daysUntil(intakeDeadline(intake));

  if (status === "Deadline passed")
    return "bg-surface-muted text-muted-foreground";
  if (remainingDays !== null && remainingDays <= 14) {
    return "bg-red-50 text-red-700 ring-1 ring-red-100";
  }
  if (remainingDays !== null && remainingDays <= 30) {
    return "bg-amber-50 text-amber-800 ring-1 ring-amber-100";
  }
  if (status === "Open")
    return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100";
  return "bg-accent text-primary ring-1 ring-border";
}

function intakeDeadlineLabel(intake?: AdmissionsIntakeSummary) {
  if (!intake) return "Verify in portal";
  const remainingDays = daysUntil(intakeDeadline(intake));
  if (remainingDays === null) return "Deadline to be confirmed";
  if (remainingDays < 0) return "Deadline passed";
  if (remainingDays === 0) return "Closes today";
  if (remainingDays === 1) return "Closes tomorrow";
  return `${remainingDays} days left`;
}

function contentExcerpt(text?: string | null) {
  if (!text) return "";
  return text
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ActionLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
}) {
  return (
    <PublicActionLink
      action={{
        label: typeof children === "string" ? children : "Open",
        href,
        external: href.startsWith("http"),
      }}
      primary={primary}
    />
  );
}

function SideNav({ currentHref }: { currentHref: string }) {
  return (
    <nav
      aria-label="Admissions navigation"
      className="max-lg:hidden border border-border bg-white p-2 shadow-sm lg:sticky lg:top-24"
    >
      <p className="px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-secondary">
        Admissions
      </p>
      <div className="mt-1 grid gap-1 sm:grid-cols-2 lg:grid-cols-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentHref === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex min-h-12 items-center gap-2 border px-3 py-2 text-sm transition-colors duration-200 ${
                active
                  ? "border-primary/30 bg-primary/5 text-foreground"
                  : "border-transparent text-muted-foreground hover:border-border hover:bg-surface-subtle hover:text-foreground"
              }`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center ${
                  active
                    ? "bg-primary text-white"
                    : "bg-surface-muted text-primary group-hover:bg-primary group-hover:text-white"
                }`}
              >
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{item.title}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function PageHero({
  area,
  eyebrow,
  title,
  body,
  currentHref,
  data,
}: {
  area: AdmissionsArea;
  eyebrow: string;
  title: string;
  body: string;
  currentHref: string;
  data: AdmissionsPageData;
}) {
  const image = heroImages[area] ?? heroImages.landing;
  const featuredIntake =
    data.intakes.find((intake) => intake.isOpen) ?? data.intakes[0];
  const intakeDeadline =
    featuredIntake?.lateApplicationEnd || featuredIntake?.applicationEnd;
  const intakeClosed = intakeDeadline ? isPastDate(intakeDeadline) : false;

  return (
    <section className="border-b border-border bg-white px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="w-full">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "Admissions", href: "/admissions" },
            { label: eyebrow },
          ]}
        />
        <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.36fr)] lg:items-stretch">
          <div className="max-w-4xl py-1">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary">
              {eyebrow}
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.08] text-foreground sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              {body}
            </p>
            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <ActionLink href={officialLinks.onlineApplication} primary>
                Apply online
              </ActionLink>
              {currentHref !== "/admissions/how-to-apply" ? (
                <ActionLink href="/admissions/how-to-apply">
                  How to apply
                </ActionLink>
              ) : null}
              {currentHref !== "/admissions/intakes" ? (
                <ActionLink href="/admissions/intakes">
                  Current intakes
                </ActionLink>
              ) : null}
            </div>
          </div>

          <div
            className="relative min-h-[13rem] overflow-hidden border border-border bg-brand-overlay"
            role="img"
            aria-label={image.alt}
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-90"
              style={{ backgroundImage: `url(${image.src})` }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.72),rgba(15,23,42,0.16))]" />
            <div className="relative flex h-full min-h-[13rem] flex-col justify-end p-4 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary">
                {featuredIntake ? "Current intake" : "Official systems"}
              </p>
              {featuredIntake ? (
                <div className="mt-2 border-b border-white/20 pb-3">
                  <p className="text-lg font-semibold">{featuredIntake.name}</p>
                  <p className="mt-1 text-xs leading-5 text-white/75">
                    {intakeClosed
                      ? "The recorded deadline has passed. Check the portal for the next intake."
                      : `${featuredIntake.isOpen ? "Applications open" : "Scheduled intake"} · closes ${formatAdmissionDate(intakeDeadline)}`}
                  </p>
                </div>
              ) : null}
              <div className="mt-3 grid gap-2">
                <HeroActionLink
                  href={officialLinks.admissionCenter}
                  icon={ShieldCheck}
                >
                  Admission centre
                </HeroActionLink>
                <HeroActionLink
                  href={officialLinks.brochurePdf}
                  icon={BookOpenCheck}
                >
                  Course booklet
                </HeroActionLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroActionLink({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group inline-flex min-h-10 items-center justify-between gap-3 border border-white/20 bg-white/15 px-3 text-sm font-bold text-white backdrop-blur transition-colors duration-200 hover:bg-white/25"
    >
      <span className="inline-flex min-w-0 items-center gap-2">
        <Icon aria-hidden className="h-4 w-4 shrink-0 text-secondary" />
        <span className="truncate">{children}</span>
      </span>
      <ExternalLink aria-hidden className="h-4 w-4 shrink-0 opacity-75" />
    </a>
  );
}

function Section({
  eyebrow,
  title,
  body,
  children,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <ScrollReveal
      as="section"
      className={
        dark
          ? "border-y border-border bg-brand-overlay px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-10"
          : "border-b border-border bg-white px-4 py-8 sm:px-6 lg:px-8 lg:py-10"
      }
    >
      <div className="grid w-full min-w-0 gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <div className="min-w-0">
          <p
            className={
              dark
                ? "text-xs font-bold uppercase tracking-[0.08em] text-secondary"
                : "text-xs font-bold uppercase tracking-[0.08em] text-secondary"
            }
          >
            {eyebrow}
          </p>
          <h2
            className={
              dark
                ? "mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-white sm:text-3xl"
                : "mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-foreground sm:text-3xl"
            }
          >
            {title}
          </h2>
          {body ? (
            <p
              className={
                dark
                  ? "mt-3 text-sm leading-7 text-white/70"
                  : "mt-3 text-sm leading-7 text-muted-foreground"
              }
            >
              {body}
            </p>
          ) : null}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </ScrollReveal>
  );
}

function StatStrip({ intakes }: { intakes: AdmissionsIntakeSummary[] }) {
  const openIntakes = intakes.filter(
    (intake) => intake.isOpen && !isPastDate(intakeDeadline(intake)),
  ).length;

  return (
    <div className="grid border border-border bg-white md:grid-cols-3">
      {[
        [
          "Applicant routes",
          "KUCCPS, self-sponsored, postgraduate, international",
        ],
        ["Published intakes", String(intakes.length || "Portal verified")],
        ["Open records", String(openIntakes || "Check portal")],
      ].map(([label, value]) => (
        <div
          key={label}
          className="border-b border-border p-5 md:border-b-0 md:border-r last:md:border-r-0"
        >
          <p className="text-xs font-semibold uppercase text-muted-foreground">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        </div>
      ))}
    </div>
  );
}

function ComparisonTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: TableRow[];
}) {
  return (
    <div className="overflow-x-auto border border-border bg-white">
      <table className="min-w-[760px] w-full border-collapse text-left">
        <thead className="bg-brand-overlay text-white">
          <tr>
            <th className="w-52 px-5 py-4 text-sm font-semibold">Route</th>
            {headers.map((header) => (
              <th key={header} className="px-5 py-4 text-sm font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {rows.map((row) => (
            <tr key={row.label} className="align-top">
              <th className="bg-surface-subtle px-5 py-4 text-sm font-semibold text-foreground">
                {row.label}
              </th>
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.label}-${index}`}
                  className="px-5 py-4 text-sm leading-7 text-muted-foreground"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProcessTimeline() {
  return (
    <ol className="grid gap-4">
      {applicationSteps.map((step, index) => (
        <li
          key={step.title}
          className="grid gap-4 border border-border bg-white p-5 sm:grid-cols-[72px_minmax(0,1fr)]"
        >
          <span className="flex h-12 w-12 items-center justify-center bg-primary text-lg font-semibold text-white">
            {index + 1}
          </span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">
              {step.body}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function AdmissionsJourneyMap({
  intakes,
  compact = false,
}: {
  intakes: AdmissionsIntakeSummary[];
  compact?: boolean;
}) {
  const openIntake =
    intakes.find(
      (intake) => intake.isOpen && !isPastDate(intakeDeadline(intake)),
    ) ?? intakes[0];
  const stages = [
    {
      title: "Find programme",
      body: "Compare level, department, duration, study mode, and entry requirements.",
      href: "/academics/programmes",
      action: "Browse programmes",
      icon: Search,
      meta: "Academic fit",
    },
    {
      title: "Check intake",
      body: openIntake
        ? `${openIntake.name}: ${intakeDeadlineLabel(openIntake)}.`
        : "Use the portal to confirm open application windows.",
      href: openIntake
        ? `/admissions/intakes/${openIntake.slug}`
        : "/admissions/intakes",
      action: "View intake",
      icon: CalendarDays,
      meta: openIntake ? intakeStatus(openIntake) : "Portal check",
      intake: openIntake,
    },
    {
      title: "Prepare documents",
      body: "Gather academic records, identity details, transcripts, and route-specific evidence.",
      href: "/admissions/requirements",
      action: "Check requirements",
      icon: ClipboardCheck,
      meta: "Applicant file",
    },
    {
      title: "Apply officially",
      body: "Submit through the online application system or the published route for your intake.",
      href: officialLinks.onlineApplication,
      action: "Apply online",
      icon: FileText,
      meta: "Official portal",
      external: true,
    },
    {
      title: "Track admission",
      body: "Use the admission centre after admission or placement for documents and registration.",
      href: officialLinks.admissionCenter,
      action: "Admission centre",
      icon: ShieldCheck,
      meta: "After offer",
      external: true,
    },
  ];

  return (
    <div
      className={
        compact
          ? "grid gap-3 lg:grid-cols-5"
          : "grid gap-4 md:grid-cols-2 xl:grid-cols-5"
      }
    >
      {stages.map((stage, index) => {
        const Icon = stage.icon;
        const statusClass = stage.intake
          ? intakeStatusClass(stage.intake)
          : "bg-accent text-primary ring-1 ring-border";
        const external = Boolean(stage.external);
        const content = (
          <>
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass}`}
              >
                {stage.meta}
              </span>
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.08em] text-secondary">
              Step {index + 1}
            </p>
            <h3 className="mt-2 text-base font-semibold leading-6 text-foreground">
              {stage.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">
              {stage.body}
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              {stage.action}
              {external ? (
                <ExternalLink aria-hidden className="h-4 w-4" />
              ) : (
                <ArrowRight aria-hidden className="h-4 w-4" />
              )}
            </span>
          </>
        );

        const className =
          "group flex min-w-0 flex-col border border-border bg-white p-4 shadow-sm transition-colors duration-200 hover:border-primary/35 hover:bg-primary/5";

        return external ? (
          <a
            key={stage.title}
            href={stage.href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
          >
            {content}
          </a>
        ) : (
          <Link key={stage.title} href={stage.href} className={className}>
            {content}
          </Link>
        );
      })}
    </div>
  );
}

function AdmissionsResourcePanel({ data }: { data: AdmissionsPageData }) {
  const records = data.admissionInfo.slice(0, 4);

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.38fr)]">
      <div className="grid gap-4 md:grid-cols-2">
        {records.length
          ? records.map((record) => {
              const href =
                record.externalUrl ||
                record.attachmentUrl ||
                `/admissions/${record.slug}`;
              const external = href.startsWith("http");
              const body =
                record.summary ||
                contentExcerpt(record.content) ||
                "Published admissions guidance.";
              const content = (
                <>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary">
                    {formatAdmissionResourceType(record.contentType)}
                  </p>
                  <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">
                    {record.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {body}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    {external ? "Open resource" : "Read guidance"}
                    {external ? (
                      <ExternalLink aria-hidden className="h-4 w-4" />
                    ) : (
                      <ArrowRight aria-hidden className="h-4 w-4" />
                    )}
                  </span>
                </>
              );

              const className =
                "group min-w-0 border border-border bg-white p-5 transition-colors duration-200 hover:border-primary/35 hover:bg-primary/5";

              return external ? (
                <a
                  key={record.id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                >
                  {content}
                </a>
              ) : (
                <Link key={record.id} href={href} className={className}>
                  {content}
                </Link>
              );
            })
          : [
              {
                title: "Course booklet",
                href: officialLinks.brochurePdf,
                description:
                  "Use the official booklet for programme requirements, duration, mode, and planning references.",
                icon: BookOpenCheck,
              },
              {
                title: "How to apply",
                href: officialLinks.howToApply,
                description:
                  "Open official application guidance before submitting any form or payment.",
                icon: ClipboardCheck,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group min-w-0 border border-border bg-white p-5 transition-colors duration-200 hover:border-primary/35 hover:bg-primary/5"
                >
                  <Icon aria-hidden className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 text-base font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Open resource
                    <ExternalLink aria-hidden className="h-4 w-4" />
                  </span>
                </a>
              );
            })}
      </div>

      <aside className="border border-primary/15 bg-primary/[0.06] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary">
          Verification rule
        </p>
        <h3 className="mt-3 text-xl font-semibold leading-7 text-foreground">
          Use official resources before acting.
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Downloadable forms, booklets, and links are helpful only when they
          match the current intake, programme, fee guidance, and application
          route.
        </p>
        <div className="mt-5 grid gap-2">
          <ActionLink href="/admissions/brochures">View brochures</ActionLink>
          <ActionLink href="/downloads">Open downloads</ActionLink>
        </div>
      </aside>
    </div>
  );
}

function formatAdmissionResourceType(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function CheckList({
  items,
  dark = false,
}: {
  items: string[];
  dark?: boolean;
}) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className={
            dark
              ? "flex gap-3 border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/75"
              : "flex gap-3 border border-border bg-white p-4 text-sm leading-7 text-muted-foreground"
          }
        >
          <CheckCircle2
            aria-hidden
            className={
              dark
                ? "mt-1 h-4 w-4 shrink-0 text-secondary"
                : "mt-1 h-4 w-4 shrink-0 text-primary"
            }
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function LinkPanel({
  links,
  dark = false,
}: {
  links: RouteLink[];
  dark?: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {links.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={
              dark
                ? "group border border-white/10 bg-white/[0.04] p-5 transition-colors duration-200 hover:bg-white/[0.08]"
                : "group border border-border bg-white p-5 transition-colors duration-200 hover:border-primary/35 hover:bg-primary/5"
            }
          >
            <span
              className={
                dark
                  ? "flex h-11 w-11 items-center justify-center bg-white/10 text-secondary"
                  : "flex h-11 w-11 items-center justify-center bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white"
              }
            >
              <Icon aria-hidden className="h-5 w-5" />
            </span>
            <h3
              className={
                dark
                  ? "mt-5 text-lg font-semibold text-white"
                  : "mt-5 text-lg font-semibold text-foreground"
              }
            >
              {item.title}
            </h3>
            <p
              className={
                dark
                  ? "mt-2 text-sm leading-7 text-white/70"
                  : "mt-2 text-sm leading-7 text-muted-foreground"
              }
            >
              {item.description}
            </p>
            <span
              className={
                dark
                  ? "mt-5 inline-flex items-center gap-2 text-sm font-semibold text-secondary"
                  : "mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              }
            >
              Open
              <ArrowRight aria-hidden className="h-4 w-4" />
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function IntakesTable({ intakes }: { intakes: AdmissionsIntakeSummary[] }) {
  if (!intakes.length) {
    return (
      <div className="border border-border bg-white p-6">
        <h3 className="text-xl font-semibold text-foreground">
          Live intakes are verified in the online application portal
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          No intake records were returned to this frontend. Applicants should
          use the official portal to confirm open intakes, reporting dates,
          programme availability, and deadlines.
        </p>
        <div className="mt-5">
          <ActionLink href={officialLinks.onlineApplication} primary>
            Check active intakes
          </ActionLink>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-border bg-white">
      <table className="min-w-[760px] w-full border-collapse text-left">
        <thead className="bg-brand-overlay text-white">
          <tr>
            <th className="px-5 py-4 text-sm font-semibold">Intake</th>
            <th className="px-5 py-4 text-sm font-semibold">Window</th>
            <th className="px-5 py-4 text-sm font-semibold">Status</th>
            <th className="px-5 py-4 text-sm font-semibold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {intakes.map((intake) => (
            <tr key={intake.id}>
              <td className="px-5 py-4">
                <p className="font-semibold text-foreground">{intake.name}</p>
                {intake.lateApplicationEnd ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Late applications to{" "}
                    {formatAdmissionDate(intake.lateApplicationEnd)}
                  </p>
                ) : null}
              </td>
              <td className="px-5 py-4 text-sm leading-7 text-muted-foreground">
                {formatAdmissionDate(intake.applicationStart)} to{" "}
                {formatAdmissionDate(intake.applicationEnd)}
              </td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex items-center px-3 py-1 text-xs font-semibold ${
                    intakeStatus(intake) === "Open"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-surface-muted text-muted-foreground"
                  }`}
                >
                  {intakeStatus(intake)}
                </span>
              </td>
              <td className="px-5 py-4">
                <Link
                  href={`/admissions/intakes/${intake.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  View details
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecordInner({
  record,
  body,
  external = false,
}: {
  record: AdmissionsInfoSummary;
  body: string;
  external?: boolean;
}) {
  return (
    <>
      <p className="text-xs font-semibold uppercase text-secondary">
        {record.contentType.replace(/_/g, " ")}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-foreground">
        {record.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">
        {body}
      </p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        {external ? "Open official resource" : "Read guidance"}
        {external ? (
          <ExternalLink aria-hidden className="h-4 w-4" />
        ) : (
          <ArrowRight aria-hidden className="h-4 w-4" />
        )}
      </span>
    </>
  );
}

function LandingSections({ data }: { data: AdmissionsPageData }) {
  return (
    <>
      <Section
        eyebrow="Applicant Journey"
        title="Follow the full admissions flow in order"
        body="The admissions experience should help applicants move from programme choice to intake verification, document preparation, official submission, and admission tracking without guessing the next step."
      >
        <AdmissionsJourneyMap intakes={data.intakes} />
      </Section>

      <Section
        eyebrow="Admissions Tasks"
        title="Start with the three decisions that determine the right route"
        body="Admissions content is now grouped around applicant tasks: confirm live intake status, choose the correct application route, and verify the programme before submitting."
      >
        <div className="grid gap-5 xl:grid-cols-3">
          <TaskCard
            icon={CalendarDays}
            title="1. Confirm current intakes"
            body="Check whether applications are open, scheduled, or closed before preparing documents or making payment."
            href="/admissions/intakes"
            action="View intakes"
          />
          <TaskCard
            icon={ClipboardCheck}
            title="2. Choose application route"
            body="Use KUCCPS, direct online application, postgraduate, or international guidance according to how you are joining."
            href="/admissions/how-to-apply"
            action="Choose route"
          />
          <TaskCard
            icon={Search}
            title="3. Verify programme fit"
            body="Compare requirements, level, duration, school ownership, and mode of study before submitting an application."
            href="/academics/programmes"
            action="Find programme"
          />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.42fr)]">
          <StatStrip intakes={data.intakes} />
          <div className="grid gap-5 border border-border bg-surface-subtle p-5">
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary text-white">
                <Search aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Find a programme first
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  Compare level, duration, mode, department, and requirements
                  before starting the application.
                </p>
              </div>
            </div>
            <ActionLink href="/academics/programmes" primary>
              Browse programmes
            </ActionLink>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Study Pathways"
        title="Move from interest to the correct academic level"
        body="The admissions section is organized around the decisions applicants actually make: level of study, requirements, fees, funding, and application timing."
      >
        <LinkPanel
          links={navItems
            .filter((item) => item.href !== "/admissions")
            .slice(0, 6)}
        />
      </Section>

      <Section
        eyebrow="Forms And Resources"
        title="Use backend-published admissions resources where available"
        body="Forms, booklets, notices, and linked resources should appear as part of the admissions workflow, with official fallback links when backend records are not yet populated."
      >
        <AdmissionsResourcePanel data={data} />
      </Section>
    </>
  );
}

function TaskCard({
  icon: Icon,
  title,
  body,
  href,
  action,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
  action: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[12rem] flex-col border border-border bg-white p-5 transition-colors duration-200 hover:border-primary/35 hover:bg-primary/5"
    >
      <span className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{body}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary">
        {action}
        <ArrowRight aria-hidden className="h-4 w-4" />
      </span>
    </Link>
  );
}

type ProgramLevelConfig = {
  sectionTitle: string;
  sectionBody: string;
  tableHeaders: string[];
  tableRows: TableRow[];
  prepTitle: string;
  prepBody: string;
  checklistItems: string[];
  resourceLinks: {
    title: string;
    href: string;
    description: string;
    icon: LucideIcon;
  }[];
};

const programLevelConfigs: Record<string, ProgramLevelConfig> = {
  undergraduate: {
    sectionTitle: "Undergraduate admission routes",
    sectionBody:
      "Undergraduate applicants may enter through certificate, diploma, bachelor's degree, KUCCPS placement, or self-sponsored direct application pathways.",
    tableHeaders: ["Minimum route", "Who it serves", "Before applying"],
    tableRows: requirementRows.slice(0, 3),
    prepTitle: "What undergraduate applicants should have ready",
    prepBody:
      "Prepare a complete file before opening the portal so the application is not delayed by missing academic or identity records.",
    checklistItems: [
      "KCSE certificate or equivalent qualification records.",
      "Certificate, diploma, HND, or A-Level evidence for progression routes.",
      "National ID, passport, or applicant identity details requested by the portal.",
      "Programme choice checked against the course booklet and programme pages.",
      "Payment evidence only after confirming official payment instructions.",
      "KUCCPS placement details where the applicant is government-sponsored.",
    ],
    resourceLinks: [
      {
        title: "Undergraduate admission page",
        href: officialLinks.undergraduate,
        description:
          "General criteria for certificates, diplomas, and bachelor's degrees.",
        icon: GraduationCap,
      },
      {
        title: "Course booklet",
        href: officialLinks.brochurePdf,
        description:
          "Programme requirements, study modes, duration, and tuition references.",
        icon: BookOpenCheck,
      },
      {
        title: "Undergraduate form",
        href: officialLinks.undergraduateForm,
        description:
          "Use only when the current route asks for a downloadable form.",
        icon: FileText,
      },
    ],
  },
  diploma: {
    sectionTitle: "Diploma entry routes and application checks",
    sectionBody:
      "Diploma applicants should confirm the exact programme, school, minimum grade, progression route, and intake before submitting an application.",
    tableHeaders: ["Minimum route", "Progression option", "Before applying"],
    tableRows: [
      {
        label: "Diploma",
        cells: [
          "KCSE C or equivalent",
          "KCSE C- with a relevant certificate may be considered",
          "Check course-specific subject requirements and professional rules",
        ],
      },
      {
        label: "Professional diploma",
        cells: [
          "May require higher grades or regulator-specific conditions",
          "Prior certificate or experiential-learning routes may apply only where published",
          "Verify against the current course booklet and programme page",
        ],
      },
    ],
    prepTitle: "Prepare a complete application file",
    prepBody:
      "Diploma applications should be submitted only after the applicant has matched the programme to the current requirements and official intake.",
    checklistItems: [
      "KCSE certificate or equivalent academic record.",
      "Relevant certificate evidence for certificate-to-diploma progression routes.",
      "Programme requirements checked in the course booklet.",
      "Identity details requested by the official application portal.",
      "Payment instructions confirmed from official university records.",
      "Open intake verified before submission.",
    ],
    resourceLinks: [
      {
        title: "Apply online",
        href: officialLinks.onlineApplication,
        description:
          "Submit or continue a diploma application through the official system.",
        icon: ClipboardCheck,
      },
      {
        title: "Diploma application page",
        href: officialLinks.diploma,
        description: "Open the current official diploma application resource.",
        icon: FileText,
      },
      {
        title: "Course booklet",
        href: officialLinks.brochurePdf,
        description:
          "Check diploma programme details, duration, study mode, and fees.",
        icon: BookOpenCheck,
      },
    ],
  },
  "certificate-bridging": {
    sectionTitle: "Certificate courses and bridging pathways",
    sectionBody:
      "Certificate and bridging applicants should confirm the approved pathway, minimum academic record, and target progression before applying.",
    tableHeaders: ["Typical route", "Purpose", "Before applying"],
    tableRows: [
      {
        label: "Certificate",
        cells: [
          "KCSE C- or equivalent for many certificate routes",
          "Entry into foundational or professional training",
          "Check the specific certificate course requirements",
        ],
      },
      {
        label: "Bridging",
        cells: [
          "Prior qualification plus a published bridging need",
          "Qualification upgrade or subject preparation",
          "Confirm that the bridging pathway is currently advertised",
        ],
      },
    ],
    prepTitle: "What certificate and bridging applicants should prepare",
    prepBody:
      "These routes are often programme-specific, so the published course record and intake notice matter more than a general summary.",
    checklistItems: [
      "KCSE, O-Level, A-Level, or equivalent academic record.",
      "Prior certificate or diploma evidence where bridging depends on progression.",
      "Target programme checked against the course booklet.",
      "Approved bridging pathway confirmed before payment.",
      "Official intake and deadline verified through the application portal.",
      "Any school-specific instructions or attachments prepared.",
    ],
    resourceLinks: [
      {
        title: "Apply online",
        href: officialLinks.onlineApplication,
        description:
          "Submit or continue an application through the official system.",
        icon: ClipboardCheck,
      },
      {
        title: "Certificate/bridging page",
        href: officialLinks.certificate,
        description:
          "Open the legacy official certificate and bridging admission resource.",
        icon: FileText,
      },
      {
        title: "Course booklet",
        href: officialLinks.brochurePdf,
        description:
          "Check certificate programmes, bridging context, requirements, and duration.",
        icon: BookOpenCheck,
      },
    ],
  },
  postgraduate: {
    sectionTitle: "Postgraduate study routes and records",
    sectionBody:
      "Graduate applicants should match the programme level with academic records, transcripts, research interests, and any programme-specific requirements.",
    tableHeaders: ["Typical minimum", "Required preparation", "Official check"],
    tableRows: requirementRows.slice(3),
    prepTitle: "Prepare certified academic records before applying",
    prepBody:
      "Postgraduate applications are more document-heavy than undergraduate routes, especially where transcripts, referee forms, proposals, or foreign qualification checks are required.",
    checklistItems: [
      "Certified degree certificates and transcripts.",
      "KCSE, O-Level, or A-Level certificates where the route asks for them.",
      "Research proposal for PhD or research-intensive programmes where required.",
      "Referee forms or professional evidence when requested by the school.",
      "Accreditation evidence for foreign university qualifications where required.",
      "English translations and language evidence for non-English records.",
    ],
    resourceLinks: [],
  },
  international: {
    sectionTitle: "Prepare qualifications, identity, and arrival records",
    sectionBody:
      "International applicants use the same official application controls but should prepare additional qualification and immigration documentation before submitting.",
    tableHeaders: [],
    tableRows: [],
    prepTitle: "Plan academics and student life together",
    prepBody:
      "Before arrival, review the academic school, student support, official portal, and campus-life information so registration and reporting are predictable.",
    checklistItems: [
      "Certified academic certificates and transcripts for the intended level of study.",
      "Evidence that foreign university qualifications come from accredited institutions where required.",
      "English translations for academic records issued in another language.",
      "Proof of English proficiency where requested for non-English-speaking education systems.",
      "Passport details and any immigration documentation requested during admission.",
      "Programme, fee, reporting, and accommodation planning before travel.",
    ],
    resourceLinks: [
      {
        title: "Academic schools",
        href: officialLinks.schoolsDepartments,
        description: "Review the schools and departments that host programmes.",
        icon: Landmark,
      },
      {
        title: "Campus life",
        href: "/campus-life",
        description:
          "Student support, accommodation context, activities, and services.",
        icon: Users,
      },
      {
        title: "International admission page",
        href: officialLinks.international,
        description:
          "Open the current official page for international applicants.",
        icon: Compass,
      },
    ],
  },
};

function ProgramLevelSection({ area }: { area: string }) {
  const config = programLevelConfigs[area];
  if (!config) return null;

  const isInternational = area === "international";
  const hasTable = config.tableRows.length > 0;
  const hasResources = config.resourceLinks.length > 0;

  const resourceEyebrow =
    area === "undergraduate"
      ? "Official Undergraduate Resources"
      : area === "international"
        ? "Arrival Context"
        : area === "certificate-bridging"
          ? "Resources"
          : `${area.charAt(0).toUpperCase() + area.slice(1)} Resources`;

  const resourceTitle =
    area === "undergraduate"
      ? "Forms, booklet, and programme pages"
      : area === "certificate-bridging"
        ? "Official certificate and bridging references"
        : area === "international"
          ? "Plan academics and student life together"
          : `Official ${area} references`;

  const resourceBody =
    area === "certificate-bridging"
      ? "Use the university application system for live submission and current availability."
      : "Use the local records and official resources together so applicants do not rely on outdated shared links.";

  return (
    <>
      {hasTable ? (
        <Section
          eyebrow="Entry Pathways"
          title={config.sectionTitle}
          body={config.sectionBody}
        >
          <ComparisonTable
            headers={config.tableHeaders}
            rows={config.tableRows}
          />
        </Section>
      ) : (
        <Section
          eyebrow={
            isInternational ? "International Preparation" : "Entry Pathways"
          }
          title={config.sectionTitle}
          body={config.sectionBody}
        >
          <CheckList items={config.checklistItems} />
        </Section>
      )}

      {hasTable ? (
        <Section
          eyebrow={area === "postgraduate" ? "Documents" : "Preparation"}
          title={config.prepTitle}
          body={config.prepBody}
          dark
        >
          <CheckList dark items={config.checklistItems} />
        </Section>
      ) : null}

      {hasResources && !isInternational ? (
        <Section
          eyebrow={resourceEyebrow}
          title={resourceTitle}
          body={resourceBody}
        >
          <LinkPanel links={config.resourceLinks.map((l) => ({ ...l }))} />
        </Section>
      ) : null}

      {isInternational ? (
        <Section
          eyebrow={resourceEyebrow}
          title={resourceTitle}
          body={resourceBody}
          dark
        >
          <LinkPanel dark links={config.resourceLinks.map((l) => ({ ...l }))} />
        </Section>
      ) : null}
    </>
  );
}

function RequirementsSections() {
  return (
    <>
      <Section
        eyebrow="Entry Criteria"
        title="General minimums by level of study"
        body="These requirements are an applicant planning guide. Programme-specific subject requirements, professional regulator conditions, and Senate-recognized equivalencies remain decisive."
      >
        <ComparisonTable
          headers={["General minimum", "Alternative routes", "Important check"]}
          rows={requirementRows}
        />
      </Section>

      <Section
        eyebrow="Programme Checks"
        title="Do not submit before checking the specific programme"
        body="A general minimum can qualify an applicant for a level but not necessarily for every programme in that level."
        dark
      >
        <CheckList
          dark
          items={[
            "Confirm subject clusters and minimum grades for professional programmes.",
            "Check programme duration, study mode, and department ownership.",
            "Use KUCCPS for government-sponsored placement requirements.",
            "Use the course booklet and programme record before payment.",
          ]}
        />
      </Section>
    </>
  );
}

function FeesSections() {
  return (
    <>
      <Section
        eyebrow="Cost Planning"
        title="Fees must be verified from current official records"
        body="The public admissions page should help students plan without inventing amounts. Tuition and payment instructions must come from the current booklet, fee schedule, joining instructions, or admissions office."
      >
        <ComparisonTable
          headers={["Basis", "Where to confirm", "Planning note"]}
          rows={feeRows}
        />
      </Section>

      <Section
        eyebrow="Before Payment"
        title="Payment safety checks"
        body="Applicants should confirm amount, account, paybill, deadline, and reference format from the university before making any payment."
        dark
      >
        <CheckList
          dark
          items={[
            "Confirm the fee schedule for the exact programme, level, and intake.",
            "Use only official payment instructions from the portal or university records.",
            "Keep the receipt, transaction code, and application reference together.",
            "Contact official university channels if the amount or account details conflict.",
          ]}
        />
      </Section>
    </>
  );
}

function ScholarshipsSections() {
  return (
    <>
      <Section
        eyebrow="Financial Support"
        title="Funding routes applicants can verify"
        body="Scholarship and sponsorship pages should reduce uncertainty by explaining where support can come from and how to verify it."
      >
        <ComparisonTable
          headers={["Eligible applicants", "Verification", "Applicant action"]}
          rows={supportRows}
        />
      </Section>

      <Section
        eyebrow="Funding Caution"
        title="Treat third-party funding claims carefully"
        body="Scholarship scams often imitate admissions processes. Use official notices, sponsor award letters, and university fee-clearance instructions."
        dark
      >
        <CheckList
          dark
          items={[
            "Do not pay scholarship processing fees to unofficial contacts.",
            "Confirm bursary and scholarship calls against university announcements.",
            "Keep sponsor letters, award conditions, and payment timelines on file.",
            "Ask admissions or finance offices before relying on private payment instructions.",
          ]}
        />
      </Section>
    </>
  );
}

function HowToApplySections({ data }: { data: AdmissionsPageData }) {
  return (
    <>
      <Section
        eyebrow="Journey Map"
        title="Complete the application in the right order"
        body="Use the journey map as the control flow for admissions: programme first, intake second, documents third, official submission fourth, and tracking last."
      >
        <AdmissionsJourneyMap intakes={data.intakes} compact />
      </Section>

      <Section
        eyebrow="Application Process"
        title="From programme choice to admission documents"
        body="The process below is written for applicants who need a clear sequence, not a list of disconnected links."
      >
        <ProcessTimeline />
      </Section>

      <Section
        eyebrow="Official Actions"
        title="Use the correct system at each stage"
        body="The application portal handles submission, while the admission centre supports admitted or placed students with document access and registration."
        dark
      >
        <LinkPanel
          dark
          links={[
            {
              title: "Apply online",
              href: officialLinks.onlineApplication,
              description:
                "Create, submit, continue, or track a self-sponsored application.",
              icon: ClipboardCheck,
            },
            {
              title: "Admission centre",
              href: officialLinks.admissionCenter,
              description:
                "Access admission letters, admission documents, and registration actions.",
              icon: ShieldCheck,
            },
            {
              title: "How-to-apply page",
              href: officialLinks.howToApply,
              description:
                "Open the university's current official application instructions.",
              icon: FileText,
            },
          ]}
        />
      </Section>
    </>
  );
}

function IntakesSections({ data }: { data: AdmissionsPageData }) {
  return (
    <>
      <Section
        eyebrow="Intake Records"
        title="Published intake windows"
        body="Use published intake records to plan, then verify active status, programme availability, reporting dates, and deadlines in the online application portal."
      >
        <IntakesTable intakes={data.intakes} />
      </Section>

      <Section
        eyebrow="Before The Deadline"
        title="Prepare the file before an intake closes"
        body="Late preparation leads to missing documents and rushed programme choices. Prepare the essentials before the deadline week."
        dark
      >
        <CheckList
          dark
          items={[
            "Programme and level selected from current academic records.",
            "Entry requirements checked against the specific programme.",
            "Academic certificates, transcripts, and identity details ready.",
            "Application account details kept safely for tracking.",
            "Payment instructions confirmed from official university records.",
            "Admission centre checked after admission or placement.",
          ]}
        />
      </Section>
    </>
  );
}

function ResourceRecords({
  records,
  fallbackLinks,
  darkBody,
}: {
  records: AdmissionsInfoSummary[];
  fallbackLinks: RouteLink[];
  darkBody: string;
}) {
  return (
    <>
      <Section
        eyebrow="Published Records"
        title="Records from the admissions content system"
        body={
          records.length
            ? "These records are available from the backend admissions content model and are shown as explicit admissions resources."
            : "No matching backend records were returned. Use the official resources below while records are populated."
        }
      >
        {records.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {records.map((record) => {
              const href =
                record.externalUrl ||
                record.attachmentUrl ||
                `/admissions/${record.slug}`;
              const external = href.startsWith("http");
              const body =
                record.summary ||
                contentExcerpt(record.content) ||
                "Published admissions resource.";

              return external ? (
                <a
                  key={record.id}
                  href={href}
                  className="border border-border bg-white p-5 transition-colors duration-200 hover:border-primary/35 hover:bg-primary/5"
                >
                  <RecordInner record={record} body={body} external />
                </a>
              ) : (
                <Link
                  key={record.id}
                  href={href}
                  className="border border-border bg-white p-5 transition-colors duration-200 hover:border-primary/35 hover:bg-primary/5"
                >
                  <RecordInner record={record} body={body} />
                </Link>
              );
            })}
          </div>
        ) : (
          <LinkPanel links={fallbackLinks} />
        )}
      </Section>

      <Section
        eyebrow="Verification"
        title="Use the current official version before acting"
        body={darkBody}
        dark
      >
        <CheckList
          dark
          items={[
            "Confirm that the record applies to the current academic year or ceremony.",
            "Check deadlines and programme availability in the official portal.",
            "Use only official downloads, attachments, or university-hosted links.",
            "Contact Admissions or the relevant office if two sources conflict.",
          ]}
        />
      </Section>
    </>
  );
}

const resourceSectionConfigs: Record<
  string,
  { contentTypes: string[]; darkBody: string; fallbackLinks: RouteLink[] }
> = {
  brochures: {
    contentTypes: ["brochure"],
    darkBody:
      "Brochures are planning references. Applicants should still verify live intakes, requirements, fees, and application status in the official admissions portal.",
    fallbackLinks: [
      {
        title: "Course booklet PDF",
        href: officialLinks.brochurePdf,
        description:
          "Open the official course brochure PDF for programme-level guidance.",
        icon: BookOpenCheck,
      },
      {
        title: "Programmes",
        href: "/academics/programmes",
        description: "Browse programme records in the current implementation.",
        icon: Search,
      },
      {
        title: "Downloads",
        href: "/downloads",
        description:
          "Check the public downloads index for forms and documents.",
        icon: FileText,
      },
    ],
  },
  booklets: {
    contentTypes: ["booklet", "brochure"],
    darkBody:
      "Booklets can summarize many admissions details. Always confirm live deadlines, fee instructions, and programme availability before submitting or paying.",
    fallbackLinks: [
      {
        title: "Course booklet PDF",
        href: officialLinks.brochurePdf,
        description:
          "Open the official course booklet and admissions reference.",
        icon: Library,
      },
      {
        title: "Admissions",
        href: "/admissions",
        description:
          "Return to the admissions overview and application routes.",
        icon: GraduationCap,
      },
      {
        title: "Downloads",
        href: "/downloads",
        description:
          "Check public downloads for additional booklets and forms.",
        icon: FileText,
      },
    ],
  },
  "graduation-booklets": {
    contentTypes: ["graduation"],
    darkBody:
      "Graduation booklet links and ceremony instructions are time-sensitive. Graduands should verify clearance, names, awards, and ceremony instructions against the latest official notice.",
    fallbackLinks: [
      {
        title: "15th Graduation Booklet 2026",
        href: "https://kisiiuniversity.ac.ke/admission/kisii-university-15th-graduation-booklet-2026",
        description:
          "Open the current live-site booklet reference while local records are populated.",
        icon: GraduationCap,
      },
      {
        title: "Announcements",
        href: "/media/announcements",
        description:
          "Check official notices for graduation updates and deadlines.",
        icon: FileText,
      },
      {
        title: "Events",
        href: "/media/events",
        description: "Browse ceremony and university event records.",
        icon: CalendarDays,
      },
    ],
  },
};

function ResourceRecordsSection({
  area,
  data,
}: {
  area: string;
  data: AdmissionsPageData;
}) {
  const config = resourceSectionConfigs[area];
  if (!config) return null;
  const records = recordsForContentTypes(data, config.contentTypes);
  return (
    <ResourceRecords
      records={records}
      darkBody={config.darkBody}
      fallbackLinks={config.fallbackLinks}
    />
  );
}

function IntakeDetailSections({
  intake,
}: {
  intake?: AdmissionsIntakeSummary;
}) {
  return (
    <>
      <Section
        eyebrow="Intake Detail"
        title={intake ? intake.name : "Intake not found in published records"}
        body={
          intake
            ? `The recorded application window runs from ${formatAdmissionDate(
                intake.applicationStart,
              )} to ${formatAdmissionDate(intake.applicationEnd)}${
                intake.lateApplicationEnd
                  ? `, with late applications to ${formatAdmissionDate(
                      intake.lateApplicationEnd,
                    )}`
                  : ""
              }.`
            : "This URL does not match an intake returned to the frontend. Use the official application portal to verify live intake status."
        }
      >
        {intake ? (
          <ComparisonTable
            headers={["Recorded value", "Applicant action", "Verification"]}
            rows={[
              {
                label: "Application opens",
                cells: [
                  formatAdmissionDate(intake.applicationStart),
                  "Prepare documents before the opening date.",
                  "Confirm active status in the portal.",
                ],
              },
              {
                label: "Application closes",
                cells: [
                  formatAdmissionDate(intake.applicationEnd),
                  "Submit before the recorded closing date.",
                  "Check for programme-specific deadlines.",
                ],
              },
              {
                label: "Status",
                cells: [
                  intakeStatus(intake),
                  "Do not assume availability from status alone.",
                  "Use the official portal before payment.",
                ],
              },
            ]}
          />
        ) : (
          <div className="border border-border bg-white p-6">
            <ActionLink href={officialLinks.onlineApplication} primary>
              Check official intakes
            </ActionLink>
          </div>
        )}
      </Section>
    </>
  );
}

function RecordSections({ record }: { record?: AdmissionsInfoSummary }) {
  const body =
    record?.content ||
    record?.summary ||
    "This admissions record was not found in the content returned to the frontend.";

  return (
    <Section
      eyebrow="Admissions Record"
      title={record?.title ?? "Published record unavailable"}
      body={contentExcerpt(body)}
    >
      <div className="grid gap-5 border border-border bg-white p-6">
        {record?.audienceLevels?.length ? (
          <p className="text-sm leading-7 text-muted-foreground">
            <span className="font-semibold text-foreground">Audience:</span>{" "}
            {record.audienceLevels.join(", ")}
          </p>
        ) : null}
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {record?.externalUrl ? (
            <ActionLink href={record.externalUrl} primary>
              Open linked resource
            </ActionLink>
          ) : null}
          {record?.attachmentUrl ? (
            <ActionLink href={record.attachmentUrl}>Open attachment</ActionLink>
          ) : null}
          <ActionLink href="/admissions">Back to admissions</ActionLink>
        </div>
      </div>
    </Section>
  );
}

function pageCopy(
  area: AdmissionsArea,
  slug?: string,
  intake?: AdmissionsIntakeSummary,
  record?: AdmissionsInfoSummary,
) {
  if (area === "undergraduate") {
    return {
      eyebrow: "Undergraduate Admissions",
      title: "Start a certificate, diploma, or bachelor's pathway",
      body: "Compare undergraduate entry routes, confirm programme requirements, prepare academic records, and apply through the correct official pathway.",
    };
  }

  if (area === "diploma") {
    return {
      eyebrow: "Diploma Admissions",
      title: "Apply for diploma programmes with the right requirements",
      body: "Diploma applicants should verify programme-specific entry requirements, progression routes, intake availability, and official application instructions before submitting.",
    };
  }

  if (area === "certificate-bridging") {
    return {
      eyebrow: "Certificate And Bridging",
      title: "Certificate and bridging application pathways",
      body: "Certificate and bridging routes help applicants start foundational study or prepare for progression where a pathway is officially published.",
    };
  }

  if (area === "postgraduate") {
    return {
      eyebrow: "Postgraduate Admissions",
      title: "Prepare for advanced study and research",
      body: "Postgraduate applicants need level-specific qualifications, certified records, and in some cases research proposals, referee documents, or foreign qualification evidence.",
    };
  }

  if (area === "international") {
    return {
      eyebrow: "International Students",
      title: "Apply with clear qualification and arrival planning",
      body: "International applicants should prepare certified academic records, qualification checks, identity documents, and campus planning alongside the official application.",
    };
  }

  if (area === "requirements") {
    return {
      eyebrow: "Entry Requirements",
      title: "Check the requirement before choosing a programme",
      body: "General minimums establish eligibility by level, but programme-specific requirements decide whether an applicant can join a particular course.",
    };
  }

  if (area === "fees") {
    return {
      eyebrow: "Fees",
      title: "Plan costs using official fee records",
      body: "Fee information should help applicants plan responsibly while keeping actual amounts and payment instructions tied to current official university records.",
    };
  }

  if (area === "scholarships") {
    return {
      eyebrow: "Scholarships",
      title: "Verify funding before relying on it",
      body: "Scholarship and sponsorship guidance connects applicants to official notices, KUCCPS sponsorship context, graduate support, and sponsor verification.",
    };
  }

  if (area === "how-to-apply") {
    return {
      eyebrow: "How To Apply",
      title: "Apply in the right order, through the right system",
      body: "A successful application starts with programme choice and requirements, then moves through official application, payment, tracking, and admission document access.",
    };
  }

  if (area === "intakes") {
    return {
      eyebrow: "Current Intakes",
      title: "Review intake windows and verify live status",
      body: "Published intake records help with planning, but active status, deadlines, reporting dates, and programme availability must be confirmed in the official portal.",
    };
  }

  if (area === "brochures") {
    return {
      eyebrow: "Brochures",
      title: "Admissions brochures and course booklet references",
      body: "Use brochures to compare programmes, schools, requirements, study modes, duration, and tuition references before applying.",
    };
  }

  if (area === "booklets") {
    return {
      eyebrow: "Booklets",
      title: "Admissions booklets and applicant references",
      body: "Admissions booklets consolidate applicant guidance, programme information, requirements, and application planning references.",
    };
  }

  if (area === "graduation-booklets") {
    return {
      eyebrow: "Graduation Booklets",
      title: "Graduation booklets and graduand guidance",
      body: "Graduation booklets and related notices help graduands confirm ceremony information, clearance, award details, and official timelines.",
    };
  }

  if (area === "intake-detail") {
    return {
      eyebrow: "Intake Detail",
      title: intake?.name ?? `${titleFromSlug(slug)} intake`,
      body: intake
        ? `Recorded status: ${intakeStatus(intake)}. Confirm live application availability in the official online application portal before submitting.`
        : "This intake could not be matched to a published intake record returned by the frontend.",
    };
  }

  if (area === "record") {
    return {
      eyebrow: "Admissions Record",
      title: record?.title ?? titleFromSlug(slug),
      body:
        record?.summary ||
        contentExcerpt(record?.content) ||
        "Published admissions guidance from the content system.",
    };
  }

  return {
    eyebrow: "Admissions",
    title: "Admissions at Kisii University",
    body: "Choose the right applicant route, confirm requirements, compare programmes, plan fees and funding, then apply and track admission through official university systems.",
  };
}

function ContentByArea({
  area,
  data,
  intake,
  record,
}: {
  area: AdmissionsArea;
  data: AdmissionsPageData;
  intake?: AdmissionsIntakeSummary;
  record?: AdmissionsInfoSummary;
}) {
  if (
    area === "undergraduate" ||
    area === "diploma" ||
    area === "certificate-bridging" ||
    area === "postgraduate" ||
    area === "international"
  )
    return <ProgramLevelSection area={area} />;
  if (area === "requirements") return <RequirementsSections />;
  if (area === "fees") return <FeesSections />;
  if (area === "scholarships") return <ScholarshipsSections />;
  if (area === "how-to-apply") return <HowToApplySections data={data} />;
  if (
    area === "brochures" ||
    area === "booklets" ||
    area === "graduation-booklets"
  )
    return <ResourceRecordsSection area={area} data={data} />;
  if (area === "intakes") return <IntakesSections data={data} />;
  if (area === "intake-detail") return <IntakeDetailSections intake={intake} />;
  if (area === "record") return <RecordSections record={record} />;
  return <LandingSections data={data} />;
}

function recordsForContentTypes(
  data: AdmissionsPageData,
  contentTypes: string[],
) {
  const normalizedTypes = contentTypes.map((type) => type.toLowerCase());

  return data.admissionInfo.filter((record) =>
    normalizedTypes.includes(record.contentType.toLowerCase()),
  );
}

export function AdmissionsContent({ segments, data }: AdmissionsContentProps) {
  const { area, intake, record } = areaFromSegments(segments, data);
  const [slug] = segments;
  const currentHref = `/admissions${segments.length ? `/${segments.join("/")}` : ""}`;
  const copy = pageCopy(area, segments[1] ?? slug, intake, record);

  return (
    <PageShell>
      <AboutPageLenis>
        <PageHero
          area={area}
          eyebrow={copy.eyebrow}
          title={copy.title}
          body={copy.body}
          currentHref={currentHref}
          data={data}
        />

        <div className="grid w-full gap-8 bg-[linear-gradient(180deg,hsl(var(--surface-subtle))_0%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
          <SideNav currentHref={currentHref} />
          <div className="min-w-0">
            <ContentByArea
              area={area}
              data={data}
              intake={intake}
              record={record}
            />
          </div>
        </div>
      </AboutPageLenis>
    </PageShell>
  );
}
