import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export function generateStaticParams() {
  return [
    { resource: "news" },
    { resource: "press-releases" },
    { resource: "notices" },
    { resource: "events" },
    { resource: "homepage-features" },
    { resource: "sliders" },
    { resource: "media-folders" },
    { resource: "faqs" },
    { resource: "contacts" },
    { resource: "testimonials" },
  ];
}

export default async function CorporateCommunicationResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return (
    <PortalResourcePage
      portalKey="corporate-communication"
      resourceKey={resource}
    />
  );
}
