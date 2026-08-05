import type { Metadata } from "next";
import type { ResearchGenericRecord } from "@ksu/api-client";
import Image from "next/image";
import Link from "next/link";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import { Badge, PrimaryLink, ResearchSection, SecondaryLink, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getImpactMetrics,
  getStories,
  getSustainabilityFiltered,
  getSustainabilityActivities,
  getSustainabilityPartners,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getRecordMonths,
  getRecordSummary,
  getRecordTimelineLabel,
  getRecordTitle,
  getRecordYears,
} from "../../lib/research-page-model";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Sustainability",
  description: "Sustainability initiatives and impact records.",
};

type SustainabilitySearchParams = { q?: string; type?: string; active?: string; status?: string; year?: string; month?: string; sort?: string };

const sustainabilityTypes = ["climate", "conservation", "biodiversity", "water", "food_security", "circular_economy", "energy"];
const sustainabilityStatuses = ["active", "planned", "completed", "paused"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "name", label: "Name A-Z" },
  { value: "created_at", label: "Newest" },
  { value: "updated_at", label: "Recently updated" },
  { value: "start_date", label: "Start date" },
];

export default async function SustainabilityPage({ searchParams }: { searchParams?: Promise<SustainabilitySearchParams> }) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "updated_at";
  const order = sort === "name" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [initiatives, partners, activities, stories, metrics] = await Promise.all([
    getSustainabilityFiltered({
      search: params.q,
      sustainabilityType: params.type,
      status: params.status,
      year: params.year,
      sort,
      order,
      ...activeFlags,
    }),
    getSustainabilityPartners(),
    getSustainabilityActivities(),
    getStories(),
    getImpactMetrics(),
  ]);
  const visibleInitiatives = filterRecordsByMonth(initiatives.data, params.year, params.month);
  const errors = [initiatives, partners, activities, stories, metrics].flatMap((item) =>
    item.error ? [item.error] : [],
  );
  const years = getRecordYears(initiatives.data);
  const months = getRecordMonths(initiatives.data, params.year);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <SustainabilityHero
        initiativeCount={visibleInitiatives.length}
        partnerCount={partners.data.length}
        activityCount={activities.data.length}
        metricCount={metrics.data.length}
      />
      <LandingTabs
        items={[
          { href: "#initiatives", label: "Initiatives" },
          { href: "#outcomes", label: "Outcomes & stories" },
          { href: "#network", label: "Partners" },
        ]}
      />

      {errors.length > 0 ? <ErrorBand errors={errors} /> : null}

      <ResearchSection
        eyebrow="Featured Initiatives"
        title="Sustainability work with visible public evidence"
        body="Published initiative records lead the page, with filters nearby for visitors who need the full archive."
        tone="white"
      >
        <FeaturedInitiatives records={visibleInitiatives} />
      </ResearchSection>

      <ResearchSection
        id="initiatives"
        eyebrow="Initiatives"
        title="Find sustainability records"
        body="Search first, then open filters for initiative type, active state, status, year, month, and sort order."
      >
        <SustainabilityFilters
          params={params}
          years={years}
          months={months}
        />
        {visibleInitiatives.length > 0 ? (
          <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-border bg-white shadow-sm">
            {visibleInitiatives.map((initiative) => (
              <InitiativeRow key={initiative.id} initiative={initiative} />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <StatusMessage>No sustainability records match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>

      <ResearchSection
        id="outcomes"
        eyebrow="Impact"
        title="Measured sustainability outcomes"
        body="Impact metrics and success stories show the public evidence behind sustainability work."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          {metrics.data.length > 0 ? <MetricPanel records={metrics.data} /> : <StatusMessage>Impact metrics are not published yet.</StatusMessage>}
          {stories.data.length > 0 ? <StoryPanel records={stories.data} /> : <StatusMessage>Sustainability stories are not published yet.</StatusMessage>}
        </div>
      </ResearchSection>

      <ResearchSection
        id="network"
        eyebrow="Delivery Network"
        title="Partners and public activities"
        body="Partner and event records show who is involved and where sustainability work is happening."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {partners.data.length > 0 ? (
            <RecordListPanel title="Partners" records={partners.data} />
          ) : <StatusMessage>Partner records are not published yet.</StatusMessage>}
          {activities.data.length > 0 ? (
            <RecordListPanel title="Activities" records={activities.data} dateField="start_date" />
          ) : <StatusMessage>Public activity records are not published yet.</StatusMessage>}
        </div>
      </ResearchSection>
    </main>
  );
}

function SustainabilityHero({
  initiativeCount,
  partnerCount,
  activityCount,
  metricCount,
}: {
  initiativeCount: number;
  partnerCount: number;
  activityCount: number;
  metricCount: number;
}) {
  const stats = [
    { label: "Initiatives", value: initiativeCount },
    { label: "Partners", value: partnerCount },
    { label: "Activities", value: activityCount },
    { label: "Metrics", value: metricCount },
  ];

  return (
    <section className="border-b border-border bg-white">
      <div className="mx-auto grid min-h-[560px] max-w-[1680px] lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.75fr)]">
        <div className="flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-muted-foreground/60">/</span>
            <span className="text-foreground">Sustainability</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Sustainability</p>
          <h1 className="mt-4 max-w-5xl text-balance font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-foreground sm:text-5xl lg:text-6xl">Sustainability at Kisii University Research</h1>
          <p className="mt-5 max-w-3xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg">Climate, conservation, water, food systems, and measurable public impact brought together through published university research records.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <PrimaryLink href="#initiatives">Explore initiatives</PrimaryLink>
            <SecondaryLink href="#outcomes">View impact metrics</SecondaryLink>
            <SecondaryLink href="/farm">University farm</SecondaryLink>
          </div>
          <dl className="mt-8 grid gap-2 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-md border border-border bg-surface-subtle px-3 py-3">
                <dt className="text-[11px] font-semibold uppercase text-muted-foreground">{stat.label}</dt>
                <dd className="mt-1 text-xl font-semibold text-foreground">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative min-h-[320px] overflow-hidden border-t border-border lg:min-h-full lg:border-l lg:border-t-0">
          <Image
            src="/images/research/sustainability-hero-imagegen.webp"
            alt="Sustainability research landscape with conservation and food systems work"
            fill
            priority
            sizes="(min-width: 1024px) 42vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.05)_0%,rgba(15,23,42,0.58)_100%)]" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <p className="max-w-md text-sm font-semibold leading-6">Published records connect initiatives, outcomes, stories, partners, and public activities.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingTabs({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav className="sticky top-0 z-20 border-b border-border bg-white/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8 xl:px-10 2xl:px-12" aria-label="Sustainability sections">
      <div className="mx-auto flex max-w-[1680px] gap-2 overflow-x-auto">
        {items.map((item) => (
          <a key={item.href} href={item.href} className="shrink-0 rounded-md border border-border bg-white px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary/30 hover:text-primary">
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function FeaturedInitiatives({ records }: { records: ResearchGenericRecord[] }) {
  const featured = records.filter((record) => record.is_featured).slice(0, 3);
  const displayRecords = (featured.length > 0 ? featured : records).slice(0, 3);

  if (displayRecords.length === 0) {
    return <StatusMessage>No sustainability records are published yet.</StatusMessage>;
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {displayRecords.map((record) => (
        <article key={record.id} className="flex min-h-[250px] flex-col rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <Badge>{formatLabel(record.initiative_type ?? "sustainability")}</Badge>
            {record.status ? <Badge>{formatLabel(record.status)}</Badge> : null}
          </div>
          <h2 className="mt-5 text-xl font-semibold leading-7 text-foreground">
            {record.slug ? <Link href={`/sustainability/${record.slug}`} className="transition hover:text-primary">{getRecordTitle(record, "Sustainability initiative")}</Link> : getRecordTitle(record, "Sustainability initiative")}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{getRecordSummary(record) || compactText(record.objectives) || compactText(record.impact) || "Published details will appear when the research office updates this record."}</p>
          <div className="mt-auto pt-5 text-sm font-semibold text-primary">
            {record.slug ? <Link href={`/sustainability/${record.slug}`}>Open initiative</Link> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function SustainabilityFilters({
  params,
  years,
  months,
}: {
  params: SustainabilitySearchParams;
  years: string[];
  months: Array<{ value: string; label: string }>;
}) {
  return (
    <ResearchFilterForm
      action="/sustainability"
      resetHref="/sustainability"
      searchValue={params.q}
      searchPlaceholder="Initiative name, climate theme, public impact"
      selects={[
        { name: "type", label: "Type", value: params.type, options: sustainabilityTypes },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: sustainabilityStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function InitiativeRow({ initiative }: { initiative: ResearchGenericRecord }) {
  const sdgGoals = Array.isArray(initiative.sdg_goals) ? initiative.sdg_goals : [];

  return (
    <ResearchRecordRow
      href={initiative.slug ? `/sustainability/${initiative.slug}` : "/sustainability"}
      title={getRecordTitle(initiative, "Sustainability initiative")}
      description={getRecordSummary(initiative) || compactText(initiative.objectives) || compactText(initiative.impact) || "Sustainability profile has not been published yet."}
      badges={[initiative.initiative_type ?? "sustainability", initiative.status]}
      filledBadges={[initiative.is_featured ? "Featured" : null]}
      facts={[
        { label: "Timeline", value: getRecordTimelineLabel(initiative) },
        { label: "SDGs", value: sdgGoals.join(", ") },
        { label: "Contact", value: compactText(initiative.contact_email) },
      ]}
    />
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}

function MetricPanel({ records }: { records: ResearchGenericRecord[] }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Metrics</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {records.map((record) => (
          <div key={record.id} className="rounded-md bg-surface-subtle p-4">
            <p className="text-2xl font-bold text-primary">
              {compactText(record.value)}
              {record.unit ? <span className="text-base"> {compactText(record.unit)}</span> : null}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-foreground">
              {compactText(record.name) || compactText(record.title)}
            </p>
            {record.reporting_year ? (
              <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">
                {compactText(record.reporting_year)}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function StoryPanel({ records }: { records: ResearchGenericRecord[] }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">Stories</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 5).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-base font-semibold leading-6 text-foreground">
              {compactText(record.title) || compactText(record.name)}
            </h3>
            {compactText(record.summary) || compactText(record.impact) ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {compactText(record.summary) || compactText(record.impact)}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function RecordListPanel({
  title,
  records,
  dateField,
}: {
  title: string;
  records: ResearchGenericRecord[];
  dateField?: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 8).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap gap-2">
              {record.partner_type ? <Badge>{formatLabel(record.partner_type)}</Badge> : null}
              {record.event_type ? <Badge>{formatLabel(record.event_type)}</Badge> : null}
              {record.status ? <Badge>{formatLabel(record.status)}</Badge> : null}
            </div>
            <h3 className="mt-3 text-base font-semibold leading-6 text-foreground">
              {compactText(record.name) || compactText(record.title)}
            </h3>
            {compactText(record.about) || compactText(record.summary) ? (
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {compactText(record.about) || compactText(record.summary)}
              </p>
            ) : null}
            {dateField && record[dateField] ? (
              <p className="mt-2 text-xs font-semibold uppercase text-muted-foreground">
                {formatDate(record[dateField] as string)}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function ErrorBand({ errors }: { errors: string[] }) {
  const uniqueErrors = Array.from(new Set(errors));

  return (
    <section className="px-4 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1680px] flex-col gap-3">
        {uniqueErrors.map((error) => (
          <StatusMessage key={error} tone="error">
            {error}
          </StatusMessage>
        ))}
      </div>
    </section>
  );
}
