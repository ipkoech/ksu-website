import {
  ResearchPageHero,
  ResearchPageSummary,
} from "../../components/research-page-hero";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

import { ArrowRight, Database, Filter, LineChart, Search } from "lucide-react";
import { researchServiceApi } from "@ksu/api-client/server";
import type { ResearchGenericRecord } from "@ksu/api-client/server";
import { StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getImpactMetrics,
  getImpactMetricsFiltered,
} from "../../lib/research-public-data";
import {
  getRecordSummary,
  getRecordTitle,
  getRecordYears,
} from "../../lib/research-page-model";
import {
  ImpactMetricTable,
  type ImpactMetricRowDto,
} from "../../components/impact-metric-table";

export const metadata = {
  title: "Impact Metrics | KSU Research",
  description:
    "Research impact metrics, statistics, and performance indicators.",
};

export const revalidate = 300;

type MetricSearchParams = {
  q?: string;
  category?: string;
  type?: string;
  active?: string;
  year?: string;
  sort?: string;
};

type StatItem = {
  key: string;
  label: string;
  value: number;
  description: string;
  href?: string | null;
};

const metricTypes = ["input", "output", "outcome", "impact"];
const metricCategories = [
  "research",
  "innovation",
  "capacity",
  "community",
  "economic",
  "environmental",
  "policy",
];
const sortOptions = [
  { value: "reporting_year", label: "Reporting year" },
  { value: "value", label: "Value" },
  { value: "name", label: "Name" },
  { value: "created_at", label: "Newest" },
];

export default async function ImpactDashboardPage({
  searchParams,
}: {
  searchParams?: Promise<MetricSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const activeFlags = getActiveFlags(params.active);
  const sort = params.sort || "reporting_year";
  const [statsResponse, metrics, allMetrics] = await Promise.all([
    getResearchStats(),
    getImpactMetricsFiltered({
      search: params.q,
      category: params.category,
      metricType: params.type,
      year: params.year,
      sort,
      order: sort === "name" ? "asc" : "desc",
      ...activeFlags,
    }),
    getImpactMetrics(),
  ]);
  const years = getRecordYears(allMetrics.data);
  const stats = statsResponse.stats;
  const visibleStats = stats
    .filter((item) => Number(item.value) > 0)
    .slice(0, 8);
  const featuredMetric =
    metrics.data.find((item) => item.is_featured) ?? metrics.data[0];
  const metricRows: ImpactMetricRowDto[] = metrics.data.map((metric) => ({
    id: String(
      metric.id ?? metric.slug ?? getRecordTitle(metric, "Impact metric"),
    ),
    title: getRecordTitle(metric, "Impact metric"),
    summary: getRecordSummary(metric),
    category: formatLabel(compactText(metric.category) || "metric"),
    value: formatMetricValue(metric) || "Not published",
    period:
      compactText(metric.reporting_year) ||
      formatDate(metric.period_end) ||
      "Not published",
    source: compactText(metric.data_source) || "Not published",
    linkedWork: linkedWork(metric) || "Not linked",
  }));

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ImpactMetricsHero
        statCount={visibleStats.length}
        metricCount={metrics.data.length}
      />

      <section className="border-b border-border bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <ImpactMetricFilters params={params} years={years} />
            {[statsResponse.error, metrics.error, allMetrics.error]
              .filter(Boolean)
              .map((error) => (
                <div key={error} className="mt-4">
                  <StatusMessage tone="error">{error}</StatusMessage>
                </div>
              ))}
            {visibleStats.length > 0 ? (
              <StatChipGrid stats={visibleStats} />
            ) : null}
            <CategoryBands metrics={metrics.data} stats={stats} />
            {metrics.data.length > 0 ? (
              <ImpactMetricTable records={metricRows} />
            ) : null}
          </div>
          <aside className="grid gap-4 xl:sticky xl:top-28 xl:self-start">
            {featuredMetric ? (
              <MetricEvidencePanel metric={featuredMetric} />
            ) : null}
            <MetricQuickLinks />
          </aside>
        </div>
      </section>
    </main>
  );
}

