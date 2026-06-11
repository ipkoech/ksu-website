import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import {
  getExpertiseTags,
  getFocusAreas,
  getOfficeStaff,
} from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Researchers & Expertise",
  description: "Research expertise, focus areas, and staff directory.",
};

export default async function ExpertisePage() {
  const [staff, expertiseTags, focusAreas] = await Promise.all([
    getOfficeStaff(),
    getExpertiseTags(),
    getFocusAreas(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Expertise"
        title="Find researchers, specialists, and focus areas."
        body="The expertise directory is built from research office staff, expertise tags, and focus area records."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Expertise" }]}
      />
      <ResearchSection
        eyebrow="People"
        title="Research team members"
        body="Office staff records provide the people layer for the public expertise directory."
        tone="white"
      >
        <GenericRecordGrid
          records={staff}
          labelFields={["role", "staff_type", "status"]}
          descriptionFields={["bio", "summary", "description"]}
          metaFields={["email", "phone"]}
          emptyMessage="No research team records are available."
        />
      </ResearchSection>
      <ResearchSection
        eyebrow="Expertise"
        title="Tags and focus areas"
        body="Expertise tags and focus areas support discovery across the research portfolio."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <GenericRecordGrid
            records={expertiseTags}
            labelFields={["category", "status"]}
            emptyMessage="No expertise tags are available."
          />
          <GenericRecordGrid
            records={focusAreas}
            labelFields={["category", "status"]}
            emptyMessage="No focus areas are available."
          />
        </div>
      </ResearchSection>
    </main>
  );
}
