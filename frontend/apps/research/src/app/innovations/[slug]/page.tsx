import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchFact,
  ResearchRecordPanel,
  ResearchRelationshipCard,
  ResearchTextPanel,
} from "../../../components/research-detail";
import {
  Badge,
  ResearchSection,
  StatusMessage,
} from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getCenters,
  getInnovationBySlug,
  getProjects,
  getRelatedOutputs,
} from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function InnovationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getInnovationBySlug(slug);
  if (!data) notFound();

  const innovation = data as ResearchGenericRecord;
  const [projects, centers, outputs] = await Promise.all([
    getProjects(),
    getCenters(),
    innovation.project_id
      ? getRelatedOutputs({ projectId: innovation.project_id })
      : Promise.resolve({ data: [], error: null }),
  ]);
  const project = projects.data.find((item) => item.id === innovation.project_id);
  const center = centers.data.find((item) => item.id === innovation.center_id);
  const inventors = Array.isArray(innovation.inventors)
    ? (innovation.inventors as ResearchGenericRecord[])
    : [];
  const awards = Array.isArray(innovation.awards)
    ? (innovation.awards as ResearchGenericRecord[])
    : [];

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Innovation"
        title={innovation.title ?? "Innovation"}
        body={compactText(innovation.summary) || compactText(innovation.problem_addressed)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Innovations", href: "/innovations" },
          { label: innovation.title ?? "Innovation" },
        ]}
        labels={[innovation.innovation_type, innovation.development_stage, innovation.status]}
        facts={[
          { label: "TRL", value: innovation.trl_level ? `TRL ${innovation.trl_level}` : "" },
          { label: "IP status", value: formatLabel(innovation.ip_status) },
          { label: "Commercialization", value: formatLabel(innovation.commercialization_status) },
          { label: "Outputs", value: outputs.data.length },
        ]}
        actions={[
          { label: "Back to innovations", href: "/innovations", variant: "secondary" },
          ...(project?.slug ? [{ label: "View project", href: `/projects/${project.slug}` }] : []),
        ]}
        imageSrc="/images/research/innovation-partnerships.png"
        imageAlt="Innovation profile with readiness, intellectual property, and adoption context"
      />

      {[error, projects.error, centers.error, outputs.error]
        .filter(Boolean)
        .map((message) => (
          <section key={message} className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
              <StatusMessage tone="error">{message}</StatusMessage>
            </div>
          </section>
        ))}

      <ResearchSection
        eyebrow="Innovation Profile"
        title="Problem, solution, and adoption pathway"
        body="Innovation detail uses public labels for technology readiness, IP position, commercialization, inventors, and outputs."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            <ResearchTextPanel
              title="Problem and solution"
              fields={[
                ["Problem addressed", innovation.problem_addressed],
                ["Solution", innovation.solution],
                ["Benefits", innovation.benefits],
                ["Applications", innovation.applications],
                ["Target users", innovation.target_users],
              ]}
            />
            <ResearchTextPanel
              title="Description"
              fields={[
                ["Summary", innovation.summary],
                ["Description", innovation.description],
              ]}
            />
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(innovation.innovation_type ?? "innovation")}</Badge>
              {innovation.development_stage ? <Badge>{formatLabel(innovation.development_stage)}</Badge> : null}
              {innovation.status ? <Badge>{formatLabel(innovation.status)}</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <ResearchFact label="Technology readiness" value={innovation.trl_level ? `TRL ${innovation.trl_level}` : ""} />
              <ResearchFact label="IP status" value={formatLabel(innovation.ip_status)} />
              <ResearchFact label="Commercialization" value={formatLabel(innovation.commercialization_status)} />
              <ResearchFact label="Patent" value={compactText(innovation.patent_number)} />
              <ResearchFact label="Invention date" value={formatDate(innovation.invention_date)} />
            </dl>
          </aside>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Relationships"
        title="Research context, sponsors, and outputs"
        body="Related projects, partners, centers, and outputs appear when linked public records are available."
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <ResearchRelationshipCard
            title="Source project"
            record={project}
            hrefBase="/projects"
            empty="No public project is linked to this innovation."
          />
          <ResearchRelationshipCard
            title="Connected center"
            record={center}
            hrefBase="/centers"
            empty="No public center is linked to this innovation."
          />
          <ResearchRecordPanel title="Related outputs" records={outputs.data} hrefBase="/outputs" />
          <ResearchRecordPanel title="Inventors" records={inventors} />
          <ResearchRecordPanel title="Awards" records={awards} />
          <ResearchTextPanel
            title="Commercial notes"
            fields={[
              ["License type", innovation.license_type],
              ["Commercial value", formatMoney(innovation.commercial_value, innovation.currency)],
              ["Revenue generated", formatMoney(innovation.revenue_generated, innovation.currency)],
              ["Video", innovation.video_url],
            ]}
          />
        </div>
      </ResearchSection>
    </main>
  );
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
