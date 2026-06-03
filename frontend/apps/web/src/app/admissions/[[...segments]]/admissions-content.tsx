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

type TableRow = {
  label: string;
  cells: string[];
};

const officialLinks = {
  overview: "https://kisiiuniversity.ac.ke/admission",
  howToApply: "https://kisiiuniversity.ac.ke/admission/how-to-apply",
  onlineApplication: "https://digital.kisiiuniversity.ac.ke/new_student_landing_page",
  admissionCenter: "https://digital.kisiiuniversity.ac.ke/students/admissions/center",
  undergraduate: "https://kisiiuniversity.ac.ke/admission/undergraduate-application",
  postgraduate: "https://kisiiuniversity.ac.ke/admission/postgraduate-education",
  international: "https://kisiiuniversity.ac.ke/admission/international-students",
  diploma: "https://kisiiuniversity.ac.ke/admission/diploma-application",
  certificate: "https://kisiiuniversity.ac.ke/admission/certificatebridging-application",
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

function contentExcerpt(text?: string | null) {
  if (!text) return "";
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
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
  const external = href.startsWith("http");
  const host = external ? new URL(href).host : null;
  const className = primary
    ? "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
    : "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-primary hover:text-primary";

  if (external) {
    return (
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${children?.toString() ?? "Open link"} on ${host}`}
      >
        <span className="flex flex-col text-left leading-tight">
          <span>{children}</span>
          {host ? (
            <span className="text-[11px] font-medium opacity-80">
              Opens {host}
            </span>
          ) : null}
        </span>
        <ExternalLink aria-hidden className="h-4 w-4" />
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

function SideNav({ currentHref }: { currentHref: string }) {
  return (
    <nav
      aria-label="Admissions navigation"
      className="border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-28"
    >
      <p className="px-3 py-2 text-xs font-semibold uppercase text-secondary">
        Admissions
      </p>
      <div className="mt-1 grid gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = currentHref === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex gap-3 border px-3 py-3 text-sm transition ${
                active
                  ? "border-primary/30 bg-primary/5 text-slate-950"
                  : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center ${
                  active
                    ? "bg-primary text-white"
                    : "bg-slate-100 text-primary group-hover:bg-primary group-hover:text-white"
                }`}
              >
                <Icon aria-hidden className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-semibold">{item.title}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function PageHero({
  eyebrow,
  title,
  body,
  currentHref,
}: {
  eyebrow: string;
  title: string;
  body: string;
  currentHref: string;
}) {
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="w-full">
        <BreadcrumbTrail
          items={[
            { label: "Home", href: "/" },
            { label: "Admissions", href: "/admissions" },
            { label: eyebrow },
          ]}
        />
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="max-w-5xl">
            <p className="text-sm font-semibold uppercase text-secondary">
              {eyebrow}
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-slate-950 sm:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-8 text-slate-600 sm:text-lg">
              {body}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <ActionLink href={officialLinks.onlineApplication} primary>
                Apply online
              </ActionLink>
              <ActionLink href="/admissions/how-to-apply">How to apply</ActionLink>
              {currentHref !== "/admissions/intakes" ? (
                <ActionLink href="/admissions/intakes">Current intakes</ActionLink>
              ) : null}
            </div>
          </div>

          <div className="border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Official systems
            </p>
            <div className="mt-4 grid gap-3">
              <ActionRow
                icon={ClipboardCheck}
                title="Online application portal"
                body="Create, submit, continue, or track an application."
                href={officialLinks.onlineApplication}
              />
              <ActionRow
                icon={ShieldCheck}
                title="Admission centre"
                body="Access admission documents and registration steps."
                href={officialLinks.admissionCenter}
              />
              <ActionRow
                icon={BookOpenCheck}
                title="Course booklet"
                body="Review requirements, duration, mode, and tuition references."
                href={officialLinks.brochurePdf}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActionRow({
  icon: Icon,
  title,
  body,
  href,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  href: string;
}) {
  const external = href.startsWith("http");
  const host = external ? new URL(href).host : null;

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group flex gap-3 border border-slate-200 bg-white p-4 transition hover:border-primary/40 hover:bg-primary/5"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-slate-950">
          {title}
        </span>
        <span className="mt-1 block text-sm leading-6 text-slate-600">
          {body}
        </span>
        {host ? (
          <span className="mt-2 block text-xs font-semibold text-primary">
            Opens {host}
          </span>
        ) : null}
      </span>
      <ExternalLink
        aria-hidden
        className="ml-auto mt-1 h-4 w-4 shrink-0 text-slate-400"
      />
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
          ? "border-y border-slate-900 bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-16"
          : "border-b border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-16"
      }
    >
      <div className="grid w-full gap-9 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div>
          <p
            className={
              dark
                ? "text-sm font-semibold uppercase text-secondary"
                : "text-sm font-semibold uppercase text-secondary"
            }
          >
            {eyebrow}
          </p>
          <h2
            className={
              dark
                ? "mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white sm:text-4xl"
                : "mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl"
            }
          >
            {title}
          </h2>
          {body ? (
            <p
              className={
                dark
                  ? "mt-5 text-base leading-8 text-white/70"
                  : "mt-5 text-base leading-8 text-slate-600"
              }
            >
              {body}
            </p>
          ) : null}
        </div>
        <div>{children}</div>
      </div>
    </ScrollReveal>
  );
}

