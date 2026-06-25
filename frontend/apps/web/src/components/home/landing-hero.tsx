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

function isExternalHref(value?: string | null) {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function ctaTarget(slide: LandingHeroSlide) {
  const external = slide.primaryExternal || isExternalHref(slide.primaryHref);
  return external ? "_blank" : undefined;
}

function ctaRel(slide: LandingHeroSlide) {
  return ctaTarget(slide) ? "noopener noreferrer" : undefined;
}

export function LandingHero({
  slides: providedSlides,
  autoPlay = fallbackHeroSettings.autoPlay,
  autoPlayDurationMs = fallbackHeroSettings.autoPlayDurationMs,
  showNavigationDots = fallbackHeroSettings.showNavigationDots,
  showArrows = fallbackHeroSettings.showArrows,
  transitionEffect = fallbackHeroSettings.transitionEffect,
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
    autoPlay &&
    hasMultipleSlides &&
    !isPaused &&
    !prefersReducedMotion;
  const transitionMode = (transitionEffect ?? "fade").toLowerCase();
  const useSlideTransition = transitionMode.includes("slide");
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
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0 }
            }
            animate={
              prefersReducedMotion ? undefined : { opacity: 1 }
            }
            exit={
              prefersReducedMotion
                ? undefined
                : { opacity: 0 }
            }
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
              imageClassName="h-full w-full object-cover object-[45%_50%] opacity-90 lg:object-[58%_50%]"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,49,0.86)_0%,rgba(2,20,49,0.68)_34%,rgba(2,20,49,0.18)_78%,rgba(2,20,49,0.06)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,20,49,0.18)_0%,rgba(2,20,49,0.04)_48%,rgba(2,20,49,0.72)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-[520px] w-full items-end px-4 pb-16 pt-24 sm:min-h-[580px] sm:px-6 lg:min-h-[640px] lg:px-8 lg:pb-10 xl:px-10 2xl:px-12">
        <div className="grid w-full max-w-[1680px] gap-6 lg:grid-cols-[minmax(0,760px)_minmax(320px,1fr)] lg:items-end lg:gap-10">
          <AnimatePresence mode="wait">
            <HeroEditorialPanel
              key={activeSlide.id}
              slide={activeSlide}
              isPaused={isPaused}
              prefersReducedMotion={Boolean(prefersReducedMotion)}
              useSlideTransition={useSlideTransition}
            />
          </AnimatePresence>

          <div className="flex flex-col gap-4">
            <HeroPreviewRail
              slides={slides}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
            />
            {shouldShowArrows ? (
              <HeroArrowControls
                onPrevious={showPreviousSlide}
                onNext={showNextSlide}
              />
            ) : null}
          </div>
        </div>
      </div>

      {shouldShowControls ? (
        <div
          className="absolute inset-x-0 bottom-4 z-20 flex justify-center lg:hidden"
          aria-label="Hero slides"
        >
          <div className="flex items-center gap-2 rounded-full bg-slate-950/25 px-3 py-2 backdrop-blur-sm">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className="group flex h-5 w-5 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                aria-label={`Show slide ${index + 1}: ${slide.title}`}
                aria-current={index === activeIndex ? "true" : undefined}
              >
                <span
                  className={
                    index === activeIndex
                      ? "h-2.5 w-2.5 rounded-full bg-secondary ring-2 ring-white/80"
                      : "h-2.5 w-2.5 rounded-full bg-white/60 transition group-hover:bg-white"
                  }
                />
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function HeroEditorialPanel({
  slide,
  isPaused,
  prefersReducedMotion,
  useSlideTransition,
}: {
  slide: LandingHeroSlide;
  isPaused: boolean;
  prefersReducedMotion: boolean;
  useSlideTransition: boolean;
}) {
  const hasPrimaryCta = Boolean(slide.primaryHref && slide.primaryLabel);

  return (
    <motion.div
      aria-live={isPaused ? "polite" : "off"}
      className="max-w-[760px] rounded-md border border-white/15 bg-slate-950/42 p-5 text-white shadow-2xl shadow-slate-950/20 backdrop-blur-md sm:p-7 lg:bg-slate-950/32 lg:p-8"
      initial={
        prefersReducedMotion
          ? false
          : {
              opacity: 0,
              y: useSlideTransition ? 0 : 12,
              x: useSlideTransition ? 18 : 0,
            }
      }
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, x: 0 }}
      exit={
        prefersReducedMotion
          ? undefined
          : {
              opacity: 0,
              y: useSlideTransition ? 0 : -8,
              x: useSlideTransition ? -12 : 0,
            }
      }
      transition={{
        duration: prefersReducedMotion ? 0 : 0.35,
        ease: "easeOut",
      }}
    >
      <p className="mb-4 inline-flex w-fit items-center rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">
        {slide.eyebrow}
      </p>
      <h1 className="max-w-[720px] text-balance font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-white min-[360px]:text-5xl sm:text-6xl lg:text-[64px]">
        {slide.title}
      </h1>
      <p className="mt-5 line-clamp-4 max-w-2xl text-base font-medium leading-7 text-white/90 sm:text-lg">
        {slide.body}
      </p>

      {hasPrimaryCta ? (
        <Link
          href={slide.primaryHref}
          target={ctaTarget(slide)}
          rel={ctaRel(slide)}
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        >
          {slide.primaryLabel || "Read more"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      ) : null}
    </motion.div>
  );
}

function HeroPreviewRail({
  slides,
  activeIndex,
  onSelect,
}: {
  slides: LandingHeroSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  if (slides.length <= 1) return null;

  return (
    <div className="rounded-md border border-white/15 bg-slate-950/35 p-2 text-white shadow-2xl shadow-slate-950/20 backdrop-blur-md lg:p-3">
      <div className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:grid-cols-1 lg:overflow-visible lg:pb-0">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          const imageUrl = slide.mobileImageUrl || slide.desktopImageUrl || slide.imageUrl;

          return (
            <button
              key={slide.id}
              type="button"
              aria-current={isActive}
              aria-label={`Show slide ${index + 1}: ${slide.title}`}
              onClick={() => onSelect(index)}
              className="group grid min-w-[245px] grid-cols-[76px_minmax(0,1fr)] overflow-hidden rounded-md border border-white/12 bg-white/8 text-left transition hover:bg-white/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white lg:min-w-0"
            >
              <span
                className="block h-full min-h-[86px] bg-cover bg-center"
                style={{ backgroundImage: `url("${imageUrl}")` }}
                aria-hidden
              />
              <span className="flex min-h-[86px] flex-col justify-between p-3">
                <span>
                  <span className="block truncate text-[0.68rem] font-bold uppercase tracking-[0.16em] text-secondary">
                    {slide.eyebrow}
                  </span>
                  <span className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-white">
                    {slide.title}
                  </span>
                </span>
                <span className="mt-2 h-1 overflow-hidden rounded-full bg-white/18">
                  <span
                    className={
                      isActive
                        ? "block h-full w-full bg-secondary"
                        : "block h-full w-0 bg-secondary transition-all group-hover:w-1/3"
                    }
                  />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HeroArrowControls({
  onPrevious,
  onNext,
}: {
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="hidden items-center justify-end gap-2 lg:flex">
      <button
        type="button"
        onClick={onPrevious}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/35 text-white ring-1 ring-white/30 backdrop-blur-sm transition hover:bg-slate-950/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        aria-label="Show previous hero slide"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={onNext}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/35 text-white ring-1 ring-white/30 backdrop-blur-sm transition hover:bg-slate-950/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
        aria-label="Show next hero slide"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
