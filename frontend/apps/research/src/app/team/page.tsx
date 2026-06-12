import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchPageIntro, ResearchSection } from "../../components/research-ui";
import { getOfficeStaff, getOffices } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Team",
  description: "Research office staff and contact directory.",
};

export default async function TeamPage() {
  const [staff, offices] = await Promise.all([getOfficeStaff(), getOffices()]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro
        eyebrow="Team"
        title="Research office staff and contact directory."
        body="Staff and office records are backed by the Research Office endpoints."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Team" }]}
      />
      <ResearchSection
        eyebrow="People"
        title="Research team members"
        body="Public team records help researchers, partners, and students reach the right contacts."
        tone="white"
      >
        <GenericRecordGrid
          records={staff}
          labelFields={["role", "staff_type", "status"]}
          descriptionFields={["bio", "summary", "description"]}
          metaFields={["email", "phone"]}
        />
      </ResearchSection>
      <ResearchSection
        eyebrow="Offices"
        title="Research offices"
        body="Office records provide the administrative contacts behind the team directory."
      >
        <GenericRecordGrid
          records={offices}
          labelFields={["office_type", "status"]}
          metaFields={["email", "phone"]}
        />
      </ResearchSection>
    </main>
  );
}
