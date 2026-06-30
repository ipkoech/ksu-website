import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { ListPagination, pageFromSearchParams } from "@ksu/ui/components";
import { Badge, FilledBadge, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getCenters,
  getPrograms,
  getProgramsFiltered,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getListPageSize,
  getPublishedFactItems,
  getRecordMonths,
  getRecordSummary,
  getRecordTimelineLabel,
  getRecordTitle,
  getRecordYears,
} from "../../lib/research-page-model";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ProgramTableControls } from "./program-table-controls";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Programs",
  description: "Institutional research programs and initiatives at Kisii University.",
};

type ProgramSearchParams = {
  q?: string;
  status?: string;
  active?: string;
  center?: string;
  year?: string;
  month?: string;
  sort?: string;
  page?: string;
};

const programStatuses = ["planning", "active", "completed", "suspended", "cancelled"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { label: "Latest", value: "created_at" },
  { label: "Recently updated", value: "updated_at" },
  { label: "Start date", value: "start_date" },
  { label: "End date", value: "end_date" },
  { label: "Name A-Z", value: "name" },
  { label: "Name Z-A", value: "name_desc" },
];

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams?: Promise<ProgramSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const perPage = getListPageSize(12);
  const sort = params.sort || "created_at";
  const sortField = sort === "name_desc" ? "name" : sort;
  const order = sort === "name" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [programs, allPrograms, centers] = await Promise.all([
    getProgramsFiltered({
      search: params.q,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort: sortField,
      order,
      page,
      perPage,
      ...activeFlags,
    }),
    getPrograms(),
    getCenters(),
  ]);
  const years = getRecordYears(allPrograms.data);
  const months = getRecordMonths(allPrograms.data, params.year);
  const visiblePrograms = filterRecordsByMonth(programs.data, params.year, params.month);
  const totalPages = Math.ceil(
    (params.month ? visiblePrograms.length : programs.total) / programs.perPage,
  );
  const errors = [programs.error, centers.error].filter(Boolean);
  const baseHref = getProgramsPageHref(params);

  return (
    <main id="research-main" className="min-h-screen bg-white text-slate-950">
      <ProgramsHero />

      <section
        id="program-portfolio"
        className="bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      >
        <div className="mx-auto max-w-[1680px]">
          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
            <div className="pt-1">
              <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 lg:whitespace-nowrap">
                Program Portfolio
              </h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
                Search, filter, sort, and open published research programs.
              </p>
            </div>
            <div className="w-full">
              <ProgramFilters
                params={params}
                centers={centers.data}
                years={years}
                months={months}
              />
            </div>
          </div>

          {errors.length && visiblePrograms.length === 0 ? (
            <div className="mt-5">
              <StatusMessage tone="error">{errors[0]}</StatusMessage>
            </div>
          ) : null}

          {visiblePrograms.length > 0 ? (
            <div className="mt-5">
              <ProgramsTable programs={visiblePrograms} />
              <ListPagination
                page={page}
                totalPages={totalPages}
                total={params.month ? visiblePrograms.length : programs.total}
                perPage={programs.perPage}
                baseHref={baseHref}
                className="mt-5"
              />
            </div>
          ) : !errors.length ? (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-600">
              No published research programs match the current filters.
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function ProgramsHero() {
  return (
    <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-10 text-white sm:px-6 lg:px-8 lg:py-12 xl:px-10 2xl:px-12">
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('/images/research/research-hero-imagegen.webp')] bg-cover bg-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-slate-950/78 via-slate-950/42 to-slate-950/8"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
      <div className="relative mx-auto max-w-[1680px] py-3">
        <span className="inline-flex rounded-md border border-white/25 bg-primary/80 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur">
          Published program portfolio
        </span>
        <h2 className="mt-4 max-w-2xl font-[family-name:var(--font-display)] text-4xl font-semibold leading-none text-white sm:text-5xl lg:text-6xl">
          Research Programs
        </h2>
        <p className="mt-4 max-w-xl text-pretty text-base leading-7 text-white/92 sm:text-lg">
          Strategic research umbrellas coordinating projects, expertise, funding, and outputs
          around Kisii University priority areas.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="#program-portfolio"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
          >
            Explore programs
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
          <Link
            href="/projects"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/8 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
          >
            View projects
            <ArrowRight aria-hidden className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProgramFilters({
  params,
  centers,
  years,
  months,
}: {
  params: ProgramSearchParams;
  centers: ResearchGenericRecord[];
  years: string[];
  months: Array<{ value: string; label: string }>;
}) {
  return (
    <ProgramTableControls
      action="/programs"
      resetHref="/programs"
      searchValue={params.q}
      filterSelects={[
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: programStatuses },
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

function ProgramsTable({ programs }: { programs: ResearchGenericRecord[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="hidden grid-cols-[minmax(320px,1fr)_150px_190px_160px_110px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 lg:grid">
        <span>Program</span>
        <span>Status</span>
        <span>Center</span>
        <span>Timeline</span>
        <span className="text-right">Action</span>
      </div>
      <div className="divide-y divide-slate-200">
        {programs.map((program) => (
          <ProgramTableRow key={program.id} program={program} />
        ))}
      </div>
    </div>
  );
}

function ProgramTableRow({ program }: { program: ResearchGenericRecord }) {
  const href = program.slug ? `/programs/${program.slug}` : "/programs";
  const summary = getRecordSummary(program);
  const title = getRecordTitle(program, "Research program");
  const center = getCenterName(program);
  const timeline = getRecordTimelineLabel(program);
  const facts = getPublishedFactItems([
    { label: "Center", value: center },
    { label: "Timeline", value: timeline },
  ]);
  const badges = [program.program_type, program.status]
    .map(compactText)
    .filter(Boolean)
    .slice(0, 2);

  return (
    <article className="grid gap-3 px-4 py-4 transition hover:bg-slate-50/80 lg:grid-cols-[minmax(320px,1fr)_150px_190px_160px_110px] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {badges.map((badge) => (
            <Badge key={badge}>{formatLabel(badge)}</Badge>
          ))}
          {program.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-2 flex items-start gap-2 text-base font-semibold leading-6 text-slate-950">
          <Link href={href} className="transition hover:text-primary">
            {title}
          </Link>
          <ExternalLink aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" />
        </h2>
        {summary ? (
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{summary}</p>
        ) : null}
        {facts.length ? (
          <dl className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2 lg:hidden">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-md bg-slate-50 px-3 py-2">
                <dt className="font-semibold uppercase text-slate-500">{fact.label}</dt>
                <dd className="mt-1 font-medium text-slate-800">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>

      <div className="hidden text-sm font-medium text-slate-700 lg:block">
        {badges[1] ? formatLabel(badges[1]) : program.is_active === false ? "Inactive" : "Active"}
      </div>
      <div className="hidden text-sm text-slate-600 lg:block">{center || "-"}</div>
      <div className="hidden text-sm text-slate-600 lg:block">{timeline || "-"}</div>
      <div className="flex justify-start lg:justify-end">
        <Link
          href={href}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
        >
          Open
          <ArrowRight aria-hidden className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

function getCenterName(record: ResearchGenericRecord) {
  const center = record.center as ResearchGenericRecord | undefined;
  return center ? getRecordTitle(center, "") : compactText(record.center_name);
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}

function getProgramsPageHref(params: ProgramSearchParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value || key === "page") continue;
    query.set(key, value);
  }
  const search = query.toString();
  return search ? `/programs?${search}` : "/programs";
}
