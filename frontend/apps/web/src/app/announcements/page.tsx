import { PublicSectionPage } from "@/components/public/section-page";
import { getAnnouncementsPageConfig } from "@/lib/public-record-page-data";

export default async function AnnouncementsPage() {
  return <PublicSectionPage config={await getAnnouncementsPageConfig()} />;
}
