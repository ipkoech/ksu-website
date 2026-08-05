import { PortalResourcePage } from "@/components/portals/portal-resource-page";

export function generateStaticParams() {
  return [
    { resource: "projects" },
    { resource: "centers" },
    { resource: "farms" },
    { resource: "programs" },
    { resource: "themes" },
    { resource: "focus-areas" },
    { resource: "expertise-tags" },
    { resource: "grants" },
    { resource: "grant-applications" },
    { resource: "grant-reviews" },
    { resource: "grant-reports" },
    { resource: "funders" },
    { resource: "endowments" },
    { resource: "grant-guidelines" },
    { resource: "partnerships" },
    { resource: "innovations" },
    { resource: "outputs" },
    { resource: "impact" },
    { resource: "stories" },
    { resource: "sustainability" },
    { resource: "consultancies" },
    { resource: "donors" },
    { resource: "donations" },
    { resource: "donation-impacts" },
    { resource: "donation-stories" },
    { resource: "donation-settings" },
    { resource: "training" },
    { resource: "mentorship" },
    { resource: "mentorship-applications" },
    { resource: "mentorship-matches" },
    { resource: "scholarships" },
    { resource: "scholarship-applications" },
    { resource: "resources" },
    { resource: "services" },
    { resource: "guidelines" },
  ];
}

export default async function ResearchResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  return <PortalResourcePage portalKey="research" resourceKey={resource} />;
}
