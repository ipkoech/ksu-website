import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import { getEvents } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Events",
  description: "Research events, workshops, forums, and conferences.",
};

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Events"
        title="Research workshops, forums, and conferences."
        body="Published event records provide the public research calendar."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Events" }]}
      />
      <ResearchSection
        eyebrow="Calendar"
        title="Research events"
        body="Events are loaded from the Research Events endpoint."
        tone="white"
      >
        <GenericRecordGrid
          records={events}
          labelFields={["event_type", "category", "status"]}
          metaFields={["start_date", "venue", "location"]}
          hrefBase="/events"
        />
      </ResearchSection>
    </main>
  );
}
