import { ContentListingPage } from "@/components/public/content-pages";
import { getContentListingData } from "@/lib/content-page-data";

export default async function AnnouncementCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;

  return (
    <ContentListingPage
      data={await getContentListingData("announcements", ["category", slug], await searchParams)}
    />
  );
}
