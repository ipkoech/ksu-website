"use client";

import {
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  Globe2,
  ImageIcon,
  Layers,
  Link2,
  Monitor,
  Smartphone,
  Tag,
} from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ImageRenderer,
  RichTextRenderer,
} from "@ksu/ui/components";
import {
  resolveMainMediaUrl,
  useMediaItem,
  useMediaLinks,
  type Media,
  type MediaLink,
} from "@ksu/api-client";

export type ContentRecordKind = "news" | "blog" | "event" | "announcement" | "slider";

export type RelatedLink = {
  title?: string | null;
  label?: string | null;
  url?: string | null;
  href?: string | null;
  description?: string | null;
};

export type ContentRecordLike = {
  id?: string;
  title?: string | null;
  slug?: string | null;
  subtitle?: string | null;
  summary?: string | null;
  excerpt?: string | null;
  plain_text?: string | null;
  rich_text?: string | null;
  content?: string | null;
  status?: string | null;
  priority?: string | null;
  category?: string | null;
  audience?: string | null;
  is_published?: boolean | null;
  is_public?: boolean | null;
  is_main?: boolean | null;
  is_featured?: boolean | null;
  is_active?: boolean | null;
  is_virtual?: boolean | null;
  display_order?: number | null;
  published_at?: string | null;
  valid_from?: string | null;
  valid_to?: string | null;
  archived_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  start_datetime?: string | null;
  end_datetime?: string | null;
  location?: string | null;
  venue?: string | null;
  meeting_link?: string | null;
  virtual_link?: string | null;
  external_url?: string | null;
  link_text?: string | null;
  open_in_new_tab?: boolean | null;
  scope_type?: string | null;
  scope_id?: string | null;
  author_user_id?: string | null;
  featured_media_id?: string | null;
  cover_image_id?: string | null;
  desktop_media_id?: string | null;
  mobile_media_id?: string | null;
  related_links?: unknown;
  keywords?: unknown;
  structured_content?: unknown;
};

export type ContentMediaField = {
  label: string;
  mediaId?: string | null;
  description?: string;
  icon?: "desktop" | "mobile" | "image";
};

type ContentRecordInspectorProps = {
  kind: ContentRecordKind;
  record: ContentRecordLike | null | undefined;
  mediaFields?: ContentMediaField[];
  className?: string;
  compact?: boolean;
};

type MediaLinkWithMedia = MediaLink & {
  media?: Media | null;
};

const kindLabel: Record<ContentRecordKind, string> = {
  news: "News article",
  blog: "Blog post",
  event: "Event",
  announcement: "Announcement",
  slider: "Slider",
};

