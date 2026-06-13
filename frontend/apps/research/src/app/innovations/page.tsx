import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Handshake, Lightbulb, Network } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import {
  Badge,
  FilledBadge,
  IconCard,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getCenters,
  getInnovations,
  getInnovationsFiltered,
  getProjects,
} from "../../lib/research-public-data";
import type { ResearchGenericRecord } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Innovations",
  description: "Research innovations, prototypes, software, and technology transfer outputs.",
};

type InnovationSearchParams = {
  q?: string;
  type?: string;
  stage?: string;
  ip?: string;
  commercial?: string;
  center?: string;
  project?: string;
  status?: string;
  sort?: string;
};

const innovationTypes = ["product", "process", "service", "technology", "software", "patent", "model", "prototype"];
const developmentStages = ["research", "development", "testing", "validation", "production"];
const ipStatuses = ["pending", "filed", "granted", "licensed", "open_source", "trade_secret"];
const commercializationStatuses = ["concept", "prototype", "pilot", "market_ready", "commercialized"];
const innovationStatuses = ["active", "draft", "archived", "discontinued"];

const innovationLinks = [
  { label: "Innovations", href: "/innovations", description: "Tools, prototypes, software, and translated research.", icon: Lightbulb },
  { label: "Partners", href: "/partners", description: "Partner profiles, sponsorships, and collaboration routes.", icon: Handshake },
  { label: "Consultancies", href: "/consultancies", description: "Applied expert services and client engagements.", icon: Network },
  { label: "Endowments", href: "/endowments", description: "Permanent funding initiatives and named funds.", icon: Banknote },
];

export default async function InnovationsPage({
  searchParams,
}: {
  searchParams?: Promise<InnovationSearchParams>;
}) {
  const params = (await searchParams) ?? {};
  const [innovations, allInnovations, centers, projects] = await Promise.all([
    getInnovationsFiltered({
      search: params.q,
      innovationType: params.type,
      developmentStage: params.stage,
      ipStatus: params.ip,
      commercializationStatus: params.commercial,
      centerId: params.center,
      projectId: params.project,
      status: params.status,
      sort: params.sort || "display_order",
      order: params.sort === "title" ? "asc" : "desc",
    }),
    getInnovations(),
    getCenters(),
    getProjects(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Innovation & Partnerships"
        title="Research translated into tools, prototypes, services, and public value."
        body="Explore innovations by type, readiness, intellectual property status, commercialization stage, source project, and center."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Innovation & Partnerships", href: "/innovations" },
          { label: "Innovations" },
        ]}
        imageSrc="/images/research/innovation-partnerships.png"
        imageAlt="Innovation, partnerships, prototypes, and applied research collaborations"
        links={innovationLinks}
        primaryAction={{ label: "View partners", href: "/partners" }}
        stats={[
          { label: "Innovation results", value: innovations.data.length },
          { label: "Published innovations", value: allInnovations.data.length },
          { label: "Centers", value: centers.data.length },
          { label: "Projects", value: projects.data.length },
        ]}
      />

      <ResearchSection
        eyebrow="Innovation Portfolio"
        title="Innovation portfolio"
        body="Innovation records are loaded from the Research Innovations endpoint and filtered through backend query parameters."
        tone="white"
      >
        <InnovationFilters params={params} centers={centers.data} projects={projects.data} />

        {[innovations.error, allInnovations.error, centers.error, projects.error]
          .filter(Boolean)
          .map((error) => (
            <div key={error} className="mt-5">
              <StatusMessage tone="error">{error}</StatusMessage>
            </div>
          ))}

        {innovations.data.length > 0 ? (
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {innovations.data.map((innovation) => (
              <InnovationCard key={innovation.id} innovation={innovation} />
            ))}
          </div>
        ) : (
          <div className="mt-7">
            <StatusMessage>No innovations match the current filters.</StatusMessage>
          </div>
        )}
      </ResearchSection>

      <ResearchSection
        eyebrow="Commercialization"
        title="Pathways from research to adoption"
        body="The innovation section links intellectual property, startup support, partner networks, and public outputs."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <IconCard
            icon="lightbulb"
            title="Technology transfer"
            body="Show available technologies, patent status, licensing opportunities, and invention disclosure guidance."
          />
          <IconCard
            icon="target"
            title="Startups and competitions"
            body="Promote incubator access, accelerator pathways, affiliated startups, and student innovation challenges."
          />
          <IconCard
            icon="handshake"
            title="Innovation ecosystem"
            body="Connect partner networks, commercialization stories, and industry collaboration opportunities."
            href="/partners"
            action="Open partners"
          />
        </div>
      </ResearchSection>
    </main>
  );
}

function InnovationFilters({
  params,
  centers,
  projects,
}: {
  params: InnovationSearchParams;
  centers: ResearchGenericRecord[];
  projects: Array<Record<string, any>>;
}) {
  return (
    <form className="rounded-lg border border-slate-200 bg-slate-50 p-4" action="/innovations">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <label className="xl:col-span-2">
          <span className="text-xs font-semibold uppercase text-slate-500">Search</span>
          <input
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Title, problem, solution, benefit"
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          />
        </label>
        <SelectField name="type" label="Type" value={params.type} options={innovationTypes} />
        <SelectField name="stage" label="Stage" value={params.stage} options={developmentStages} />
        <SelectField name="ip" label="IP" value={params.ip} options={ipStatuses} />
        <SelectField name="commercial" label="Commercial" value={params.commercial} options={commercializationStatuses} />
        <SelectField name="status" label="Status" value={params.status} options={innovationStatuses} />
        <label>
          <span className="text-xs font-semibold uppercase text-slate-500">Sort</span>
          <select
            name="sort"
            defaultValue={params.sort ?? "display_order"}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-primary"
          >
            <option value="display_order">Featured order</option>
            <option value="created_at">Newest</option>
            <option value="trl_level">Technology readiness</option>
            <option value="title">Title</option>
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
            href="/innovations"
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

function InnovationCard({ innovation }: { innovation: ResearchGenericRecord }) {
  return (
    <Link
      href={innovation.slug ? `/innovations/${innovation.slug}` : "/innovations"}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(innovation.innovation_type ?? "innovation")}</Badge>
        {innovation.development_stage ? <Badge>{formatLabel(innovation.development_stage)}</Badge> : null}
        {innovation.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {innovation.title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(innovation.summary) ||
          compactText(innovation.problem_addressed) ||
          compactText(innovation.solution) ||
          "Innovation summary will appear when published."}
      </p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <Fact label="TRL" value={innovation.trl_level ? `Level ${innovation.trl_level}` : ""} />
        <Fact label="Commercial" value={formatLabel(innovation.commercialization_status)} />
      </dl>
      <p className="mt-5 text-sm font-semibold text-primary">View innovation</p>
    </Link>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-950">{value || "Not published"}</dd>
    </div>
  );
}
