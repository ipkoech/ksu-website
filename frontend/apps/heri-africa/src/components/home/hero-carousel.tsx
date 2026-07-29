"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export type HeroCarouselSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  buttonLabel?: string;
  buttonHref?: string;
};

export const fallbackHeroSlides: HeroCarouselSlide[] = [
  {
    id: "fallback-1",
    eyebrow: "HOSTED BY KISII UNIVERSITY",
    title: "Africa-Led Language Research for Transformative Education",
    description:
      "We advance policy-responsive and practice-oriented research in language education and foundational literacy across Africa.",
    image: "/images/HERIAfricaLaunch.jpg",
    alt: "HERI Africa researchers and education leaders at a launch event",
  },
  {
    id: "fallback-2",
    eyebrow: "KISII UNIVERSITY × HERI AFRICA",
    title: "African Knowledge. Shared Purpose. Lasting Impact.",
    description:
      "We connect African researchers, educators, policymakers, and communities to evidence that improves learning.",
    image: "/images/backgrounds/about-hero.jpg",
    alt: "African education researchers collaborating around a table",
  },
  {
    id: "fallback-3",
    eyebrow: "LANGUAGE EDUCATION RESEARCH CHAIR",
    title: "Evidence That Moves Language Education Forward",
    description:
      "We generate, translate, and apply rigorous research for every learner to read, understand, and thrive.",
    image: "/images/landing-page/why-kisii/pathway-2.jpg",
    alt: "Students learning together in an African education setting",
  },
] as const;

export function HeroCarousel({
  slides: providedSlides,
}: {
  slides?: HeroCarouselSlide[];
}) {
  const slides = providedSlides?.length ? providedSlides : fallbackHeroSlides;
  const slideCount = slides.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const goTo = useCallback(
    (index: number) => setActive((index + slideCount) % slideCount),
    [slideCount],
  );

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(
      () => setActive((current) => (current + 1) % slideCount),
      6500,
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, slideCount]);

  const slide = slides[active];
  return (
    <section
      aria-label="HERI Africa highlights"
      className="relative overflow-hidden bg-heri-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setPaused(false);
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(199,217,0,0.32),transparent_30%),linear-gradient(115deg,#003c39_0%,#006b62_52%,#062522_100%)]" />
      <div className="relative mx-auto grid min-h-[560px] max-w-[1440px] items-center lg:grid-cols-[0.88fr_1.12fr]">
        <div className="z-10 px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-heri-lime">
            {slide.eyebrow}
          </p>
          <h1 className="mt-5 max-w-2xl text-5xl font-bold leading-[0.98] tracking-[-0.04em] sm:text-6xl lg:text-[4.4rem]">
            {slide.title.split(" ").map((word, index) => (
              <span
                key={`${word}-${index}`}
                className={index > 3 ? "text-heri-lime" : ""}
              >
                {word}{" "}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
            {slide.description}
          </p>
          <Link
            href={slide.buttonHref ?? "/our-work"}
            className="mt-8 inline-flex items-center gap-6 rounded-xl bg-heri-lime px-5 py-3 text-sm font-bold text-heri-ink transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-heri-teal"
          >
            {slide.buttonLabel ?? "EXPLORE OUR WORK"}{" "}
            <ArrowRight className="size-4" />
          </Link>
          <div
            className="mt-8 flex items-center gap-3"
            role="tablist"
            aria-label="Hero slides"
          >
            {slides.map((item, index) => (
              <button
                key={item.title}
                type="button"
                role="tab"
                aria-label={`Show slide ${index + 1}`}
                aria-selected={index === active}
                onClick={() => goTo(index)}
                className={`h-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white ${index === active ? "w-7 bg-heri-lime" : "w-5 bg-white/80"}`}
              />
            ))}
            <button
              type="button"
              aria-label={paused ? "Play hero carousel" : "Pause hero carousel"}
              onClick={() => setPaused((value) => !value)}
              className="ml-2 rounded-full p-1 text-white/90 focus:outline-none focus:ring-2 focus:ring-white"
            >
              {paused ? (
                <Play className="size-4" />
              ) : (
                <Pause className="size-4" />
              )}
            </button>
          </div>
        </div>
        <div className="relative min-h-[340px] overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:w-[59%]">
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={active === 0}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-heri-ink via-heri-ink/20 to-transparent lg:from-heri-ink lg:via-transparent" />
        </div>
      </div>
    </section>
  );
}
