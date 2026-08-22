"use client";

import type { ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { useEffect, useRef } from "react";

/**
 * The landing page's one entrance.
 *
 * A short rise out of an exponential ease-out, played once when the block
 * enters view. Every section uses this same curve so the page reads as one
 * authored moment rather than a dozen competing effects, and everything
 * collapses to static under reduced motion.
 */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const revealVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT_EXPO },
  },
};

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  id,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger offset in seconds. */
  delay?: number;
  as?: "div" | "section" | "article" | "li" | "figure" | "aside" | "header";
  id?: string;
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      id={id}
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, amount: 0.15 }}
      variants={revealVariants}
      transition={{ duration: 0.7, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </Tag>
  );
}

/**
 * Parent for a run of items that should arrive in sequence. Children must be
 * `RevealItem`s in the same client tree for the stagger to orchestrate.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul" | "ol" | "section";
}) {
  const reduce = useReducedMotion();
  const Tag = motion[as];

  return (
    <Tag
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: stagger } },
      }}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "article";
}) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={revealVariants}>
      {children}
    </Tag>
  );
}

/**
 * Counts a figure up once, when it first comes into view.
 *
 * Statistics are the one place on this page where motion carries meaning
 * rather than decoration: the count communicates scale. Non-numeric values
 * and reduced-motion readers get the final string immediately.
 */
export function CountUp({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  // "45,000+" splits into 45000 and "+". Anything that does not start with a
  // plain number ("KES 12.9M") is rendered as-is.
  const match = value.match(/^([\d,]+)(.*)$/);
  const target = match ? Number(match[1].replace(/,/g, "")) : null;
  const countable = target !== null && Number.isFinite(target) && target > 0;

  useEffect(() => {
    if (reduce || !countable || !inView) return;
    const node = numberRef.current;
    if (!node) return;

    // Driven straight onto the text node: a per-frame React state update
    // would re-render the whole band sixty times a second.
    const controls = animate(0, target as number, {
      duration: 1.4,
      ease: EASE_OUT_EXPO,
      onUpdate: (current) => {
        node.textContent = Math.round(current).toLocaleString();
      },
    });
    return () => controls.stop();
  }, [countable, inView, reduce, target]);

  if (!countable) return <span className={className}>{value}</span>;

  return (
    <span ref={ref} className={className}>
      {/* The final figure is the rendered default, so the real number is
          present without JavaScript and under reduced motion. */}
      <span ref={numberRef}>{(target as number).toLocaleString()}</span>
      {match?.[2] ?? ""}
    </span>
  );
}
