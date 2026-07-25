"use client";

import { useMemo, useState } from "react";
import { Play, ShieldCheck } from "lucide-react";
import { PublicImage } from "@/components/public/public-image";

function safeEmbedUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "www.youtube-nocookie.com"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function VcVideoPlayer({
  title,
  embedUrl,
  posterUrl,
  className = "",
}: {
  title: string;
  embedUrl?: string | null;
  posterUrl?: string | null;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const safeUrl = useMemo(() => safeEmbedUrl(embedUrl), [embedUrl]);

  if (!safeUrl) return null;

  return (
    <div className={`overflow-hidden rounded-[1.75rem] border border-white/15 bg-slate-950 shadow-2xl ${className}`}>
      <div className="relative aspect-video">
        {playing ? (
          <iframe
            src={safeUrl}
            title={title}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
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
              imageClassName="opacity-80 transition duration-300 group-hover:opacity-65"
            />
            <span className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(2,6,23,.7))]" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-20 items-center justify-center rounded-full bg-secondary text-white shadow-xl transition-colors duration-200 group-hover:bg-primary">
                <Play className="ml-1 size-8 fill-current" aria-hidden />
              </span>
            </span>
            <span className="absolute bottom-5 left-5 right-5 flex items-center gap-2 text-sm font-semibold text-white">
              <ShieldCheck className="size-4" aria-hidden />
              Click to load video from YouTube
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
