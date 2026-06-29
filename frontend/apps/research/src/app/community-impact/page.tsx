import type { Metadata } from "next";
import Link from "next/link";
import {
  Badge,
  PrimaryLink,
  ResearchSection,
  SecondaryLink,
  StatusMessage,
} from "../../components/research-ui";
import {
  compactText,
  formatDate,
  formatLabel,
  getDonationImpacts,
  getEvents,
  getStories,
  getSustainability,
} from "../../lib/research-public-data";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Community Impact",
  description: "Research community impact, outreach, public engagement, and success stories.",
};

export default async function CommunityImpactPage() {
  const [stories, sustainability, events, donationImpacts] = await Promise.all([
    getStories(),
    getSustainability(),
    getEvents(),
    getDonationImpacts(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <CommunityMasthead
        storyCount={stories.data.length}
        sustainabilityCount={sustainability.data.length}
        eventCount={events.data.length}
        donationImpactCount={donationImpacts.data.length}
      />
      <ResearchSection
        eyebrow="Economic & Social Impact"
        title="Success stories and initiatives"
        body="Stories and sustainability work are grouped around community outcomes and public impact."
      >
        <RecordGrid records={[...stories.data, ...sustainability.data, ...donationImpacts.data]} />
        {[stories.error, sustainability.error, donationImpacts.error].filter(Boolean).map((error) => (
          <div key={error} className="mt-4">
            <StatusMessage tone="error">{error}</StatusMessage>
          </div>
        ))}
      </ResearchSection>
      <ResearchSection
        eyebrow="Events & Engagement"
        title="Public engagement calendar"
        body="Published research events provide the outreach and engagement calendar requested for the community impact section."
        tone="white"
      >
        {events.error ? <StatusMessage tone="error">{events.error}</StatusMessage> : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {events.data.map((event) => (
            <article key={event.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <Badge>{formatLabel(event.event_type ?? event.category ?? "event")}</Badge>
              <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
                {event.title ?? event.name}
              </h2>
              {compactText(event.summary) || compactText(event.description) ? (
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {compactText(event.summary) || compactText(event.description)}
                </p>
              ) : null}
              {formatDate(event.start_date) || compactText(event.venue) ? (
                <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                  {formatDate(event.start_date) || compactText(event.venue)}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </ResearchSection>
    </main>
  );
}

function CommunityMasthead({
  storyCount,
  sustainabilityCount,
  eventCount,
  donationImpactCount,
}: {
  storyCount: number;
  sustainabilityCount: number;
  eventCount: number;
  donationImpactCount: number;
}) {
  const stats = [
    { label: "Impact stories", value: storyCount },
    { label: "Sustainability records", value: sustainabilityCount },
    { label: "Events", value: eventCount },
    { label: "Donation impacts", value: donationImpactCount },
  ];

  return (
    <section className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      <div className="mx-auto grid max-w-[1680px] gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,520px)] lg:items-end">
        <div>
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500" aria-label="Breadcrumb">
            <Link href="/" className="transition hover:text-primary">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Community Impact</span>
          </nav>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary">Community Impact</p>
          <h1 className="mt-3 max-w-5xl text-balance font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">Research that creates local and regional value</h1>
          <p className="mt-3 max-w-4xl text-pretty text-sm leading-7 text-slate-700 sm:text-base">Track published community-facing stories, sustainability records, public events, and donor impact evidence.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/events">View events</PrimaryLink>
            <SecondaryLink href="/sustainability">Sustainability</SecondaryLink>
          </div>
        </div>
        <dl className="grid gap-2 sm:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-[11px] font-semibold uppercase text-slate-500">{stat.label}</dt>
              <dd className="mt-1 text-lg font-semibold text-slate-950">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function RecordGrid({ records }: { records: Array<Record<string, any>> }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {records.map((record) => (
        <article key={record.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Badge>{formatLabel(record.story_type ?? record.initiative_type ?? record.impact_type ?? "impact")}</Badge>
          <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
            {record.title ?? record.name}
          </h2>
          {compactText(record.summary) ||
          compactText(record.description) ||
          compactText(record.impact) ? (
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {compactText(record.summary) ||
                compactText(record.description) ||
                compactText(record.impact)}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
