import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getGrantBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function FundingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getGrantBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data as ResearchGenericRecord}
      error={error}
      eyebrow="Funding"
      backLabel="Funding"
      backHref="/funding"
      labelFields={["grant_type", "category", "status"]}
      factFields={[
        { label: "Funder", field: "funder_name" },
        { label: "Deadline", field: "deadline", format: "date" },
        { label: "Amount", field: "amount" },
        { label: "Currency", field: "currency" },
      ]}
      sections={[
        { title: "Summary", fields: ["summary", "description"] },
        { title: "Application", fields: ["eligibility", "requirements", "application_process"] },
      ]}
    />
  );
}
