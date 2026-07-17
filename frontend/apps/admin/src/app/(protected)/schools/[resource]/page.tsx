import { PortalResourcePage } from "@/components/portals/portal-resource-page";
import { SchoolDepartmentsPage } from "@/components/schools/academics/school-departments-page";
import { SchoolProgrammesPage } from "@/components/schools/academics/school-programmes-page";
import { SchoolTeamPage } from "@/components/schools/team/school-team-page";

export function generateStaticParams() {
  return [
    { resource: "team" },
    { resource: "departments" },
    { resource: "programmes" },
    { resource: "publications" },
    { resource: "content" },
    { resource: "media" },
    { resource: "inquiries" },
    { resource: "notifications" },
    { resource: "audit" },
  ];
}

export default async function SchoolsResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  switch (resource) {
    case "team":
      return <SchoolTeamPage />;
    case "departments":
      return <SchoolDepartmentsPage />;
    case "programmes":
      return <SchoolProgrammesPage />;
    default:
      break;
  }
  return <PortalResourcePage portalKey="schools" resourceKey={resource} />;
}
