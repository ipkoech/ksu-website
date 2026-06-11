import { notFound } from "next/navigation";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getPublicationBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function PublicationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data, error } = await getPublicationBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data as ResearchGenericRecord}
      error={error}
      eyebrow="Publication"
      fallbackTitle="Publication"
      fallbackBody="Publication record loaded from the Research service."
      backLabel="Publications"
      backHref="/publications"
      labelFields={["publication_type", "status", "access_type"]}
      factFields={[
        { label: "Journal", field: "journal_name" },
        { label: "Year", field: "year" },
        { label: "DOI", field: "doi" },
        { label: "Published", field: "publication_date", format: "date" },
      ]}
      sections={[
        { title: "Abstract", fields: ["abstract", "summary"] },
        { title: "Citation", fields: ["citation", "funding_acknowledgment", "grant_numbers"] },
        { title: "Access", fields: ["url", "pdf_url", "repository_url"] },
      ]}
    />
  );
}
