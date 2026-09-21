import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Download,
  ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { ResearchBackground } from "../../../components/research-background";
import { StatusMessage } from "../../../components/research-ui";
import { ResearchRichText } from "../../../components/research-rich-text";
import {
  compactText,
  formatDate,
  formatLabel,
  getProjectBySlug,
  getProjectPublications,
  getRelatedOutputs,
} from "../../../lib/research-public-data";
import {
  ProjectEditorialStory,
  ProjectEvidenceSection,
  projectMediaRecords,
} from "../../../components/project-detail-sections";
import { getRecordSummary, getRecordTitle } from "../../../lib/research-page-model";
import type { ResearchGenericRecord, ResearchProject, ResearchPublication } from "@ksu/api-client/server";
import {
  getProjectTimelineLabel,
  getVisibleProjectStorySections,
} from "../project-page-model";
import { researchRecordMetadata } from "../../../lib/research-metadata";
import {
  ProjectGlanceDisplay,
  type ProjectGlanceDto,
} from "../../../components/project-glance-display";

export const revalidate = 300;
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await getProjectBySlug(slug);
  return researchRecordMetadata(data, { fallbackTitle: "Project", pathname: "/projects/" + slug });
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
  const partners = getChildRecords(project, ["partners"]);
  const title = getRecordTitle(project, "Research project");
  const summary = getRecordSummary(project) || compactText(project.abstract);
  const leadName =
    compactText(project.principal_investigator_name) ||
    compactText(project.project_lead_name) ||
    compactText(project.lead_researcher_name) ||
    compactText(project.lead_name) ||
    getResolvedLeadName(teamMembers);
  const contactEmail = compactText(project.contact_email) || compactText(project.email);
  const coverImage = getProjectCoverImage(project);
  const storySections = getVisibleProjectStorySections(project);
  const milestones = getProjectMilestones(project, publications.data, outputs.data);
  const glanceCards = ([
    { label: "Timeline", value: getProjectTimelineLabel(project), icon: "calendar" },
    { label: "Lead center", value: center ? getRecordTitle(center, "") : "", caption: "Institutional anchor", icon: "building" },
    { label: "Programme", value: program ? getRecordTitle(program, "") : "", caption: compactText(program?.code), icon: "network" },
    { label: "Project lead", value: leadName || "", caption: contactEmail, icon: "user" },
    { label: "School", value: compactText(project.school_name), icon: "building" },
    { label: "Funding", value: formatMoney(project.budget, project.currency) || compactText(project.funder_name), caption: project.budget ? compactText(project.funder_name) : "Funding organization", icon: "coins" },
    { label: "Progress", value: getProjectProgressLabel(project), caption: formatLabel(compactText(project.status)), icon: "chart" },
    { label: "Project code", value: compactText(project.code), caption: formatLabel(compactText(project.project_type)), icon: "tags" },
  ] satisfies ProjectGlanceDto[]).filter((card) => Boolean(card.value));
  return (
    <ResearchBackground as="main" id="research-main" variant="evidence" intensity="soft" className="min-h-screen text-foreground">
      <ProjectHero
        title={title}
        summary={summary}
        coverImage={coverImage}
        project={project}
      />

      <ProjectGlanceDisplay cards={glanceCards} />

      {[error].filter(Boolean).map((message, i) => (
        <section key={`${message}-${i}`} className="px-4 pt-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{message}</StatusMessage>
          </div>
        </section>
      ))}

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12 xl:px-10 2xl:px-12">
        <div className="mx-auto max-w-[1680px]">
          <div className="flex min-w-0 flex-col gap-6">
            {storySections.length > 0 ? (
              <ProjectEditorialStory sections={storySections} project={project} center={center} program={program} leadName={leadName} contactEmail={contactEmail} />
            ) : (
              <EmptyPanel
                title="Project Story"
                message="The project story will appear when the research office publishes the challenge, approach, field work, or outcomes."
              />
            )}
            {publications.data.length > 0 || outputs.data.length > 0 ? (
              <ProjectEvidenceSection publications={publications.data} outputs={outputs.data} />
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
            <ProjectDocumentsMedia project={project} />
          </div>
        </div>
      </section>
      <ProjectPartnershipCta />
    </ResearchBackground>
  );
}

function getResolvedLeadName(teamMembers: ResearchGenericRecord[]): string {
  const lead =
    teamMembers.find((member) =>
      ["pi", "principal_investigator", "lead_researcher"].includes(compactText(member.role).toLowerCase()),
    ) || teamMembers[0];
  return lead ? getRecordTitle(lead, "") : "";
}

function ProjectHero({
  title,
  summary,
  coverImage,
  project,
}: {
  title: string;
  summary?: string;
  coverImage: string;
  project: ResearchProject & ResearchGenericRecord;
}) {
  const labels = [project.project_type, project.status, project.is_featured ? "featured" : null]
    .map((label) => formatLabel(compactText(label)))
    .filter(Boolean);

  return (
    <section className="relative isolate flex min-h-[430px] items-end overflow-hidden bg-brand-overlay px-4 pb-16 pt-10 text-white sm:px-6 lg:min-h-[520px] lg:px-8 lg:pb-20 xl:px-10 2xl:px-12">
      <Image
        src={coverImage}
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        priority
        unoptimized
      />
      <div aria-hidden className="absolute inset-0 bg-[linear-gradient(95deg,hsl(var(--brand-overlay)/0.94)_0%,hsl(var(--primary)/0.66)_46%,transparent_86%)] mix-blend-multiply" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-white/20" />
      <div className="relative mx-auto max-w-[1680px]">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-white/75">
          <Link href="/" className="transition hover:text-white">Home</Link>
          <span>/</span>
          <Link href="/projects" className="transition hover:text-white">Projects</Link>
          <span>/</span>
          <span aria-current="page" className="text-white">{title}</span>
        </nav>
        <div className="max-w-4xl">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-md border border-white/25 bg-primary/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm backdrop-blur">
              Research Project
            </span>
            {labels.map((label) => (
              <span key={label} className="rounded-md border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                {label}
              </span>
            ))}
          </div>
          <h1 className="mt-4 text-balance font-display text-4xl font-semibold leading-[1.05] sm:text-5xl lg:max-w-5xl lg:text-6xl">
            {title}
          </h1>
          {summary ? (
            <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-white/90 sm:text-lg">
              {summary}
            </p>
          ) : null}
        </div>
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
  const progress = getProjectProgress(project);

  return (
    <section className="overflow-hidden rounded-2xl border border-primary/15 bg-white/88 shadow-[0_22px_60px_-48px_hsl(var(--primary)/0.65)] backdrop-blur-sm">
      <h2 className="border-b border-border px-5 py-4 font-display text-xl font-semibold text-foreground">
        Milestones & Impact
      </h2>
      <div className={progress !== null ? "grid lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center" : ""}>
        {progress !== null ? <div className="flex justify-center px-5 py-7"><div className="grid h-32 w-32 place-items-center rounded-full" style={{ background: `conic-gradient(hsl(var(--primary)) ${progress}%, hsl(var(--primary) / 0.1) ${progress}% 100%)` }}><div className="grid h-24 w-24 place-items-center rounded-full bg-white text-center"><div><strong className="font-display text-3xl text-primary">{progress}%</strong><span className="block text-[0.65rem] font-bold uppercase text-muted-foreground">Progress</span></div></div></div></div> : null}
        {milestones.length > 0 ? <div className="overflow-x-auto px-5 py-7"><ol className="relative flex min-w-[720px] justify-between before:absolute before:left-8 before:right-8 before:top-3 before:h-0.5 before:bg-primary/25">{milestones.map((milestone, index) => <li key={`${milestone.label}-${milestone.value}`} className="relative z-10 w-36 text-center"><span className={`mx-auto block h-6 w-6 rounded-full border-4 border-white ${index === milestones.length - 1 ? "bg-secondary" : "bg-primary"}`} /><p className="mt-3 text-xs font-bold text-primary">{milestone.label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{milestone.value}</p></li>)}</ol></div> : null}
      </div>
      {impact ? (
        <div className="border-t border-border px-5 py-4">
          <p className="text-sm font-semibold uppercase tracking-eyebrow text-secondary">Impact note</p>
          <ResearchRichText content={impact} className="mt-2 text-sm leading-7 text-muted-foreground" />
        </div>
      ) : null}
      {milestones.length === 0 && !impact ? (
        <p className="px-5 py-4 text-sm leading-6 text-muted-foreground">
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
  return (
    <section className="overflow-hidden rounded-2xl border border-primary/15 bg-white/88 shadow-[0_22px_60px_-48px_hsl(var(--primary)/0.65)] backdrop-blur-sm">
      <h2 className="border-b border-border px-5 py-4 font-display text-xl font-semibold text-foreground">
        Research team & collaborators
      </h2>
      <div className="grid gap-0 divide-y divide-border lg:grid-cols-2 lg:divide-x lg:divide-y-0">
        <div className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Research team</h3>
          {teamMembers.length > 0 ? (
            <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 xl:grid-cols-4">{teamMembers.slice(0, 8).map((record, index) => <ProfileItem key={record.id ?? index} record={record} fallback={`Researcher ${index + 1}`} href={record.slug ? `/team/${record.slug}` : "/team"} />)}</div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              No public research-team profiles are linked to this project yet.
            </p>
          )}
        </div>
        <div className="p-5">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Collaborators & partners</h3>
          {partners.length > 0 ? <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3">{partners.slice(0, 6).map((record, index) => <ProfileItem key={record.id ?? index} record={record} fallback={`Partner ${index + 1}`} href={record.slug ? `/partners/${record.slug}` : "/partners"} square />)}</div> : <p className="mt-3 text-sm leading-6 text-muted-foreground">No public partner profiles are linked to this project yet.</p>}
          <div className="mt-5 divide-y divide-border border-t border-border">
            {getExploreLinks(center, program, project).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="group flex items-center justify-between gap-4 py-3 text-sm font-semibold text-primary hover:text-secondary"
              >
                {link.label}
                <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-muted-foreground/70 transition group-hover:translate-x-1 group-hover:text-secondary" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileItem({ record, fallback, href, square = false }: { record: ResearchGenericRecord; fallback: string; href: string; square?: boolean }) {
  const title = getRecordTitle(record, fallback);
  const image = compactText(record.image_url) || compactText(record.photo_url) || compactText(record.logo_url) || compactText(record.avatar_url);
  return <Link href={href} className="group min-w-0 text-center"><span className={`relative mx-auto grid h-16 w-16 place-items-center overflow-hidden border border-primary/15 bg-primary/8 font-display text-lg font-bold text-primary ${square ? "rounded-xl" : "rounded-full"}`}>{image ? <Image src={image} alt="" fill sizes="64px" className="object-cover" unoptimized /> : title.split(/\s+/).slice(0, 2).map((word) => word[0]).join("")}</span><span className="mt-2 line-clamp-2 block text-xs font-semibold leading-4 text-foreground group-hover:text-primary">{title}</span></Link>;
}

function ProjectDocumentsMedia({ project }: { project: ResearchProject & ResearchGenericRecord }) {
  const documents = projectMediaRecords(project, ["documents", "attachments", "document_media", "attachment_media"]);
  const gallery = projectMediaRecords(project, ["gallery", "gallery_media", "media"]);
  const documentCount = documents.length || (project.document_media_ids?.length ?? 0) + (project.attachment_media_ids?.length ?? 0);
  const galleryCount = gallery.length || project.gallery_media_ids?.length || 0;
  if (!documentCount && !galleryCount) return null;
  return <section className="grid overflow-hidden rounded-2xl border border-primary/15 bg-white/88 shadow-[0_22px_60px_-48px_hsl(var(--primary)/0.65)] backdrop-blur-sm lg:grid-cols-2 lg:divide-x lg:divide-primary/10"><MediaPanel title="Documents & attachments" records={documents} count={documentCount} icon={Download} /><MediaPanel title="Gallery & media" records={gallery} count={galleryCount} icon={ImageIcon} gallery /></section>;
}

function MediaPanel({ title, records, count, icon: Icon, gallery = false }: { title: string; records: ResearchGenericRecord[]; count: number; icon: LucideIcon; gallery?: boolean }) {
  return <div className="p-5 sm:p-6"><div className="flex items-center justify-between"><h2 className="font-display text-lg font-semibold text-primary">{title}</h2><span className="text-xs font-bold text-muted-foreground">{count} available</span></div>{records.length ? <div className={`mt-4 ${gallery ? "grid grid-cols-2 gap-3 sm:grid-cols-4" : "grid gap-2 sm:grid-cols-2"}`}>{records.slice(0, gallery ? 4 : 6).map((record, index) => { const url = compactText(record.url) || compactText(record.public_url) || compactText(record.file_url); const image = compactText(record.thumbnail_url) || compactText(record.image_url) || (gallery ? url : ""); const label = getRecordTitle(record, `${gallery ? "Media" : "Document"} ${index + 1}`); return url ? <a key={record.id ?? index} href={url} className={gallery ? "group" : "flex items-center gap-3 rounded-xl border border-primary/10 p-3 text-xs font-semibold text-foreground hover:border-primary/30 hover:text-primary"}>{gallery ? <><span className="relative block aspect-[4/3] overflow-hidden rounded-xl bg-primary/5">{image ? <Image src={image} alt={label} fill sizes="160px" className="object-cover transition group-hover:scale-105" unoptimized /> : <Icon aria-hidden className="absolute inset-0 m-auto h-6 w-6 text-primary" />}</span><span className="mt-1 line-clamp-1 block text-xs font-semibold">{label}</span></> : <><Icon aria-hidden className="h-4 w-4 shrink-0 text-primary" /><span className="line-clamp-2">{label}</span></>}</a> : null; })}</div> : <p className="mt-4 text-sm text-muted-foreground">{count} linked {gallery ? "media items" : "files"}. Public previews will appear when file details are published.</p>}</div>;
}

function EmptyPanel({ title, message }: { title: string; message: string }) {
  return (
    <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
      <h2 className="font-display text-xl font-semibold text-foreground">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">{message}</p>
    </section>
  );
}

function ProjectPartnershipCta() {
  return (
    <section className="border-t border-primary/10 px-4 py-12 sm:px-6 lg:px-8 lg:py-16 xl:px-10 2xl:px-12">
      <div className="mx-auto max-w-[1680px] overflow-hidden rounded-3xl border border-primary/15 bg-white/72 px-6 py-9 shadow-[0_24px_65px_-48px_hsl(var(--primary)/0.7)] backdrop-blur-sm sm:px-9 lg:px-12 lg:py-11">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-secondary">Research collaboration</p>
            <h2 className="mt-3 text-balance font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">Partner with this research team</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">Connect with Kisii University to explore research collaboration, technical expertise, field partnerships, funding, and knowledge exchange.</p>
          </div>
          <Link href="/connect" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-secondary/90">Contact us <ArrowRight aria-hidden className="h-4 w-4" /></Link>
        </div>
      </div>
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
    "/images/research/verified/multidisciplinary-conference-2026.jpg"
  );
}

function getProjectProgress(project: ResearchProject) {
  if (project.source_references?.length && !project.progress_percentage) return null;
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
