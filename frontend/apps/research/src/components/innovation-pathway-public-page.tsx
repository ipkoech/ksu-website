import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  CalendarDays,
  Handshake,
  Lightbulb,
  Rocket,
  Sprout,
  Target,
  Trophy,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { pageFromSearchParams } from "@ksu/ui/components";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ProgramTableControls } from "../app/programs/program-table-controls";
import { ResearchListPagination } from "./research-list-pagination";
import { Badge, FilledBadge, StatusMessage } from "./research-ui";
import { ResearchPageHero } from "./research-page-hero";
import {
  compactText,
  formatDate,
  formatLabel,
  getCompetitionEntriesFiltered,
  getIncubationRecordsFiltered,
  getInnovations,
  getPartners,
  getStartupsFiltered,
  getTechnologyTransferCasesFiltered,
} from "../lib/research-public-data";
import {
  filterRecordsByMonth,
  getListPageSize,
  getRecordMonths,
  getRecordSummary,
  getRecordTitle,
  getRecordYears,
} from "../lib/research-page-model";

export type PathwaySearchParams = {
  q?: string;
  stage?: string;
  registration?: string;
  type?: string;
  status?: string;
  active?: string;
  year?: string;
  month?: string;
  sort?: string;
  page?: string;
  partner?: string;
  innovation?: string;
  startup?: string;
};

type PathwayKind = "startups" | "incubation" | "competitions" | "technology-transfer";

type PathwayPageConfig = {
  kind: PathwayKind;
  path: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryAction: string;
  secondaryAction: string;
  secondaryHref: string;
  searchPlaceholder: string;
  filterTitle: string;
  sortTitle: string;
  emptyMessage: string;
  featuredLabel: string;
  allTitle: string;
  rightTitle: string;
  rightRows: Array<{ label: string; body: string; icon: LucideIcon }>;
  quickLinks: Array<{ label: string; href: string }>;
  ctaTitle: string;
  ctaBody: string;
  ctaLinks: Array<{ label: string; href: string }>;
  heroIcon: LucideIcon;
};

const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];

const commonStatusOptions = ["active", "draft", "archived", "completed", "closed"];

const sortOptions = [
  { label: "Newest", value: "created_at" },
  { label: "Featured order", value: "display_order" },
  { label: "Recently updated", value: "updated_at" },
  { label: "Title A-Z", value: "title" },
  { label: "Title Z-A", value: "title_desc" },
];

export const startupPathwayConfig: PathwayPageConfig = {
  kind: "startups",
  path: "/startups",
  eyebrow: "Innovation & Partnerships",
  title: "Research Startups",
  subtitle: "University innovations growing into ventures, services, and field-ready enterprises.",
  primaryAction: "Explore ventures",
  secondaryAction: "Partner with a startup",
  secondaryHref: "/partners",
  searchPlaceholder: "Search startups by name, sector, innovation, or market focus...",
  filterTitle: "Filter startups",
  sortTitle: "Sort startups",
  emptyMessage: "No published startups match the current filters.",
  featuredLabel: "Featured venture",
  allTitle: "Startup ventures",
  rightTitle: "Startup signals",
  heroIcon: Rocket,
  rightRows: [
    { label: "Venture stage", body: "Where the venture is on its path from idea to market.", icon: Sprout },
    { label: "Registration", body: "The formal business or incorporation status.", icon: BadgeCheck },
    { label: "Market focus", body: "The sector, customer, or problem space being served.", icon: Target },
    { label: "Linked innovation", body: "The university innovation that anchors the venture.", icon: Lightbulb },
  ],
  quickLinks: [
    { label: "Incubation support", href: "/incubation" },
    { label: "Competitions", href: "/competitions" },
    { label: "Technology transfer", href: "/technology-transfer" },
    { label: "Partners", href: "/partners" },
  ],
  ctaTitle: "Ready to collaborate?",
  ctaBody: "Work with emerging research ventures through mentoring, validation, market access, or investment support.",
  ctaLinks: [
    { label: "Partner with us", href: "/partners" },
    { label: "Contact research office", href: "/connect" },
  ],
};

