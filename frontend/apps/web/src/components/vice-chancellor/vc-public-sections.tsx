import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import type { VcPublicItem, VcPublicMedia } from "@ksu/api-client";
import { PublicImage } from "@/components/public/public-image";
import { AboutReveal } from "@/components/about/about-reveal";
import { VcGalleryLightbox } from "./vc-gallery-lightbox";

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

/**
 * One activity, as a ledger row.
 *
 * The supplied activity photographs are pre-branded social graphics: each
 * carries a KSU masthead across the top of the frame and a URL strip across
 * the foot. A full-bleed treatment therefore has to bury most of the image
 * under a scrim just to make a headline legible, which is why this section
 * demotes the photograph to a supporting frame. Cropped to a square and held
 * at this size, the baked-in furniture falls outside the visible area and the
 * picture does what it is actually good for — showing the room and the people
 * in it — while the headline carries the row.
 */
function ActivityRow({ item }: { item: VcPublicItem }) {
  const href = itemHref("activity", item);
  const place = item.editorial_label;

  const body = (
    <>
      <div className="min-w-0 flex-1">
        <h3 className="font-[family-name:var(--font-display)] text-2xl font-normal leading-[1.15] tracking-tight text-primary text-balance transition-colors duration-200 group-hover:text-secondary sm:text-[1.75rem]">
          {item.title}
        </h3>
        {item.summary ? (
          <p className="mt-3 line-clamp-2 text-base leading-7 text-muted-foreground">
            {item.summary}
          </p>
        ) : null}
        {href ? (
          <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary">
            Read the story
            <ArrowRight
              className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1 motion-reduce:transform-none"
              aria-hidden
            />
          </span>
        ) : null}
      </div>
      {/* The baked-in masthead and URL strip sit in the top and bottom eighths
          of these graphics. A 16/10 crop at full mobile width still shows both,
          so the frame scales the picture up and pans past them; from `sm` up
          the frame is narrow enough that the 4:3 crop clears them on its own. */}
      {item.cover?.url ? (
        <div className="order-first w-full overflow-hidden bg-surface-subtle ring-1 ring-primary/10 sm:order-last">
          <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[4/3]">
            <PublicImage
              src={item.cover.url}
              alt={item.cover.alt_text || item.title}
              ratio="fill"
              className="absolute inset-0 scale-[1.28] sm:scale-100"
              imageClassName="object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.05] motion-reduce:transform-none"
              sizes="(min-width: 1024px) 13rem, (min-width: 640px) 10rem, 100vw"
            />
          </div>
        </div>
      ) : null}
    </>
  );

  const inner = (
    <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-start sm:gap-8 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-10">
      {body}
    </div>
  );

  return (
    <article className="group border-b border-primary/15 py-7 last:border-b-0 sm:py-8">
      {place ? (
        <p className="mb-4 flex items-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-secondary">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {place}
        </p>
      ) : null}
      {href ? (
        <Link
          href={href}
          className="block rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-4"
        >
          {inner}
        </Link>
      ) : (
        inner
      )}
    </article>
  );
}

export function VcActivitiesSection({ items }: { items: VcPublicItem[] }) {
  if (!items.length) return null;

  // Place is the only structured field these records carry — no dates, no
  // categories — and it is also the most telling one: the reach runs from the
  // home campus out to the county and across the border. The list is ordered
  // as the studio ordered it; the places are surfaced as a standfirst so the
  // pattern is legible before the reader starts down the rows.
  const places = Array.from(
    new Set(
      items
        .map((item) => item.editorial_label?.trim())
        .filter((label): label is string => Boolean(label)),
    ),
  );
  // Several of these labels carry their own comma ("Arusha, Tanzania"), so a
  // comma-joined list would read as more places than there are. A middot keeps
  // each one whole.
  const placeLine = places.join(" \u00b7 ");

  return (
    <section
      id="vc-activities"
      className="scroll-mt-24 bg-white py-14 sm:py-20"
    >
      <div className="container">
        <AboutReveal>
          <div className="max-w-3xl">
            <h2 className="font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
              Leadership in <em className="italic">action</em>
            </h2>
            {places.length > 1 ? (
              <p className="mt-5 max-w-[58ch] text-base leading-8 text-muted-foreground">
                Where the office has been lately &mdash;{" "}
                <span className="text-foreground">{placeLine}</span>.
              </p>
            ) : null}
          </div>
        </AboutReveal>

        <div className="mt-10 max-w-5xl border-t border-primary/15 sm:mt-12">
          {items.slice(0, 6).map((item, index) => (
            <AboutReveal key={item.id} delay={Math.min(index, 3) * 90}>
              <ActivityRow item={item} />
            </AboutReveal>
          ))}
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

  return (
    <section id="vc-gallery" className="scroll-mt-24 bg-white py-14 sm:py-18">
      <div className="container">
        <AboutReveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-4xl font-normal tracking-tight text-primary sm:text-5xl">
                Moments that <em className="italic">matter</em>
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                {images.length} photographs from the office. Select any one to
                view it larger.
              </p>
            </div>
            {albumHref ? (
              <Link
                href={albumHref}
                className="inline-flex min-h-11 items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-primary hover:underline"
              >
                Explore the gallery{" "}
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            ) : null}
          </div>
        </AboutReveal>
        <AboutReveal className="mt-8">
          <VcGalleryLightbox images={images} />
        </AboutReveal>
      </div>
    </section>
  );
}

export function EventTypeIcon() {
  return <CalendarDays className="size-5" aria-hidden />;
}
