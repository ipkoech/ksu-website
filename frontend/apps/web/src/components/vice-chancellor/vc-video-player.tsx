"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { PublicImage } from "@/components/public/public-image";

/**
 * Anything at or beyond this runs long enough that a viewer will want to
 * scrub, so it keeps YouTube's own control bar. Shorter clips get the single
 * pause control instead.
 */
const LONG_FORM_SECONDS = 600;

/** Categories that are ceremonies by nature, used while durations are unset. */
const LONG_FORM_CATEGORIES = new Set(["graduation", "ceremony", "livestream"]);

/**
 * Decide which control set a video gets.
 *
 * `duration_seconds` is the real signal but is not populated on every record
 * yet, so the category acts as a stand-in until it is. Once durations are
 * filled in this resolves automatically with no code change.
 */
export function isLongForm(
  durationSeconds?: number | null,
  category?: string | null,
): boolean {
  if (typeof durationSeconds === "number" && durationSeconds > 0) {
    return durationSeconds >= LONG_FORM_SECONDS;
  }
  return LONG_FORM_CATEGORIES.has((category ?? "").trim().toLowerCase());
}

/**
 * Only ever a youtube-nocookie embed, over https.
 *
 * `controls` is the difference between the two modes: 0 removes YouTube's
 * whole bar (scrubber, volume, captions, fullscreen) so we can supply a single
 * pause button, and 1 hands all of that back for long recordings where losing
 * the scrubber would be punishing.
 */
function safeEmbedUrl(value: string | null | undefined, withControls: boolean) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "www.youtube-nocookie.com" ||
      !url.pathname.startsWith("/embed/")
    ) {
      return null;
    }
    url.searchParams.set("autoplay", "1");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("rel", "0");
    url.searchParams.set("modestbranding", "1");
    url.searchParams.set("controls", withControls ? "1" : "0");
    // Captions on by default: this is public-sector video.
    url.searchParams.set("cc_load_policy", "1");
    // `enablejsapi` lets the pause button talk to the player via postMessage.
    if (!withControls) url.searchParams.set("enablejsapi", "1");
    return url.toString();
  } catch {
    return null;
  }
}

export function VcVideoPlayer({
  title,
  embedUrl,
  posterUrl,
  className = "",
  compact = false,
  durationSeconds,
  category,
}: {
  title: string;
  embedUrl?: string | null;
  posterUrl?: string | null;
  className?: string;
  compact?: boolean;
  durationSeconds?: number | null;
  category?: string | null;
}) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);

  const longForm = isLongForm(durationSeconds, category);
  const safeUrl = useMemo(
    () => safeEmbedUrl(embedUrl, longForm),
    [embedUrl, longForm],
  );

  /**
   * Drive play/pause through the IFrame API's postMessage interface rather
   * than loading YouTube's player script: one command, no third-party
   * JavaScript, and nothing to clean up if the frame goes away.
   */
  const toggle = useCallback(() => {
    const frame = frameRef.current;
    if (!frame?.contentWindow) return;
    const next = !paused;
    frame.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func: next ? "pauseVideo" : "playVideo",
        args: [],
      }),
      "https://www.youtube-nocookie.com",
    );
    setPaused(next);
  }, [paused]);

  // Reset the control if the embed changes underneath us.
  useEffect(() => {
    setPlaying(false);
    setPaused(false);
  }, [safeUrl]);

  if (!safeUrl) return null;

  return (
    <div className={`relative overflow-hidden bg-black shadow-lg ${className}`}>
      <div className="relative aspect-video">
        {playing ? (
          <>
            <iframe
              ref={frameRef}
              src={safeUrl}
              title={title}
              className="absolute inset-0 h-full w-full"
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
            />
            {/* Short clips only: YouTube's bar is hidden, so this is the one
                control the viewer has. Long recordings keep the native bar
                and get no overlay at all. */}
            {longForm ? null : (
              <button
                type="button"
                onClick={toggle}
                aria-label={paused ? `Play ${title}` : `Pause ${title}`}
                className="absolute bottom-3 left-3 z-10 flex size-11 items-center justify-center rounded-full bg-black/60 text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors duration-200 hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {paused ? (
                  <Play className="ml-0.5 size-4 fill-current" aria-hidden />
                ) : (
                  <Pause className="size-4 fill-current" aria-hidden />
                )}
              </button>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            className="group absolute inset-0 w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-secondary"
            aria-label={`Play ${title}`}
          >
            <PublicImage
              src={posterUrl}
              alt=""
              ratio="fill"
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="absolute inset-0"
              imageClassName="opacity-95 transition-opacity duration-300 group-hover:opacity-85"
            />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,.46))]" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span
                className={`flex items-center justify-center rounded-full border border-white/80 bg-black/45 text-white shadow-xl transition-colors duration-200 group-hover:bg-secondary ${
                  compact ? "size-14" : "size-16 sm:size-20"
                }`}
              >
                <Play
                  className={`ml-1 fill-current ${compact ? "size-5" : "size-7 sm:size-8"}`}
                  aria-hidden
                />
              </span>
            </span>
            {/* The video plays here, not on YouTube, so the old
                "Play on YouTube" label was telling the reader the opposite of
                what happens. */}
            <span className="absolute bottom-4 left-4 right-4 text-xs font-semibold uppercase tracking-[0.12em] text-white sm:bottom-5 sm:left-5">
              Watch
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