function formatLabel(value?: string | null) {
  if (!value) return "-";
  return value.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function plainText(value?: string | null) {
  return (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function recordBody(record: ContentRecordLike) {
  return record.rich_text || record.content || record.plain_text || "";
}

function recordSummary(record: ContentRecordLike) {
  return record.summary || record.excerpt || plainText(recordBody(record));
}

function recordStatus(record: ContentRecordLike) {
  if (record.archived_at) return { label: "Archived", variant: "secondary" as const };
  if (record.status) return { label: formatLabel(record.status), variant: record.status === "published" ? "default" as const : "secondary" as const };
  if (typeof record.is_published === "boolean") return { label: record.is_published ? "Published" : "Draft", variant: record.is_published ? "default" as const : "secondary" as const };
  if (typeof record.is_active === "boolean") return { label: record.is_active ? "Active" : "Inactive", variant: record.is_active ? "default" as const : "secondary" as const };
  return { label: "Current", variant: "outline" as const };
}

function normalizeRelatedLinks(value: unknown): RelatedLink[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    .map((item) => ({
      title: typeof item.title === "string" ? item.title : undefined,
      label: typeof item.label === "string" ? item.label : undefined,
      url: typeof item.url === "string" ? item.url : undefined,
      href: typeof item.href === "string" ? item.href : undefined,
      description: typeof item.description === "string" ? item.description : undefined,
    }))
    .filter((item) => item.title || item.label || item.url || item.href);
}

function summarizeStructuredValue(value: unknown) {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (typeof value === "object") return `${Object.keys(value).length} field${Object.keys(value).length === 1 ? "" : "s"}`;
  return String(value);
}

function mediaUrl(media?: Media | null) {
  if (!media) return null;
  return (
    resolveMainMediaUrl(media.cdn_url) ??
    resolveMainMediaUrl(media.public_url) ??
    resolveMainMediaUrl(media.thumbnail_url) ??
    resolveMainMediaUrl(media.url) ??
    null
  );
}

function mediaName(media?: Media | null) {
  return media?.title || media?.original_filename || media?.filename || "Media";
}

function MediaFieldPreview({ field }: { field: ContentMediaField }) {
  const mediaQuery = useMediaItem(field.mediaId ?? "", { enabled: Boolean(field.mediaId) });
  const media = mediaQuery.data?.data ?? null;
  const Icon = field.icon === "desktop" ? Monitor : field.icon === "mobile" ? Smartphone : ImageIcon;

  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{field.label}</p>
            <p className="truncate text-xs text-muted-foreground">{field.description || (field.mediaId ? mediaName(media) : "No media selected")}</p>
          </div>
        </div>
        {field.mediaId ? <Badge variant="outline">Linked</Badge> : <Badge variant="secondary">Empty</Badge>}
      </div>
      {field.mediaId ? (
        <ImageRenderer
          src={mediaUrl(media)}
          alt={mediaName(media)}
          className="h-36 border-0"
          imageClassName="h-full w-full rounded-md"
          emptyFallback={<div className="flex h-36 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">Loading media...</div>}
        />
      ) : (
        <div className="flex h-24 items-center justify-center rounded-md border border-dashed bg-muted/30 text-sm text-muted-foreground">
          No media attached
        </div>
      )}
    </div>
  );
}

function LinkedMediaCard({ link }: { link: MediaLinkWithMedia }) {
  const mediaQuery = useMediaItem(link.media_id, { enabled: !link.media });
  const media = link.media ?? mediaQuery.data?.data ?? null;
  const isImage = media?.media_type === "image" || media?.mime_type?.startsWith("image/");

  return (
    <div className="grid gap-3 rounded-lg border bg-background p-3 sm:grid-cols-[120px_minmax(0,1fr)]">
      {isImage ? (
        <ImageRenderer
          src={mediaUrl(media)}
          alt={mediaName(media)}
          className="h-24 border-0"
          imageClassName="h-full w-full rounded-md"
        />
      ) : (
        <div className="flex h-24 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <FileText className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{mediaName(media)}</p>
          <Badge variant="outline">{formatLabel(link.role)}</Badge>
          {link.is_public ? <Badge variant="secondary">Public</Badge> : null}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {media?.mime_type || "Media attachment"}
          {typeof media?.file_size === "number" ? ` - ${Math.round(media.file_size / 1024)} KB` : ""}
        </p>
        {mediaUrl(media) ? (
          <a
            href={mediaUrl(media) ?? "#"}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80"
          >
            Open media
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

function LinkedMediaList({ kind, recordId }: { kind: ContentRecordKind; recordId?: string }) {
  const mediaLinksQuery = useMediaLinks(
    {
      entity_type: kind,
      entity_id: recordId ?? "",
      include: "media:id,filename,original_filename,mime_type,file_size,media_type,url,public_url,cdn_url,thumbnail_url,title,alt_text,caption,width,height",
    },
    { enabled: Boolean(recordId) },
  );
  const links = (mediaLinksQuery.data?.data ?? []) as MediaLinkWithMedia[];

  if (!recordId) return null;

  if (mediaLinksQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading linked media...</p>;
  }

  if (!links.length) {
    return <p className="text-sm text-muted-foreground">No linked attachments have been added to this record.</p>;
  }

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <LinkedMediaCard key={link.id} link={link} />
      ))}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">{value || "-"}</p>
    </div>
  );
}

function RelatedLinks({ links }: { links: RelatedLink[] }) {
  if (!links.length) {
    return <p className="text-sm text-muted-foreground">No related links have been saved for this record.</p>;
  }

  return (
    <div className="space-y-3">
      {links.map((link, index) => {
        const href = link.url || link.href || "";
        return (
          <a
            key={`${href}-${index}`}
            href={href || undefined}
            target={href ? "_blank" : undefined}
            rel={href ? "noreferrer" : undefined}
            className="block rounded-lg border bg-background p-3 transition hover:border-primary/40 hover:bg-primary/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{link.title || link.label || href || "Related item"}</p>
                {link.description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{link.description}</p> : null}
                {href ? <p className="mt-2 truncate text-xs text-primary">{href}</p> : null}
              </div>
              {href ? <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" /> : <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
            </div>
          </a>
        );
      })}
    </div>
  );
}

export function ContentRecordInspector({
  kind,
  record,
  mediaFields,
  className,
  compact = false,
}: ContentRecordInspectorProps) {
  if (!record?.id) return null;

  const status = recordStatus(record);
  const body = recordBody(record);
  const summary = recordSummary(record);
  const links = normalizeRelatedLinks(record.related_links);
  const defaultMediaFields: ContentMediaField[] = [
    {
      label: "Featured media",
      mediaId: record.featured_media_id || record.cover_image_id,
      description: "Used on lists, detail pages, and sharing previews.",
      icon: "image",
    },
  ];
  const resolvedMediaFields = mediaFields ?? defaultMediaFields;
  const startAt = record.start_date || record.start_datetime || record.valid_from;
  const endAt = record.end_date || record.end_datetime || record.valid_to;
  const location = record.location || record.venue;
  const linkUrl = record.external_url || record.meeting_link || record.virtual_link;
  const keywordSummary = summarizeStructuredValue(record.keywords);
  const structuredSummary = summarizeStructuredValue(record.structured_content);

  return (
    <section className={className}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{record.is_public === false ? "Private" : "Public"} visibility</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Placement</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {record.is_main ? <Badge variant="outline">Main</Badge> : null}
              {record.is_featured ? <Badge variant="outline">Featured</Badge> : null}
              {record.priority ? <Badge variant="secondary">{formatLabel(record.priority)}</Badge> : null}
              {record.category ? <Badge variant="secondary">{formatLabel(record.category)}</Badge> : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Schedule</p>
            <p className="mt-2 text-sm font-medium">{formatDateTime(startAt)}</p>
            <p className="mt-1 text-xs text-muted-foreground">End: {formatDateTime(endAt)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Updated</p>
            <p className="mt-2 text-sm font-medium">{formatDateTime(record.updated_at)}</p>
            <p className="mt-1 text-xs text-muted-foreground">Order {record.display_order ?? "-"}</p>
          </CardContent>
        </Card>
      </div>

      <div className={compact ? "mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]" : "mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"}>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{kindLabel[kind]}</Badge>
                {record.slug ? <Badge variant="secondary">{record.slug}</Badge> : null}
              </div>
              <CardTitle className="text-xl">{record.title || "Untitled record"}</CardTitle>
              <CardDescription>{summary || "No summary has been saved."}</CardDescription>
            </CardHeader>
            <CardContent>
              {body ? (
                <div className="max-h-[420px] overflow-y-auto rounded-lg border bg-muted/20 p-4">
                  <RichTextRenderer content={body} className="prose-sm" />
                </div>
              ) : (
                <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                  No body content has been saved.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Link2 className="h-4 w-4" />
                Related Content
              </CardTitle>
              <CardDescription>Related links and structured supporting data saved with this record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <RelatedLinks links={links} />
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-background p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Keywords
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{keywordSummary || "No keywords saved."}</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    Structured content
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{structuredSummary || "No structured content saved."}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="h-4 w-4" />
                Media
              </CardTitle>
              <CardDescription>Featured images, slide crops, and linked attachments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {resolvedMediaFields.map((field) => (
                <MediaFieldPreview key={`${field.label}-${field.mediaId ?? "empty"}`} field={field} />
              ))}
              <div className="border-t pt-4">
                <LinkedMediaList kind={kind} recordId={record.id} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe2 className="h-4 w-4" />
                Context
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <DetailItem label="Audience" value={record.audience ? formatLabel(record.audience) : undefined} />
              <DetailItem label="Scope" value={record.scope_type ? formatLabel(record.scope_type) : "Institutional"} />
              <DetailItem label="Location" value={location} />
              <DetailItem label="External link" value={linkUrl} />
              <DetailItem label="Published" value={formatDateTime(record.published_at)} />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-background p-3">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <p className="mt-2 text-xs text-muted-foreground">Created</p>
                  <p className="mt-1 text-sm font-medium">{formatDateTime(record.created_at)}</p>
                </div>
                <div className="rounded-lg border bg-background p-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="mt-2 text-xs text-muted-foreground">Archived</p>
                  <p className="mt-1 text-sm font-medium">{formatDateTime(record.archived_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
