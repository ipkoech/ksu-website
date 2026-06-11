import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { PrimaryLink, ResearchHero, ResearchSection, SecondaryLink } from "../../components/research-ui";
import { getMentorship } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Mentorship",
  description: "Research mentorship programmes and sign-up pathways.",
};

export default async function MentorshipPage() {
  const mentorship = await getMentorship();

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Mentorship"
        title="Mentor and mentee pathways for research growth."
        body="Mentorship programme records are backed by the Research Mentorship endpoint."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Mentorship" }]}
        actions={
          <>
            <PrimaryLink href="/connect#mentorship">Mentor sign-up</PrimaryLink>
            <SecondaryLink href="/connect#mentorship">Mentee sign-up</SecondaryLink>
          </>
        }
      />
      <ResearchSection
        eyebrow="Programs"
        title="Mentorship programmes"
        body="Public mentorship records describe available cohorts and programme focus."
        tone="white"
      >
        <GenericRecordGrid
          records={mentorship}
          labelFields={["mentorship_type", "program_type", "status"]}
          metaFields={["start_date", "application_deadline"]}
          hrefBase="/mentorship"
        />
      </ResearchSection>
    </main>
  );
}
