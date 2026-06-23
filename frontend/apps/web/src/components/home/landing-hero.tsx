"use client";

import { type FocusEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@ksu/ui/components";
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
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/30 to-transparent" />
      </div>

      <div className="relative min-h-[430px] w-full px-4 sm:min-h-[480px] sm:px-6 lg:min-h-[520px] lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex min-h-[430px] max-w-[470px] flex-col justify-center py-10 sm:min-h-[480px] lg:min-h-[520px] lg:max-w-[760px] lg:py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              aria-live={isPaused ? "polite" : "off"}
              initial={
                prefersReducedMotion
                  ? false
                  : {
                      opacity: 0,
                      y: useSlideTransition ? 0 : 12,
                      x: useSlideTransition ? 18 : 0,
                    }
              }
              animate={
                prefersReducedMotion ? undefined : { opacity: 1, y: 0, x: 0 }
              }
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
                {activeSlide.eyebrow}
              </p>
              <h1 className="max-w-[520px] text-balance font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-white min-[360px]:text-5xl sm:text-6xl lg:max-w-[760px] lg:text-[66px]">
                {activeSlide.title}
              </h1>
              <p className="mt-5 max-w-xl text-base font-medium leading-7 text-white/90 sm:text-lg">
                {activeSlide.body}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-7 flex flex-col gap-3 xs:flex-row">
            <Button
              asChild
              size="lg"
              className="min-h-11 rounded-md bg-secondary px-7 text-base font-semibold text-white hover:bg-secondary/90 sm:min-h-12 lg:min-h-11 lg:px-6 lg:text-sm"
            >
              <Link
                href={activeSlide.primaryHref}
                target={activeSlide.primaryExternal ? "_blank" : undefined}
                rel={
                  activeSlide.primaryExternal
                    ? "noopener noreferrer"
                    : undefined
                }
              >
                {activeSlide.primaryLabel}
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="min-h-11 rounded-md border-white/80 bg-white px-7 text-base font-semibold text-primary hover:bg-white/90 sm:min-h-12 lg:min-h-11 lg:px-6 lg:text-sm"
            >
              <Link href="/academics/programmes">
                Explore Programmes
                <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
            </Button>
          </div>

        </div>

        <div className="absolute bottom-10 right-4 hidden max-w-[300px] rounded-md border border-white/20 bg-slate-950/35 p-4 text-white shadow-2xl shadow-slate-950/20 backdrop-blur-md lg:block xl:right-10">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">
            Institutional gateway
          </p>
          <div className="mt-3 grid gap-2">
            {["Admissions", "Academic programmes", "Research & innovation"].map(
              (item) => (
                <span
                  key={item}
                  className="flex items-center justify-between gap-3 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold"
                >
                  {item}
                  <ArrowRight className="h-3.5 w-3.5 text-secondary" aria-hidden />
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      {shouldShowControls ? (
        <div
          className="absolute inset-x-0 bottom-1 z-10 flex justify-center"
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

      {shouldShowArrows ? (
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 z-10 hidden items-center justify-between px-4 sm:flex lg:px-8 xl:px-10 2xl:px-12">
          <button
            type="button"
            onClick={showPreviousSlide}
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/35 text-white ring-1 ring-white/30 backdrop-blur-sm transition hover:bg-slate-950/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            aria-label="Show previous hero slide"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={showNextSlide}
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-950/35 text-white ring-1 ring-white/30 backdrop-blur-sm transition hover:bg-slate-950/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            aria-label="Show next hero slide"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      ) : null}
    </section>
  );
}
