"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Play } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@ksu/ui/lib/utils";

/**
 * The campus-life header band.
 *
 * This is `CampusPageHeader`'s anatomy with one substitution: the fixed
 * landmark photograph becomes the student film's poster frame, and the band
 * carries a play control. Everything else — the breadcrumb chip, the orange
 * eyebrow pill, the italic serif title, the foot scrim, the kicker rule and the
 * credit line — is reproduced exactly, because the point of the substitution is
 * that the page still reads as the same publication.
 *
 * It is a separate component rather than a prop on the shared one because the
 * shared header renders its `<Image>` internally and seventeen other pages
 * depend on that; widening its contract for one page would be the more invasive
 * change. See DESIGN.md §3 for the anatomy this mirrors.
 *
 * The film loads on click, not on view: the poster is a static image until
 * someone asks for the video, so the band costs one image on first paint.
 */

const POSTER = (id: string) => `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;

export function CampusLifeHeader({
  videoId,
  videoTitle,
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  mobileActions,
  credit,
}: {
  videoId: string;
  videoTitle: string;
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  /** Replaces the landmark credit. Names what is on screen. */
  credit?: string;
  /**
   * Actions for the light mobile band.
   *
   * `actions` is styled for the dark photographic band, where secondary
   * controls are white-on-translucent. Reusing it above would put white type on
   * the light ground, so callers pass a light-ground variant here.
   */
  mobileActions?: ReactNode;
}) {
  const [playing, setPlaying] = useState(false);

  return (
    <>
      {/* Below `md` the band drops the footage and renders copy on a light
          ground, exactly as the shared header drops its photograph: a band this
          short cannot hold legible type over moving pictures. */}
      <header className="border-b border-border bg-surface-subtle px-4 py-5 md:hidden">
        {breadcrumbs?.length ? (
          <nav
            aria-label="Breadcrumb"
            className="mb-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-muted-foreground"
          >
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
                  {item.href && !isLast ? (
                    <Link href={item.href} className="rounded-sm transition hover:text-primary">
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={isLast ? "text-foreground" : undefined}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast ? (
                    <ChevronRight aria-hidden className="h-3.5 w-3.5 text-muted-foreground/60" />
                  ) : null}
                </span>
              );
            })}
          </nav>
        ) : null}

        {eyebrow ? (
          <p className="flex items-center gap-3 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-secondary">
            <span aria-hidden className="h-[3px] w-6 shrink-0 rounded-full bg-secondary" />
            {eyebrow}
          </p>
        ) : null}

        <h1 className="mt-2 text-balance font-[family-name:var(--font-display)] text-2xl font-normal leading-[1.1] tracking-[-0.02em] text-foreground">
          {title}
        </h1>

        {description ? (
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-primary/10">
          <VideoSurface
            videoId={videoId}
            videoTitle={videoTitle}
            playing={playing}
            onPlay={() => setPlaying(true)}
            className="aspect-video w-full"
            sizes="100vw"
          />
        </div>

        {mobileActions ?? actions ? (
          <div className="mt-4 flex flex-wrap gap-3">{mobileActions ?? actions}</div>
        ) : null}
      </header>

      <header className="relative isolate hidden min-h-[520px] overflow-hidden bg-[#04162f] md:block lg:min-h-[600px]">
        <VideoSurface
          videoId={videoId}
          videoTitle={videoTitle}
          playing={playing}
          onPlay={() => setPlaying(true)}
          className="absolute inset-0 h-full w-full"
          sizes="100vw"
          fill
        />

        {/* Same two-part treatment as the shared header: a wash at the foot
            that carries the white type. This band needs a second, horizontal
            pass the photographic headers do not: the film's own burnt-in
            captions sit low-left, exactly where the headline and standfirst
            land, and only a left-weighted scrim separates our type from theirs. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-4/5 bg-[linear-gradient(180deg,transparent_0%,rgba(3,17,40,0.30)_45%,rgba(3,17,40,0.80)_100%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-3/5 bg-[linear-gradient(90deg,rgba(3,17,40,0.72)_0%,rgba(3,17,40,0.34)_55%,transparent_100%)]"
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-1 bg-[linear-gradient(90deg,hsl(var(--secondary))_0%,hsl(var(--secondary))_14%,rgba(255,255,255,0.22)_14%,rgba(255,255,255,0.16)_100%)]"
        />

        <div className="pointer-events-none relative z-10 mx-auto flex h-full min-h-[520px] w-full max-w-[1680px] flex-col justify-end px-4 pb-11 pt-16 sm:px-6 lg:min-h-[600px] lg:px-8 xl:px-10 2xl:px-12">
          {breadcrumbs?.length ? (
            <nav
              aria-label="Breadcrumb"
              className="pointer-events-auto mb-4 mr-auto flex max-w-full flex-wrap items-center gap-x-2 gap-y-1 rounded-md bg-[rgba(3,17,40,0.42)] px-2.5 py-1.5 text-xs font-semibold text-white backdrop-blur-[2px]"
            >
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
                    {item.href && !isLast ? (
                      <Link
                        href={item.href}
                        className="rounded-sm transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span
                        className={isLast ? "text-white" : undefined}
                        aria-current={isLast ? "page" : undefined}
                      >
                        {item.label}
                      </span>
                    )}
                    {!isLast ? (
                      <ChevronRight aria-hidden className="h-3.5 w-3.5 text-white/60" />
                    ) : null}
                  </span>
                );
              })}
            </nav>
          ) : null}

          {eyebrow ? (
            <p className="mr-auto inline-flex items-center rounded-full bg-secondary px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white shadow-[0_2px_10px_rgba(3,17,40,0.45)]">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="mt-3 max-w-4xl text-balance font-[family-name:var(--font-display)] text-4xl font-normal leading-[1.06] tracking-[-0.02em] text-white [text-shadow:0_2px_6px_rgba(3,17,40,0.85),0_6px_28px_rgba(3,17,40,0.75)] lg:text-[3.4rem]">
            {title}
          </h1>

          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white [text-shadow:0_1px_6px_rgba(3,17,40,0.95),0_3px_16px_rgba(3,17,40,0.8)] lg:text-base lg:leading-8">
              {description}
            </p>
          ) : null}

          {actions ? (
            <div className="pointer-events-auto mt-5 flex flex-wrap gap-3">{actions}</div>
          ) : null}
        </div>

        {!playing ? (
          <p className="pointer-events-none absolute bottom-4 right-4 z-10 flex max-w-[45%] items-center gap-2 text-right text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-white/80 [text-shadow:0_1px_6px_rgba(3,17,40,0.95)] sm:right-6 lg:right-8 xl:right-10 2xl:right-12">
            <span aria-hidden className="h-px w-5 shrink-0 bg-white/50" />
            {credit ?? "Student life on campus"}
          </p>
        ) : null}
      </header>
    </>
  );
}

/**
 * Poster frame with a play control, swapping to the player once asked.
 *
 * `youtube-nocookie` keeps the request out of the advertising profile, and
 * `autoplay=1` is only reached because someone pressed play.
 */
function VideoSurface({
  videoId,
  videoTitle,
  playing,
  onPlay,
  className,
  sizes,
  fill = false,
}: {
  videoId: string;
  videoTitle: string;
  playing: boolean;
  onPlay: () => void;
  className?: string;
  sizes: string;
  fill?: boolean;
}) {
  if (playing) {
    return (
      <div className={cn("bg-[#04162f]", className)}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={videoTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div className={cn("group/video relative", className)}>
      <Image
        src={POSTER(videoId)}
        alt=""
        fill={fill}
        width={fill ? undefined : 1280}
        height={fill ? undefined : 720}
        sizes={sizes}
        priority
        className={cn("object-cover", fill ? "" : "h-full w-full")}
        style={{ objectPosition: "50% 45%" }}
      />
      <button
        type="button"
        onClick={onPlay}
        aria-label={`Play video: ${videoTitle}`}
        className={cn(
          "absolute inset-0 z-10 flex justify-center focus:outline-none",
          // The copy occupies the lower-left of the band, so the control sits
          // in the upper portion on wide screens rather than centred, where it
          // would land in the middle of the headline.
          fill ? "items-start pt-[18%] md:justify-end md:pr-[12%]" : "items-center",
        )}
      >
        <span
          aria-hidden
          className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white/80 bg-white text-primary shadow-xl transition-[transform,background-color] duration-200 group-hover/video:scale-105 group-hover/video:bg-secondary group-focus-visible/video:ring-4 group-focus-visible/video:ring-white/70 motion-reduce:transition-none lg:h-20 lg:w-20"
        >
          <Play className="ml-1 h-6 w-6 fill-current lg:h-7 lg:w-7" />
        </span>
      </button>
    </div>
  );
}

export default CampusLifeHeader;
