import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export function generateStaticParams() {
  return [
    { resource: "profiles" },
    { resource: "staff" },
    { resource: "programmes" },
    { resource: "users" },
    { resource: "services" },
    { resource: "notices" },
    { resource: "events" },
    { resource: "policies" },
    { resource: "resources" },
    { resource: "faqs" },
    { resource: "contacts" },
  ];
}

export default async function DepartmentsResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalResourcePage portalKey="departments" resourceKey={resource} />;
}
