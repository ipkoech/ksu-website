import {
  announcementsApi,
  blogsApi,
  eventsApi,
  mainApi,
  newsApi,
  type Announcement,
  type Blog,
  type Event,
  type Media,
  type News,
  type PaginatedResponse,
} from "@ksu/api-client";
import { publicFileUrl, resolvePublicMediaUrl } from "@/lib/public-media";

export type ContentKind =
  | "news"
  | "blogs"
  | "events"
  | "announcements"
  | "media";
export type ContentListingMode = "all" | "category" | "past";
export type MediaDeskSection =
  | "overview"
  | "news"
  | "articles"
  | "events"
  | "announcements"
  | "gallery";

type ListResponse<T> =
  | PaginatedResponse<T>
  | { data?: T[]; meta?: { total?: number; count?: number } };

export type NewsRecord = News & { contentKind: "news" };
export type BlogRecord = Blog & { contentKind: "blogs" };
export type EventRecord = Event & { contentKind: "events" };
export type AnnouncementRecord = Announcement & {
  contentKind: "announcements";
};
export type EditorialRecord =
  | NewsRecord
  | BlogRecord
  | EventRecord
  | AnnouncementRecord;

export type PublicMediaRecord = Media & {
  contentKind: "media";
};

export type ContentRecord = EditorialRecord | PublicMediaRecord;

export type ContentPageLink = {
  label: string;
  href: string;
};

export type ContentListingData = {
  kind: ContentKind;
  mediaDeskSection?: MediaDeskSection;
  title: string;
  eyebrow: string;
  body: string;
  href: string;
  mode: ContentListingMode;
  records: ContentRecord[];
  featured: ContentRecord | null;
  nav: ContentPageLink[];
  categories: ContentPageLink[];
  calendarEvents?: EventRecord[];
  total: number;
  page: number;
  perPage: number;
  filters: {
    q?: string;
    type?: string;
  };
};

export type GalleryImage = {
  url: string;
  title: string;
  alt?: string;
  width?: number | null;
  height?: number | null;
};

export type ContentDetailData = {
  kind: ContentKind;
  mediaDeskSection?: MediaDeskSection;
  record: ContentRecord;
  href: string;
  eyebrow: string;
  title: string;
  summary: string | null;
  body: string | null;
  heroImage: string | null;
  meta: Array<{ label: string; value: string }>;
  related: ContentRecord[];
  relatedLinks: ContentPageLink[];
  structuredContent: Record<string, unknown> | null;
  jsonLd: Record<string, unknown>;
  galleryImages: GalleryImage[];
};

const nav: ContentPageLink[] = [
  { label: "News", href: "/media/news" },
  { label: "Articles", href: "/media/articles" },
  { label: "Events", href: "/media/events" },
  { label: "Announcements", href: "/media/announcements" },
  { label: "Gallery", href: "/media/gallery" },
];

const mediaDeskNav: ContentPageLink[] = [
  { label: "News", href: "/media/news" },
  { label: "Events", href: "/media/events" },
  { label: "Articles", href: "/media/articles" },
  { label: "Announcements", href: "/media/announcements" },
  { label: "Gallery", href: "/media/gallery" },
];

const editorialFields = [
  "id",
  "title",
  "slug",
  "summary",
  "plain_text",
  "rich_text",
  "structured_content",
  "related_links",
  "featured_media_id",
  "scope_type",
  "scope_id",
  "published_at",
  "valid_from",
  "valid_to",
  "archived_at",
  "is_featured",
  "is_main",
  "is_public",
  "is_published",
  "status",
  "display_order",
  "meta_title",
  "meta_description",
  "keywords",
  "created_at",
  "updated_at",
].join(",");

const eventFields = [
  "id",
  "title",
  "slug",
  "summary",
  "plain_text",
  "rich_text",
  "structured_content",
  "related_links",
  "featured_media_id",
  "scope_type",
  "scope_id",
  "start_date",
  "end_date",
  "location",
  "is_virtual",
  "meeting_link",
  "published_at",
  "is_featured",
  "is_main",
  "is_public",
  "is_published",
  "status",
  "display_order",
  "meta_title",
  "meta_description",
  "keywords",
  "created_at",
  "updated_at",
].join(",");

