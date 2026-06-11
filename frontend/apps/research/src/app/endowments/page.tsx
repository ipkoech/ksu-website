import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchHero, ResearchSection } from "../../components/research-ui";
import { getEndowments, getFunders } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Endowment Funds",
  description: "Research endowment funds and funding partners.",
};

export default async function EndowmentsPage() {
  const [endowments, funders] = await Promise.all([
    getEndowments(),
    getFunders(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchHero
        eyebrow="Endowments"
        title="Permanent funding initiatives for research impact."
        body="Endowment and funder records are backed by the Research grants module."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Endowments" }]}
      />
      <ResearchSection
        eyebrow="Funds"
        title="Endowment funds"
        body="Endowment records show long-term funding priorities and opportunities."
        tone="white"
      >
        <GenericRecordGrid
          records={endowments}
          labelFields={["fund_type", "category", "status"]}
          metaFields={["target_amount", "current_amount"]}
        />
      </ResearchSection>
      <ResearchSection
        eyebrow="Funders"
        title="Funding partners"
        body="Funder records identify organizations that support research work."
      >
        <GenericRecordGrid
          records={funders}
          labelFields={["funder_type", "category", "status"]}
        />
      </ResearchSection>
    </main>
  );
}
