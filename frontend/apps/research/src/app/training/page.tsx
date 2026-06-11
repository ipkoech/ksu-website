import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import { getTraining } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Training Programs",
  description: "Research training programmes, workshops, and bootcamps.",
};

export default async function TrainingPage() {
  const training = await getTraining();

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Training"
        title="Research training, workshops, and bootcamps."
        body="Training programme records are loaded from the Research Training endpoint."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Training" }]}
      />
      <ResearchSection
        eyebrow="Capacity"
        title="Training programs"
        body="Public training programmes support research methods, ethics, writing, innovation, and leadership capacity."
        tone="white"
      >
        <GenericRecordGrid
          records={training}
          labelFields={["program_type", "delivery_mode", "status"]}
          metaFields={["start_date", "venue"]}
        />
      </ResearchSection>
    </main>
  );
}
