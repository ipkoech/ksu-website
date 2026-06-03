import { redirect } from "next/navigation";

export default async function AnnouncementCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/media/announcements/category/${slug}`);
}