export const incubationPathwayConfig: PathwayPageConfig = {
  kind: "incubation",
  path: "/incubation",
  eyebrow: "Innovation & Partnerships",
  title: "Innovation Incubation",
  subtitle: "Structured support that helps research teams validate, mentor, prototype, and prepare for scale.",
  primaryAction: "View incubation records",
  secondaryAction: "Find mentor support",
  secondaryHref: "/mentorship",
  searchPlaceholder: "Search incubation records by cohort, programme, startup, or support received...",
  filterTitle: "Filter incubation records",
  sortTitle: "Sort incubation records",
  emptyMessage: "No published incubation records match the current filters.",
  featuredLabel: "Featured support record",
  allTitle: "Incubation records",
  rightTitle: "Incubation support",
  heroIcon: UsersRound,
  rightRows: [
    { label: "Cohort", body: "The programme or cycle supporting the team.", icon: CalendarDays },
    { label: "Mentors", body: "Research, business, or technical mentors assigned to the work.", icon: UsersRound },
    { label: "Milestones", body: "Support steps from intake through demo and scale.", icon: BadgeCheck },
    { label: "Next step", body: "What remains before the idea can move forward.", icon: ArrowRight },
  ],
  quickLinks: [
    { label: "Research startups", href: "/startups" },
    { label: "Competitions", href: "/competitions" },
    { label: "Technology transfer", href: "/technology-transfer" },
    { label: "Partner network", href: "/partners" },
  ],
  ctaTitle: "Support the next cohort",
  ctaBody: "Mentor teams, sponsor prototype development, or open field-testing opportunities.",
  ctaLinks: [
    { label: "Mentor teams", href: "/mentorship" },
    { label: "Contact research office", href: "/connect" },
  ],
};

export const competitionPathwayConfig: PathwayPageConfig = {
  kind: "competitions",
  path: "/competitions",
  eyebrow: "Innovation & Partnerships",
  title: "Competitions & Hackathons",
  subtitle: "Showcases, challenges, demo days, and pitch events that move research ideas into public view.",
  primaryAction: "Browse entries",
  secondaryAction: "Submit an innovation",
  secondaryHref: "/connect",
  searchPlaceholder: "Search entries by title, competition, award, startup, or innovation...",
  filterTitle: "Filter competition entries",
  sortTitle: "Sort competition entries",
  emptyMessage: "No published competition entries match the current filters.",
  featuredLabel: "Featured showcase entry",
  allTitle: "Challenge entries",
  rightTitle: "How to read an entry",
  heroIcon: Trophy,
  rightRows: [
    { label: "Challenge", body: "The event, hackathon, demo day, or competition context.", icon: Award },
    { label: "Pitch", body: "The idea or prototype presented to judges, partners, or peers.", icon: Lightbulb },
    { label: "Result", body: "Entry status, award, position, or public recognition.", icon: Trophy },
    { label: "Next step", body: "How the entry can move into support, incubation, or transfer.", icon: ArrowRight },
  ],
  quickLinks: [
    { label: "Research startups", href: "/startups" },
    { label: "Incubation support", href: "/incubation" },
    { label: "Technology transfer", href: "/technology-transfer" },
    { label: "Partner network", href: "/partners" },
  ],
  ctaTitle: "Host or support a challenge",
  ctaBody: "Sponsor prizes, mentor teams, judge showcases, or bring real-world problems into the innovation pipeline.",
  ctaLinks: [
    { label: "Sponsor a prize", href: "/partners" },
    { label: "Contact research office", href: "/connect" },
  ],
};

