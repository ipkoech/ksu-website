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
  formatLabel,
  getCenters,
  getPrograms,
  getProgramsFiltered,
  getThemes,
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
};

const programStatuses = ["planning", "active", "completed", "suspended", "cancelled"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { label: "Newest", value: "created_at" },
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
  const sort = params.sort || "created_at";
  const sortField = sort === "name_desc" ? "name" : sort;
  const order = sort === "name" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [programs, allPrograms, centers, themes] = await Promise.all([
    getProgramsFiltered({
      search: params.q,
      status: params.status,
      centerId: params.center,
      year: params.year,
      sort: sortField,
      order,
      ...activeFlags,
    }),
    getPrograms(),
    getCenters(),
    getThemes(),
  ]);
  const years = getRecordYears(allPrograms.data);
  const months = getRecordMonths(allPrograms.data, params.year);
  const visiblePrograms = filterRecordsByMonth(programs.data, params.year, params.month);
  const featuredProgram = visiblePrograms.find((program) => program.is_featured);
  const rowPrograms = featuredProgram
    ? visiblePrograms.filter((program) => program.id !== featuredProgram.id)
    : visiblePrograms;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ProgramsMasthead
        resultCount={visiblePrograms.length}
        publishedCount={allPrograms.data.length}
        centersCount={centers.data.length}
        themesCount={themes.data.length}
      />

      <ResearchSection
        eyebrow="Program Registry"
        title="Programs and initiatives"
        body="Search published programmes and use the filter menu for years, months, active states, status, center, and sort order."
        tone="white"
      >
        <ProgramFilters
          params={params}
          centers={centers.data}
          years={years}
          months={months}
        />

        {[programs.error, centers.error, themes.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {visiblePrograms.length > 0 ? (
          <>
            {featuredProgram ? (
              <div className="mt-6">
                <FeaturedProgram program={featuredProgram} />
              </div>
            ) : null}
            <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {rowPrograms.map((program) => (
                <ProgramRow key={program.id} program={program} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-7">
            <StatusMessage>No published research programmes match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>

      <ResearchSection
        eyebrow="Focus Areas"
        title="Themes supporting the programme portfolio"
        body="Published theme records provide the public language behind programme discovery."
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {themes.data.slice(0, 8).map((theme) => (
            <ThemeTile key={theme.id} theme={theme} />
          ))}
          {themes.data.length === 0 ? (
            <StatusMessage>No research themes are currently published.</StatusMessage>
          ) : null}
        </div>
      </ResearchSection>
    </main>
  );
}

function ProgramsMasthead({
  resultCount,
  publishedCount,
  centersCount,
  themesCount,
}: {
  resultCount: number;
  publishedCount: number;
  centersCount: number;
  themesCount: number;
}) {
  const stats = [
    { label: "Programme results", value: resultCount },
    { label: "Published programmes", value: publishedCount },
    { label: "Centers", value: centersCount },
    { label: "Themes", value: themesCount },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href="/projects" className="transition hover:text-primary">Research</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Programs</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            Research Programs
          </p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Long-running research initiatives and public programmes
          </h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">
            Browse programmes by title, active state, status, center, year, month, and published focus.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/projects">View projects</PrimaryLink>
            <SecondaryLink href="/centers">Explore centers</SecondaryLink>
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
    <ResearchFilterForm
      action="/programs"
      resetHref="/programs"
      searchValue={params.q}
      searchPlaceholder="Program name, summary, code"
      selects={[
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

function FeaturedProgram({ program }: { program: ResearchGenericRecord }) {
  return (
    <Link
      href={program.slug ? `/programs/${program.slug}` : "/programs"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <ProgramRowContent program={program} featured />
    </Link>
  );
}

function ProgramRow({ program }: { program: ResearchGenericRecord }) {
  return (
    <ResearchRecordRow
      href={program.slug ? `/programs/${program.slug}` : "/programs"}
      title={getRecordTitle(program, "Research programme")}
      description={getRecordSummary(program) || "Programme summary has not been published yet."}
      badges={[program.program_type, program.status]}
      filledBadges={[program.is_featured ? "Featured" : null]}
      facts={[
        { label: "Timeline", value: getRecordTimelineLabel(program) },
        { label: "Center", value: getCenterName(program) },
        { label: "Active", value: program.is_active === false ? "Inactive" : "Active" },
      ]}
    />
  );
}

function ProgramRowContent({
  program,
  featured = false,
}: {
  program: ResearchGenericRecord;
  featured?: boolean;
}) {
  return (
    <>
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(compactText(program.program_type) || "programme")}</Badge>
          <Badge>{formatLabel(compactText(program.status) || "active")}</Badge>
          {featured || program.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
          {getRecordTitle(program, "Research programme")}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {getRecordSummary(program) || "Programme summary has not been published yet."}
        </p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Timeline</dt>
          <dd className="mt-1 font-semibold text-slate-950">{getRecordTimelineLabel(program) || "Not published"}</dd>
        </div>
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Center</dt>
          <dd className="mt-1 font-semibold text-slate-950">{getCenterName(program) || "Not published"}</dd>
        </div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">
        View programme
      </span>
    </>
  );
}

function ThemeTile({ theme }: { theme: ResearchGenericRecord }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {[theme.theme_type, theme.category, theme.status]
          .map(compactText)
          .filter(Boolean)
          .slice(0, 2)
          .map((label) => (
            <Badge key={label}>{formatLabel(label)}</Badge>
          ))}
      </div>
      <h2 className="mt-3 text-base font-semibold leading-6 text-slate-950">
        {getRecordTitle(theme, "Research theme")}
      </h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
        {getRecordSummary(theme) || "Theme detail will appear when published."}
      </p>
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
