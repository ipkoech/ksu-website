"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

/**
 * A single, restrained entrance for each major landing-page beat.
 *
 * Section internals may still stagger their cards; this wrapper only brings
 * the section surface into the viewport so the page has one continuous
 * scroll rhythm. The hero and its overlapping stats band intentionally stay
 * outside this treatment because they are present on first paint.
 */
export function HomeSectionReveal({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 28 }}
      whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08, margin: "0px 0px -6%" }}
      transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export default HomeSectionReveal;
