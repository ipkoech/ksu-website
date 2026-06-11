import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getEndowmentBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function EndowmentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getEndowmentBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Endowment"
      fallbackTitle="Research endowment"
      fallbackBody="Endowment record loaded from the Research service."
      backLabel="Endowments"
      backHref="/endowments"
      labelFields={["fund_type", "category", "status"]}
      factFields={[
        { label: "Target", field: "target_amount" },
        { label: "Current", field: "current_amount" },
        { label: "Currency", field: "currency" },
      ]}
      sections={[
        { title: "Summary", fields: ["summary", "description"] },
        { title: "Purpose", fields: ["purpose", "eligibility", "governance"] },
      ]}
    />
  );
}
