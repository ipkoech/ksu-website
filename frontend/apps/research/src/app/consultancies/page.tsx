import type { Metadata } from "next";
import Link from "next/link";
import { ResearchFilterForm, ResearchRecordRow } from "../../components/research-listing";
import {
  Badge,
  FilledBadge,
  PrimaryLink,
  ResearchSection,
  SecondaryLink,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getCenters,
  getConsultancies,
  getConsultanciesFiltered,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getRecordMonths,
  getRecordSummary,
  getRecordTimelineLabel,
  getRecordTitle,
  getRecordYears,
} from "../../lib/research-page-model";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Consultancies",
  description: "Consultancy services and expert engagement records.",
};

type ConsultancySearchParams = {
  q?: string;
  type?: string;
  client?: string;
  status?: string;
  center?: string;
  active?: string;
  year?: string;
  month?: string;
  sort?: string;
};

const consultancyTypes = ["research", "technical", "policy", "evaluation", "training", "advisory"];
const clientTypes = ["government", "ngo", "corporate", "international", "academic"];
const consultancyStatuses = ["proposal", "awarded", "ongoing", "completed", "cancelled"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { value: "start_date", label: "Start date" },
  { value: "created_at", label: "Newest" },
  { value: "updated_at", label: "Recently updated" },
  { value: "contract_value", label: "Value" },
  { value: "title", label: "Title A-Z" },
];

export default async function ConsultanciesPage({
  searchParams,
}: {
  searchParams?: Promise<ConsultancySearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "start_date";
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [consultancies, allConsultancies, centers] = await Promise.all([
    getConsultanciesFiltered({
      search: params.q,
      consultancyType: params.type,
      clientType: params.client,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort,
      order,
      ...activeFlags,
    }),
    getConsultancies(),
    getCenters(),
  ]);
  const years = getRecordYears(allConsultancies.data);
  const months = getRecordMonths(allConsultancies.data, params.year);
  const visibleConsultancies = filterRecordsByMonth(consultancies.data, params.year, params.month);
  const featuredConsultancy = visibleConsultancies.find((consultancy) => consultancy.is_featured);
  const rowConsultancies = featuredConsultancy
    ? visibleConsultancies.filter((consultancy) => consultancy.id !== featuredConsultancy.id)
    : visibleConsultancies;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ConsultanciesMasthead
        resultCount={visibleConsultancies.length}
        publishedCount={allConsultancies.data.length}
        centersCount={centers.data.length}
        serviceTypeCount={consultancyTypes.length}
      />

      <ResearchSection
        eyebrow="Expert Services"
        title="Consultancy records"
        body="Search first, then use the filter menu for service type, client, active state, status, year, month, center, and sort order."
        tone="white"
      >
        <ConsultancyFilters
          params={params}
          years={years}
          months={months}
          centers={centers.data}
        />

        {[consultancies.error, allConsultancies.error, centers.error].filter(Boolean).map((error) => (
          <div key={error} className="mt-5">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        ))}

        {visibleConsultancies.length > 0 ? (
          <>
            {featuredConsultancy ? (
              <div className="mt-6">
                <FeaturedConsultancy consultancy={featuredConsultancy} />
              </div>
            ) : null}
            <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {rowConsultancies.map((consultancy) => (
                <ConsultancyRow key={consultancy.id} consultancy={consultancy} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-7">
            <StatusMessage>No consultancies match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>
    </main>
  );
}

function ConsultanciesMasthead({
  resultCount,
  publishedCount,
  centersCount,
  serviceTypeCount,
}: {
  resultCount: number;
  publishedCount: number;
  centersCount: number;
  serviceTypeCount: number;
}) {
  const stats = [
    { label: "Consultancy results", value: resultCount },
    { label: "Published consultancies", value: publishedCount },
    { label: "Centers", value: centersCount },
    { label: "Service types", value: serviceTypeCount },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href="/innovations" className="transition hover:text-primary">Innovation & Partnerships</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Consultancies</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Innovation & Partnerships</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">Applied expert services, commissioned studies, advisory work, and evaluation engagements</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">Browse the client need, university expertise, delivery window, value, and public outcomes behind each published consultancy record.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/partners">View partners</PrimaryLink>
            <SecondaryLink href="/services">Research services</SecondaryLink>
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

function ConsultancyFilters({
  params,
  years,
  months,
  centers,
}: {
  params: ConsultancySearchParams;
  years: string[];
  months: Array<{ value: string; label: string }>;
  centers: ResearchGenericRecord[];
}) {
  return (
    <ResearchFilterForm
      action="/consultancies"
      resetHref="/consultancies"
      searchValue={params.q}
      searchPlaceholder="Title, client, outcomes, impact"
      selects={[
        { name: "type", label: "Type", value: params.type, options: consultancyTypes },
        { name: "client", label: "Client", value: params.client, options: clientTypes },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: consultancyStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      centers={centers}
      centerValue={params.center}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function FeaturedConsultancy({ consultancy }: { consultancy: ResearchGenericRecord }) {
  return (
    <Link
      href={consultancy.slug ? `/consultancies/${consultancy.slug}` : "/consultancies"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(consultancy.consultancy_type ?? "consultancy")}</Badge>
          {consultancy.client_type ? <Badge>{formatLabel(consultancy.client_type)}</Badge> : null}
          <FilledBadge>Featured</FilledBadge>
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
          {getRecordTitle(consultancy, "Consultancy")}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {getRecordSummary(consultancy) ||
            compactText(consultancy.objectives) ||
            compactText(consultancy.outcomes) ||
            "Consultancy scope has not been published yet."}
        </p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Client</dt>
          <dd className="mt-1 font-semibold text-slate-950">{compactText(consultancy.client_name) || "Not published"}</dd>
        </div>
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Start</dt>
          <dd className="mt-1 font-semibold text-slate-950">{formatDate(consultancy.start_date) || "Not published"}</dd>
        </div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">
        Open consultancy
      </span>
    </Link>
  );
}

function ConsultancyRow({ consultancy }: { consultancy: ResearchGenericRecord }) {
  return (
    <ResearchRecordRow
      href={consultancy.slug ? `/consultancies/${consultancy.slug}` : "/consultancies"}
      title={getRecordTitle(consultancy, "Consultancy")}
      description={
        getRecordSummary(consultancy) ||
        compactText(consultancy.objectives) ||
        compactText(consultancy.outcomes) ||
        "Consultancy scope has not been published yet."
      }
      badges={[consultancy.consultancy_type ?? "consultancy", consultancy.client_type, consultancy.status]}
      filledBadges={[consultancy.is_featured ? "Featured" : null]}
      facts={[
        { label: "Client", value: compactText(consultancy.client_name) },
        { label: "Start", value: formatDate(consultancy.start_date) },
        { label: "Timeline", value: getRecordTimelineLabel(consultancy) },
      ]}
    />
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