export const technologyTransferPathwayConfig: PathwayPageConfig = {
  kind: "technology-transfer",
  path: "/technology-transfer",
  eyebrow: "Innovation & Partnerships",
  title: "Technology Transfer",
  subtitle: "Research disclosures, licensing work, and partner agreements moving university knowledge into use.",
  primaryAction: "Explore transfer cases",
  secondaryAction: "Partner on transfer",
  secondaryHref: "/partners",
  searchPlaceholder: "Search transfer cases by title, IP reference, agreement, partner, or public benefit...",
  filterTitle: "Filter transfer cases",
  sortTitle: "Sort transfer cases",
  emptyMessage: "No published technology transfer cases match the current filters.",
  featuredLabel: "Featured transfer case",
  allTitle: "Transfer cases",
  rightTitle: "Transfer signals",
  heroIcon: Handshake,
  rightRows: [
    { label: "Disclosure", body: "The research output or innovation entering formal transfer review.", icon: Lightbulb },
    { label: "IP reference", body: "The internal intellectual property or agreement record.", icon: BadgeCheck },
    { label: "Partner pathway", body: "The organization, licence, or collaboration route taking the work forward.", icon: Handshake },
    { label: "Public value", body: "The expected benefit for communities, systems, industry, or the environment.", icon: Target },
  ],
  quickLinks: [
    { label: "Innovations", href: "/innovations" },
    { label: "Research startups", href: "/startups" },
    { label: "Incubation support", href: "/incubation" },
    { label: "Partner network", href: "/partners" },
  ],
  ctaTitle: "Move research into use",
  ctaBody: "Discuss licensing, field deployment, validation, or applied partnerships with the research office.",
  ctaLinks: [
    { label: "Partner with us", href: "/partners" },
    { label: "Contact research office", href: "/connect" },
  ],
};

export async function InnovationPathwayPublicPage({
  config,
  searchParams,
}: {
  config: PathwayPageConfig;
  searchParams?: Promise<PathwaySearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const perPage = getListPageSize(12);
  const sort = params.sort || "created_at";
  const sortField = sort === "title" || sort === "title_desc" ? titleSortField(config.kind) : sort;
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);

  const [records, allRecords, innovations, partners, startups] = await Promise.all([
    loadPathwayRecords(config.kind, params, page, perPage, sortField, order, activeFlags),
    loadPathwayRecords(config.kind, {}, 1, 100, "created_at", "desc", { isActive: true }),
    getInnovations(),
    getPartners(),
    config.kind === "incubation" || config.kind === "competitions"
      ? getStartupsFiltered({ perPage: 100, isActive: true })
      : Promise.resolve({ data: [], total: 0, perPage: 100, error: null }),
  ]);

  const years = getRecordYears(allRecords.data);
  const months = getRecordMonths(allRecords.data, params.year);
  const visibleRecords = filterRecordsByMonth(records.data, params.year, params.month);
  const featuredRecord = visibleRecords.find((record) => record.is_featured) ?? visibleRecords[0];
  const cardRecords = featuredRecord
    ? visibleRecords.filter((record) => record.id !== featuredRecord.id)
    : visibleRecords;
  const totalPages = Math.ceil((params.month ? visibleRecords.length : records.total) / records.perPage);
  const context = buildContextMaps(innovations.data, partners.data, startups.data);

  return (
    <main id="research-main" className="min-h-screen bg-white text-foreground">
      <PathwayHero config={config} />
      <section className="bg-[linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--surface-subtle))_48%,hsl(var(--background))_100%)] px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_350px] xl:items-start">
          <div className="min-w-0">
            <PathwayFilters
              config={config}
              params={params}
              years={years}
              months={months}
              innovations={innovations.data}
              partners={partners.data}
              startups={startups.data}
            />

            {[records.error, innovations.error, partners.error, startups.error]
              .filter(Boolean)
              .map((error) => (
                <div key={error} className="mt-5">
                  <StatusMessage tone="error">{error}</StatusMessage>
                </div>
              ))}

            {featuredRecord ? (
              <div className="mt-4">
                <PathwayFeaturedCard config={config} record={featuredRecord} context={context} />
              </div>
            ) : null}

            {visibleRecords.length > 0 ? (
              <>
                <div className="mt-5 flex items-center justify-between gap-4">
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    {config.allTitle}
                  </h2>
                  <p className="text-xs font-semibold uppercase tracking-eyebrow text-muted-foreground">
                    {visibleRecords.length} shown
                  </p>
                </div>
                {cardRecords.length > 0 ? (
                  <div className="mt-3 grid gap-4 lg:grid-cols-2">
                    {cardRecords.map((record) => (
                      <PathwayRecordCard
                        key={record.id}
                        config={config}
                        record={record}
                        context={context}
                      />
                    ))}
                  </div>
                ) : null}
                <ResearchListPagination
                  page={page}
                  totalPages={totalPages}
                  total={params.month ? visibleRecords.length : records.total}
                  perPage={records.perPage}
                  path={config.path}
                  params={params}
                  className="mt-6"
                />
              </>
            ) : (
              <div className="mt-6">
                <StatusMessage>{config.emptyMessage}</StatusMessage>
              </div>
            )}
          </div>

          <PathwayAside config={config} />
        </div>
      </section>
    </main>
  );
}

