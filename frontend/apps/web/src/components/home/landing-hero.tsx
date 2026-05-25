"use client";

import { type FocusEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@ksu/ui/components";
import type { LandingHeroData, LandingHeroSlide } from "@/lib/landing-data";

const fallbackSlide: LandingHeroSlide = {
  id: "fallback-landing-hero",
  eyebrow: "Public university digital gateway",
  title: "Kisii University for learning, research, and public service",
  body:
    "Access admissions, academic programmes, research enterprise, governance information, and student or staff services from one clear institutional entry point.",
  imageUrl: "/logos/ksu-bck5.jpg",
  desktopImageUrl: "/logos/ksu-bck5.jpg",
  mobileImageUrl: "/logos/ksu-bck5.jpg",
  imageAlt: "Kisii University",
  primaryLabel: "View Admissions Guide",
  primaryHref: "/admissions/how-to-apply",
};

const fallbackHeroSettings: Omit<LandingHeroData, "slides"> = {
  autoPlay: true,
  autoPlayDurationMs: 7000,
  showNavigationDots: true,
  showArrows: true,
  transitionEffect: "fade",
};

const heroActions = [
  {
    title: "Admissions Guide",
    description: "Entry requirements, intakes, and application steps",
    href: "/admissions/how-to-apply",
    icon: FileText,
    tone: "blue",
  },
  {
    title: "Academic Programmes",
    description: "Schools, courses, and progression routes",
    href: "/academics/programmes",
    icon: BookOpen,
    tone: "orange",
  },
  {
    title: "Digital Services",
    description: "Student portal, staff access, and learning systems",
    href: "https://portal.kisiiuniversity.ac.ke",
    icon: BriefcaseBusiness,
    tone: "blue",
  },
] satisfies Array<{
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: "blue" | "orange";
}>;

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
  const shouldAutoPlay = autoPlay && hasMultipleSlides && !isPaused && !prefersReducedMotion;
  const transitionMode = (transitionEffect ?? "fade").toLowerCase();
  const useSlideTransition = transitionMode.includes("slide");
  const shouldShowControls = hasMultipleSlides && (showNavigationDots || showArrows);

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

  const nextSlide = () => setActiveIndex((index) => (index + 1) % slides.length);
  const previousSlide = () => setActiveIndex((index) => (index - 1 + slides.length) % slides.length);

  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    const nextTarget = event.relatedTarget;
    if (!(nextTarget instanceof Node) || !event.currentTarget.contains(nextTarget)) {
      setIsPaused(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-primary pt-4 sm:pt-8 lg:pt-6"
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
            initial={prefersReducedMotion ? false : { opacity: 0, x: useSlideTransition ? 24 : 0, scale: 1.04 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, x: 0, scale: 1 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, x: useSlideTransition ? -18 : 0, scale: 1.02 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: "easeOut" }}
          >
            {activeSlide.mobileImageUrl ? (
              <source media="(max-width: 767px)" srcSet={activeSlide.mobileImageUrl} />
            ) : null}
            <img
              src={activeSlide.desktopImageUrl ?? activeSlide.imageUrl}
              alt={activeSlide.imageAlt}
              className="h-full w-full scale-125 object-cover object-[42%_50%] opacity-80 sm:scale-110 lg:scale-100 lg:object-[50%_50%]"
            />
          </motion.picture>
        </AnimatePresence>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,49,0.94)_0%,rgba(2,20,49,0.82)_42%,rgba(2,20,49,0.3)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/30 to-transparent" />
      </div>

      <div className="relative min-h-[720px] w-full px-4 sm:min-h-[700px] sm:px-6 lg:min-h-[520px] lg:px-8 xl:px-10 2xl:px-12">
        <div className="max-w-[470px] pt-2 lg:max-w-[760px] lg:pt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial={prefersReducedMotion ? false : { opacity: 0, y: useSlideTransition ? 0 : 12, x: useSlideTransition ? 18 : 0 }}
              animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, x: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: useSlideTransition ? 0 : -8, x: useSlideTransition ? -12 : 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
            >
              <p className="text-sm font-bold uppercase text-secondary lg:text-xs">
                {activeSlide.eyebrow}
              </p>
              <h1 className="mt-4 max-w-[470px] font-[family-name:var(--font-display)] text-5xl font-bold leading-tight text-white sm:text-6xl lg:mt-3 lg:max-w-[760px] lg:text-[58px] lg:leading-[0.98]">
                {activeSlide.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl lg:mt-4 lg:text-base lg:leading-7">
                {activeSlide.body}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex flex-col gap-3 xs:flex-row lg:mt-5">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-md bg-secondary px-7 text-base font-semibold text-white hover:bg-secondary/90 sm:h-12 lg:h-10 lg:px-6 lg:text-sm"
            >
              <Link
                href={activeSlide.primaryHref}
                target={activeSlide.primaryExternal ? "_blank" : undefined}
                rel={activeSlide.primaryExternal ? "noopener noreferrer" : undefined}
              >
                {activeSlide.primaryLabel}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-11 rounded-md border-white/80 bg-white px-7 text-base font-semibold text-primary hover:bg-white/90 sm:h-12 lg:h-10 lg:px-6 lg:text-sm"
            >
              <Link href="/academics/programmes">
                Explore Programmes
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>

          {shouldShowControls ? (
            <div className="mt-5 flex items-center gap-3">
              {showNavigationDots ? (
                <div className="flex items-center gap-2" aria-label="Hero slides">
                  {slides.map((slide, index) => (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      className={
                        index === activeIndex
                          ? "h-2.5 w-8 rounded-full bg-secondary"
                          : "h-2.5 w-2.5 rounded-full bg-white/50 transition hover:bg-white"
                      }
                      aria-label={`Show slide ${index + 1}: ${slide.title}`}
                      aria-current={index === activeIndex ? "true" : undefined}
                    />
                  ))}
                </div>
              ) : null}
              {showArrows ? (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={previousSlide}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition hover:bg-white/20"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white transition hover:bg-white/20"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <ApplicantActionPanel />
      </div>
    </section>
  );
}

function ApplicantActionPanel() {
  return (
    <div className="mt-8 pb-8 sm:pb-10 lg:absolute lg:inset-x-auto lg:bottom-20 lg:right-8 lg:mt-0 lg:w-[320px] lg:pb-0 xl:bottom-24 xl:right-10 2xl:right-12">
      <aside className="overflow-hidden rounded-lg bg-white shadow-xl shadow-blue-950/20">
        <h2 className="px-4 py-3 text-lg font-bold text-slate-950 lg:bg-primary lg:px-4 lg:py-2.5 lg:text-sm lg:text-white">
          Priority services
        </h2>
        <div className="mx-4 mb-4 divide-y divide-slate-200 overflow-hidden rounded-md lg:mx-0 lg:mb-0 lg:rounded-none">
          {heroActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-center gap-3 bg-white p-2.5 transition hover:bg-blue-50 sm:gap-4 sm:p-4 lg:p-2.5"
            >
              <span
                className={
                  action.tone === "orange"
                    ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-white sm:h-12 sm:w-12 lg:h-9 lg:w-9"
                    : "flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-white sm:h-12 sm:w-12 lg:h-9 lg:w-9"
                }
              >
                <action.icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-5 lg:w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-bold text-slate-950 sm:text-sm lg:text-xs">
                  {action.title}
                </span>
                <span className="mt-1 block text-xs leading-4 text-slate-600 lg:leading-[1.25]">
                  {action.description}
                </span>
              </span>
              <ArrowRight className="h-5 w-5 text-primary transition group-hover:translate-x-1 lg:h-4 lg:w-4" />
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}
