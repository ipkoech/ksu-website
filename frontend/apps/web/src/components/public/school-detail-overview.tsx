import Link from "next/link";
import type { ReactNode } from "react";
import type { EntityHeaderNavItem } from "@ksu/ui/layout/public";
import {
  ArrowRight,
  Building2,
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
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { PublicImage } from "@/components/public/public-image";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import type { SchoolDetailOverviewData } from "@/lib/school-detail-data";

type QuickLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type StatementCard = {
  title: string;
  body: string;
  icon: LucideIcon;
};

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

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function schoolSummary(data: SchoolDetailOverviewData) {
  const { school } = data;
  return present(school.about) ?? present(school.description);
}

function formatCount(count: number, singular: string, plural = `${singular}s`) {
  return count > 0 ? `${count} ${count === 1 ? singular : plural}` : null;
}

function linkHref(value: string | null) {
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
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

function navHas(navItems: EntityHeaderNavItem[] | undefined, label: string) {
  return Boolean(navItems?.some((item) => item.label === label));
}

function DeanPortrait({
  name,
  image,
}: {
  name: string;
  image?: string | null;
}) {
  if (image) {
    return (
      <PublicImage
        src={image}
        alt={name}
        ratio="profile"
        sizes="220px"
        className="h-full w-full"
      />
    );
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#dbeafe,#bfdbfe_54%,#fff7ed)] font-[family-name:var(--font-display)] text-5xl font-semibold text-primary">
      {initialsFromName(name)}
    </div>
  );
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
  navItems,
  counts,
}: {
  baseHref: string;
  navItems?: EntityHeaderNavItem[];
  counts: SchoolDetailOverviewData["counts"];
}) {
  const links: QuickLink[] = [
    {
      label: "Programmes",
      href: `${baseHref}/programmes`,
      icon: GraduationCap,
    },
    { label: "Team", href: `${baseHref}/team`, icon: Users },
  ];

  if (counts.publications > 0 || navHas(navItems, "Publications")) {
    links.push({
      label: "Publications",
      href: `${baseHref}/publications`,
      icon: FileText,
    });
  }

  links.push(
    { label: "News", href: `${baseHref}/news`, icon: Newspaper },
    { label: "Downloads", href: `${baseHref}/downloads`, icon: Download },
  );

  if (counts.clubs > 0 || navHas(navItems, "Clubs")) {
    links.push({
      label: "Clubs & Societies",
      href: `${baseHref}/clubs`,
      icon: Sparkles,
    });
  }

  links.push({ label: "Contact", href: `${baseHref}/contact`, icon: Phone });

  return links;
}

function QuickLinksPanel({ links }: { links: QuickLink[] }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <SectionKicker>Quick Links</SectionKicker>
      <nav aria-label="School quick links" className="mt-3">
        <ul className="divide-y divide-slate-100">
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
      </nav>
    </section>
  );
}

