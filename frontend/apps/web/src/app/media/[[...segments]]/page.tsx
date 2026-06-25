import { notFound } from "next/navigation";
import { ContentDetailPage, ContentListingPage } from "@/components/public/content-pages";
import { pageFromSearchParams } from "@ksu/ui/components";
import {
  getContentDetailData,
  getMediaDeskListingData,
  type ContentKind,
  type MediaDeskSection,
} from "@/lib/content-page-data";

const mediaSections = new Set([
  "news",
  "events",
  "articles",
  "announcements",
  "gallery",
]);

function kindForSection(section: string): ContentKind {
  if (section === "articles") return "blogs";
  if (section === "gallery") return "media";
  return section as ContentKind;
}

export default async function MediaRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { segments = [] } = await params;
  const query = await searchParams;
  const [section, child, grandchild] = segments;
  const page = pageFromSearchParams(query);

  if (!section) {
    const data = await getMediaDeskListingData("overview", [], query, page);
    return <ContentListingPage data={data} />;
  }

  if (!mediaSections.has(section)) {
    const data = await getContentDetailData("media", section);
    if (!data) notFound();
    return <ContentDetailPage data={data} />;
  }

  const kind = kindForSection(section);
  const listingSection = section as MediaDeskSection;

  if (section === "announcements" && child === "category" && grandchild) {
    const data = await getMediaDeskListingData(listingSection, ["category", grandchild], query, page);
    return <ContentListingPage data={data} />;
  }

  if (child && child !== "category" && !(section === "events" && child === "past")) {
    const data = await getContentDetailData(kind, child);
    if (!data) notFound();
    return <ContentDetailPage data={data} />;
  }

  const data = await getMediaDeskListingData(
    listingSection,
    child ? [child] : [],
    query,
    page,
  );
  return <ContentListingPage data={data} />;
}
