import { PortalResourcePage } from "@/components/portals/portal-resource-page";
import { SchoolDepartmentsPage } from "@/components/schools/academics/school-departments-page";
import { SchoolProgrammesPage } from "@/components/schools/academics/school-programmes-page";
import { SchoolTeamPage } from "@/components/schools/team/school-team-page";
import { SchoolContentStudio } from "@/components/schools/content/school-content-studio";
import { MediaBatchUploader } from "@/components/schools/media/media-batch-uploader";
import { SchoolPublicationsPage } from "@/components/schools/publications/school-publications-page";
import { SchoolInquiryInbox } from "@/components/schools/inquiries/school-inquiry-inbox";
import { SchoolAuditPage } from "@/components/schools/audit/school-audit-page";
import { SchoolNotificationsPage } from "@/components/schools/notifications/school-notifications-page";

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
    case "content":
      return <SchoolContentStudio />;
    case "media":
      return <MediaBatchUploader />;
    case "publications":
      return <SchoolPublicationsPage />;
    case "inquiries":
      return <SchoolInquiryInbox />;
    case "audit":
      return <SchoolAuditPage />;
    case "notifications":
      return <SchoolNotificationsPage />;
    default:
      break;
  }
  return <PortalResourcePage portalKey="schools" resourceKey={resource} />;
}
