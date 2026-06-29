import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ResearchDetailHero,
  ResearchDetailSidebar,
  ResearchTextPanel,
} from "../../../components/research-detail";
import { Badge, ResearchSection, StatusMessage } from "../../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getProgramBySlug,
  getProgramProjects,
} from "../../../lib/research-public-data";
import { MotionCard } from "../../../components/motion-cards";
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { data } = await getProgramBySlug(slug);
  if (!data) return { title: "Program Not Found" };
  const program = data as ResearchGenericRecord;
  const title = compactText(program.name ?? program.title) || "Research Program";
  const desc = compactText(program.summary) || compactText(program.description) || `Overview of the ${title} research program.`;
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

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Research Program"
        title={program.name ?? program.title ?? "Research program"}
        body={compactText(program.summary) || compactText(program.description)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Programs", href: "/programs" },
          { label: program.name ?? program.title ?? "Program" },
        ]}
        labels={[program.status, program.category, program.is_featured ? "featured" : null]}
        facts={[
          { label: "Start", value: formatDate(program.start_date) },
          { label: "End", value: formatDate(program.end_date) },
          { label: "Budget", value: formatMoney(program.budget, program.currency) },
          { label: "Projects", value: projects.data.length },
        ]}
        actions={[
          { label: "Back to programs", href: "/programs", variant: "secondary" },
          ...(center?.slug ? [{ label: "View center", href: `/centers/${center.slug}` }] : []),
        ]}
        imageSrc="/images/research/research-projects-hero.svg"
        imageAlt="Research program profile and connected projects"
      />

      {[error, projects.error].filter(Boolean).map((message) => (
        <section key={message} className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px]">
            <StatusMessage tone="error">{message}</StatusMessage>
          </div>
        </section>
      ))}

      <ResearchSection
        eyebrow="Program Pathway"
        title="Focus, methods, and outcomes"
        body="Programme information is presented with connected projects and delivery details."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col gap-5">
            <ResearchTextPanel
              title="Overview"
              fields={[
                ["Summary", program.summary],
                ["Description", program.description],
                ["Objectives", program.objectives],
              ]}
            />
            <ResearchTextPanel
              title="Research Approach"
              fields={[
                ["Methodology", program.methodology],
                ["Expected outcomes", program.expected_outcomes],
              ]}
            />
          </div>
          <ResearchDetailSidebar
            labels={[program.status ?? "active", program.is_featured ? "Featured" : null]}
            facts={[
              { label: "Start", value: formatDate(program.start_date) },
              { label: "End", value: formatDate(program.end_date) },
              { label: "Budget", value: formatMoney(program.budget, program.currency) },
              { label: "Code", value: compactText(program.code) },
              { label: "Hosted by", value: center ? compactText(center.name ?? center.title) : "" },
            ]}
            actions={
              center?.slug
                ? [{ label: "View hosting center", href: `/centers/${center.slug}` }]
                : []
            }
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Connected Projects"
        title="Projects in this program"
        body="Programs can have projects in them, but they can also stand alone while the research office builds the project portfolio."
      >
        {projects.data.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.data.map((project) => (
              <MotionCard key={project.id}>
                <ProjectCard project={project} />
              </MotionCard>
            ))}
          </div>
        ) : (
          <StatusMessage>No public projects are currently linked to this program.</StatusMessage>
        )}
      </ResearchSection>
    </main>
  );
}

function ProjectCard({ project }: { project: ResearchProject }) {
  return (
    <Link
      href={project.slug ? `/projects/${project.slug}` : "/projects"}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary/30 hover:shadow-[0_22px_60px_-42px_rgba(15,23,42,0.45)]"
    >
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(project.project_type ?? "research")}</Badge>
        <Badge>{formatLabel(project.status ?? "ongoing")}</Badge>
      </div>
      <h3 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {project.title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {compactText(project.summary) || "Project summary has not been published yet."}
      </p>
      <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
        {project.progress_percentage ?? 0}% complete
      </p>
    </Link>
  );
}

function formatMoney(value?: string | number | null, currency?: string | null) {
  if (value === null || value === undefined || value === "") return "";
  const amount = Number(value);
  if (Number.isNaN(amount)) return compactText(value);
  return `${currency ?? "KES"} ${new Intl.NumberFormat("en-KE").format(amount)}`;
}
