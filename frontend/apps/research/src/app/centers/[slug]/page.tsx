import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ResearchDetailHero,
  ResearchFact,
  ResearchRecordPanel,
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
  getCenterBySlug,
  getCenterProjects,
  getCenterPublications,
  getProgramsFiltered,
  getRelatedOutputs,
} from "../../../lib/research-public-data";
import type { ResearchGenericRecord, ResearchProject, ResearchPublication } from "@ksu/api-client";

export const dynamic = "force-dynamic";

export default async function CenterDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getCenterBySlug(slug);
  if (!data) notFound();

  const center = data as ResearchGenericRecord;
  const [programs, projects, publications, outputs] = await Promise.all([
    getProgramsFiltered({ centerId: center.id }),
    getCenterProjects(center.id),
    getCenterPublications(center.id),
    getRelatedOutputs({ centerId: center.id }),
  ]);
  const farms = Array.isArray(center.farms) ? (center.farms as ResearchGenericRecord[]) : [];
  const teamMembers = Array.isArray(center.team_members)
    ? (center.team_members as ResearchGenericRecord[])
    : [];

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchDetailHero
        eyebrow="Research Center"
        title={center.name ?? center.title ?? "Research center"}
        body={compactText(center.about) || compactText(center.mandate)}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Centers", href: "/centers" },
          { label: center.name ?? center.title ?? "Center" },
        ]}
        labels={[center.center_type, center.status, center.is_featured ? "featured" : null]}
        facts={[
          { label: "Programs", value: programs.data.length },
          { label: "Projects", value: projects.data.length },
          { label: "Publications", value: publications.data.length },
          { label: "Outputs", value: outputs.data.length },
        ]}
        actions={[
          { label: "Back to centers", href: "/centers", variant: "secondary" },
          ...(compactText(center.website) ? [{ label: "Open website", href: compactText(center.website) }] : []),
        ]}
        imageSrc="/images/research/innovation-partnerships.png"
        imageAlt="Research center profile and connected work"
      />

      {[error, programs.error, projects.error, publications.error, outputs.error]
        .filter(Boolean)
        .map((message) => (
          <section key={message} className="px-4 pt-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1680px]">
              <StatusMessage tone="error">{message}</StatusMessage>
            </div>
          </section>
        ))}

      <ResearchSection
        eyebrow="Center Profile"
        title="Mandate and research focus"
        body="Center profiles are loaded from the Research Centers endpoint and connected records are resolved through their public endpoints."
        tone="white"
      >
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-5">
            <ResearchTextPanel
              title="Profile"
              fields={[
                ["About", center.about],
                ["Mandate", center.mandate],
                ["Mission", center.mission],
                ["Vision", center.vision],
              ]}
            />
            <ResearchTextPanel
              title="Research areas"
              fields={[
                ["Focus areas", center.research_areas],
                ["Objectives", center.objectives],
              ]}
            />
          </div>
          <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(center.center_type ?? "research center")}</Badge>
              {center.is_featured ? <Badge>Featured</Badge> : null}
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <ResearchFact label="Location" value={compactText(center.location)} />
              <ResearchFact label="Email" value={compactText(center.email)} />
              <ResearchFact label="Phone" value={compactText(center.phone)} />
              <ResearchFact label="Website" value={compactText(center.website)} />
            </dl>
          </aside>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Center Network"
        title="Programs, projects, outputs, and people"
        body="Each relationship is shown as a public record, not as backend language."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <ResearchRecordPanel
            title="Research programs"
            records={programs.data}
            hrefBase="/programs"
            empty="No public programs are currently linked to this center."
          />
          <ProjectPanel records={projects.data} />
          <PublicationPanel records={publications.data} />
          <ResearchRecordPanel
            title="Research outputs"
            records={outputs.data}
            hrefBase="/outputs"
            empty="No public outputs are currently linked to this center."
          />
          <ResearchRecordPanel
            title="Facilities and farms"
            records={farms}
            hrefBase="/farm"
            empty="No public facilities are currently linked to this center."
          />
          <ResearchRecordPanel
            title="People"
            records={teamMembers}
            empty="No public team members are currently linked to this center."
          />
        </div>
      </ResearchSection>
    </main>
  );
}

function ProjectPanel({ records }: { records: ResearchProject[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Research projects</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 5).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatLabel(record.project_type ?? "research")}</Badge>
              <Badge>{formatLabel(record.status ?? "ongoing")}</Badge>
            </div>
            <h3 className="mt-3 text-base font-semibold text-slate-950">
              <Link href={record.slug ? `/projects/${record.slug}` : "/projects"} className="transition hover:text-primary">
                {record.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {compactText(record.summary) || `${record.progress_percentage ?? 0}% complete`}
            </p>
          </article>
        ))}
        {records.length === 0 ? (
          <p className="py-4 text-sm text-slate-600">
            No public projects are currently linked to this center.
          </p>
        ) : null}
      </div>
    </section>
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
              <Link href={record.slug ? `/publications/${record.slug}` : "/publications"} className="transition hover:text-primary">
                {record.title}
              </Link>
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {[record.journal_name, record.year, formatDate(record.publication_date)]
                .map(compactText)
                .filter(Boolean)
                .join(" · ")}
            </p>
          </article>
        ))}
        {records.length === 0 ? (
          <p className="py-4 text-sm text-slate-600">
            No public publications are currently linked to this center.
          </p>
        ) : null}
      </div>
    </section>
  );
}
