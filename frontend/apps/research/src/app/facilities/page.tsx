import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import { getFacilities, getServices } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Facilities & Labs",
  description: "Research facilities, labs, farms, and support services.",
};

export default async function FacilitiesPage() {
  const [facilities, services] = await Promise.all([
    getFacilities(),
    getServices(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Facilities & Labs"
        title="Infrastructure that supports research and innovation."
        body="Browse research farms, facilities, labs, and support services backed by the Research service."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Facilities" }]}
      />
      <ResearchSection
        eyebrow="Infrastructure"
        title="Facilities and research farms"
        body="Facility records are loaded from the farms endpoint."
        tone="white"
      >
        <GenericRecordGrid
          records={facilities}
          labelFields={["facility_type", "farm_type", "status"]}
          metaFields={["location"]}
        />
      </ResearchSection>
      <ResearchSection
        eyebrow="Support"
        title="Research services"
        body="Service records describe the support available to researchers and partners."
      >
        <GenericRecordGrid
          records={services}
          labelFields={["service_type", "type", "status"]}
          metaFields={["turnaround_time"]}
        />
      </ResearchSection>
    </main>
  );
}
