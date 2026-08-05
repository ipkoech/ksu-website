import Link from "next/link";
import type { ReactNode } from "react";
import type { EntityHeaderNavItem } from "@ksu/ui/layout/public";
import {
  ArrowRight,
  Download,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Newspaper,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AmbientPageBackground, ScrollReveal } from "@ksu/ui/components";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { EntityTeamSection } from "@/components/public/entity-team-section";
import { EntityInquiryLauncher } from "@/components/public/entity-inquiry-launcher";
import { EntityMediaMosaic } from "@/components/public/entity-media-mosaic";
import {
  ExploreMorePanel,
  MobileSchoolLinksGrid,
  SchoolLinksPanel,
  buildSchoolMediaLinks,
  buildSchoolQuickLinks,
} from "@/components/public/school-detail-navigation";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import type { SchoolDetailOverviewData } from "@/lib/school-detail-data";
import {
  entityMediaTypeBody,
  entityMediaTypeMatches,
  entityMediaTypeTitle,
  type EntityMediaType,
} from "@/lib/entity-media-data";
import { publicFileUrl } from "@/lib/public-media";

export type SchoolDetailSectionKey =
  | "team"
  | "programmes"
  | "publications"
  | "media"
  | "downloads"
  | "clubs"
  | "contact";

type SectionMeta = {
  eyebrow: string;
  title: string;
  body: string;
  icon: LucideIcon;
};