function StatStrip({ intakes }: { intakes: AdmissionsIntakeSummary[] }) {
  const openIntakes = intakes.filter(
    (intake) => intake.isOpen && !isPastDate(intakeDeadline(intake)),
  ).length;

  return (
    <div className="grid border border-slate-200 bg-white md:grid-cols-3">
      {[
        ["Applicant routes", "KUCCPS, self-sponsored, postgraduate, international"],
        ["Published intakes", String(intakes.length || "Portal verified")],
        ["Open records", String(openIntakes || "Check portal")],
      ].map(([label, value]) => (
        <div key={label} className="border-b border-slate-200 p-5 md:border-b-0 md:border-r last:md:border-r-0">
          <p className="text-xs font-semibold uppercase text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
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
    <div className="overflow-x-auto border border-slate-200 bg-white">
      <table className="min-w-[760px] w-full border-collapse text-left">
        <thead className="bg-slate-950 text-white">
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
              <th className="bg-slate-50 px-5 py-4 text-sm font-semibold text-slate-950">
                {row.label}
              </th>
              {row.cells.map((cell, index) => (
                <td key={`${row.label}-${index}`} className="px-5 py-4 text-sm leading-7 text-slate-600">
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
        <li key={step.title} className="grid gap-4 border border-slate-200 bg-white p-5 sm:grid-cols-[72px_minmax(0,1fr)]">
          <span className="flex h-12 w-12 items-center justify-center bg-primary text-lg font-semibold text-white">
            {index + 1}
          </span>
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">{step.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function CheckList({ items, dark = false }: { items: string[]; dark?: boolean }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className={
            dark
              ? "flex gap-3 border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-white/75"
              : "flex gap-3 border border-slate-200 bg-white p-4 text-sm leading-7 text-slate-600"
          }
        >
          <CheckCircle2
            aria-hidden
            className={dark ? "mt-1 h-4 w-4 shrink-0 text-secondary" : "mt-1 h-4 w-4 shrink-0 text-primary"}
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
                ? "group border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.08]"
                : "group border border-slate-200 bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5"
            }
          >
            <span
              className={
                dark
                  ? "flex h-11 w-11 items-center justify-center bg-white/10 text-secondary"
                  : "flex h-11 w-11 items-center justify-center bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white"
              }
            >
              <Icon aria-hidden className="h-5 w-5" />
            </span>
            <h3
              className={
                dark
                  ? "mt-5 text-lg font-semibold text-white"
                  : "mt-5 text-lg font-semibold text-slate-950"
              }
            >
              {item.title}
            </h3>
            <p
              className={
                dark
                  ? "mt-2 text-sm leading-7 text-white/70"
                  : "mt-2 text-sm leading-7 text-slate-600"
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
      <div className="border border-slate-200 bg-white p-6">
        <h3 className="text-xl font-semibold text-slate-950">
          Live intakes are verified in the online application portal
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          No intake records were returned to this frontend. Applicants should use
          the official portal to confirm open intakes, reporting dates, programme
          availability, and deadlines.
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
    <div className="overflow-x-auto border border-slate-200 bg-white">
      <table className="min-w-[760px] w-full border-collapse text-left">
        <thead className="bg-slate-950 text-white">
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
                <p className="font-semibold text-slate-950">{intake.name}</p>
                {intake.lateApplicationEnd ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Late applications to {formatAdmissionDate(intake.lateApplicationEnd)}
                  </p>
                ) : null}
              </td>
              <td className="px-5 py-4 text-sm leading-7 text-slate-600">
                {formatAdmissionDate(intake.applicationStart)} to{" "}
                {formatAdmissionDate(intake.applicationEnd)}
              </td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex items-center px-3 py-1 text-xs font-semibold ${
                    intakeStatus(intake) === "Open"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-700"
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

function PublishedRecords({ records }: { records: AdmissionsInfoSummary[] }) {
  if (!records.length) return null;

  return (
    <Section
      eyebrow="Published Guidance"
      title="Admissions records from the content system"
      body="These records come from the admissions content API. Use them alongside the official application system and the route-specific guidance above."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {records.slice(0, 3).map((record) => {
          const href = record.externalUrl || `/admissions/${record.slug}`;
          const external = href.startsWith("http");
          const body =
            record.summary ||
            contentExcerpt(record.content) ||
            "Published admissions guidance.";

          return external ? (
            <a
              key={record.id}
              href={href}
              className="border border-slate-200 bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5"
            >
              <RecordInner record={record} body={body} external />
            </a>
          ) : (
            <Link
              key={record.id}
              href={href}
              className="border border-slate-200 bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5"
            >
              <RecordInner record={record} body={body} />
            </Link>
          );
        })}
      </div>
    </Section>
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
      <h3 className="mt-3 text-lg font-semibold text-slate-950">
        {record.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-sm leading-7 text-slate-600">
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
          <div className="border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-semibold text-slate-950">
              Official systems
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Use the university systems for submission, tracking, and admission document access.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <ActionLink href={officialLinks.onlineApplication} primary>
                Apply online
              </ActionLink>
              <ActionLink href={officialLinks.admissionCenter}>
                Admission centre
              </ActionLink>
            </div>
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Study Pathways"
        title="Move from interest to the correct academic level"
        body="The admissions section is organized around the decisions applicants actually make: level of study, requirements, fees, funding, and application timing."
      >
        <LinkPanel links={navItems.filter((item) => item.href !== "/admissions").slice(0, 6)} />
      </Section>

      <Section
        eyebrow="Find A Programme"
        title="Search programmes before starting the application"
        body="Programme choice determines requirements, school ownership, duration, study mode, and tuition references. Confirm the programme before creating or submitting an application."
      >
        <div className="grid gap-5 border border-slate-200 bg-slate-50 p-6 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center bg-primary text-white">
              <Search aria-hidden className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-xl font-semibold text-slate-950">
                Browse academic programmes
              </h3>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Compare schools, departments, levels, modes of study, and
                programme detail pages before applying.
              </p>
            </div>
          </div>
          <ActionLink href="/academics/programmes" primary>
            Browse programmes
          </ActionLink>
        </div>
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
      className="group flex min-h-[15rem] flex-col border border-slate-200 bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5"
    >
      <span className="flex h-12 w-12 items-center justify-center bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary">
        {action}
        <ArrowRight aria-hidden className="h-4 w-4" />
      </span>
    </Link>
  );
}

function UndergraduateSections() {
  return (
    <>
      <Section
        eyebrow="Entry Pathways"
        title="Undergraduate admission routes"
        body="Undergraduate applicants may enter through certificate, diploma, bachelor's degree, KUCCPS placement, or self-sponsored direct application pathways."
      >
        <ComparisonTable
          headers={["Minimum route", "Who it serves", "Before applying"]}
          rows={requirementRows.slice(0, 3)}
        />
      </Section>

      <Section
        eyebrow="Preparation"
        title="What undergraduate applicants should have ready"
        body="Prepare a complete file before opening the portal so the application is not delayed by missing academic or identity records."
        dark
      >
        <CheckList
          dark
          items={[
            "KCSE certificate or equivalent qualification records.",
            "Certificate, diploma, HND, or A-Level evidence for progression routes.",
            "National ID, passport, or applicant identity details requested by the portal.",
            "Programme choice checked against the course booklet and programme pages.",
            "Payment evidence only after confirming official payment instructions.",
            "KUCCPS placement details where the applicant is government-sponsored.",
          ]}
        />
      </Section>

      <Section
        eyebrow="Official Undergraduate Resources"
        title="Forms, booklet, and programme pages"
        body="Use these resources only as official references; requirements and application channels can change by intake."
      >
        <LinkPanel
          links={[
            {
              title: "Undergraduate admission page",
              href: officialLinks.undergraduate,
              description: "General criteria for certificates, diplomas, and bachelor's degrees.",
              icon: GraduationCap,
            },
            {
              title: "Course booklet",
              href: officialLinks.brochurePdf,
              description: "Programme requirements, study modes, duration, and tuition references.",
              icon: BookOpenCheck,
            },
            {
              title: "Undergraduate form",
              href: officialLinks.undergraduateForm,
              description: "Use only when the current route asks for a downloadable form.",
              icon: FileText,
            },
          ]}
        />
      </Section>
    </>
  );
}

function DiplomaSections() {
  return (
    <>
      <Section
        eyebrow="Diploma Applications"
        title="Diploma entry routes and application checks"
        body="Diploma applicants should confirm the exact programme, school, minimum grade, progression route, and intake before submitting an application."
      >
        <ComparisonTable
          headers={["Minimum route", "Progression option", "Before applying"]}
          rows={[
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
          ]}
        />
      </Section>

      <Section
        eyebrow="Diploma File"
        title="Prepare a complete application file"
        body="Diploma applications should be submitted only after the applicant has matched the programme to the current requirements and official intake."
        dark
      >
        <CheckList
          dark
          items={[
            "KCSE certificate or equivalent academic record.",
            "Relevant certificate evidence for certificate-to-diploma progression routes.",
            "Programme requirements checked in the course booklet.",
            "Identity details requested by the official application portal.",
            "Payment instructions confirmed from official university records.",
            "Open intake verified before submission.",
          ]}
        />
      </Section>

      <Section
        eyebrow="Diploma Resources"
        title="Official diploma references"
        body="Use the local records and official resources together so applicants do not rely on outdated shared links."
      >
        <LinkPanel
          links={[
            {
              title: "Apply online",
              href: officialLinks.onlineApplication,
              description: "Submit or continue a diploma application through the official system.",
              icon: ClipboardCheck,
            },
            {
              title: "Diploma application page",
              href: officialLinks.diploma,
              description: "Open the legacy official diploma admission resource.",
              icon: FileText,
            },
            {
              title: "Course booklet",
              href: officialLinks.brochurePdf,
              description: "Check diploma programmes, requirements, duration, and fee references.",
              icon: BookOpenCheck,
            },
          ]}
        />
      </Section>
    </>
  );
}

function CertificateBridgingSections() {
  return (
    <>
      <Section
        eyebrow="Certificate And Bridging"
        title="Certificate courses and bridging pathways"
        body="Certificate and bridging applicants should confirm the approved pathway, minimum academic record, and target progression before applying."
      >
        <ComparisonTable
          headers={["Typical route", "Purpose", "Before applying"]}
          rows={[
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
          ]}
        />
      </Section>

      <Section
        eyebrow="Preparation"
        title="What certificate and bridging applicants should prepare"
        body="These routes are often programme-specific, so the published course record and intake notice matter more than a general summary."
        dark
      >
        <CheckList
          dark
          items={[
            "KCSE, O-Level, A-Level, or equivalent academic record.",
            "Prior certificate or diploma evidence where bridging depends on progression.",
            "Target programme checked against the course booklet.",
            "Approved bridging pathway confirmed before payment.",
            "Official intake and deadline verified through the application portal.",
            "Any school-specific instructions or attachments prepared.",
          ]}
        />
      </Section>

      <Section
        eyebrow="Resources"
        title="Official certificate and bridging references"
        body="Use the university application system for live submission and current availability."
      >
        <LinkPanel
          links={[
            {
              title: "Apply online",
              href: officialLinks.onlineApplication,
              description: "Submit or continue an application through the official system.",
              icon: ClipboardCheck,
            },
            {
              title: "Certificate/bridging page",
              href: officialLinks.certificate,
              description: "Open the legacy official certificate and bridging admission resource.",
              icon: FileText,
            },
            {
              title: "Course booklet",
              href: officialLinks.brochurePdf,
              description: "Check certificate programmes, bridging context, requirements, and duration.",
              icon: BookOpenCheck,
            },
          ]}
        />
      </Section>
    </>
  );
}

function PostgraduateSections() {
  return (
    <>
      <Section
        eyebrow="Graduate Levels"
        title="Postgraduate study routes and records"
        body="Graduate applicants should match the programme level with academic records, transcripts, research interests, and any programme-specific requirements."
      >
        <ComparisonTable
          headers={["Typical minimum", "Required preparation", "Official check"]}
          rows={requirementRows.slice(3)}
        />
      </Section>

      <Section
        eyebrow="Documents"
        title="Prepare certified academic records before applying"
        body="Postgraduate applications are more document-heavy than undergraduate routes, especially where transcripts, referee forms, proposals, or foreign qualification checks are required."
        dark
      >
        <CheckList
          dark
          items={[
            "Certified degree certificates and transcripts.",
            "KCSE, O-Level, or A-Level certificates where the route asks for them.",
            "Research proposal for PhD or research-intensive programmes where required.",
            "Referee forms or professional evidence when requested by the school.",
            "Accreditation evidence for foreign university qualifications where required.",
            "English translations and language evidence for non-English records.",
          ]}
        />
      </Section>
    </>
  );
}

function InternationalSections() {
  return (
    <>
      <Section
        eyebrow="International Preparation"
        title="Prepare qualifications, identity, and arrival records"
        body="International applicants use the same official application controls but should prepare additional qualification and immigration documentation before submitting."
      >
        <CheckList
          items={[
            "Certified academic certificates and transcripts for the intended level of study.",
            "Evidence that foreign university qualifications come from accredited institutions where required.",
            "English translations for academic records issued in another language.",
            "Proof of English proficiency where requested for non-English-speaking education systems.",
            "Passport details and any immigration documentation requested during admission.",
            "Programme, fee, reporting, and accommodation planning before travel.",
          ]}
        />
      </Section>

      <Section
        eyebrow="Arrival Context"
        title="Plan academics and student life together"
        body="Before arrival, review the academic school, student support, official portal, and campus-life information so registration and reporting are predictable."
        dark
      >
        <LinkPanel
          dark
          links={[
            {
              title: "Academic schools",
              href: officialLinks.schoolsDepartments,
              description: "Review the schools and departments that host programmes.",
              icon: Landmark,
            },
            {
              title: "Campus life",
              href: "/campus-life",
              description: "Student support, accommodation context, activities, and services.",
              icon: Users,
            },
            {
              title: "International admission page",
              href: officialLinks.international,
              description: "Open the current official page for international applicants.",
              icon: Compass,
            },
          ]}
        />
      </Section>
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

function HowToApplySections() {
  return (
    <>
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
              description: "Create, submit, continue, or track a self-sponsored application.",
              icon: ClipboardCheck,
            },
            {
              title: "Admission centre",
              href: officialLinks.admissionCenter,
              description: "Access admission letters, admission documents, and registration actions.",
              icon: ShieldCheck,
            },
            {
              title: "How-to-apply page",
              href: officialLinks.howToApply,
              description: "Open the university's current official application instructions.",
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
              const href = record.externalUrl || record.attachmentUrl || `/admissions/${record.slug}`;
              const external = href.startsWith("http");
              const body =
                record.summary ||
                contentExcerpt(record.content) ||
                "Published admissions resource.";

              return external ? (
                <a
                  key={record.id}
                  href={href}
                  className="border border-slate-200 bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5"
                >
                  <RecordInner record={record} body={body} external />
                </a>
              ) : (
                <Link
                  key={record.id}
                  href={href}
                  className="border border-slate-200 bg-white p-5 transition hover:border-primary/35 hover:bg-primary/5"
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

function BrochuresSections({ data }: { data: AdmissionsPageData }) {
  const records = recordsForContentTypes(data, ["brochure"]);

  return (
    <ResourceRecords
      records={records}
      darkBody="Brochures are planning references. Applicants should still verify live intakes, requirements, fees, and application status in the official admissions portal."
      fallbackLinks={[
        {
          title: "Course booklet PDF",
          href: officialLinks.brochurePdf,
          description: "Open the official course brochure PDF for programme-level guidance.",
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
          description: "Check the public downloads index for forms and documents.",
          icon: FileText,
        },
      ]}
    />
  );
}

function BookletsSections({ data }: { data: AdmissionsPageData }) {
  const records = recordsForContentTypes(data, ["booklet", "brochure"]);

  return (
    <ResourceRecords
      records={records}
      darkBody="Booklets can summarize many admissions details. Always confirm live deadlines, fee instructions, and programme availability before submitting or paying."
      fallbackLinks={[
        {
          title: "Course booklet PDF",
          href: officialLinks.brochurePdf,
          description: "Open the official course booklet and admissions reference.",
          icon: Library,
        },
        {
          title: "Admissions",
          href: "/admissions",
          description: "Return to the admissions overview and application routes.",
          icon: GraduationCap,
        },
        {
          title: "Downloads",
          href: "/downloads",
          description: "Check public downloads for additional booklets and forms.",
          icon: FileText,
        },
      ]}
    />
  );
}

function GraduationBookletsSections({ data }: { data: AdmissionsPageData }) {
  const records = recordsForContentTypes(data, ["graduation"]);

  return (
    <ResourceRecords
      records={records}
      darkBody="Graduation booklet links and ceremony instructions are time-sensitive. Graduands should verify clearance, names, awards, and ceremony instructions against the latest official notice."
      fallbackLinks={[
        {
          title: "15th Graduation Booklet 2026",
          href: "https://kisiiuniversity.ac.ke/admission/kisii-university-15th-graduation-booklet-2026",
          description: "Open the current live-site booklet reference while local records are populated.",
          icon: GraduationCap,
        },
        {
          title: "Announcements",
          href: "/media/announcements",
          description: "Check official notices for graduation updates and deadlines.",
          icon: FileText,
        },
        {
          title: "Events",
          href: "/media/events",
          description: "Browse ceremony and university event records.",
          icon: CalendarDays,
        },
      ]}
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
          <div className="border border-slate-200 bg-white p-6">
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
      <div className="grid gap-5 border border-slate-200 bg-white p-6">
        {record?.audienceLevels?.length ? (
          <p className="text-sm leading-7 text-slate-600">
            <span className="font-semibold text-slate-950">Audience:</span>{" "}
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
  if (area === "undergraduate") return <UndergraduateSections />;
  if (area === "diploma") return <DiplomaSections />;
  if (area === "certificate-bridging") return <CertificateBridgingSections />;
  if (area === "postgraduate") return <PostgraduateSections />;
  if (area === "international") return <InternationalSections />;
  if (area === "requirements") return <RequirementsSections />;
  if (area === "fees") return <FeesSections />;
  if (area === "scholarships") return <ScholarshipsSections />;
  if (area === "how-to-apply") return <HowToApplySections />;
  if (area === "brochures") return <BrochuresSections data={data} />;
  if (area === "booklets") return <BookletsSections data={data} />;
  if (area === "graduation-booklets") return <GraduationBookletsSections data={data} />;
  if (area === "intakes") return <IntakesSections data={data} />;
  if (area === "intake-detail") return <IntakeDetailSections intake={intake} />;
  if (area === "record") return <RecordSections record={record} />;
  return <LandingSections data={data} />;
}

function recordsForArea(area: AdmissionsArea, data: AdmissionsPageData) {
  if (area === "landing") return data.admissionInfo;

  if (area === "diploma") {
    return recordsForAudienceOrTypes(data, ["diploma"], ["application_procedure"]);
  }

  if (area === "certificate-bridging") {
    return recordsForAudienceOrTypes(data, ["certificate"], ["bridging_application", "application_procedure"]);
  }

  if (area === "brochures") {
    return recordsForContentTypes(data, ["brochure"]);
  }

  if (area === "booklets") {
    return recordsForContentTypes(data, ["booklet", "brochure"]);
  }

  if (area === "graduation-booklets") {
    return recordsForContentTypes(data, ["graduation"]);
  }

  const normalized = area.replace(/-/g, "_");
  return data.admissionInfo.filter((record) => {
    const contentType = record.contentType.toLowerCase();
    const slug = record.slug.toLowerCase();
    const audiences = record.audienceLevels?.join(" ").toLowerCase() ?? "";
    return (
      contentType.includes(normalized) ||
      slug.includes(area) ||
      audiences.includes(normalized)
    );
  });
}

function recordsForContentTypes(data: AdmissionsPageData, contentTypes: string[]) {
  const normalizedTypes = contentTypes.map((type) => type.toLowerCase());

  return data.admissionInfo.filter((record) =>
    normalizedTypes.includes(record.contentType.toLowerCase()),
  );
}

function recordsForAudienceOrTypes(
  data: AdmissionsPageData,
  audiences: string[],
  contentTypes: string[],
) {
  const normalizedAudiences = audiences.map((audience) => audience.toLowerCase());
  const normalizedTypes = contentTypes.map((type) => type.toLowerCase());

  return data.admissionInfo.filter((record) => {
    const recordAudiences = record.audienceLevels?.map((audience) => audience.toLowerCase()) ?? [];
    return (
      normalizedTypes.includes(record.contentType.toLowerCase()) &&
      recordAudiences.some((audience) => normalizedAudiences.includes(audience))
    );
  });
}

export function AdmissionsContent({ segments, data }: AdmissionsContentProps) {
  const { area, intake, record } = areaFromSegments(segments, data);
  const [slug] = segments;
  const currentHref = `/admissions${segments.length ? `/${segments.join("/")}` : ""}`;
  const copy = pageCopy(area, segments[1] ?? slug, intake, record);
  const matchingRecords =
    area === "record" ? [] : recordsForArea(area, data).slice(0, 6);

  return (
    <PageShell>
      <AboutPageLenis>
        <PageHero
          eyebrow={copy.eyebrow}
          title={copy.title}
          body={copy.body}
          currentHref={currentHref}
        />

        <div className="grid w-full gap-8 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8">
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

        <PublishedRecords records={matchingRecords} />

        <section className="border-y border-slate-200 bg-white px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid w-full gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase text-secondary">
                Next Step
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950 sm:text-4xl">
                Continue with verified admissions actions
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                Use the application portal for live submission, the admission
                centre for admitted-student documents, and programme pages for
                academic fit.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <ActionLink href={officialLinks.onlineApplication} primary>
                Apply online
              </ActionLink>
              <ActionLink href={officialLinks.admissionCenter}>
                Admission centre
              </ActionLink>
              <ActionLink href="/academics/programmes">
                Programmes
              </ActionLink>
            </div>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
