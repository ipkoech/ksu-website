import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getOutputBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function OutputDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getOutputBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="Research Output"
      backLabel="Outputs"
      backHref="/outputs"
      labelFields={["output_type", "access_type", "status"]}
      factFields={[
        { label: "Version", field: "version" },
        { label: "DOI", field: "doi" },
        { label: "Released", field: "release_date", format: "date" },
      ]}
      sections={[
        { title: "Summary", fields: ["summary", "description"] },
        { title: "Use", fields: ["methodology", "usage_notes", "citation"] },
        { title: "Access", fields: ["access_url", "download_url", "repository_url"] },
      ]}
    />
  );
}
