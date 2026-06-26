"use client";

import { type FocusEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { ArtDirectedImage } from "@/components/public/art-directed-image";
import type { LandingHeroData, LandingHeroSlide } from "@/lib/landing-data";

const fallbackSlide: LandingHeroSlide = {
  id: "fallback-landing-hero",
  eyebrow: "Kisii University",
  title: "Kisii University",
  body: "Nurturing minds. Advancing research. Serving community. Transforming lives.",
  imageUrl: "/logos/ksu-bck5.jpg",
  desktopImageUrl: "/logos/ksu-bck5.jpg",
  mobileImageUrl: "/logos/ksu-bck5.jpg",
  imageAlt: "Kisii University",
  primaryLabel: "Apply Now",
  primaryHref: "/admissions/how-to-apply",
};

const fallbackHeroSettings: Omit<LandingHeroData, "slides"> = {
  autoPlay: true,
  autoPlayDurationMs: 7000,
  showNavigationDots: true,
  showArrows: true,
  transitionEffect: "fade",
};

interface LandingHeroProps extends Partial<Omit<LandingHeroData, "slides">> {
  slides: LandingHeroSlide[];
}

export function LandingHero({
  slides: providedSlides,
  autoPlay = fallbackHeroSettings.autoPlay,
  autoPlayDurationMs = fallbackHeroSettings.autoPlayDurationMs,
  showNavigationDots = fallbackHeroSettings.showNavigationDots,
  showArrows = fallbackHeroSettings.showArrows,
}: LandingHeroProps) {
  const slides = useMemo(
    () => (providedSlides.length ? providedSlides : [fallbackSlide]),
    [providedSlides],
  );
  const prefersReducedMotion = useReducedMotion();
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex] ?? fallbackSlide;
  const hasMultipleSlides = slides.length > 1;
  const shouldAutoPlay =
    autoPlay && hasMultipleSlides && !isPaused && !prefersReducedMotion;
  const shouldShowControls = hasMultipleSlides && showNavigationDots;
  const shouldShowArrows = hasMultipleSlides && showArrows;

  const showPreviousSlide = () => {
    setActiveIndex((index) => (index - 1 + slides.length) % slides.length);
  };

  const showNextSlide = () => {
    setActiveIndex((index) => (index + 1) % slides.length);
  };

  useEffect(() => {
    if (!shouldAutoPlay) return;
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slides.length);
    }, autoPlayDurationMs);
    return () => window.clearInterval(interval);
  }, [autoPlayDurationMs, shouldAutoPlay, slides.length]);

  useEffect(() => {
    if (activeIndex >= slides.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget;
    if (
      !(nextTarget instanceof Node) ||
      !event.currentTarget.contains(nextTarget)
    ) {
      setIsPaused(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-primary"
      style={{ minHeight: "50vh", maxHeight: "60vh" }}
      aria-roledescription="carousel"
      aria-label="Featured Kisii University updates"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={handleBlur}
    >
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            className="absolute inset-0 h-full w-full"
            initial={prefersReducedMotion ? false : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.7,
              ease: "easeOut",
            }}
          >
            <ArtDirectedImage
              desktopSrc={activeSlide.desktopImageUrl ?? activeSlide.imageUrl}
              mobileSrc={activeSlide.mobileImageUrl}
              alt={activeSlide.imageAlt}
              priority={activeIndex === 0}
              imageClassName="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,49,0.72)_0%,rgba(2,20,49,0.28)_55%,rgba(2,20,49,0.04)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
      </div>

      {shouldShowArrows ? (
        <>
          <button
            type="button"
            onClick={showPreviousSlide}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 hidden h-12 w-12 items-center justify-center rounded-full bg-slate-950/30 text-white ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-slate-950/50 md:flex"
            aria-label="Show previous hero slide"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={showNextSlide}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 hidden h-12 w-12 items-center justify-center rounded-full bg-slate-950/30 text-white ring-1 ring-white/15 backdrop-blur-sm transition hover:bg-slate-950/50 md:flex"
            aria-label="Show next hero slide"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </>
      ) : null}

      <div className="relative z-10 flex h-full w-full items-end px-4 pb-12 sm:px-6 sm:pb-14 lg:px-8 lg:pb-16 xl:px-10 2xl:px-12">
        <AnimatePresence mode="wait">
          <HeroEditorialPanel
            key={activeSlide.id}
            slide={activeSlide}
            isPaused={isPaused}
            prefersReducedMotion={Boolean(prefersReducedMotion)}
          />
        </AnimatePresence>
      </div>

      {shouldShowControls ? (
        <div
          className="absolute inset-x-0 bottom-3 z-20 flex justify-center gap-2"
          aria-label="Hero slides"
        >
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group flex h-5 w-5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 focus-visible:ring-offset-primary"
              aria-label={`Show slide ${index + 1}: ${slide.title}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              <span
                className={
                  index === activeIndex
                    ? "h-2 w-2 rounded-full bg-secondary"
                    : "h-2 w-2 rounded-full bg-white/50 transition group-hover:bg-white/80"
                }
              />
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function HeroEditorialPanel({
  slide,
  isPaused,
  prefersReducedMotion,
}: {
  slide: LandingHeroSlide;
  isPaused: boolean;
  prefersReducedMotion: boolean;
}) {
  const hasPrimaryCta = Boolean(slide.primaryHref && slide.primaryLabel);
  const hasSecondaryCta = Boolean(slide.secondaryHref && slide.secondaryLabel);

  return (
    <motion.div
      aria-live={isPaused ? "polite" : "off"}
      className="max-w-[720px] text-white"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -12 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" }}
    >
      <p className="mb-3 inline-flex w-fit items-center rounded-full border border-white/25 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm sm:text-xs">
        {slide.eyebrow}
      </p>
      <h1 className="max-w-[720px] text-balance font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.15] text-white sm:text-4xl lg:text-5xl">
        {slide.title}
      </h1>
      <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-7 text-white/85 sm:text-base sm:leading-8">
        {slide.body}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {hasPrimaryCta ? (
          <Link
            href={slide.primaryHref}
            target={slide.primaryExternal ? "_blank" : undefined}
            rel={slide.primaryExternal ? "noopener noreferrer" : undefined}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            {slide.primaryLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
        {hasSecondaryCta ? (
          <Link
            href={slide.secondaryHref!}
            target={slide.secondaryExternal ? "_blank" : undefined}
            rel={slide.secondaryExternal ? "noopener noreferrer" : undefined}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
          >
            {slide.secondaryLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}
