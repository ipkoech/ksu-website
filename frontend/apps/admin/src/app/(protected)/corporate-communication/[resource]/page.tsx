import { PortalResourcePage } from "@/components/portals/portal-resource-page";
import { getCanonicalPortalResourceHref, resolvePortalResourceKey } from "@/lib/portals/registry";
import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [
    { resource: "news" },
    { resource: "press-releases" },
    { resource: "stories" },
    { resource: "notices" },
    { resource: "events" },
    { resource: "homepage-features" },
    { resource: "sliders" },
    { resource: "media-folders" },
    { resource: "student-clubs" },
    { resource: "faqs" },
    { resource: "contacts" },
    { resource: "newsletters" },
    { resource: "newsletter-subscribers" },
    { resource: "testimonials" },
  ];
}

export default async function CorporateCommunicationResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const canonicalHref = getCanonicalPortalResourceHref("corporate-communication", resource);
  if (canonicalHref !== `/corporate-communication/${resource}`) {
    redirect(canonicalHref);
  }
  return (
    <PortalResourcePage
      portalKey="corporate-communication"
      resourceKey={resolvePortalResourceKey("corporate-communication", resource)}
    />
  );
}