function PathwayHero({ config }: { config: PathwayPageConfig }) {
  return (
    <ResearchPageHero
      eyebrow={config.eyebrow}
      title={config.title}
      description={config.subtitle}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: config.title }]}
      actions={[
        { label: config.primaryAction, href: "#pathway-records" },
        { label: config.secondaryAction, href: config.secondaryHref, variant: "secondary" },
      ]}
      imageSrc="/institutional-research-images/KSUInnovationWeek2025,April7,2026-7982.jpg"
      imageAlt={`Kisii University ${config.title}`}
    />
  );
}

function HeroButton({ href, primary = false, children }: { href: string; primary?: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/45 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15"
      }
    >
      {children}
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}

function PathwayHeroArt({ kind }: { kind: PathwayKind }) {
  const isCompetition = kind === "competitions";
  const isIncubation = kind === "incubation";
  return (
    <svg aria-hidden viewBox="0 0 1100 300" className="absolute right-0 top-1/2 hidden h-full w-[72%] -translate-y-1/2 opacity-90 lg:block" fill="none">
      <g stroke="hsl(var(--secondary))" strokeOpacity="0.42" strokeWidth="1.5">
        <circle cx="120" cy="150" r="70" />
        <path d="M120 205V91M120 154c-31-9-50-31-57-66 38 2 61 22 57 66Zm0-8c29-13 49-38 56-73-38 5-61 28-56 73Z" />
        {isCompetition ? (
          <>
            <path d="M430 70h94v34c0 39-20 65-47 75-27-10-47-36-47-75V70Z" />
            <path d="M407 89h-42c2 48 31 67 72 69M547 89h42c-2 48-31 67-72 69M477 179v42M438 221h78" />
          </>
        ) : isIncubation ? (
          <>
            <rect x="360" y="74" width="210" height="126" rx="16" />
            <path d="M390 110h58M390 140h110M390 170h78M530 112l28 28-28 28M480 112l-28 28 28 28" />
          </>
        ) : (
          <>
            <rect x="362" y="70" width="132" height="160" rx="16" />
            <path d="M390 112h76M390 145h52M390 178h68M530 94h90M575 94v78M548 172h54" />
          </>
        )}
        <rect x="716" y="58" width="124" height="170" rx="12" />
        <path d="M742 92h58M742 122h72M742 152h48M742 184h64M798 209l16 16 34-44" />
        <path d="M922 112c28-26 54-26 80 0 24-20 48-16 70 12M928 148l53 34 56-50" />
      </g>
      <g stroke="hsl(var(--success))" strokeOpacity="0.36">
        <path d="M220 150h120M592 150h100M840 150h74M1018 130h70" />
        {[220, 340, 592, 692, 840, 914, 1018, 1088].map((x, index) => (
          <circle key={`${kind}-${x}`} cx={x} cy={index % 2 ? 130 : 150} r="7" fill="hsl(var(--brand-overlay))" stroke="hsl(var(--secondary))" />
        ))}
      </g>
    </svg>
  );
}

