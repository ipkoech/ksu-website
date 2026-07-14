import Link from "next/link";
import type { ReactNode } from "react";
import type { EntityHeaderNavItem } from "@ksu/ui/layout/public";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Download,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  Landmark,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Quote,
  Search,
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "@ksu/ui/components";
import { PageShell } from "@/components/site-shell";
import {
  buildMediaTypeLinks,
  type EntityQuickLink,
} from "./entity-quick-links";
import { PublicImage } from "@/components/public/public-image";
import { EntityTeamSection } from "@/components/public/entity-team-section";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import type { DepartmentDetailData } from "@/lib/department-detail-data";
import {
  entityMediaTypeBody,
  entityMediaTypeMatches,
  entityMediaTypeTitle,
  type EntityMediaType,
} from "@/lib/entity-media-data";
import { publicFileUrl, resolvePublicMediaUrl } from "@/lib/public-media";

export type DepartmentDetailSectionKey =
  | "about"
  | "team"
  | "programmes"
  | "publications"
  | "services"
  | "media"
  | "downloads"
  | "contact";

type SectionMeta = {
  eyebrow: string;
  title: string;
  body: string;
  icon: LucideIcon;
};

type StatementCard = {
  title: string;
  body: string;
  icon: LucideIcon;
};

const sectionMeta: Record<DepartmentDetailSectionKey, SectionMeta> = {
  about: {
    eyebrow: "Department Overview",
    title: "About the department",
    body: "Department overview, leadership message, mission, vision, and mandate.",
    icon: Landmark,
  },
  team: {
    eyebrow: "Department Team",
    title: "Leadership and staff",
    body: "Team structure and published staff records for this department.",
    icon: Users,
  },
  programmes: {
    eyebrow: "Academic Programmes",
    title: "Programmes",
    body: "Academic programmes connected to this department.",
    icon: GraduationCap,
  },
  publications: {
    eyebrow: "Publications",
    title: "Publication records",
    body: "Publication counts connected to published staff profiles.",
    icon: FileText,
  },
  services: {
    eyebrow: "Department Services",
    title: "Services",
    body: "Services, process details, requirements, and contact channels.",
    icon: BriefcaseBusiness,
  },
  media: {
    eyebrow: "Media",
    title: "Department media",
    body: "News, events, blogs, announcements, and gallery records connected to this department.",
    icon: Newspaper,
  },
  downloads: {
    eyebrow: "Downloads",
    title: "Documents and files",
    body: "Official documents connected to this department.",
    icon: Download,
  },
  contact: {
    eyebrow: "Contact Information",
    title: "Get in touch",
    body: "Department contact details and office location.",
    icon: Phone,
  },
};

const registrarOfficeCodes = new Set(["ACAFFAIRS", "AHRCS", "REIRM"]);

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function formatDate(value?: string | null) {
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

function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return count > 0 ? `${count} ${count === 1 ? singular : plural}` : null;
}

