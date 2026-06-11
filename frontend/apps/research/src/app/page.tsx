import {
  Badge,
  FilledBadge,
  IconCard,
  PrimaryLink,
  ResearchHero,
  ResearchSection,
  SecondaryLink,
  StatusMessage,
} from "../components/research-ui";
import type { ReactNode } from "react";
import {
  compactText,
  formatLabel,
  getResearchOverviewData,
} from "../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const {
    projects,
    publications,
    grants,
    innovations,
    partners,
    updates,
    stats,
    errors,
  } = await getResearchOverviewData();
  const topStats = stats?.stats?.slice(0, 4) ?? [];

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Kisii University Research"
        title="Research, innovation, partnerships, and scholarly output in one portal."
        body="Explore institutional projects, publications, grant opportunities, innovation outputs, training, research news, and collaboration channels backed by the Research service."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Research" }]}
        actions={
          <>
            <PrimaryLink href="/projects">Explore projects</PrimaryLink>
            <SecondaryLink href="/publications">Browse publications</SecondaryLink>
          </>
        }
      >
        <div className="grid gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.08em] text-primary">
            Research snapshot
          </p>
          {topStats.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {topStats.map((item) => (
                <div
                  key={item.key}
                  className="rounded-md border border-slate-200 bg-white p-4"
                >
                  <p className="font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">
                    {item.value}
                    {item.suffix}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </ResearchHero>

      {errors.length > 0 ? (
        <section className="px-4 pt-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1680px] space-y-3">
            {errors.map((error) => (
              <StatusMessage key={error} tone="error">
                {error}
              </StatusMessage>
            ))}
          </div>
        </section>
      ) : null}

      <ResearchSection
        eyebrow="Start Here"
        title="Core research workflows"
        body="The portal is organized around the public-facing tasks researchers, students, partners, and funders need most often."
        tone="white"
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <IconCard
            icon="flask"
            title="Research & Innovation"
            body="Browse projects, highlights, expertise, centers, facilities, and research resources."
            href="/projects"
            action="Open hub"
          />
          <IconCard
            icon="lightbulb"
            title="Innovation & Commercialization"
            body="Explore technology transfer, startups, licensing pathways, and commercialization stories."
            href="/innovations"
            action="Open innovation"
          />
          <IconCard
            icon="handshake"
            title="Partnerships"
            body="Find how to partner, partner showcases, case studies, and talent pipeline initiatives."
            href="/partners"
            action="View partners"
          />
          <IconCard
            icon="target"
            title="Impact & Metrics"
            body="Track funding, publications, patents, startups, jobs, success stories, and reports."
            href="/impact-metrics"
            action="View dashboard"
          />
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Featured Work"
        title="Current records from the Research service"
        body="Seeded records below exercise the same API contracts used by the admin interface."
      >
        <div className="grid gap-5 xl:grid-cols-3">
          <RecordPanel title="Projects" href="/projects">
            {projects.data.slice(0, 4).map((item) => (
              <RecordRow
                key={item.id}
                title={item.title}
                meta={[
                  formatLabel(item.project_type),
                  formatLabel(item.status),
                  `${item.progress_percentage ?? 0}% complete`,
                ]}
              />
            ))}
          </RecordPanel>
          <RecordPanel title="Publications" href="/publications">
            {publications.data.slice(0, 4).map((item) => (
              <RecordRow
                key={item.id}
                title={item.title}
                meta={[
                  item.journal_name,
                  item.year,
                  formatLabel(item.publication_type),
                ]}
              />
            ))}
          </RecordPanel>
          <RecordPanel title="Funding and updates" href="/funding">
            {[...grants.data.slice(0, 2), ...updates.data.slice(0, 2)].map(
              (item) => (
                <RecordRow
                  key={item.id}
                  title={
                    compactText(item.title) ||
                    compactText("name" in item ? item.name : undefined) ||
                    compactText(item.id)
                  }
                  meta={[
                    formatLabel(
                      "category" in item
                        ? item.category
                        : "news_type" in item
                          ? item.news_type
                          : undefined,
                    ),
                    formatLabel(item.status),
                  ]}
                />
              ),
            )}
          </RecordPanel>
        </div>
      </ResearchSection>

      <ResearchSection
        eyebrow="Innovation and Collaboration"
        title="Research translation and partner networks"
        body="Public innovation and partner records show where research is moving into practical use and collaboration."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {innovations.data.slice(0, 3).map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Badge>{formatLabel(item.innovation_type ?? "innovation")}</Badge>
                {item.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">
                {item.title}
              </h3>
              {compactText(item.summary) || compactText(item.description) ? (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(item.summary) || compactText(item.description)}
                </p>
              ) : null}
            </article>
          ))}
          {partners.data.slice(0, 3).map((item) => (
            <article
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap gap-2">
                <Badge>{formatLabel(item.partner_type ?? "partner")}</Badge>
                {item.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-slate-950">
                {item.name}
              </h3>
              {compactText(item.about) || compactText(item.collaboration_areas) ? (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(item.about) || compactText(item.collaboration_areas)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </ResearchSection>
    </main>
  );
}

function RecordPanel({
  title,
  href,
  children,
}: {
  title: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
        <a href={href} className="text-sm font-semibold text-primary">
          Open
        </a>
      </div>
      <div className="mt-4 divide-y divide-slate-200">
        {children}
      </div>
    </section>
  );
}

function RecordRow({
  title,
  meta,
}: {
  title: string;
  meta: Array<string | number | null | undefined>;
}) {
  const details = meta.map(compactText).filter(Boolean);

  return (
    <article className="py-4">
      <h4 className="text-sm font-semibold leading-6 text-slate-950">{title}</h4>
      {details.length > 0 ? (
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {details.join(" · ")}
        </p>
      ) : null}
    </article>
  );
}
