"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";

export interface YouTubeFacadeProps {
  /** The bare video id, not a full URL. */
  id: string;
  title: string;
  className?: string;
  /** Sizes hint for the poster, which is a normal responsive image. */
  sizes?: string;
}

/**
 * A YouTube player that costs nothing until someone wants it.
 *
 * The embed itself pulls roughly a megabyte of script and sets cookies on
 * every page view, for a video most visitors never play. This renders the
 * poster frame and a play control instead, and only swaps in the iframe once
 * the reader asks for it. The nocookie host keeps the request out of the
 * advertising profile even then.
 */
export function YouTubeFacade({
  id,
  title,
  className,
  sizes = "(min-width: 1024px) 50vw, 100vw",
}: YouTubeFacadeProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className={cn("relative overflow-hidden bg-brand-overlay", className)}>
        <iframe
          // `autoplay=1` is safe here: it only runs because the reader
          // pressed play, so it is not an unsolicited autoplaying video.
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      className={cn(
        "group relative block overflow-hidden bg-brand-overlay text-left",
        focusVisibleStyles.primary,
        className,
      )}
    >
      <Image
        src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
        alt=""
        fill
        sizes={sizes}
        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.03]"
      />
      <span
        className="absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--brand-overlay)/0.85)_0%,hsl(var(--brand-overlay)/0.25)_45%,transparent_75%)]"
        aria-hidden
      />

      <span
        className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/40 backdrop-blur-sm transition-[transform,background-color] duration-300 group-hover:scale-105 group-hover:bg-secondary group-hover:ring-secondary lg:h-20 lg:w-20"
        aria-hidden
      >
        <Play className="ml-1 h-7 w-7 lg:h-8 lg:w-8" fill="currentColor" />
      </span>

      <span className="absolute inset-x-0 bottom-0 p-5 lg:p-6">
        <span className="ksu-l-card block font-normal text-white">{title}</span>
        <span className="ksu-l-small mt-1 block text-white/70">
          Watch the film
        </span>
      </span>
    </button>
  );
}

export default YouTubeFacade;
