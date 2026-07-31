"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";

/**
 * Section-level reveal, scrubbed to scroll position: the block grows out
 * (fade + rise + subtle scale) in direct proportion to how far it has
 * entered the viewport — and reverses as it leaves.
 *
 * `opacityOnly` skips the transform (rise/scale) — required for sections
 * containing `position: sticky` descendants, since a transformed ancestor
 * breaks sticky positioning.
 */
export function SectionFadeIn({
  children,
  className,
  opacityOnly = false,
  delay: _delay = 0,
  duration: _duration = 800,
}: {
  children: ReactNode;
  className?: string;
  opacityOnly?: boolean;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.98", "start 0.75"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [48, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.965, 1]);

  if (reducedMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={opacityOnly ? { opacity } : { opacity, y, scale }}
    >
      {children}
    </motion.div>
  );
}