function ExploreMorePanel() {
  const links: QuickLink[] = [
    {
      label: "Academic Calendar",
      href: "/academics/calendar",
      icon: CalendarDays,
    },
    { label: "Admissions", href: "/admissions", icon: GraduationCap },
  ];

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

function MobileQuickGrid({ links }: { links: QuickLink[] }) {
  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:hidden">
      {links.map((item) => {
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-[5rem] flex-col items-center justify-center gap-2 rounded-[1.1rem] border border-slate-200 bg-white p-2 text-center text-[0.72rem] font-semibold leading-4 text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary"
          >
            <Icon aria-hidden className="h-5 w-5 text-primary" />
            <span>{item.label}</span>
          </Link>
        );
      })}
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

function ContactPanel({
  email,
  phone,
  office,
  website,
}: {
  email: string | null;
  phone: string | null;
  office: string | null;
  website: string | null;
}) {
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

function SchoolInfoPanel({
  code,
  established,
  departments,
  programmes,
  staff,
  lastUpdated,
}: {
  code: string | null;
  established: string | number | null;
  departments: string | null;
  programmes: string | null;
  staff: string | null;
  lastUpdated: string | null;
}) {
  const items = [
    { label: "School Code", value: code, icon: FileText },
    { label: "Established", value: established, icon: CalendarDays },
    { label: "Departments", value: departments, icon: Building2 },
    { label: "Programmes", value: programmes, icon: GraduationCap },
    { label: "Team Records", value: staff, icon: Users },
    { label: "Last Updated", value: lastUpdated, icon: CalendarDays },
  ].filter((item) => present(item.value));

  if (!items.length) return null;

  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
      <SectionKicker>School Information</SectionKicker>
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

function DeanMessageCard({
  deanName,
  deanTitle,
  deanMessage,
  deanImage,
  schoolName,
  deanEmail,
}: {
  deanName: string;
  deanTitle: string;
  deanMessage: string | null;
  deanImage?: string | null;
  schoolName: string;
  deanEmail: string | null;
}) {
  return (
    <section className="overflow-hidden rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-[0_24px_70px_-48px_rgba(15,23,42,0.9)] sm:p-6">
      <div className="grid gap-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center">
        <div className="w-24 overflow-hidden rounded-full bg-white/10 ring-1 ring-white/15 sm:w-auto">
          <div className="aspect-square">
            <DeanPortrait name={deanName} image={deanImage} />
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-secondary">
            Dean's Message
          </p>
          <Quote aria-hidden className="mt-3 h-7 w-7 text-secondary" />
          {deanMessage ? (
            <p className="mt-2 text-sm leading-7 text-white/82 sm:text-base">
              {deanMessage}
            </p>
          ) : null}
          <div className="mt-4 text-sm leading-6">
            <p className="font-bold text-white">{deanName}</p>
            <p className="text-white/70">
              {deanTitle}, {schoolName}
            </p>
            {deanEmail ? (
              <p className="mt-1 text-xs font-semibold text-white/70">
                Email:{" "}
                <a href={`mailto:${deanEmail}`} className="text-secondary">
                  {deanEmail}
                </a>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutCard({
  schoolName,
  overview,
}: {
  schoolName: string;
  overview: string;
}) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_9rem] md:items-center">
        <div>
          <SectionKicker>About the School</SectionKicker>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
            {schoolName}
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

function StatementCards({ statements }: { statements: StatementCard[] }) {
  return (
    <section
      id="school-statements"
      className="grid gap-3 md:grid-cols-3"
      aria-label="School mission, vision and mandate"
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

export function SchoolDetailOverview({
  data,
  header,
  navItems,
}: {
  data: SchoolDetailOverviewData;
  header?: ReactNode;
  navItems?: EntityHeaderNavItem[];
}) {
  const { school, dean, counts } = data;
  const schoolName = school.name;
  const baseHref = `/academics/schools/${school.slug}`;
  const deanName =
    present(dean?.name) ?? present(school.dean_name) ?? "Dean profile";
  const deanTitle = present(dean?.title) ?? "Dean";
  const deanEmail = present(school.dean_email);
  const deanMessage = present(school.head_message) ?? present(dean?.message);
  const overview = schoolSummary(data);
  const email = present(school.email);
  const phone = present(school.phone);
  const office = present(school.office_location) ?? present(school.address);
  const website = present(school.website);
  const quickLinks = buildQuickLinks({ baseHref, navItems, counts });
  const established =
    formatDate(school.establishment_date) ?? school.founded_year ?? null;

  const contactPanel = (
    <ContactPanel
      email={email}
      phone={phone}
      office={office}
      website={website}
    />
  );
  const schoolInfoPanel = (
    <SchoolInfoPanel
      code={present(school.code)}
      established={established}
      departments={formatCount(counts.departments, "department")}
      programmes={formatCount(counts.programmes, "programme")}
      staff={formatCount(counts.staff, "record")}
      lastUpdated={formatDate(school.updated_at)}
    />
  );

  const mission = present(school.mission);
  const vision = present(school.vision);
  const mandate = present(school.mandate);
  const statements: StatementCard[] = [
    mission ? { title: "Mission", body: mission, icon: Target } : null,
    vision ? { title: "Vision", body: vision, icon: Eye } : null,
    mandate ? { title: "Mandate", body: mandate, icon: ShieldCheck } : null,
  ].filter(Boolean) as StatementCard[];
  const showDeanCard = Boolean(
    dean || present(school.dean_name) || deanMessage,
  );

  return (
    <PageShell header={header}>
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_68%,#f6f8fc_100%)] px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mb-4">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "Academics", href: "/academics" },
                { label: "Schools", href: "/academics/schools" },
                { label: schoolName },
              ]}
            />
            <h1 className="sr-only">{schoolName}</h1>
          </div>
          <div className="grid w-full gap-4 xl:grid-cols-[minmax(220px,0.2fr)_minmax(0,1fr)_minmax(260px,0.22fr)] 2xl:grid-cols-[minmax(240px,0.18fr)_minmax(0,1fr)_minmax(300px,0.22fr)] xl:items-start">
            <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-28 xl:block">
              <QuickLinksPanel links={quickLinks} />
              <ExploreMorePanel />
            </aside>

            <ScrollReveal as="main" className="grid min-w-0 gap-4">
              {showDeanCard ? (
                <DeanMessageCard
                  deanName={deanName}
                  deanTitle={deanTitle}
                  deanMessage={deanMessage}
                  deanImage={dean?.image}
                  schoolName={schoolName}
                  deanEmail={deanEmail}
                />
              ) : null}
              <MobileQuickGrid links={quickLinks} />
              {overview ? (
                <AboutCard schoolName={schoolName} overview={overview} />
              ) : null}
              {statements.length ? (
                <StatementCards statements={statements} />
              ) : null}
            </ScrollReveal>

            <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-28 xl:block">
              {contactPanel}
              {schoolInfoPanel}
            </aside>

            <aside className="grid gap-4 xl:hidden">
              {contactPanel}
              {schoolInfoPanel}
            </aside>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
