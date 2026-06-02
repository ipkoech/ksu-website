import { notFound } from "next/navigation";
import { ContentDetailPage } from "@/components/public/content-pages";
import { getContentDetailData } from "@/lib/content-page-data";

export default async function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getContentDetailData("announcements", slug);
  if (!data) notFound();

  return <ContentDetailPage data={data} />;
}
