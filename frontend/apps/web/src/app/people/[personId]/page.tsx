import { notFound } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  School,
} from "lucide-react";
import Link from "next/link";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { ExpandableRichText } from "@/components/public/expandable-rich-text";
import { PublicImage } from "@/components/public/public-image";
import {
  PublicPersonTabs,
  type PublicPersonTab,
} from "@/components/public/public-person-tabs";
import {
  FundingRecordList,
  InnovationRecordGrid,
  PublicationRecordBrowser,
  RefereeRecordGrid,
  TimelineRecordList,
  type PublicProfileRecord,
} from "@/components/public/public-profile-record-sections";
import { ScrollReveal } from "@ksu/ui/components";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import {
  getPublicPersonProfile,
  type PublicPersonAssignment,
  type PublicPersonGenericRecord,
  type PublicPersonProfile,
  type PublicPersonPublication,
} from "@/lib/public-person-data";
import { publicFileUrl, resolvePublicMediaUrl } from "@/lib/public-media";

type ProfileLink = { label: string; href: string | null };
type ProfileRecord = PublicProfileRecord;
type ProfileFact = {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: string;
};

function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function displayName(person: PublicPersonProfile) {
  const title = present(person.title);
  const fullName = present(person.full_name);
  if (fullName) {
    return title && !fullName.toLowerCase().startsWith(title.toLowerCase())
      ? `${title} ${fullName}`
      : fullName;
  }

  return (
    [person.title, person.first_name, person.middle_name, person.last_name]
      .map((value) => present(value))
      .filter(Boolean)
      .join(" ") || null
  );
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
  return selected
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function photoUrl(person: PublicPersonProfile) {
  return (
    resolvePublicMediaUrl(person.photo_url) ??
    publicFileUrl(person.photo_id) ??
    null
  );
}

function externalHref(value?: string | null) {
  const text = present(value);
  if (!text) return null;
  return /^https?:\/\//i.test(text) ? text : `https://${text}`;
}

function googleScholarHref(person: PublicPersonProfile) {
  return (
    externalHref(person.google_scholar_url) ||
    (present(person.google_scholar_id)
      ? `https://scholar.google.com/citations?user=${encodeURIComponent(
          present(person.google_scholar_id)!,
        )}`
      : null)
  );
}

function orcidHref(value?: string | null) {
  const text = present(value);
  if (!text) return null;
  if (/^https?:\/\//i.test(text)) return text;
  return `https://orcid.org/${text}`;
}

function scopusHref(value?: string | null) {
  const text = present(value);
  if (!text) return null;
  if (/^https?:\/\//i.test(text)) return text;
  return `https://www.scopus.com/authid/detail.uri?authorId=${encodeURIComponent(text)}`;
}

function cvHref(person: PublicPersonProfile) {
  return (
    resolvePublicMediaUrl(person.cv_file_url) ??
    publicFileUrl(person.cv_file_id) ??
    null
  );
}

function listValues(value?: string[] | null) {
  return (value ?? []).map((item) => present(item)).filter(Boolean) as string[];
}

function recordList<T>(value?: T[] | null) {
  return (value ?? []).filter(Boolean);
}

function genericRecordTitle(item: PublicPersonGenericRecord) {
  return (
    present(item.title) ??
    present(item.name) ??
    present(item.award) ??
    present(item.recognition) ??
    present(item.referee) ??
    present(item.citation)
  );
}

function genericRecordDescription(item: PublicPersonGenericRecord) {
  return present(item.description) ?? present(item.summary);
}

function genericRecordMeta(item: PublicPersonGenericRecord) {
  return [
    present(item.category),
    present(item.type),
    present(item.role),
    present(item.venue),
    present(item.organization),
    present(item.institution),
    present(item.funder),
    present(normalizedYear(item.year ?? item.date)),
    present(item.contact),
    present(item.source),
  ].filter(Boolean) as string[];
}

function splitPublicationRecords(publications: PublicPersonPublication[]) {
  const isBook = (item: PublicPersonPublication) => {
    const text = [item.source, item.venue, item.title, item.citation]
      .map((value) => present(value))
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return /\b(book|chapter|monograph)\b/.test(text);
  };

  return {
    books: publications.filter(isBook),
    articles: publications.filter((item) => !isBook(item)),
  };
}

function qualificationText(item: Record<string, unknown>) {
  return [item.degree, item.field, item.institution, normalizedYear(item.year)]
    .map((value) => present(value as string | number | null))
    .filter(Boolean)
    .join(", ");
}

function normalizedYear(value: unknown) {
  if (value === 0 || value === "0") return null;
  return value as string | number | null;
}

function roleLabel(assignment?: PublicPersonAssignment | null) {
  return (
    present(assignment?.title) ||
    present(assignment?.role_display) ||
    present(assignment?.role_label) ||
    present(assignment?.role?.replace(/_/g, " "))
  );
}

function primaryAssignment(person: PublicPersonProfile) {
  return (
    person.assignments?.find((assignment) => assignment.is_primary) ??
    person.assignments?.[0] ??
    null
  );
}

function teamHref(assignment?: PublicPersonAssignment | null) {
  const entity = assignment?.entity;
  const slug = present(entity?.slug);
  if (!entity || !slug) return "/search?type=persons";

  if (entity.entity_type === "school") return `/academics/schools/${slug}/team`;
  if (entity.entity_type === "department") {
    return entity.kind === "academic"
      ? `/academics/departments/${slug}/team`
      : `/administration/units/${slug}/team`;
  }
  if (entity.entity_type === "division" || entity.entity_type === "wing") {
    return "/administration";
  }

  return "/search?type=persons";
}

function backLabel(assignment?: PublicPersonAssignment | null) {
  if (assignment?.entity?.entity_type === "school")
    return "Back to School Team";
  if (assignment?.entity?.entity_type === "department")
    return "Back to Department Team";
  return "Back to people search";
}

function formatOfficeHours(value: PublicPersonProfile["office_hours"]) {
  if (!value) return null;
  if (typeof value === "string") return value;
  return Object.entries(value)
    .map(([day, hours]) => `${day}: ${String(hours)}`)
    .join("\n");
}

function ProfileImage({
  person,
  name,
}: {
  person: PublicPersonProfile;
  name: string;
}) {
  const source = photoUrl(person);

  if (source) {
    return (
      <PublicImage
        src={source}
        alt={name}
        ratio="profile"
        sizes="(min-width: 1024px) 220px, 180px"
        className="h-full w-full"
      />
    );
  }

  return (
    <span className="flex h-full w-full items-center justify-center bg-primary/[0.08] font-[family-name:var(--font-display)] text-5xl font-semibold text-primary">
      {initialsFromName(name)}
    </span>
  );
}

function PillList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-primary/[0.08] px-3 py-1.5 text-xs font-semibold text-primary"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function ProfileActionRail({
  links,
  cvUrl,
}: {
  links: ProfileLink[];
  cvUrl?: string | null;
}) {
  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      {cvUrl ? (
        <a
          href={cvUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-12 items-center justify-center gap-3 rounded-lg bg-primary px-6 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90"
        >
          <Download aria-hidden className="h-5 w-5" />
          Download CV
        </a>
      ) : null}
      {links.slice(0, cvUrl ? 2 : 3).map((item) => (
        <a
          key={item.label}
          href={item.href ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-primary/30 hover:text-primary"
        >
          <ExternalLink aria-hidden className="h-4 w-4" />
          {item.label}
        </a>
      ))}
    </div>
  );
}

function ContactRow({
  email,
  phone,
  office,
}: {
  email?: string | null;
  phone?: string | null;
  office?: string | null;
}) {
  const items = [
    email
      ? {
          key: "email",
          icon: Mail,
          label: email,
          href: `mailto:${email}`,
        }
      : null,
    phone
      ? {
          key: "phone",
          icon: Phone,
          label: phone,
          href: `tel:${phone.replace(/\s+/g, "")}`,
        }
      : null,
    office
      ? {
          key: "office",
          icon: Building2,
          label: `Office: ${office}`,
          href: null,
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    icon: ProfileFact["icon"];
    label: string;
    href: string | null;
  }>;

  if (!items.length) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
      {items.map((item) => {
        const Icon = item.icon;
        const content = (
          <>
            <Icon aria-hidden className="h-4 w-4 text-primary" />
            <span>{item.label}</span>
          </>
        );
        return item.href ? (
          <a
            key={item.key}
            href={item.href}
            className="inline-flex items-center gap-2 transition hover:text-primary"
          >
            {content}
          </a>
        ) : (
          <span key={item.key} className="inline-flex items-center gap-2">
            {content}
          </span>
        );
      })}
    </div>
  );
}

function ProfileFactGrid({ facts }: { facts: ProfileFact[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
      {facts.map((fact) => {
        const Icon = fact.icon;
        return (
          <div
            key={fact.label}
            className="flex min-w-0 gap-3 rounded-lg border border-slate-200 bg-white p-3"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
              <Icon aria-hidden className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-slate-500">
                {fact.label}
              </span>
              <span className="mt-0.5 block break-words text-sm font-semibold leading-5 text-slate-800">
                {fact.value}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ProfileHero({
  person,
  name,
  role,
  schoolName,
  departmentName,
  links,
  cvUrl,
}: {
  person: PublicPersonProfile;
  name: string;
  role?: string | null;
  schoolName?: string | null;
  departmentName?: string | null;
  links: ProfileLink[];
  cvUrl?: string | null;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)_260px] lg:items-center">
        <div className="max-w-[180px]">
          <div className="aspect-[4/5] overflow-hidden rounded-xl bg-slate-100">
            <ProfileImage person={person} name={name} />
          </div>
        </div>
        <div className="min-w-0 self-center py-1">
          <h1 className="max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-[2.4rem]">
            {name}
          </h1>
          {role ? (
            <p className="mt-2 text-lg font-bold leading-6 text-amber-600">
              {role}
            </p>
          ) : null}
          {schoolName || departmentName ? (
            <p className="mt-1 max-w-3xl text-base font-semibold leading-6 text-slate-700">
              {departmentName}
              {departmentName && schoolName ? (
                <span className="mx-2 text-slate-300">|</span>
              ) : null}
              {schoolName ? (
                <span className="text-primary">{schoolName}</span>
              ) : null}
            </p>
          ) : null}
          <ContactRow
            email={person.email}
            phone={person.phone ?? person.office_phone}
            office={person.office_location}
          />
        </div>
        <div className="flex lg:justify-end">
          <ProfileActionRail links={links} cvUrl={cvUrl} />
        </div>
      </div>
    </section>
  );
}

function ContentBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PanelCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {children}
    </section>
  );
}

function SidebarCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      <div className="mt-4">{children}</div>
    </aside>
  );
}

function ProfileMetricsCard({
  publicationsCount,
  hIndex,
}: {
  publicationsCount?: number | null;
  hIndex?: number | null;
}) {
  if (!publicationsCount && !hIndex) return null;

  return (
    <SidebarCard title="Profile Metrics">
      <dl className="grid grid-cols-2 gap-3 text-center">
        {publicationsCount ? (
          <div className="rounded-lg bg-primary/[0.06] p-3">
            <dt className="text-xs font-semibold text-slate-600">
              Publications
            </dt>
            <dd className="mt-1 text-2xl font-bold text-slate-950">
              {publicationsCount}
            </dd>
          </div>
        ) : null}
        {hIndex ? (
          <div className="rounded-lg bg-amber-50 p-3">
            <dt className="text-xs font-semibold text-slate-600">h-index</dt>
            <dd className="mt-1 text-2xl font-bold text-slate-950">{hIndex}</dd>
          </div>
        ) : null}
      </dl>
    </SidebarCard>
  );
}

function ProfileSidebar({
  facts,
  links,
  publicationsCount,
  hIndex,
}: {
  facts: ProfileFact[];
  links: ProfileLink[];
  publicationsCount?: number | null;
  hIndex?: number | null;
}) {
  const hasMetrics = Boolean(publicationsCount || hIndex);
  const hasLinks = links.length > 0;
  const hasFacts = facts.length > 0;

  if (!hasMetrics && !hasLinks && !hasFacts) return null;

  return (
    <div className="grid content-start gap-4">
      <ProfileMetricsCard
        publicationsCount={publicationsCount}
        hIndex={hIndex}
      />
      {hasLinks ? (
        <SidebarCard title="Research Links">
          <ExternalProfileLinks links={links} />
        </SidebarCard>
      ) : null}
      {hasFacts ? (
        <SidebarCard title="Contact Details">
          <ProfileFactGrid facts={facts} />
        </SidebarCard>
      ) : null}
    </div>
  );
}

function QualificationTimeline({ items }: { items: string[] }) {
  return (
    <ContentBlock title="Academics">
      <ol className="grid gap-3 lg:grid-cols-3">
        {items.map((item, index) => (
          <li
            key={item}
            className="relative rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              {index + 1}
            </span>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-800">
              {item}
            </p>
          </li>
        ))}
      </ol>
    </ContentBlock>
  );
}

function ExternalProfileLinks({ links }: { links: ProfileLink[] }) {
  if (!links.length) return null;

  return (
    <div className="grid gap-2">
      {links.map((item) => (
        <a
          key={item.label}
          href={item.href ?? undefined}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-10 items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-primary/30 hover:text-primary"
        >
          <span className="truncate">{item.label}</span>
          <ExternalLink aria-hidden className="h-4 w-4 shrink-0" />
        </a>
      ))}
    </div>
  );
}

function publicationTitle(item: PublicPersonPublication) {
  return present(item.title) || present(item.citation) || present(item.doi);
}

function grantTitle(item: {
  title?: string | null;
  funder?: string | null;
  role?: string | null;
}) {
  return present(item.title) || present(item.funder) || present(item.role);
}

export default async function PublicPersonPage({
  params,
}: {
  params: Promise<{ personId: string }>;
}) {
  const { personId } = await params;
  const person = await getPublicPersonProfile(personId);

  if (!person) notFound();

  const assignment = primaryAssignment(person);
  const name = displayName(person);
  if (!name) notFound();
  const role =
    roleLabel(assignment) ||
    present(person.institutional_role?.replace(/_/g, " ")) ||
    present(person.academic_rank?.replace(/_/g, " ")) ||
    present(person.specialization);
  const bio = present(person.full_bio) || present(person.bio);
  const schoolName =
    assignment?.entity?.entity_type === "school"
      ? present(assignment.entity.name)
      : present(person.school_name);
  const departmentName =
    assignment?.entity?.entity_type === "department"
      ? present(assignment.entity.name)
      : present(person.department_name);
  const researchInterests = listValues(person.research_interests);
  const teachingAreas = listValues(person.teaching_areas);
  const courses = listValues(person.courses_taught);
  const qualifications = (person.qualifications ?? [])
    .map(qualificationText)
    .filter(Boolean);
  const links = [
    { label: "Website", href: externalHref(person.website_url) },
    { label: "Google Scholar", href: googleScholarHref(person) },
    { label: "ORCID", href: orcidHref(person.orcid) },
    { label: "LinkedIn", href: externalHref(person.linkedin_url) },
    { label: "ResearchGate", href: externalHref(person.researchgate_url) },
    { label: "Scopus", href: scopusHref(person.scopus_id) },
  ].filter((item) => item.href);
  const publicationLinks = links.filter((item) =>
    ["Google Scholar", "ORCID", "ResearchGate", "Scopus"].includes(item.label),
  );
  const cvUrl = cvHref(person);
  const publications = recordList(person.publications);
  const { articles: articlePublications, books: detectedBookPublications } =
    splitPublicationRecords(publications);
  const bookPublications = [
    ...recordList(person.book_publications),
    ...detectedBookPublications,
  ];
  const grants = recordList(person.research_grants_won);
  const innovations = recordList(person.innovations);
  const awards = recordList(
    person.awards_honors as PublicPersonGenericRecord[] | null | undefined,
  );
  const outreach = recordList(person.community_outreach);
  const referees = recordList(person.referees);
  const publicationRecords: ProfileRecord[] = articlePublications.flatMap(
    (item) => {
      const title = publicationTitle(item);
      if (!title) return [];
      return {
        title,
        category: present(item.source) || "Publication",
        meta: [
          present(item.venue),
          present(normalizedYear(item.year)),
          present(item.source),
          present(item.doi),
        ].filter(Boolean) as string[],
        description: present(item.citation),
        href: externalHref(item.url),
      };
    },
  );
  const bookPublicationRecords: ProfileRecord[] = bookPublications.flatMap(
    (item) => {
      const title = publicationTitle(item);
      if (!title) return [];
      return {
        title,
        category: present(item.source) || "Book publication",
        meta: [
          present(item.venue),
          present(normalizedYear(item.year)),
          present(item.source),
          present(item.doi),
        ].filter(Boolean) as string[],
        description: present(item.citation),
        href: externalHref(item.url),
      };
    },
  );
  const grantRecords: ProfileRecord[] = grants.flatMap((item) => {
    const title = grantTitle(item);
    if (!title) return [];
    return {
      title,
      category: present(item.status) || present(item.source) || "Grant/Funding",
      meta: [
        present(item.funder),
        present(item.role),
        present(item.amount),
        present(normalizedYear(item.year)),
        present(item.status),
        present(item.source),
      ].filter(Boolean) as string[],
    };
  });
  const genericRecords = (
    items: PublicPersonGenericRecord[],
    fallbackCategory: string,
  ): ProfileRecord[] =>
    items.flatMap((item) => {
      const title = genericRecordTitle(item);
      if (!title) return [];
      return {
        title,
        category:
          present(item.category) ||
          present(item.type) ||
          present(item.source) ||
          fallbackCategory,
        meta: genericRecordMeta(item),
        description: genericRecordDescription(item),
        href: externalHref(item.url),
      };
    });
  const innovationRecords = genericRecords(innovations, "Innovation");
  const awardRecords = genericRecords(awards, "Award");
  const outreachRecords = genericRecords(outreach, "Community Outreach");
  const refereeRecords = genericRecords(referees, "Referee");
  const rawFacts: Array<{
    icon: ProfileFact["icon"];
    label: string;
    value?: string | null;
  }> = [
    { icon: School, label: "School", value: schoolName },
    { icon: Building2, label: "Department", value: departmentName },
    { icon: MapPin, label: "Office", value: person.office_location },
    { icon: Phone, label: "Phone", value: person.phone ?? person.office_phone },
    {
      icon: BriefcaseBusiness,
      label: "Office hours",
      value: formatOfficeHours(person.office_hours),
    },
  ];
  const facts: ProfileFact[] = rawFacts.flatMap((fact) => {
    const value = present(fact.value);
    return value ? [{ icon: fact.icon, label: fact.label, value }] : [];
  });
  const hasBioContent =
    Boolean(bio) ||
    qualifications.length > 0 ||
    teachingAreas.length > 0 ||
    courses.length > 0 ||
    Boolean(person.assignments?.length);

  const tabs: PublicPersonTab[] = [
    hasBioContent
      ? {
          id: "bio",
          label: "Bio",
          content: (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <PanelCard>
                <div className="grid gap-5">
                  {bio ? (
                    <ContentBlock title="Biography">
                      <ExpandableRichText text={bio} collapsedLines={8} />
                    </ContentBlock>
                  ) : null}
                  {qualifications.length ? (
                    <QualificationTimeline items={qualifications} />
                  ) : null}
                  {teachingAreas.length || courses.length ? (
                    <ContentBlock title="Teaching">
                      <div className="grid gap-4 lg:grid-cols-2">
                        {teachingAreas.length ? (
                          <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                              Teaching Areas
                            </p>
                            <PillList items={teachingAreas} />
                          </div>
                        ) : null}
                        {courses.length ? (
                          <div>
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                              Courses
                            </p>
                            <PillList items={courses} />
                          </div>
                        ) : null}
                      </div>
                    </ContentBlock>
                  ) : null}
                </div>
              </PanelCard>
              <div className="grid content-start gap-4">
                <ProfileSidebar
                  facts={facts}
                  links={publicationLinks}
                  publicationsCount={person.publications_count}
                  hIndex={person.h_index}
                />
              </div>
            </div>
          ),
        }
      : null,
    researchInterests.length
      ? {
          id: "research-interests",
          label: "Research Interests",
          content: (
            <PanelCard>
              <ContentBlock title="Research Interests">
                <PillList items={researchInterests} />
              </ContentBlock>
            </PanelCard>
          ),
        }
      : null,
    publicationRecords.length
      ? {
          id: "publications",
          label: "Publications",
          content: (
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <PanelCard>
                <PublicationRecordBrowser
                  title="Publications"
                  records={publicationRecords}
                  itemLabel="publications"
                  noMatchText="No publications match the selected filters."
                />
              </PanelCard>
              <ProfileSidebar
                facts={facts}
                links={publicationLinks}
                publicationsCount={person.publications_count}
                hIndex={person.h_index}
              />
            </div>
          ),
        }
      : null,
    innovationRecords.length
      ? {
          id: "innovations",
          label: "Innovations",
          content: (
            <PanelCard>
              <InnovationRecordGrid records={innovationRecords} />
            </PanelCard>
          ),
        }
      : null,
    grantRecords.length
      ? {
          id: "grants-funding",
          label: "Grants/Funding",
          content: (
            <PanelCard>
              <FundingRecordList records={grantRecords} />
            </PanelCard>
          ),
        }
      : null,
    bookPublicationRecords.length
      ? {
          id: "book-publications",
          label: "Book Publications",
          content: (
            <PanelCard>
              <PublicationRecordBrowser
                title="Book Publications"
                records={bookPublicationRecords}
                itemLabel="book publications"
                noMatchText="No book publications match the selected filters."
              />
            </PanelCard>
          ),
        }
      : null,
    awardRecords.length
      ? {
          id: "awards-recognitions",
          label: "Awards / Recognitions",
          content: (
            <PanelCard>
              <TimelineRecordList records={awardRecords} />
            </PanelCard>
          ),
        }
      : null,
    outreachRecords.length
      ? {
          id: "community-outreach",
          label: "Community Outreach",
          content: (
            <PanelCard>
              <TimelineRecordList records={outreachRecords} tone="activity" />
            </PanelCard>
          ),
        }
      : null,
    refereeRecords.length
      ? {
          id: "referees",
          label: "Referees",
          content: (
            <PanelCard>
              <RefereeRecordGrid records={refereeRecords} />
            </PanelCard>
          ),
        }
      : null,
  ].filter(Boolean) as PublicPersonTab[];

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_70%)] px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="w-full max-w-none">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <BreadcrumbTrail
                items={[{ label: "Home", href: "/" }, { label: name }]}
              />
              <Link
                href={teamHref(assignment)}
                className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-primary"
              >
                <ArrowLeft aria-hidden className="h-4 w-4" />
                {backLabel(assignment)}
              </Link>
            </div>

            <main className="mt-4 grid gap-4">
              <ProfileHero
                person={person}
                name={name}
                role={role}
                schoolName={schoolName}
                departmentName={departmentName}
                links={links}
                cvUrl={cvUrl}
              />

              <ScrollReveal>
                <PublicPersonTabs tabs={tabs} />
              </ScrollReveal>
            </main>
          </div>
        </section>
      </AboutPageLenis>
    </PageShell>
  );
}
