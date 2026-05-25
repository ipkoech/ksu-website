import { PublicSectionPage } from "@/components/public/section-page";
import { getAnnouncementsPageConfig } from "@/lib/public-record-page-data";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <PublicSectionPage config={await getAnnouncementsPageConfig([slug])} />;
}
