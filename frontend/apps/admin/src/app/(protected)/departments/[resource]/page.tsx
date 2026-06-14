import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export default async function DepartmentsResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalResourcePage portalKey="departments" resourceKey={resource} />;
}
