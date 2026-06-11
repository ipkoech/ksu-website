import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getServiceBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getServiceBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Research Service"
      backLabel="Services"
      backHref="/services"
      labelFields={["service_type", "category", "status"]}
      factFields={[
        { label: "Turnaround", field: "turnaround_time" },
        { label: "Contact", field: "contact_email" },
        { label: "Free", field: "is_free" },
      ]}
      sections={[
        { title: "Summary", fields: ["summary", "description"] },
        { title: "Access", fields: ["how_to_access", "process", "eligibility", "request_url"] },
        { title: "Deliverables", fields: ["scope", "deliverables", "fee_structure"] },
      ]}
    />
  );
}
