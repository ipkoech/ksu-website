import { PortalResourcePage } from "@/components/portals/portal-resource-page";

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
  return <PortalResourcePage portalKey="publications" resourceKey={resource} />;
}
