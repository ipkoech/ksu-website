import type { Metadata } from "next";
import Link from "next/link";
import type { PublicTeamResponse, ResearchGenericRecord } from "@ksu/api-client";
import { publicTeamApi, researchServiceApi } from "@ksu/api-client";
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
  Target,
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
  buildTeamMembers,
  getLeadTeamMember,
  type AboutCollection,
  type AboutTeamMember,
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

  const teamMembers = buildTeamMembers(staff.data);
  const lead = getLeadTeamMember(teamMembers);
  const metrics = buildAboutMetricTiles({
    staffCount: staff.data?.counts?.persons ?? teamMembers.length,
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

      <LayeredAboutSections
        supportAreas={supportAreas}
        coverage={{
          centers: centers.total,
          programs: programs.total,
          guidelines: guidelines.total,
          partners: partners.total,
        }}
      />

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
            <LeadPanel
              lead={lead}
              staffCount={staff.data?.counts?.persons ?? teamMembers.length}
              groupCount={staff.data?.groups?.length ?? 0}
              leadershipCount={staff.data?.counts?.leadership ?? 0}
            />
          </div>
          <ScrollRevealGroup
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
            duration={600}
            staggerDelay={80}
          >
            {teamMembers.slice(0, 6).map((person) => (
              <StaffCard key={person.assignmentId} person={person} />
            ))}
            {teamMembers.length === 0 ? (
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

function LayeredAboutSections({
  supportAreas,
  coverage,
}: {
  supportAreas: ReturnType<typeof buildSupportAreaCards>;
  coverage: {
    centers: number;
    programs: number;
    guidelines: number;
    partners: number;
  };
}) {
  const panels = [
    {
      key: "mandate",
      eyebrow: "Mandate",
      title: "Coordinate. Promote. Mobilize.",
      body: "REIRM coordinates research, extension, innovation and resource mobilization for societal needs, research capacity and national development.",
    },
    {
      key: "support",
      eyebrow: "Supports",
      title: "Research support areas",
      body: "Proposal support, extension pathways, innovation development and partnership mobilization.",
    },
    {
      key: "governance",
      eyebrow: "Governance",
      title: "Research controls and accountability",
      body: "University governance, approval controls, transparency and research integrity.",
    },
  ];

  return (
    <section className="border-y border-slate-200 bg-slate-50 px-4 py-8 sm:px-6 lg:px-8 lg:py-10 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ScrollReveal
          className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24 lg:self-start"
          variant="fade-up"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            About REIRM
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold leading-tight text-slate-950">
            Structure, services and controls
          </h2>
          <div className="mt-5 grid gap-2">
            {panels.map((panel, index) => (
              <a
                key={panel.key}
                href={`#about-${panel.key}`}
                className="group flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs text-primary shadow-sm">
                  {index + 1}
                </span>
                {panel.eyebrow}
              </a>
            ))}
          </div>
        </ScrollReveal>

        <div className="relative grid gap-4 lg:block lg:min-h-[980px]">
          <ScrollReveal
            className="top-24 z-[1] lg:sticky"
            variant="fade-up"
          >
            <div id="about-mandate">
              <MandateStackCard coverage={coverage} />
            </div>
          </ScrollReveal>

          <ScrollReveal
            className="top-28 z-[2] lg:sticky lg:mt-7"
            variant="fade-up"
          >
            <section
              id="about-support"
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-950/5 sm:p-6"
            >
              <SectionKicker icon={Target} label="What REIRM supports" />
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {supportAreas.map((area) => (
                  <SupportAreaCard key={area.title} area={area} />
                ))}
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal
            className="top-32 z-[3] lg:sticky lg:mt-7"
            variant="fade-up"
          >
            <section
              id="about-governance"
              className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-white shadow-lg shadow-slate-950/10"
            >
              <div className="grid gap-0 lg:grid-cols-[minmax(320px,520px)_minmax(0,1fr)]">
                <div className="p-5 sm:p-6">
                  <SectionKicker icon={CheckCircle2} label="Governance" inverted />
                  <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-white">
                    Research controls and accountability
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
                <div
                  aria-hidden
                  className="min-h-[180px] border-t border-white/10 bg-[url(/images/research/research-demo-imagegen.webp)] bg-cover bg-center opacity-80 lg:min-h-[260px] lg:border-l lg:border-t-0"
                />
              </div>
            </section>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function MandateStackCard({
  coverage,
}: {
  coverage: {
    centers: number;
    programs: number;
    guidelines: number;
    partners: number;
  };
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-primary/20 bg-white shadow-lg shadow-slate-950/5">
      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="bg-primary p-5 text-white sm:p-6">
          <SectionKicker icon={ShieldCheck} label="Mandate" inverted />
          <h3 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white">
            Coordinate research, extension, innovation and resource mobilization.
          </h3>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/82 sm:text-base">
            The mandate is direct: address societal needs, strengthen research
            capacity and increase Kisii University&apos;s contribution to
            national development.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {["Coordinate", "Promote", "Mobilize"].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="grid gap-3 bg-white p-5 sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            Backend coverage
          </p>
          <dl className="grid grid-cols-2 gap-3">
            <MiniFact label="Centers" value={coverage.centers} />
            <MiniFact label="Programs" value={coverage.programs} />
            <MiniFact label="Guidelines" value={coverage.guidelines} />
            <MiniFact label="Partners" value={coverage.partners} />
          </dl>
        </div>
      </div>
    </section>
  );
}

function SectionKicker({
  icon: Icon,
  label,
  inverted = false,
}: {
  icon: LucideIcon;
  label: string;
  inverted?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={
          inverted
            ? "flex h-10 w-10 items-center justify-center rounded-md bg-white/12 text-secondary"
            : "flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"
        }
      >
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <p
        className={
          inverted
            ? "text-xs font-semibold uppercase tracking-[0.22em] text-white/70"
            : "text-xs font-semibold uppercase tracking-[0.22em] text-secondary"
        }
      >
        {label}
      </p>
    </div>
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
  groupCount,
  leadershipCount,
}: {
  lead: AboutTeamMember | null;
  staffCount: number;
  groupCount: number;
  leadershipCount: number;
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
        {lead ? teamMemberName(lead) : "Research staff directory"}
      </h3>
      {lead ? (
        <>
          <p className="mt-2 text-sm font-semibold text-primary">
            {lead.assignmentTitle}
          </p>
          {personSummary(lead) ? (
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {personSummary(lead)}
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge>{lead.groupLabel}</Badge>
            <Badge>Level {lead.hierarchyLevel}</Badge>
          </div>
        </>
      ) : (
        <StatusMessage>Research staff records are not published yet.</StatusMessage>
      )}
      <dl className="mt-5 grid grid-cols-3 gap-2 rounded-md bg-slate-50 p-3">
        <MiniTeamFact label="Profiles" value={staffCount} />
        <MiniTeamFact label="Groups" value={groupCount} />
        <MiniTeamFact label="Leads" value={leadershipCount} />
      </dl>
      <div className="mt-5 flex flex-wrap gap-3">
        <PrimaryLink href="/team">Open team</PrimaryLink>
      </div>
    </section>
  );
}

function StaffCard({ person }: { person: AboutTeamMember }) {
  const interests = Array.isArray(person.research_interests)
    ? person.research_interests.slice(0, 2)
    : [];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{person.groupLabel}</Badge>
        <Badge>Level {person.hierarchyLevel}</Badge>
        {person.isActing ? <Badge>Acting</Badge> : null}
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-6 text-slate-950">
        {teamMemberName(person)}
      </h3>
      <p className="mt-2 text-sm font-semibold text-primary">
        {person.assignmentTitle}
      </p>
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

function MiniTeamFact({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-semibold text-slate-950">
        {value.toLocaleString("en-KE")}
      </dd>
    </div>
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
  const directorateId = process.env.NEXT_PUBLIC_RESEARCH_DIRECTORATE_ID;
  try {
    if (directorateId) {
      const response = await publicTeamApi.get({
        entity_type: "directorate",
        entity_id: directorateId,
      });
      return { data: response.data ?? null, error: null as string | null };
    }
  } catch {
    // Fall back to the university hierarchy when the configured directorate is unavailable.
  }

  try {
    const response = await publicTeamApi.get({ entity_type: "university" });
    return { data: response.data ?? null, error: null as string | null };
  } catch {
    return {
      data: null as PublicTeamResponse | null,
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

function teamMemberName(person: AboutTeamMember) {
  return compactText(person.full_name) || "Research staff";
}

function personSummary(person: AboutTeamMember) {
  return (
    compactText(person.specialization)
  );
}

function staffHref(person: AboutTeamMember) {
  const base = publicFrontendUrl.replace(/\/$/, "");
  return `${base || ""}/staff/${person.slug || person.id}`;
}

function uniqueErrors(...items: Array<string | null | undefined>) {
  return Array.from(new Set(items.filter(Boolean) as string[]));
}
