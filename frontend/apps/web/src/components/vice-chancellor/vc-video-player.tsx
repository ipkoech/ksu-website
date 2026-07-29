"use client";

import { useMemo, useState } from "react";
import { Play } from "lucide-react";
import { PublicImage } from "@/components/public/public-image";

function safeEmbedUrl(value?: string | null) {
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
}: {
  title: string;
  embedUrl?: string | null;
  posterUrl?: string | null;
  className?: string;
  compact?: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const safeUrl = useMemo(() => safeEmbedUrl(embedUrl), [embedUrl]);

  if (!safeUrl) return null;

  return (
    <div className={`overflow-hidden bg-black shadow-lg ${className}`}>
      <div className="relative aspect-video">
        {playing ? (
          <iframe
            src={safeUrl}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          />
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
              imageClassName="opacity-95 transition duration-300 group-hover:opacity-85"
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
            <span className="absolute bottom-4 left-4 right-4 text-xs font-semibold uppercase tracking-[0.12em] text-white sm:bottom-5 sm:left-5">
              Play on YouTube
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
