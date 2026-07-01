import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ListPagination, pageFromSearchParams } from "@ksu/ui/components";
import { ProgramTableControls } from "../programs/program-table-controls";
import {
  ResearchPortfolioHero,
  ResearchPortfolioShell,
} from "../../components/research-portfolio";
import {
  Badge,
  FilledBadge,
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
  getListPageSize,
  getPublishedFactItems,
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
  page?: string;
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
const quickLinks = [
  { label: "Projects", href: "/projects", body: "Trace outputs to active work" },
  { label: "Programs", href: "/programs", body: "Browse strategic umbrellas" },
  { label: "Centers", href: "/centers", body: "Institutional research anchors" },
  { label: "Publications", href: "/publications", body: "Peer-reviewed scholarship" },
];

export default async function OutputsPage({
  searchParams,
}: {
  searchParams?: Promise<OutputSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const page = pageFromSearchParams(params);
  const perPage = getListPageSize(12);
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
      page,
      perPage,
      ...activeFlags,
    }),
    getOutputs(),
    getCenters(),
    getProjects(),
  ]);
  const years = getRecordYears(allOutputs.data);
  const months = getRecordMonths(allOutputs.data, params.year);
  const visibleOutputs = filterRecordsByMonth(outputs.data, params.year, params.month);
  const totalPages = Math.ceil(
    (params.month ? visibleOutputs.length : outputs.total) / outputs.perPage,
  );
  const featuredOutput = visibleOutputs.find((output) => output.is_featured);
  const rowOutputs = featuredOutput
    ? visibleOutputs.filter((output) => output.id !== featuredOutput.id)
    : visibleOutputs;

  const baseHref = getOutputsPageHref(params);
  const projectNames = new Map(projects.data.map((project) => [project.id, project.title ?? project.name ?? project.code ?? ""]));
  const centerNames = new Map(centers.data.map((center) => [center.id, center.name ?? center.title ?? center.code ?? ""]));

  return (
    <main id="research-main" className="min-h-screen bg-white text-slate-950">
      <ResearchPortfolioHero
        eyebrow="Published output catalogue"
        title="Research Outputs"
        body="Datasets, tools, policy briefs, reports, prototypes, and public deliverables produced through Kisii University research."
        primary={{ label: "Explore outputs", href: "#output-catalogue" }}
        secondary={{ label: "Trace to projects", href: "/projects" }}
        illustration="outputs"
      />

      <ResearchPortfolioShell
        id="output-catalogue"
        title="Output Catalogue"
        body="Search, filter, sort, and open published research outputs."
        quickLinks={quickLinks}
        controls={
          <OutputFilters
            params={params}
            years={years}
            months={months}
            centers={centers.data}
            projects={projects.data}
          />
        }
      >
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
                <FeaturedOutput
                  output={featuredOutput}
                  projectName={projectNames.get(featuredOutput.project_id ?? "")}
                  centerName={centerNames.get(featuredOutput.center_id ?? "")}
                />
              </div>
            ) : null}
            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-[minmax(340px,1fr)_150px_170px_170px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 lg:grid">
                <span>Output</span>
                <span>Access</span>
                <span>Project / Center</span>
                <span>Release</span>
              </div>
              <div className="divide-y divide-slate-200">
                {rowOutputs.map((output) => (
                  <OutputRow
                    key={output.id}
                    output={output}
                    projectName={projectNames.get(output.project_id ?? "")}
                    centerName={centerNames.get(output.center_id ?? "")}
                  />
                ))}
              </div>
            </div>
            <ListPagination
              page={page}
              totalPages={totalPages}
              total={params.month ? visibleOutputs.length : outputs.total}
              perPage={outputs.perPage}
              baseHref={baseHref}
              className="mt-5"
            />
          </>
        ) : (
          <div className="mt-7">
            <StatusMessage>No published outputs match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchPortfolioShell>
    </main>
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
    <ProgramTableControls
      action="/outputs"
      resetHref="/outputs"
      searchValue={params.q}
      searchPlaceholder="Search outputs by title, DOI, repository..."
      filterTitle="Filter outputs"
      sortTitle="Sort outputs"
      centers={centers}
      centerValue={params.center}
      filterSelects={[
        { name: "type", label: "Type", value: params.type, options: outputTypes },
        { name: "access", label: "Access", value: params.access, options: accessTypes },
        { name: "active", label: "Active state", value: params.active, options: activeStates },
        { name: "status", label: "Status", value: params.status, options: outputStatuses },
        { name: "year", label: "Year", value: params.year, options: years },
        { name: "month", label: "Month", value: params.month, options: months },
        ...(projects.length > 0
          ? [{
              name: "project",
              label: "Project",
              value: params.project,
              options: projects.map((project) => ({
                value: project.id ?? project.code ?? project.slug ?? project.title ?? project.name ?? "",
                label: project.title ?? project.name ?? project.code ?? "Published project",
              })),
            }]
          : []),
      ]}
      sortValue={params.sort}
      sortOptions={sortOptions}
    />
  );
}

