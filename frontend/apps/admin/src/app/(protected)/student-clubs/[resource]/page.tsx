import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export function generateStaticParams() {
  return [{ resource: "profiles" }];
}

export default async function StudentClubsResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalResourcePage portalKey="student-clubs" resourceKey={resource} />;
}
