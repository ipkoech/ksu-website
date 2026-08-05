"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Pause, Play } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { withBasePath } from "../../lib/base-path";

export type HeroSlideView = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  alt: string;
  buttonLabel?: string;
  buttonHref?: string;
};

const defaultSlides: HeroSlideView[] = [
  {
    id: "default",
    eyebrow: "Kisii University × HERI Africa",
    title: "Research that moves African language education forward",
    description:
      "The Language Education Research Chair at Kisii University generates evidence that improves reading, teaching and policy across Africa.",
    image: withBasePath("/images/HERIAfricaLaunch.jpg"),
    alt: "HERI Africa researchers and education leaders at a launch event",
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({ slides: provided }: { slides?: HeroSlideView[] }) {
  const slides = provided?.length ? provided : defaultSlides;
  const count = slides.length;
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || reduce || count < 2) return;
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % count);
    }, 7000);
    return () => clearInterval(timer);
  }, [paused, reduce, count]);

  const slide = slides[active];
  const words = slide.title.split(" ");
  const limeFrom = Math.max(1, words.length - 3);

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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,rgba(199,217,0,0.22),transparent_32%),linear-gradient(115deg,#003c39_0%,#006b62_55%,#062522_100%)]" />
      <div className="relative mx-auto grid min-h-[560px] max-w-[1440px] items-center lg:grid-cols-[0.92fr_1.08fr]">
        <div className="z-10 px-6 py-16 sm:px-10 lg:px-16 lg:py-20">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={slide.id}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.25 } }}
              transition={{ duration: 0.4 }}
            >
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="text-xs font-bold uppercase tracking-[0.2em] text-heri-lime"
              >
                {slide.eyebrow}
              </motion.p>
              <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.02] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
                {words.map((word, index) => (
                  <motion.span
                    key={`${word}-${index}`}
                    className={`inline-block ${index >= limeFrom ? "text-heri-lime" : ""}`}
                    initial={reduce ? false : { opacity: 0, y: "0.5em" }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.55,
                      delay: 0.08 + index * 0.045,
                      ease: EASE,
                    }}
                  >
                    {word}
                    {index < words.length - 1 ? " " : ""}
                  </motion.span>
                ))}
              </h1>
              <motion.p
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.35, ease: EASE }}
                className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg"
              >
                {slide.description}
              </motion.p>
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.45, ease: EASE }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <Link
                  href={slide.buttonHref ?? "/our-work"}
                  className="inline-flex items-center gap-3 rounded-xl bg-heri-lime px-6 py-3.5 text-sm font-bold text-heri-ink transition hover:bg-white active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-heri-teal"
                >
                  {slide.buttonLabel ?? "Explore our research"}
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/team"
                  className="inline-flex items-center gap-3 rounded-xl border border-white/40 px-6 py-3.5 text-sm font-bold text-white transition hover:border-heri-lime hover:text-heri-lime active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white"
                >
                  Meet the team
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
          {count > 1 && (
            <div
              className="mt-10 flex items-center gap-3"
              role="tablist"
              aria-label="Hero slides"
            >
              {slides.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-label={`Show slide ${index + 1}`}
                  aria-selected={index === active}
                  onClick={() => setActive(index)}
                  className={`h-1.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white ${index === active ? "w-8 bg-heri-lime" : "w-5 bg-white/70 hover:bg-white"}`}
                />
              ))}
              <button
                type="button"
                aria-label={
                  paused ? "Play hero carousel" : "Pause hero carousel"
                }
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
          )}
        </div>
        <div className="relative min-h-[320px] overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:w-[56%]">
          <AnimatePresence initial={false}>
            <motion.div
              key={slide.id}
              className="absolute inset-0"
              initial={
                reduce
                  ? false
                  : { opacity: 0, clipPath: "inset(0 0 0 12%)", scale: 1.06 }
              }
              animate={{
                opacity: 1,
                clipPath: "inset(0 0 0 0%)",
                scale: 1,
              }}
              exit={reduce ? undefined : { opacity: 0, transition: { duration: 0.4 } }}
              transition={{ duration: 1.1, ease: EASE }}
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={active === 0}
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center"
              />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-heri-ink via-heri-ink/25 to-transparent lg:from-heri-ink lg:via-transparent" />
        </div>
      </div>
    </section>
  );
}
