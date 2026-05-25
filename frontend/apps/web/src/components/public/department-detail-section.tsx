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
  ShieldCheck,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageShell } from "@/components/site-shell";
import { DepartmentTeamDirectory } from "@/components/public/department-team-directory";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import type { DepartmentDetailData } from "@/lib/department-detail-data";
import { publicFileUrl, resolvePublicMediaUrl } from "@/lib/public-media";

export type DepartmentDetailSectionKey =
  | "about"
  | "team"
  | "programmes"
  | "publications"
  | "services"
  | "news"
  | "downloads"
  | "contact";

type QuickLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  section: DepartmentDetailSectionKey;
};

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
  news: {
    eyebrow: "News",
    title: "Department news",
    body: "News and updates connected to this department.",
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
  return selected.map((part) => part[0]).join("").toUpperCase();
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
    .join(" | ");
}

function navHas(navItems: EntityHeaderNavItem[] | undefined, label: string) {
  return Boolean(navItems?.some((item) => item.label === label));
}

function SectionKicker({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
      {children}
    </p>
  );
}

function buildQuickLinks({
  baseHref,
  data,
  navItems,
}: {
  baseHref: string;
  data: DepartmentDetailData;
  navItems?: EntityHeaderNavItem[];
}) {
  const links: QuickLink[] = [
    { label: "About", href: baseHref, icon: Landmark, section: "about" },
    { label: "Team", href: `${baseHref}/team`, icon: Users, section: "team" },
  ];

  if (data.isAcademic) {
    links.push({
      label: "Programmes",
      href: `${baseHref}/programmes`,
      icon: GraduationCap,
      section: "programmes",
    });
  }

  if (data.counts.publications > 0 || navHas(navItems, "Publications")) {
    links.push({
      label: "Publications",
      href: `${baseHref}/publications`,
      icon: FileText,
      section: "publications",
    });
  }

  links.push(
    {
      label: "Services",
      href: `${baseHref}/services`,
      icon: BriefcaseBusiness,
      section: "services",
    },
    { label: "News", href: `${baseHref}/news`, icon: Newspaper, section: "news" },
    {
      label: "Downloads",
      href: `${baseHref}/downloads`,
      icon: Download,
      section: "downloads",
    },
    { label: "Contact", href: `${baseHref}/contact`, icon: Phone, section: "contact" },
  );

  return links;
}

function QuickLinksPanel({
  links,
  activeSection,
}: {
  links: QuickLink[];
  activeSection: DepartmentDetailSectionKey;
}) {
  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
      <SectionKicker>Quick Links</SectionKicker>
      <nav aria-label="Department quick links" className="mt-3">
        <ul className="divide-y divide-slate-100">
          {links.map((item) => {
            const Icon = item.icon;
            const active = item.section === activeSection;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group flex min-h-10 items-center gap-3 py-2 text-sm font-medium transition ${
                    active ? "text-primary" : "text-slate-700 hover:text-primary"
                  }`}
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
      </nav>
    </section>
  );
}

function MobileQuickGrid({
  links,
  activeSection,
}: {
  links: QuickLink[];
  activeSection: DepartmentDetailSectionKey;
}) {
  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:hidden">
      {links.map((item) => {
        const Icon = item.icon;
        const active = item.section === activeSection;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[4.5rem] flex-col items-center justify-center gap-2 rounded-[1.1rem] border bg-white p-2 text-center text-[0.72rem] font-semibold leading-4 shadow-sm transition ${
              active
                ? "border-primary/30 text-primary"
                : "border-slate-200 text-slate-700 hover:border-primary/30 hover:text-primary"
            }`}
          >
            <Icon aria-hidden className="h-5 w-5 text-primary" />
            <span>{item.label}</span>
          </Link>
        );
      })}
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

  return <div className="flex w-full min-w-0 gap-3 rounded-xl p-2">{content}</div>;
}

