"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Play, Pause, Volume2, VolumeX } from "lucide-react";
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
    transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as const },
  },
};

export function VideoHero({
  slides,
  autoPlayInterval = 8000,
  className,
}: VideoHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(!prefersReducedMotion);

  const activeSlide = slides[activeIndex] ?? slides[0];
  const hasVideo = Boolean(activeSlide?.videoSrc);
  const hasMultipleSlides = slides.length > 1;

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

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

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
      className={cn(
        "relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden bg-primary",
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
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            variants={prefersReducedMotion ? undefined : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0"
          >
            {hasVideo && !prefersReducedMotion ? (
              <video
                ref={videoRef}
                src={activeSlide.videoSrc}
                poster={activeSlide.posterSrc}
                autoPlay
                muted
                loop
                playsInline
                className="h-full w-full object-cover"
                aria-hidden="true"
              />
            ) : (
              <img
                src={activeSlide.posterSrc}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Overlays for text clarity */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
      </div>

      {/* Video Controls */}
      {hasVideo && !prefersReducedMotion && (
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
          <button
            onClick={toggleMute}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25",
              focusVisibleStyles.white
            )}
            aria-label={isMuted ? "Unmute video" : "Mute video"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex h-full items-end">
        <div className="mx-auto w-full max-w-[1680px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20 xl:px-10 2xl:px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              variants={prefersReducedMotion ? undefined : contentVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="max-w-3xl text-white"
            >
              {activeSlide.eyebrow && (
                <p className="mb-4 inline-flex items-center rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
                  {activeSlide.eyebrow}
                </p>
              )}

              <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl">
                {prefersReducedMotion ? (
                  activeSlide.title
                ) : (
                  <TextReveal
                    text={activeSlide.title}
                    type="word"
                    staggerDelay={50}
                    className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                  />
                )}
              </h1>

              {activeSlide.subtitle && (
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                  {activeSlide.subtitle}
                </p>
              )}

              <div className="mt-8 flex flex-wrap gap-4">
                {activeSlide.primaryCta && (
                  <Link
                    href={activeSlide.primaryCta.href}
                    className={cn(
                      "inline-flex min-h-12 items-center gap-2 rounded-md bg-secondary px-6 text-sm font-semibold text-white shadow-lg shadow-secondary/30 transition hover:bg-secondary/90",
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
                      "inline-flex min-h-12 items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20",
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
                "h-2 rounded-full transition-all",
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
