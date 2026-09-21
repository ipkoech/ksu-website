import { notFound } from "next/navigation";
import { BreadcrumbTrail, PageShell } from "@/components/site-shell";
import { getContentDetailData } from "@/lib/content-page-data";
import { resolvePublicMediaUrl } from "@/lib/public-media";
import {
  GalleryDetailDisplay,
  type GalleryDetailDto,
} from "@/components/public/gallery-detail-display";

export const metadata = {
  title: "Gallery",
};

export const revalidate = 300;

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getContentDetailData("media", id);
  if (!data) notFound();

  const isVideo =
    data.record.contentKind === "media" &&
    (data.record.media_type === "video" ||
      data.record.mime_type?.startsWith("video/"));
  const mediaSource =
    data.record.contentKind === "media"
      ? (resolvePublicMediaUrl(data.record.cdn_url) ??
        resolvePublicMediaUrl(data.record.public_url) ??
        resolvePublicMediaUrl(data.record.url))
      : data.heroImage;
  const displayData: GalleryDetailDto = {
    title: data.title,
    eyebrow: data.eyebrow,
    createdAt:
      data.record.contentKind === "media" ? data.record.created_at ?? null : null,
    summary: data.summary ?? null,
    meta: data.meta.map((item) => ({ label: item.label, value: item.value ?? null })),
    mediaSource: mediaSource ?? null,
    heroImage: data.heroImage ?? null,
    isVideo,
    body: data.body ?? null,
  };

  return (
    <PageShell>
      <GalleryDetailDisplay
        data={displayData}
        breadcrumb={
          <BreadcrumbTrail
            items={[
              { label: "Home", href: "/" },
              { label: "Media Desk", href: "/media" },
              { label: "Gallery", href: "/media/gallery" },
              { label: data.title },
            ]}
          />
        }
      />
    </PageShell>
  );
}
