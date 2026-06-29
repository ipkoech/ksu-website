import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchRecordPanel,
} from "../../../components/research-detail";
import { Badge, ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  generateSlugParams,
  getProgramBySlug,
  getProgramProjects,
} from "../../../lib/research-public-data";
import {
  getNarrativeSections,
  getRecordSummary,
  getRecordTimelineLabel,
  getRecordTitle,
} from "../../../lib/research-page-model";
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";
import { researchServiceApi } from "@ksu/api-client";

export const revalidate = 300;

export async function generateStaticParams() {
  return generateSlugParams(researchServiceApi.programs.list);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getProgramBySlug(slug);
  if (!data) return { title: "Program Not Found" };
  const program = data as ResearchGenericRecord;
  const title = getRecordTitle(program, "Research Program");
  const desc = getRecordSummary(program) || `Overview of the ${title} research program.`;
  return { title: `${title} | KSU Research`, description: desc };
}

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getProgramBySlug(slug);
  if (!data) notFound();

  const program = data as ResearchGenericRecord;
  const projects = await getProgramProjects(program.id);
  const center = program.center as ResearchGenericRecord | undefined;
  const title = getRecordTitle(program, "Research programme");
  const leadName =
    compactText(program.program_lead_name) ||
    compactText(program.lead_name) ||
    compactText(program.coordinator_name) ||
    compactText(program.principal_investigator_name);
  const contactEmail = compactText(program.contact_email) || compactText(program.email);
  const briefUrl =
    compactText(program.pdf_url) ||
    compactText(program.file_url) ||
    compactText(program.download_url) ||
    compactText(program.url);
  const focusAreas = getChildRecords(program, ["focus_areas", "themes", "areas"]);
  const partners = getChildRecords(program, ["partners", "collaborators"]);
  const storySections = getNarrativeSections(program, [
    { title: "Programme focus", fields: ["summary", "description", "about"] },
    { title: "Why it matters", fields: ["background", "rationale", "need", "mandate"] },
    { title: "How the work moves", fields: ["methodology", "approach", "activities"] },
    { title: "Evidence and outputs", fields: ["expected_outcomes", "deliverables", "outputs_summary"] },
    { title: "Public impact", fields: ["impact", "benefits", "public_value"] },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Research Program"
        title={title}
        body={getRecordSummary(program)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Programs", href: "/programs" },
          { label: title },
        ]}
        labels={[program.program_type, program.status, program.is_featured ? "featured" : null]}
        facts={[
          { label: "Timeline", value: getRecordTimelineLabel(program) },
          { label: "Lead center", value: center ? getRecordTitle(center, "") : "" },
          { label: "Program lead", value: leadName },
          { label: "Active projects", value: projects.data.length },
          { label: "Funding", value: formatMoney(program.budget, program.currency) || compactText(program.funder_name) },
        ]}
        actions={[
          { label: "Back to programs", href: "/programs", variant: "secondary" },
          ...(contactEmail ? [{ label: "Contact program lead", href: `mailto:${contactEmail}` }] : []),
          ...(briefUrl ? [{ label: "Download program brief", href: briefUrl, variant: "secondary" as const }] : []),
        ]}
        imageSrc={compactText(program.cover_image_url) || "/images/research/research-projects-hero.svg"}
        imageAlt="Research program story, project streams, and public impact"
      />

      {[error, projects.error].filter(Boolean).map((message, i) => (
        <section key={i} className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{message}</StatusMessage>
          </div>
        </section>
      ))}

      <ResearchSection
        eyebrow="Program Story"
        title="Focus, delivery, and public value"
        body="Programme details are shown from published backend fields, with no placeholder initiatives or invented outputs."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ProgramStory sections={storySections} />
            <FocusAreaStrip records={focusAreas} />
          </div>
          <ResearchDetailSidebar
            labels={[program.program_type ?? "programme", program.status ?? "active"]}
            facts={[
              { label: "Timeline", value: getRecordTimelineLabel(program) },
              { label: "Lead center", value: center ? getRecordTitle(center, "") : "" },
              { label: "Program lead", value: leadName },
              { label: "Funding", value: formatMoney(program.budget, program.currency) || compactText(program.funder_name) },
              { label: "Code", value: compactText(program.code) },
            ]}
            actions={[
              ...(contactEmail ? [{ label: "Contact program lead", href: `mailto:${contactEmail}` }] : []),
              ...(briefUrl ? [{ label: "Download program brief", href: briefUrl, variant: "secondary" as const }] : []),
              ...(center?.slug ? [{ label: "Hosted by this center", href: `/centers/${center.slug}`, variant: "secondary" as const }] : []),
            ]}
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Active Project Streams"
        title="Projects in this programme"
        body="Only public projects linked to this programme are shown."
      >
        <ProjectStreams projects={projects.data} />
      </ResearchSection>

      <ResearchSection
        eyebrow="Evidence & Public Paths"
        title="Partners, outputs, and ways to engage"
        body="The programme page surfaces backend-linked contributors and next public actions when they exist."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <ResearchRecordPanel
            title="Partners in the programme"
            records={partners}
            hrefBase="/partners"
            empty="No public partners are linked to this programme yet."
          />
          <ExploreProgram center={center} program={program} />
        </div>
      </ResearchSection>
    </main>
  );
}

