import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export default async function InstitutionalAdministrationResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return (
    <PortalResourcePage
      portalKey="institutional-administration"
      resourceKey={resource}
    />
  );
}

