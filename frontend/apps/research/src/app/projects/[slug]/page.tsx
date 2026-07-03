import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  Coins,
  Download,
  FileText,
  LineChart,
  Mail,
  Network,
  Phone,
  Tags,
  Target,
  type LucideIcon,
  UserRound,
  UsersRound,
} from "lucide-react";
import { StatusMessage } from "../../../components/research-ui";
import { ResearchRichText } from "../../../components/research-rich-text";
import {
  compactText,
  formatDate,
  formatLabel,
  generateSlugParams,
  getProjectBySlug,
  getProjectPublications,
  getRelatedOutputs,
} from "../../../lib/research-public-data";
import {
  getPublishedFactItems,
  getRecordSummary,
  getRecordTitle,
} from "../../../lib/research-page-model";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getProjectBySlug(slug);
  if (!data) return { title: "Project Not Found" };
  const project = data as ResearchProject & ResearchGenericRecord;
  const title = getRecordTitle(project, "Research Project");
  const desc =
    getRecordSummary(project) ||
    compactText(project.abstract) ||
    `Overview of the ${title} research project.`;
  return { title: `${title} | KSU Research`, description: desc };
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
  const teamMembers = getChildRecords(project, ["team_members", "researchers", "contributors"]);
  const partners = getChildRecords(project, ["partners", "collaborators"]);
  const title = getRecordTitle(project, "Research project");
  const summary = getRecordSummary(project) || compactText(project.abstract);
  const leadName =
    compactText(project.principal_investigator_name) ||
    compactText(project.project_lead_name) ||
    compactText(project.lead_researcher_name) ||
    compactText(project.lead_name);
  const contactEmail = compactText(project.contact_email) || compactText(project.email);
  const briefUrl =
    compactText(project.pdf_url) ||
    compactText(project.file_url) ||
    compactText(project.download_url) ||
    compactText(project.url);
  const coverImage = getProjectCoverImage(project);
  const storySections = getVisibleProjectStorySections(project);
  const milestones = getProjectMilestones(project, publications.data, outputs.data);
  const facts = getPublishedFactItems([
    { label: "Timeline", value: getProjectTimelineLabel(project) },
    { label: "Lead center", value: center ? getRecordTitle(center, "") : "" },
    { label: "Project lead", value: leadName },
    {
      label: "Funding",
      value: formatMoney(project.budget, project.currency) || compactText(project.funder_name),
    },
    { label: "Progress", value: getProjectProgressLabel(project) },
    { label: "Code", value: compactText(project.code) },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white text-slate-950">
      <ProjectHero
        title={title}
        summary={summary}
        coverImage={coverImage}
        project={project}
        contactEmail={contactEmail}
        briefUrl={briefUrl}
        hasEvidence={publications.data.length > 0 || outputs.data.length > 0}
      />

      <ProjectGlance
        project={project}
        center={center}
        program={program}
        leadName={leadName}
        contactEmail={contactEmail}
      />

      {[error, publications.error, outputs.error].filter(Boolean).map((message, i) => (
        <section key={`${message}-${i}`} className="px-4 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{message}</StatusMessage>
          </div>
        </section>
      ))}

      <section className="px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="mx-auto grid max-w-[1680px] gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
          <div className="flex min-w-0 flex-col gap-6">
            {storySections.length > 0 ? (
              <ProjectStoryTable sections={storySections} />
            ) : (
              <EmptyPanel
                title="Project Story"
                message="The project story will appear when the research office publishes the challenge, approach, field work, or outcomes."
              />
            )}
            {publications.data.length > 0 || outputs.data.length > 0 ? (
              <EvidenceOutputs publications={publications.data} outputs={outputs.data} />
            ) : (
              <EmptyPanel
                title="Evidence & Outputs"
                message="Publications, outputs, tools, and reports will appear when they are linked to this project."
              />
            )}
            <ProjectMilestoneTable milestones={milestones} project={project} />
            <LinkedWork
              partners={partners}
              teamMembers={teamMembers}
              center={center}
              program={program}
              project={project}
            />
          </div>

          <aside className="flex flex-col gap-4 xl:sticky xl:top-24">
            <ProjectFactsSidebar
              facts={facts}
              project={project}
              center={center}
              program={program}
              contactEmail={contactEmail}
            />
            <QuickPaths center={center} program={program} project={project} />
            <ContactCard contactEmail={contactEmail} project={project} />
            {partners.length > 0 ? <PartnerChips partners={partners} /> : null}
          </aside>
        </div>
      </section>
    </main>
  );
}

