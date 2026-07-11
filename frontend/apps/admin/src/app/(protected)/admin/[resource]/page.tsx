import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export function generateStaticParams() {
  return [
    { resource: "council" },
    { resource: "divisions" },
    { resource: "offices" },
    { resource: "staff-assignments" },
    { resource: "news" },
    { resource: "notices" },
    { resource: "events" },
    { resource: "documents" },
    { resource: "faqs" },
    { resource: "contacts" },
  ];
}

export default async function AdminResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalResourcePage portalKey="admin" resourceKey={resource} />;
}
