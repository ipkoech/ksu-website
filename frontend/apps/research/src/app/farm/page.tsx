import type { Metadata } from "next";
import type { ResearchGenericRecord, ResearchProject } from "@ksu/api-client";
import { CalendarDays, Handshake, Sprout, Target } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFact } from "../../components/research-detail";
import { Badge, FilledBadge, ResearchSection, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getFacilities,
  getFarmActivities,
  getFarmPartners,
  getFarmProjects,
  getFocusAreas,
  getStories,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "University Farm",
  description: "Research farms and farm-linked sustainability work.",
};

const extensionLinks = [
  { label: "University Farm", href: "/farm", description: "Farm facilities, field research, demonstrations, and partners.", icon: Sprout },
  { label: "Sustainability", href: "/sustainability", description: "Climate, biodiversity, water, and circular-economy initiatives.", icon: Target },
  { label: "Community Impact", href: "/community-impact", description: "Outreach, social value, events, and public stories.", icon: Handshake },
  { label: "Events", href: "/events", description: "Public engagement and research activity calendar.", icon: CalendarDays },
];

export default async function FarmPage() {
  const [farms, projects, partners, activities, stories, focusAreas] =
    await Promise.all([
      getFacilities(),
      getFarmProjects(),
      getFarmPartners(),
      getFarmActivities(),
      getStories(),
      getFocusAreas(),
    ]);
  const farmStories = stories.data.filter((story) =>
    ["community", "farm", "agriculture"].includes(compactText(story.story_type).toLowerCase()),
  );
  const errors = [farms, projects, partners, activities, stories, focusAreas].flatMap((item) =>
    item.error ? [item.error] : [],
  );

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="University Farm"
        title="Farm-linked research, facilities, and community impact."
        body="Explore farm facilities, action research projects, community partnerships, activities, impact stories, and focus areas backed by the Research service."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "University Farm" }]}
        imageSrc="/images/research/research-workflows.png"
        imageAlt="University farm research, field demonstration, and community extension work"
        links={extensionLinks}
        primaryAction={{ label: "View sustainability", href: "/sustainability" }}
        stats={[
          { label: "Farm records", value: farms.data.length },
          { label: "Farm projects", value: projects.data.length },
          { label: "Partners", value: partners.data.length },
          { label: "Activities", value: activities.data.length },
        ]}
       />

      {errors.length > 0 ? <ErrorBand errors={errors} /> : null}

      {farms.data.length > 0 ? (
        <ResearchSection
          eyebrow="Facilities"
          title="University farm facilities"
          body="Farm records expose the operational base for applied research, training, production, and community engagement."
          tone="white"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {farms.data.map((farm) => (
              <FarmCard key={farm.id} farm={farm} />
            ))}
          </div>
        </ResearchSection>
      ) : null}

      {projects.data.length > 0 ? (
        <ResearchSection
          eyebrow="Action Research"
          title="Farm-linked projects"
          body="Action and applied projects show how the farm supports field trials, demonstrations, and practical research outcomes."
        >
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.data.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </ResearchSection>
      ) : null}

      {partners.data.length > 0 || activities.data.length > 0 ? (
        <ResearchSection
          eyebrow="Engagement"
          title="Partnerships and activities"
          body="Community partners and public activities show how farm work moves beyond the campus."
          tone="white"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {partners.data.length > 0 ? (
              <RecordListPanel title="Farm partnerships" records={partners.data} />
            ) : null}
            {activities.data.length > 0 ? (
              <RecordListPanel title="Farm activities" records={activities.data} dateField="start_date" />
            ) : null}
          </div>
        </ResearchSection>
      ) : null}

      {farmStories.length > 0 || focusAreas.data.length > 0 ? (
        <ResearchSection
          eyebrow="Impact"
          title="Stories and focus areas"
          body="Impact stories and focus areas describe the farm's research priorities and community outcomes."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {farmStories.length > 0 ? (
              <RecordListPanel title="Impact stories" records={farmStories} />
            ) : null}
            {focusAreas.data.length > 0 ? (
              <RecordListPanel title="Focus areas" records={focusAreas.data} />
            ) : null}
          </div>
        </ResearchSection>
      ) : null}
    </main>
  );
}

