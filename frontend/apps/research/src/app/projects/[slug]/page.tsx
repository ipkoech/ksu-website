import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRecordPanel,
  ResearchRelationshipCard,
  ResearchTextPanel,
} from "../../../components/research-detail";
import { ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  getProjectBySlug,
  getProjectPublications,
  getRelatedOutputs,
} from "../../../lib/research-public-data";
import type { ResearchGenericRecord, ResearchProject, ResearchPublication } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getProjectBySlug(slug);
  if (!data) notFound();

  const project = data as ResearchProject & ResearchGenericRecord;
  const [publications, outputs] = await Promise.all([
    getProjectPublications(project.id),
    getRelatedOutputs({ projectId: project.id }),
  ]);
  const program = project.program as ResearchGenericRecord | undefined;
  const center = project.center as ResearchGenericRecord | undefined;
  const teamMembers = Array.isArray(project.team_members)
    ? (project.team_members as ResearchGenericRecord[])
    : [];

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Research Project"
        title={project.title}
        body={compactText(project.summary) || compactText(project.abstract)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "/projects" },
          { label: project.title },
        ]}
        labels={[project.project_type, project.status, project.is_featured ? "featured" : null]}
        facts={[
          { label: "Progress", value: `${project.progress_percentage ?? 0}%` },
          { label: "Start", value: formatDate(project.start_date) },
          { label: "End", value: formatDate(project.end_date) },
          { label: "Budget", value: formatMoney(project.budget, project.currency) },
        ]}
        actions={[
          { label: "Back to projects", href: "/projects", variant: "secondary" },
          ...(center?.slug ? [{ label: "View center", href: `/centers/${center.slug}` }] : []),
        ]}
        imageSrc="/images/research/research-home-hero.svg"
        imageAlt="Research project profile and related outputs"
      />

      {[error, publications.error, outputs.error]
        .filter(Boolean)
        .map((message) => (
          <section key={message} className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
              <StatusMessage tone="error">{message}</StatusMessage>
            </div>
          </section>
        ))}

      <ResearchSection
        eyebrow="Project Profile"
        title="Research design and public value"
        body="Project details are presented with related publications, outputs, team members, and partnerships."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ResearchTextPanel
              title="Overview"
              fields={[
                ["Background", project.background],
                ["Abstract", project.abstract],
                ["Objectives", project.objectives],
              ]}
            />
            <ResearchTextPanel
              title="Method and Outputs"
              fields={[
                ["Methodology", project.methodology],
                ["Expected outcomes", project.expected_outcomes],
                ["Deliverables", project.deliverables],
                ["Impact", project.impact],
              ]}
            />
          </div>

          <ResearchDetailSidebar
            labels={[project.project_type ?? "research", project.status ?? "ongoing"]}
            facts={[
              { label: "Progress", value: `${project.progress_percentage ?? 0}%` },
              { label: "Start", value: formatDate(project.start_date) },
              { label: "End", value: formatDate(project.end_date) },
              { label: "Budget", value: formatMoney(project.budget, project.currency) },
              { label: "Code", value: compactText(project.code) },
            ]}
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Relationships"
        title="How this project connects"
        body="Relationships are shown in public language: hosted by, part of, produced outputs, publications, and team."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <ResearchRelationshipCard
            title="Part of this program"
            record={program}
            hrefBase="/programs"
            empty="No parent program has been published for this project."
          />
          <ResearchRelationshipCard
            title="Hosted by this center"
            record={center}
            hrefBase="/centers"
            empty="No hosting center has been published for this project."
          />
          <PublicationPanel records={publications.data} />
          <ResearchRecordPanel
            title="Research outputs"
            records={outputs.data}
            hrefBase="/outputs"
            empty="No public outputs are linked to this project yet."
          />
          <ResearchRecordPanel
            title="Project team"
            records={teamMembers}
            empty="No public team members are linked to this project yet."
          />
        </div>
      </ResearchSection>
    </main>
  );
}

function PublicationPanel({ records }: { records: ResearchPublication[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Related publications</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 5).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-base font-semibold text-slate-950">
              {record.slug ? (
                <Link href={`/publications/${record.slug}`} className="transition hover:text-primary">
                  {record.title}
                </Link>
              ) : (
                record.title
              )}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {[record.journal_name, record.year, record.doi].map(compactText).filter(Boolean).join(" · ")}
            </p>
          </article>
        ))}
        {records.length === 0 ? (
          <p className="py-4 text-sm text-slate-600">
            No public publications are linked to this project yet.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
