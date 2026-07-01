import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CalendarDays,
  Coins,
  Download,
  FileText,
  Leaf,
  LineChart,
  type LucideIcon,
  Mail,
  Network,
  Phone,
  Tags,
  Target,
  UserRound,
  UsersRound,
} from "lucide-react";
import { StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  generateSlugParams,
  getProgramBySlug,
  getPublicationsFiltered,
  getRelatedOutputs,
} from "../../../lib/research-public-data";
import {
  getNarrativeSections,
  getPublishedFactItems,
  getRecordSummary,
  getRecordTimelineLabel,
  getRecordTitle,
} from "../../../lib/research-page-model";
import type {
  ResearchGenericRecord,
  ResearchProject,
  ResearchPublication,
} from "@ksu/api-client";
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
  const includedProjects = getIncludedProgramProjects(program);
  const [publications, outputs] = await Promise.all([
    getPublicationsFiltered({ programId: program.id }),
    getRelatedOutputs({ programId: program.id }),
  ]);
  const center = program.center as ResearchGenericRecord | undefined;
  const title = getRecordTitle(program, "Research programme");
  const summary = getRecordSummary(program);
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
  const coverImage = getProgramCoverImage(program);
  const partners = getChildRecords(program, ["partners", "collaborators"]);
  const storySections = getNarrativeSections(program, [
    { title: "Program focus", fields: ["description", "summary"] },
    { title: "Why it matters", fields: ["objectives"] },
    { title: "Our approach", fields: ["methodology"] },
    { title: "Expected outcomes", fields: ["expected_outcomes"] },
    { title: "Public impact", fields: ["summary"] },
  ]);
  const facts = getPublishedFactItems([
    { label: "Timeline", value: getRecordTimelineLabel(program) },
    { label: "Lead center", value: center ? getRecordTitle(center, "") : "" },
    { label: "Program lead", value: leadName },
    { label: "Active projects", value: includedProjects.length ? includedProjects.length : "" },
    {
      label: "Funding",
      value: formatMoney(program.budget, program.currency) || compactText(program.funder_name),
    },
    { label: "Code", value: compactText(program.code) },
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white text-slate-950">
      <ProgramHero
        title={title}
        summary={summary}
        coverImage={coverImage}
        program={program}
        contactEmail={contactEmail}
        briefUrl={briefUrl}
        hasProjects={includedProjects.length > 0}
      />

      <ProgramGlance
        program={program}
        center={center}
        leadName={leadName}
        contactEmail={contactEmail}
        projectCount={includedProjects.length}
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
            {storySections.length > 0 ? <ProgramStoryTable sections={storySections} /> : null}
            {includedProjects.length > 0 ? <ProjectStreams projects={includedProjects} /> : null}
            {publications.data.length > 0 || outputs.data.length > 0 ? (
              <EvidenceOutputs publications={publications.data} outputs={outputs.data} />
            ) : null}
          </div>

          <aside className="flex flex-col gap-4 xl:sticky xl:top-24">
            <ProgramFactsSidebar
              facts={facts}
              program={program}
              center={center}
              contactEmail={contactEmail}
            />
            <QuickPaths center={center} program={program} hasProjects={includedProjects.length > 0} />
            <ContactCard contactEmail={contactEmail} program={program} />
            {partners.length > 0 ? <PartnerChips partners={partners} /> : null}
          </aside>
        </div>
      </section>
    </main>
  );
}

