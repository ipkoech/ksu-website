import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ResearchListPagination } from "../../components/research-list-pagination";
import { Badge, FilledBadge, StatusMessage } from "../../components/research-ui";
import { ResearchPortfolioHero } from "../../components/research-portfolio";
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
  getRecordMonths,
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

const quickLinks = [
  { label: "Projects", href: "/projects", body: "Active research workstreams" },
  { label: "Publications", href: "/publications", body: "Evidence and scholarly output" },
  { label: "Funding", href: "/funding", body: "Grants and opportunities" },
  { label: "Centers", href: "/centers", body: "Institutional research anchors" },
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

  return (
    <main id="research-main" className="min-h-screen bg-white text-slate-950">
      <ResearchPortfolioHero
        eyebrow="Published program portfolio"
        title="Research Programs"
        body="Strategic research umbrellas coordinating projects, expertise, funding, and outputs around Kisii University priority areas."
        primary={{ label: "Explore programs", href: "#program-portfolio" }}
        secondary={{ label: "View projects", href: "/projects" }}
        illustration="programs"
      />

      <section
        id="program-portfolio"
        className="bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      >
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div className="min-w-0">
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
                <ResearchListPagination
                  page={page}
                  totalPages={totalPages}
                  total={params.month ? visiblePrograms.length : programs.total}
                  perPage={programs.perPage}
                  path="/programs"
                  params={params}
                  className="mt-5"
                />
              </div>
            ) : !errors.length ? (
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm font-medium text-slate-600">
                No published research programs match the current filters.
              </div>
            ) : null}
          </div>

          <ProgramQuickLinks />
        </div>
      </section>
    </main>
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
      <div className="hidden grid-cols-[minmax(320px,1fr)_150px_150px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 md:grid">
        <span>Program</span>
        <span>Type</span>
        <span>Status</span>
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
  const title = getRecordTitle(program, "Research program");

  return (
    <Link
      href={href}
      className="group grid gap-2 px-4 py-3 transition hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 md:grid-cols-[minmax(320px,1fr)_150px_150px] md:items-center"
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold leading-6 text-slate-950 transition group-hover:text-primary">
          {title}
        </h2>
        {program.code ? (
          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{compactText(program.code)}</p>
        ) : null}
      </div>
      <div className="text-xs font-medium text-slate-600 md:text-sm">
        {program.program_type ? formatLabel(program.program_type) : "Program"}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{formatLabel(program.status ?? (program.is_active === false ? "inactive" : "active"))}</Badge>
        {program.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
    </Link>
  );
}

function ProgramQuickLinks() {
  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        Quick links
      </p>
      <div className="mt-3 divide-y divide-slate-200">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-start justify-between gap-4 py-3 text-sm transition first:pt-0 last:pb-0"
          >
            <span>
              <span className="block font-semibold text-primary group-hover:text-secondary">
                {link.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{link.body}</span>
            </span>
            <ArrowRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-secondary"
            />
          </Link>
        ))}
      </div>
    </aside>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
