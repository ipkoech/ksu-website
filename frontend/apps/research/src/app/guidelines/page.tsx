import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import { getGrantGuidelines, getGuidelines } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Guidelines",
  description: "Research guidelines, grant guidance, policies, and procedures.",
};

export default async function GuidelinesPage() {
  const [guidelines, grantGuidelines] = await Promise.all([
    getGuidelines(),
    getGrantGuidelines(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Guidelines"
        title="Research policies, procedures, and grant guidance."
        body="Guideline records are backed by the Research support and grant modules."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Guidelines" }]}
      />
      <ResearchSection
        eyebrow="Support"
        title="Research guidelines"
        body="General research guidelines and support documentation."
        tone="white"
      >
        <GenericRecordGrid
          records={guidelines}
          labelFields={["guideline_type", "type", "status"]}
          metaFields={["version", "effective_date"]}
          emptyMessage="No research guidelines are available."
        />
      </ResearchSection>
      <ResearchSection
        eyebrow="Funding"
        title="Grant guidelines"
        body="Grant guidelines support proposal development and reporting workflows."
      >
        <GenericRecordGrid
          records={grantGuidelines}
          labelFields={["guideline_type", "category", "status"]}
          metaFields={["version", "effective_date"]}
          emptyMessage="No grant guidelines are available."
        />
      </ResearchSection>
    </main>
  );
}
