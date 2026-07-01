import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Person, ResearchGenericRecord } from "@ksu/api-client";
import { personsApi, researchServiceApi } from "@ksu/api-client";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  FlaskConical,
  Handshake,
  HeartHandshake,
  Lightbulb,
  ShieldCheck,
  Sprout,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  Badge,
  PrimaryLink,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getCenters,
  getGuidelines,
  getPartners,
  getPrograms,
  getServices,
} from "../../lib/research-public-data";
import { publicFrontendUrl } from "../../lib/service-urls";
import {
  buildAboutMetricTiles,
  buildSupportAreaCards,
  getLeadResearchPerson,
  recordSummary,
  recordTitle,
  type AboutCollection,
} from "./about-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About Research",
  description:
    "Research office, REIRM mandate, governance, support services, staff, and engagement pathways.",
};

const pathwayCards = [
  {
    title: "Meet the Team",
    body: "Open published researcher and leadership profiles from the university people service.",
    href: "/team",
    action: "View team",
    icon: Users,
  },
  {
    title: "Find Expertise",
    body: "Search skills, research interests, focus areas, centers, and related project work.",
    href: "/expertise",
    action: "Search expertise",
    icon: FlaskConical,
  },
  {
    title: "Research Support",
    body: "Browse backend-published services, resources, guidelines, and support workflows.",
    href: "/services",
    action: "Open services",
    icon: ClipboardList,
  },
  {
    title: "Start an Inquiry",
    body: "Route research, partnership, community, and media questions to the right pathway.",
    href: "/connect",
    action: "Contact REIRM",
    icon: Handshake,
  },
];

export default async function AboutPage() {
  const [
    staff,
    centers,
    programs,
    services,
    guidelines,
    partners,
    stats,
  ] = await Promise.all([
    getResearchStaff(),
    getCenters(),
    getPrograms(),
    getServices(),
    getGuidelines(),
    getPartners(),
    getResearchStats(),
  ]);

  const lead = getLeadResearchPerson(staff.data);
  const metrics = buildAboutMetricTiles({
    staffCount: staff.data.length,
    centers: toAboutCollection(centers),
    programs: toAboutCollection(programs),
    services: toAboutCollection(services),
    partners: toAboutCollection(partners),
    stats,
  });
  const supportAreas = buildSupportAreaCards({
    services: toAboutCollection(services),
    centers: toAboutCollection(centers),
    programs: toAboutCollection(programs),
    partners: toAboutCollection(partners),
    guidelines: toAboutCollection(guidelines),
  });
  const errors = uniqueErrors(
    staff.error,
    centers.error,
    programs.error,
    services.error,
    guidelines.error,
    partners.error,
  );

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <AboutHero metrics={metrics} lead={lead} />

      {errors.length > 0 ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">
              Some research records are temporarily unavailable. Showing the
              available published information.
            </StatusMessage>
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="Mandate"
        title="Coordinate research, extension, innovation, and resource mobilization"
        body="The About page is now assembled from public research records: services, centers, programmes, guidelines, partners, stats, and researcher profiles."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary text-white">
                <ShieldCheck aria-hidden className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                  A public operating layer for research work
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  REIRM connects university research priorities with published
                  project records, support services, centers, guidelines,
                  partnerships, and public engagement pathways. The page avoids
                  placeholder board members and uses published backend records
                  wherever they exist.
                </p>
              </div>
            </div>
          </section>
          <section className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Backend coverage
            </p>
            <dl className="mt-4 grid gap-3">
              <MiniFact label="Centers" value={centers.total} />
              <MiniFact label="Programs" value={programs.total} />
              <MiniFact label="Guidelines" value={guidelines.total} />
              <MiniFact label="Partners" value={partners.total} />
            </dl>
          </section>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="What REIRM Supports"
        title="Service areas built from published backend records"
        body="Each area highlights one matching record when available and falls back to the relevant listing route when no specific record is published."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {supportAreas.map((area) => (
            <SupportAreaCard key={area.title} area={area} />
          ))}
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Governance"
        title="Research governance without placeholder people"
        body="Until a dedicated public board endpoint is exposed, the page summarizes governance through real services, guidelines, and institutional records already available from the research backend."
        tone="white"
      >
        <div
          id="governance"
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,460px)]"
        >
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-white">
                <CheckCircle2 aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
                  Governance is represented through published controls
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Public guidelines, support services, and reporting pathways
                  create the current governance surface. Board and advisory
                  member records can be added here once the backend exposes a
                  public board collection.
                </p>
              </div>
            </div>
          </section>
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
              Latest controls
            </h3>
            <div className="mt-4 divide-y divide-slate-200">
              {guidelines.data.slice(0, 3).map((guideline) => (
                <RecordRow
                  key={guideline.id}
                  record={guideline}
                  hrefBase="/guidelines"
                  fallbackLabel="Guideline"
                />
              ))}
              {guidelines.data.length === 0 ? (
                <StatusMessage>
                  Research guideline records are not published yet.
                </StatusMessage>
              ) : null}
            </div>
          </section>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="People Behind the Work"
        title="Published staff and leadership profiles"
        body="People records are pulled from the main university people service with research-only filtering."
      >
        <div id="staff" className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          <LeadPanel lead={lead} staffCount={staff.data.length} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {staff.data.slice(0, 6).map((person) => (
              <StaffCard key={person.id} person={person} />
            ))}
            {staff.data.length === 0 ? (
              <StatusMessage>
                Research staff records are not published yet.
              </StatusMessage>
            ) : null}
          </div>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Research Support Pathways"
        title="Move from About into the right task"
        body="These routes connect the institutional overview to backend-backed directories and action pages."
        tone="white"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {pathwayCards.map((card) => (
            <PathwayCard key={card.title} card={card} />
          ))}
        </div>
      </ResearchSection>
    </main>
  );
}

