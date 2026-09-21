import {
  ResearchPageHero,
  ResearchPageSummary,
} from "../../components/research-page-hero";
import type { Metadata } from "next";
import { ResearchImage } from "../../components/research-image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  FileText,
  Filter,
  Handshake,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import type { ResearchGenericRecord } from "@ksu/api-client/server";
import { Badge, StatusMessage } from "../../components/research-ui";
import {
  compactText,
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
  getListPageSize,
} from "../../lib/research-page-model";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ResearchListPagination } from "../../components/research-list-pagination";
import {
  ConsultancyTable as ConsultancyTableClient,
  type ConsultancyRowDto,
} from "../../components/consultancy-table";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Consultancies",
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
  page?: string;
};

const consultancyTypes = [
  "research",
  "technical",
  "policy",
  "evaluation",
  "training",
  "advisory",
];
const clientTypes = [
  "government",
  "ngo",
  "corporate",
  "international",
  "academic",
];
const consultancyStatuses = [
  "proposal",
  "awarded",
  "ongoing",
  "completed",
  "cancelled",
];
const sortOptions = [
  { value: "start_date", label: "Start date" },
  { value: "contract_value", label: "Value" },
  { value: "created_at", label: "Newest" },
  { value: "title", label: "Title A-Z" },
];

export default async function ConsultanciesPage({
  searchParams,
}: {
  searchParams?: Promise<ConsultancySearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const perPage = getListPageSize(12);
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
      page,
      perPage,
      ...activeFlags,
    }),
    getConsultancies(),
    getCenters(),
  ]);
  const years = getRecordYears(allConsultancies.data);
  const months = getRecordMonths(allConsultancies.data, params.year);
  const visibleConsultancies = filterRecordsByMonth(
    consultancies.data,
    params.year,
    params.month,
  );
  const featuredConsultancy = visibleConsultancies.find(
    (consultancy) => consultancy.is_featured,
  );
  const tableConsultancies = featuredConsultancy
    ? visibleConsultancies.filter(
        (consultancy) => consultancy.id !== featuredConsultancy.id,
      )
    : visibleConsultancies;
  const totalPages = Math.ceil(
    (params.month ? visibleConsultancies.length : consultancies.total) /
      consultancies.perPage,
  );
  const tableRows: ConsultancyRowDto[] = (
    featuredConsultancy ? tableConsultancies : visibleConsultancies
  ).map((consultancy) => ({
    id: String(
      consultancy.id ??
        consultancy.slug ??
        getRecordTitle(consultancy, "Consultancy"),
    ),
    slug: consultancy.slug ? String(consultancy.slug) : null,
    title: getRecordTitle(consultancy, "Consultancy"),
    summary:
      getRecordSummary(consultancy) || compactText(consultancy.outcomes) || "",
    image: getRecordImage(
      consultancy,
      "/images/research/verified/multidisciplinary-conference-2026.jpg",
    ),
    clientName: compactText(consultancy.client_name) || "Not published",
    type: formatLabel(
      compactText(consultancy.consultancy_type) || "consultancy",
    ),
    status: formatLabel(compactText(consultancy.status) || "active"),
    timeline: getRecordTimelineLabel(consultancy),
    value: formatMoney(consultancy.contract_value, consultancy.currency),
  }));

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ConsultancyPortfolioHero count={visibleConsultancies.length} />

      <section className="border-b border-border bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <ConsultancyFilters
              params={params}
              years={years}
              months={months}
              centers={centers.data}
            />
            {[consultancies.error, allConsultancies.error, centers.error]
              .filter(Boolean)
              .map((error) => (
                <div key={error} className="mt-4">
                  <StatusMessage tone="error">{error}</StatusMessage>
                </div>
              ))}
            {featuredConsultancy ? (
              <FeaturedConsultancy consultancy={featuredConsultancy} />
            ) : null}
            {visibleConsultancies.length > 0 ? (
              <ConsultancyTableClient records={tableRows} />
            ) : (
              <div className="mt-5">
                <StatusMessage>
                  No consultancies match the current filters.
                </StatusMessage>
              </div>
            )}
            {visibleConsultancies.length > 0 ? (
              <ResearchListPagination
                page={page}
                totalPages={totalPages}
                total={
                  params.month
                    ? visibleConsultancies.length
                    : consultancies.total
                }
                perPage={consultancies.perPage}
                path="/consultancies"
                params={params}
                className="mt-6"
              />
            ) : null}
          </div>
          <EngagementPathways />
        </div>
      </section>
    </main>
  );
}

