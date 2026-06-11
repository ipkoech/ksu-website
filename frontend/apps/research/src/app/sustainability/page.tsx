import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import { getSustainability } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Sustainability",
  description: "Sustainability initiatives and impact records.",
};

export default async function SustainabilityPage() {
  const sustainability = await getSustainability();

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Sustainability"
        title="Sustainability initiatives connected to research."
        body="Sustainability records are loaded from the Research service and surfaced as public initiatives."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Sustainability" }]}
      />
      <ResearchSection
        eyebrow="Initiatives"
        title="Sustainability records"
        body="These records support the public sustainability section."
        tone="white"
      >
        <GenericRecordGrid
          records={sustainability}
          labelFields={["initiative_type", "category", "status"]}
          metaFields={["start_date", "location"]}
          emptyMessage="No sustainability records are available."
        />
      </ResearchSection>
    </main>
  );
}
