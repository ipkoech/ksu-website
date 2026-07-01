import type { Metadata } from "next";
import Link from "next/link";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ProgramTableControls } from "../programs/program-table-controls";
import { ResearchListPagination } from "../../components/research-list-pagination";
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
  formatLabel,
  getCenters,
  getOutputs,
  getOutputsFiltered,
  getProjects,
} from "../../lib/research-public-data";
import {
  filterRecordsByMonth,
  getListPageSize,
  getRecordMonths,
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
            <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="hidden grid-cols-[minmax(320px,1fr)_150px_150px] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 md:grid">
                <span>Output</span>
                <span>Type</span>
                <span>Access</span>
              </div>
              <div className="divide-y divide-slate-200">
                {visibleOutputs.map((output) => (
                  <OutputRow
                    key={output.id}
                    output={output}
                    projectName={projectNames.get(output.project_id ?? "")}
                    centerName={centerNames.get(output.center_id ?? "")}
                  />
                ))}
              </div>
            </div>
            <ResearchListPagination
              page={page}
              totalPages={totalPages}
              total={params.month ? visibleOutputs.length : outputs.total}
              perPage={outputs.perPage}
              path="/outputs"
              params={params}
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
  const source = projectName || centerName || compactText(output.project_name) || compactText(output.center_name);
  const type = formatLabel(compactText(output.output_type) || "output");
  const access = formatLabel(compactText(output.access_type) || compactText(output.status) || "published");

  return (
    <Link
      href={href}
      className="group grid gap-2 px-4 py-3 transition hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 md:grid-cols-[minmax(320px,1fr)_150px_150px] md:items-center"
    >
      <div className="min-w-0">
        <h2 className="truncate text-sm font-semibold leading-6 text-slate-950 transition group-hover:text-primary">
          {title}
        </h2>
        {source ? (
          <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{source}</p>
        ) : null}
      </div>
      <div className="text-xs font-medium text-slate-600 md:text-sm">{type}</div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge>{access}</Badge>
        {output.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
    </Link>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}
