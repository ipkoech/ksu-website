import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  School,
  UserRound,
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
  type PublicPersonProfile,
} from "@/lib/public-person-data";
import { publicFileUrl, resolvePublicMediaUrl } from "@/lib/public-media";

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

function listValues(value?: string[] | null) {
  return (value ?? []).map((item) => present(item)).filter(Boolean) as string[];
}

function qualificationText(item: Record<string, unknown>) {
  return [item.degree, item.field, item.institution, item.year]
    .map((value) => present(value as string | number | null))
    .filter(Boolean)
    .join(", ");
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
        sizes="240px"
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

function ContentBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function PillList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function RoleCard({
  assignment,
}: {
  assignment?: PublicPersonAssignment | null;
}) {
  if (!assignment) return null;

  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
        Current appointment
      </p>
      <p className="mt-2 text-sm font-bold text-slate-950">
        {roleLabel(assignment) ?? "Staff role"}
      </p>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        {present(assignment.entity?.name) ??
          present(assignment.entity_type) ??
          "Kisii University"}
      </p>
    </article>
  );
}

function CompactFact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value?: string | null;
}) {
  const text = present(value);
  if (!text) return null;

  return (
    <div className="flex min-w-0 gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary">
        <Icon aria-hidden className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[0.68rem] font-bold uppercase tracking-[0.08em] text-slate-500">
          {label}
        </span>
        <span className="mt-0.5 block break-words text-sm font-semibold leading-5 text-slate-800">
          {text}
        </span>
      </span>
    </div>
  );
}

