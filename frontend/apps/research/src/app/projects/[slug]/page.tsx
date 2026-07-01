import { notFound } from "next/navigation";
import Link from "next/link";
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
  generateSlugParams,
  getProjectBySlug,
  getProjectPublications,
  getRelatedOutputs,
} from "../../../lib/research-public-data";
import type { ResearchGenericRecord, ResearchProject, ResearchPublication } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";
import {
  getProjectTimelineLabel,
  getVisibleProjectStorySections,
} from "../project-page-model";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.projects.list);
}

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
  const partners = Array.isArray(project.partners)
    ? (project.partners as ResearchGenericRecord[])
    : [];
  const storySections = getVisibleProjectStorySections(project);
  const milestones = getProjectMilestones(project, publications.data, outputs.data);
  const leadName = compactText(project.principal_investigator_name) ||
    compactText(project.project_lead_name) ||
    compactText(project.lead_researcher_name);
  const contactEmail = compactText(project.contact_email) || compactText(project.email);
  const briefUrl = compactText(project.pdf_url) || compactText(project.file_url) || compactText(project.url);

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
          { label: "Timeline", value: getProjectTimelineLabel(project) },
          { label: "Lead center", value: center ? compactText(center.name ?? center.title) : "" },
          { label: "Project lead", value: leadName },
          { label: "Funding", value: formatMoney(project.budget, project.currency) || compactText(project.funder_name) },
          { label: "Status", value: compactText(project.status) || `${project.progress_percentage ?? 0}%` },
        ]}
        actions={[
          { label: "Back to projects", href: "/projects", variant: "secondary" },
          ...(contactEmail ? [{ label: "Contact project lead", href: `mailto:${contactEmail}` }] : []),
          ...(briefUrl ? [{ label: "Download brief", href: briefUrl, variant: "secondary" as const }] : []),
        ]}
        imageSrc={compactText(project.cover_image_url) || "/images/research/research-home-hero.svg"}
        imageAlt="Research project story, outputs, and public impact"
      />

      {[error, publications.error, outputs.error]
        .filter(Boolean)
        .map((message, i) => (
          <section key={i} className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
              <StatusMessage tone="error">{message}</StatusMessage>
            </div>
          </section>
        ))}

      <ResearchSection
        eyebrow="The Project Story"
        title="From research question to public value"
        body="This page presents the challenge, idea, field work, evidence, and public outcomes behind the project."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ProjectStory sections={storySections} />
          </div>

          <ResearchDetailSidebar
            labels={[project.project_type ?? "research", project.status ?? "ongoing"]}
            facts={[
              { label: "Timeline", value: getProjectTimelineLabel(project) },
              { label: "Lead center", value: center ? compactText(center.name ?? center.title) : "" },
              { label: "Project lead", value: leadName },
              { label: "Funding", value: formatMoney(project.budget, project.currency) || compactText(project.funder_name) },
              { label: "Progress", value: `${project.progress_percentage ?? 0}%` },
              { label: "Code", value: compactText(project.code) },
            ]}
            actions={[
              ...(contactEmail ? [{ label: "Contact project lead", href: `mailto:${contactEmail}` }] : []),
              ...(briefUrl ? [{ label: "Download brief", href: briefUrl, variant: "secondary" as const }] : []),
              ...(center?.slug ? [{ label: "Hosted by this center", href: `/centers/${center.slug}`, variant: "secondary" as const }] : []),
              ...(program?.slug ? [{ label: "Part of this programme", href: `/programs/${program.slug}`, variant: "secondary" as const }] : []),
            ]}
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Evidence & Outputs"
        title="What this project produced"
        body="Publications, outputs, tools, and project materials appear here when they are published by the research office."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <PublicationPanel records={publications.data} />
          <ResearchRecordPanel
            title="Data, tools, and reports"
            records={outputs.data}
            hrefBase="/outputs"
            empty="No public outputs are linked to this project yet."
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Research Journey"
        title="Milestones and public impact"
        body="Known dates, outputs, and impact notes are shown without inventing project events."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <Milestones milestones={milestones} />
          <ImpactStories project={project} />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="People & Public Pathways"
        title="Partners in the work and where to go next"
        body="The project is presented through its programme, center, team, contributors, and next useful public paths."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <ResearchRecordPanel
            title="Partners in the work"
            records={partners.length > 0 ? partners : teamMembers}
            hrefBase="/partners"
            empty="No public partners or team contributors are linked to this project yet."
          />
          <ExploreNext center={center} program={program} project={project} />
        </div>
      </ResearchSection>
    </main>
  );
}

function ProjectStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  return (
    <ResearchStoryAccordion
      sections={sections}
      empty="The project story will appear here when the research office publishes the challenge, field work, and outcomes."
    />
  );
}

function PublicationPanel({ records }: { records: ResearchPublication[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Publications</h2>
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

function Milestones({
  milestones,
}: {
  milestones: Array<{ label: string; value: string }>;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Milestones</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {milestones.map((milestone) => (
          <div key={`${milestone.label}-${milestone.value}`} className="rounded-md bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase text-secondary">{milestone.label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-950">{milestone.value}</p>
          </div>
        ))}
        {milestones.length === 0 ? (
          <p className="text-sm leading-6 text-slate-600">
            Project milestones will appear here when dates or outputs are published.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function ImpactStories({
  project,
}: {
  project: ResearchProject & ResearchGenericRecord;
}) {
  const impact = compactText(project.impact) || compactText(project.expected_outcomes);

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Impact stories</h2>
      {impact ? (
        <p className="mt-3 text-sm leading-7 text-slate-600">{impact}</p>
      ) : (
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Impact stories will appear here when published by the research office.
        </p>
      )}
    </section>
  );
}

function ExploreNext({
  center,
  program,
  project,
}: {
  center?: ResearchGenericRecord;
  program?: ResearchGenericRecord;
  project: ResearchProject & ResearchGenericRecord;
}) {
  const links = [
    program?.slug
      ? {
          label: "More projects in this programme",
          href: `/programs/${program.slug}`,
        }
      : null,
    center?.slug
      ? {
          label: "More work from this center",
          href: `/centers/${center.slug}`,
        }
      : null,
    {
      label: "Publications from this theme",
      href: `/publications?project=${project.id}`,
    },
    {
      label: "Partner with this research team",
      href: "/partners",
    },
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Explore next</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-md border border-slate-200 p-3 text-sm font-semibold text-primary transition hover:border-primary/30 hover:bg-primary/5"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function getProjectMilestones(
  project: ResearchProject,
  publications: ResearchPublication[],
  outputs: ResearchGenericRecord[],
) {
  return [
    { label: "Project opened", value: formatDate(project.start_date) },
    { label: "Last updated", value: formatDate(project.updated_at) },
    publications[0]
      ? { label: "First publication", value: formatDate(publications[0].publication_date) || compactText(publications[0].year) }
      : null,
    outputs[0]
      ? { label: "First output", value: formatDate(outputs[0].published_at) || formatDate(outputs[0].created_at) }
      : null,
    { label: "Project closes", value: formatDate(project.end_date) },
  ].filter((item): item is { label: string; value: string } => Boolean(item?.value));
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
