import { notFound } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import {
  ArrowLeft,
  Award,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  Download,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
  School,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { ExpandableRichText } from "@/components/public/expandable-rich-text";
import { PublicImage } from "@/components/public/public-image";
import {
  PublicPersonTabs,
  type PublicPersonTab,
} from "@/components/public/public-person-tabs";
import { ScrollReveal } from "@ksu/ui/components";
import { AboutPageLenis } from "@/components/ui/about-page-lenis";
import {
  getPublicPersonProfile,
  type PublicPersonAssignment,
  type PublicPersonGenericRecord,
  type PublicPersonProfile,
  type PublicPersonPublication,
  type PublicPersonResearchGrant,
} from "@/lib/public-person-data";
import { publicFileUrl, resolvePublicMediaUrl } from "@/lib/public-media";

type ProfileLink = { label: string; href: string | null };
type ProfileRecord = {
  title: string;
  meta: string[];
  description?: string | null;
  href?: string | null;
};
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
      .join(" ") || "Staff profile"
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
    present(item.citation) ??
    "Profile record"
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
  email,
  links,
  cvUrl,
}: {
  email?: string | null;
  links: ProfileLink[];
  cvUrl?: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {cvUrl ? (
        <a
          href={cvUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90"
        >
          <Download aria-hidden className="h-4 w-4" />
          Download CV
        </a>
      ) : null}
      {email ? (
        <a
          href={`mailto:${email}`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-primary/20 bg-white px-4 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
        >
          <Mail aria-hidden className="h-4 w-4" />
          Email
        </a>
      ) : null}
      {links.slice(0, 3).map((item) => (
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
  assignment,
  schoolName,
  departmentName,
  links,
  facts,
  cvUrl,
}: {
  person: PublicPersonProfile;
  name: string;
  role: string;
  assignment?: PublicPersonAssignment | null;
  schoolName?: string | null;
  departmentName?: string | null;
  links: ProfileLink[];
  facts: ProfileFact[];
  cvUrl?: string | null;
}) {
  return (
    <section
      className={[
        "rounded-lg border border-slate-200 bg-white p-4 shadow-sm",
        facts.length ? "" : "lg:max-w-4xl",
      ].join(" ")}
    >
      <div
        className={[
          "grid gap-4",
          facts.length
            ? "lg:grid-cols-[160px_minmax(0,1fr)_300px]"
            : "lg:grid-cols-[160px_minmax(0,1fr)]",
        ].join(" ")}
      >
        <div className="max-w-[180px]">
          <div className="aspect-[4/5] overflow-hidden rounded-lg bg-slate-100">
            <ProfileImage person={person} name={name} />
          </div>
        </div>
        <div className="min-w-0 self-center py-1">
          <span className="inline-flex rounded bg-primary px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-white">
            {assignment?.entity?.entity_type === "school"
              ? "Leadership"
              : person.is_researcher
                ? "Researcher Profile"
                : "Staff Profile"}
          </span>
          <h1 className="mt-3 max-w-4xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-[2.15rem]">
            {name}
          </h1>
          <p className="mt-2 text-base font-semibold leading-6 text-primary">
            {role}
          </p>
          {schoolName || departmentName ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {[departmentName, schoolName].filter(Boolean).join(" | ")}
            </p>
          ) : null}
          <div className="mt-4">
            <ProfileActionRail
              email={person.email}
              links={links}
              cvUrl={cvUrl}
            />
          </div>
        </div>
        {facts.length ? (
          <aside className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <h2 className="text-sm font-bold text-slate-950">At a Glance</h2>
            <div className="mt-3">
              <ProfileFactGrid facts={facts} />
            </div>
          </aside>
        ) : null}
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

function RoleRelationshipGrid({
  assignments,
}: {
  assignments: PublicPersonAssignment[];
}) {
  if (!assignments.length) return null;

  return (
    <ContentBlock title="Current Roles">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {assignments.map((item) => (
          <article
            key={item.id}
            className="rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-sm font-bold capitalize text-slate-950">
              {roleLabel(item) ?? "Staff role"}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              {present(item.entity?.name) ??
                present(item.entity_type) ??
                "Unit"}
            </p>
          </article>
        ))}
      </div>
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
  return (
    present(item.title) ||
    present(item.citation) ||
    present(item.doi) ||
    "Publication record"
  );
}

function grantTitle(item: PublicPersonResearchGrant) {
  return present(item.title) || "Research grant";
}

function ResearchRecordCard({
  title,
  meta,
  icon: Icon,
  description,
  href,
}: {
  title: string;
  meta: string[];
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  description?: string | null;
  href?: string | null;
}) {
  const card = (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="flex gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
          <Icon aria-hidden className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold leading-6 text-slate-950">
            {title}
          </h3>
          {meta.length ? (
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              {meta.join(" | ")}
            </p>
          ) : null}
          {description ? (
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );

  if (!href) return card;

  return (
    <a href={href} target="_blank" rel="noreferrer" className="block">
      {card}
    </a>
  );
}

function RecordGrid({
  records,
  icon,
}: {
  records: ProfileRecord[];
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {records.map((record, index) => (
        <ResearchRecordCard
          key={`${record.title}-${index}`}
          title={record.title}
          meta={record.meta}
          description={record.description}
          href={record.href}
          icon={icon}
        />
      ))}
    </div>
  );
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
  const role =
    roleLabel(assignment) ||
    present(person.institutional_role?.replace(/_/g, " ")) ||
    present(person.academic_rank?.replace(/_/g, " ")) ||
    present(person.specialization) ||
    "Kisii University staff";
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
  const publicationRecords: ProfileRecord[] = articlePublications.map(
    (item) => ({
      title: publicationTitle(item),
      meta: [
        present(item.venue),
        present(normalizedYear(item.year)),
        present(item.source),
        present(item.doi),
      ].filter(Boolean) as string[],
      description: present(item.citation),
      href: externalHref(item.url),
    }),
  );
  const bookPublicationRecords: ProfileRecord[] = bookPublications.map(
    (item) => ({
      title: publicationTitle(item),
      meta: [
        present(item.venue),
        present(normalizedYear(item.year)),
        present(item.source),
        present(item.doi),
      ].filter(Boolean) as string[],
      description: present(item.citation),
      href: externalHref(item.url),
    }),
  );
  const grantRecords: ProfileRecord[] = grants.map((item) => ({
    title: grantTitle(item),
    meta: [
      present(item.funder),
      present(item.role),
      present(item.amount),
      present(normalizedYear(item.year)),
      present(item.status),
      present(item.source),
    ].filter(Boolean) as string[],
  }));
  const genericRecords = (
    items: PublicPersonGenericRecord[],
  ): ProfileRecord[] =>
    items.map((item) => ({
      title: genericRecordTitle(item),
      meta: genericRecordMeta(item),
      description: genericRecordDescription(item),
      href: externalHref(item.url),
    }));
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
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
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
              <div className="grid content-start gap-3">
                <RoleRelationshipGrid assignments={person.assignments ?? []} />
              </div>
            </div>
          ),
        }
      : null,
    researchInterests.length
      ? {
          id: "research-interests",
          label: "Research Interests",
          content: <PillList items={researchInterests} />,
        }
      : null,
    publicationRecords.length ||
    person.publications_count ||
    person.h_index ||
    publicationLinks.length
      ? {
          id: "publications",
          label: "Publications",
          content: (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
              {publicationRecords.length ? (
                <RecordGrid records={publicationRecords} icon={BookOpenCheck} />
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                  Publication records are summarized from this profile.
                </p>
              )}
              {person.publications_count ||
              person.h_index ||
              publicationLinks.length ? (
                <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  {person.publications_count || person.h_index ? (
                    <>
                      <h2 className="text-sm font-bold text-slate-950">
                        Publication Metrics
                      </h2>
                      <dl className="mt-4 grid gap-3 text-sm">
                        {person.publications_count ? (
                          <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3">
                            <dt className="font-semibold text-slate-700">
                              Publications
                            </dt>
                            <dd className="font-bold text-slate-950">
                              {person.publications_count}
                            </dd>
                          </div>
                        ) : null}
                        {person.h_index ? (
                          <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3">
                            <dt className="font-semibold text-slate-700">
                              H-index
                            </dt>
                            <dd className="font-bold text-slate-950">
                              {person.h_index}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </>
                  ) : null}
                  {publicationLinks.length ? (
                    <div
                      className={
                        person.publications_count || person.h_index
                          ? "mt-5 border-t border-slate-200 pt-4"
                          : ""
                      }
                    >
                      <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                        Research Profiles
                      </h3>
                      <div className="mt-3">
                        <ExternalProfileLinks links={publicationLinks} />
                      </div>
                    </div>
                  ) : null}
                </aside>
              ) : null}
            </div>
          ),
        }
      : null,
    innovations.length
      ? {
          id: "innovations",
          label: "Innovations",
          content: (
            <RecordGrid records={genericRecords(innovations)} icon={Sparkles} />
          ),
        }
      : null,
    grantRecords.length
      ? {
          id: "grants-funding",
          label: "Grants/Funding",
          content: <RecordGrid records={grantRecords} icon={Sparkles} />,
        }
      : null,
    bookPublicationRecords.length
      ? {
          id: "book-publications",
          label: "Book Publications",
          content: (
            <RecordGrid records={bookPublicationRecords} icon={BookOpenCheck} />
          ),
        }
      : null,
    awards.length
      ? {
          id: "awards-recognitions",
          label: "Awards / Recognitions",
          content: <RecordGrid records={genericRecords(awards)} icon={Award} />,
        }
      : null,
    outreach.length
      ? {
          id: "community-outreach",
          label: "Community Outreach",
          content: (
            <RecordGrid records={genericRecords(outreach)} icon={Users} />
          ),
        }
      : null,
    referees.length
      ? {
          id: "referees",
          label: "Referees",
          content: (
            <RecordGrid records={genericRecords(referees)} icon={Users} />
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
                items={[
                  { label: "Home", href: "/" },
                  { label: name },
                ]}
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
                assignment={assignment}
                schoolName={schoolName}
                departmentName={departmentName}
                links={links}
                facts={facts}
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
