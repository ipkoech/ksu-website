import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  ResearchPageIntro,
  ResearchSection,
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
import type { ResearchGenericRecord } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Outputs",
  description: "Public research outputs and report records.",
};

type OutputSearchParams = {
  q?: string;
  type?: string;
  access?: string;
  center?: string;
  project?: string;
  year?: string;
  sort?: string;
};

const outputTypes = ["dataset", "software", "report", "policy_brief", "prototype", "toolkit", "creative_work"];
const accessTypes = ["open", "restricted", "internal", "on_request"];

export default async function OutputsPage({
  searchParams,
}: {
  searchParams?: Promise<OutputSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [outputs, allOutputs, centers, projects] = await Promise.all([
    getOutputsFiltered({
      search: params.q,
      outputType: params.type,
      accessType: params.access,
      centerId: params.center,
      projectId: params.project,
      year: params.year,
      sort: params.sort || "release_date",
      order: params.sort === "title" ? "asc" : "desc",
    }),
    getOutputs(),
    getCenters(),
    getProjects(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro
        eyebrow="Publications & Outputs"
        title="Research outputs, datasets, tools, reports, and public deliverables."
        body="Outputs explain what research produced, who can use it, how to access it, and how it connects to projects or centers."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Publications & Outputs", href: "/publications" },
          { label: "Outputs" },
        ]}
      />

      <ResearchSection
        eyebrow="Output Catalogue"
        title="Outputs"
        body="Output records are loaded from the Research Outputs endpoint and filtered through backend query parameters."
        tone="white"
      >
        <OutputFilters
          params={params}
          years={getOutputYears(allOutputs.data)}
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

        {outputs.data.length > 0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {outputs.data.map((output) => (
              <OutputCard key={output.id} output={output} />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <StatusMessage>No outputs match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>
    </main>
  );
}

function OutputFilters({
  params,
  years,
  centers,
  projects,
}: {
  params: OutputSearchParams;
  years: string[];
  centers: ResearchGenericRecord[];
  projects: Array<Record<string, any>>;
}) {
  return (
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/outputs">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="xl:col-span-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Title, description, DOI, repository"
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <SelectField name="type" label="Type" value={params.type} options={outputTypes} />
        <SelectField name="access" label="Access" value={params.access} options={accessTypes} />
        <SelectField name="year" label="Year" value={params.year} options={years} />
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Sort</span>
          <select
            name="sort"
            defaultValue={params.sort ?? "release_date"}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="release_date">Release date</option>
            <option value="title">Title</option>
            <option value="created_at">Newest</option>
          </select>
        </label>
        <label className="md:col-span-2 xl:col-span-3">
          <span className="text-xs font-semibold uppercase text-slate-500">Center</span>
          <select
            name="center"
            defaultValue={params.center ?? ""}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="">All centers</option>
            {centers.map((center) => (
              <option key={center.id} value={center.id}>
                {center.name ?? center.title ?? center.code ?? center.id}
              </option>
            ))}
          </select>
        </label>
        <label className="md:col-span-2 xl:col-span-3">
          <span className="text-xs font-semibold uppercase text-slate-500">Project</span>
          <select
            name="project"
            defaultValue={params.project ?? ""}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title ?? project.name ?? project.code ?? project.id}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2 md:col-span-2 xl:col-span-6">
          <button className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary/90">
            Apply filters
          </button>
          <Link
            href="/outputs"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary"
          >
            Reset
          </Link>
        </div>
      </div>
    </form>
  );
}

function SelectField({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: string[];
}) {
  return (
    <label>
      <span className="text-xs font-semibold uppercase text-slate-500">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
      >
        <option value="">All {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function OutputCard({ output }: { output: ResearchGenericRecord }) {
  return (
    <Link
      href={output.slug ? `/outputs/${output.slug}` : "/outputs"}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(output.output_type ?? "output")}</Badge>
        {output.access_type ? <Badge>{formatLabel(output.access_type)}</Badge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {output.title ?? output.name}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(output.summary) ||
          compactText(output.description) ||
          compactText(output.usage_notes) ||
          "Output summary will appear when published."}
      </p>
      <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
        {[formatDate(output.release_date), compactText(output.version), compactText(output.license)]
          .filter(Boolean)
          .join(" · ") || "Access details not published"}
      </p>
    </Link>
  );
}

function getOutputYears(outputs: ResearchGenericRecord[]) {
  const years = outputs
    .flatMap((output) => [output.release_date, output.published_at, output.created_at])
    .map((value) => (value ? new Date(value).getFullYear() : null))
    .filter((year): year is number => Boolean(year) && !Number.isNaN(year));
  return Array.from(new Set(years))
    .sort((a, b) => b - a)
    .map(String);
}
