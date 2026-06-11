import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getPartnerBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function PartnerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getPartnerBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Research Partner"
      fallbackTitle="Research partner"
      fallbackBody="Partner record loaded from the Research service."
      backLabel="Partners"
      backHref="/partners"
      labelFields={["partner_type", "partnership_level", "status"]}
      factFields={[
        { label: "Country", field: "country" },
        { label: "Email", field: "email" },
        { label: "Website", field: "website" },
      ]}
      sections={[
        { title: "Profile", fields: ["about", "summary", "description"] },
        { title: "Collaboration", fields: ["collaboration_areas", "key_achievements"] },
      ]}
    />
  );
}
