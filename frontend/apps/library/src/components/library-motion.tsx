"use client";

import { type ReactNode, useEffect, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Hero background: slow settle-in zoom on load plus a gentle downward
 * parallax as the hero scrolls away. Bleeds past its box so the parallax
 * never exposes an edge.
 */
export function HeroParallaxMedia({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);

  return (
    <div ref={ref} aria-hidden className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute inset-[-8%]"
        style={reduce ? undefined : { y }}
        initial={reduce ? false : { scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: EASE_OUT }}
      >
        <Image
          src={src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>
    </div>
  );
}

/** Headline words rise out of individual overflow clips, staggered. */
export function MaskedWords({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="inline-block overflow-hidden pb-[0.1em] align-bottom"
          >
            <motion.span
              className="inline-block"
              initial={reduce ? false : { y: "115%" }}
              animate={{ y: 0 }}
              transition={{
                duration: 0.9,
                ease: EASE_OUT,
                delay: delay + index * 0.07,
              }}
            >
              {word}
            </motion.span>
            {index < words.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}

/** Mount-time rise, for elements below the hero headline. */
export function RiseIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Scroll-triggered reveal, once, for section content. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: EASE_OUT, delay }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: EASE_OUT },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Number spring-counts up when it enters the viewport. */
export function CountUp({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const spring = useSpring(0, { stiffness: 55, damping: 22 });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString(),
  );

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, spring, value]);

  if (reduce) {
    return <span className={className}>{value.toLocaleString()}</span>;
  }
  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}

/** In-page photograph with a subtle scroll parallax inside a clipped frame. */
export function ParallaxFigure({
  src,
  alt,
  sizes = "(min-width: 1024px) 50vw, 100vw",
  className = "",
}: {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <div ref={ref} className={`relative overflow-hidden rounded-2xl ${className}`}>
      <motion.div
        className="absolute inset-[-8%]"
        style={reduce ? undefined : { y }}
      >
        <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      </motion.div>
    </div>
  );
}

/* Legacy subpage hero wrappers (used by LibraryHero in library-ui.tsx). */

export function LibraryHeroMotion({ children }: { children: ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-primary px-4 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
      {children}
    </section>
  );
}

export function LibraryHeroContentMotion({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0 max-w-4xl motion-safe:animate-[fadeInUp_0.36s_ease-out_both]">
      {children}
    </div>
  );
}

export function LibraryHeroAsideMotion({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/20 bg-brand-overlay/30 p-4 shadow-2xl shadow-primary/20 backdrop-blur-md sm:p-5 motion-safe:animate-[fadeInUp_0.36s_ease-out_0.08s_both]">
      {children}
    </div>
  );
}
