import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import { getScholarships } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Scholarships",
  description: "Research scholarship calls and opportunities.",
};

export default async function ScholarshipsPage() {
  const scholarships = await getScholarships();

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Scholarships"
        title="Research scholarships and student funding opportunities."
        body="Scholarship records are loaded directly from the Research Scholarships endpoint."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Scholarships" }]}
      />
      <ResearchSection
        eyebrow="Calls"
        title="Scholarship opportunities"
        body="Published scholarships support the public capacity and funding pathway."
        tone="white"
      >
        <GenericRecordGrid
          records={scholarships}
          labelFields={["scholarship_type", "category", "status"]}
          metaFields={["deadline", "amount"]}
          hrefBase="/scholarships"
        />
      </ResearchSection>
    </main>
  );
}
