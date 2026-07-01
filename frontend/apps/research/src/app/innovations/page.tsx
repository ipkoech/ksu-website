import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CircleHelp,
  FlaskConical,
  Handshake,
  Lightbulb,
  PackageCheck,
  Search,
  ShieldCheck,
  Sprout,
  Trophy,
  UsersRound,
  Wrench,
} from "lucide-react";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ProgramTableControls } from "../programs/program-table-controls";
import { ResearchListPagination } from "../../components/research-list-pagination";
import { Badge, FilledBadge, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getCenters,
  getInnovations,
  getInnovationsFiltered,
  getProjects,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getListPageSize,
  getRecordMonths,
  getRecordSummary,
  getRecordTitle,
  getRecordYears,
} from "../../lib/research-page-model";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Innovations",
  description: "Research innovations, prototypes, software, and technology transfer outputs.",
};

type InnovationSearchParams = {
  q?: string;
  type?: string;
  stage?: string;
  ip?: string;
  commercial?: string;
  center?: string;
  project?: string;
  status?: string;
  active?: string;
  year?: string;
  month?: string;
  sort?: string;
  page?: string;
};

const innovationTypes = ["product", "process", "service", "technology", "software", "patent", "model", "prototype"];
const developmentStages = ["research", "development", "testing", "validation", "production"];
const ipStatuses = ["pending", "filed", "granted", "licensed", "open_source", "trade_secret"];
const commercializationStatuses = ["concept", "prototype", "pilot", "market_ready", "commercialized"];
const innovationStatuses = ["active", "draft", "archived", "discontinued"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { label: "Newest", value: "created_at" },
  { label: "Featured order", value: "display_order" },
  { label: "Recently updated", value: "updated_at" },
  { label: "Technology readiness", value: "trl_level" },
  { label: "Title A-Z", value: "title" },
  { label: "Title Z-A", value: "title_desc" },
];

const pathwayLinks = [
  {
    label: "Intellectual Property",
    href: "/innovations?ip=filed",
    body: "Protect and commercialize university innovations",
    icon: ShieldCheck,
  },
  {
    label: "Startups & incubation",
    href: "/innovations?commercial=pilot",
    body: "Turn innovations into scalable ventures",
    icon: Sprout,
  },
  {
    label: "Industry partners",
    href: "/partners?type=industry",
    body: "Collaborate on applied solutions",
    icon: BriefcaseBusiness,
  },
  {
    label: "Competitions & showcases",
    href: "/innovations?type=prototype",
    body: "Spotlight innovations and win support",
    icon: Trophy,
  },
];

const readSteps = [
  {
    label: "Problem",
    body: "The real-world challenge the innovation is designed to solve.",
    icon: CircleHelp,
  },
  {
    label: "Evidence",
    body: "Research and validation data that demonstrates impact.",
    icon: BadgeCheck,
  },
  {
    label: "Readiness",
    body: "Current stage in the journey from idea to field-ready solution.",
    icon: FlaskConical,
  },
  {
    label: "Next step",
    body: "How you can engage and help move the innovation forward.",
    icon: Handshake,
  },
];

