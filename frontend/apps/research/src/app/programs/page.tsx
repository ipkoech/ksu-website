import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import { getPrograms, getThemes } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Programs",
  description: "Institutional research programs and themes at Kisii University.",
};

export default async function ProgramsPage() {
  const [programs, themes] = await Promise.all([getPrograms(), getThemes()]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Research Programs"
        title="Institutional programmes shaping long-term inquiry."
        body="Explore research programmes and themes maintained in the Research service."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Programs" }]}
      />
      <ResearchSection
        eyebrow="Programs"
        title="Research programs"
        body="Programme records are loaded from the research programs endpoint."
        tone="white"
      >
        <GenericRecordGrid
          records={programs}
          labelFields={["program_type", "status"]}
          metaFields={["start_date", "end_date"]}
          hrefBase="/programs"
        />
      </ResearchSection>
      <ResearchSection
        eyebrow="Themes"
        title="Research themes"
        body="Themes organize the strategic focus areas used by research teams."
      >
        <GenericRecordGrid
          records={themes}
          labelFields={["theme_type", "category", "status"]}
        />
      </ResearchSection>
    </main>
  );
}
