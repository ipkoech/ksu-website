import type { Metadata } from "next";
import Link from "next/link";
import { pageFromSearchParams } from "@ksu/ui/components";
import { ProgramTableControls } from "../programs/program-table-controls";
import { ResearchListPagination } from "../../components/research-list-pagination";
import {
  ResearchPortfolioHero,
  ResearchPortfolioShell,
} from "../../components/research-portfolio";
import { StatusMessage } from "../../components/research-ui";
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
    <main id="research-main" className="min-h-screen bg-white text-foreground">
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
        footer={
          visibleOutputs.length > 0 ? (
            <ResearchListPagination
              page={page}
              totalPages={totalPages}
              total={params.month ? visibleOutputs.length : outputs.total}
              perPage={outputs.perPage}
              path="/outputs"
              params={params}
            />
          ) : null
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
            <OutputCardGrid
              outputs={visibleOutputs}
              projectNames={projectNames}
              centerNames={centerNames}
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

function OutputCardGrid({
  outputs,
  projectNames,
  centerNames,
}: {
  outputs: ResearchGenericRecord[];
  projectNames: Map<string, string>;
  centerNames: Map<string, string>;
}) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
      {outputs.map((output) => (
        <OutputCard
          key={output.id}
          output={output}
          projectName={projectNames.get(output.project_id ?? "")}
          centerName={centerNames.get(output.center_id ?? "")}
        />
      ))}
    </div>
  );
}

function OutputCard({
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
  const image = getOutputCoverImage(output);

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-lg border border-border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
    >
      {image ? (
        <div
          className="aspect-[4/3] bg-surface-muted bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')` }}
        />
      ) : (
        <div className="relative aspect-[4/3] overflow-hidden bg-[hsl(var(--brand-overlay))]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_22%,rgba(245,158,11,0.5),transparent_30%),linear-gradient(135deg,hsl(var(--brand-overlay)),#075985)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:22px_22px] opacity-60" />
          <div className="absolute left-3 right-3 top-4 h-2 rounded-full bg-white/25" />
          <div className="absolute bottom-3 left-3 right-3 h-12 rounded-md border border-white/20 bg-white/10" />
        </div>
      )}
      <div className="p-3">
        <div className="flex flex-wrap gap-1.5">
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
            {access}
          </span>
          {output.is_featured ? (
            <span className="rounded bg-secondary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-secondary">
              Featured
            </span>
          ) : null}
        </div>
        <h2 className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs font-semibold leading-5 text-foreground transition group-hover:text-primary sm:text-sm">
          {title}
        </h2>
        <p className="mt-1 truncate text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
          {type}
        </p>
        {source ? (
          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">{source}</p>
        ) : null}
      </div>
    </Link>
  );
}

function getActiveFlags(value?: string) {
  if (value === "inactive") return { isActive: false };
  if (value === "featured") return { isActive: true, isFeatured: true };
  return { isActive: true };
}

function getOutputCoverImage(output: ResearchGenericRecord) {
  const cover = output.cover_image as
    | {
        url?: string | null;
        public_url?: string | null;
        thumbnail_url?: string | null;
        file_url?: string | null;
      }
    | undefined;

  return (
    compactText(cover?.thumbnail_url) ||
    compactText(cover?.public_url) ||
    compactText(cover?.url) ||
    compactText(cover?.file_url) ||
    compactText(output.cover_image_url)
  );
}
