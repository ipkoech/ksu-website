import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export default async function CorporateCommunicationResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalResourcePage portalKey="corporate-communication" resourceKey={resource} />;
}
