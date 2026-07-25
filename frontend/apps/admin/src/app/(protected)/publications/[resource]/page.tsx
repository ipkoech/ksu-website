import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [
    { resource: "submissions" },
    { resource: "school-review" },
    { resource: "office-review" },
    { resource: "published" },
    { resource: "journals" },
    { resource: "authors" },
  ];
}

export default async function PublicationsResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const mappedResource = resource === "journals" ? "publications/journals" : "publications";
  redirect(`/research/${mappedResource}`);
}
