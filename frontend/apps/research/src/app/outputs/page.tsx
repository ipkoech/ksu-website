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
  getOutputs,
  getOutputsFiltered,
  getProjects,
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
  title: "Research Outputs",
  description: "Public research outputs, datasets, tools, reports, and deliverables.",
};

type OutputSearchParams = {
  q?: string;
  type?: string;
  access?: string;
  status?: string;
  active?: string;
  center?: string;
  project?: string;
  year?: string;
  month?: string;
  sort?: string;
};

const outputTypes = ["dataset", "software", "report", "policy_brief", "prototype", "toolkit", "creative_work"];
const accessTypes = ["open", "restricted", "internal", "on_request"];
const outputStatuses = ["published", "draft", "archived", "under_review"];
const activeStates = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Featured", value: "featured" },
];
const sortOptions = [
  { label: "Release date", value: "release_date" },
  { label: "Newest", value: "created_at" },
  { label: "Recently updated", value: "updated_at" },
  { label: "Title A-Z", value: "title" },
  { label: "Title Z-A", value: "title_desc" },
];

export default async function OutputsPage({
  searchParams,
}: {
  searchParams?: Promise<OutputSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const sort = params.sort || "release_date";
  const sortField = sort === "title_desc" ? "title" : sort;
  const order = sort === "title" ? "asc" : "desc";
  const activeFlags = getActiveFlags(params.active);
  const [outputs, allOutputs, centers, projects] = await Promise.all([
    getOutputsFiltered({
      search: params.q,
      outputType: params.type,
      accessType: params.access,
      status: params.status,
      centerId: params.center,
      projectId: params.project,
      year: params.year,
      sort: sortField,
      order,
      ...activeFlags,
    }),
    getOutputs(),
    getCenters(),
    getProjects(),
  ]);
  const years = getRecordYears(allOutputs.data);
  const months = getRecordMonths(allOutputs.data, params.year);
  const visibleOutputs = filterRecordsByMonth(outputs.data, params.year, params.month);
  const featuredOutput = visibleOutputs.find((output) => output.is_featured);
  const rowOutputs = featuredOutput
    ? visibleOutputs.filter((output) => output.id !== featuredOutput.id)
    : visibleOutputs;

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <OutputsMasthead
        resultCount={visibleOutputs.length}
        publishedCount={allOutputs.data.length}
        centersCount={centers.data.length}
        projectsCount={projects.data.length}
      />

      <ResearchSection
        eyebrow="Output Catalogue"
        title="Research outputs"
        body="Search public outputs and use the filter menu for type, access, active state, status, year, month, center, project, and sort order."
        tone="white"
      >
        <OutputFilters
          params={params}
          years={years}
          months={months}
          centers={centers.data}
          projects={projects.data}
        />

        {[outputs.error, centers.error, projects.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {visibleOutputs.length > 0 ? (
          <>
            {featuredOutput ? (
              <div className="mt-6">
                <FeaturedOutput output={featuredOutput} />
              </div>
            ) : null}
            <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {rowOutputs.map((output) => (
                <OutputRow key={output.id} output={output} />
              ))}
            </div>
          </>
        ) : (
          <div className="mt-7">
            <StatusMessage>No published outputs match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>
    </main>
  );
}

function OutputsMasthead({
  resultCount,
  publishedCount,
  centersCount,
  projectsCount,
}: {
  resultCount: number;
  publishedCount: number;
  centersCount: number;
  projectsCount: number;
}) {
  const stats = [
    { label: "Output results", value: resultCount },
    { label: "Published outputs", value: publishedCount },
    { label: "Centers", value: centersCount },
    { label: "Projects", value: projectsCount },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <Link href="/publications" className="transition hover:text-primary">Publications</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Outputs</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">
            Publications & Outputs
          </p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Datasets, tools, reports, prototypes, and public deliverables
          </h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">
            Browse what research produced, how it can be accessed, and the project or center behind it.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/publications">View publications</PrimaryLink>
            <SecondaryLink href="/projects">Trace to projects</SecondaryLink>
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

function OutputFilters({
  params,
  years,
  months,
  centers,
  projects,
}: {
  params: OutputSearchParams;
  years: string[];
  months: Array<{ value: string; label: string }>;
  centers: ResearchGenericRecord[];
  projects: Array<Record<string, any>>;
}) {
  return (
    <ResearchFilterForm
      action="/outputs"
      resetHref="/outputs"
      searchValue={params.q}
      searchPlaceholder="Title, description, DOI, repository"
      selects={[
        { name: "type", label: "Type", value: params.type, options: outputTypes },
        { name: "access", label: "Access", value: params.access, options: accessTypes },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: outputStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
      ]}
      centers={centers}
      centerValue={params.center}
      projects={projects}
      projectValue={params.project}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function FeaturedOutput({ output }: { output: ResearchGenericRecord }) {
  return (
    <Link
      href={output.slug ? `/outputs/${output.slug}` : "/outputs"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <OutputRowContent output={output} featured />
    </Link>
  );
}

function OutputRow({ output }: { output: ResearchGenericRecord }) {
  return (
    <ResearchRecordRow
      href={output.slug ? `/outputs/${output.slug}` : "/outputs"}
      title={getRecordTitle(output, "Research output")}
      description={
        getRecordSummary(output) ||
        compactText(output.usage_notes) ||
        "Output summary has not been published yet."
      }
      badges={[output.output_type, output.access_type, output.status]}
      filledBadges={[output.is_featured ? "Featured" : null]}
      facts={[
        { label: "Release", value: formatDate(output.release_date) || getRecordTimelineLabel(output) },
        { label: "Version", value: compactText(output.version) },
        { label: "DOI", value: compactText(output.doi) },
      ]}
    />
  );
}

function OutputRowContent({
  output,
  featured = false,
}: {
  output: ResearchGenericRecord;
  featured?: boolean;
}) {
  return (
    <>
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge>{formatLabel(compactText(output.output_type) || "output")}</Badge>
          {output.access_type ? <Badge>{formatLabel(output.access_type)}</Badge> : null}
          {featured || output.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-7 text-slate-950">
          {getRecordTitle(output, "Research output")}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {getRecordSummary(output) ||
            compactText(output.usage_notes) ||
            "Output summary has not been published yet."}
        </p>
      </div>
      <dl className="grid gap-2 text-sm">
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">Release</dt>
          <dd className="mt-1 font-semibold text-slate-950">{formatDate(output.release_date) || "Not published"}</dd>
        </div>
        <div className="rounded-md bg-white p-2.5">
          <dt className="text-xs font-semibold uppercase text-slate-500">License</dt>
          <dd className="mt-1 font-semibold text-slate-950">{compactText(output.license) || "Not published"}</dd>
        </div>
      </dl>
      <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-primary/20 px-3 text-sm font-semibold text-primary transition group-hover:bg-primary group-hover:text-white">
        View output
      </span>
    </>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
