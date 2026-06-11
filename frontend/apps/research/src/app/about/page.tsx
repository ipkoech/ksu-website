import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import { getBoardMembers, getBoards, getOffices } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About Research",
  description: "Research office, governance, and REIRM structure.",
};

export default async function AboutPage() {
  const [offices, boards, boardMembers] = await Promise.all([
    getOffices(),
    getBoards(),
    getBoardMembers(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="About REIRM"
        title="Research, Extension, Innovation & Resource Mobilization."
        body="Explore the offices, boards, and governance records that structure research activity at Kisii University."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
      />
      <ResearchSection
        eyebrow="Office"
        title="Research offices"
        body="Office records provide the backend-backed administrative structure for public research support."
        tone="white"
      >
        <GenericRecordGrid
          records={offices}
          labelFields={["office_type", "status"]}
          metaFields={["email", "phone"]}
        />
      </ResearchSection>
      <ResearchSection
        eyebrow="Governance"
        title="Boards and members"
        body="Board and board member records represent research governance and advisory structures."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <GenericRecordGrid
            records={boards}
            labelFields={["board_type", "status"]}
          />
          <GenericRecordGrid
            records={boardMembers}
            labelFields={["role", "member_type", "status"]}
            descriptionFields={["bio", "summary", "description"]}
          />
        </div>
      </ResearchSection>
    </main>
  );
}