function AboutHero({
  metrics,
  lead,
}: {
  metrics: ReturnType<typeof buildAboutMetricTiles>;
  lead: Person | null;
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-slate-200 px-4 py-14 text-white sm:px-6 sm:py-16 lg:px-8 lg:py-20 xl:px-10 2xl:px-12">
      <div className="absolute inset-0">
        <Image
          src="/images/research/research-about-hero.webp"
          alt="Kisii University research collaboration and institutional support"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-slate-950/48" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.86)_0%,rgba(15,23,42,0.68)_48%,rgba(15,23,42,0.24)_100%)]" />
      </div>
      <div className="relative z-10 mx-auto grid max-w-[1680px] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(340px,460px)] lg:items-end">
        <div>
          <nav
            className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/75"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <span className="text-white/35">/</span>
            <span className="text-white">About</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            About REIRM
          </p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white sm:text-5xl">
            The public structure behind Kisii University research support
          </h1>
          <p className="mt-4 max-w-4xl text-pretty text-sm leading-7 text-white/86 sm:text-base">
            Research, Extension, Innovation and Resource Mobilization is shown
            through backend-backed staff records, service pathways, published
            controls, and partnership routes.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <PrimaryLink href="/team">Meet the Team</PrimaryLink>
            <Link
              href="/expertise"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/35 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/18 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
            >
              Find Expertise
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-white/20 bg-white/12 p-4 shadow-sm backdrop-blur"
              >
                <dt className="text-[11px] font-semibold uppercase text-white/68">
                  {metric.label}
                </dt>
                <dd className="mt-1 text-2xl font-semibold text-white">
                  {metric.value.toLocaleString("en-KE")}
                  {metric.suffix ?? ""}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <section className="rounded-lg border border-white/20 bg-white/12 p-5 shadow-xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
            Research office
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white">
            {lead ? personName(lead) : "REIRM public profile"}
          </h2>
          <p className="mt-2 text-sm font-semibold text-white/78">
            {lead
              ? compactText(lead.institutional_role) ||
                compactText(lead.academic_rank) ||
                compactText(lead.title)
              : "Lead profile not published"}
          </p>
          <p className="mt-3 line-clamp-4 text-sm leading-7 text-white/76">
            {lead
              ? personSummary(lead) ||
                "Published lead profile from the university people service."
              : "Lead profile appears when a research role is published."}
          </p>
          <Link
            href="/team"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white"
          >
            View backend team
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </section>
      </div>
    </section>
  );
}

function SupportAreaCard({
  area,
}: {
  area: ReturnType<typeof buildSupportAreaCards>[number];
}) {
  const Icon = supportIcon(area.title);
  return (
    <article className="flex min-h-[300px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-white">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <div className="mt-4 flex items-start justify-between gap-3">
        <h3 className="text-xl font-semibold text-slate-950">{area.title}</h3>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
          {area.count}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{area.body}</p>
      <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Published example
        </p>
        <Link
          href={area.recordHref}
          className="mt-1 block text-sm font-semibold leading-6 text-primary hover:text-secondary"
        >
          {area.recordTitle}
        </Link>
        {area.recordSummary ? (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
            {area.recordSummary}
          </p>
        ) : null}
      </div>
      <Link
        href={area.href}
        className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary"
      >
        Open pathway
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </article>
  );
}

function LeadPanel({
  lead,
  staffCount,
}: {
  lead: Person | null;
  staffCount: number;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        Featured profile
      </p>
      <div className="mt-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Users aria-hidden className="h-7 w-7" />
      </div>
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        {lead ? personName(lead) : "Research staff directory"}
      </h3>
      {lead ? (
        <>
          <p className="mt-2 text-sm font-semibold text-primary">
            {compactText(lead.institutional_role) ||
              compactText(lead.academic_rank) ||
              compactText(lead.title)}
          </p>
          {personSummary(lead) ? (
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {personSummary(lead)}
            </p>
          ) : null}
        </>
      ) : (
        <StatusMessage>Research staff records are not published yet.</StatusMessage>
      )}
      <dl className="mt-5 rounded-md bg-slate-50 p-3">
        <dt className="text-xs font-semibold uppercase text-slate-500">
          Published profiles
        </dt>
        <dd className="mt-1 text-2xl font-semibold text-slate-950">
          {staffCount}
        </dd>
      </dl>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryLink href="/team">Open team</PrimaryLink>
      </div>
    </section>
  );
}

