import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export default async function PublicationsResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalResourcePage portalKey="publications" resourceKey={resource} />;
}
