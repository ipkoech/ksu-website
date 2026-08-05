import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Play } from "lucide-react";
import type { VcPublicItem, VcPublicMedia } from "@ksu/api-client";
import { PublicImage } from "@/components/public/public-image";
import { VcVideoPlayer } from "./vc-video-player";

function formatDate(value?: string | null, short = false) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(
    "en-KE",
    short
      ? { day: "2-digit", month: "short" }
      : { day: "numeric", month: "long", year: "numeric" },
  ).format(date);
}

function itemHref(
  kind: "activity" | "speech" | "event" | "gallery",
  item: VcPublicItem,
) {
  if (!item.slug) return null;
  if (kind === "activity") return `/media/news/${item.slug}`;
  if (kind === "speech") return `/about/vice-chancellor/speeches/${item.slug}`;
  if (kind === "event") return `/events/${item.slug}`;
  return `/about/vice-chancellor/galleries/${item.slug}`;
}

function ImageStoryCard({
  item,
  featured = false,
}: {
  item: VcPublicItem;
  featured?: boolean;
}) {
  const href = itemHref("activity", item);
  const card = (
    <article
      className={`group relative isolate overflow-hidden bg-primary ${featured ? "min-h-[330px] sm:min-h-[410px]" : "min-h-[290px]"}`}
    >
      <PublicImage
        src={item.cover?.url}
        alt={item.cover?.alt_text || item.title}
        ratio="fill"
        className="absolute inset-0"
        imageClassName="transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        sizes={
          featured
            ? "(min-width: 1024px) 80vw, 100vw"
            : "(min-width: 1024px) 27vw, 100vw"
        }
      />
      <div
        className={`absolute inset-0 ${
          featured
            ? "bg-[linear-gradient(90deg,hsl(var(--primary)/.96)_0%,hsl(var(--primary)/.76)_34%,transparent_72%),linear-gradient(0deg,rgba(0,0,0,.28),transparent_55%)]"
            : "bg-[linear-gradient(0deg,rgba(0,0,0,.82)_0%,rgba(0,0,0,.12)_72%)]"
        }`}
      />
      <div
        className={`absolute inset-0 flex flex-col justify-end text-white ${featured ? "max-w-xl p-7 sm:p-10" : "p-6"}`}
      >
        <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-secondary">
          {item.editorial_label ||
            (featured ? "Featured story" : "Leadership in action")}
        </p>
        <h3
          className={`mt-3 font-[family-name:var(--font-display)] font-semibold leading-[1.08] ${featured ? "text-3xl sm:text-4xl" : "text-2xl"}`}
        >
          {item.title}
        </h3>
        {item.summary ? (
          <p
            className={`mt-3 leading-6 text-white/90 ${featured ? "max-w-md text-sm sm:text-base" : "line-clamp-2 text-sm"}`}
          >
            {item.summary}
          </p>
        ) : null}
        {href ? (
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-secondary">
            Read the story <ArrowRight className="size-4" aria-hidden />
          </span>
        ) : null}
      </div>
    </article>
  );
  return href ? (
    <Link
      href={href}
      className="block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary/50"
    >
      {card}
    </Link>
  ) : (
    card
  );
}

