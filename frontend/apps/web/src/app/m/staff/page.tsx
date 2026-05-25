import { PublicSectionPage } from "@/components/public/section-page";
import { getStaffPortalPage } from "@/lib/public-page-data";

export default function StaffPortalPage() {
  return <PublicSectionPage config={getStaffPortalPage()} />;
}