const announcementFields = `${editorialFields},priority,category,audience`;

const mediaFields = [
  "id",
  "filename",
  "original_filename",
  "mime_type",
  "file_size",
  "public_url",
  "cdn_url",
  "url",
  "thumbnail_url",
  "title",
  "alt_text",
  "description",
  "caption",
  "tags",
  "credit",
  "media_type",
  "width",
  "height",
  "duration",
  "created_at",
  "updated_at",
].join(",");

function withKind(items: News[], kind: "news"): NewsRecord[];
function withKind(items: Blog[], kind: "blogs"): BlogRecord[];
function withKind(items: Event[], kind: "events"): EventRecord[];
function withKind(
  items: Announcement[],
  kind: "announcements",
): AnnouncementRecord[];
function withKind(items: Media[], kind: "media"): PublicMediaRecord[];
function withKind(
  items: Array<News | Blog | Event | Announcement | Media>,
  kind: ContentKind,
) {
  return items.map((item) => ({
    ...item,
    contentKind: kind,
  })) as ContentRecord[];
}

function metaCount<T>(response: ListResponse<T>) {
  const meta = response.meta as { total?: number; count?: number } | undefined;
  return meta?.total ?? meta?.count ?? response.data?.length ?? 0;
}

async function safeList<T>(
  request: Promise<ListResponse<T>>,
): Promise<ListResponse<T>> {
  try {
    return await request;
  } catch (error) {
    console.error("Failed to load content records:", error);
    return { data: [] };
  }
}

async function safeRecord<T>(
  request: Promise<{ data?: T | null }>,
): Promise<T | null> {
  try {
    const response = await request;
    return response.data ?? null;
  } catch (error) {
    console.error("Failed to load content record:", error);
    return null;
  }
}

