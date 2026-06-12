import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchPageIntro, ResearchSection } from "../../components/research-ui";
import { getServices } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Research Services",
  description: "Research support services available through Kisii University.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro
        eyebrow="Services"
        title="Research support services."
        body="Find services that support researchers, partners, and public engagement."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />
      <ResearchSection
        eyebrow="Support"
        title="Available services"
        body="Service records are loaded from the Research Services endpoint."
        tone="white"
      >
        <GenericRecordGrid
          records={services}
          labelFields={["service_type", "type", "status"]}
          metaFields={["turnaround_time"]}
          hrefBase="/services"
        />
      </ResearchSection>
    </main>
  );
}
