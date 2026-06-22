import type { Metadata } from "next";
import Link from "next/link";
import { Banknote, Handshake, Lightbulb, Network } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFilterForm } from "../../components/research-listing";
import { ResearchFact } from "../../components/research-detail";
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
        body="Browse innovations by type, stage, IP status, commercialization status, center, and keyword."
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
    <ResearchFilterForm
      action="/innovations"
      resetHref="/innovations"
      searchValue={params.q}
      searchPlaceholder="Title, problem, solution, benefit"
      selects={[
        { name: "type", label: "Type", value: params.type, options: innovationTypes },
        { name: "stage", label: "Stage", value: params.stage, options: developmentStages },
        { name: "ip", label: "IP", value: params.ip, options: ipStatuses },
        { name: "commercial", label: "Commercial", value: params.commercial, options: commercializationStatuses },
        { name: "status", label: "Status", value: params.status, options: innovationStatuses },
      ]}
      centers={centers}
      centerValue={params.center}
      projects={projects}
      projectValue={params.project}
      sortValue={params.sort}
      sortOptions={[
        { value: "display_order", label: "Featured order" },
        { value: "created_at", label: "Newest" },
        { value: "trl_level", label: "Technology readiness" },
        { value: "title", label: "Title" },
      ]}
    />
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
        <ResearchFact label="TRL" value={innovation.trl_level ? `Level ${innovation.trl_level}` : ""} />
        <ResearchFact label="Commercial" value={formatLabel(innovation.commercialization_status)} />
      </dl>
      <p className="mt-5 text-sm font-semibold text-primary">View innovation</p>
    </Link>
  );
}