function FarmCard({ farm }: { farm: ResearchGenericRecord }) {
  const textBlocks = [
    ["About", farm.about ?? farm.summary ?? farm.description],
    ["Activities", farm.activities],
    ["Products", farm.products],
    ["Facilities", farm.facilities],
    ["Capacity", farm.capacity_info],
  ].filter(([, value]) => compactText(value));
  const facts = [
    ["Type", formatLabel(compactText(farm.farm_type))],
    ["Size", farm.size_hectares ? `${compactText(farm.size_hectares)} hectares` : ""],
    ["Location", compactText(farm.location) || compactText(farm.county)],
    ["Manager", compactText(farm.manager_name)],
    ["Email", compactText(farm.email)],
    ["Phone", compactText(farm.phone)],
  ].filter(([, value]) => compactText(value));

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        {farm.farm_type ? <Badge>{formatLabel(farm.farm_type)}</Badge> : null}
        {farm.status ? <Badge>{formatLabel(farm.status)}</Badge> : null}
        {farm.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <h2 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-slate-950">
        {farm.slug ? (
          <a href={`/farm/${farm.slug}`} className="transition hover:text-primary">
            {compactText(farm.name) || compactText(farm.code)}
          </a>
        ) : (
          compactText(farm.name) || compactText(farm.code)
        )}
      </h2>
      {textBlocks.map(([label, value]) => (
        <div key={label} className="mt-4">
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-1 text-sm leading-7 text-slate-600">{compactText(value)}</p>
        </div>
      ))}
      {facts.length > 0 ? (
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <ResearchFact key={label} label={label} value={value} />
          ))}
        </dl>
      ) : null}
    </article>
  );
}

function ProjectCard({ project }: { project: ResearchProject }) {
  const projectRecord = project as ResearchProject & Record<string, unknown>;
  const description =
    compactText(project.summary) ||
    compactText(projectRecord.expected_outcomes as string | number | null | undefined) ||
    compactText(projectRecord.impact as string | number | null | undefined);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(project.project_type ?? "research")}</Badge>
        {project.status ? <Badge>{formatLabel(project.status)}</Badge> : null}
        {project.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
        {project.slug ? (
          <a href={`/projects/${project.slug}`} className="transition hover:text-primary">
            {project.title}
          </a>
        ) : (
          project.title
        )}
      </h2>
      {description ? (
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      ) : null}
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <ResearchFact label="Progress" value={`${project.progress_percentage ?? 0}%`} />
        {project.updated_at ? <ResearchFact label="Updated" value={formatDate(project.updated_at)} /> : null}
      </dl>
    </article>
  );
}

function RecordListPanel({
  title,
  records,
  dateField,
}: {
  title: string;
  records: ResearchGenericRecord[];
  dateField?: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 8).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex flex-wrap gap-2">
              {record.partner_type ? <Badge>{formatLabel(record.partner_type)}</Badge> : null}
              {record.event_type ? <Badge>{formatLabel(record.event_type)}</Badge> : null}
              {record.status ? <Badge>{formatLabel(record.status)}</Badge> : null}
            </div>
            <h3 className="mt-3 text-base font-semibold leading-6 text-slate-950">
              {compactText(record.name) || compactText(record.title) || compactText(record.code)}
            </h3>
            {compactText(record.about) || compactText(record.summary) || compactText(record.description) ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {compactText(record.about) || compactText(record.summary) || compactText(record.description)}
              </p>
            ) : null}
            {dateField && record[dateField] ? (
              <p className="mt-2 text-xs font-semibold uppercase text-slate-500">
                {formatDate(record[dateField] as string)}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function ErrorBand({ errors }: { errors: string[] }) {
  const uniqueErrors = Array.from(new Set(errors));

  return (
    <section className="px-4 pt-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1680px] space-y-3">
        {uniqueErrors.map((error) => (
          <StatusMessage key={error} tone="error">
            {error}
          </StatusMessage>
        ))}
      </div>
    </section>
  );
}
