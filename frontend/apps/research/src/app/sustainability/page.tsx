import type { Metadata } from "next";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { CalendarDays, Handshake, Sprout, Target } from "lucide-react";
import { ResearchClusterHero } from "../../components/research-cluster";
import { ResearchFact } from "../../components/research-detail";
import { Badge, FilledBadge, ResearchSection, StatusMessage } from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getImpactMetrics,
  getStories,
  getSustainability,
  getSustainabilityActivities,
  getSustainabilityPartners,
} from "../../lib/research-public-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Research Sustainability",
  description: "Sustainability initiatives and impact records.",
};

const extensionLinks = [
  { label: "University Farm", href: "/farm", description: "Farm facilities, field research, demonstrations, and partners.", icon: Sprout },
  { label: "Sustainability", href: "/sustainability", description: "Climate, biodiversity, water, and circular-economy initiatives.", icon: Target },
  { label: "Community Impact", href: "/community-impact", description: "Outreach, social value, events, and public stories.", icon: Handshake },
  { label: "Events", href: "/events", description: "Public engagement and research activity calendar.", icon: CalendarDays },
];

export default async function SustainabilityPage() {
  const [initiatives, partners, activities, stories, metrics] = await Promise.all([
    getSustainability(),
    getSustainabilityPartners(),
    getSustainabilityActivities(),
    getStories(),
    getImpactMetrics(),
  ]);
  const errors = [initiatives, partners, activities, stories, metrics].flatMap((item) =>
    item.error ? [item.error] : [],
  );

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchClusterHero
        eyebrow="Sustainability"
        title="Sustainability initiatives connected to research."
        body="Explore active climate, conservation, biodiversity, water, food security, and circular-economy work."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sustainability" }]}
        imageSrc="/images/research/sustainability-hero-imagegen.webp"
        imageAlt="Sustainability research, climate action, conservation, and community fieldwork"
        links={extensionLinks}
        primaryAction={{ label: "View community impact", href: "/community-impact" }}
        stats={[
          { label: "Initiatives", value: initiatives.data.length },
          { label: "Partners", value: partners.data.length },
          { label: "Activities", value: activities.data.length },
          { label: "Metrics", value: metrics.data.length },
        ]}
       />

      {errors.length > 0 ? <ErrorBand errors={errors} /> : null}

      {initiatives.data.length > 0 ? (
        <ResearchSection
          eyebrow="Initiatives"
          title="Sustainability and climate records"
          body="Active sustainability records bring together objectives, approach, activities, impact, dates, SDG alignment, and public contact points."
          tone="white"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {initiatives.data.map((initiative) => (
              <InitiativeCard key={initiative.id} initiative={initiative} />
            ))}
          </div>
        </ResearchSection>
      ) : null}

      {metrics.data.length > 0 || stories.data.length > 0 ? (
        <ResearchSection
          eyebrow="Impact"
          title="Measured sustainability outcomes"
          body="Impact metrics and success stories show the public evidence behind sustainability work."
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
            {metrics.data.length > 0 ? <MetricPanel records={metrics.data} /> : null}
            {stories.data.length > 0 ? <StoryPanel records={stories.data} /> : null}
          </div>
        </ResearchSection>
      ) : null}

      {partners.data.length > 0 || activities.data.length > 0 ? (
        <ResearchSection
          eyebrow="Delivery Network"
          title="Partners and public activities"
          body="Partner and event records show who is involved and where sustainability work is happening."
          tone="white"
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {partners.data.length > 0 ? (
              <RecordListPanel title="Partners" records={partners.data} />
            ) : null}
            {activities.data.length > 0 ? (
              <RecordListPanel title="Activities" records={activities.data} dateField="start_date" />
            ) : null}
          </div>
        </ResearchSection>
      ) : null}
    </main>
  );
}

function InitiativeCard({ initiative }: { initiative: ResearchGenericRecord }) {
  const dateRange = [formatDate(initiative.start_date), formatDate(initiative.end_date)]
    .filter(Boolean)
    .join(" - ");
  const textBlocks = [
    ["Summary", initiative.summary],
    ["Objectives", initiative.objectives],
    ["Approach", initiative.approach],
    ["Activities", initiative.activities],
    ["Impact", initiative.impact],
  ].filter(([, value]) => compactText(value));
  const sdgGoals = Array.isArray(initiative.sdg_goals) ? initiative.sdg_goals : [];

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap gap-2">
        <Badge>{formatLabel(initiative.initiative_type ?? "sustainability")}</Badge>
        {initiative.status ? <Badge>{formatLabel(initiative.status)}</Badge> : null}
        {initiative.is_featured ? <FilledBadge>Featured</FilledBadge> : null}
      </div>
      <h2 className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold leading-7 text-slate-950">
        {initiative.slug ? (
          <a href={`/sustainability/${initiative.slug}`} className="transition hover:text-primary">
            {compactText(initiative.name) || compactText(initiative.title) || compactText(initiative.code)}
          </a>
        ) : (
          compactText(initiative.name) || compactText(initiative.title) || compactText(initiative.code)
        )}
      </h2>
      {textBlocks.map(([label, value]) => (
        <div key={label} className="mt-4">
          <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
          <p className="mt-1 text-sm leading-7 text-slate-600">{compactText(value)}</p>
        </div>
      ))}
      {sdgGoals.length > 0 || dateRange || initiative.contact_email || initiative.website ? (
        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          {dateRange ? <ResearchFact label="Timeline" value={dateRange} /> : null}
          {sdgGoals.length > 0 ? <ResearchFact label="SDGs" value={sdgGoals.join(", ")} /> : null}
          {initiative.contact_email ? <ResearchFact label="Contact" value={compactText(initiative.contact_email)} /> : null}
          {initiative.website ? <ResearchFact label="Website" value={compactText(initiative.website)} /> : null}
        </dl>
      ) : null}
    </article>
  );
}

function MetricPanel({ records }: { records: ResearchGenericRecord[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Metrics</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {records.map((record) => (
          <div key={record.id} className="rounded-md bg-slate-50 p-4">
            <p className="text-2xl font-bold text-primary">
              {compactText(record.value)}
              {record.unit ? <span className="text-base"> {compactText(record.unit)}</span> : null}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-950">
              {compactText(record.name) || compactText(record.title)}
            </p>
            {record.reporting_year ? (
              <p className="mt-1 text-xs font-semibold uppercase text-slate-500">
                {compactText(record.reporting_year)}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}

function StoryPanel({ records }: { records: ResearchGenericRecord[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-950">Stories</h2>
      <div className="mt-4 divide-y divide-slate-200">
        {records.slice(0, 5).map((record) => (
          <article key={record.id} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-base font-semibold leading-6 text-slate-950">
              {compactText(record.title) || compactText(record.name)}
            </h3>
            {compactText(record.summary) || compactText(record.impact) ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {compactText(record.summary) || compactText(record.impact)}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </section>
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
              {compactText(record.name) || compactText(record.title)}
            </h3>
            {compactText(record.about) || compactText(record.summary) ? (
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {compactText(record.about) || compactText(record.summary)}
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
      <div className="mx-auto flex max-w-[1680px] flex-col gap-3">
        {uniqueErrors.map((error) => (
          <StatusMessage key={error} tone="error">
            {error}
          </StatusMessage>
        ))}
      </div>
    </section>
  );
}
