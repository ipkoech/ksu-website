import type { Metadata } from "next";
import {
  Badge,
  IconCard,
  ResearchHero,
  ResearchSection,
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

export const dynamic = "force-dynamic";

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
      <ResearchHero
        eyebrow="Community Impact"
        title="Research that creates local and regional value."
        body="Track community-facing research, sustainability initiatives, outreach events, and social impact stories connected to Kisii University."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Research", href: "/" },
          { label: "Community Impact" },
        ]}
      />
      <ResearchSection
        eyebrow="Overview & Mission"
        title="Community impact priorities"
        body="The public impact surface groups local mission, economic and social value, and engagement activities in one place."
        tone="white"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <IconCard
            icon="target"
            title="Regional mission"
            body="Show the local and regional priorities shaped by Kisii University's research agenda."
          />
          <IconCard
            icon="users"
            title="Economic and social impact"
            body="Present community initiatives, social value, and donor-funded impact records."
          />
          <IconCard
            icon="calendar"
            title="Events and engagement"
            body="Surface public forums, outreach programmes, and community-facing research events."
          />
        </div>
      </ResearchSection>
      <ResearchSection
        eyebrow="Economic & Social Impact"
        title="Success stories and initiatives"
        body="Stories and sustainability records come from the Research service impact endpoints."
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
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {compactText(event.summary) || compactText(event.description)}
              </p>
              <p className="mt-5 rounded-md bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                {formatDate(event.start_date) || compactText(event.venue) || "Date pending"}
              </p>
            </article>
          ))}
        </div>
        {!events.error && events.data.length === 0 ? (
          <StatusMessage>No public engagement events are available.</StatusMessage>
        ) : null}
      </ResearchSection>
    </main>
  );
}

function RecordGrid({ records }: { records: Array<Record<string, any>> }) {
  if (records.length === 0) {
    return <StatusMessage>No community impact records are available.</StatusMessage>;
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {records.map((record) => (
        <article key={record.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <Badge>{formatLabel(record.story_type ?? record.initiative_type ?? record.impact_type ?? "impact")}</Badge>
          <h2 className="mt-4 text-xl font-semibold leading-7 text-slate-950">
            {record.title ?? record.name}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {compactText(record.summary) ||
              compactText(record.description) ||
              compactText(record.impact)}
          </p>
        </article>
      ))}
    </div>
  );
}