function ConsultancyPortfolioHero({ count }: { count: number }) {
  return (
    <>
      <ResearchPageHero
        title="Consultancies"
        eyebrow="Support"
        description="Browse client needs, university expertise, delivery windows, values, and outcomes behind published consultancy engagements."
        imageSrc="/images/research/headers/innovation-week-8263.jpg"
        imageAlt="Kisii University Innovation Week"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Consultancies" }]}
      />
      <ResearchPageSummary
        actions={[]}
        facts={
          count > 0 ? [{ label: "Visible engagements", value: count }] : []
        }
      ></ResearchPageSummary>
    </>
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
    <form
      action="/consultancies"
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
            placeholder="Search title, client, outcomes, or impact..."
            className="h-11 w-full rounded-md border border-border bg-white pl-9 pr-3 text-sm font-medium text-foreground outline-none ring-primary/20 transition placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4"
          />
        </label>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-white"
        >
          Search
        </button>
        <details className="relative">
          <summary className="inline-flex h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-foreground">
            <Filter aria-hidden className="h-4 w-4" /> Filter
          </summary>
          <div className="absolute right-0 z-20 mt-2 grid w-[320px] gap-3 rounded-lg border border-border bg-white p-4 shadow-xl">
            <SelectField
              name="type"
              label="Type"
              value={params.type}
              options={consultancyTypes}
            />
            <SelectField
              name="client"
              label="Client"
              value={params.client}
              options={clientTypes}
            />
            <SelectField
              name="status"
              label="Status"
              value={params.status}
              options={consultancyStatuses}
            />
            <SelectField
              name="year"
              label="Year"
              value={params.year}
              options={years}
            />
            <SelectField
              name="month"
              label="Month"
              value={params.month}
              options={months}
            />
            <SelectField
              name="center"
              label="Center"
              value={params.center}
              options={centers.map((center) => ({
                value: compactText(center.id),
                label: getRecordTitle(center, "Center"),
              }))}
            />
            <SelectField
              name="active"
              label="Active state"
              value={params.active}
              options={["active", "inactive", "featured"]}
            />
          </div>
        </details>
        <details className="relative">
          <summary className="inline-flex h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-semibold text-foreground">
            <SlidersHorizontal aria-hidden className="h-4 w-4" /> Sort
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

function FeaturedConsultancy({
  consultancy,
}: {
  consultancy: ResearchGenericRecord;
}) {
  const href = consultancy.slug
    ? `/consultancies/${consultancy.slug}`
    : "/consultancies";
  const summary =
    getRecordSummary(consultancy) ||
    compactText(consultancy.objectives) ||
    compactText(consultancy.outcomes);
  const imageSrc = getRecordImage(
    consultancy,
    "/images/research/verified/multidisciplinary-conference-2026.jpg",
  );
  return (
    <Link
      href={href}
      className="group mb-5 grid gap-4 rounded-lg border border-primary/25 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/45 lg:grid-cols-[minmax(0,1fr)_220px]"
    >
      <div>
        <div className="mb-3 overflow-hidden rounded-lg border border-primary/15 bg-white/80">
          <ResearchImage
            src={imageSrc}
            alt={getRecordTitle(consultancy, "Consultancy")}
            width={640}
            height={256}
            className="h-32 w-full object-cover"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge>
            {formatLabel(
              compactText(consultancy.consultancy_type) || "consultancy",
            )}
          </Badge>
          {consultancy.client_type ? (
            <Badge>{formatLabel(consultancy.client_type)}</Badge>
          ) : null}
          <span className="rounded-md bg-primary px-3 py-1 text-xs font-semibold uppercase text-white">
            Featured
          </span>
        </div>
        <h2 className="mt-3 text-balance font-display text-2xl font-semibold leading-tight text-foreground">
          {getRecordTitle(consultancy, "Consultancy")}
        </h2>
        {summary ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
            {summary}
          </p>
        ) : null}
      </div>
      <dl className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-1">
        <MiniFact label="Client" value={compactText(consultancy.client_name)} />
        <MiniFact
          label="Value"
          value={formatMoney(consultancy.contract_value, consultancy.currency)}
        />
      </dl>
    </Link>
  );
}

function EngagementPathways() {
  const paths = [
    {
      label: "Advisory",
      body: "Technical and policy guidance for public and private clients.",
      icon: BriefcaseBusiness,
    },
    {
      label: "Evaluation",
      body: "Independent studies, audits, baseline and outcome reviews.",
      icon: FileText,
    },
    {
      label: "Partnerships",
      body: "Move from client need to collaborative implementation.",
      icon: Handshake,
    },
  ];
  return (
    <aside className="rounded-lg border border-border bg-white p-5 shadow-sm xl:sticky xl:top-28 xl:self-start">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
        Engagement pathways
      </p>
      <div className="mt-4 grid gap-3">
        {paths.map((path) => {
          const Icon = path.icon;
          return (
            <div
              key={path.label}
              className="flex gap-3 rounded-lg border border-border p-3"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  {path.label}
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {path.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 divide-y divide-border">
        {[
          { href: "/partners", label: "Partner network" },
          { href: "/services", label: "Research services" },
          { href: "/connect#partnership", label: "Start a conversation" },
        ].map((link) => (
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
    </aside>
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
          if (!normalized.value) return null;
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

function MiniFact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="rounded-md bg-white p-2.5">
      <dt className="text-xs font-semibold uppercase text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function getRecordImage(record: ResearchGenericRecord, fallback: string) {
  return (
    compactText(record.cover_image_url) ||
    compactText(record.image_url) ||
    fallback
  );
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