export function VcActivitiesSection({ items }: { items: VcPublicItem[] }) {
  if (!items.length) return null;
  const featured = items.find((item) => item.is_featured) || items[0];
  const supporting = items
    .filter((item) => item.id !== featured.id)
    .slice(0, 3);

  return (
    <section
      id="vc-activities"
      className="scroll-mt-24 bg-white py-14 sm:py-20"
    >
      <div className="container">
        <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-primary sm:text-5xl">
          Leadership in action
        </h2>
        <div className="mt-6">
          <ImageStoryCard item={featured} featured />
        </div>
        {supporting.length ? (
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {supporting.map((item) => (
              <ImageStoryCard key={item.id} item={item} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PodiumListItem({
  item,
  isVideo,
}: {
  item: VcPublicItem;
  isVideo: boolean;
}) {
  const href = isVideo ? item.source_url : itemHref("speech", item);
  const date = formatDate(item.recorded_at || item.delivered_at);
  const content = (
    <article className="group grid grid-cols-[112px_minmax(0,1fr)] gap-4 border-b border-white/20 py-5 first:pt-0 last:border-0">
      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        <PublicImage
          src={item.cover?.url || item.thumbnail_url}
          alt={item.cover?.alt_text || ""}
          ratio="fill"
          className="absolute inset-0"
          sizes="112px"
        />
        {isVideo ? (
          <span className="absolute inset-0 grid place-items-center bg-black/15">
            <span className="grid size-9 place-items-center rounded-full border border-white/80 bg-black/30">
              <Play className="ml-0.5 size-4 fill-current" aria-hidden />
            </span>
          </span>
        ) : null}
      </div>
      <div>
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold leading-tight text-white">
          {item.title}
        </h3>
        {date ? (
          <p className="mt-1 text-[0.68rem] uppercase tracking-[0.1em] text-white/65">
            {date}
          </p>
        ) : null}
        {item.summary ? (
          <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/70">
            {item.summary}
          </p>
        ) : null}
        {href ? (
          <span className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-secondary">
            View {isVideo ? "video" : "address"}{" "}
            <ArrowRight className="size-3.5" />
          </span>
        ) : null}
      </div>
    </article>
  );

  if (!href) return content;
  return isVideo ? (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block focus-visible:ring-2 focus-visible:ring-secondary"
    >
      {content}
    </a>
  ) : (
    <Link
      href={href}
      className="block focus-visible:ring-2 focus-visible:ring-secondary"
    >
      {content}
    </Link>
  );
}

export function VcPodiumSection({
  videos,
  speeches,
}: {
  videos: VcPublicItem[];
  speeches: VcPublicItem[];
}) {
  if (!videos.length && !speeches.length) return null;
  const featuredVideo =
    videos.find((item) => item.is_featured && item.embed_url) ||
    videos.find((item) => item.embed_url);
  const listItems = [
    ...videos
      .filter((item) => item.id !== featuredVideo?.id)
      .map((item) => ({ item, isVideo: true })),
    ...speeches.map((item) => ({ item, isVideo: false })),
  ].slice(0, 3);

  return (
    <section
      id="vc-speeches"
      className="scroll-mt-24 bg-primary py-14 text-white sm:py-18"
    >
      <div className="container">
        <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold sm:text-5xl">
          From the podium
        </h2>
        <div className="mt-7 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,.85fr)]">
          <div>
            {featuredVideo ? (
              <>
                <VcVideoPlayer
                  title={featuredVideo.title}
                  embedUrl={featuredVideo.embed_url}
                  posterUrl={
                    featuredVideo.cover?.url || featuredVideo.thumbnail_url
                  }
                />
                <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">
                      {featuredVideo.category || "Featured address"}
                    </p>
                    <h3 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
                      {featuredVideo.title}
                    </h3>
                  </div>
                  {formatDate(featuredVideo.recorded_at) ? (
                    <p className="text-sm text-white/65">
                      {formatDate(featuredVideo.recorded_at)}
                    </p>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="border-l-2 border-secondary pl-6">
                <p className="text-sm uppercase tracking-[0.14em] text-secondary">
                  Addresses and reflections
                </p>
                <p className="mt-3 max-w-xl font-[family-name:var(--font-display)] text-3xl leading-tight">
                  Messages guiding the University’s shared direction.
                </p>
              </div>
            )}
          </div>
          <div>
            {listItems.map(({ item, isVideo }) => (
              <PodiumListItem
                key={`${isVideo ? "video" : "speech"}-${item.id}`}
                item={item}
                isVideo={isVideo}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function VcEventsSection({ items }: { items: VcPublicItem[] }) {
  if (!items.length) return null;
  return (
    <section
      id="vc-events"
      className="scroll-mt-24 border-b border-border bg-white py-14 sm:py-18"
    >
      <div className="container grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-primary sm:text-5xl">
            On the calendar
          </h2>
          <Link
            href="/events"
            className="mt-8 inline-flex min-h-11 items-center gap-3 border border-primary px-5 text-sm font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-white active:scale-[0.98]"
          >
            View all events <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="divide-y divide-border border-l border-secondary/55 pl-5 sm:pl-8">
          {items.slice(0, 4).map((item) => {
            const href = itemHref("event", item);
            const date = formatDate(item.start_date, true);
            return (
              <article
                key={item.id}
                className="relative grid gap-3 py-5 first:pt-0 sm:grid-cols-[90px_minmax(0,1fr)_auto] sm:items-center"
              >
                <span className="absolute -left-[1.55rem] top-7 size-2.5 rounded-full bg-secondary sm:-left-[2.3rem]" />
                <p className="font-[family-name:var(--font-display)] text-xl text-primary">
                  {date || "Date TBA"}
                </p>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {item.title}
                  </h3>
                  {item.location ? (
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5 text-secondary" />
                      {item.location}
                    </p>
                  ) : null}
                </div>
                {href ? (
                  <Link
                    href={href}
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary"
                  >
                    View details <ArrowRight className="size-3.5" />
                  </Link>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function VcGallerySection({
  albums,
  media,
}: {
  albums: VcPublicItem[];
  media: VcPublicMedia[];
}) {
  const images = media.length
    ? media
    : albums.flatMap((album) => (album.cover ? [album.cover] : []));
  if (!images.length) return null;
  const albumHref = albums[0] ? itemHref("gallery", albums[0]) : null;
  const slots = [
    "md:col-span-3 md:row-span-2",
    "md:col-span-4 md:row-span-2",
    "md:col-span-3",
    "md:col-span-2",
  ];

  return (
    <section id="vc-gallery" className="scroll-mt-24 bg-white py-14 sm:py-18">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-primary sm:text-5xl">
            Moments that matter
          </h2>
          {albumHref ? (
            <Link
              href={albumHref}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary"
            >
              Explore the gallery <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>
        <div className="mt-6 grid auto-rows-[150px] grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-10 md:auto-rows-[145px]">
          {images.slice(0, 4).map((image, index) => (
            <figure
              key={image.id}
              className={`relative overflow-hidden bg-surface-subtle ${slots[index] || "md:col-span-3"}`}
            >
              <PublicImage
                src={image.url}
                alt={
                  image.alt_text ||
                  image.caption ||
                  "Vice Chancellor gallery moment"
                }
                ratio="fill"
                className="absolute inset-0"
                sizes="(min-width: 1024px) 35vw, 100vw"
              />
              {image.caption ? (
                <figcaption className="absolute inset-x-0 bottom-0 bg-black/55 px-4 py-3 text-xs text-white">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EventTypeIcon() {
  return <CalendarDays className="size-5" aria-hidden />;
}
