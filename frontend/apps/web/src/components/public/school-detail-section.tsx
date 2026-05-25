import Link from "next/link";
import type { ReactNode } from "react";
import type { EntityHeaderNavItem } from "@ksu/ui/layout/public";
import {
  ArrowRight,
  CalendarDays,
  Download,
  FileText,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageShell } from "@/components/site-shell";
import { Organogram } from "@/components/public/organogram";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import type { SchoolDetailOverviewData } from "@/lib/school-detail-data";
import { publicFileUrl } from "@/lib/public-media";

export type SchoolDetailSectionKey =
  | "team"
  | "programmes"
  | "publications"
  | "news"
  | "downloads"
  | "clubs"
  | "contact";

type QuickLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  section: SchoolDetailSectionKey;
};

type SectionMeta = {
  eyebrow: string;
  title: string;
  body: string;
  icon: LucideIcon;
};

const sectionMeta: Record<SchoolDetailSectionKey, SectionMeta> = {
  team: {
    eyebrow: "School Team",
    title: "Leadership and staff",
    body: "Meet the school leadership and published staff records.",
    icon: Users,
  },
  programmes: {
    eyebrow: "Academic Programmes",
    title: "Programmes",
    body: "Browse programmes connected to this school.",
    icon: GraduationCap,
  },
  publications: {
    eyebrow: "Publications",
    title: "Publications",
    body: "Research and publication records connected to this school.",
    icon: FileText,
  },
  news: {
    eyebrow: "News",
    title: "School news",
    body: "School news and updates.",
    icon: Newspaper,
  },
  downloads: {
    eyebrow: "Downloads",
    title: "Documents and files",
    body: "Access official school documents.",
    icon: Download,
  },
  clubs: {
    eyebrow: "Clubs and Societies",
    title: "Student clubs",
    body: "Student clubs associated with this school.",
    icon: Sparkles,
  },
  contact: {
    eyebrow: "Contact Information",
    title: "Get in touch",
    body: "School contact details and location information.",
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

  if (!parts.length) return "S";

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
      .join(" ") || "Staff record"
  );
}

function compactMeta(values: Array<string | number | null | undefined>) {
  return values
    .map((value) => present(value))
    .filter(Boolean)
    .join(" · ");
}

function navHas(navItems: EntityHeaderNavItem[] | undefined, label: string) {
  return Boolean(navItems?.some((item) => item.label === label));
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
      section: "programmes",
    },
    { label: "Team", href: `${baseHref}/team`, icon: Users, section: "team" },
  ];

  if (counts.publications > 0 || navHas(navItems, "Publications")) {
    links.push({
      label: "Publications",
      href: `${baseHref}/publications`,
      icon: FileText,
      section: "publications",
    });
  }

  links.push(
    { label: "News", href: `${baseHref}/news`, icon: Newspaper, section: "news" },
    {
      label: "Downloads",
      href: `${baseHref}/downloads`,
      icon: Download,
      section: "downloads",
    },
  );

  if (counts.clubs > 0 || navHas(navItems, "Clubs")) {
    links.push({
      label: "Clubs & Societies",
      href: `${baseHref}/clubs`,
      icon: Sparkles,
      section: "clubs",
    });
  }

  links.push({
    label: "Contact",
    href: `${baseHref}/contact`,
    icon: Phone,
    section: "contact",
  });

  return links;
}

function SectionKicker({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
      {children}
    </p>
  );
}

