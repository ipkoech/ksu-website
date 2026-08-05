import Link from "next/link";
import {
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Newspaper,
} from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import type { EntityMediaRecord } from "@/lib/entity-media-data";
import { publicMediaUrl } from "@/lib/public-media";

const spanPattern = [
  "md:col-span-4 md:row-span-2",
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-3 md:row-span-1",
  "md:col-span-3 md:row-span-1",
];

function present(value?: string | null) {
  const text = value?.trim();
  return text || null;
}

function itemHref(item: EntityMediaRecord) {
  if (item.recordType === "blog") return `/media/articles/${item.slug}`;
  if (item.recordType === "event") return `/media/events/${item.slug}`;
  if (item.recordType === "announcement") {
    return `/media/announcements/${item.slug}`;
  }
  if (item.recordType === "gallery") return `/media/gallery/${item.id}`;
  return `/media/news/${item.slug}`;
}

function itemDate(item: EntityMediaRecord) {
  const value =
    item.recordType === "event"
      ? item.start_date
      : item.recordType === "gallery"
        ? item.created_at
        : (item.published_at ?? item.created_at);
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function itemTitle(item: EntityMediaRecord) {
  if (item.recordType === "gallery") {
    return (
      present(item.title) ??
      present(item.original_filename) ??
      "Gallery image"
    );
  }
  return item.title;
}

function itemSummary(item: EntityMediaRecord) {
  if (item.recordType === "gallery") {
    return (
      present(item.description) ??
      present(item.caption) ??
      present(item.alt_text)
    );
  }
  return present(item.summary);
}

function itemLabel(item: EntityMediaRecord) {
  if (item.recordType === "gallery") return "Gallery";
  if (item.recordType === "blog") return "Article";
  if (item.recordType === "event") return "Event";
  if (item.recordType === "announcement") return "Announcement";
  return "News";
}

function FallbackArtwork({ item }: { item: EntityMediaRecord }) {
  const Icon =
    item.recordType === "event"
      ? CalendarDays
      : item.recordType === "gallery"
        ? ImageIcon
        : item.recordType === "announcement"
          ? FileText
          : Newspaper;

  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_20%_10%,hsl(var(--secondary)/0.35),transparent_34%),linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/0.72))] text-white">
      <Icon aria-hidden className="h-16 w-16 stroke-[1.15] opacity-65" />
    </div>
  );
}

export function EntityMediaMosaic({ items }: { items: EntityMediaRecord[] }) {
  return (
    <div className="grid gap-3 md:auto-rows-[14rem] md:grid-cols-6">
      {items.map((item, index) => {
        const imageUrl =
          item.recordType === "gallery" ? publicMediaUrl(item) : null;
        const lead = index % spanPattern.length === 0;
        const title = itemTitle(item);
        const summary = itemSummary(item);
        const imageAlt =
          item.recordType === "gallery"
            ? (present(item.alt_text) ?? title)
            : title;

        return (
          <Link
            key={`${item.recordType}-${item.id}`}
            href={itemHref(item)}
            className={`group relative min-h-72 cursor-pointer overflow-hidden rounded-[1.25rem] bg-primary shadow-sm outline-none ring-primary/35 transition hover:shadow-[0_22px_55px_-34px_rgba(15,23,42,0.72)] focus-visible:ring-2 md:min-h-0 ${
              items.length === 1
                ? "md:col-span-6 md:row-span-2"
                : spanPattern[index % spanPattern.length]
            }`}
          >
            <div className="absolute inset-0 transition duration-300 group-hover:scale-[1.025]">
              {imageUrl ? (
                <PublicImage
                  src={imageUrl}
                  alt={imageAlt}
                  ratio="fill"
                  sizes="(min-width: 1280px) 55vw, (min-width: 768px) 66vw, 100vw"
                  className="h-full w-full"
                  imageClassName="object-cover"
                />
              ) : (
                <FallbackArtwork item={item} />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white/75">
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-white backdrop-blur-sm">
                  {itemLabel(item)}
                </span>
                {itemDate(item) ? <span>{itemDate(item)}</span> : null}
              </div>
              <h2
                className={`mt-3 font-[family-name:var(--font-display)] font-semibold leading-tight text-white ${
                  lead ? "text-2xl sm:text-3xl" : "text-lg"
                }`}
              >
                {title}
              </h2>
              {lead && summary ? (
                <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-6 text-white/75">
                  {summary}
                </p>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
