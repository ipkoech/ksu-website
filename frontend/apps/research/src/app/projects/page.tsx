import type { Metadata } from "next";
import {
  Badge,
  FilledBadge,
  IconCard,
  ResearchHero,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getCenters,
  getFacilities,
  getProjects,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Projects",
  description: "Browse Kisii University research projects and active research work.",
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params?.q;
  const [projects, centers, facilities] = await Promise.all([
    getProjects(query),
    getCenters(),
    getFacilities(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Projects"
        title="Active research work across Kisii University."
        body="Browse public research projects, progress, expected outcomes, and institutional impact areas."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Research", href: "/" },
          { label: "Projects" },
        ]}
      />
      <ResearchSection
        eyebrow="Project Registry"
        title="Research projects"
        body="Records are loaded from the Research service and reflect the same public project catalogue used by the admin portal."
        tone="white"
      >
        {projects.error ? <StatusMessage tone="error">{projects.error}</StatusMessage> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.data.map((project) => (
            <article
              key={project.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Badge>{formatLabel(project.project_type ?? "research")}</Badge>
                <Badge>{formatLabel(project.status ?? "ongoing")}</Badge>
                {project.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
                {project.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {compactText(project.summary) || "Project summary is being updated."}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-slate-50 p-3">
                  <dt className="text-xs font-semibold uppercase text-slate-500">Progress</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {project.progress_percentage ?? 0}%
                  </dd>
                </div>
                <div className="rounded-md bg-slate-50 p-3">
                  <dt className="text-xs font-semibold uppercase text-slate-500">Updated</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatDate(project.updated_at)}
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        {!projects.error && projects.data.length === 0 ? (
          <StatusMessage>No public projects matched this view.</StatusMessage>
        ) : null}
      </ResearchSection>
      <ResearchSection
        eyebrow="Expertise & Directory"
        title="Faculty expertise, centers, and current work"
        body="Centers, institutes, facilities, and project records form the searchable expertise and directory layer."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <RecordPanel title="Research centers and institutes" records={centers.data} error={centers.error} />
          <RecordPanel title="Facilities and resources" records={facilities.data} error={facilities.error} />
        </div>
      </ResearchSection>
      <ResearchSection
        eyebrow="Research Highlights"
        title="Featured highlights and reports"
        body="Featured project records support visual storytelling, discovery announcements, and annual impact report promotion."
        tone="white"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <IconCard
            icon="flask"
            title="Featured projects"
            body="Use featured public projects for homepage storytelling and major discovery highlights."
          />
          <IconCard
            icon="book"
            title="Annual impact reports"
            body="Link annual reports from Resources & Tools and Impact & Metrics when records are published."
            href="/impact-metrics"
            action="View metrics"
          />
          <IconCard
            icon="news"
            title="Discovery press releases"
            body="Publish major discoveries through research updates and cross-promoted events."
            href="/resources-tools"
            action="Open updates"
          />
        </div>
      </ResearchSection>
    </main>
  );
}

function RecordPanel({
  title,
  records,
  error,
}: {
  title: string;
  records: Array<Record<string, any>>;
  error: string | null;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      {error ? <div className="mt-4"><StatusMessage tone="error">{error}</StatusMessage></div> : null}
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 8).map((record) => (
          <article key={record.id} className="py-4">
            <h3 className="text-base font-semibold leading-6 text-slate-950">
              {record.title ?? record.name}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {compactText(record.summary) || compactText(record.description)}
            </p>
            <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
              {formatLabel(record.center_type ?? record.facility_type ?? record.status)}
            </p>
          </article>
        ))}
        {!error && records.length === 0 ? (
          <p className="py-4 text-sm text-slate-600">No records available.</p>
        ) : null}
      </div>
    </section>
  );
}