function ProgramHero({
  title,
  summary,
  coverImage,
  program,
  contactEmail,
  briefUrl,
  hasProjects,
}: {
  title: string;
  summary?: string;
  coverImage: string;
  program: ResearchGenericRecord;
  contactEmail?: string;
  briefUrl?: string;
  hasProjects: boolean;
}) {
  const labels = [program.program_type, program.status, program.is_featured ? "featured" : null]
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
          <Link href="/programs" className="transition hover:text-white">Programs</Link>
          <span>/</span>
          <span className="text-white">{title}</span>
        </nav>
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex rounded-md border border-white/25 bg-primary/90 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-sm backdrop-blur">
              Research Program
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
            {hasProjects ? (
              <Link
                href="#project-streams"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
              >
                View project streams
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

function ProgramGlance({
  program,
  center,
  leadName,
  contactEmail,
  projectCount,
}: {
  program: ResearchGenericRecord;
  center?: ResearchGenericRecord;
  leadName?: string;
  contactEmail?: string;
  projectCount: number;
}) {
  type GlanceCard = { label: string; value?: string | number; icon: LucideIcon; caption?: string };
  type PublishedGlanceCard = {
    label: string;
    value: string;
    icon: LucideIcon;
    caption: string | undefined;
  };

  const cards = ([
    { label: "Timeline", value: getRecordTimelineLabel(program), icon: CalendarDays, caption: "" },
    {
      label: "Lead center",
      value: center ? getRecordTitle(center, "") : "",
      icon: Building2,
      caption: "Institutional anchor",
    },
    { label: "Program lead", value: leadName, icon: UserRound, caption: contactEmail },
    {
      label: "Active projects",
      value: projectCount ? String(projectCount) : "",
      icon: BarChart3,
      caption: "View projects",
    },
    {
      label: "Funding secured",
      value: formatMoney(program.budget, program.currency) || compactText(program.funder_name),
      icon: Coins,
      caption: "Active grants",
    },
    { label: "Program code", value: compactText(program.code), icon: Tags, caption: formatLabel(compactText(program.program_type)) },
  ] satisfies GlanceCard[]).map((item) => ({
    ...item,
    value: compactText(item.value),
  })).filter((item): item is PublishedGlanceCard => Boolean(item.value));

  if (!cards.length) return null;

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <dl
        className={`mx-auto grid max-w-[1680px] gap-2 sm:grid-cols-2 lg:grid-cols-3 ${
          cards.length === 5 ? "xl:grid-cols-5" : "xl:grid-cols-6"
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

function ProgramStoryTable({ sections }: { sections: Array<{ title: string; body: string }> }) {
  const icons = [Target, Leaf, Network, LineChart, UsersRound];
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <h2 className="border-b border-slate-200 px-5 py-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        Program Story
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
              <p className="text-sm leading-6 text-slate-700">{section.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProjectStreams({ projects }: { projects: ResearchProject[] }) {
  return (
    <section id="project-streams" className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
          Project Streams
        </h2>
        <Link href="/projects" className="hidden text-sm font-semibold text-primary hover:text-secondary sm:inline-flex">
          View all
          <ArrowRight aria-hidden className="ml-2 h-4 w-4" />
        </Link>
      </div>
      <div className="hidden grid-cols-[minmax(280px,1fr)_140px_140px_170px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-600 lg:grid">
        <span>Project</span>
        <span>Status</span>
        <span>Timeline</span>
        <span>Progress</span>
      </div>
      <div className="divide-y divide-slate-200">
        {projects.slice(0, 12).map((project) => (
          <ProjectStreamRow key={project.id} project={project} />
        ))}
      </div>
      <Link href="/projects" className="flex items-center gap-2 px-5 py-4 text-sm font-semibold text-primary hover:text-secondary">
        View all project streams
        <ArrowRight aria-hidden className="h-4 w-4" />
      </Link>
    </section>
  );
}

function ProjectStreamRow({ project }: { project: ResearchProject }) {
  const href = project.slug ? `/projects/${project.slug}` : "/projects";
  const timeline = formatProjectTimeline(project);
  const progress = getProjectProgress(project);
  const progressLabel = progress === null ? "" : `${progress}%`;
  return (
    <Link
      href={href}
      className="group grid gap-3 px-5 py-3 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 lg:grid-cols-[minmax(280px,1fr)_140px_140px_170px] lg:items-center"
    >
      <h3 className="flex min-w-0 items-center gap-2 text-sm font-semibold leading-6 text-slate-900">
        <FileText aria-hidden className="h-4 w-4 shrink-0 text-slate-500" />
        <span className="truncate transition group-hover:text-primary">
          {getRecordTitle(project as unknown as ResearchGenericRecord, "Research project")}
        </span>
      </h3>
      <span className="w-fit rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
        {formatLabel(project.status ?? "ongoing")}
      </span>
      <span className="text-sm font-medium text-slate-700">{timeline || "-"}</span>
      <span className="grid gap-1">
        <span className="text-xs font-semibold text-slate-600">{progressLabel || "-"}</span>
        {progress !== null ? (
          <span className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </span>
        ) : null}
      </span>
    </Link>
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

  if (!groups.length) return null;

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
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
          group.records.slice(0, 4).map((record) => {
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

function ProgramFactsSidebar({
  facts,
  program,
  center,
  contactEmail,
}: {
  facts: Array<{ label: string; value: string }>;
  program: ResearchGenericRecord;
  center?: ResearchGenericRecord;
  contactEmail?: string;
}) {
  const rows = getPublishedFactItems([
    { label: "Lead center", value: center ? getRecordTitle(center, "") : "" },
    {
      label: "Program lead",
      value: compactText(program.program_lead_name) || compactText(program.lead_name) || compactText(program.coordinator_name),
    },
    { label: "Timeline", value: getRecordTimelineLabel(program) },
    {
      label: "Funding secured",
      value: formatMoney(program.budget, program.currency) || compactText(program.funder_name),
    },
    { label: "Status", value: formatLabel(compactText(program.status)) },
    { label: "Program code", value: compactText(program.code) },
    { label: "Last updated", value: formatDate(program.updated_at) },
  ]);

  const visibleRows = rows.length ? rows : facts;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        Program facts
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
          Contact program lead
        </a>
      ) : null}
    </section>
  );
}

function QuickPaths({
  center,
  program,
  hasProjects,
}: {
  center?: ResearchGenericRecord;
  program: ResearchGenericRecord;
  hasProjects: boolean;
}) {
  const links = [
    hasProjects ? { label: "Projects in this program", href: `/projects?program=${program.id}` } : null,
    { label: "Publications", href: "/publications" },
    center?.slug ? { label: "More from this center", href: `/centers/${center.slug}` } : null,
    { label: "Partner with this program", href: "/partners" },
  ].filter(Boolean) as Array<{ label: string; href: string }>;

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
  program,
}: {
  contactEmail?: string;
  program: ResearchGenericRecord;
}) {
  const phone = compactText(program.contact_phone) || compactText(program.phone);
  if (!contactEmail && !phone) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-slate-950">
        Contact
      </h2>
      <p className="mt-3 text-sm text-slate-700">Questions about this program?</p>
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
          Contact program lead
          <ArrowRight aria-hidden className="h-4 w-4" />
        </a>
      ) : null}
    </section>
  );
}

function getIncludedProgramProjects(program: ResearchGenericRecord) {
  const projects = Array.isArray(program.projects)
    ? (program.projects as unknown as ResearchProject[])
    : [];
  return projects
    .filter((project) => project.is_active !== false && project.is_public !== false)
    .sort((a, b) => {
      const left = Number((a as unknown as ResearchGenericRecord).display_order ?? 100);
      const right = Number((b as unknown as ResearchGenericRecord).display_order ?? 100);
      return left - right;
    });
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

function getChildRecords(record: ResearchGenericRecord, fields: string[]) {
  for (const field of fields) {
    if (Array.isArray(record[field])) return record[field] as ResearchGenericRecord[];
  }
  return [];
}

function getProgramCoverImage(program: ResearchGenericRecord) {
  const coverImage = program.cover_image as ResearchGenericRecord | undefined;
  return (
    compactText(program.cover_image_url) ||
    compactText(coverImage?.url) ||
    compactText(coverImage?.public_url) ||
    compactText(coverImage?.thumbnail_url) ||
    compactText(program.image_url) ||
    compactText(program.thumbnail_url) ||
    "/images/research/research-projects-hero.webp"
  );
}

function formatProjectTimeline(project: ResearchProject) {
  return [formatDate(project.start_date), formatDate(project.end_date)].filter(Boolean).join(" - ");
}

function getProjectProgress(project: ResearchProject) {
  const progress = Number(project.progress_percentage);
  if (!Number.isFinite(progress)) return null;
  return Math.max(0, Math.min(100, Math.round(progress)));
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
