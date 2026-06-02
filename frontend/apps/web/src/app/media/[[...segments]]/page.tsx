import { notFound } from "next/navigation";
import { ContentDetailPage, ContentListingPage } from "@/components/public/content-pages";
import { getContentDetailData, getContentListingData } from "@/lib/content-page-data";

export default async function MediaRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { segments = [] } = await params;
  const query = await searchParams;

  if (segments[0]) {
    const data = await getContentDetailData("media", segments[0]);
    if (!data) notFound();
    return <ContentDetailPage data={data} />;
  }

  return <ContentListingPage data={await getContentListingData("media", segments, query)} />;
}
