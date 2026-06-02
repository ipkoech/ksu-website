import { notFound } from "next/navigation";
import { ContentDetailPage, ContentListingPage } from "@/components/public/content-pages";
import { getContentDetailData, getContentListingData } from "@/lib/content-page-data";

export default async function BlogsRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { segments = [] } = await params;
  const query = await searchParams;

  if (segments[0] && segments[0] !== "category") {
    const data = await getContentDetailData("blogs", segments[0]);
    if (!data) notFound();
    return <ContentDetailPage data={data} />;
  }

  return <ContentListingPage data={await getContentListingData("blogs", segments, query)} />;
}
