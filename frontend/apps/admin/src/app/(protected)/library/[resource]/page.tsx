import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export default async function LibraryResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalResourcePage portalKey="library" resourceKey={resource} />;
}
