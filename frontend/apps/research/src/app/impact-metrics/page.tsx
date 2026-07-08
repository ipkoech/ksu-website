import Link from "next/link";
import { ArrowRight, Database, Filter, LineChart, Search } from "lucide-react";
import { researchServiceApi } from "@ksu/api-client";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Badge, StatusMessage } from "../../components/research-ui";
import { compactText, formatDate, formatLabel, getImpactMetrics, getImpactMetricsFiltered } from "../../lib/research-public-data";
import { getRecordSummary, getRecordTitle, getRecordYears } from "../../lib/research-page-model";

export const metadata = {
  title: "Impact Metrics | KSU Research",
  description: "Research impact metrics, statistics, and performance indicators.",
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
const metricCategories = ["research", "innovation", "capacity", "community", "economic", "environmental", "policy"];
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
  const visibleStats = stats.filter((item) => Number(item.value) > 0).slice(0, 8);
  const featuredMetric = metrics.data.find((item) => item.is_featured) ?? metrics.data[0];

  const heroImage = "/images/research/research-demo-imagegen.webp";

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ImpactMetricsHero statCount={visibleStats.length} metricCount={metrics.data.length} heroImage={heroImage} />

      <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <ImpactMetricFilters params={params} years={years} />
            {[statsResponse.error, metrics.error, allMetrics.error].filter(Boolean).map((error) => (
              <div key={error} className="mt-4">
                <StatusMessage tone="error">{error}</StatusMessage>
              </div>
            ))}
            {visibleStats.length > 0 ? <StatChipGrid stats={visibleStats} /> : null}
            <CategoryBands metrics={metrics.data} stats={stats} />
            {metrics.data.length > 0 ? <MetricRecordTable records={metrics.data} /> : null}
          </div>
          <aside className="grid gap-4 xl:sticky xl:top-28 xl:self-start">
            {featuredMetric ? <MetricEvidencePanel metric={featuredMetric} /> : null}
            <MetricQuickLinks />
          </aside>
        </div>
      </section>
    </main>
  );
}

async function getResearchStats(): Promise<{ stats: StatItem[]; error: string | null }> {
  try {
    const response = await researchServiceApi.stats();
    const stats = ((response as { data?: { stats?: StatItem[] } }).data?.stats ?? []).filter(Boolean);
    return { stats, error: null };
  } catch {
    return { stats: [], error: null };
  }
}

