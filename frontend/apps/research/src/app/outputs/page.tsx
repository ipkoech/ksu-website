import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import { getOutputs } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Outputs",
  description: "Public research outputs and report records.",
};

export default async function OutputsPage() {
  const outputs = await getOutputs();

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Outputs"
        title="Research outputs and public report records."
        body="Outputs are loaded from the Research Outputs endpoint and reflect public-facing research deliverables."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Outputs" }]}
      />
      <ResearchSection
        eyebrow="Catalogue"
        title="Research outputs"
        body="Browse public outputs from projects, centers, and innovation work."
        tone="white"
      >
        <GenericRecordGrid
          records={outputs}
          labelFields={["output_type", "category", "status"]}
          metaFields={["published_at", "year"]}
        />
      </ResearchSection>
    </main>
  );
}
