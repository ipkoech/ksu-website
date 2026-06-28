import type { Metadata } from "next";
import { BarChart3, BookOpenCheck, Database, FlaskConical } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFilterForm, ResearchListCard } from "../../components/research-listing";
import { ResearchSection, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
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

const outputLinks = [
  {
    label: "Publications",
    href: "/publications",
    description: "Articles, books, conference papers, reports, and policy briefs.",
    icon: BookOpenCheck,
  },
  {
    label: "Outputs",
    href: "/outputs",
    description: "Datasets, software, toolkits, prototypes, and deliverables.",
    icon: Database,
  },
  {
    label: "Impact Metrics",
    href: "/impact-metrics",
    description: "Public outcomes, reach, and performance indicators.",
    icon: BarChart3,
  },
  {
    label: "Projects",
    href: "/projects",
    description: "Trace outputs back to the work that produced them.",
    icon: FlaskConical,
  },
];

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
      <ResearchClusterHero
        eyebrow="Publications & Outputs"
        title="Research outputs, datasets, tools, reports, and public deliverables."
        body="Outputs explain what research produced, who can use it, how to access it, and how it connects to projects or centers."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Publications & Outputs", href: "/publications" },
          { label: "Outputs" },
        ]}
        imageSrc="/images/research/research-projects-hero.svg"
        imageAlt="Research datasets, reports, software, and public deliverables"
        links={outputLinks}
        primaryAction={{ label: "View publications", href: "/publications" }}
        stats={[
          { label: "Output results", value: outputs.data.length },
          { label: "Published outputs", value: allOutputs.data.length },
          { label: "Centers", value: centers.data.length },
          { label: "Projects", value: projects.data.length },
        ]}
      />

      <ResearchSection
        eyebrow="Output Catalogue"
        title="Outputs"
        body="Browse outputs by type, access, year, center, project, and keyword."
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
    <ResearchFilterForm
      action="/outputs"
      resetHref="/outputs"
      searchValue={params.q}
      searchPlaceholder="Title, description, DOI, repository"
      selects={[
        { name: "type", label: "Type", value: params.type, options: outputTypes },
        { name: "access", label: "Access", value: params.access, options: accessTypes },
        { name: "year", label: "Year", value: params.year, options: years },
      ]}
      centers={centers}
      centerValue={params.center}
      projects={projects}
      projectValue={params.project}
      sortValue={params.sort}
      sortOptions={[
        { value: "release_date", label: "Release date" },
        { value: "title", label: "Title" },
        { value: "created_at", label: "Newest" },
      ]}
    />
  );
}

function OutputCard({ output }: { output: ResearchGenericRecord }) {
  return (
    <ResearchListCard
      href={output.slug ? `/outputs/${output.slug}` : "/outputs"}
      title={output.title ?? output.name}
      description={
        compactText(output.summary) ||
        compactText(output.description) ||
        compactText(output.usage_notes) ||
        "Output summary will appear when published."
      }
      badges={[output.output_type ?? "output", output.access_type]}
      facts={[
        { label: "Release", value: formatDate(output.release_date) },
        { label: "Version", value: compactText(output.version) },
        { label: "License", value: compactText(output.license) },
        { label: "DOI", value: compactText(output.doi) },
      ]}
    />
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
