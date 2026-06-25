"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";

export type ResearchHeroAction = {
  label: string;
  href: string;
};

export type ResearchHeroStat = {
  label: string;
  value: string | number;
};

export type ResearchHeroSlide = {
  id: string;
  eyebrow: string;
  title: string;
  body?: string;
  imageSrc: string;
  imageAlt: string;
  primaryAction?: ResearchHeroAction;
  secondaryAction?: ResearchHeroAction;
  stats?: ResearchHeroStat[];
};

function isExternalHref(value?: string | null) {
  return Boolean(value && /^https?:\/\//i.test(value));
}

export function ResearchImmersiveHero({
  slides,
  breadcrumbs = [],
  size = "compact",
  showControls = true,
  className,
}: {
  slides: ResearchHeroSlide[];
  breadcrumbs?: { label: string; href?: string }[];
  size?: "landing" | "compact" | "detail";
  showControls?: boolean;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const activeSlide = slides[activeIndex] ?? slides[0];
  const hasMultipleSlides = slides.length > 1;

  useEffect(() => {
    if (!hasMultipleSlides || isPaused || prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [hasMultipleSlides, isPaused, prefersReducedMotion, slides.length]);

  const showPreviousSlide = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const showNextSlide = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  if (!activeSlide) return null;

  const minHeight =
    size === "landing"
      ? "min-h-[70vh]"
      : size === "detail"
        ? "min-h-[380px] sm:min-h-[420px] lg:min-h-[500px]"
        : "min-h-[420px] sm:min-h-[460px] lg:min-h-[560px]";

  return (
    <section
      className={cn("relative isolate overflow-hidden bg-slate-950", minHeight, className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeSlide.id}
          className="absolute inset-0"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.65, ease: "easeOut" }}
        >
          <Image
            src={activeSlide.imageSrc}
            alt={activeSlide.imageAlt}
            fill
            priority={activeIndex === 0}
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,20,49,0.94)_0%,rgba(2,20,49,0.82)_38%,rgba(2,20,49,0.36)_68%,rgba(2,20,49,0.18)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,20,49,0.28)_0%,rgba(2,20,49,0.1)_46%,rgba(2,20,49,0.55)_100%)]" />

      <div className="relative z-10 mx-auto flex min-h-[inherit] w-full max-w-[1680px] flex-col justify-end px-4 py-7 sm:px-6 lg:px-8 lg:py-10 xl:px-10 2xl:px-12">
        {breadcrumbs.length > 0 ? <HeroBreadcrumbs items={breadcrumbs} /> : null}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${activeSlide.id}-content`}
            className="max-w-4xl pb-4 pt-16 sm:pt-20 lg:pb-8"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.36, ease: "easeOut" }}
          >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary sm:text-sm">
            {activeSlide.eyebrow}
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
            {activeSlide.title}
          </h1>
          {activeSlide.body ? (
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/85 sm:text-lg">
              {activeSlide.body}
            </p>
          ) : null}

          {activeSlide.primaryAction || activeSlide.secondaryAction ? (
            <div className="mt-7 flex flex-wrap gap-3">
              {activeSlide.primaryAction ? (
                <Link
                  href={activeSlide.primaryAction.href}
                  target={isExternalHref(activeSlide.primaryAction.href) ? "_blank" : undefined}
                  rel={isExternalHref(activeSlide.primaryAction.href) ? "noopener noreferrer" : undefined}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-secondary px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-secondary/90"
                >
                  {activeSlide.primaryAction.label}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              ) : null}
              {activeSlide.secondaryAction ? (
                <Link
                  href={activeSlide.secondaryAction.href}
                  target={isExternalHref(activeSlide.secondaryAction.href) ? "_blank" : undefined}
                  rel={isExternalHref(activeSlide.secondaryAction.href) ? "noopener noreferrer" : undefined}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/35 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  {activeSlide.secondaryAction.label}
                  <ArrowRight aria-hidden className="h-4 w-4" />
                </Link>
              ) : null}
            </div>
          ) : null}
          </motion.div>
        </AnimatePresence>

        {showControls && hasMultipleSlides ? (
          <ResearchPreviewRail
            slides={slides}
            activeIndex={activeIndex}
            onSelect={setActiveIndex}
          />
        ) : null}

        {showControls && hasMultipleSlides ? (
          <div className="flex items-center justify-between gap-4 pt-3">
            <div className="flex items-center gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`Show slide ${index + 1}`}
                  aria-current={index === activeIndex}
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "h-2.5 rounded-full transition-all",
                    index === activeIndex ? "w-9 bg-secondary" : "w-2.5 bg-white/45 hover:bg-white/75",
                  )}
                />
              ))}
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                aria-label="Previous slide"
                onClick={showPreviousSlide}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              >
                <ChevronLeft aria-hidden className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                onClick={showNextSlide}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              >
                <ChevronRight aria-hidden className="h-5 w-5" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ResearchPreviewRail({
  slides,
  activeIndex,
  onSelect,
}: {
  slides: ResearchHeroSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="mt-4 max-w-6xl rounded-md border border-white/15 bg-white/10 p-2 text-white backdrop-blur md:p-3">
      <div className="flex gap-2 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 xl:grid-cols-4">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={slide.id}
              type="button"
              aria-current={isActive}
              aria-label={`Show research slide ${index + 1}: ${slide.title}`}
              onClick={() => onSelect(index)}
              className="group grid min-w-[250px] grid-cols-[76px_minmax(0,1fr)] overflow-hidden rounded-md border border-white/12 bg-slate-950/28 text-left transition hover:bg-slate-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:min-w-0"
            >
              <span
                aria-hidden
                className="block h-full min-h-[84px] bg-cover bg-center"
                style={{ backgroundImage: `url("${slide.imageSrc}")` }}
              />
              <span className="flex min-h-[84px] flex-col justify-between p-3">
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
                    className={cn(
                      "block h-full bg-secondary transition-all",
                      isActive ? "w-full" : "w-0 group-hover:w-1/3",
                    )}
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

function HeroBreadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-auto flex flex-wrap items-center gap-2 pt-2 text-xs font-semibold text-white/70"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {item.href && !isLast ? (
              <Link href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "text-white" : undefined}>{item.label}</span>
            )}
            {!isLast ? <ChevronRight aria-hidden className="h-3.5 w-3.5 text-white/35" /> : null}
          </span>
        );
      })}
    </nav>
  );
}
