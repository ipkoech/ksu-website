import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export function generateStaticParams() {
  return [
    { resource: "branches" },
    { resource: "branch-hours" },
    { resource: "branch-links" },
    { resource: "branch-files" },
    { resource: "today-hours" },
    { resource: "catalog" },
    { resource: "loans" },
    { resource: "reservations" },
    { resource: "charges" },
    { resource: "electronic" },
    { resource: "services" },
    { resource: "regulations" },
    { resource: "inquiries" },
    { resource: "tickets" },
    { resource: "statistics" },
    { resource: "guides" },
    { resource: "specialists" },
    { resource: "workflows" },
    { resource: "policies" },
    { resource: "staff" },
  ];
}

export default async function LibraryResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalResourcePage portalKey="library" resourceKey={resource} />;
}
