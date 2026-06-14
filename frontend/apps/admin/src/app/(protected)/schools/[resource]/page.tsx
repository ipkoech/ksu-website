import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export default async function SchoolsResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalResourcePage portalKey="schools" resourceKey={resource} />;
}
