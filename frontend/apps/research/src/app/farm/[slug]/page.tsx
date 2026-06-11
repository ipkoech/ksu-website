import { notFound } from "next/navigation";
import { ResearchRecordDetail } from "../../../components/research-detail";
import { getFarmBySlug } from "../../../lib/research-public-data";

export const dynamic = "force-dynamic";

export default async function FarmDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data, error } = await getFarmBySlug(slug);
  if (!data) notFound();

  return (
    <ResearchRecordDetail
      record={data}
      error={error}
      eyebrow="University Farm"
      backLabel="University Farm"
      backHref="/farm"
      labelFields={["farm_type", "status"]}
      factFields={[
        { label: "Size", field: "size_hectares" },
        { label: "Location", field: "location" },
        { label: "County", field: "county" },
        { label: "Manager", field: "manager_name" },
      ]}
      sections={[
        { title: "Profile", fields: ["summary", "about", "description"] },
        { title: "Operations", fields: ["activities", "products", "facilities", "capacity_info"] },
        { title: "Contact", fields: ["email", "phone", "address", "gps_coordinates"] },
      ]}
    />
  );
}
