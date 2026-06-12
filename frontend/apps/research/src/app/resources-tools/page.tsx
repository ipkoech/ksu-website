import type { Metadata } from "next";
import {
  Badge,
  IconCard,
  ResearchPageIntro,
  ResearchSection,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatLabel,
  getEvents,
  getGuidelines,
  getResources,
  getUpdates,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resources & Tools",
  description: "Research collaboration tools, news, events, policies, reports, and templates.",
};

export default async function ResourcesToolsPage() {
  const [resources, guidelines, updates, events] = await Promise.all([
    getResources(),
    getGuidelines(),
    getUpdates(),
    getEvents(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro
        eyebrow="Resources & Tools"
        title="Tools for collaboration, updates, and research support."
        body="Find collaboration entry points, research news, events, policies, templates, annual reports, and partner resources."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Research", href: "/" },
          { label: "Resources & Tools" },
        ]}
      />
      <ResearchSection
        eyebrow="Collaboration Platforms"
        title="Start a research or industry collaboration"
        body="These entry points cover partnership inquiries, collaboration requests, and industry challenge submissions."
        tone="white"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <IconCard
            icon="handshake"
            title="Partnership inquiry"
            body="Route industry, foundation, public-sector, and academic partnership requests to the research office."
            href="/connect#partnership"
            action="Send inquiry"
          />
          <IconCard
            icon="flask"
            title="Research collaboration request"
            body="Invite faculty, students, and external collaborators to propose joint research activity."
            href="/connect#research"
            action="Request collaboration"
          />
          <IconCard
            icon="lightbulb"
            title="Industry challenge portal"
            body="Capture applied problems that can be explored through student, faculty, or center-led research."
            href="/partners#how-to-partner"
            action="View process"
          />
        </div>
      </ResearchSection>
      <ResearchSection
        eyebrow="Resource Library"
        title="Templates, policies, reports, and guides"
        body="Resource and guideline records are loaded from the Research service support endpoints."
      >
        <ResourceGrid records={[...resources.data, ...guidelines.data]} />
        {[resources.error, guidelines.error].filter(Boolean).map((error, index) => (
          <div key={`${error}-${index}`} className="mt-4">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        ))}
      </ResearchSection>
      <ResearchSection
        eyebrow="News & Events"
        title="Research updates and calendar"
        body="Published news and event records support newsletters, industry updates, and cross-promoted events."
        tone="white"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <ListPanel title="Latest updates" records={updates.data} error={updates.error} />
          <ListPanel title="Research events" records={events.data} error={events.error} />
        </div>
      </ResearchSection>
    </main>
  );
}

function ResourceGrid({ records }: { records: Array<Record<string, any>> }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {records.map((record) => (
        <article key={record.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Badge>{formatLabel(record.resource_type ?? record.guideline_type ?? record.category ?? "resource")}</Badge>
          <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
            {record.title ?? record.name}
          </h2>
          {compactText(record.summary) || compactText(record.description) ? (
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {compactText(record.summary) || compactText(record.description)}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function ListPanel({
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
        {records.slice(0, 6).map((record) => (
          <article key={record.id} className="py-4">
            <h3 className="text-base font-semibold leading-6 text-slate-950">
              {record.title ?? record.name}
            </h3>
            {compactText(record.summary) || compactText(record.description) ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {compactText(record.summary) || compactText(record.description)}
              </p>
            ) : null}
            <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
              {formatLabel(record.news_type ?? record.event_type ?? record.status)}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