function ImpactMetricsHero({
  statCount,
  metricCount,
  heroImage,
}: {
  statCount: number;
  metricCount: number;
  heroImage?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-slate-200 bg-[#061f41] px-4 py-8 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(2,22,50,0.96),rgba(0,82,70,0.78)),radial-gradient(circle_at_78%_28%,rgba(245,158,11,0.22),transparent_24%)]" />
      <MetricIllustration />
      <div className="relative mx-auto max-w-[1680px]">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/70" aria-label="Breadcrumb">
          <Link href="/" className="transition hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/community-impact" className="transition hover:text-white">Community Impact</Link>
          <span>/</span>
          <span className="text-white">Impact Metrics</span>
        </nav>
        <p className="inline-flex rounded-md border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
          Evidence Dashboard
        </p>
        <h1 className="mt-4 max-w-4xl text-balance font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl">
          Impact metrics that connect evidence to public value
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-sm leading-7 text-white/82 sm:text-base">
          Published indicators, reporting periods, data sources, and linked research work in one compact dashboard.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/15 bg-white/10 p-2 shadow-2xl backdrop-blur lg:ml-auto lg:max-w-[360px]">
          <img src={heroImage || "/images/research/research-demo-imagegen.webp"} alt="Impact metrics dashboard" className="h-48 w-full rounded-xl object-cover" />
        </div>
        {[statCount, metricCount].some((value) => value > 0) ? (
          <dl className="mt-5 flex flex-wrap gap-2">
            {statCount > 0 ? <HeroChip label="Live indicators" value={statCount} /> : null}
            {metricCount > 0 ? <HeroChip label="Metric records" value={metricCount} /> : null}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

function ImpactMetricFilters({ params, years }: { params: MetricSearchParams; years: string[] }) {
  return (
    <form action="/impact-metrics" className="mb-5 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid gap-2 lg:grid-cols-[minmax(220px,1fr)_auto_auto_auto]">
        <label className="relative block">
          <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search metrics by name, source, methodology..."
            className="h-11 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm font-medium text-slate-950 outline-none ring-primary/20 transition placeholder:text-slate-400 focus:border-primary focus:ring-4"
          />
        </label>
        <button type="submit" className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white">
          Search
        </button>
        <details className="group relative">
          <summary className="inline-flex h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800">
            <Filter aria-hidden className="h-4 w-4" /> Filter
          </summary>
          <div className="absolute right-0 z-20 mt-2 grid w-[320px] gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
            <SelectField name="category" label="Category" value={params.category} options={metricCategories} />
            <SelectField name="type" label="Metric type" value={params.type} options={metricTypes} />
            <SelectField name="year" label="Year" value={params.year} options={years} />
            <SelectField name="active" label="Active state" value={params.active} options={["active", "inactive", "featured"]} />
          </div>
        </details>
        <details className="group relative">
          <summary className="inline-flex h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800">
            <LineChart aria-hidden className="h-4 w-4" /> Sort
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-[260px] rounded-lg border border-slate-200 bg-white p-4 shadow-xl">
            <SelectField name="sort" label="Sort" value={params.sort} options={sortOptions} includeBlank={false} />
          </div>
        </details>
      </div>
    </form>
  );
}

function StatChipGrid({ stats }: { stats: StatItem[] }) {
  return (
    <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Impact at a glance</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.key} href={stat.href ?? "/impact-metrics"} className="rounded-lg border border-slate-200 bg-slate-50 p-3 transition hover:border-primary/35 hover:bg-white">
            <p className="text-xs font-semibold uppercase text-slate-500">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{stat.value.toLocaleString()}</p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{stat.description}</p>
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
    { label: "Period", value: [formatDate(metric.period_start), formatDate(metric.period_end)].filter(Boolean).join(" - ") },
    { label: "Reporting year", value: compactText(metric.reporting_year) },
  ].filter((item) => item.value);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Database aria-hidden className="h-5 w-5" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Evidence quality</p>
          <h2 className="text-base font-semibold text-slate-950">{getRecordTitle(metric, "Impact metric")}</h2>
        </div>
      </div>
      <div className="mt-4 rounded-md bg-slate-50 p-3">
        <div className="flex items-end justify-between gap-3">
          <span className="text-sm font-semibold text-slate-700">Baseline to target</span>
          <span className="text-sm font-semibold text-primary">{progress}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>
      {items.length > 0 ? (
        <dl className="mt-4 divide-y divide-slate-200">
          {items.map((item) => (
            <div key={item.label} className="py-3 first:pt-0 last:pb-0">
              <dt className="text-xs font-semibold uppercase text-slate-500">{item.label}</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-700">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}

function CategoryBands({ metrics, stats }: { metrics: ResearchGenericRecord[]; stats: StatItem[] }) {
  const bands = metricCategories
    .map((category) => {
      const count = metrics.filter((metric) => compactText(metric.category) === category).length;
      const statValue = stats.find((stat) => stat.key.includes(category))?.value ?? 0;
      return { category, value: count || statValue };
    })
    .filter((band) => band.value > 0);

  if (bands.length === 0) return null;

  const max = Math.max(...bands.map((band) => band.value), 1);
  return (
    <section className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Performance by category</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {bands.map((band) => (
          <div key={band.category} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-slate-950">{formatLabel(band.category)}</span>
              <span className="text-sm font-semibold text-primary">{band.value.toLocaleString()}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-secondary" style={{ width: `${Math.max(10, Math.round((band.value / max) * 100))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MetricRecordTable({ records }: { records: ResearchGenericRecord[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">Published metric records</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.14em] text-slate-500">
            <tr>
              <th className="px-4 py-3">Metric</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Period</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Linked work</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {records.map((metric) => (
              <tr key={metric.id ?? metric.slug} className="transition hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-950">{getRecordTitle(metric, "Impact metric")}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-slate-500">{getRecordSummary(metric)}</p>
                </td>
                <td className="px-4 py-3"><Badge>{formatLabel(compactText(metric.category) || "metric")}</Badge></td>
                <td className="px-4 py-3 font-semibold text-primary">{formatMetricValue(metric)}</td>
                <td className="px-4 py-3 text-slate-600">{compactText(metric.reporting_year) || formatDate(metric.period_end)}</td>
                <td className="px-4 py-3 text-slate-600">{compactText(metric.data_source)}</td>
                <td className="px-4 py-3 text-slate-600">{linkedWork(metric)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">Trace evidence</p>
      <div className="mt-3 divide-y divide-slate-200">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="flex items-center justify-between gap-4 py-3 text-sm font-semibold text-primary">
            {link.label}
            <ArrowRight aria-hidden className="h-4 w-4 text-slate-400" />
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
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select name={name} defaultValue={value ?? ""} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950">
        {includeBlank ? <option value="">All {label.toLowerCase()}</option> : null}
        {options.map((option) => {
          const normalized = typeof option === "string" ? { value: option, label: formatLabel(option) } : option;
          return <option key={`${name}-${normalized.value}`} value={normalized.value}>{normalized.label}</option>;
        })}
      </select>
    </label>
  );
}

function HeroChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/15 bg-white/10 px-4 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/65">{label}</dt>
      <dd className="mt-1 text-xl font-semibold text-white">{value.toLocaleString()}</dd>
    </div>
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

function MetricIllustration() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 opacity-55 lg:block">
      <svg viewBox="0 0 760 360" className="h-full w-full" role="img" aria-label="Impact metrics illustration">
        <path d="M80 282 H690" stroke="#ffffff" strokeOpacity="0.12" />
        <path d="M120 76 V302" stroke="#ffffff" strokeOpacity="0.08" />
        <path d="M120 252 C222 208 280 224 356 164 C448 92 540 122 650 72" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
        {[170, 260, 350, 440, 530, 620].map((x, index) => (
          <rect key={x} x={x} y={244 - index * 22} width="42" height={58 + index * 22} rx="8" fill="#ffffff" opacity={0.08 + index * 0.025} />
        ))}
        <circle cx="596" cy="104" r="80" fill="#00a86b" opacity="0.12" />
        <circle cx="352" cy="164" r="10" fill="#f59e0b" />
        <circle cx="650" cy="72" r="10" fill="#f59e0b" />
      </svg>
    </div>
  );
}