function ProjectHero({
  title,
  summary,
  coverImage,
  project,
  contactEmail,
  briefUrl,
  hasEvidence,
}: {
  title: string;
  summary?: string;
  coverImage: string;
  project: ResearchProject & ResearchGenericRecord;
  contactEmail?: string;
  briefUrl?: string;
  hasEvidence: boolean;
}) {
  const labels = [project.project_type, project.status, project.is_featured ? "featured" : null]
    .map((label) => formatLabel(compactText(label)))
    .filter(Boolean);

  return (
    <section className="relative isolate overflow-hidden bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8 lg:py-9 xl:px-10 2xl:px-12">
      <Image
        src={coverImage}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        priority
        unoptimized
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-slate-950/88 via-slate-950/52 to-slate-950/8" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
      <div className="relative mx-auto max-w-[1680px]">
        <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/75">
          <Link href="/" className="transition hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/projects" className="transition hover:text-white">Projects</Link>
          <span>/</span>
          <span className="text-white">{title}</span>
        </nav>
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-md border border-white/25 bg-primary/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-sm backdrop-blur">
              Research Project
            </span>
            {labels.map((label) => (
              <span key={label} className="rounded-md border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {label}
              </span>
            ))}
          </div>
          <h1 className="mt-3 text-balance font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl lg:max-w-4xl lg:text-6xl">
            {title}
          </h1>
          {summary ? (
            <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-white/90 sm:text-lg">
              {summary}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            {hasEvidence ? (
              <Link
                href="#evidence-outputs"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
              >
                View evidence
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            ) : null}
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                <Mail aria-hidden className="h-4 w-4" />
                Contact lead
              </a>
            ) : null}
            {briefUrl ? (
              <a
                href={briefUrl}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/40 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                <Download aria-hidden className="h-4 w-4" />
                Download brief
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectGlance({
  project,
  center,
  program,
  leadName,
  contactEmail,
}: {
  project: ResearchProject & ResearchGenericRecord;
  center?: ResearchGenericRecord;
  program?: ResearchGenericRecord;
  leadName?: string;
  contactEmail?: string;
}) {
  type GlanceCard = { label: string; value?: string | number; icon: LucideIcon; caption?: string };
  type PublishedGlanceCard = {
    label: string;
    value: string;
    icon: LucideIcon;
    caption: string | undefined;
  };

  const cards = ([
    { label: "Timeline", value: getProjectTimelineLabel(project), icon: CalendarDays, caption: "" },
    {
      label: "Lead center",
      value: center ? getRecordTitle(center, "") : "",
      icon: Building2,
      caption: "Institutional anchor",
    },
    {
      label: "Programme",
      value: program ? getRecordTitle(program, "") : "",
      icon: Network,
      caption: compactText(program?.code),
    },
    { label: "Project lead", value: leadName, icon: UserRound, caption: contactEmail },
    {
      label: "Funding",
      value: formatMoney(project.budget, project.currency) || compactText(project.funder_name),
      icon: Coins,
      caption: "Project budget",
    },
    {
      label: "Progress",
      value: getProjectProgressLabel(project),
      icon: BarChart3,
      caption: formatLabel(compactText(project.status)),
    },
    { label: "Project code", value: compactText(project.code), icon: Tags, caption: formatLabel(compactText(project.project_type)) },
  ] satisfies GlanceCard[]).map((item) => ({
    ...item,
    value: compactText(item.value),
  })).filter((item): item is PublishedGlanceCard => Boolean(item.value));

  if (!cards.length) return null;

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <dl
        className={`mx-auto grid max-w-[1680px] gap-2 sm:grid-cols-2 lg:grid-cols-3 ${
          cards.length <= 5 ? "xl:grid-cols-5" : "xl:grid-cols-7"
        }`}
      >
        {cards.map((fact) => {
          const Icon = fact.icon;
          return (
            <div key={fact.label} className="flex min-h-20 gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <dt className="text-xs font-semibold text-slate-700">{fact.label}</dt>
                <dd className="mt-1 line-clamp-3 break-words text-sm font-semibold leading-5 text-slate-950 [overflow-wrap:anywhere]">
                  {fact.value}
                </dd>
                {fact.caption ? (
                  <p className="mt-1 line-clamp-1 break-words text-xs leading-4 text-slate-600 [overflow-wrap:anywhere]">
                    {fact.caption}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

function ProjectStoryTable({ sections }: { sections: Array<{ title: string; body: string }> }) {
  const icons = [Target, FileText, Network, LineChart, UsersRound];
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-200 px-5 py-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        Project Story
      </h2>
      <div className="divide-y divide-slate-200">
        {sections.map((section, index) => {
          const Icon = icons[index] ?? FileText;
          return (
            <article
              key={section.title}
              className="grid gap-3 px-4 py-4 sm:grid-cols-[270px_minmax(0,1fr)] sm:items-start sm:px-5"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-primary/15 bg-primary/5 text-primary">
                  <Icon aria-hidden className="h-5 w-5" />
                </span>
                <h3 className="text-sm font-semibold text-primary">{section.title}</h3>
              </div>
              <ResearchRichText content={section.body} className="text-sm leading-6 text-slate-700" />
            </article>
          );
        })}
      </div>
    </section>
  );
}

function EvidenceOutputs({
  publications,
  outputs,
}: {
  publications: ResearchPublication[];
  outputs: ResearchGenericRecord[];
}) {
  const groups = [
    publications.length ? { title: "Publications", records: publications, hrefBase: "/publications" } : null,
    outputs.length ? { title: "Outputs", records: outputs, hrefBase: "/outputs" } : null,
  ].filter(Boolean) as Array<{
    title: string;
    records: Array<ResearchPublication | ResearchGenericRecord>;
    hrefBase: string;
  }>;

  return (
    <section id="evidence-outputs" className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-200 px-5 py-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        Evidence & Outputs
      </h2>
      <div className="flex flex-wrap gap-2 border-b border-slate-200 px-5 py-3">
        {groups.map((group) => (
          <span key={group.title} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-primary">
            {group.title} {group.records.length}
          </span>
        ))}
      </div>
      <div className="divide-y divide-slate-200">
        {groups.flatMap((group) =>
          group.records.slice(0, 6).map((record) => {
            const generic = record as ResearchGenericRecord;
            return (
              <Link
                key={`${group.title}-${generic.id}`}
                href={generic.slug ? `${group.hrefBase}/${generic.slug}` : group.hrefBase}
                className="grid gap-2 px-5 py-3 text-sm transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_140px_110px_80px] sm:items-center"
              >
                <span className="min-w-0 truncate font-semibold text-slate-900">
                  {getRecordTitle(generic, group.title)}
                </span>
                <span className="text-xs font-medium text-slate-600">{formatLabel(compactText(generic.output_type) || compactText(generic.publication_type) || group.title.slice(0, -1))}</span>
                <span className="text-xs font-medium text-slate-600">{formatDate(generic.publication_date) || formatDate(generic.created_at)}</span>
                <span className="text-xs font-semibold text-primary">View</span>
              </Link>
            );
          }),
        )}
      </div>
    </section>
  );
}

function ProjectMilestoneTable({
  milestones,
  project,
}: {
  milestones: Array<{ label: string; value: string }>;
  project: ResearchProject & ResearchGenericRecord;
}) {
  const impact = compactText(project.impact) || compactText(project.expected_outcomes);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-200 px-5 py-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        Milestones & Impact
      </h2>
      {milestones.length > 0 ? (
        <div className="hidden grid-cols-[minmax(220px,1fr)_minmax(0,1fr)] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-600 md:grid">
          <span>Milestone</span>
          <span>Published value</span>
        </div>
      ) : null}
      <div className="divide-y divide-slate-200">
        {milestones.map((milestone) => (
          <div key={`${milestone.label}-${milestone.value}`} className="grid gap-2 px-5 py-3 text-sm md:grid-cols-[minmax(220px,1fr)_minmax(0,1fr)]">
            <span className="font-semibold text-primary">{milestone.label}</span>
            <span className="font-medium text-slate-900">{milestone.value}</span>
          </div>
        ))}
      </div>
      {impact ? (
        <div className="border-t border-slate-200 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Impact note</p>
          <ResearchRichText content={impact} className="mt-2 text-sm leading-7 text-slate-700" />
        </div>
      ) : null}
      {milestones.length === 0 && !impact ? (
        <p className="px-5 py-4 text-sm leading-6 text-slate-600">
          Project milestones and impact notes will appear when dates, outputs, or outcomes are published.
        </p>
      ) : null}
    </section>
  );
}

function LinkedWork({
  partners,
  teamMembers,
  center,
  program,
  project,
}: {
  partners: ResearchGenericRecord[];
  teamMembers: ResearchGenericRecord[];
  center?: ResearchGenericRecord;
  program?: ResearchGenericRecord;
  project: ResearchProject & ResearchGenericRecord;
}) {
  const linkedPeople = partners.length > 0 ? partners : teamMembers;
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-200 px-5 py-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        Linked Work
      </h2>
      <div className="grid gap-0 divide-y divide-slate-200 lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <div className="p-5">
          <h3 className="text-sm font-semibold text-primary">Partners and contributors</h3>
          {linkedPeople.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {linkedPeople.slice(0, 10).map((record, index) => (
                <Link
                  key={record.id ?? index}
                  href={record.slug && partners.length > 0 ? `/partners/${record.slug}` : "/team"}
                  className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
                >
                  {getRecordTitle(record, `Contributor ${index + 1}`)}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-600">
              No public partners or team contributors are linked to this project yet.
            </p>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-sm font-semibold text-primary">Useful paths</h3>
          <div className="mt-3 divide-y divide-slate-200 border-t border-slate-200">
            {getExploreLinks(center, program, project).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between gap-4 py-3 text-sm font-semibold text-primary hover:text-secondary"
              >
                {link.label}
                <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-secondary" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectFactsSidebar({
  facts,
  project,
  center,
  program,
  contactEmail,
}: {
  facts: Array<{ label: string; value: string }>;
  project: ResearchProject & ResearchGenericRecord;
  center?: ResearchGenericRecord;
  program?: ResearchGenericRecord;
  contactEmail?: string;
}) {
  const rows = getPublishedFactItems([
    { label: "Lead center", value: center ? getRecordTitle(center, "") : "" },
    { label: "Programme", value: program ? getRecordTitle(program, "") : "" },
    {
      label: "Project lead",
      value: compactText(project.principal_investigator_name) ||
        compactText(project.project_lead_name) ||
        compactText(project.lead_researcher_name),
    },
    { label: "Timeline", value: getProjectTimelineLabel(project) },
    {
      label: "Funding",
      value: formatMoney(project.budget, project.currency) || compactText(project.funder_name),
    },
    { label: "Status", value: formatLabel(compactText(project.status)) },
    { label: "Progress", value: getProjectProgressLabel(project) },
    { label: "Project code", value: compactText(project.code) },
    { label: "Last updated", value: formatDate(project.updated_at) },
  ]);

  const visibleRows = rows.length ? rows : facts;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        Project facts
      </h2>
      {visibleRows.length > 0 ? (
        <dl className="mt-4 divide-y divide-slate-200 border-t border-slate-200">
          {visibleRows.map((fact) => (
            <div key={fact.label} className="grid grid-cols-[120px_minmax(0,1fr)] gap-4 py-3">
              <dt className="text-xs font-semibold text-slate-600">{fact.label}</dt>
              <dd className="break-words text-sm font-medium text-slate-900 [overflow-wrap:anywhere]">
                {fact.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {contactEmail ? (
        <a
          href={`mailto:${contactEmail}`}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-primary/25 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
        >
          <Mail aria-hidden className="h-4 w-4" />
          Contact project lead
        </a>
      ) : null}
    </section>
  );
}

function QuickPaths({
  center,
  program,
  project,
}: {
  center?: ResearchGenericRecord;
  program?: ResearchGenericRecord;
  project: ResearchProject & ResearchGenericRecord;
}) {
  const links = getExploreLinks(center, program, project);
  if (!links.length) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        Quick paths
      </h2>
      <div className="mt-3 divide-y divide-slate-200 border-t border-slate-200">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group flex items-center justify-between gap-4 py-3 text-sm font-semibold text-primary hover:text-secondary"
          >
            {link.label}
            <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-secondary" />
          </Link>
        ))}
      </div>
    </section>
  );
}

function ContactCard({
  contactEmail,
  project,
}: {
  contactEmail?: string;
  project: ResearchProject & ResearchGenericRecord;
}) {
  const phone = compactText(project.contact_phone) || compactText(project.phone);
  if (!contactEmail && !phone) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        Contact
      </h2>
      <p className="mt-3 text-sm text-slate-700">Questions about this project?</p>
      <div className="mt-4 grid gap-3">
        {contactEmail ? (
          <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-sm font-semibold text-primary hover:text-secondary">
            <Mail aria-hidden className="h-4 w-4 shrink-0" />
            <span className="break-all">{contactEmail}</span>
          </a>
        ) : null}
        {phone ? (
          <a href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-3 text-sm font-semibold text-primary hover:text-secondary">
            <Phone aria-hidden className="h-4 w-4 shrink-0" />
            <span>{phone}</span>
          </a>
        ) : null}
      </div>
      {contactEmail ? (
        <a
          href={`mailto:${contactEmail}`}
          className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
        >
          Contact project lead
          <ArrowRight aria-hidden className="h-4 w-4" />
        </a>
      ) : null}
    </section>
  );
}

function PartnerChips({ partners }: { partners: ResearchGenericRecord[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">Partners</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {partners.slice(0, 8).map((partner, index) => (
          <Link
            key={partner.id ?? index}
            href={partner.slug ? `/partners/${partner.slug}` : "/partners"}
            className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-primary transition hover:bg-primary/5"
          >
            {getRecordTitle(partner, `Partner ${index + 1}`)}
          </Link>
        ))}
      </div>
    </section>
  );
}

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
    </section>
  );
}

function getExploreLinks(
  center: ResearchGenericRecord | undefined,
  program: ResearchGenericRecord | undefined,
  project: ResearchProject & ResearchGenericRecord,
) {
  return [
    program?.slug
      ? { label: "More projects in this programme", href: `/programs/${program.slug}` }
      : null,
    center?.slug
      ? { label: "More work from this center", href: `/centers/${center.slug}` }
      : null,
    { label: "Publications from this project", href: `/publications?project=${project.id}` },
    { label: "Research outputs", href: `/outputs?project=${project.id}` },
    { label: "Partner with this research team", href: "/partners" },
  ].filter(Boolean) as Array<{ label: string; href: string }>;
}

function getChildRecords(record: ResearchGenericRecord, fields: string[]) {
  for (const field of fields) {
    if (Array.isArray(record[field])) return record[field] as ResearchGenericRecord[];
  }
  return [];
}

function getProjectCoverImage(project: ResearchProject & ResearchGenericRecord) {
  const coverImage = project.cover_image as ResearchGenericRecord | undefined;
  return (
    compactText(project.cover_image_url) ||
    compactText(coverImage?.url) ||
    compactText(coverImage?.public_url) ||
    compactText(coverImage?.thumbnail_url) ||
    compactText(project.image_url) ||
    compactText(project.thumbnail_url) ||
    "/images/research/research-projects-hero.webp"
  );
}

function getProjectProgress(project: ResearchProject) {
  const progress = Number(project.progress_percentage);
  if (!Number.isFinite(progress)) return null;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

function getProjectProgressLabel(project: ResearchProject) {
  const progress = getProjectProgress(project);
  return progress === null ? "" : `${progress}%`;
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