function FeaturedOutput({
  output,
  projectName,
  centerName,
}: {
  output: ResearchGenericRecord;
  projectName?: string;
  centerName?: string;
}) {
  return (
    <Link
      href={output.slug ? `/outputs/${output.slug}` : "/outputs"}
      className="group grid gap-4 rounded-lg border border-primary/20 bg-primary/[0.03] p-4 shadow-sm transition hover:border-primary/40 lg:grid-cols-[minmax(0,1fr)_260px_auto] lg:items-center"
    >
      <OutputRowContent output={output} projectName={projectName} centerName={centerName} featured />
    </Link>
  );
}

function OutputRow({
  output,
  projectName,
  centerName,
}: {
  output: ResearchGenericRecord;
  projectName?: string;
  centerName?: string;
}) {
  const href = output.slug ? `/outputs/${output.slug}` : "/outputs";
  const title = getRecordTitle(output, "Research output");
  const summary =
    getRecordSummary(output) ||
    compactText(output.usage_notes);
  const release = formatDate(output.release_date) || getRecordTimelineLabel(output);
  const source = projectName || centerName || compactText(output.project_name) || compactText(output.center_name);
  const facts = getPublishedFactItems([
    { label: "Access", value: output.access_type },
    { label: "Release", value: release },
    { label: "Source", value: source },
  ]);

  return (
    <Link
      href={href}
      className="group grid gap-3 px-4 py-4 transition hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 lg:grid-cols-[minmax(340px,1fr)_150px_170px_170px] lg:items-center"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{formatLabel(compactText(output.output_type) || "output")}</Badge>
          {output.status ? <Badge>{formatLabel(output.status)}</Badge> : null}
          {output.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
        </div>
        <h2 className="mt-2 flex items-start gap-2 text-base font-semibold leading-6 text-slate-950">
          <span className="transition group-hover:text-primary">{title}</span>
          <ExternalLink aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 text-primary transition group-hover:translate-x-0.5" />
        </h2>
        {summary ? <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{summary}</p> : null}
        {facts.length ? (
          <dl className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3 lg:hidden">
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
        {output.access_type ? formatLabel(output.access_type) : "-"}
      </div>
      <div className="hidden text-sm text-slate-600 lg:block">{source || "-"}</div>
      <div className="hidden text-sm text-slate-600 lg:block">{release || "-"}</div>
    </Link>
  );
}

function OutputRowContent({
  output,
  projectName,
  centerName,
  featured = false,
}: {
  output: ResearchGenericRecord;
  projectName?: string;
  centerName?: string;
  featured?: boolean;
}) {
  const source = projectName || centerName || compactText(output.project_name) || compactText(output.center_name);
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
          <dt className="text-xs font-semibold uppercase text-slate-500">Project / Center</dt>
          <dd className="mt-1 font-semibold text-slate-950">{source || "Not published"}</dd>
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

function getOutputsPageHref(params: OutputSearchParams) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (!value || key === "page") continue;
    query.set(key, value);
  }
  const search = query.toString();
  return search ? `/outputs?${search}` : "/outputs";
}
