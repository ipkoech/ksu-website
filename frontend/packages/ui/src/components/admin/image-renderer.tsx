import { ImageIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "../../lib";

export type RenderableImage =
  | string
  | {
      url?: string | null;
      public_url?: string | null;
      cdn_url?: string | null;
      thumbnail_url?: string | null;
      alt_text?: string | null;
      alt?: string | null;
      title?: string | null;
      caption?: string | null;
      width?: number | null;
      height?: number | null;
    };

export interface ImageRendererProps {
  image?: RenderableImage | null;
  src?: string | null;
  alt?: string;
  caption?: string | null;
  aspectRatio?: number;
  className?: string;
  imageClassName?: string;
  emptyFallback?: React.ReactNode;
}

function imageSource(image?: RenderableImage | null, src?: string | null) {
  if (src) return src;
  if (!image) return "";
  if (typeof image === "string") return image;
  return image.cdn_url || image.public_url || image.url || image.thumbnail_url || "";
}

function imageAlt(image?: RenderableImage | null, alt?: string) {
  if (alt) return alt;
  if (!image || typeof image === "string") return "";
  return image.alt_text || image.alt || image.title || "";
}

export function ImageRenderer({
  image,
  src,
  alt,
  caption,
  aspectRatio,
  className,
  imageClassName,
  emptyFallback,
}: ImageRendererProps) {
  const resolvedSrc = imageSource(image, src);
  const resolvedAlt = imageAlt(image, alt);
  const resolvedCaption = caption ?? (typeof image === "object" && image ? image.caption : null);

  if (!resolvedSrc) {
    return emptyFallback ? (
      <>{emptyFallback}</>
    ) : (
      <div className={cn("flex min-h-32 items-center justify-center rounded-lg border bg-muted text-muted-foreground", className)}>
        <ImageIcon className="h-6 w-6" />
      </div>
    );
  }

  return (
    <figure className={cn("overflow-hidden rounded-lg border bg-background", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedSrc}
        alt={resolvedAlt}
        className={cn("w-full object-cover", imageClassName)}
        style={aspectRatio ? { aspectRatio } : undefined}
        loading="lazy"
      />
      {resolvedCaption ? (
        <figcaption className="border-t bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          {resolvedCaption}
        </figcaption>
      ) : null}
    </figure>
  );
}