const sectionMeta: Record<SchoolDetailSectionKey, SectionMeta> = {
  team: {
    eyebrow: "Our People",
    title: "School Leadership & Staff",
    body: "Meet the school leaders, department heads, academic staff, and professional team.",
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
  media: {
    eyebrow: "Media",
    title: "School media",
    body: "News, events, blogs, announcements, and gallery records connected to this school.",
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

function SectionKicker({ children }: { children: string }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
      {children}
    </p>
  );
}

function PageIntro({ meta }: { meta: SectionMeta }) {
  const Icon = meta.icon;

  return (
    <section className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_7rem] md:items-center">
        <div>
          <SectionKicker>{meta.eyebrow}</SectionKicker>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
            {meta.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
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
    { label: "Office", value: present(school.office_location), icon: MapPin },
    { label: "Phone", value: present(school.phone), icon: Phone },
    { label: "Email", value: present(school.email), icon: Mail },
  ].filter((item) => item.value);

  if (!rows.length) return null;

  return (
    <section className="min-w-0 overflow-hidden rounded-[1.25rem] border border-border bg-white p-3 shadow-sm">
      <SectionKicker>Contact Information</SectionKicker>
      <div className="mt-3 grid min-w-0 gap-1.5">
        {rows.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="flex w-full min-w-0 gap-3 rounded-xl p-2">
              <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-foreground">
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
  ].filter((item) => present(item.value));

  if (!rows.length) return null;

  return (
    <section className="rounded-[1.25rem] border border-border bg-white p-3 shadow-sm">
      <SectionKicker>School Information</SectionKicker>
      <dl className="mt-3 grid gap-2">
        {rows.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="flex w-full min-w-0 gap-3 rounded-xl p-2">
              <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <dt className="text-xs font-bold text-foreground">{item.label}</dt>
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

function TeamSection({ data }: { data: SchoolDetailOverviewData }) {
  return (
    <EntityTeamSection
      team={data.team}
      emptyTitle="No public school team records are available yet."
    />
  );
}

function ProgrammesSection({ data }: { data: SchoolDetailOverviewData }) {
  const departmentName = new Map(
    data.departments.map((department) => [department.id, department.name]),
  );

  if (!data.programmes.length) return null;

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
            className="group rounded-[1.25rem] border border-border bg-white p-4 shadow-sm transition hover:border-primary/30 hover:bg-primary/[0.03]"
          >
            <div className="flex gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                <GraduationCap aria-hidden className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-foreground group-hover:text-primary">
                  {programme.name}
                </h2>
                {meta ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
                className="h-4 w-4 shrink-0 text-muted-foreground/60 transition group-hover:translate-x-0.5 group-hover:text-primary"
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
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {publicationHolders.map((person) => {
        const name = personDisplayName(person);

        return (
          <article
            key={person.id}
            className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm"
          >
            <SectionKicker>Publication Records</SectionKicker>
            <h2 className="mt-2 text-base font-bold text-foreground">{name}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
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

function MediaSection({
  data,
  mediaType,
}: {
  data: SchoolDetailOverviewData;
  mediaType?: EntityMediaType;
}) {
  const updates = data.updates.filter((item) =>
    entityMediaTypeMatches(item, mediaType),
  );
  const scopedCount = updates.filter((item) => item.recordScope !== "fallback").length;
  const fallbackCount = updates.filter((item) => item.recordScope === "fallback").length;

  return (
    <section className="grid gap-3">
      {fallbackCount > 0 && scopedCount === 0 && mediaType !== "gallery" ? (
        <p className="rounded-[1.25rem] border border-dashed border-border bg-white p-4 text-sm leading-6 text-muted-foreground">
          No records are currently published for this school, so the latest
          university-wide {entityMediaTypeTitle(mediaType).toLowerCase()} are shown.
        </p>
      ) : null}
      {!updates.length ? (
        <p className="rounded-[1.25rem] border border-dashed border-border bg-white p-4 text-sm leading-6 text-muted-foreground">
          No {mediaType ? entityMediaTypeTitle(mediaType).toLowerCase() : "media"} records
          are currently published for this school.
        </p>
      ) : null}
      <EntityMediaMosaic items={updates} />
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
            className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm"
          >
            <div className="flex gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/[0.08] text-primary">
                <FileText aria-hidden className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-base font-bold text-foreground">
                  {document.title}
                </h2>
                {meta ? (
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {data.clubs.map((club) => (
        <article
          key={club.id}
          className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm"
        >
          {present(club.club_type) ? (
            <SectionKicker>{club.club_type}</SectionKicker>
          ) : null}
          <h2 className="mt-2 text-base font-bold text-foreground">{club.name}</h2>
          {present(club.about ?? club.objectives ?? club.mission) ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
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
    { label: "Office", value: present(school.office_location), icon: MapPin },
    { label: "Email", value: present(school.email), icon: Mail },
    { label: "Phone", value: present(school.phone), icon: Phone },
  ].filter((item) => item.value);

  if (!rows.length) return null;

  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {rows.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className="rounded-[1.25rem] border border-border bg-white p-4 shadow-sm"
          >
            <Icon aria-hidden className="h-5 w-5 text-primary" />
            <h2 className="mt-4 text-sm font-bold text-foreground">
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
  mediaType?: EntityMediaType,
) {
  switch (section) {
    case "team":
      return <TeamSection data={data} />;
    case "programmes":
      return <ProgrammesSection data={data} />;
    case "publications":
      return <PublicationsSection data={data} />;
    case "media":
      return <MediaSection data={data} mediaType={mediaType} />;
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
  mediaType,
}: {
  data: SchoolDetailOverviewData;
  section: SchoolDetailSectionKey;
  header?: ReactNode;
  navItems?: EntityHeaderNavItem[];
  mediaType?: EntityMediaType;
}) {
  const baseHref = `/academics/schools/${data.school.slug}`;
  const baseMeta = sectionMeta[section];
  const meta =
    section === "media"
      ? {
        ...baseMeta,
        title: entityMediaTypeTitle(mediaType),
        body: entityMediaTypeBody(mediaType),
      }
      : baseMeta;
  const navigationLinks =
    section === "media"
      ? buildSchoolMediaLinks(baseHref)
      : buildSchoolQuickLinks({ baseHref, navItems, counts: data.counts });
  const activeSection = section === "media" ? (mediaType ?? "media") : section;
  const navTitle = section === "media" ? "Content Items" : "Quick Links";

  return (
    <PageShell header={header}>
      <AboutPageLenis>
        <AmbientPageBackground variant="academic" intensity="soft">
          <section className="w-full px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mb-4">
            <BreadcrumbTrail
              items={[
                { label: "Home", href: "/" },
                { label: "Academics", href: "/academics" },
                { label: "Schools", href: "/academics/schools" },
                {
                  label: data.school.name,
                  href: `/academics/schools/${data.school.slug}`,
                },
                { label: meta.title },
              ]}
            />
          </div>
          <div className="grid w-full gap-4 xl:grid-cols-[minmax(220px,0.2fr)_minmax(0,1fr)_minmax(260px,0.22fr)] 2xl:grid-cols-[minmax(240px,0.18fr)_minmax(0,1fr)_minmax(300px,0.22fr)] xl:items-start">
            <aside className="hidden min-w-0 space-y-4 xl:sticky xl:top-28 xl:block">
              <SchoolLinksPanel
                links={navigationLinks}
                activeSection={activeSection}
                title={navTitle}
                ariaLabel={
                  section === "media"
                    ? "School media content navigation"
                    : "School quick links"
                }
              />
              {section === "media" ? null : <ExploreMorePanel />}
            </aside>

            <ScrollReveal as="main" className="grid min-w-0 gap-4">
              <PageIntro meta={meta} />
              <MobileSchoolLinksGrid
                links={navigationLinks}
                activeSection={activeSection}
              />
              {renderSection(section, data, mediaType)}
            </ScrollReveal>

            <aside className="hidden min-w-0 space-y-4 xl:block xl:sticky xl:top-28">
              <ContactPanel data={data} />
              {section === "team" ? null : <SchoolInfoPanel data={data} />}
            </aside>

            <aside className="grid gap-4 xl:hidden">
              <ContactPanel data={data} />
              {section === "team" ? null : <SchoolInfoPanel data={data} />}
            </aside>
          </div>
          </section>
        </AmbientPageBackground>
      </AboutPageLenis>
      <EntityInquiryLauncher
        target={{
          type: "school",
          slug: data.school.slug,
          name: data.school.name,
        }}
      />
    </PageShell>
  );
}