export default async function InnovationsPage({
  searchParams,
}: {
  searchParams?: Promise<InnovationSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const perPage = getListPageSize(12);
  const sort = params.sort || "created_at";
  const sortField = sort === "title_desc" ? "title" : sort;
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [innovations, allInnovations, centers, projects] = await Promise.all([
    getInnovationsFiltered({
      search: params.q,
      innovationType: params.type,
      developmentStage: params.stage,
      ipStatus: params.ip,
      commercializationStatus: params.commercial,
      centerId: params.center,
      projectId: params.project,
      status: params.status,
      year: params.year,
      sort: sortField,
      order,
      page,
      perPage,
      ...activeFlags,
    }),
    getInnovations(),
    getCenters(),
    getProjects(),
  ]);
  const years = getRecordYears(allInnovations.data);
  const months = getRecordMonths(allInnovations.data, params.year);
  const visibleInnovations = filterRecordsByMonth(innovations.data, params.year, params.month);
  const featuredInnovation = visibleInnovations.find((innovation) => innovation.is_featured) ?? visibleInnovations[0];
  const cardInnovations = featuredInnovation
    ? visibleInnovations.filter((innovation) => innovation.id !== featuredInnovation.id)
    : visibleInnovations;
  const totalPages = Math.ceil(
    (params.month ? visibleInnovations.length : innovations.total) / innovations.perPage,
  );
  const projectNames = new Map(projects.data.map((project) => [project.id, project.title ?? project.name ?? project.code ?? ""]));
  const centerNames = new Map(centers.data.map((center) => [center.id, center.name ?? center.title ?? center.code ?? ""]));

  return (
    <main id="research-main" className="min-h-screen bg-white text-slate-950">
      <InnovationHero />

      <section
        id="innovation-portfolio"
        className="bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_44%,#ffffff_100%)] px-4 py-5 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      >
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
          <div className="min-w-0">
            <InnovationFilters
              params={params}
              centers={centers.data}
              projects={projects.data}
              years={years}
              months={months}
            />

            {[innovations.error, centers.error, projects.error]
              .filter(Boolean)
              .map((error) => (
                <div key={error} className="mt-5">
                  <StatusMessage tone="error">{error}</StatusMessage>
                </div>
              ))}

            {featuredInnovation ? (
              <div className="mt-4">
                <FeaturedInnovation
                  innovation={featuredInnovation}
                  projectName={resolveRelatedName(featuredInnovation, "project", projectNames)}
                  centerName={resolveRelatedName(featuredInnovation, "center", centerNames)}
                />
              </div>
            ) : null}

            {visibleInnovations.length > 0 ? (
              <>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">
                    All innovations
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {visibleInnovations.length} shown
                  </p>
                </div>
                {cardInnovations.length > 0 ? (
                  <div className="mt-3 grid gap-4 lg:grid-cols-2">
                    {cardInnovations.map((innovation) => (
                      <InnovationStoryCard
                        key={innovation.id}
                        innovation={innovation}
                        projectName={resolveRelatedName(innovation, "project", projectNames)}
                        centerName={resolveRelatedName(innovation, "center", centerNames)}
                      />
                    ))}
                  </div>
                ) : null}
                <ResearchListPagination
                  page={page}
                  totalPages={totalPages}
                  total={params.month ? visibleInnovations.length : innovations.total}
                  perPage={innovations.perPage}
                  path="/innovations"
                  params={params}
                  className="mt-6"
                />
              </>
            ) : (
              <div className="mt-6">
                <StatusMessage>No published innovations match the current filters.</StatusMessage>
              </div>
            )}
          </div>

          <InnovationAside />
        </div>
      </section>
    </main>
  );
}

function InnovationHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#061A36] px-4 py-6 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(110deg,#061A36_0%,#05274d_44%,#06543f_100%)]" />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:48px_48px] opacity-50" />
      <InnovationHeroArt />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[#061A36]/92 via-[#061A36]/64 to-[#061A36]/8" />
      <div className="relative mx-auto flex min-h-[210px] max-w-[1680px] items-center py-2">
        <div className="max-w-2xl">
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-none text-white sm:text-5xl">
            Innovation Portfolio
          </h1>
          <p className="mt-3 max-w-xl text-pretty text-base leading-7 text-white/92">
            Moving university research from ideas to field-ready solutions that improve lives, protect the environment, and grow economies.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <HeroButton href="#innovation-portfolio" primary>
              Explore innovations
            </HeroButton>
            <HeroButton href="/partners">
              <Handshake aria-hidden className="h-4 w-4" />
              Partner with us
            </HeroButton>
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroButton({
  href,
  primary = false,
  children,
}: {
  href: string;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
          : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/45 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
      }
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

function InnovationHeroArt() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1100 300"
      className="absolute right-0 top-1/2 hidden h-full w-[72%] -translate-y-1/2 opacity-90 lg:block"
      fill="none"
    >
      <g stroke="#FDE68A" strokeOpacity="0.42" strokeWidth="1.4">
        <circle cx="95" cy="137" r="72" />
        <path d="M95 198V82M95 152c-31-8-51-30-59-67 38 2 62 22 59 67Zm0-10c30-14 49-39 57-75-39 5-62 29-57 75Z" />
        <path d="M420 74h110M500 74v58M474 132h54v64h-54zM446 196h110M386 108l-44 32v62h96v-62l-52-32Zm-20 94v-42h40v42M368 160h35" />
        <path d="M620 86v130M586 216h68M608 86h24M604 116h32M686 124v92M668 216h68M680 124h62M690 154h44" />
        <rect x="760" y="54" width="118" height="170" rx="10" />
        <path d="M785 88h58M785 118h68M785 148h50M785 178h62M842 206l16 16 34-44" />
        <circle cx="966" cy="120" r="74" />
        <path d="M916 122c32-34 60-34 90 0 23-22 45-18 67 13M924 146l52 36 57-52M932 104l38 30M1008 133l40-32" />
      </g>
      <g stroke="#10B981" strokeOpacity="0.34">
        <path d="M250 140h92M295 92v48M342 140l52-52M394 88h96M530 132h58M736 134h42M878 138h66M1038 120h56" />
        {[250, 295, 342, 394, 490, 530, 588, 736, 878, 944, 1038, 1094].map((x, index) => (
          <circle key={x} cx={x} cy={index % 2 ? 92 : 140} r="7" fill="#061A36" stroke="#FDE68A" />
        ))}
      </g>
    </svg>
  );
}

function InnovationFilters({
  params,
  centers,
  projects,
  years,
  months,
}: {
  params: InnovationSearchParams;
  centers: ResearchGenericRecord[];
  projects: ResearchGenericRecord[];
  years: string[];
  months: Array<{ value: string; label: string }>;
}) {
  return (
    <ProgramTableControls
      action="/innovations"
      resetHref="/innovations"
      searchValue={params.q}
      searchPlaceholder="Search innovations by title, keyword, technology, or problem solved..."
      filterTitle="Filter innovations"
      sortTitle="Sort innovations"
      centers={centers}
      centerValue={params.center}
      projects={projects}
      projectValue={params.project}
      filterSelects={[
        { name: "type", label: "Type", value: params.type, options: innovationTypes },
        { name: "stage", label: "Readiness stage", value: params.stage, options: developmentStages },
        { name: "ip", label: "IP status", value: params.ip, options: ipStatuses },
        { name: "commercial", label: "Commercial stage", value: params.commercial, options: commercializationStatuses },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: innovationStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function FeaturedInnovation({
  innovation,
  projectName,
  centerName,
}: {
  innovation: ResearchGenericRecord;
  projectName: string;
  centerName: string;
}) {
  const href = innovation.slug ? `/innovations/${innovation.slug}` : "/innovations";
  const summary = getInnovationSummary(innovation);
  const problem = compactText(innovation.problem_addressed) || compactText(innovation.problem) || summary;
  const readiness = getReadinessText(innovation);
  const outputsCount = asCount(innovation.outputs_count);
  const partnersCount = asCount(innovation.partners_count);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-[280px_minmax(0,1fr)_330px]">
        <Link href={href} className="group relative min-h-[230px] overflow-hidden bg-slate-100">
          <span className="absolute left-3 top-3 z-10 rounded bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            Featured innovation
          </span>
          <InnovationThumbnail innovation={innovation} large />
        </Link>
        <div className="border-y border-slate-200 p-5 lg:border-x lg:border-y-0">
          <div className="flex flex-wrap gap-2">
            <Badge>{formatLabel(compactText(innovation.development_stage) || "field tested")}</Badge>
            {innovation.ip_status ? <Badge>{formatLabel(innovation.ip_status)}</Badge> : null}
            {innovation.commercialization_status ? (
              <Badge>{formatLabel(innovation.commercialization_status)}</Badge>
            ) : null}
          </div>
          <Link href={href} className="group mt-3 block">
            <h2 className="text-2xl font-semibold leading-tight text-primary group-hover:text-secondary">
              {getRecordTitle(innovation, "Innovation")}
            </h2>
          </Link>
          {summary ? (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-700">{summary}</p>
          ) : null}
          <ReadinessTrail innovation={innovation} className="mt-7" />
        </div>
        <div className="grid content-between gap-4 p-5">
          <dl className="divide-y divide-slate-200 text-sm">
            <StoryFact label="Problem it solves" value={problem} />
            <StoryFact label="Current readiness" value={readiness} />
            <StoryFact label="Linked project" value={projectName} />
            <StoryFact label="Lead center" value={centerName} />
          </dl>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3 text-xs font-semibold text-slate-600">
              {outputsCount ? <IconCount icon={PackageCheck} value={outputsCount} label="Outputs" /> : null}
              {partnersCount ? <IconCount icon={UsersRound} value={partnersCount} label="Partners" /> : null}
            </div>
            <Link
              href="/partners"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              Partner with the team
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function InnovationStoryCard({
  innovation,
  projectName,
  centerName,
}: {
  innovation: ResearchGenericRecord;
  projectName: string;
  centerName: string;
}) {
  const href = innovation.slug ? `/innovations/${innovation.slug}` : "/innovations";
  const trl = compactText(innovation.trl_level);
  const isActive = innovation.is_active === false ? "Inactive" : "Active";
  const summary = getInnovationSummary(innovation);

  return (
    <Link
      href={href}
      className="group grid min-h-[154px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md sm:grid-cols-[118px_minmax(0,1fr)_170px]"
    >
      <InnovationThumbnail innovation={innovation} />
      <div className="min-w-0 border-y border-slate-200 p-4 sm:border-x sm:border-y-0">
        <div className="flex flex-wrap gap-1.5">
          {innovation.development_stage ? <Badge>{formatLabel(innovation.development_stage)}</Badge> : null}
          {innovation.ip_status ? <FilledBadge>{formatLabel(innovation.ip_status)}</FilledBadge> : null}
        </div>
        <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-6 text-primary group-hover:text-secondary">
          {getRecordTitle(innovation, "Innovation")}
        </h3>
        {summary ? (
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{summary}</p>
        ) : null}
        <ReadinessTrail innovation={innovation} compact className="mt-3" />
      </div>
      <div className="grid content-between gap-3 p-4 text-xs">
        <div className="space-y-3">
          <MiniMeta label="Project" value={projectName} />
          <MiniMeta label="Center" value={centerName} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {trl ? (
            <span className="rounded bg-emerald-50 px-2 py-1 font-semibold text-primary">
              TRL {trl}
            </span>
          ) : null}
          <span className="font-semibold text-slate-500">.</span>
          <span className="font-semibold text-primary">{isActive}</span>
        </div>
      </div>
    </Link>
  );
}

function InnovationThumbnail({
  innovation,
  large = false,
}: {
  innovation: ResearchGenericRecord;
  large?: boolean;
}) {
  const variant = getThumbnailVariant(innovation);

  return (
    <div
      className={`relative h-full min-h-[118px] overflow-hidden ${
        variant === "blue"
          ? "bg-[linear-gradient(135deg,#0B4A7A,#0EA5E9)]"
          : variant === "navy"
            ? "bg-[linear-gradient(135deg,#061A36,#0F3B70)]"
            : "bg-[linear-gradient(135deg,#064E3B,#166534)]"
      }`}
    >
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <svg
        aria-hidden
        viewBox="0 0 240 220"
        className={`absolute inset-0 h-full w-full ${large ? "p-8" : "p-6"}`}
        fill="none"
      >
        <path d="M42 168c31-55 68-82 111-82 26 0 45 10 57 30" stroke="#FDE68A" strokeOpacity="0.4" strokeWidth="3" />
        <path d="M68 166h104M120 166V84M120 125c-26-9-42-27-48-54 30 2 49 20 48 54Zm0-8c24-11 40-30 47-58-31 4-49 23-47 58Z" stroke="#D1FAE5" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="88" y="34" width="64" height="78" rx="10" fill="#061A36" fillOpacity="0.45" stroke="#D1FAE5" strokeWidth="3" />
        <path d="M102 58h36M102 78h24M104 98h32" stroke="#FDE68A" strokeWidth="4" strokeLinecap="round" />
        <circle cx="154" cy="38" r="9" fill="#38BDF8" />
        <path d="M154 22c16 0 29 8 38 22M154 7c28 0 50 14 65 37" stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
      </svg>
    </div>
  );
}

function ReadinessTrail({
  innovation,
  compact = false,
  className = "",
}: {
  innovation: ResearchGenericRecord;
  compact?: boolean;
  className?: string;
}) {
  const activeIndex = getReadinessIndex(innovation);
  const steps = [
    { label: "Idea", icon: Lightbulb },
    { label: "Prototype", icon: Wrench },
    { label: "Field tested", icon: Sprout },
    { label: "Partner-ready", icon: Handshake },
  ];

  return (
    <div className={`grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start gap-2 ${className}`}>
      {steps.map((step, index) => {
        const Icon = step.icon;
        const active = index === activeIndex;

        return (
          <div key={step.label} className="contents">
            <div className="grid justify-items-center gap-1">
              <span
                className={`grid place-items-center rounded-full border ${
                  compact ? "h-7 w-7" : "h-11 w-11"
                } ${
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                <Icon aria-hidden className={compact ? "h-3.5 w-3.5" : "h-5 w-5"} />
              </span>
              <span className={`${compact ? "text-[9px]" : "text-xs"} text-center font-semibold text-slate-700`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span className="mt-3 text-center text-sm font-semibold text-slate-400">→</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function InnovationAside() {
  return (
    <aside className="grid gap-4 xl:sticky xl:top-24">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">Innovation pathways</h2>
        <div className="mt-3 divide-y divide-slate-200">
          {pathwayLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center gap-4 py-4 first:pt-2 last:pb-1"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/20 text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-primary group-hover:text-secondary">{link.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{link.body}</span>
                </span>
                <ArrowRight aria-hidden className="h-4 w-4 text-primary transition group-hover:translate-x-1 group-hover:text-secondary" />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-primary">How to read a record</h2>
        <div className="mt-4 space-y-4">
          {readSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.label} className="grid grid-cols-[48px_24px_minmax(0,1fr)] items-start gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span className="pt-2 text-base font-semibold text-slate-700">{index + 1}</span>
                <span>
                  <span className="block font-semibold text-primary">{step.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">{step.body}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-primary/20 bg-emerald-50/70 p-5 shadow-sm">
        <div className="flex gap-3">
          <UsersRound aria-hidden className="mt-1 h-6 w-6 shrink-0 text-primary" />
          <div>
            <h2 className="font-semibold text-primary">Have an innovation idea?</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              We support researchers to validate, develop, and deploy solutions.
            </p>
            <Link href="/connect" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">
              Submit an innovation
              <ArrowRight aria-hidden className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </aside>
  );
}

function StoryFact({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div className="py-3 first:pt-0">
      <dt className="font-semibold text-primary">{label}</dt>
      <dd className="mt-1 line-clamp-2 leading-5 text-slate-600">{value}</dd>
    </div>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  if (!value) return null;

  return (
    <div>
      <p className="font-semibold text-primary">{label}</p>
      <p className="mt-0.5 line-clamp-2 leading-4 text-slate-500">{value}</p>
    </div>
  );
}

function IconCount({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Search;
  value: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon aria-hidden className="h-4 w-4 text-primary" />
      <span className="font-semibold text-slate-950">{value}</span>
      <span>{label}</span>
    </span>
  );
}

function getInnovationSummary(innovation: ResearchGenericRecord) {
  return (
    getRecordSummary(innovation) ||
    compactText(innovation.solution) ||
    compactText(innovation.benefits) ||
    compactText(innovation.problem_addressed) ||
    ""
  );
}

function getReadinessText(innovation: ResearchGenericRecord) {
  const stage = formatLabel(innovation.development_stage);
  const commercial = formatLabel(innovation.commercialization_status);
  const trl = compactText(innovation.trl_level);
  return [stage, trl ? `TRL ${trl}` : "", commercial].filter(Boolean).join(" · ");
}

function getReadinessIndex(innovation: ResearchGenericRecord) {
  const stage = compactText(innovation.development_stage).toLowerCase();
  const commercial = compactText(innovation.commercialization_status).toLowerCase();
  const trl = Number(innovation.trl_level ?? 0);

  if (commercial.includes("market") || commercial.includes("commercial") || trl >= 8) return 3;
  if (stage.includes("testing") || stage.includes("validation") || commercial.includes("pilot") || trl >= 5) return 2;
  if (stage.includes("development") || commercial.includes("prototype") || trl >= 3) return 1;
  return 0;
}

function getThumbnailVariant(innovation: ResearchGenericRecord) {
  const type = compactText(innovation.innovation_type).toLowerCase();
  if (type.includes("software") || type.includes("model")) return "navy";
  if (type.includes("service") || type.includes("process")) return "blue";
  return "green";
}

function resolveRelatedName(
  innovation: ResearchGenericRecord,
  key: "project" | "center",
  names: Map<string | undefined, string>,
) {
  const related = innovation[key] as ResearchGenericRecord | undefined;
  return (
    compactText(related?.title ?? related?.name ?? related?.code) ||
    names.get(innovation[`${key}_id`]) ||
    ""
  );
}

function asCount(value: unknown) {
  const count = Number(value);
  if (!Number.isFinite(count) || count <= 0) return "";
  return String(count);
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