function stripHtml(value?: string | null) {
  return (value ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function present(value?: string | number | null) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

export function summarize(record: ContentRecord, fallback: string | null = "") {
  if (record.contentKind === "media") {
    return (
      present(record.description) ??
      present(record.caption) ??
      present(record.alt_text) ??
      fallback
    );
  }

  const source =
    present(record.summary) ??
    ("excerpt" in record ? present(record.excerpt) : null) ??
    present(stripHtml(record.rich_text)) ??
    present(stripHtml(record.content)) ??
    present(record.plain_text) ??
    fallback;

  return source && source.length > 220 ? `${source.slice(0, 217)}...` : source;
}

export function recordTitle(record: ContentRecord) {
  if (record.contentKind === "media") {
    return (
      present(record.title) ??
      present(record.original_filename) ??
      present(record.filename) ??
      "Media item"
    );
  }
  return record.title;
}

export function formatDate(value?: string | null) {
  const raw = present(value);
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function recordDate(record: ContentRecord) {
  if (record.contentKind === "events") return formatDate(record.start_date);
  if (record.contentKind === "media") return formatDate(record.created_at);
  return formatDate(record.published_at ?? record.created_at);
}

export function recordHref(record: ContentRecord) {
  if (record.contentKind === "media") return `/media/gallery/${record.id}`;
  if (record.contentKind === "blogs") return `/media/articles/${record.slug}`;
  return `/media/${record.contentKind}/${record.slug}`;
}

export function categoryLabel(record: ContentRecord) {
  if (record.contentKind === "announcements")
    return present(record.category) ?? present(record.priority) ?? "Notice";
  if (record.contentKind === "events")
    return record.is_virtual ? "Virtual event" : "Event";
  if (record.contentKind === "media")
    return present(record.media_type) ?? "Media";
  return record.contentKind === "blogs" ? "Article" : "News";
}

export function mediaUrl(record: ContentRecord) {
  if (record.contentKind === "media") {
    const thumbnail = resolvePublicMediaUrl(record.thumbnail_url);
    if (thumbnail) return thumbnail;

    const isImage =
      record.media_type === "image" || record.mime_type?.startsWith("image/");
    if (!isImage) return null;

    return (
      resolvePublicMediaUrl(record.cdn_url) ??
      resolvePublicMediaUrl(record.public_url) ??
      resolvePublicMediaUrl(record.url) ??
      null
    );
  }

  return publicFileUrl(record.featured_media_id);
}

function bodyContent(record: ContentRecord) {
  if (record.contentKind === "media")
    return present(record.description) ?? present(record.caption);
  return (
    present(record.rich_text) ??
    present(record.content) ??
    present(record.plain_text) ??
    present(record.summary)
  );
}

function structuredContent(record: ContentRecord) {
  if (record.contentKind === "media") return null;
  return record.structured_content &&
    Object.keys(record.structured_content).length
    ? record.structured_content
    : null;
}

function relatedLinks(record: ContentRecord): ContentPageLink[] {
  if (record.contentKind === "media") return [];
  return (record.related_links ?? [])
    .map((item) => {
      const label = present(
        (item.title ?? item.label ?? item.name) as string | null,
      );
      const href = present(
        (item.href ?? item.url ?? item.link) as string | null,
      );
      return label && href ? { label, href } : null;
    })
    .filter(Boolean) as ContentPageLink[];
}

function listTitle(kind: ContentKind, mode: ContentListingMode, slug?: string) {
  if (kind === "blogs")
    return slug
      ? `${titleFromSlug(slug)} articles`
      : "University articles and blogs";
  if (kind === "events")
    return mode === "past" ? "Past events" : "University events";
  if (kind === "announcements") return "Announcements";
  if (kind === "media") return slug ? `${titleFromSlug(slug)} gallery` : "Gallery";
  return slug ? `${titleFromSlug(slug)} news` : "University news";
}

function titleFromSlug(slug?: string) {
  if (!slug) return "";
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function listingEyebrow(kind: ContentKind) {
  if (kind === "blogs") return "Articles";
  if (kind === "events") return "Events";
  if (kind === "announcements") return "Official Notices";
  if (kind === "media") return "Media Desk";
  return "News";
}

async function listByKind(
  kind: ContentKind,
  params: Record<string, string | number | boolean | undefined> = {},
) {
  if (kind === "news") {
    const response = await safeList(
      newsApi.list({ is_published: true, fields: editorialFields, ...params }),
    );
    return {
      records: withKind(response.data ?? [], kind),
      total: metaCount(response),
    };
  }
  if (kind === "blogs") {
    const response = await safeList(
      blogsApi.list({ is_published: true, fields: editorialFields, ...params }),
    );
    return {
      records: withKind(response.data ?? [], kind),
      total: metaCount(response),
    };
  }
  if (kind === "events") {
    const response = await safeList(
      eventsApi.list({ is_published: true, fields: eventFields, ...params }),
    );
    return {
      records: withKind(response.data ?? [], kind),
      total: metaCount(response),
    };
  }
  if (kind === "announcements") {
    const response = await safeList(
      announcementsApi.list({
        is_published: true,
        fields: announcementFields,
        ...params,
      }),
    );
    return {
      records: withKind(response.data ?? [], kind),
      total: metaCount(response),
    };
  }

  const response = await safeList<Media>(
    mainApi.get<PaginatedResponse<Media>>("/api/v1/public/media", {
      fields: mediaFields,
      ...params,
    }),
  );
  return {
    records: withKind(response.data ?? [], kind),
    total: metaCount(response),
  };
}

async function getRecordByKind(kind: ContentKind, slugOrId: string) {
  if (kind === "news")
    return safeRecord(newsApi.getBySlug(slugOrId, { fields: editorialFields }));
  if (kind === "blogs")
    return safeRecord(
      blogsApi.getBySlug(slugOrId, { fields: editorialFields }),
    );
  if (kind === "events")
    return safeRecord(eventsApi.getBySlug(slugOrId, { fields: eventFields }));
  if (kind === "announcements")
    return safeRecord(
      announcementsApi.getBySlug(slugOrId, { fields: announcementFields }),
    );
  return safeRecord<Media>(
    mainApi.get<{ data: Media }>(
      `/api/v1/public/media/${encodeURIComponent(slugOrId)}`,
    ),
  );
}

function categoryLinks(records: ContentRecord[], kind: ContentKind) {
  if (kind === "media") {
    return Array.from(
      new Set(
        records
          .map((record) =>
            record.contentKind === "media" ? record.media_type : null,
          )
          .filter(Boolean),
      ),
    ).map((category) => ({
      label: titleFromSlug(category as string),
      href: `/media/gallery?type=${encodeURIComponent(category as string)}`,
    }));
  }

  if (kind !== "announcements") return [];

  return Array.from(
    new Set(
      records
        .map((record) =>
          record.contentKind === "announcements" ? record.category : null,
        )
        .filter(Boolean),
    ),
  ).map((category) => ({
    label: category as string,
    href: `/media/announcements/category/${encodeURIComponent((category as string).toLowerCase().replace(/[^a-z0-9]+/g, "-"))}`,
  }));
}

function mediaSectionForKind(kind: ContentKind): MediaDeskSection {
  if (kind === "blogs") return "articles";
  if (kind === "media") return "gallery";
  return kind;
}

function currentMonthBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
}

function isCurrentMonthEvent(record: EventRecord) {
  const raw = present(record.start_date);
  if (!raw) return false;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return false;
  const { start, end } = currentMonthBounds();
  return date >= start && date <= end;
}

async function getCalendarEvents() {
  const events = await listByKind("events", {
    per_page: 80,
  });
  return events.records
    .filter((record): record is EventRecord => record.contentKind === "events")
    .filter(isCurrentMonthEvent)
    .sort(
      (first, second) =>
        new Date(first.start_date ?? 0).getTime() -
        new Date(second.start_date ?? 0).getTime(),
    );
}

export async function getContentListingData(
  kind: ContentKind,
  segments: string[] = [],
  searchParams: Record<string, string | string[] | undefined> = {},
  page: number = 1,
): Promise<ContentListingData> {
  const [area, slug] = segments;
  const mode: ContentListingMode =
    area === "category" ? "category" : area === "past" ? "past" : "all";
  const mediaType =
    typeof searchParams.type === "string" ? searchParams.type : undefined;
  const search =
    typeof searchParams.q === "string" ? searchParams.q : undefined;
  const perPage = kind === "media" ? 24 : 18;
  const listParams: Record<string, string | number | boolean | undefined> = {
    per_page: perPage,
    page,
    search,
  };

  if (kind === "media" && mode === "all" && !mediaType) {
    const [newsRecords, eventRecords, articleRecords, announcementRecords] =
      await Promise.all([
        listByKind("news", { per_page: 3, search }),
        listByKind("events", { per_page: 3, search }),
        listByKind("blogs", { per_page: 3, search }),
        listByKind("announcements", { per_page: 3, search }),
      ]);
    const records = [
      ...newsRecords.records,
      ...eventRecords.records,
      ...articleRecords.records,
      ...announcementRecords.records,
    ].sort((first, second) => {
      const firstDate = recordDate(first);
      const secondDate = recordDate(second);
      return (
        new Date(secondDate ?? 0).getTime() -
        new Date(firstDate ?? 0).getTime()
      );
    });
    const featured =
      records.find(
        (record) =>
          record.contentKind !== "media" &&
          Boolean(
            ("is_featured" in record && record.is_featured) ||
            ("is_main" in record && record.is_main),
          ),
      ) ??
      records[0] ??
      null;

    return {
      kind,
      mediaDeskSection: "overview",
      title: "Media Desk",
      eyebrow: "Media Desk",
      body: "News, events, articles, announcements, and gallery records from Kisii University in one public media desk.",
      href: "/media",
      mode,
      records,
      featured,
      nav: mediaDeskNav,
      categories: [],
      calendarEvents: await getCalendarEvents(),
      total:
        newsRecords.total +
        eventRecords.total +
        articleRecords.total +
        announcementRecords.total,
      page: 1,
      perPage: perPage,
      filters: {
        q: search,
        type: mediaType,
      },
    };
  }

  if (kind === "events" && mode !== "past") listParams.upcoming = true;
  if (kind === "events" && mode === "past") listParams.upcoming = false;
  if (kind === "media" && mediaType) listParams.media_type = mediaType;

  const primary = await listByKind(kind, listParams);
  const allForCategories =
    kind === "media" || kind === "announcements"
      ? await listByKind(kind, { per_page: 100 })
      : primary;
  const categorySlug = mode === "category" ? slug : undefined;
  const filtered =
    categorySlug && kind === "announcements"
      ? primary.records.filter((record) => {
          const category =
            record.contentKind === "announcements" ? record.category : null;
          return (
            (category ?? "")
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, "") === categorySlug
          );
        })
      : primary.records;

  return {
    kind,
    mediaDeskSection: mediaSectionForKind(kind),
    title: listTitle(kind, mode, categorySlug ?? mediaType),
    eyebrow: listingEyebrow(kind),
    body:
      kind === "media"
        ? "Public images and media records published by Kisii University."
        : "Latest official news, notices, events, and stories from Kisii University.",
    href: recordHrefPrefix(kind),
    mode,
    records: filtered,
    featured:
      filtered.find(
        (record) =>
          record.contentKind !== "media" &&
          Boolean(
            ("is_featured" in record && record.is_featured) ||
            ("is_main" in record && record.is_main),
          ),
      ) ??
      filtered[0] ??
      null,
    nav: nav.filter((item) => item.href !== recordHrefPrefix(kind)),
    categories: categoryLinks(allForCategories.records, kind),
    calendarEvents: await getCalendarEvents(),
    total: primary.total,
    page,
    perPage,
    filters: {
      q: search,
      type: mediaType,
    },
  };
}

function recordHrefPrefix(kind: ContentKind) {
  if (kind === "blogs") return "/media/articles";
  if (kind === "media") return "/media/gallery";
  return `/media/${kind}`;
}

export async function getMediaDeskListingData(
  section: MediaDeskSection = "overview",
  segments: string[] = [],
  searchParams: Record<string, string | string[] | undefined> = {},
  page: number = 1,
) {
  if (section === "overview") {
    return getContentListingData("media", [], searchParams, page);
  }

  const kind: ContentKind =
    section === "articles"
      ? "blogs"
      : section === "gallery"
        ? "media"
        : section;
  const data = await getContentListingData(kind, segments, searchParams, page);
  return { ...data, mediaDeskSection: section, nav: mediaDeskNav };
}

function detailMeta(record: ContentRecord) {
  const rows: Array<{ label: string; value: string | null }> = [
    { label: "Type", value: categoryLabel(record) },
    {
      label: record.contentKind === "events" ? "Date" : "Published",
      value: recordDate(record),
    },
  ];

  if (record.contentKind === "events") {
    rows.push(
      {
        label: "Location",
        value:
          present(record.location) ?? (record.is_virtual ? "Virtual" : null),
      },
      {
        label: "Access",
        value: record.meeting_link ? "Online access provided" : null,
      },
    );
  } else if (record.contentKind === "announcements") {
    rows.push(
      { label: "Audience", value: present(record.audience) },
      { label: "Valid until", value: formatDate(record.valid_to) },
    );
  } else if (record.contentKind === "media") {
    rows.push(
      { label: "Format", value: present(record.mime_type) },
      { label: "Credit", value: present(record.credit) },
    );
  }

  return rows.filter((row): row is { label: string; value: string } =>
    Boolean(row.value),
  );
}

function jsonLd(record: ContentRecord, href: string) {
  const title = recordTitle(record);
  const description = summarize(record, title);
  const image = mediaUrl(record);
  const base = {
    "@context": "https://schema.org",
    "@id": href,
    url: href,
    name: title,
    headline: title,
    description,
    image: image ? [image] : undefined,
    datePublished:
      record.contentKind === "events"
        ? record.start_date
        : record.contentKind === "media"
          ? record.created_at
          : (record.published_at ?? record.created_at),
    dateModified: record.updated_at,
    publisher: {
      "@type": "Organization",
      name: "Kisii University",
      url: "https://kisiiuniversity.ac.ke",
    },
  };

  if (record.contentKind === "events") {
    return {
      ...base,
      "@type": "Event",
      startDate: record.start_date,
      endDate: record.end_date,
      eventAttendanceMode: record.is_virtual
        ? "https://schema.org/OnlineEventAttendanceMode"
        : "https://schema.org/OfflineEventAttendanceMode",
      location: record.location
        ? {
            "@type": "Place",
            name: record.location,
          }
        : undefined,
    };
  }

  if (record.contentKind === "announcements")
    return { ...base, "@type": "NewsArticle" };
  if (record.contentKind === "blogs")
    return { ...base, "@type": "BlogPosting" };
  if (record.contentKind === "media")
    return {
      ...base,
      "@type": record.media_type === "image" ? "ImageObject" : "MediaObject",
      contentUrl: mediaUrl(record),
    };
  return { ...base, "@type": "NewsArticle" };
}

async function fetchGalleryImages(
  entityType: string,
  entityId: string,
): Promise<GalleryImage[]> {
  try {
    const response = await mainApi.get<{
      data: Array<{
        media: {
          public_url?: string | null;
          cdn_url?: string | null;
          url?: string;
          title?: string | null;
          alt_text?: string | null;
          width?: number | null;
          height?: number | null;
          mime_type?: string;
        } | null;
      }>;
    }>("/api/v1/public/media/links", {
      entity_type: entityType,
      entity_id: entityId,
      role: "gallery",
    });

    return (response.data ?? [])
      .filter((item) => item.media)
      .map((item) => {
        const m = item.media!;
        const url =
          resolvePublicMediaUrl(m.cdn_url) ??
          resolvePublicMediaUrl(m.public_url) ??
          resolvePublicMediaUrl(m.url) ??
          "";
        return {
          url,
          title: m.title || "",
          alt: m.alt_text ?? undefined,
          width: m.width,
          height: m.height,
        };
      })
      .filter((item) => item.url);
  } catch {
    return [];
  }
}

export async function getContentDetailData(
  kind: ContentKind,
  slugOrId: string,
): Promise<ContentDetailData | null> {
  const record = await getRecordByKind(kind, slugOrId);
  if (!record) return null;

  const normalized = { ...record, contentKind: kind } as ContentRecord;
  const latest = await listByKind(kind, { per_page: 8 });
  const related = latest.records
    .filter((item) =>
      item.contentKind === "media"
        ? item.id !== normalized.id
        : item.slug !== (normalized as EditorialRecord).slug,
    )
    .slice(0, 4);
  const href = recordHref(normalized);
  const entityType = kind === "blogs" ? "blog" : kind === "media" ? "media" : kind;

  const galleryImages =
    kind !== "media"
      ? await fetchGalleryImages(entityType, normalized.id)
      : [];

  return {
    kind,
    mediaDeskSection: mediaSectionForKind(kind),
    record: normalized,
    href,
    eyebrow: categoryLabel(normalized),
    title: recordTitle(normalized),
    summary: summarize(normalized, null),
    body: bodyContent(normalized),
    heroImage: mediaUrl(normalized),
    meta: detailMeta(normalized),
    related,
    relatedLinks: relatedLinks(normalized),
    structuredContent: structuredContent(normalized),
    jsonLd: jsonLd(normalized, href),
    galleryImages,
  };
}
