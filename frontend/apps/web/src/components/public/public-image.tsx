"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";

type PublicImageRatio = "hero" | "card" | "news" | "profile" | "logo" | "fill";

const ratioClasses: Record<PublicImageRatio, string> = {
  hero: "aspect-video min-h-[430px] sm:min-h-[480px] lg:min-h-[520px]",
  card: "aspect-[4/3]",
  news: "aspect-[16/10]",
  profile: "aspect-square",
  logo: "aspect-[3/1]",
  fill: "h-full w-full",
};

const defaultFallback = "/logos/ksu-bck5.jpg";

interface PublicImageProps {
  src?: string | null;
  alt: string;
  ratio?: PublicImageRatio;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  /**
   * Load immediately without `priority`'s preload hint. For images that are
   * below the fold but not reliably intersectable — a marquee translates its
   * items past the viewport edge, so lazy ones would never load and would
   * appear blank as they scroll into view.
   */
  eager?: boolean;
  unoptimized?: boolean;
  fallbackSrc?: string;
  fallbackContent?: ReactNode;
}

export function PublicImage({
  src,
  alt,
  ratio = "card",
  className,
  imageClassName,
  sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  priority = false,
  eager = false,
  unoptimized = false,
  fallbackSrc = defaultFallback,
  fallbackContent,
}: PublicImageProps) {
  const [currentSrc, setCurrentSrc] = useState(
    src || (fallbackContent ? null : fallbackSrc),
  );
  const [failed, setFailed] = useState(Boolean(!src && fallbackContent));
  const canRenderImage = currentSrc && !failed;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-accent text-primary",
        ratioClasses[ratio],
        className,
      )}
    >
      {canRenderImage ? (
        <Image
          src={currentSrc}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          // API media is served by the local gateway. Skipping Next's server
          // optimizer keeps Docker-internal rendering from trying to fetch a
          // host-only localhost URL; the browser can request it directly.
          unoptimized={
            unoptimized ||
            /^https?:\/\/(localhost|127\.0\.0\.1|gateway|main)(:\d+)?\//i.test(
              currentSrc,
            )
          }
          // `priority` sets its own loading mode, so it must be left alone;
          // otherwise "eager" has to be explicit, because next/image treats
          // an undefined `loading` as lazy.
          loading={priority ? undefined : eager ? "eager" : "lazy"}
          className={cn("object-cover", imageClassName)}
          onError={() => {
            // A caller that supplied `fallbackContent` has said what a missing
            // image should look like, so honour it on failure too — not only
            // when `src` was absent to begin with. Falling through to the
            // shared branded `fallbackSrc` here is what made all eight school
            // cards render the same poster when their covers 404'd: eight
            // distinct, correct URLs collapsing onto one image reads as a
            // content bug rather than as missing artwork.
            if (fallbackContent) {
              setFailed(true);
            } else if (currentSrc !== fallbackSrc) {
              setCurrentSrc(fallbackSrc);
            } else {
              setFailed(true);
            }
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#dbeafe,#fff7ed)]">
          {fallbackContent ?? <ImageIcon className="h-8 w-8" aria-hidden />}
        </div>
      )}
    </div>
  );
}

interface ProgressiveImageCardProps extends PublicImageProps {
  overlayClassName?: string;
  children: ReactNode;
}

export function ProgressiveImageCard({
  overlayClassName,
  children,
  className,
  imageClassName,
  ...imageProps
}: ProgressiveImageCardProps) {
  return (
    <div
      className={cn("group relative overflow-hidden bg-brand-overlay", className)}
    >
      <PublicImage
        {...imageProps}
        ratio="fill"
        className="absolute inset-0 h-full w-full"
        imageClassName={cn(
          "transition-transform duration-500 motion-safe:group-hover:scale-[1.03]",
          imageClassName,
        )}
      />
      <div
        className={cn(
          "absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.76))]",
          overlayClassName,
        )}
      />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
