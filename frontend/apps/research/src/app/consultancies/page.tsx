import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import { getConsultancies } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Consultancies",
  description: "Consultancy services and expert engagement records.",
};

export default async function ConsultanciesPage() {
  const consultancies = await getConsultancies();

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Consultancies"
        title="Professional expert services and applied research support."
        body="Consultancy records are maintained in the Research service and surfaced for partners."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Consultancies" }]}
      />
      <ResearchSection
        eyebrow="Expert Services"
        title="Consultancy opportunities"
        body="These records describe available or active consultancy engagements."
        tone="white"
      >
        <GenericRecordGrid
          records={consultancies}
          labelFields={["consultancy_type", "category", "status"]}
          metaFields={["client_name", "start_date"]}
          emptyMessage="No consultancy records are available."
        />
      </ResearchSection>
    </main>
  );
}
