import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import { getCenters } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Centers",
  description: "Research centers and institutes at Kisii University.",
};

export default async function CentersPage() {
  const centers = await getCenters();

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Centers"
        title="Research centers, institutes, and specialist units."
        body="Find institutional research centers and their areas of work."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Centers" }]}
      />
      <ResearchSection
        eyebrow="Directory"
        title="Research centers"
        body="Center records are backed by the Research Centers endpoint."
        tone="white"
      >
        <GenericRecordGrid
          records={centers}
          labelFields={["center_type", "status"]}
          descriptionFields={["summary", "description", "mandate"]}
          hrefBase="/centers"
        />
      </ResearchSection>
    </main>
  );
}