function ContactPanel({ data }: { data: DepartmentDetailData }) {
  const { department } = data;
  const email = present(department.email);
  const phone = present(department.phone);
  const office = present(department.office_location) ?? present(department.address);
  const website = present(department.website);

  if (!email && !phone && !office && !website) return null;

  return (
    <section className="min-w-0 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
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
  const schoolName = present(department.school?.name) ?? present(department.school_name);
  const wingName = present(department.wing?.name);
  const divisionName = present(department.wing?.division?.name);
  const items = [
    { label: "Department Code", value: present(department.code), icon: FileText },
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
      value: data.isAcademic ? formatCount(counts.programmes, "programme") : null,
      icon: GraduationCap,
    },
    {
      label: "Services",
      value: formatCount(counts.services, "service"),
      icon: BriefcaseBusiness,
    },
    { label: "Team Records", value: formatCount(counts.staff, "record"), icon: Users },
    {
      label: "Last Updated",
      value: formatDate(department.updated_at),
      icon: CalendarDays,
    },
  ].filter((item) => present(item.value));

  if (!items.length) return null;

  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
      <SectionKicker>Department Information</SectionKicker>
      <dl className="mt-3 grid gap-2">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="flex w-full min-w-0 gap-3 rounded-xl p-2">
              <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <dt className="text-xs font-bold text-slate-950">{item.label}</dt>
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

function Avatar({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  const source = resolvePublicMediaUrl(image);

  if (source) {
    return <img src={source} alt={name} className="h-full w-full object-cover" />;
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
    (data.isAcademic ? "Head of Department" : "Department Lead");
  const leaderEmail = present(data.department.hod_email);
  const message = present(leader?.message) ?? present(data.department.head_message);

  if (!leaderName) return null;

  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
      <SectionKicker>{data.isAcademic ? "Head's Message" : "Leadership Message"}</SectionKicker>
      <div
        className={`mt-3 grid gap-4 ${
          compact
            ? "sm:grid-cols-[110px_minmax(0,1fr)]"
            : "sm:grid-cols-[150px_minmax(0,1fr)] sm:gap-5"
        }`}
      >
        <div className="overflow-hidden rounded-[1.1rem] bg-slate-100">
          <div className={compact ? "aspect-square" : "aspect-[5/4] sm:aspect-square"}>
            <Avatar name={leaderName} image={leader?.image} />
          </div>
        </div>
        <div className="min-w-0">
          {message ? (
            <>
              <Quote aria-hidden className="h-7 w-7 text-primary" />
              <p className="mt-2 text-sm leading-6 text-slate-700">{message}</p>
            </>
          ) : null}
          <div className={message ? "mt-4 text-sm leading-6" : "text-sm leading-6"}>
            <p className="font-bold text-slate-950">{leaderName}</p>
            <p className="text-slate-600">
              {leaderTitle}, {data.department.name}
            </p>
            {leaderEmail ? (
              <p className="mt-1 text-xs font-semibold text-slate-600">
                Email:{" "}
                <a href={`mailto:${leaderEmail}`} className="text-primary">
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
    <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_10rem] md:items-center">
        <div>
          <SectionKicker>About the Department</SectionKicker>
          <p className="mt-3 text-sm leading-6 text-slate-700">{overview}</p>
        </div>
        <div className="hidden h-24 items-center justify-center rounded-[1.1rem] bg-primary/[0.08] text-primary md:flex">
          <Landmark aria-hidden className="h-14 w-14 stroke-[1.25]" />
        </div>
      </div>
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
      ? { title: "Mandate", body: present(department.mandate)!, icon: ShieldCheck }
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
            className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm"
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
  const staff = data.staff;
  const assignments = data.staffAssignments;
  const hasLeader = Boolean(data.leader ?? present(data.department.hod_name));

  if (!hasLeader && !assignments.length && !staff.length) return null;

  return <DepartmentTeamDirectory data={data} />;
}

function ProgrammesSection({ data }: { data: DepartmentDetailData }) {
  if (!data.isAcademic || !data.programmes.length) return null;

  return (
    <section className="grid gap-3 md:grid-cols-2">
      {data.programmes.map((programme) => {
        const meta = compactMeta([
          programme.level,
          programme.mode_of_study,
          programme.duration,
        ]);

        return (
          <Link
            key={programme.id}
            href={`/academics/programmes/${programme.slug}`}
            className="group rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/[0.03]"
          >
            <div className="flex gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                <GraduationCap aria-hidden className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-slate-950 group-hover:text-primary">
                  {programme.name}
                </h2>
                {meta ? (
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {meta}
                  </p>
                ) : null}
                {present(programme.about) ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {programme.about}
                  </p>
                ) : null}
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

function PublicationsSection({ data }: { data: DepartmentDetailData }) {
  const publicationHolders = data.staff.filter(
    (person) => Number(person.publications_count ?? 0) > 0,
  );

  if (!publicationHolders.length) return null;

  return (
    <section className="grid gap-3 md:grid-cols-2">
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
        <section className="grid gap-3 md:grid-cols-2">
          {charter ? (
            <article className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
              <SectionKicker>Service Charter</SectionKicker>
              <p className="mt-2 text-sm leading-6 text-slate-700">{charter}</p>
            </article>
          ) : null}
          {guidelines ? (
            <article className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
              <SectionKicker>Guidelines</SectionKicker>
              <p className="mt-2 text-sm leading-6 text-slate-700">{guidelines}</p>
            </article>
          ) : null}
        </section>
      ) : null}

      {data.services.length ? (
        <section className="grid gap-3 md:grid-cols-2">
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
                        <span className="font-bold text-slate-950">Process: </span>
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

function NewsSection({ data }: { data: DepartmentDetailData }) {
  if (!data.news.length) return null;

  return (
    <section className="grid gap-3 md:grid-cols-2">
      {data.news.map((item) => {
        const summary = present(item.summary);
        const publishedAt = formatDate(item.published_at ?? item.created_at);

        return (
          <Link
            key={item.id}
            href={`/news/${item.slug}`}
            className="group rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/[0.03]"
          >
            <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
              {present(item.category) ?? "News"}
            </p>
            <h2 className="mt-2 text-base font-bold text-slate-950 group-hover:text-primary">
              {item.title}
            </h2>
            {summary ? (
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                {summary}
              </p>
            ) : null}
            {publishedAt ? (
              <p className="mt-3 text-xs font-semibold text-slate-500">
                {publishedAt}
              </p>
            ) : null}
          </Link>
        );
      })}
    </section>
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
      value: present(department.office_location) ?? present(department.address),
      icon: MapPin,
    },
    { label: "Email", value: present(department.email), icon: Mail },
    { label: "Phone", value: present(department.phone), icon: Phone },
    { label: "Website", value: present(department.website), icon: Globe },
  ].filter((item) => item.value);

  if (!rows.length) return null;

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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

function DepartmentOverview({ data }: { data: DepartmentDetailData }) {
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
) {
  switch (section) {
    case "about":
      return <DepartmentOverview data={data} />;
    case "team":
      return <TeamSection data={data} />;
    case "programmes":
      return <ProgrammesSection data={data} />;
    case "publications":
      return <PublicationsSection data={data} />;
    case "services":
      return <ServicesSection data={data} />;
    case "news":
      return <NewsSection data={data} />;
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
  navItems,
}: {
  data: DepartmentDetailData;
  section: DepartmentDetailSectionKey;
  baseHref: string;
  header?: ReactNode;
  navItems?: EntityHeaderNavItem[];
}) {
  const quickLinks = buildQuickLinks({ baseHref, data, navItems });
  const meta = sectionMeta[section];
  const contactPanel = <ContactPanel data={data} />;
  const infoPanel = <DepartmentInfoPanel data={data} />;

  return (
    <PageShell header={header}>
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_70%)] px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="grid w-full gap-3 xl:grid-cols-[minmax(220px,0.22fr)_minmax(0,1fr)_minmax(240px,0.24fr)] 2xl:grid-cols-[minmax(240px,0.2fr)_minmax(0,1fr)_minmax(280px,0.22fr)] xl:items-start">
          <aside className="hidden min-w-0 space-y-3 xl:block xl:sticky xl:top-28">
              <QuickLinksPanel links={quickLinks} activeSection={section} />
            </aside>

            <main className="grid min-w-0 gap-3">
              {section === "about" || section === "team" ? null : <PageIntro meta={meta} />}
              <MobileQuickGrid links={quickLinks} activeSection={section} />
              {renderSection(section, data)}
            </main>

          <aside className="hidden min-w-0 space-y-3 xl:block xl:sticky xl:top-28">
              {contactPanel}
              {infoPanel}
            </aside>

            <aside className="grid gap-3 xl:hidden">
              {contactPanel}
              {infoPanel}
            </aside>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