async function getResearchStats(): Promise<{
  stats: StatItem[];
  error: string | null;
}> {
  try {
    const response = await researchServiceApi.stats();
    const stats = (
      (response as { data?: { stats?: StatItem[] } }).data?.stats ?? []
    ).filter(Boolean);
    return { stats, error: null };
  } catch {
    noStore();
    return {
      stats: [],
      error: "Impact statistics are temporarily unavailable.",
    };
  }
}

function ImpactMetricsHero({
  statCount,
  metricCount,
}: {
  statCount: number;
  metricCount: number;
}) {
  return (
    <>
      <ResearchPageHero
        title="Impact Metrics"
        eyebrow="Impact"
        description="Published indicators, reporting periods, data sources, and linked research work in one dashboard."
        imageSrc="/images/research/headers/innovation-week-8147.jpg"
        imageAlt="Kisii University Innovation Week"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Impact Metrics" },
        ]}
      />
      <ResearchPageSummary
        actions={[]}
        facts={[
          { label: "Live indicators", value: statCount },
          { label: "Metric records", value: metricCount },
        ].filter((fact) => fact.value > 0)}
      ></ResearchPageSummary>
    </>
  );
}

function ImpactMetricFilters({
  params,
  years,
}: {
  params: MetricSearchParams;
  years: string[];
}) {
  return (
    <form
      action="/impact-metrics"
      className="mb-5 rounded-lg border border-border bg-white p-3 shadow-sm"
    >
      <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto]">
        <label className="relative block">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70"
          />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search metrics by name, source, methodology..."
            className="h-11 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm font-medium text-foreground outline-none ring-primary/20 transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white"
        >
          Search
        </button>
        <details className="group relative">
          <summary className="inline-flex h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-foreground">
            <Filter aria-hidden className="h-4 w-4" /> Filter
          </summary>
          <div className="absolute right-0 z-20 mt-2 grid w-[320px] gap-3 rounded-lg border border-border bg-white p-4 shadow-xl">
            <SelectField
              name="category"
              label="Category"
              value={params.category}
              options={metricCategories}
            />
            <SelectField
              name="type"
              label="Metric type"
              value={params.type}
              options={metricTypes}
            />
            <SelectField
              name="year"
              label="Year"
              value={params.year}
              options={years}
            />
            <SelectField
              name="active"
              label="Active state"
              value={params.active}
              options={["active", "inactive", "featured"]}
            />
          </div>
        </details>
        <details className="group relative">
          <summary className="inline-flex h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-foreground">
            <LineChart aria-hidden className="h-4 w-4" /> Sort
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-[260px] rounded-lg border border-border bg-white p-4 shadow-xl">
            <SelectField
              name="sort"
              label="Sort"
              value={params.sort}
              options={sortOptions}
              includeBlank={false}
            />
          </div>
        </details>
      </div>
    </form>
  );
}