function PathwayFilters({
  config,
  params,
  years,
  months,
  innovations,
  partners,
  startups,
}: {
  config: PathwayPageConfig;
  params: PathwaySearchParams;
  years: string[];
  months: Array<{ value: string; label: string }>;
  innovations: ResearchGenericRecord[];
  partners: ResearchGenericRecord[];
  startups: ResearchGenericRecord[];
}) {
  return (
    <div id="pathway-records">
      <ProgramTableControls
        action={config.path}
        resetHref={config.path}
        searchValue={params.q}
        searchPlaceholder={config.searchPlaceholder}
        filterTitle={config.filterTitle}
        sortTitle={config.sortTitle}
        filterSelects={[
          ...pathwaySpecificFilters(config.kind, params),
          { name: "status", label: "Status", value: params.status, options: commonStatusOptions },
          { name: "active", label: "Active state", value: params.active, options: activeStates },
          { name: "year", label: "Year", value: params.year, options: years },
          { name: "month", label: "Month", value: params.month, options: months },
          {
            name: "innovation",
            label: "Innovation",
            value: params.innovation,
            options: innovations.map((item) => ({ value: item.id, label: getRecordTitle(item, "Innovation") })),
          },
          {
            name: "partner",
            label: "Partner",
            value: params.partner,
            options: partners.map((item) => ({ value: item.id, label: getRecordTitle(item, "Partner") })),
          },
          ...(config.kind === "incubation" || config.kind === "competitions"
            ? [{
                name: "startup",
                label: "Startup",
                value: params.startup,
                options: startups.map((item) => ({ value: item.id, label: getRecordTitle(item, "Startup") })),
              }]
            : []),
        ]}
        sortValue={params.sort}
        sortOptions={sortOptions}
      />
    </div>
  );
}

function pathwaySpecificFilters(kind: PathwayKind, params: PathwaySearchParams) {
  if (kind === "startups") {
    return [
      { name: "stage", label: "Venture stage", value: params.stage, options: ["idea", "prototype", "pilot", "registered", "market_ready", "scaling"] },
      { name: "registration", label: "Registration", value: params.registration, options: ["not_registered", "in_progress", "registered", "incorporated"] },
      { name: "type", label: "Sector", value: params.type, options: ["agriculture", "climate", "health", "education", "software", "services"] },
    ];
  }
  if (kind === "incubation") {
    return [
      { name: "type", label: "Incubation type", value: params.type, options: ["incubation", "acceleration", "mentorship", "commercialization"] },
      { name: "stage", label: "Stage", value: params.stage, options: ["intake", "active", "mentorship", "demo", "completed", "scaled"] },
    ];
  }
  if (kind === "technology-transfer") {
    return [
      { name: "type", label: "Case type", value: params.type, options: ["disclosure", "license", "assignment", "mou", "collaboration", "spinout"] },
      { name: "stage", label: "Transfer status", value: params.stage, options: ["disclosed", "under_review", "protected", "licensed", "transferred", "implemented", "closed"] },
    ];
  }
  return [
    { name: "type", label: "Entry type", value: params.type, options: ["competition", "hackathon", "showcase", "demo_day", "challenge"] },
    { name: "stage", label: "Entry status", value: params.stage, options: ["submitted", "shortlisted", "finalist", "winner", "presented", "awarded"] },
  ];
}

