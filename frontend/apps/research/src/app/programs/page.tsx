import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ResearchListPagination } from "../../components/research-list-pagination";
import { StatusMessage } from "../../components/research-ui";
import { ResearchPortfolioHero } from "../../components/research-portfolio";
import {
  getCenters,
  getPrograms,
  getProgramsFiltered,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getListPageSize,
  getRecordMonths,
  getRecordYears,
} from "../../lib/research-page-model";
import type { ResearchGenericRecord } from "@ksu/api-client/server";
import { ProgramTableControls } from "./program-table-controls";
import { ProgramsDisplay } from "../../components/research-record-displays";
import { toResearchRecordDisplayDto } from "../../lib/research-formatters";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Programs",
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
  const programDisplayRecords = visiblePrograms.map((program) => toResearchRecordDisplayDto(program));

  return (
    <main id="research-main" className="min-h-screen bg-white text-foreground">
      <ResearchPortfolioHero
        eyebrow="Published program portfolio"
        title="Programs"
        body="Strategic research umbrellas coordinating projects, expertise, funding, and outputs around Kisii University priority areas."
        primary={{ label: "Explore programs", href: "#program-portfolio" }}
        secondary={{ label: "View projects", href: "/projects" }}
        illustration="programs"
        imageSrc="/images/research/headers/innovation-week-8197.jpg"
        immersive
      />

      <section
        id="program-portfolio"
        className="bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
      >
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
          <div className="min-w-0">
            <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-start">
              <div className="pt-1">
                <h2 className="font-display text-3xl font-semibold leading-tight text-foreground lg:whitespace-nowrap">
                  Program Portfolio
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
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

            {errors.map((error) => (
              <div key={error} className="mt-5">
                <StatusMessage tone="error">{error}</StatusMessage>
              </div>
            ))}

            {visiblePrograms.length > 0 ? (
              <div className="mt-5"><ProgramsDisplay programs={programDisplayRecords} /></div>
            ) : (
              <div className="mt-5">
                <StatusMessage>
                  No published research programs match the current filters.
                </StatusMessage>
              </div>
            )}
          </div>

          <ProgramQuickLinks />
          {visiblePrograms.length > 0 ? (
            <div className="xl:col-span-2">
              <ResearchListPagination
                page={page}
                totalPages={totalPages}
                total={params.month ? visiblePrograms.length : programs.total}
                perPage={programs.perPage}
                path="/programs"
                params={params}
              />
            </div>
          ) : null}
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

function ProgramQuickLinks() {
  return (
    <aside className="rounded-lg border border-border bg-card p-4 shadow-sm xl:sticky xl:top-24">
      <p className="text-sm font-semibold uppercase tracking-eyebrow text-secondary">
        Quick links
      </p>
      <div className="mt-3 divide-y divide-border">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-start justify-between gap-4 py-3 text-sm transition first:pt-0 last:pb-0"
          >
            <span>
              <span className="block font-semibold text-foreground group-hover:text-primary">
                {link.label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">{link.body}</span>
            </span>
            <ArrowRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/70 transition group-hover:translate-x-1 group-hover:text-primary"
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
