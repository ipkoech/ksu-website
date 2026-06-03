"use client";

import { type FocusEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@ksu/ui/components";
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
          <motion.picture
            key={activeSlide.id}
            className="absolute inset-0 block h-full w-full"
            initial={
              prefersReducedMotion
                ? false
                : { opacity: 0, x: useSlideTransition ? 24 : 0, scale: 1.04 }
            }
            animate={
              prefersReducedMotion ? undefined : { opacity: 1, x: 0, scale: 1 }
            }
            exit={
              prefersReducedMotion
                ? undefined
                : { opacity: 0, x: useSlideTransition ? -18 : 0, scale: 1.02 }
            }
            transition={{
              duration: prefersReducedMotion ? 0 : 0.7,
              ease: "easeOut",
            }}
          >
            {activeSlide.mobileImageUrl ? (
              <source media="(max-width: 767px)" srcSet={activeSlide.mobileImageUrl} />
            ) : null}
            <img
              src={activeSlide.desktopImageUrl ?? activeSlide.imageUrl}
              alt={activeSlide.imageAlt}
              className="h-full w-full scale-110 object-cover object-[45%_50%] opacity-90 sm:scale-105 lg:scale-100 lg:object-[58%_50%]"
              fetchPriority={activeIndex === 0 ? "high" : "auto"}
            />
          </motion.picture>
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
              <p className="sr-only">{activeSlide.eyebrow}</p>
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
                <ArrowRight className="h-5 w-5" />
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
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
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
    </section>
  );
}
