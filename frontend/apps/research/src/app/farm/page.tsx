import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import { getFacilities, getSustainability } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "University Farm",
  description: "Research farms and farm-linked sustainability work.",
};

export default async function FarmPage() {
  const [farms, sustainability] = await Promise.all([
    getFacilities(),
    getSustainability(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="University Farm"
        title="Farm-linked research, facilities, and sustainability work."
        body="Research farm records and sustainability initiatives are loaded from the Research service."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "University Farm" }]}
      />
      <ResearchSection
        eyebrow="Facilities"
        title="Research farms"
        body="Farm records are backed by the Research Farms endpoint."
        tone="white"
      >
        <GenericRecordGrid
          records={farms}
          labelFields={["farm_type", "facility_type", "status"]}
          metaFields={["location"]}
          emptyMessage="No farm records are available."
        />
      </ResearchSection>
      <ResearchSection
        eyebrow="Sustainability"
        title="Farm-linked initiatives"
        body="Sustainability records show how research connects to practical environmental work."
      >
        <GenericRecordGrid
          records={sustainability}
          labelFields={["initiative_type", "category", "status"]}
          emptyMessage="No sustainability initiatives are available."
        />
      </ResearchSection>
    </main>
  );
}
