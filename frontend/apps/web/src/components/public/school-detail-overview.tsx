import Link from "next/link";
import type { ReactNode } from "react";
import type { EntityHeaderNavItem } from "@ksu/ui/layout/public";
import {
  ArrowRight,
  BookOpenCheck,
  Building2,
  CalendarDays,
  ClipboardCheck,
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
import { PageShell } from "@/components/site-shell";
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

type MetricItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  href?: string;
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

  return selected.map((part) => part[0]).join("").toUpperCase();
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
    return <img src={image} alt={name} className="h-full w-full object-cover" />;
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

  return <div className="flex w-full min-w-0 gap-3 rounded-xl p-2">{content}</div>;
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

function MetricCell({ item }: { item: MetricItem }) {
  const Icon = item.icon;
  const content = (
    <>
      <Icon aria-hidden className="h-5 w-5 shrink-0 text-primary" />
      <span className="min-w-0">
        <span className="block text-[0.68rem] font-bold uppercase leading-4 text-slate-500">
          {item.label}
        </span>
        <span className="mt-1 block break-words text-sm font-bold leading-5 text-slate-950">
          {item.value}
        </span>
      </span>
    </>
  );

  const className =
    "flex min-h-[5.25rem] min-w-0 items-start gap-3 bg-white p-4 transition hover:bg-primary/[0.04]";

  if (item.href) {
    return (
      <Link href={item.href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

function MetricStrip({ items }: { items: MetricItem[] }) {
  return (
    <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((item) => (
        <MetricCell key={item.label} item={item} />
      ))}
    </div>
  );
}

function SchoolOverviewPanel({
  schoolName,
  overview,
  baseHref,
  code,
  established,
  metrics,
  sourceBacked,
}: {
  schoolName: string;
  overview: string | null;
  baseHref: string;
  code: string | null;
  established: string | number | null;
  metrics: MetricItem[];
  sourceBacked: boolean;
}) {
  const status = sourceBacked ? "School profile" : "School overview";

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_17rem]">
        <div className="min-w-0 px-5 py-6 sm:px-7 lg:px-8">
          <SectionKicker>About the School</SectionKicker>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-slate-950 sm:text-5xl">
            {schoolName}
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
            {overview ??
              "This school profile will show its academic focus, departments, programmes, leadership, and contact pathways when the public record is published."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={`${baseHref}/programmes`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90"
            >
              View programmes
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
            <Link
              href="/admissions"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/25 bg-white px-5 text-sm font-bold text-primary transition hover:border-primary hover:bg-primary/[0.06]"
            >
              Admissions
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
          <div className="rounded-full border border-primary/15 bg-white px-4 py-2 text-xs font-bold text-primary">
            {status}
          </div>
          <dl className="mt-5 grid gap-4">
            {code ? (
              <div>
                <dt className="text-[0.68rem] font-bold uppercase text-slate-500">
                  Code
                </dt>
                <dd className="mt-1 text-sm font-bold text-slate-950">{code}</dd>
              </div>
            ) : null}
            {established ? (
              <div>
                <dt className="text-[0.68rem] font-bold uppercase text-slate-500">
                  Established
                </dt>
                <dd className="mt-1 text-sm font-bold text-slate-950">
                  {established}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-[0.68rem] font-bold uppercase text-slate-500">
                Academic home
              </dt>
              <dd className="mt-1 text-sm font-bold text-slate-950">
                Schools and departments
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <MetricStrip items={metrics} />
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

function AboutCard({ overview }: { overview: string }) {
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_9rem] md:items-center">
        <div>
          <SectionKicker>School Profile</SectionKicker>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
            Academic context
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

function PathwayPanel({ baseHref }: { baseHref: string }) {
  const items: MetricItem[] = [
    {
      label: "Departments",
      value: "Explore academic departments",
      icon: Building2,
    },
    {
      label: "Programmes",
      value: "Compare school programmes",
      href: `${baseHref}/programmes`,
      icon: BookOpenCheck,
    },
    {
      label: "Admissions",
      value: "Review application steps",
      href: "/admissions/how-to-apply",
      icon: ClipboardCheck,
    },
  ];

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
      <div className="px-5 py-5 sm:px-6">
        <SectionKicker>Explore Pathways</SectionKicker>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
          Continue through the school
        </h2>
      </div>
      <div className="grid gap-px bg-slate-200 md:grid-cols-3">
        {items.map((item) => (
          <MetricCell key={item.label} item={item} />
        ))}
      </div>
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
  const deanMessage =
    present(dean?.message) ??
    present(school.head_message);
  const overview = schoolSummary(data);
  const email = present(school.email);
  const phone = present(school.phone);
  const office = present(school.office_location) ?? present(school.address);
  const website = present(school.website);
  const quickLinks = buildQuickLinks({ baseHref, navItems, counts });
  const established =
    formatDate(school.establishment_date) ?? school.founded_year ?? null;
  const metricItems: MetricItem[] = [
    {
      label: "Departments",
      value: formatCount(counts.departments, "department") ?? "Not published yet",
      icon: Building2,
    },
    {
      label: "Programmes",
      value: formatCount(counts.programmes, "programme") ?? "Not published yet",
      href: `${baseHref}/programmes`,
      icon: GraduationCap,
    },
    {
      label: "Team records",
      value: formatCount(counts.staff, "record") ?? "Not published yet",
      href: `${baseHref}/team`,
      icon: Users,
    },
    {
      label: "Downloads",
      value: formatCount(counts.documents, "file") ?? "Not published yet",
      href: `${baseHref}/downloads`,
      icon: Download,
    },
    {
      label: "News",
      value: formatCount(counts.news, "update") ?? "Not published yet",
      href: `${baseHref}/news`,
      icon: Newspaper,
    },
  ];

  const contactPanel = <ContactPanel email={email} phone={phone} office={office} website={website} />;
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
  const showDeanCard = Boolean(dean || present(school.dean_name) || deanMessage);

  return (
    <PageShell header={header}>
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_68%,#f6f8fc_100%)] px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="grid w-full gap-4 xl:grid-cols-[minmax(220px,0.2fr)_minmax(0,1fr)_minmax(260px,0.22fr)] 2xl:grid-cols-[minmax(240px,0.18fr)_minmax(0,1fr)_minmax(300px,0.22fr)] xl:items-start">
            <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-28 xl:block">
              <QuickLinksPanel links={quickLinks} />
              <ExploreMorePanel />
            </aside>

            <main className="grid min-w-0 gap-4">
              <SchoolOverviewPanel
                schoolName={schoolName}
                overview={overview}
                baseHref={baseHref}
                code={present(school.code)}
                established={established}
                metrics={metricItems}
                sourceBacked={data.sourceBacked}
              />
              <MobileQuickGrid links={quickLinks} />
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
              {overview ? <AboutCard overview={overview} /> : null}
              {statements.length ? <StatementCards statements={statements} /> : null}
              <PathwayPanel baseHref={baseHref} />
            </main>

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
