import { pageFromSearchParams } from "@ksu/ui/components";
import { ContentListingPage } from "@/components/public/content-pages";
import { getMediaDeskListingData } from "@/lib/content-page-data";

export const metadata = {
  title: "Gallery",
  description:
    "Published image and video records from the Kisii University media library.",
};

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const page = pageFromSearchParams(query);
  const data = await getMediaDeskListingData("gallery", [], query, page);

  return <ContentListingPage data={data} />;
}
