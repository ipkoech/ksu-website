import { notFound } from "next/navigation";
import Link from "next/link";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRecordPanel,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import { ResearchStoryAccordion } from "../../../components/research-rich-text";
import {
  compactText,
  formatDate,
  formatLabel,
  generateSlugParams,
  getCenters,
  getInnovationBySlug,
  getProjects,
  getRelatedOutputs,
} from "../../../lib/research-public-data";
import {
  getNarrativeSections,
  getRecordSummary,
  getRecordTitle,
} from "../../../lib/research-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.innovations.list);
}

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
      : Promise.resolve({ data: [], total: 0, perPage: 100, error: null }),
  ]);
  const project = projects.data.find((item) => item.id === innovation.project_id);
  const center = centers.data.find((item) => item.id === innovation.center_id);
  const inventors = Array.isArray(innovation.inventors)
    ? (innovation.inventors as ResearchGenericRecord[])
    : [];
  const awards = Array.isArray(innovation.awards)
    ? (innovation.awards as ResearchGenericRecord[])
    : [];
  const title = getRecordTitle(innovation, "Innovation");
  const contactEmail = compactText(innovation.contact_email) || compactText(innovation.email);
  const demoUrl = compactText(innovation.demo_url) || compactText(innovation.video_url) || compactText(innovation.url);
  const storySections = getNarrativeSections(innovation, [
    { title: "The problem", fields: ["problem_addressed", "need", "background"] },
    { title: "The solution", fields: ["solution", "description", "summary"] },
    { title: "Where it can be used", fields: ["applications", "target_users", "use_cases"] },
    { title: "Public benefit", fields: ["benefits", "impact", "public_value"] },
    { title: "Adoption path", fields: ["commercialization_notes", "next_steps", "license_type"] },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Innovation"
        title={title}
        body={getRecordSummary(innovation) || compactText(innovation.problem_addressed)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Innovations", href: "/innovations" },
          { label: title },
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
          ...(project?.slug ? [{ label: "View source project", href: `/projects/${project.slug}` }] : []),
          ...(contactEmail ? [{ label: "Contact innovation lead", href: `mailto:${contactEmail}` }] : []),
          ...(demoUrl ? [{ label: "Open demo", href: demoUrl, variant: "secondary" as const }] : []),
        ]}
        imageSrc={compactText(innovation.cover_image_url) || "/images/research/research-innovation-hero.svg"}
        imageAlt="Innovation profile with readiness, intellectual property, and adoption context"
      />

      {[error, projects.error, centers.error, outputs.error]
        .filter(Boolean)
        .map((message, i) => (
          <section key={i} className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
              <StatusMessage tone="error">{message}</StatusMessage>
            </div>
          </section>
        ))}

      <ResearchSection
        eyebrow="Innovation Story"
        title="Problem, solution, readiness, and adoption"
        body="Innovation details are shown from published backend fields for readiness, IP position, commercialization, inventors, and outputs."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <InnovationStory sections={storySections} />
            <SourceContext project={project} center={center} />
          </div>
          <ResearchDetailSidebar
            labels={[innovation.innovation_type ?? "innovation", innovation.development_stage, innovation.status]}
            facts={[
              { label: "Technology readiness", value: innovation.trl_level ? `TRL ${innovation.trl_level}` : "" },
              { label: "IP status", value: formatLabel(innovation.ip_status) },
              { label: "Commercialization", value: formatLabel(innovation.commercialization_status) },
              { label: "Patent", value: compactText(innovation.patent_number) },
              { label: "Invention date", value: formatDate(innovation.invention_date) },
              { label: "Commercial value", value: formatMoney(innovation.commercial_value, innovation.currency) },
            ]}
            actions={[
              ...(project?.slug ? [{ label: "View source project", href: `/projects/${project.slug}` }] : []),
              ...(contactEmail ? [{ label: "Contact innovation lead", href: `mailto:${contactEmail}` }] : []),
              ...(demoUrl ? [{ label: "Open demo", href: demoUrl, variant: "secondary" as const }] : []),
            ]}
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Evidence & Adoption"
        title="Outputs, inventors, awards, and next paths"
        body="Linked public records are shown only when they are available from the backend."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <ResearchRecordPanel title="Data, tools, and reports" records={outputs.data} hrefBase="/outputs" />
          <ResearchRecordPanel title="Inventors" records={inventors} />
          <ResearchRecordPanel title="Awards" records={awards} />
          <CommercialNotes innovation={innovation} />
        </div>
      </ResearchSection>
    </main>
  );
}

function InnovationStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="The innovation story will appear when problem, solution, benefit, or adoption fields are published."
    />
  );
}

function SourceContext({
  project,
  center,
}: {
  project?: ResearchGenericRecord;
  center?: ResearchGenericRecord;
}) {
  if (!project && !center) {
    return (
      <StatusMessage>
        Source project and center details will appear when linked public records are available.
      </StatusMessage>
    );
  }

  const cards = [
    project
      ? {
          label: "Source project",
          title: getRecordTitle(project, "Research project"),
          href: project.slug ? `/projects/${project.slug}` : "/projects",
          body: getRecordSummary(project),
        }
      : null,
    center
      ? {
          label: "Hosted by this center",
          title: getRecordTitle(center, "Research center"),
          href: center.slug ? `/centers/${center.slug}` : "/centers",
          body: getRecordSummary(center),
        }
      : null,
  ].filter(Boolean) as Array<{ label: string; title: string; href: string; body: string }>;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Source context</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded-md border border-slate-200 p-3 transition hover:border-primary/30 hover:bg-primary/5"
          >
            <p className="text-xs font-semibold uppercase text-secondary">{card.label}</p>
            <h3 className="mt-2 text-base font-semibold text-slate-950">{card.title}</h3>
            {card.body ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{card.body}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

function CommercialNotes({ innovation }: { innovation: ResearchGenericRecord }) {
  const notes = [
    { label: "License type", value: compactText(innovation.license_type) },
    { label: "Commercial value", value: formatMoney(innovation.commercial_value, innovation.currency) },
    { label: "Revenue generated", value: formatMoney(innovation.revenue_generated, innovation.currency) },
    { label: "Video", value: compactText(innovation.video_url) },
  ].filter((item) => item.value);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Commercial notes</h2>
      {notes.length > 0 ? (
        <dl className="mt-4 grid gap-3 text-sm">
          {notes.map((item) => (
            <div key={item.label} className="rounded-md bg-slate-50 p-3">
              <dt className="text-xs font-semibold uppercase text-slate-500">{item.label}</dt>
              <dd className="mt-1 break-words font-semibold text-slate-950">{item.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Commercial notes will appear when licensing, value, or adoption fields are published.
        </p>
      )}
    </section>
  );
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
