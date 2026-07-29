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
          loading={priority ? undefined : "lazy"}
          className={cn("object-cover", imageClassName)}
          onError={() => {
            if (currentSrc !== fallbackSrc) {
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
          "transition duration-500 group-hover:scale-[1.03]",
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