function StaffCard({ person }: { person: Person }) {
  const interests = Array.isArray(person.research_interests)
    ? person.research_interests.slice(0, 2)
    : [];
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(person.academic_rank ?? person.title ?? "researcher")}</Badge>
        {person.is_featured ? <Badge>Featured</Badge> : null}
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-6 text-slate-950">
        {personName(person)}
      </h3>
      {compactText(person.institutional_role) || compactText(person.department_name) ? (
        <p className="mt-2 text-sm font-semibold text-primary">
          {compactText(person.institutional_role) || compactText(person.department_name)}
        </p>
      ) : null}
      {personSummary(person) ? (
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {personSummary(person)}
        </p>
      ) : null}
      {interests.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {interests.map((interest) => (
            <Badge key={interest}>{interest}</Badge>
          ))}
        </div>
      ) : null}
      {person.slug || person.id ? (
        <a
          href={staffHref(person)}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          View profile
          <ExternalLink aria-hidden className="h-3.5 w-3.5" />
        </a>
      ) : null}
    </article>
  );
}

function PathwayCard({
  card,
}: {
  card: {
    title: string;
    body: string;
    href: string;
    action: string;
    icon: LucideIcon;
  };
}) {
  const Icon = card.icon;
  return (
    <Link
      href={card.href}
      className="group flex min-h-[230px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{card.title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{card.body}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-primary">
        {card.action}
        <ArrowRight
          aria-hidden
          className="h-4 w-4 transition group-hover:translate-x-1"
        />
      </span>
    </Link>
  );
}

function RecordRow({
  record,
  hrefBase,
  fallbackLabel,
}: {
  record: ResearchGenericRecord;
  hrefBase: string;
  fallbackLabel: string;
}) {
  const href = record.slug ? `${hrefBase}/${record.slug}` : hrefBase;
  return (
    <article className="py-4 first:pt-0 last:pb-0">
      <div className="flex flex-wrap gap-2">
        <Badge>
          {formatLabel(
            compactText(record.guideline_type) ||
              compactText(record.category) ||
              fallbackLabel,
          )}
        </Badge>
      </div>
      <Link
        href={href}
        className="mt-2 block text-sm font-semibold leading-6 text-slate-950 hover:text-primary"
      >
        {recordTitle(record, fallbackLabel)}
      </Link>
      {recordSummary(record) ? (
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
          {recordSummary(record)}
        </p>
      ) : null}
    </article>
  );
}

function MiniFact({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-emerald-100 bg-white px-3 py-2">
      <dt className="text-[11px] font-semibold uppercase text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-slate-950">
        {value.toLocaleString("en-KE")}
      </dd>
    </div>
  );
}

async function getResearchStaff() {
  try {
    const response = await personsApi.list({
      fields:
        "id,slug,full_name,first_name,last_name,title,academic_rank,institutional_role,leadership_message,bio,specialization,research_interests,department_name,email,is_researcher,is_featured",
      is_researcher: true,
      status: "active",
      page: 1,
      per_page: 12,
    });
    return { data: response.data ?? [], error: null as string | null };
  } catch {
    return {
      data: [] as Person[],
      error: "Research staff records are temporarily unavailable.",
    };
  }
}

async function getResearchStats() {
  try {
    const response = await researchServiceApi.stats();
    return response.data ?? null;
  } catch {
    return null;
  }
}

function toAboutCollection(
  collection: AboutCollection<ResearchGenericRecord> & { error?: string | null },
) {
  return {
    data: collection.data,
    total: collection.total,
  };
}

function supportIcon(title: string): LucideIcon {
  if (title === "Extension") return Sprout;
  if (title === "Innovation") return Lightbulb;
  if (title === "Resource Mobilization") return HeartHandshake;
  return BookOpen;
}

function personName(person: Person) {
  return (
    compactText(person.full_name) ||
    [person.first_name, person.last_name].map(compactText).filter(Boolean).join(" ") ||
    "Research staff"
  );
}

function personSummary(person: Person) {
  return (
    compactText(person.leadership_message) ||
    compactText(person.bio) ||
    compactText(person.specialization)
  );
}

function staffHref(person: Person) {
  const base = publicFrontendUrl.replace(/\/$/, "");
  return `${base || ""}/staff/${person.slug || person.id}`;
}

function uniqueErrors(...items: Array<string | null | undefined>) {
  return Array.from(new Set(items.filter(Boolean) as string[]));
}