function ExternalProfileLinks({
  links,
  compact = false,
}: {
  links: Array<{ label: string; href: string | null }>;
  compact?: boolean;
}) {
  if (!links.length) return null;

  return (
    <div className="grid gap-2">
      {links.map((item) => (
        <a
          key={item.label}
          href={item.href ?? undefined}
          target="_blank"
          rel="noreferrer"
          className={[
            "inline-flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-primary/30 hover:text-primary",
            compact ? "min-h-9 px-3" : "min-h-10 px-3",
          ].join(" ")}
        >
          <span className="truncate">{item.label}</span>
          <ExternalLink aria-hidden className="h-4 w-4 shrink-0" />
        </a>
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
    present(person.institutional_role) ||
    present(person.academic_rank) ||
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
  const isResearcher = Boolean(
    person.is_researcher ||
    researchInterests.length ||
    person.google_scholar_url ||
    person.google_scholar_id ||
    person.orcid ||
    person.researchgate_url ||
    person.scopus_id,
  );
  const tabs: PublicPersonTab[] = [
    bio
      ? {
          id: "overview",
          label: "Overview",
          content: (
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <ContentBlock title="Biography">
                <ExpandableRichText text={bio} collapsedLines={8} />
              </ContentBlock>
              <div className="grid content-start gap-3">
                {researchInterests.length ? (
                  <ContentBlock title="Research Focus">
                    <PillList items={researchInterests} />
                  </ContentBlock>
                ) : null}
                <RoleCard assignment={assignment} />
              </div>
            </div>
          ),
        }
      : null,
    qualifications.length
      ? {
          id: "qualifications",
          label: "Qualifications",
          content: (
            <ContentBlock title="Qualifications">
              <ul className="grid gap-2 text-sm leading-6 text-slate-700 lg:grid-cols-2">
                {qualifications.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
                  >
                    <GraduationCap
                      aria-hidden
                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </ContentBlock>
          ),
        }
      : null,
    researchInterests.length
      ? {
          id: "research",
          label: "Research",
          content: (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <ContentBlock title="Research Interests">
                <PillList items={researchInterests} />
              </ContentBlock>
              {person.specialization ? (
                <ContentBlock title="Specialization">
                  <p className="text-sm leading-7 text-slate-700">
                    {person.specialization}
                  </p>
                </ContentBlock>
              ) : null}
            </div>
          ),
        }
      : null,
    teachingAreas.length || courses.length
      ? {
          id: "teaching",
          label: "Teaching",
          content: (
            <ContentBlock title="Teaching Areas">
              <div className="grid gap-4 lg:grid-cols-2">
                {teachingAreas.length ? (
                  <PillList items={teachingAreas} />
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
          ),
        }
      : null,
    isResearcher || person.publications_count || person.h_index
      ? {
          id: "publications",
          label: "Publications",
          content: (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
              <ContentBlock title="Publications Summary">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  {present(person.publications_count) ? (
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <dt className="flex items-center gap-2 font-semibold text-slate-700">
                        <BookOpenCheck
                          aria-hidden
                          className="h-4 w-4 text-primary"
                        />
                        Publications
                      </dt>
                      <dd className="font-bold text-slate-950">
                        {person.publications_count}
                      </dd>
                    </div>
                  ) : null}
                  {present(person.h_index) ? (
                    <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <dt className="flex items-center gap-2 font-semibold text-slate-700">
                        <Award aria-hidden className="h-4 w-4 text-primary" />
                        H-index
                      </dt>
                      <dd className="font-bold text-slate-950">
                        {person.h_index}
                      </dd>
                    </div>
                  ) : null}
                </dl>
                {!present(person.publications_count) &&
                !present(person.h_index) ? (
                  <p className="text-sm leading-7 text-slate-700">
                    Publication metrics are not currently published on this
                    profile.
                  </p>
                ) : null}
              </ContentBlock>
              <ContentBlock title="Research Profiles">
                {publicationLinks.length ? (
                  <ExternalProfileLinks links={publicationLinks} />
                ) : (
                  <p className="text-sm leading-7 text-slate-700">
                    No external research profile links are published for this
                    staff member.
                  </p>
                )}
              </ContentBlock>
            </div>
          ),
        }
      : null,
    person.assignments?.length
      ? {
          id: "activities",
          label: "Activities",
          content: (
            <ContentBlock title="Current Roles">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {person.assignments.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="text-sm font-bold capitalize text-slate-950">
                      {roleLabel(item) ?? "Staff role"}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                      {present(item.entity?.name) ??
                        present(item.entity_type) ??
                        "Unit"}
                    </p>
                  </article>
                ))}
              </div>
            </ContentBlock>
          ),
        }
      : null,
  ].filter(Boolean) as PublicPersonTab[];

  return (
    <PageShell>
      <AboutPageLenis>
        <section className="w-full bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_70%)] px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="w-full">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <BreadcrumbTrail
                items={[
                  { label: "Home", href: "/" },
                  { label: "Staff" },
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
              <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm lg:p-5">
                <div className="grid gap-5 lg:grid-cols-[180px_minmax(0,1fr)_360px] xl:grid-cols-[200px_minmax(0,1fr)_400px]">
                  <div className="max-w-[220px]">
                    <div className="aspect-[4/5] overflow-hidden rounded-lg bg-slate-100">
                      <ProfileImage person={person} name={name} />
                    </div>
                  </div>
                  <div className="min-w-0 self-center py-1">
                    <span className="inline-flex rounded bg-primary px-2 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-white">
                      {assignment?.entity?.entity_type === "school"
                        ? "Leadership"
                        : "Staff Profile"}
                    </span>
                    <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
                      {name}
                    </h1>
                    <p className="mt-2 text-base font-semibold leading-6 text-primary">
                      {role}
                    </p>
                    {schoolName || departmentName ? (
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                        {[departmentName, schoolName]
                          .filter(Boolean)
                          .join(" | ")}
                      </p>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-2">
                      {person.email ? (
                        <a
                          href={`mailto:${person.email}`}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary/90"
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
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-primary/30 hover:text-primary"
                        >
                          <ExternalLink aria-hidden className="h-4 w-4" />
                          {item.label}
                        </a>
                      ))}
                    </div>
                  </div>

                  <aside className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <h2 className="text-sm font-bold text-slate-950">
                      At a Glance
                    </h2>
                    <div className="mt-4 grid gap-4">
                      <CompactFact icon={UsersIcon} label="Role" value={role} />
                      <CompactFact
                        icon={School}
                        label="School"
                        value={schoolName}
                      />
                      <CompactFact
                        icon={Building2}
                        label="Department"
                        value={departmentName}
                      />
                      <CompactFact
                        icon={MapPin}
                        label="Office"
                        value={person.office_location}
                      />
                      <CompactFact
                        icon={Phone}
                        label="Phone"
                        value={person.phone ?? person.office_phone}
                      />
                      {person.office_hours ? (
                        <CompactFact
                          icon={BriefcaseBusiness}
                          label="Office hours"
                          value={
                            typeof person.office_hours === "string"
                              ? person.office_hours
                              : Object.entries(person.office_hours)
                                  .map(
                                    ([day, hours]) =>
                                      `${day}: ${String(hours)}`,
                                  )
                                  .join("\n")
                          }
                        />
                      ) : null}
                    </div>
                    {publicationLinks.length ? (
                      <div className="mt-5 border-t border-slate-200 pt-4">
                        <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                          Research Profiles
                        </h3>
                        <div className="mt-3">
                          <ExternalProfileLinks
                            links={publicationLinks}
                            compact
                          />
                        </div>
                      </div>
                    ) : null}
                  </aside>
                </div>
              </section>

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

const UsersIcon = UserRound;