function ProgramStory({ sections }: { sections: Array<{ title: string; body: string }> }) {
  if (sections.length === 0) {
    return (
      <StatusMessage>
        The programme story will appear when focus, approach, outputs, or impact fields are published.
      </StatusMessage>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      {sections.map((section, index) => (
        <details key={section.title} className="group border-b border-slate-200 last:border-b-0" open={index === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-slate-950 transition hover:bg-slate-50">
            {section.title}
            <span className="text-primary transition group-open:rotate-45">+</span>
          </summary>
          <p className="px-5 pb-5 text-sm leading-7 text-slate-600">{section.body}</p>
        </details>
      ))}
    </section>
  );
}

function FocusAreaStrip({ records }: { records: ResearchGenericRecord[] }) {
  if (records.length === 0) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Focus areas</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {records.slice(0, 8).map((record, index) => (
          <div key={record.id ?? index} className="rounded-md bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-950">
              {getRecordTitle(record, `Focus area ${index + 1}`)}
            </p>
            {getRecordSummary(record) ? (
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">
                {getRecordSummary(record)}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function ProjectStreams({ projects }: { projects: ResearchProject[] }) {
  if (projects.length === 0) {
    return <StatusMessage>No public projects are currently linked to this programme.</StatusMessage>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid grid-cols-[minmax(0,1.4fr)_120px_120px_120px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-500 max-lg:hidden">
        <span>Project</span>
        <span>Status</span>
        <span>Progress</span>
        <span>Timeline</span>
      </div>
      <div className="divide-y divide-slate-200">
        {projects.slice(0, 8).map((project) => (
          <Link
            key={project.id}
            href={project.slug ? `/projects/${project.slug}` : "/projects"}
            className="grid gap-3 px-4 py-4 transition hover:bg-slate-50 lg:grid-cols-[minmax(0,1.4fr)_120px_120px_120px] lg:items-center"
          >
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge>{formatLabel(project.project_type ?? "research")}</Badge>
                {project.is_featured ? <Badge>Featured</Badge> : null}
              </div>
              <h3 className="mt-2 text-base font-semibold leading-6 text-slate-950">{project.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">
                {compactText(project.summary) || compactText(project.abstract) || "Project summary has not been published yet."}
              </p>
            </div>
            <span className="text-sm font-semibold text-slate-700">{formatLabel(project.status ?? "ongoing")}</span>
            <span className="text-sm font-semibold text-slate-700">{project.progress_percentage ?? 0}%</span>
            <span className="text-sm font-semibold text-slate-700">{formatProjectTimeline(project)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ExploreProgram({
  center,
  program,
}: {
  center?: ResearchGenericRecord;
  program: ResearchGenericRecord;
}) {
  const links = [
    { label: "View projects", href: `/projects?program=${program.id}` },
    { label: "Browse publications", href: "/publications" },
    center?.slug ? { label: "More from this center", href: `/centers/${center.slug}` } : null,
    { label: "Partner with this programme", href: "/partners" },
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

function getChildRecords(record: ResearchGenericRecord, fields: string[]) {
  for (const field of fields) {
    if (Array.isArray(record[field])) return record[field] as ResearchGenericRecord[];
  }
  return [];
}

function formatProjectTimeline(project: ResearchProject) {
  return [formatDate(project.start_date), formatDate(project.end_date)].filter(Boolean).join(" - ") || "Not published";
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