function StatChipGrid({ stats }: { stats: StatItem[] }) {
  return (
    <section className="mb-5 rounded-lg border border-border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        Impact at a glance
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.key}
            href={stat.href ?? "/impact-metrics"}
            className="rounded-lg border border-border bg-surface-subtle p-3 transition hover:border-primary/35 hover:bg-white"
          >
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {stat.value.toLocaleString()}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
              {stat.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MetricEvidencePanel({ metric }: { metric: ResearchGenericRecord }) {
  const progress = getProgress(metric);
  const items = [
    { label: "Data source", value: compactText(metric.data_source) },
    { label: "Methodology", value: compactText(metric.methodology) },
    {
      label: "Period",
      value: [formatDate(metric.period_start), formatDate(metric.period_end)]
        .filter(Boolean)
        .join(" - "),
    },
    { label: "Reporting year", value: compactText(metric.reporting_year) },
  ].filter((item) => item.value);

  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Database aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
            Evidence quality
          </p>
          <h2 className="text-base font-semibold text-foreground">
            {getRecordTitle(metric, "Impact metric")}
          </h2>
        </div>
      </div>
      <div className="mt-4 rounded-md bg-surface-subtle p-3">
        <div className="flex items-end justify-between gap-3">
          <span className="text-sm font-semibold text-muted-foreground">
            Baseline to target
          </span>
          <span className="text-sm font-semibold text-primary">
            {progress}%
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-surface-muted">
          <div
            className="h-2 rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      {items.length > 0 ? (
        <dl className="mt-4 divide-y divide-border">
          {items.map((item) => (
            <div key={item.label} className="py-3 first:pt-0 last:pb-0">
              <dt className="text-xs font-semibold uppercase text-muted-foreground">
                {item.label}
              </dt>
              <dd className="mt-1 text-sm leading-6 text-muted-foreground">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

function CategoryBands({
  metrics,
  stats,
}: {
  metrics: ResearchGenericRecord[];
  stats: StatItem[];
}) {
  const bands = metricCategories
    .map((category) => {
      const count = metrics.filter(
        (metric) => compactText(metric.category) === category,
      ).length;
      const statValue =
        stats.find((stat) => stat.key.includes(category))?.value ?? 0;
      return { category, value: count || statValue };
    })
    .filter((band) => band.value > 0);

  if (bands.length === 0) return null;

  const max = Math.max(...bands.map((band) => band.value), 1);
  return (
    <section className="mb-5 rounded-lg border border-border bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        Performance by category
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {bands.map((band) => (
          <div
            key={band.category}
            className="rounded-lg border border-border p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-foreground">
                {formatLabel(band.category)}
              </span>
              <span className="text-sm font-semibold text-primary">
                {band.value.toLocaleString()}
              </span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-surface-muted">
              <div
                className="h-2 rounded-full bg-secondary"
                style={{
                  width: `${Math.max(10, Math.round((band.value / max) * 100))}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MetricQuickLinks() {
  const links = [
    { label: "Community stories", href: "/community-impact" },
    { label: "Projects", href: "/projects" },
    { label: "Programs", href: "/programs" },
    { label: "Consultancies", href: "/consultancies" },
  ];
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        Trace evidence
      </p>
      <div className="mt-3 divide-y divide-border">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between gap-4 py-3 text-sm font-semibold text-primary"
          >
            {link.label}
            <ArrowRight
              aria-hidden
              className="h-4 w-4 text-muted-foreground/70"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

function SelectField({
  name,
  label,
  value,
  options,
  includeBlank = true,
}: {
  name: string;
  label: string;
  value?: string;
  options: Array<string | { value: string; label: string }>;
  includeBlank?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-10 w-full rounded-md border border-border bg-white px-3 text-sm font-medium text-foreground"
      >
        {includeBlank ? (
          <option value="">All {label.toLowerCase()}</option>
        ) : null}
        {options.map((option) => {
          const normalized =
            typeof option === "string"
              ? { value: option, label: formatLabel(option) }
              : option;
          return (
            <option
              key={`${name}-${normalized.value}`}
              value={normalized.value}
            >
              {normalized.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

function getProgress(metric: ResearchGenericRecord) {
  const value = Number(metric.value ?? 0);
  const baseline = Number(metric.baseline_value ?? 0);
  const target = Number(metric.target_value ?? 0);
  if (!target || Number.isNaN(value) || Number.isNaN(target)) return 0;
  const progress = ((value - baseline) / Math.max(target - baseline, 1)) * 100;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

function formatMetricValue(metric: ResearchGenericRecord) {
  const value = compactText(metric.value);
  return [value, compactText(metric.unit)].filter(Boolean).join(" ");
}

function linkedWork(metric: ResearchGenericRecord) {
  if (metric.project_id) return "Project";
  if (metric.program_id) return "Program";
  if (metric.center_id) return "Center";
  return "";
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
