import type { Metadata } from "next";
import Link from "next/link";
import type { Person, ResearchGenericRecord } from "@ksu/api-client";
import { personsApi, researchServiceApi } from "@ksu/api-client";
import { ScrollReveal, ScrollRevealGroup } from "@ksu/ui/components";
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
  type AboutCollection,
} from "./about-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About Research",
  description:
    "REIRM mandate, research support, governance, staff, and engagement pathways.",
};

const pathwayCards = [
  {
    title: "Meet the Team",
    body: "Staff and leadership profiles.",
    href: "/team",
    action: "View team",
    icon: Users,
  },
  {
    title: "Find Expertise",
    body: "Research areas and specialists.",
    href: "/expertise",
    action: "Search expertise",
    icon: FlaskConical,
  },
  {
    title: "Research Services",
    body: "Grants, ethics, facilities, and support.",
    href: "/services",
    action: "Open services",
    icon: ClipboardList,
  },
  {
    title: "Guidelines & Resources",
    body: "Policies, templates, and forms.",
    href: "/guidelines",
    action: "Open guidelines",
    icon: BookOpen,
  },
  {
    title: "Start an Inquiry",
    body: "Contact the REIRM office.",
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
      <AboutHero metrics={metrics} />

      {errors.length > 0 ? (
        <section className="px-4 pt-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
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
        title="Mandate"
        body="To coordinate and promote research, extension, innovation and resource mobilization that address societal needs, strengthen capacity and enhance the university's contribution to national development."
        tone="white"
      >
        <ScrollReveal
          className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]"
          variant="fade-up"
        >
          <section className="rounded-lg border border-slate-200 bg-slate-50 p-6 shadow-sm">
            <div className="grid gap-5 sm:grid-cols-[96px_minmax(0,1fr)] sm:items-center">
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                <ShieldCheck aria-hidden className="h-9 w-9" />
              </span>
              <p className="text-sm leading-7 text-slate-700 sm:text-base">
                To coordinate and promote research, extension, innovation and
                resource mobilization that address societal needs, strengthen
                capacity and enhance the university&apos;s contribution to
                national development.
              </p>
            </div>
          </section>
          <section className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-6 shadow-sm">
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
        </ScrollReveal>
      </ResearchSection>

      <ResearchSection
        eyebrow="What REIRM Supports"
        title="What REIRM Supports"
        body="Research support, extension, innovation, and resource mobilization."
      >
        <ScrollRevealGroup
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          duration={650}
          staggerDelay={90}
        >
          {supportAreas.map((area) => (
            <SupportAreaCard key={area.title} area={area} />
          ))}
        </ScrollRevealGroup>
      </ResearchSection>

      <ResearchSection
        eyebrow="Governance"
        title="Governance"
        body="University governance, research controls, accountability, and research integrity."
        tone="white"
      >
        <ScrollReveal
          className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-white shadow-sm"
          variant="fade-up"
        >
          <section
            id="governance"
            className="grid gap-0 lg:grid-cols-[minmax(320px,520px)_minmax(0,1fr)]"
          >
            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-white">
                  <CheckCircle2 aria-hidden className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                    Governance
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-white/78">
                    REIRM operates under university governance and research
                    controls to ensure transparency, accountability, and
                    research integrity.
                  </p>
                  <Link
                    href="/guidelines"
                    className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-md border border-white/30 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    View governance structure
                    <ArrowRight aria-hidden className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            <div
              aria-hidden
              className="min-h-[180px] border-t border-white/10 bg-[url(/images/research/research-demo-imagegen.webp)] bg-cover bg-center opacity-80 lg:min-h-[260px] lg:border-l lg:border-t-0"
            />
          </section>
        </ScrollReveal>
      </ResearchSection>

      <ResearchSection
        eyebrow="People Behind the Work"
        title="People Behind the Work"
        body="Research staff and leadership profiles."
      >
        <ScrollReveal
          as="div"
          className="grid gap-5 lg:grid-cols-[380px_minmax(0,1fr)]"
          variant="fade-up"
        >
          <div id="staff">
            <LeadPanel lead={lead} staffCount={staff.data.length} />
          </div>
          <ScrollRevealGroup
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            duration={600}
            staggerDelay={80}
          >
            {staff.data.slice(0, 6).map((person) => (
              <StaffCard key={person.id} person={person} />
            ))}
            {staff.data.length === 0 ? (
              <StatusMessage>
                Research staff records are not published yet.
              </StatusMessage>
            ) : null}
          </ScrollRevealGroup>
        </ScrollReveal>
      </ResearchSection>

      <ResearchSection
        eyebrow="Research Support Pathways"
        title="Research Support Pathways"
        body="Team, expertise, services, guidelines, and inquiry routes."
        tone="white"
      >
        <ScrollRevealGroup
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
          duration={600}
          staggerDelay={80}
        >
          {pathwayCards.map((card) => (
            <PathwayCard key={card.title} card={card} />
          ))}
        </ScrollRevealGroup>
      </ResearchSection>
    </main>
  );
}

function AboutHero({
  metrics,
}: {
  metrics: ReturnType<typeof buildAboutMetricTiles>;
}) {
  return (
    <section className="border-b border-slate-200 bg-white px-4 py-8 text-slate-950 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px]">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,680px)] lg:items-stretch">
          <ScrollReveal duration={700} variant="fade-up">
            <nav
              className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500"
              aria-label="Breadcrumb"
            >
              <Link href="/" className="transition hover:text-primary">
                Home
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900">About</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900">REIRM</span>
            </nav>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
              About REIRM
            </p>
            <h1 className="mt-3 max-w-4xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-primary sm:text-5xl">
              The public structure behind Kisii University research support
            </h1>
            <p className="mt-4 max-w-3xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">
              The Directorate of Research, Extension, Innovation and Resource
              Mobilization (REIRM) coordinates, supports and promotes research,
              innovation and partnerships that address real-world challenges and
              advance societal impact.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryLink href="/connect#research">Start an Inquiry</PrimaryLink>
              <Link
                href="/donate"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary/30 bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
              >
                <HeartHandshake aria-hidden className="h-4 w-4" />
                Support Research
              </Link>
            </div>
          </ScrollReveal>
          <ScrollReveal
            className="min-h-[260px] overflow-hidden rounded-lg border border-slate-200 bg-[url(/images/research/research-demo-imagegen.webp)] bg-cover bg-center shadow-sm sm:min-h-[300px] lg:min-h-[340px]"
            delay={100}
            variant="fade-left"
          >
            <span className="sr-only">
              Kisii University research collaboration and demonstration
            </span>
          </ScrollReveal>
        </div>

        <ScrollRevealGroup
          as="dl"
          className="mt-6 grid overflow-hidden rounded-lg bg-primary text-white shadow-sm sm:grid-cols-2 xl:grid-cols-4"
          duration={520}
          staggerDelay={70}
        >
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="border-white/20 p-4 sm:border-r last:border-r-0"
            >
              <dt className="text-[11px] font-semibold uppercase text-white/70">
                {metric.label}
              </dt>
              <dd className="mt-1 text-2xl font-semibold text-white">
                {metric.value.toLocaleString("en-KE")}
                {metric.suffix ?? ""}
              </dd>
            </div>
          ))}
        </ScrollRevealGroup>
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
    <Link
      href={area.href}
      className="group flex min-h-[190px] gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-100 text-primary">
        <Icon aria-hidden className="h-6 w-6" />
      </span>
      <span className="min-w-0">
        <span className="block text-lg font-semibold text-slate-950">
          {area.title}
        </span>
        <span className="mt-2 block text-sm leading-6 text-slate-600">
          {area.body}
        </span>
        <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          Learn more
          <ArrowRight
            aria-hidden
            className="h-4 w-4 transition group-hover:translate-x-1"
          />
        </span>
      </span>
    </Link>
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
        <Badge>
          {formatLabel(person.academic_rank ?? person.title ?? "researcher")}
        </Badge>
        {person.is_featured ? <Badge>Featured</Badge> : null}
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-6 text-slate-950">
        {personName(person)}
      </h3>
      {compactText(person.institutional_role) ||
      compactText(person.department_name) ? (
        <p className="mt-2 text-sm font-semibold text-primary">
          {compactText(person.institutional_role) ||
            compactText(person.department_name)}
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
      className="group flex min-h-[150px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">
        {card.title}
      </h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{card.body}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary">
        {card.action}
        <ArrowRight
          aria-hidden
          className="h-4 w-4 transition group-hover:translate-x-1"
        />
      </span>
    </Link>
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
