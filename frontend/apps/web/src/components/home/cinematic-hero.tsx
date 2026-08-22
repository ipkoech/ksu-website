"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";
import { revealVariants } from "@/components/home/motion-primitives";
import { useReducedMotionPref } from "@/components/home/reveal";

export interface CinematicHeroProps {
  /** CMS video, when an editor has attached one to the `video` media role. */
  videoSrc?: string | null;
  /** Poster / hero image. Rendered immediately — this is the LCP asset. */
  posterSrc: string;
  /** Narrower crop for small screens (`mobileImage` media role). */
  mobilePosterSrc?: string | null;
  posterAlt?: string;
  /** The institutional identity line above the headline. */
  identity: string;
  /** Heading lines; the last renders in italic. */
  headlineLines: string[];
  subtitle: string;
  primaryCta: { label: string; href: string; external?: boolean };
  secondaryCta: { label: string; href: string; external?: boolean };
}

/**
 * The video hero.
 *
 * The poster renders as a plain priority image so it can be the LCP asset:
 * the video is only requested once the page has loaded and the browser is
 * idle, and never at all under reduced motion or Save-Data. Height is capped
 * on small screens so the hero does not eat a whole mobile viewport.
 */
export function CinematicHero({
  videoSrc,
  posterSrc,
  mobilePosterSrc,
  posterAlt = "Kisii University campus",
  identity,
  headlineLines,
  subtitle,
  primaryCta,
  secondaryCta,
}: CinematicHeroProps) {
  const prefersReducedMotion = useReducedMotionPref();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [videoLive, setVideoLive] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(true);

  useEffect(() => {
    if (!videoSrc || prefersReducedMotion) return;
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (connection?.saveData) return;

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const arm = () => {
      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(() => setVideoReady(true), {
          timeout: 4000,
        });
      } else {
        timeoutId = window.setTimeout(() => setVideoReady(true), 1200);
      }
    };
    if (document.readyState === "complete") {
      arm();
    } else {
      window.addEventListener("load", arm, { once: true });
    }
    return () => {
      window.removeEventListener("load", arm);
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [prefersReducedMotion, videoSrc]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setVideoPlaying(true);
    } else {
      video.pause();
      setVideoPlaying(false);
    }
  }, []);

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative isolate overflow-hidden bg-brand-overlay"
    >
      {/* Background media. The mobile crop, when the CMS supplies one, is a
          second <picture> source rather than a second <Image>, so only one
          of the two is ever fetched. */}
      <div
        className={cn(
          "absolute inset-0",
          videoLive && "cursor-pointer",
        )}
        onClick={videoLive ? togglePlayPause : undefined}
      >
        {mobilePosterSrc ? (
          <picture>
            <source media="(max-width: 639px)" srcSet={mobilePosterSrc} />
            <source srcSet={posterSrc} />
            <img
              src={posterSrc}
              alt={posterAlt}
              fetchPriority="high"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>
        ) : (
          <Image
            src={posterSrc}
            alt={posterAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        )}

        {videoReady && videoSrc ? (
          <video
            ref={videoRef}
            poster={posterSrc}
            autoPlay
            muted
            loop
            playsInline
            onPlaying={() => setVideoLive(true)}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
              videoLive ? "opacity-100" : "opacity-0",
            )}
            aria-hidden="true"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : null}

        {/* The footage carries this section, so it is left almost untouched:
            no full-frame wash. Legibility is bought locally instead, with a
            soft pool of ink behind the copy column that has faded out by the
            time it reaches the middle of the frame, plus a short gradient at
            the base for the statistics band that overlaps there. */}
        {/* Desktop: a pool of ink anchored to the copy column, clear of the
            frame by 62% so most of the footage is untouched. */}
        <div
          className="absolute inset-y-0 left-0 hidden w-[72%] bg-[radial-gradient(82%_95%_at_-10%_55%,hsl(var(--brand-overlay)/0.95)_0%,hsl(var(--brand-overlay)/0.84)_26%,hsl(var(--brand-overlay)/0.44)_44%,transparent_58%)] md:block"
          aria-hidden
        />
        {/* Phones: the copy runs the full width, so a left-anchored pool
            cannot ground it. A vertical wash does, and still reads as video
            rather than as a tinted still. */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--brand-overlay)/0.74)_0%,hsl(var(--brand-overlay)/0.56)_45%,hsl(var(--brand-overlay)/0.34)_78%,hsl(var(--brand-overlay)/0.2)_100%)] md:hidden"
          aria-hidden
        />
        <div
          className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,hsl(var(--brand-overlay)/0.75)_0%,transparent_100%)]"
          aria-hidden
        />
      </div>

      {/* Copy. The bottom padding clears the statistics band that overlaps
          this section's lower edge on desktop. */}
      {/* Desktop is the phone/tablet scale plus a further 20%. */}
      <div className="ksu-shell relative z-10 flex min-h-[clamp(28.8rem,70svh,36rem)] flex-col justify-center py-14 sm:min-h-[clamp(31.2rem,72svh,38.4rem)] lg:min-h-[clamp(37.4rem,74svh,49rem)] lg:pb-32">
        {/* Above the fold, so this plays on load rather than on scroll. */}
        <motion.div
          className="max-w-[38rem]"
          initial={prefersReducedMotion ? false : "hidden"}
          animate="shown"
          variants={{
            hidden: {},
            shown: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
          }}
        >
          {/* The institution's name carries the hero; the promise follows in
              gold beneath it, one size down. Both sit inside the single page
              h1 so the heading reads as one statement. */}
          <motion.h1
            variants={revealVariants}
            id="hero-heading"
            className="font-normal text-white [text-shadow:0_2px_12px_hsl(var(--brand-overlay)/0.7),0_1px_3px_hsl(var(--brand-overlay)/0.5)]"
          >
            <span className="block text-[clamp(2.625rem,1.2rem+3.6vw,4rem)] leading-[1.06] tracking-[-0.015em]">
              {identity}
            </span>
            {headlineLines.map((line) => (
              <span
                key={line}
                /* The brand gold is a deep orange built for white grounds; at
                   that value it sits on top of moving footage at barely 2:1.
                   Lifting it toward white keeps the hue and clears AA for
                   large text, and matches the amber in the approved design. */
                className="mt-1 block text-[clamp(1.25rem,0.85rem+1.7vw,2rem)] leading-[1.2] text-[hsl(var(--gold))]"
              >
                {line}
              </span>
            ))}
          </motion.h1>
          <motion.p
            variants={revealVariants}
            className="mt-5 max-w-[34rem] text-[clamp(1rem,0.94rem+0.3vw,1.125rem)] leading-[1.6] text-white/90 [text-shadow:0_1px_6px_hsl(var(--brand-overlay)/0.85),0_2px_18px_hsl(var(--brand-overlay)/0.6)]"
          >
            {subtitle}
          </motion.p>
          <motion.div
            variants={revealVariants}
            className="mt-7 flex flex-nowrap items-stretch gap-3 sm:gap-4"
          >
            <HeroCta {...primaryCta} variant="primary" />
            <HeroCta {...secondaryCta} variant="secondary" />
          </motion.div>
        </motion.div>
      </div>

      {/* Playback control. Icon-only at 44px, parked top-right: the previous
          labelled pill sat in the bottom-right, where it crowded the
          statistics band on phones and the floating action dock beside it.
          Clicking the footage itself does the same thing; this is the
          keyboard-reachable equivalent. */}
      {videoReady && videoLive ? (
        <button
          type="button"
          onClick={togglePlayPause}
          aria-label={videoPlaying ? "Pause background video" : "Play background video"}
          className={cn(
            "absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-brand-overlay/60 text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors duration-200 hover:bg-brand-overlay sm:right-6 sm:top-6",
            focusVisibleStyles.white,
          )}
        >
          {videoPlaying ? (
            <Pause className="h-4 w-4" aria-hidden />
          ) : (
            <Play className="ml-0.5 h-4 w-4" aria-hidden />
          )}
        </button>
      ) : null}

    </section>
  );
}

function HeroCta({
  label,
  href,
  external,
  variant,
}: {
  label: string;
  href: string;
  external?: boolean;
  variant: "primary" | "secondary";
}) {
  const className = cn(
    "inline-flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-lg px-3 py-3 text-[0.9375rem] font-medium transition-colors duration-200 sm:flex-none sm:px-7 sm:text-base",
    variant === "primary"
      ? "bg-secondary text-white hover:bg-secondary/90"
      : "bg-white/10 text-white ring-1 ring-white/45 backdrop-blur-sm hover:bg-white hover:text-brand-overlay",
    focusVisibleStyles.white,
  );

  const isExternal = external ?? /^https?:\/\//.test(href);

  return isExternal ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {label}
    </a>
  ) : (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export default CinematicHero;
