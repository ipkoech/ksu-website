import type { Metadata } from "next";
import type { ResearchGenericRecord } from "@ksu/api-client";
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

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <SustainabilityMasthead
        initiativeCount={visibleInitiatives.length}
        partnerCount={partners.data.length}
        activityCount={activities.data.length}
        metricCount={metrics.data.length}
      />

      {errors.length > 0 ? <ErrorBand errors={errors} /> : null}

      <ResearchSection
        eyebrow="Initiatives"
        title="Sustainability and climate records"
        body="Search first, then use the filter menu for initiative type, active state, status, year, month, and sort order."
        tone="white"
      >
        <SustainabilityFilters
          params={params}
          years={getRecordYears(initiatives.data)}
          months={getRecordMonths(initiatives.data, params.year)}
        />
        {visibleInitiatives.length > 0 ? (
          <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
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

      {metrics.data.length > 0 || stories.data.length > 0 ? (
        <ResearchSection
          eyebrow="Impact"
          title="Measured sustainability outcomes"
          body="Impact metrics and success stories show the public evidence behind sustainability work."
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            {metrics.data.length > 0 ? <MetricPanel records={metrics.data} /> : null}
            {stories.data.length > 0 ? <StoryPanel records={stories.data} /> : null}
          </div>
        </ResearchSection>
      ) : null}

      {partners.data.length > 0 || activities.data.length > 0 ? (
        <ResearchSection
          eyebrow="Delivery Network"
          title="Partners and public activities"
          body="Partner and event records show who is involved and where sustainability work is happening."
          tone="white"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {partners.data.length > 0 ? (
              <RecordListPanel title="Partners" records={partners.data} />
            ) : null}
            {activities.data.length > 0 ? (
              <RecordListPanel title="Activities" records={activities.data} dateField="start_date" />
            ) : null}
          </div>
        </ResearchSection>
      ) : null}
    </main>
  );
}

function SustainabilityMasthead({
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
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Sustainability</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Sustainability</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">Climate, conservation, water, food systems, and public impact initiatives</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">Browse sustainability records with partner, activity, story, and metric evidence from the backend.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/community-impact">Community impact</PrimaryLink>
            <SecondaryLink href="/farm">University farm</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase text-slate-500">{stat.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Metrics</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {records.map((record) => (
          <div key={record.id} className="rounded-md bg-slate-50 p-4">
            <p className="text-2xl font-bold text-primary">
              {compactText(record.value)}
              {record.unit ? <span className="text-base"> {compactText(record.unit)}</span> : null}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
              {compactText(record.name) || compactText(record.title)}
            </p>
            {record.reporting_year ? (
              <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Stories</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 5).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-base font-semibold leading-6 text-slate-950">
              {compactText(record.title) || compactText(record.name)}
            </h3>
            {compactText(record.summary) || compactText(record.impact) ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 8).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap gap-2">
              {record.partner_type ? <Badge>{formatLabel(record.partner_type)}</Badge> : null}
              {record.event_type ? <Badge>{formatLabel(record.event_type)}</Badge> : null}
              {record.status ? <Badge>{formatLabel(record.status)}</Badge> : null}
            </div>
            <h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">
              {compactText(record.name) || compactText(record.title)}
            </h3>
            {compactText(record.about) || compactText(record.summary) ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {compactText(record.about) || compactText(record.summary)}
              </p>
            ) : null}
            {dateField && record[dateField] ? (
              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
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
