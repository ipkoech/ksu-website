"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { useReducedMotionPref } from "@/components/home/reveal";
import { Pause, Play } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";

interface CinematicHeroProps {
  videoSrc: string;
  posterSrc: string;
  /** Heading lines; the last line renders in the display italic. */
  headlineLines: string[];
  subtitle: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
}

/**
 * Full-viewport hero: campus video (poster-first, idle-deferred) under a
 * light grounding scrim, with bottom-anchored content revealed in three
 * quick fades — heading, subtitle, actions.
 */
export function CinematicHero({
  videoSrc,
  posterSrc,
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

  // Poster carries the LCP; the video downloads once the page has loaded
  // and the browser is idle. Skipped for reduced motion / Save-Data.
  useEffect(() => {
    if (prefersReducedMotion) return;
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
  }, [prefersReducedMotion]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setVideoPlaying(true);
    } else {
      video.pause();
      setVideoPlaying(false);
    }
  }, []);

  return (
    <section
      aria-label="Kisii University"
      className="relative -mb-[28px] h-[calc(100svh-120px)] min-h-[540px] overflow-hidden bg-primary xl:h-[calc(100svh-176px)]"
    >
      {/* Background media */}
      <div className="absolute inset-0">
        <Image
          src={posterSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {videoReady && (
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
        )}
        {/* Light grounding scrim: keeps the type legible on bright frames */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_top,hsl(var(--brand-overlay)/0.55)_0%,hsl(var(--brand-overlay)/0.18)_35%,transparent_60%)]"
          aria-hidden
        />
      </div>

      {/* Pause control for the autoplaying video */}
      {videoReady && videoLive && (
        <button
          type="button"
          onClick={togglePlayPause}
          className="absolute right-4 top-6 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 backdrop-blur-sm transition-colors duration-200 hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6"
          aria-label={videoPlaying ? "Pause background video" : "Play background video"}
        >
          {videoPlaying ? (
            <Pause className="h-5 w-5" aria-hidden />
          ) : (
            <Play className="ml-0.5 h-5 w-5" aria-hidden />
          )}
        </button>
      )}

      {/* Bottom-anchored content, held clear of the next section's overlap */}
      <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-24 md:px-12 lg:px-16 lg:pb-28">
        <div>
          <FadeIn
            delay={100}
            duration={500}
            reducedMotion={Boolean(prefersReducedMotion)}
          >
            <h1 className="mb-4 font-[family-name:var(--font-display)] text-4xl font-normal leading-[1.05] tracking-tight text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.35)] md:text-5xl lg:text-6xl xl:text-7xl">
              {headlineLines.map((line, index) =>
                index === headlineLines.length - 1 ? (
                  <em key={line} className="block italic">
                    {line}
                  </em>
                ) : (
                  <span key={line} className="block">
                    {line}
                  </span>
                ),
              )}
            </h1>
          </FadeIn>
          <FadeIn
            delay={280}
            duration={1000}
            reducedMotion={Boolean(prefersReducedMotion)}
          >
            <p className="mb-5 max-w-xl text-base text-white/85 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)] md:text-lg">
              {subtitle}
            </p>
          </FadeIn>
          <FadeIn
            delay={460}
            duration={1000}
            reducedMotion={Boolean(prefersReducedMotion)}
          >
            <div className="flex flex-wrap gap-4">
              <Link
                href={primaryCta.href}
                className="inline-flex min-h-11 items-center rounded-lg bg-white px-8 py-3 text-sm font-medium text-primary transition-[background-color,transform] duration-200 hover:bg-white/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {primaryCta.label}
              </Link>
              <Link
                href={secondaryCta.href}
                className="inline-flex min-h-11 items-center rounded-lg bg-white/10 px-8 py-3 text-sm font-medium text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors duration-200 hover:bg-white hover:text-brand-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                {secondaryCta.label}
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

/** Fade-in wrapper: opacity 0 → 1 after a configurable delay. */
function FadeIn({
  delay,
  duration,
  reducedMotion,
  className,
  children,
}: {
  delay: number;
  duration: number;
  reducedMotion: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(reducedMotion);
  useEffect(() => {
    if (reducedMotion) {
      setVisible(true);
      return;
    }
    const timeout = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timeout);
  }, [delay, reducedMotion]);

  return (
    <div
      className={cn("transition-opacity", visible ? "opacity-100" : "opacity-0", className)}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
}