function PathwayFeaturedCard({
  config,
  record,
  context,
}: {
  config: PathwayPageConfig;
  record: ResearchGenericRecord;
  context: ContextMaps;
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
      <div className="grid lg:grid-cols-[250px_minmax(0,1fr)_310px]">
        <PathwayVisual config={config} featured label={config.featuredLabel} />
        <div className="border-y border-border p-5 lg:border-x lg:border-y-0">
          <div className="flex flex-wrap gap-2">
            {primaryBadge(config.kind, record) ? <Badge>{primaryBadge(config.kind, record)}</Badge> : null}
            {secondaryBadge(config.kind, record) ? <FilledBadge>{secondaryBadge(config.kind, record)}</FilledBadge> : null}
          </div>
          <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-foreground">
            {getRecordTitle(record, config.allTitle)}
          </h2>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {pathwaySummary(config.kind, record)}
          </p>
          <PathwayProgress kind={config.kind} record={record} className="mt-7" />
        </div>
        <div className="grid content-between gap-4 p-5">
          <dl className="divide-y divide-border text-sm">
            {featureFacts(config.kind, record, context).map((fact) => (
              <StoryFact key={fact.label} {...fact} />
            ))}
          </dl>
          <Link
            href={config.secondaryHref}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            {config.secondaryAction}
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

function PathwayRecordCard({
  config,
  record,
  context,
}: {
  config: PathwayPageConfig;
  record: ResearchGenericRecord;
  context: ContextMaps;
}) {
  return (
    <article className="grid min-h-[158px] overflow-hidden rounded-lg border border-border bg-white shadow-sm transition hover:border-primary/30 hover:shadow-md sm:grid-cols-[112px_minmax(0,1fr)_170px]">
      <PathwayVisual config={config} />
      <div className="min-w-0 border-y border-border p-4 sm:border-x sm:border-y-0">
        <div className="flex flex-wrap gap-1.5">
          {primaryBadge(config.kind, record) ? <Badge>{primaryBadge(config.kind, record)}</Badge> : null}
          {secondaryBadge(config.kind, record) ? <FilledBadge>{secondaryBadge(config.kind, record)}</FilledBadge> : null}
        </div>
        <h3 className="mt-2 line-clamp-2 font-display text-base font-semibold leading-6 text-foreground">
          {getRecordTitle(record, config.allTitle)}
        </h3>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {pathwaySummary(config.kind, record)}
        </p>
        <PathwayProgress kind={config.kind} record={record} compact className="mt-3" />
      </div>
      <div className="grid content-between gap-3 p-4 text-xs">
        <div className="space-y-3">
          <MiniMeta label="Innovation" value={context.innovations.get(record.innovation_id) ?? ""} />
          <MiniMeta label="Partner" value={context.partners.get(record.partner_id) ?? ""} />
          {config.kind !== "startups" ? <MiniMeta label="Startup" value={context.startups.get(record.startup_id) ?? ""} /> : null}
        </div>
        <span className="font-semibold text-primary">{formatLabel(record.status) || "Active"}</span>
      </div>
    </article>
  );
}

function PathwayVisual({ config, featured = false, label }: { config: PathwayPageConfig; featured?: boolean; label?: string }) {
  const Icon = config.heroIcon;
  return (
    <div className={`relative min-h-[118px] overflow-hidden bg-[linear-gradient(135deg,hsl(var(--brand-overlay)),hsl(var(--primary)/.62))] ${featured ? "lg:min-h-[230px]" : ""}`}>
      {label ? (
        <span className="absolute left-3 top-3 z-10 rounded-md bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
          {label}
        </span>
      ) : null}
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 grid place-items-center">
        <span className={`${featured ? "h-20 w-20" : "h-14 w-14"} grid place-items-center rounded-full border border-secondary/45 bg-white/10 text-secondary backdrop-blur`}>
          <Icon aria-hidden className={featured ? "h-10 w-10" : "h-7 w-7"} />
        </span>
      </div>
    </div>
  );
}

function PathwayProgress({ kind, record, compact = false, className = "" }: { kind: PathwayKind; record: ResearchGenericRecord; compact?: boolean; className?: string }) {
  const steps = progressSteps(kind);
  const activeIndex = activeProgressIndex(kind, record);
  return (
    <div className={`grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start gap-2 ${className}`}>
      {steps.map((step, index) => {
        const active = index === activeIndex;
        return (
          <div key={step} className="contents">
            <div className="grid justify-items-center gap-1">
              <span className={`${compact ? "h-6 w-6" : "h-9 w-9"} grid place-items-center rounded-full border text-[10px] font-bold ${active ? "border-primary bg-primary text-white" : "border-border bg-white text-muted-foreground"}`}>
                {index + 1}
              </span>
              <span className={`${compact ? "text-[9px]" : "text-[11px]"} text-center font-semibold text-muted-foreground`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 ? <span className="mt-2 text-center text-xs font-semibold text-muted-foreground/70">→</span> : null}
          </div>
        );
      })}
    </div>
  );
}

function PathwayAside({ config }: { config: PathwayPageConfig }) {
  return (
    <aside className="grid gap-4 xl:sticky xl:top-24">
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-foreground">{config.rightTitle}</h2>
        <div className="mt-4 space-y-4">
          {config.rightRows.map((row, index) => {
            const Icon = row.icon;
            return (
              <div key={row.label} className="grid grid-cols-[42px_22px_minmax(0,1fr)] items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-border text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <span className="pt-2 text-sm font-semibold text-muted-foreground">{index + 1}</span>
                <span>
                  <span className="block font-semibold text-primary">{row.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">{row.body}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>
      <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-foreground">Quick paths</h2>
        <div className="mt-2 divide-y divide-border">
          {config.quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="group flex items-center justify-between gap-3 py-3 text-sm font-semibold text-primary hover:text-secondary">
              {link.label}
              <ArrowRight aria-hidden className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>
      <section className="rounded-lg border border-primary/20 bg-accent/70 p-5 shadow-sm">
        <div className="flex gap-3">
          <Handshake aria-hidden className="mt-1 h-6 w-6 shrink-0 text-primary" />
          <div>
            <h2 className="font-display font-semibold text-foreground">{config.ctaTitle}</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{config.ctaBody}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {config.ctaLinks.map((link) => (
                <Link key={link.href} href={link.href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-secondary">
                  {link.label}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}

type ContextMaps = {
  innovations: Map<unknown, string>;
  partners: Map<unknown, string>;
  startups: Map<unknown, string>;
};

function buildContextMaps(innovations: ResearchGenericRecord[], partners: ResearchGenericRecord[], startups: ResearchGenericRecord[]): ContextMaps {
  return {
    innovations: new Map(innovations.map((item) => [item.id, getRecordTitle(item, "Innovation")])),
    partners: new Map(partners.map((item) => [item.id, getRecordTitle(item, "Partner")])),
    startups: new Map(startups.map((item) => [item.id, getRecordTitle(item, "Startup")])),
  };
}

async function loadPathwayRecords(
  kind: PathwayKind,
  params: PathwaySearchParams,
  page: number,
  perPage: number,
  sort: string,
  order: "asc" | "desc",
  activeFlags: { isActive?: boolean; isFeatured?: boolean },
) {
  const filters = {
    search: params.q,
    status: params.status,
    category: params.type,
    partnerId: params.partner,
    innovationId: params.innovation,
    startupId: params.startup,
    year: params.year,
    sort,
    order,
    page,
    perPage,
    ...activeFlags,
  };
  if (kind === "startups") {
    return getStartupsFiltered({
      ...filters,
      ventureStage: params.stage,
      registrationStatus: params.registration,
    });
  }
  if (kind === "incubation") {
    return getIncubationRecordsFiltered({
      ...filters,
      incubationType: params.type,
      incubationStage: params.stage,
    });
  }
  if (kind === "technology-transfer") {
    return getTechnologyTransferCasesFiltered({
      ...filters,
      caseType: params.type,
      transferStatus: params.stage,
    });
  }
  return getCompetitionEntriesFiltered({
    ...filters,
    entryType: params.type,
    entryStatus: params.stage,
  });
}

function titleSortField(kind: PathwayKind) {
  return kind === "startups" ? "name" : "title";
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}

function primaryBadge(kind: PathwayKind, record: ResearchGenericRecord) {
  if (kind === "startups") return formatLabel(record.venture_stage);
  if (kind === "incubation") return formatLabel(record.incubation_type);
  if (kind === "technology-transfer") return formatLabel(record.case_type);
  return formatLabel(record.entry_type);
}

function secondaryBadge(kind: PathwayKind, record: ResearchGenericRecord) {
  if (kind === "startups") return formatLabel(record.registration_status);
  if (kind === "incubation") return formatLabel(record.stage);
  if (kind === "technology-transfer") return formatLabel(record.transfer_status);
  return formatLabel(record.entry_status);
}

function pathwaySummary(kind: PathwayKind, record: ResearchGenericRecord) {
  if (kind === "startups") {
    return getRecordSummary(record) || compactText(record.solution) || compactText(record.market) || compactText(record.problem);
  }
  if (kind === "incubation") {
    return getRecordSummary(record) || compactText(record.support_received) || compactText(record.outcomes) || compactText(record.next_steps);
  }
  if (kind === "technology-transfer") {
    return getRecordSummary(record) || compactText(record.public_benefit) || compactText(record.next_steps) || compactText(record.agreement_reference);
  }
  return getRecordSummary(record) || compactText(record.pitch_summary) || compactText(record.judges_feedback) || compactText(record.award);
}

function featureFacts(kind: PathwayKind, record: ResearchGenericRecord, context: ContextMaps) {
  if (kind === "startups") {
    return [
      { label: "Sector", value: compactText(record.sector) },
      { label: "Registration", value: formatLabel(record.registration_status) },
      { label: "Linked innovation", value: context.innovations.get(record.innovation_id) ?? "" },
      { label: "Partner", value: context.partners.get(record.partner_id) ?? "" },
      { label: "Funding raised", value: money(record.funding_raised, record.currency) },
    ].filter((fact) => fact.value);
  }
  if (kind === "incubation") {
    return [
      { label: "Programme", value: compactText(record.program_name) },
      { label: "Cohort", value: compactText(record.cohort) },
      { label: "Timeline", value: [formatDate(record.start_date), formatDate(record.end_date)].filter(Boolean).join(" - ") },
      { label: "Startup", value: context.startups.get(record.startup_id) ?? "" },
      { label: "Mentors", value: mentorCount(record.mentor_ids) },
    ].filter((fact) => fact.value);
  }
  if (kind === "technology-transfer") {
    return [
      { label: "Case type", value: formatLabel(record.case_type) },
      { label: "Transfer status", value: formatLabel(record.transfer_status) },
      { label: "Agreement date", value: formatDate(record.agreement_date) || formatDate(record.disclosure_date) },
      { label: "IP reference", value: compactText(record.ip_reference) || compactText(record.agreement_reference) },
      { label: "Partner", value: context.partners.get(record.partner_id) ?? "" },
      { label: "Revenue generated", value: money(record.revenue_generated, record.currency) },
    ].filter((fact) => fact.value);
  }
  return [
    { label: "Competition", value: compactText(record.competition_name) },
    { label: "Event date", value: formatDate(record.event_date) },
    { label: "Result", value: [formatLabel(record.entry_status), compactText(record.award), compactText(record.position)].filter(Boolean).join(" · ") },
    { label: "Startup", value: context.startups.get(record.startup_id) ?? "" },
    { label: "Innovation", value: context.innovations.get(record.innovation_id) ?? "" },
  ].filter((fact) => fact.value);
}

function progressSteps(kind: PathwayKind) {
  if (kind === "startups") return ["Idea", "Registered", "Pilot", "Market"];
  if (kind === "incubation") return ["Intake", "Mentor", "Demo", "Scale"];
  if (kind === "technology-transfer") return ["Disclose", "Protect", "License", "Deploy"];
  return ["Submitted", "Shortlist", "Final", "Award"];
}

function activeProgressIndex(kind: PathwayKind, record: ResearchGenericRecord) {
  const value = compactText(
    kind === "startups"
      ? record.venture_stage
      : kind === "incubation"
        ? record.stage
        : kind === "technology-transfer"
          ? record.transfer_status
          : record.entry_status,
  ).toLowerCase();
  if (/(deploy|implemented|transferred|closed)/.test(value)) return 3;
  if (/(license|licensed)/.test(value)) return 2;
  if (/(protect|protected|review)/.test(value)) return 1;
  if (/(market|scal|winner|award|completed)/.test(value)) return 3;
  if (/(pilot|demo|final|presented)/.test(value)) return 2;
  if (/(register|mentor|active|short)/.test(value)) return 1;
  return 0;
}

function StoryFact({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="py-3 first:pt-0">
      <dt className="font-semibold text-primary">{label}</dt>
      <dd className="mt-1 line-clamp-2 leading-5 text-muted-foreground">{value}</dd>
    </div>
  );
}

function MiniMeta({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <p className="font-semibold text-primary">{label}</p>
      <p className="mt-0.5 line-clamp-2 leading-4 text-muted-foreground">{value}</p>
    </div>
  );
}

function mentorCount(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return "";
  return `${value.length} ${value.length === 1 ? "mentor" : "mentors"}`;
}

function money(value: unknown, currency: unknown) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "";
  const currencyText =
    typeof currency === "string" || typeof currency === "number"
      ? compactText(currency)
      : "";
  return `${currencyText || "KES"} ${new Intl.NumberFormat("en").format(amount)}`;
}
