import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export function generateStaticParams() {
  return [
    { resource: "profiles" },
    { resource: "departments" },
    { resource: "programmes" },
    { resource: "calendars" },
    { resource: "intakes" },
    { resource: "staff" },
    { resource: "news" },
    { resource: "events" },
    { resource: "validation" },
  ];
}

export default async function SchoolsResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalResourcePage portalKey="schools" resourceKey={resource} />;
}
