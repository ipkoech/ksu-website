import {
  mainApi,
  type Announcement,
  type Blog,
  type Event,
  type Media,
  type MediaLink,
  type News,
  type PaginatedResponse,
} from "@ksu/api-client";

type ListResponse<T> = {
  data?: T[];
  meta?: {
    total?: number;
    count?: number;
    per_page?: number;
    pages?: number;
    total_pages?: number;
  };
};

export type EntityMediaRecord =
  | (News & { recordType: "news"; recordScope?: "scoped" | "fallback" })
  | (Blog & { recordType: "blog"; recordScope?: "scoped" | "fallback" })
  | (Event & { recordType: "event"; recordScope?: "scoped" | "fallback" })
  | (Announcement & {
      recordType: "announcement";
      recordScope?: "scoped" | "fallback";
    })
  | (Media & { recordType: "gallery"; recordScope?: "scoped" });

export type EntityMediaType =
  | "news"
  | "events"
  | "blogs"
  | "announcements"
  | "gallery";

const updateFields = [
  "id",
  "title",
  "slug",
  "summary",
  "category",
  "published_at",
  "start_date",
  "location",
  "venue",
  "is_public",
  "is_published",
  "status",
  "display_order",
  "created_at",
  "updated_at",
].join(",");

async function safeList<T>(
  request: Promise<ListResponse<T> | PaginatedResponse<T>>,
): Promise<ListResponse<T> | PaginatedResponse<T>> {
  try {
    return await request;
  } catch (error) {
    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number((error as { status?: unknown }).status)
        : undefined;

    if (status && [401, 403, 404, 422].includes(status)) {
      return { data: [] };
    }

    console.error("Failed to load scoped entity media:", error);
    return { data: [] };
  }
}

function mediaDate(item: EntityMediaRecord) {
  if (item.recordType === "event") return item.start_date;
  if (item.recordType === "gallery") return item.created_at;
  return item.published_at ?? item.created_at;
}

async function scopedEditorial<T extends News | Blog | Event | Announcement>(
  path: string,
  scopeType: string,
  scopeId: string,
) {
  return safeList<T>(
    mainApi.get<PaginatedResponse<T>>(path, {
      scope_type: scopeType,
      scope_id: scopeId,
      fields: updateFields,
      per_page: 12,
    }),
  );
}

async function fallbackEditorial<T extends News | Blog | Event | Announcement>(
  path: string,
) {
  return safeList<T>(
    mainApi.get<PaginatedResponse<T>>(path, {
      is_published: true,
      fields: updateFields,
      per_page: 3,
    }),
  );
}

async function getGallery(scopeType: string, scopeId: string, scopeName: string) {
  const linked = await safeList<MediaLink>(
    mainApi.get<ListResponse<MediaLink>>("/api/v1/public/media/links", {
      entity_type: scopeType,
      entity_id: scopeId,
      role: "gallery",
      per_page: 8,
    }),
  );

  const linkedMedia = (linked.data ?? [])
    .map((link) => link.media)
    .filter((media): media is Media => Boolean(media?.id))
    .filter((media) => media.media_type === "image" || media.mime_type?.startsWith("image/"));

  if (linkedMedia.length) return linkedMedia;

  const searched = await safeList<Media>(
    mainApi.get<PaginatedResponse<Media>>("/api/v1/public/media", {
      media_type: "image",
      search: scopeName,
      per_page: 8,
    }),
  );

  return searched.data ?? [];
}

export function entityMediaTypeMatches(
  item: EntityMediaRecord,
  type?: EntityMediaType,
) {
  if (!type) return true;
  if (type === "events") return item.recordType === "event";
  if (type === "blogs") return item.recordType === "blog";
  if (type === "announcements") return item.recordType === "announcement";
  if (type === "gallery") return item.recordType === "gallery";
  return item.recordType === "news";
}

export function entityMediaTypeTitle(type?: EntityMediaType) {
  switch (type) {
    case "news":
      return "News";
    case "events":
      return "Events";
    case "blogs":
      return "Blogs";
    case "announcements":
      return "Announcements";
    case "gallery":
      return "Gallery";
    default:
      return "News, events, blogs, announcements, and gallery";
  }
}

export function entityMediaTypeBody(type?: EntityMediaType) {
  if (type === "gallery") {
    return "Gallery records are limited to media directly related to this office.";
  }
  if (type) {
    return `Published ${entityMediaTypeTitle(type).toLowerCase()} connected to this office. If none are available, the latest university-wide records are shown.`;
  }
  return "Browse content types connected to this office, including news, events, blogs, announcements, and gallery records.";
}

export async function getScopedEntityMedia(
  scopeType: "division" | "wing" | "department" | "school",
  scopeId: string,
  scopeName: string,
): Promise<EntityMediaRecord[]> {
  const [news, blogs, events, announcements, gallery] = await Promise.all([
    scopedEditorial<News>("/api/v1/news", scopeType, scopeId),
    scopedEditorial<Blog>("/api/v1/blogs", scopeType, scopeId),
    scopedEditorial<Event>("/api/v1/events", scopeType, scopeId),
    scopedEditorial<Announcement>("/api/v1/announcements", scopeType, scopeId),
    getGallery(scopeType, scopeId, scopeName),
  ]);

  const [newsItems, blogItems, eventItems, announcementItems] = await Promise.all([
    news.data?.length
      ? Promise.resolve(
          news.data.map((item) => ({
            ...item,
            recordType: "news" as const,
            recordScope: "scoped" as const,
          })),
        )
      : fallbackEditorial<News>("/api/v1/news").then((response) =>
          (response.data ?? []).map((item) => ({
            ...item,
            recordType: "news" as const,
            recordScope: "fallback" as const,
          })),
        ),
    blogs.data?.length
      ? Promise.resolve(
          blogs.data.map((item) => ({
            ...item,
            recordType: "blog" as const,
            recordScope: "scoped" as const,
          })),
        )
      : fallbackEditorial<Blog>("/api/v1/blogs").then((response) =>
          (response.data ?? []).map((item) => ({
            ...item,
            recordType: "blog" as const,
            recordScope: "fallback" as const,
          })),
        ),
    events.data?.length
      ? Promise.resolve(
          events.data.map((item) => ({
            ...item,
            recordType: "event" as const,
            recordScope: "scoped" as const,
          })),
        )
      : fallbackEditorial<Event>("/api/v1/events").then((response) =>
          (response.data ?? []).map((item) => ({
            ...item,
            recordType: "event" as const,
            recordScope: "fallback" as const,
          })),
        ),
    announcements.data?.length
      ? Promise.resolve(
          announcements.data.map((item) => ({
            ...item,
            recordType: "announcement" as const,
            recordScope: "scoped" as const,
          })),
        )
      : fallbackEditorial<Announcement>("/api/v1/announcements").then(
          (response) =>
            (response.data ?? []).map((item) => ({
              ...item,
              recordType: "announcement" as const,
              recordScope: "fallback" as const,
            })),
        ),
  ]);

  return [
    ...newsItems,
    ...blogItems,
    ...eventItems,
    ...announcementItems,
    ...gallery.map((item) => ({
      ...item,
      recordType: "gallery" as const,
      recordScope: "scoped" as const,
    })),
  ].sort(
    (first, second) =>
      new Date(mediaDate(second) ?? 0).getTime() -
      new Date(mediaDate(first) ?? 0).getTime(),
  );
}
