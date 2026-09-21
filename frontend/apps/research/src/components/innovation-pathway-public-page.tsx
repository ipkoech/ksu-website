import Link from "next/link";
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
import { StatusMessage } from "./research-ui";
import { ResearchPageHero } from "./research-page-hero";
import {
  PathwayRecordsDisplay,
  type PathwayDisplayConfig,
} from "./research-record-displays";
import { toResearchRecordDisplayDto } from "../lib/research-formatters";
import {
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
  title: "Startups",
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
  const pathwayDisplayConfig: PathwayDisplayConfig = {
    kind: config.kind,
    featuredLabel: config.featuredLabel,
    allTitle: config.allTitle,
    secondaryAction: config.secondaryAction,
    secondaryHref: config.secondaryHref,
  };

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
                <PathwayRecordsDisplay
                  config={pathwayDisplayConfig}
                  featuredRecord={featuredRecord ? toResearchRecordDisplayDto(featuredRecord) : undefined}
                  cardRecords={cardRecords.map((record) => toResearchRecordDisplayDto(record))}
                  context={context}
                />
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
      imageSrc="/images/research/headers/innovation-week-8243.jpg"
      imageAlt={`Kisii University ${config.title}`}
    />
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
  innovations: Record<string, string>;
  partners: Record<string, string>;
  startups: Record<string, string>;
};

function buildContextMaps(innovations: ResearchGenericRecord[], partners: ResearchGenericRecord[], startups: ResearchGenericRecord[]): ContextMaps {
  return {
    innovations: Object.fromEntries(innovations.map((item) => [String(item.id), getRecordTitle(item, "Innovation")])),
    partners: Object.fromEntries(partners.map((item) => [String(item.id), getRecordTitle(item, "Partner")])),
    startups: Object.fromEntries(startups.map((item) => [String(item.id), getRecordTitle(item, "Startup")])),
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