function linkHref(value: string | null) {
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function initialsFromName(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.replace(/[^A-Za-z]/g, ""))
    .filter(Boolean)
    .filter(
      (part) =>
        !new Set(["dr", "prof", "mr", "mrs", "ms", "rev", "eng"]).has(
          part.toLowerCase(),
        ),
    );

  if (!parts.length) return "D";

  const selected = parts.length === 1 ? [parts[0]] : [parts[0], parts.at(-1)!];
  return selected
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function personDisplayName(person: {
  title?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
}) {
  const fullName = present(person.full_name);
  if (fullName) return fullName;

  return (
    [person.title, person.first_name, person.middle_name, person.last_name]
      .map((value) => present(value))
      .filter(Boolean)
      .join(" ") || "Published staff record"
  );
}

function compactMeta(values: Array<string | number | null | undefined>) {
  return values
    .map((value) => present(value))
    .filter(Boolean)
    .join(" · ");
}

function formatLabel(value?: string | null) {
  const text = present(value);
  if (!text) return null;

  return text
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function programmeTutors(
  programme: DepartmentDetailData["programmes"][number],
) {
  const tutors = programme.tutors ?? [];
  if (!tutors.length) return [];

  return tutors
    .slice()
    .sort(
      (first, second) =>
        Number(Boolean(second.is_lead)) - Number(Boolean(first.is_lead)) ||
        personDisplayName(first.person ?? {}).localeCompare(
          personDisplayName(second.person ?? {}),
        ),
    )
    .map((tutor) => ({
      id: tutor.id,
      name: tutor.person ? personDisplayName(tutor.person) : "Published tutor",
      role: tutor.is_lead
        ? "Lead"
        : formatLabel(tutor.role) ?? formatLabel(tutor.person?.academic_rank) ?? "Tutor",
    }));
}

function isRegistrarOffice(data: DepartmentDetailData) {
  if (data.isAcademic) return false;
  const code = present(data.department.code)?.toUpperCase();
  if (code && registrarOfficeCodes.has(code)) return true;

  const text = [
    data.department.name,
    data.department.about,
    data.leader?.title,
    data.leader?.name,
  ]
    .map((value) => present(value))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes("registrar");
}

function registrarSectionMeta(
  section: DepartmentDetailSectionKey,
  mediaType?: EntityMediaType,
): SectionMeta {
  if (section === "media") {
    return {
      ...sectionMeta.media,
      eyebrow: "Registrar's Office Media",
      title: entityMediaTypeTitle(mediaType),
      body: entityMediaTypeBody(mediaType),
    };
  }

  const meta = sectionMeta[section];
  const overrides: Partial<Record<DepartmentDetailSectionKey, SectionMeta>> = {
    about: {
      eyebrow: "Registrar's Office",
      title: "Office overview",
      body: "Registrar leadership message, office mandate, services, and public contact pathways.",
      icon: Landmark,
    },
    team: {
      eyebrow: "Office Team",
      title: "Registrar's office team",
      body: "Published leadership and staff records attached to this registrar's office.",
      icon: Users,
    },
    services: {
      eyebrow: "Office Services",
      title: "Registrar's office services",
      body: "Service records, process details, requirements, and contact channels for this office.",
      icon: BriefcaseBusiness,
    },
    downloads: {
      eyebrow: "Office Downloads",
      title: "Registrar's office documents",
      body: "Official documents and files published for this registrar's office.",
      icon: Download,
    },
    contact: {
      eyebrow: "Office Contact",
      title: "Contact the office",
      body: "Registrar's office contact details and location information.",
      icon: Phone,
    },
  };

  return overrides[section] ?? meta;
}

function SectionKicker({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
      {children}
    </p>
  );
}

function ExploreMorePanel({ data }: { data: DepartmentDetailData }) {
  const school = data.isAcademic ? data.department.school : null;
  const links: EntityQuickLink[] = [
    school?.slug
      ? {
        label: school.name,
        href: `/academics/schools/${school.slug}`,
        icon: Landmark,
        section: "about",
      }
      : null,
    {
      label: "Academic Calendar",
      href: "/academics/calendar",
      icon: CalendarDays,
      section: "about",
    },
    {
      label: "Admissions",
      href: "/admissions",
      icon: GraduationCap,
      section: "about",
    },
  ].filter(Boolean) as EntityQuickLink[];

  if (!links.length) return null;

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <SectionKicker>Explore More</SectionKicker>
      <ul className="mt-3 divide-y divide-slate-100">
        {links.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex min-h-10 items-center gap-3 py-2 text-sm font-medium text-slate-700 transition hover:text-primary"
              >
                <Icon aria-hidden className="h-4 w-4 shrink-0 text-primary" />
                <span className="min-w-0 flex-1">{item.label}</span>
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PageIntro({ meta }: { meta: SectionMeta }) {
  const Icon = meta.icon;

  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_7rem] md:items-center">
        <div>
          <SectionKicker>{meta.eyebrow}</SectionKicker>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            {meta.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">
            {meta.body}
          </p>
        </div>
        <div className="hidden h-24 items-center justify-center rounded-[1.1rem] bg-primary/[0.08] text-primary md:flex">
          <Icon aria-hidden className="h-12 w-12 stroke-[1.4]" />
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string | null;
  href?: string;
}) {
  if (!value) return null;

  const content = (
    <>
      <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-bold text-slate-950">{label}</span>
        <span className="mt-0.5 block break-words text-sm font-medium leading-5 text-primary [overflow-wrap:anywhere]">
          {value}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="flex w-full min-w-0 gap-3 rounded-xl p-2 transition hover:bg-primary/5"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="flex w-full min-w-0 gap-3 rounded-xl p-2">{content}</div>
  );
}

function ContactPanel({ data }: { data: DepartmentDetailData }) {
  const { department } = data;
  const email = present(department.email);
  const phone = present(department.phone);
  const office = present(department.office_location);
  const website = present(department.website);

  if (!email && !phone && !office && !website) return null;

  return (
    <section className="min-w-0 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <SectionKicker>Contact Information</SectionKicker>
      <div className="mt-3 grid min-w-0 gap-1.5">
        <ContactRow icon={MapPin} label="Office" value={office} />
        <ContactRow
          icon={Phone}
          label="Phone"
          value={phone}
          href={phone ? `tel:${phone}` : undefined}
        />
        <ContactRow
          icon={Mail}
          label="Email"
          value={email}
          href={email ? `mailto:${email}` : undefined}
        />
        <ContactRow
          icon={Globe}
          label="Website"
          value={website}
          href={linkHref(website)}
        />
      </div>
    </section>
  );
}

function DepartmentInfoPanel({ data }: { data: DepartmentDetailData }) {
  const { department, counts } = data;
  const registrarOffice = isRegistrarOffice(data);
  const schoolName =
    present(department.school?.name) ?? present(department.school_name);
  const wingName = present(department.wing?.name);
  const divisionName = present(department.wing?.division?.name);
  const items = [
    {
      label: registrarOffice ? "Office Code" : "Department Code",
      value: present(department.code),
      icon: FileText,
    },
    {
      label: "School",
      value: data.isAcademic ? schoolName : null,
      icon: Landmark,
    },
    {
      label: "Division",
      value: data.isAcademic ? null : divisionName,
      icon: Landmark,
    },
    {
      label: "Administrative Wing",
      value: data.isAcademic ? null : wingName,
      icon: Landmark,
    },
    {
      label: "Programmes",
      value: data.isAcademic
        ? formatCount(counts.programmes, "programme")
        : null,
      icon: GraduationCap,
    },
    {
      label: "Services",
      value: formatCount(counts.services, "service"),
      icon: BriefcaseBusiness,
    },
  ].filter((item) => present(item.value));

  if (!items.length) return null;

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <SectionKicker>
        {registrarOffice ? "Office Information" : "Department Information"}
      </SectionKicker>
      <dl className="mt-3 grid gap-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="flex w-full min-w-0 gap-3 rounded-xl p-2"
            >
              <Icon
                aria-hidden
                className="mt-0.5 h-5 w-5 shrink-0 text-primary"
              />
              <div className="min-w-0 flex-1">
                <dt className="text-xs font-bold text-slate-950">
                  {item.label}
                </dt>
                <dd className="mt-0.5 break-words text-sm font-medium leading-5 text-primary [overflow-wrap:anywhere]">
                  {item.value}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function Avatar({ name, image }: { name: string; image?: string | null }) {
  const source = resolvePublicMediaUrl(image);

  if (source) {
    return (
      <PublicImage
        src={source}
        alt={name}
        ratio="profile"
        sizes="72px"
        className="h-full w-full"
      />
    );
  }

  return (
    <span className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#dbeafe,#eef4ff_56%,#fff7ed)] font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
      {initialsFromName(name)}
    </span>
  );
}

function LeadershipMessageCard({
  data,
  compact = false,
}: {
  data: DepartmentDetailData;
  compact?: boolean;
}) {
  const leader = data.leader;
  const leaderName = present(leader?.name) ?? present(data.department.hod_name);
  const leaderTitle =
    present(leader?.title) ??
    (data.isAcademic ? "Coordinator of Department" : "Department Lead");
  const leaderEmail = present(data.department.hod_email);
  const message =
    present(leader?.message) ?? present(data.department.head_message);

  if (!leaderName && !message) return null;
  const displayName = leaderName ?? "Department leadership";

  return (
    <section className="overflow-hidden rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.9)] sm:p-6">
      <div
        className={`grid gap-5 ${compact
          ? "sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center"
          : "sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center"
          }`}
      >
        <div className="w-24 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15 sm:w-auto">
          <div
            className={
              compact ? "aspect-square" : "aspect-[5/4] sm:aspect-square"
            }
          >
            <Avatar name={displayName} image={leader?.image} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary">
            {data.isAcademic ? "COD's Message" : "Leadership Message"}
          </p>
          {message ? (
            <>
              <Quote aria-hidden className="mt-3 h-7 w-7 text-secondary" />
              <p className="mt-2 text-sm leading-7 text-white/82 sm:text-base">
                {message}
              </p>
            </>
          ) : null}
          <div
            className={message ? "mt-4 text-sm leading-6" : "text-sm leading-6"}
          >
            <p className="font-bold text-white">{displayName}</p>
            <p className="text-white/70">
              {leaderTitle}, {data.department.name}
            </p>
            {leaderEmail ? (
              <p className="mt-1 text-xs font-semibold text-white/70">
                Email:{" "}
                <a href={`mailto:${leaderEmail}`} className="text-secondary">
                  {leaderEmail}
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutCard({ data }: { data: DepartmentDetailData }) {
  const overview = present(data.department.about);
  if (!overview) return null;

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_9rem] md:items-center">
        <div>
          <SectionKicker>About the Department</SectionKicker>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
            {data.department.name}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">{overview}</p>
        </div>
        <div className="hidden h-24 items-center justify-center rounded-[1.25rem] bg-primary/[0.08] text-primary md:flex">
          <Landmark aria-hidden className="h-14 w-14 stroke-[1.25]" />
        </div>
      </div>
    </section>
  );
}

function RegistrarOfficeHero({ data }: { data: DepartmentDetailData }) {
  const leader = data.leader;
  const leaderName = present(leader?.name) ?? present(data.department.hod_name);
  const leaderTitle = present(leader?.title) ?? "Registrar";
  const leaderEmail = present(data.department.hod_email) ?? present(data.department.email);
  const message =
    present(leader?.message) ??
    present(data.department.head_message) ??
    present(data.department.about);
  const displayName = leaderName ?? "Registrar's office";

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <div className="bg-slate-950 p-5 text-white sm:p-6">
          <div className="mx-auto h-32 w-32 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15">
            <Avatar name={displayName} image={leader?.image} />
          </div>
          <div className="mt-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary">
              Registrar
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight">
              {displayName}
            </h1>
            <p className="mt-2 text-sm font-medium leading-6 text-white/70">
              {leaderTitle}
            </p>
            {leaderEmail ? (
              <a
                href={`mailto:${leaderEmail}`}
                className="mt-4 inline-flex max-w-full items-center justify-center gap-2 rounded-full border border-white/15 px-3 py-2 text-xs font-semibold text-secondary transition hover:bg-white/10"
              >
                <Mail aria-hidden className="h-4 w-4 shrink-0" />
                <span className="truncate">{leaderEmail}</span>
              </a>
            ) : null}
          </div>
        </div>
        <div className="min-w-0 p-5 sm:p-6 lg:p-7">
          <SectionKicker>Registrar's Office</SectionKicker>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950">
            {data.department.name}
          </h2>
          {message ? (
            <div className="mt-5 border-l-4 border-primary/30 pl-4">
              <Quote aria-hidden className="h-7 w-7 text-primary" />
              <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
                {message}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function RegistrarOfficeMandate({ data }: { data: DepartmentDetailData }) {
  const body =
    present(data.department.about) ??
    present(data.department.mandate) ??
    present(data.department.service_charter);

  if (!body) return null;

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_8rem] md:items-center">
        <div>
          <SectionKicker>Office Mandate</SectionKicker>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
            {data.department.name}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-700">{body}</p>
        </div>
        <div className="hidden h-24 items-center justify-center rounded-[1.25rem] bg-primary/[0.08] text-primary md:flex">
          <ShieldCheck aria-hidden className="h-14 w-14 stroke-[1.25]" />
        </div>
      </div>
    </section>
  );
}

function RegistrarPathways({
  data,
  baseHref,
}: {
  data: DepartmentDetailData;
  baseHref: string;
}) {
  const pathways = [
    {
      title: "Office Team",
      body: "Published registrar office staff and role assignments.",
      href: `${baseHref}/team`,
      icon: Users,
      show: data.counts.staff > 0 || Boolean(data.team?.counts.members),
    },
    {
      title: "Services",
      body: "Service records, procedures, requirements, and response timelines.",
      href: `${baseHref}/services`,
      icon: BriefcaseBusiness,
      show: data.services.length > 0,
    },
    {
      title: "Media",
      body: "News, events, announcements, blogs, and gallery records.",
      href: `${baseHref}/media`,
      icon: Newspaper,
      show: true,
    },
    {
      title: "Contact",
      body: "Office location, email, phone, and public contact channels.",
      href: `${baseHref}/contact`,
      icon: Phone,
      show:
        Boolean(present(data.department.email)) ||
        Boolean(present(data.department.phone)) ||
        Boolean(present(data.department.office_location)),
    },
  ].filter((item) => item.show);

  if (!pathways.length) return null;

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {pathways.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/[0.03]"
          >
            <div className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-slate-950 group-hover:text-primary">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.body}
                </p>
              </div>
              <ArrowRight
                aria-hidden
                className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
              />
            </div>
          </Link>
        );
      })}
    </section>
  );
}

function StatementCards({ data }: { data: DepartmentDetailData }) {
  const { department } = data;
  const statements: StatementCard[] = [
    present(department.mission)
      ? { title: "Mission", body: present(department.mission)!, icon: Target }
      : null,
    present(department.vision)
      ? { title: "Vision", body: present(department.vision)!, icon: Eye }
      : null,
    present(department.mandate)
      ? {
        title: "Mandate",
        body: present(department.mandate)!,
        icon: ShieldCheck,
      }
      : null,
  ].filter(Boolean) as StatementCard[];

  if (!statements.length) return null;

  return (
    <section
      className="grid gap-3 md:grid-cols-3"
      aria-label="Department mission, vision and mandate"
    >
      {statements.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.title}
            className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex gap-3 md:block">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary/[0.12] text-secondary md:h-12 md:w-12">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <div className="min-w-0 md:mt-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-slate-700">
                  {item.body}
                </p>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

function TeamSection({ data }: { data: DepartmentDetailData }) {
  const registrarOffice = isRegistrarOffice(data);

  return (
    <EntityTeamSection
      team={data.team}
      title={
        registrarOffice
          ? "Registrar's Office Team"
          : data.isAcademic
            ? "Department Team"
            : "Unit Team"
      }
      emptyTitle={
        registrarOffice
          ? "No public registrar office team records are available yet."
          : "No public department team records are available yet."
      }
    />
  );
}

function ProgrammesSection({ data }: { data: DepartmentDetailData }) {
  if (!data.isAcademic) return null;

  const searchQuery = data.programmeSearchQuery ?? "";
  const hasSearch = Boolean(searchQuery);

  return (
    <section className="grid gap-4">
      <form action="" className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
        <label
          htmlFor="programme-search"
          className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500"
        >
          Search programmes
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
            <input
              id="programme-search"
              name="q"
              type="search"
              defaultValue={searchQuery}
              placeholder="Search by title, type, mode, tutor, or requirement"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90"
          >
            <Search aria-hidden className="h-4 w-4" />
            Search
          </button>
          {hasSearch ? (
            <Link
              href="?"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-primary/30 hover:text-primary"
            >
              Clear
            </Link>
          ) : null}
        </div>
        <p className="mt-2 text-xs font-medium text-slate-500">
          {data.programmes.length} {data.programmes.length === 1 ? "programme" : "programmes"}
          {hasSearch ? ` matching "${searchQuery}"` : " available"}
        </p>
      </form>

      {data.programmes.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {data.programmes.map((programme) => {
            const tutors = programmeTutors(programme);
            const leadTutor = tutors.find((tutor) => tutor.role === "Lead");
            const otherTutors = tutors.filter((tutor) => tutor.id !== leadTutor?.id);

            return (
              <Link
                key={programme.id}
                href={`/academics/programmes/${programme.slug}`}
                className="group flex min-h-[20rem] flex-col rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/[0.03]"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                    <GraduationCap aria-hidden className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary">
                      {formatLabel(programme.level) ?? "Programme"}
                    </p>
                    <h2 className="mt-1 text-base font-bold leading-6 text-slate-950 group-hover:text-primary">
                      {programme.name}
                    </h2>
                    {present(programme.code) ? (
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {programme.code}
                      </p>
                    ) : null}
                  </div>
                  <ArrowRight
                    aria-hidden
                    className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </div>

                <dl className="mt-4 grid gap-2 text-sm">
                  <div className="flex gap-2 rounded-xl bg-slate-50 p-2">
                    <CalendarDays aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <dt className="text-xs font-bold text-slate-500">Duration</dt>
                      <dd className="break-words font-semibold text-slate-900">
                        {present(programme.duration) ?? "Not published"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-2 rounded-xl bg-slate-50 p-2">
                    <Users aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <dt className="text-xs font-bold text-slate-500">Mode</dt>
                      <dd className="break-words font-semibold text-slate-900">
                        {formatLabel(programme.mode_of_study) ?? "Not published"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex gap-2 rounded-xl bg-slate-50 p-2">
                    <FileText aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="min-w-0">
                      <dt className="text-xs font-bold text-slate-500">Type</dt>
                      <dd className="break-words font-semibold text-slate-900">
                        {formatLabel(programme.level) ?? "Not published"}
                      </dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                    Tutors
                  </p>
                  {leadTutor ? (
                    <p className="mt-2 text-sm font-bold leading-5 text-slate-950">
                      Lead: {leadTutor.name}
                    </p>
                  ) : null}
                  {otherTutors.length ? (
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                      {otherTutors.map((tutor) => tutor.name).join(", ")}
                    </p>
                  ) : !leadTutor ? (
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Tutor details are not published.
                    </p>
                  ) : null}
                </div>

                {present(programme.about) ? (
                  <p className="mt-auto line-clamp-2 pt-4 text-sm leading-6 text-slate-600">
                    {programme.about}
                  </p>
                ) : null}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-[1.25rem] border border-dashed border-slate-300 bg-white p-6 text-sm leading-6 text-slate-600">
          No programmes match the current search.
        </div>
      )}
    </section>
  );
}

function PublicationsSection({ data }: { data: DepartmentDetailData }) {
  const publicationHolders = data.staff.filter(
    (person) => Number(person.publications_count ?? 0) > 0,
  );

  if (!publicationHolders.length) return null;

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {publicationHolders.map((person) => {
        const name = personDisplayName(person);
        const count = Number(person.publications_count ?? 0);

        return (
          <article
            key={person.id}
            className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm"
          >
            <SectionKicker>Publication Records</SectionKicker>
            <h2 className="mt-2 text-base font-bold text-slate-950">{name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {count} publication record{count === 1 ? "" : "s"} linked to this
              staff profile.
            </p>
          </article>
        );
      })}
    </section>
  );
}

function ServicesSection({ data }: { data: DepartmentDetailData }) {
  const charter = present(data.department.service_charter);
  const guidelines = present(data.department.guidelines);

  if (!data.services.length && !charter && !guidelines) return null;

  return (
    <div className="grid gap-3">
      {charter || guidelines ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {charter ? (
            <article className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
              <SectionKicker>Service Charter</SectionKicker>
              <p className="mt-2 text-sm leading-6 text-slate-700">{charter}</p>
            </article>
          ) : null}
          {guidelines ? (
            <article className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
              <SectionKicker>Guidelines</SectionKicker>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {guidelines}
              </p>
            </article>
          ) : null}
        </section>
      ) : null}

      {data.services.length ? (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {data.services.map((service) => {
            const meta = compactMeta([
              service.turnaround_time,
              service.fee,
              service.contact_email,
              service.contact_phone,
            ]);

            return (
              <article
                key={service.id}
                className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                    <BriefcaseBusiness aria-hidden className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-slate-950">
                      {service.name}
                    </h2>
                    {present(service.description) ? (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {service.description}
                      </p>
                    ) : null}
                    {present(service.requirements) ? (
                      <p className="mt-3 text-sm leading-6 text-slate-700">
                        <span className="font-bold text-slate-950">
                          Requirements:{" "}
                        </span>
                        {service.requirements}
                      </p>
                    ) : null}
                    {present(service.process) ? (
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        <span className="font-bold text-slate-950">
                          Process:{" "}
                        </span>
                        {service.process}
                      </p>
                    ) : null}
                    {meta ? (
                      <p className="mt-3 text-xs font-semibold text-primary">
                        {meta}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}

function mediaHref(item: DepartmentDetailData["updates"][number]) {
  if (item.recordType === "blog") return `/media/articles/${item.slug}`;
  if (item.recordType === "event") return `/media/events/${item.slug}`;
  if (item.recordType === "announcement") return `/media/announcements/${item.slug}`;
  if (item.recordType === "gallery") return `/media/gallery/${item.id}`;
  return `/media/news/${item.slug}`;
}

function mediaDate(item: DepartmentDetailData["updates"][number]) {
  if (item.recordType === "gallery") return formatDate(item.created_at);
  if (item.recordType === "event") return formatDate(item.start_date);
  return formatDate(item.published_at ?? item.created_at);
}

function mediaTitle(item: DepartmentDetailData["updates"][number]) {
  if (item.recordType === "gallery") {
    return present(item.title) ?? present(item.original_filename) ?? "Gallery image";
  }
  return item.title;
}

function mediaSummary(item: DepartmentDetailData["updates"][number]) {
  if (item.recordType === "gallery") {
    return (
      present(item.description) ?? present(item.caption) ?? present(item.alt_text)
    );
  }
  return present(item.summary);
}

function mediaLabel(item: DepartmentDetailData["updates"][number]) {
  if (item.recordType === "gallery") return "Gallery";
  if (item.recordType === "blog") return "Blog";
  if (item.recordType === "event") return "Event";
  if (item.recordType === "announcement") return "Announcement";
  return "News";
}

function MediaSection({
  data,
  mediaType,
  baseHref,
}: {
  data: DepartmentDetailData;
  mediaType?: EntityMediaType;
  baseHref: string;
}) {
  const updates = data.updates.filter((item) =>
    entityMediaTypeMatches(item, mediaType),
  );
  const scopedCount = updates.filter((item) => item.recordScope !== "fallback").length;
  const fallbackCount = updates.filter((item) => item.recordScope === "fallback").length;

  return (
    <section className="grid gap-3">
      {!mediaType ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {buildMediaTypeLinks(baseHref).map((item) => (
            <LinkedMediaCategory key={item.href} item={item} />
          ))}
        </div>
      ) : null}
      {fallbackCount > 0 && scopedCount === 0 && mediaType !== "gallery" ? (
        <p className="rounded-[1.25rem] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
          No records are currently published for this department, so the latest
          university-wide {entityMediaTypeTitle(mediaType).toLowerCase()} are shown.
        </p>
      ) : null}
      {!updates.length ? (
        <p className="rounded-[1.25rem] border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
          No {mediaType ? entityMediaTypeTitle(mediaType).toLowerCase() : "media"} records
          are currently published for this department.
        </p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {updates.map((item) => (
          <Link
            key={`${item.recordType}-${item.id}`}
            href={mediaHref(item)}
            className="group rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/[0.03]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
              {mediaLabel(item)}
            </p>
            <h2 className="mt-2 text-base font-bold text-slate-950 group-hover:text-primary">
              {mediaTitle(item)}
            </h2>
            {mediaSummary(item) ? (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                {mediaSummary(item)}
              </p>
            ) : null}
            {mediaDate(item) ? (
              <p className="mt-3 text-xs font-semibold text-slate-500">
                {mediaDate(item)}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

function LinkedMediaCategory({ item }: { item: EntityQuickLink }) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className="group rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/[0.03]"
    >
      <div className="flex gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
            Media category
          </p>
          <h2 className="mt-1 text-base font-bold text-slate-950 group-hover:text-primary">
            {item.label}
          </h2>
        </div>
        <ArrowRight
          aria-hidden
          className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary"
        />
      </div>
    </Link>
  );
}

function DownloadsSection({ data }: { data: DepartmentDetailData }) {
  if (!data.documents.length) return null;

  return (
    <section className="grid gap-3">
      {data.documents.map((document) => {
        const meta = compactMeta([
          document.document_type,
          document.category,
          document.version,
          formatDate(document.updated_at),
        ]);
        const fileId = present(document.file_id);

        return (
          <article
            key={document.id}
            className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                <FileText aria-hidden className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-slate-950">
                  {document.title}
                </h2>
                {meta ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {meta}
                  </p>
                ) : null}
                {present(document.description) ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {document.description}
                  </p>
                ) : null}
              </div>
              {fileId ? (
                <a
                  href={publicFileUrl(fileId) ?? undefined}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 text-primary transition hover:bg-primary hover:text-white"
                  aria-label={`Download ${document.title}`}
                >
                  <Download aria-hidden className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function ContactSection({ data }: { data: DepartmentDetailData }) {
  const { department } = data;
  const rows = [
    {
      label: "Office",
      value: present(department.office_location),
      icon: MapPin,
    },
    { label: "Email", value: present(department.email), icon: Mail },
    { label: "Phone", value: present(department.phone), icon: Phone },
    { label: "Website", value: present(department.website), icon: Globe },
  ].filter((item) => item.value);

  if (!rows.length) return null;

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm"
          >
            <Icon aria-hidden className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-sm font-bold text-slate-950">
              {item.label}
            </h2>
            <p className="mt-1 break-words text-sm font-semibold leading-6 text-primary [overflow-wrap:anywhere]">
              {item.value}
            </p>
          </article>
        );
      })}
    </section>
  );
}

function RegistrarOfficeOverview({
  data,
  baseHref,
}: {
  data: DepartmentDetailData;
  baseHref: string;
}) {
  return (
    <>
      <RegistrarOfficeHero data={data} />
      <RegistrarOfficeMandate data={data} />
      <RegistrarPathways data={data} baseHref={baseHref} />
      <StatementCards data={data} />
    </>
  );
}

function DepartmentOverview({
  data,
  baseHref,
}: {
  data: DepartmentDetailData;
  baseHref: string;
}) {
  if (isRegistrarOffice(data)) {
    return <RegistrarOfficeOverview data={data} baseHref={baseHref} />;
  }

  return (
    <>
      <LeadershipMessageCard data={data} />
      <AboutCard data={data} />
      <StatementCards data={data} />
    </>
  );
}

function renderSection(
  section: DepartmentDetailSectionKey,
  data: DepartmentDetailData,
  baseHref: string,
  mediaType?: EntityMediaType,
) {
  switch (section) {
    case "about":
      return <DepartmentOverview data={data} baseHref={baseHref} />;
    case "team":
      return <TeamSection data={data} />;
    case "programmes":
      return <ProgrammesSection data={data} />;
    case "publications":
      return <PublicationsSection data={data} />;
    case "services":
      return <ServicesSection data={data} />;
    case "media":
      return <MediaSection data={data} mediaType={mediaType} baseHref={baseHref} />;
    case "downloads":
      return <DownloadsSection data={data} />;
    case "contact":
      return <ContactSection data={data} />;
  }
}

export function DepartmentDetailSection({
  data,
  section,
  baseHref,
  header,
  mediaType,
}: {
  data: DepartmentDetailData;
  section: DepartmentDetailSectionKey;
  baseHref: string;
  header?: ReactNode;
  navItems?: EntityHeaderNavItem[];
  mediaType?: EntityMediaType;
}) {
  const registrarOffice = isRegistrarOffice(data);
  const baseMeta = registrarOffice
    ? registrarSectionMeta(section, mediaType)
    : sectionMeta[section];
  const meta =
    section === "media"
      ? {
        ...baseMeta,
        title: entityMediaTypeTitle(mediaType),
        body: entityMediaTypeBody(mediaType),
      }
      : baseMeta;
  const contactPanel = <ContactPanel data={data} />;
  const infoPanel = <DepartmentInfoPanel data={data} />;

  return (
    <PageShell header={header}>
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_68%,#f6f8fc_100%)] px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="grid w-full gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(260px,0.22fr)] 2xl:grid-cols-[minmax(0,1fr)_minmax(300px,0.22fr)] xl:items-start">
            <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-28 xl:block">
              <ExploreMorePanel data={data} />
            </aside>

            <ScrollReveal as="main" className="grid min-w-0 gap-4">
              {section === "about" || section === "team" ? null : (
                <PageIntro meta={meta} />
              )}
              {renderSection(section, data, baseHref, mediaType)}
            </ScrollReveal>

            <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-28 xl:block">
              {contactPanel}
              {infoPanel}
            </aside>

            <aside className="grid gap-4 xl:hidden">
              {contactPanel}
              {infoPanel}
            </aside>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