function QuickLinksPanel({
  links,
  activeSection,
}: {
  links: QuickLink[];
  activeSection: SchoolDetailSectionKey;
}) {
  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
      <SectionKicker>Quick Links</SectionKicker>
      <nav aria-label="School quick links" className="mt-3">
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
  activeSection: SchoolDetailSectionKey;
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

function ContactPanel({ data }: { data: SchoolDetailOverviewData }) {
  const { school } = data;
  const rows = [
    { label: "Office", value: present(school.office_location) ?? present(school.address), icon: MapPin },
    { label: "Phone", value: present(school.phone), icon: Phone },
    { label: "Email", value: present(school.email), icon: Mail },
    { label: "Website", value: present(school.website), icon: Globe },
  ].filter((item) => item.value);

  if (!rows.length) return null;

  return (
    <section className="min-w-0 overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
      <SectionKicker>Contact Information</SectionKicker>
      <div className="mt-3 grid min-w-0 gap-1.5">
        {rows.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="flex w-full min-w-0 gap-3 rounded-xl p-2">
              <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-slate-950">
                  {item.label}
                </span>
                <span className="mt-0.5 block break-words text-sm font-medium leading-5 text-primary [overflow-wrap:anywhere]">
                  {item.value}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SchoolInfoPanel({ data }: { data: SchoolDetailOverviewData }) {
  const { school, counts } = data;
  const rows = [
    { label: "School Code", value: present(school.code), icon: FileText },
    { label: "Programmes", value: counts.programmes || null, icon: GraduationCap },
    { label: "Team Records", value: counts.staff || null, icon: Users },
    { label: "Last Updated", value: formatDate(school.updated_at), icon: CalendarDays },
  ].filter((item) => present(item.value));

  if (!rows.length) return null;

  return (
    <section className="rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm">
      <SectionKicker>School Information</SectionKicker>
      <dl className="mt-3 grid gap-2">
        {rows.map((item) => {
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
  imageId,
}: {
  name: string;
  imageId?: string | null;
}) {
  if (imageId) {
    return (
      <img
        src={publicFileUrl(imageId) ?? undefined}
        alt={name}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <span className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#dbeafe,#eef4ff_56%,#fff7ed)] font-[family-name:var(--font-display)] text-2xl font-semibold text-primary">
      {initialsFromName(name)}
    </span>
  );
}

function TeamSection({ data }: { data: SchoolDetailOverviewData }) {
  const assignments = data.staffAssignments;
  const deanName = present(data.dean?.name) ?? present(data.school.dean_name);
  const deanTitle = present(data.dean?.title) ?? "Dean";
  const deanEmail = present(data.school.dean_email);
  const staff = data.staff;

  if (!deanName && !assignments.length && !staff.length) return null;

  return (
    <>
      {deanName ? (
        <article className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
          <SectionKicker>Leadership</SectionKicker>
          <div className="mt-4 flex gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1.1rem] bg-slate-100">
              <Avatar name={deanName} imageId={null} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-950">{deanName}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {deanTitle}
              </p>
              {deanEmail ? (
                <p className="mt-2 text-sm font-semibold text-primary">
                  <a href={`mailto:${deanEmail}`}>{deanEmail}</a>
                </p>
              ) : null}
            </div>
          </div>
        </article>
      ) : null}

      <Organogram
        assignments={assignments}
        title="School Organogram"
        description="Team structure is grouped by the public hierarchy level. Where reporting lines are published, each card shows the assignment it reports to."
      />

      {staff.length ? (
        <section className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <SectionKicker>Staff Directory</SectionKicker>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Staff profiles connected to this school.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-xl bg-primary/[0.08] px-3 py-2 text-xs font-bold text-primary">
              {data.counts.staff} record{data.counts.staff === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
            {staff.map((person) => {
              const name = personDisplayName(person);
              const role =
                present(person.institutional_role) ??
                present(person.academic_rank) ??
                "Staff member";

              return (
                <article
                  key={person.id}
                  className="rounded-[1.1rem] border border-slate-200 bg-white p-3"
                >
                  <div className="flex gap-3">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <Avatar name={name} imageId={person.photo_id} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-slate-950">
                        {name}
                      </h3>
                      <p className="mt-1 text-xs font-semibold text-slate-600">
                        {role}
                      </p>
                      {present(person.email) ? (
                        <p className="mt-1 truncate text-xs font-semibold text-primary">
                          <a href={`mailto:${person.email}`}>{person.email}</a>
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}
    </>
  );
}

function ProgrammesSection({ data }: { data: SchoolDetailOverviewData }) {
  const departmentName = new Map(
    data.departments.map((department) => [department.id, department.name]),
  );

  if (!data.programmes.length) return null;

  return (
    <section className="grid gap-3 md:grid-cols-2">
      {data.programmes.map((programme) => {
        const meta = compactMeta([
          programme.level,
          programme.mode_of_study,
          programme.duration,
        ]);
        const department = present(departmentName.get(programme.department_id));

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
                {department ? (
                  <p className="mt-2 text-xs font-semibold text-primary">
                    {department}
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

function PublicationsSection({ data }: { data: SchoolDetailOverviewData }) {
  const publicationHolders = data.staff.filter(
    (person) => Number(person.publications_count ?? 0) > 0,
  );

  if (!publicationHolders.length) return null;

  return (
    <section className="grid gap-3 md:grid-cols-2">
      {publicationHolders.map((person) => {
        const name = personDisplayName(person);

        return (
          <article
            key={person.id}
            className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm"
          >
            <SectionKicker>Publication Records</SectionKicker>
            <h2 className="mt-2 text-base font-bold text-slate-950">{name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {Number(person.publications_count ?? 0)} publication record
              {Number(person.publications_count ?? 0) === 1 ? "" : "s"} linked
              to this staff profile.
            </p>
          </article>
        );
      })}
    </section>
  );
}

function NewsSection({ data }: { data: SchoolDetailOverviewData }) {
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

function DownloadsSection({ data }: { data: SchoolDetailOverviewData }) {
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

function ClubsSection({ data }: { data: SchoolDetailOverviewData }) {
  if (!data.clubs.length) return null;

  return (
    <section className="grid gap-3 md:grid-cols-2">
      {data.clubs.map((club) => (
        <article
          key={club.id}
          className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm"
        >
          {present(club.club_type) ? (
            <SectionKicker>{club.club_type}</SectionKicker>
          ) : null}
          <h2 className="mt-2 text-base font-bold text-slate-950">{club.name}</h2>
          {present(club.about ?? club.objectives ?? club.mission) ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
              {club.about ?? club.objectives ?? club.mission}
            </p>
          ) : null}
          {club.membership_count ? (
            <p className="mt-3 text-xs font-semibold text-primary">
              {club.membership_count} member
              {club.membership_count === 1 ? "" : "s"}
            </p>
          ) : null}
        </article>
      ))}
    </section>
  );
}

function ContactSection({ data }: { data: SchoolDetailOverviewData }) {
  const { school } = data;
  const rows = [
    { label: "Office", value: present(school.office_location) ?? present(school.address), icon: MapPin },
    { label: "Email", value: present(school.email), icon: Mail },
    { label: "Phone", value: present(school.phone), icon: Phone },
    { label: "Website", value: present(school.website), icon: Globe },
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

function renderSection(
  section: SchoolDetailSectionKey,
  data: SchoolDetailOverviewData,
) {
  switch (section) {
    case "team":
      return <TeamSection data={data} />;
    case "programmes":
      return <ProgrammesSection data={data} />;
    case "publications":
      return <PublicationsSection data={data} />;
    case "news":
      return <NewsSection data={data} />;
    case "downloads":
      return <DownloadsSection data={data} />;
    case "clubs":
      return <ClubsSection data={data} />;
    case "contact":
      return <ContactSection data={data} />;
  }
}

export function SchoolDetailSection({
  data,
  section,
  header,
  navItems,
}: {
  data: SchoolDetailOverviewData;
  section: SchoolDetailSectionKey;
  header?: ReactNode;
  navItems?: EntityHeaderNavItem[];
}) {
  const baseHref = `/academics/schools/${data.school.slug}`;
  const quickLinks = buildQuickLinks({
    baseHref,
    navItems,
    counts: data.counts,
  });
  const meta = sectionMeta[section];

  return (
    <PageShell header={header}>
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_70%)] px-4 py-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="grid w-full gap-3 xl:grid-cols-[minmax(220px,0.22fr)_minmax(0,1fr)_minmax(240px,0.24fr)] 2xl:grid-cols-[minmax(240px,0.2fr)_minmax(0,1fr)_minmax(280px,0.22fr)] xl:items-start">
            <aside className="hidden min-w-0 space-y-3 xl:block xl:sticky xl:top-28">
              <QuickLinksPanel links={quickLinks} activeSection={section} />
            </aside>

            <main className="grid min-w-0 gap-3">
              <PageIntro meta={meta} />
              <MobileQuickGrid links={quickLinks} activeSection={section} />
              {renderSection(section, data)}
            </main>

            <aside className="hidden min-w-0 space-y-3 xl:block xl:sticky xl:top-28">
              <ContactPanel data={data} />
              <SchoolInfoPanel data={data} />
            </aside>

            <aside className="grid gap-3 xl:hidden">
              <ContactPanel data={data} />
              <SchoolInfoPanel data={data} />
            </aside>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
