import { ContentListingPage } from "@/components/public/content-pages";
import { getContentListingData } from "@/lib/content-page-data";

export default async function AnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ContentListingPage
      data={await getContentListingData("announcements", [], await searchParams)}
    />
  );
}
