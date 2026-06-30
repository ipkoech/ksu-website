import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export function generateStaticParams() {
  return [
    { resource: "council" },
    { resource: "divisions" },
    { resource: "wings" },
    { resource: "staff-assignments" },
    { resource: "documents" },
  ];
}

export default async function GovernanceResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalResourcePage portalKey="governance" resourceKey={resource} />;
}
