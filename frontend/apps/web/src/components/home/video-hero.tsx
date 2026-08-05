"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight, Play, Pause } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import {
  TextReveal,
  SkipAnimationLink,
  focusVisibleStyles,
} from "@ksu/ui/motion";

export interface VideoHeroSlide {
  id: string;
  videoSrc?: string;
  posterSrc: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  tertiaryCta?: { label: string; href: string };
}

export interface VideoHeroProps {
  slides: VideoHeroSlide[];
  autoPlayInterval?: number;
  className?: string;
}

const slideVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const contentVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function VideoHero({
  slides,
  autoPlayInterval = 8000,
  className,
}: VideoHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [videoReady, setVideoReady] = useState(false);
  const [isVideoLive, setIsVideoLive] = useState(false);

  const activeSlide = slides[activeIndex] ?? slides[0];
  const hasVideo = Boolean(activeSlide?.videoSrc);
  const hasMultipleSlides = slides.length > 1;
  const showVideo = hasVideo && !prefersReducedMotion && videoReady;

  // Scroll-linked exit: the copy settles back and fades as the visitor
  // scrolls on, so the hero hands over to the page instead of cutting off.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.7], [0, 48]);
  const mediaScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  }, []);

  // Defer video download until the page has loaded and the browser is idle;
  // the poster carries the LCP. Skipped for reduced motion and Save-Data.
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

  useEffect(() => {
    setIsVideoLive(false);
  }, [activeSlide?.id]);

  useEffect(() => {
    if (!hasMultipleSlides || isPaused || prefersReducedMotion) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % slides.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [hasMultipleSlides, isPaused, autoPlayInterval, slides.length, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion && videoRef.current) {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  }, [prefersReducedMotion]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative h-[72svh] min-h-[520px] max-h-[840px] overflow-hidden bg-primary",
        className
      )}
      aria-roledescription="carousel"
      aria-label="University showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <SkipAnimationLink targetId="main-content">
        Skip to main content
      </SkipAnimationLink>

      {/* Background Media */}
      <motion.div
        className="absolute inset-0"
        style={prefersReducedMotion ? undefined : { scale: mediaScale }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            variants={prefersReducedMotion ? undefined : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={activeSlide.posterSrc}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            {showVideo && (
              <video
                ref={videoRef}
                poster={activeSlide.posterSrc}
                autoPlay
                muted
                loop
                playsInline
                onPlaying={() => setIsVideoLive(true)}
                className={cn(
                  "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
                  isVideoLive ? "opacity-100" : "opacity-0"
                )}
                aria-hidden="true"
              >
                <source src={activeSlide.videoSrc} type="video/mp4" />
              </video>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Overlays: bottom-anchored scrim keeps the upper video clear while
          grounding the typography; the angled wash lifts contrast behind
          the text column only. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(2,20,49,0.84)_0%,rgba(2,20,49,0.42)_30%,rgba(2,20,49,0.08)_58%,transparent_78%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(2,20,49,0.38)_0%,rgba(2,20,49,0.12)_40%,transparent_62%)]" />

      {/* Video Controls */}
      {showVideo && (
        <div className="absolute bottom-6 right-6 z-20 flex gap-2">
          <button
            onClick={togglePlayPause}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25",
              focusVisibleStyles.white
            )}
            aria-label={isVideoPlaying ? "Pause video" : "Play video"}
          >
            {isVideoPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full items-end">
        <div className="mx-auto w-full max-w-[1680px] px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24 xl:px-10 2xl:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              variants={prefersReducedMotion ? undefined : contentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              style={
                prefersReducedMotion
                  ? undefined
                  : { opacity: contentOpacity, y: contentY }
              }
              className="max-w-3xl text-white"
            >
              {activeSlide.eyebrow && (
                <p className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                  {activeSlide.eyebrow}
                </p>
              )}

              <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] [text-shadow:0_2px_4px_rgba(2,20,49,0.45),0_8px_28px_rgba(2,20,49,0.35)] sm:text-5xl lg:text-6xl">
                {prefersReducedMotion ? (
                  activeSlide.title
                ) : (
                  <TextReveal
                    text={activeSlide.title}
                    type="word"
                    staggerDelay={50}
                    className="text-white"
                  />
                )}
              </h1>

              {activeSlide.subtitle && (
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/90 [text-shadow:0_1px_3px_rgba(2,20,49,0.55)] sm:text-lg">
                  {activeSlide.subtitle}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-4">
                {activeSlide.primaryCta && (
                  <Link
                    href={activeSlide.primaryCta.href}
                    className={cn(
                      "inline-flex min-h-12 items-center gap-2 rounded-md bg-secondary px-6 text-sm font-semibold text-white shadow-lg shadow-secondary/30 transition hover:bg-secondary/90 active:scale-[0.97]",
                      focusVisibleStyles.white
                    )}
                  >
                    {activeSlide.primaryCta.label}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
                {activeSlide.secondaryCta && (
                  <Link
                    href={activeSlide.secondaryCta.href}
                    className={cn(
                      "inline-flex min-h-12 items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 active:scale-[0.97]",
                      focusVisibleStyles.white
                    )}
                  >
                    {activeSlide.secondaryCta.label}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
                {activeSlide.tertiaryCta && (
                  <Link
                    href={activeSlide.tertiaryCta.href}
                    className={cn(
                      "inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-white/90 transition hover:text-white",
                      focusVisibleStyles.white
                    )}
                  >
                    {activeSlide.tertiaryCta.label}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Slide Indicators */}
      {hasMultipleSlides && (
        <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setActiveIndex(index)}
              className={cn(
                "h-2 rounded-full transition-[width,background-color]",
                focusVisibleStyles.white,
                index === activeIndex
                  ? "w-8 bg-secondary"
                  : "w-2 bg-white/50 hover:bg-white/70"
              )}
              aria-label={`Go to slide ${index + 1}: ${slide.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default VideoHero;
