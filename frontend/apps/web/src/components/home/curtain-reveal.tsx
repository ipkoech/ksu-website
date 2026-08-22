"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@ksu/ui/lib/utils";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export interface CurtainRevealProps {
  children: ReactNode;
  className?: string;
  /**
   * `scroll` ties the curtain to scroll position, so it draws down as the
   * reader advances and reverses if they scroll back. `enter` plays it once
   * when the block arrives.
   */
  mode?: "scroll" | "enter";
  /** How far the media sits behind its final scale before settling. */
  zoom?: number;
  /**
   * How much of the frame the descending veil may cover, 0-1. The veil is
   * translucent and multiplies against the media, so even at 1 the picture
   * still reads; this controls how far down the frame the tint reaches.
   */
  coverage?: number;
}

/**
 * A brand curtain that draws in from the top as the reader scrolls.
 *
 * The frame opens on the media, and the panel descends from the top edge to
 * cover it: height grows from nothing to full, anchored at the top, so it
 * reads as a blind being drawn down over the picture. Underneath, the media
 * eases out of a slight over-scale so the movement has depth.
 *
 * Under reduced motion nothing moves and the media stays uncovered: a panel
 * that permanently hides an image would be worse than no effect at all.
 */
export function CurtainReveal({
  children,
  className,
  mode = "scroll",
  zoom = 1.08,
  coverage = 0.55,
}: CurtainRevealProps) {
  const maxCover = `${Math.round(Math.min(Math.max(coverage, 0), 1) * 100)}%`;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // The window has to sit where the reader can actually see the frame.
  // `start end` begins the instant the block's top edge touches the bottom of
  // the viewport, which meant the veil finished drawing while the section was
  // still off-screen and the drop was never witnessed. Starting at
  // `start 0.75` holds it clear until the frame is a quarter of the way up
  // the viewport, and ending at `end 0.45` keeps it moving until the block's
  // bottom edge passes the middle: the whole draw happens in view.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.45"],
  });
  const eased = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 26,
    restDelta: 0.001,
  });

  // Height rather than scaleY: scaling a gradient stretches it, while
  // animating height keeps the panel's own colours undistorted as it draws.
  const height = useTransform(eased, [0, 1], ["0%", maxCover]);
  const scale = useTransform(eased, [0, 1], [1, zoom]);

  const scrollDriven = mode === "scroll" && !reduce;

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      <motion.div
        className="absolute inset-0"
        style={scrollDriven ? { scale } : undefined}
        initial={scrollDriven || reduce ? false : { scale: 1 }}
        whileInView={scrollDriven ? undefined : { scale: zoom }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
      >
        {children}
      </motion.div>

      {/* The curtain. Top-anchored, growing downward over the media. */}
      {reduce ? null : (
        <motion.div
          className="pointer-events-none absolute inset-x-0 top-0 bg-[linear-gradient(180deg,hsl(var(--primary-deep)/0.30)_0%,hsl(var(--primary-deep)/0.20)_38%,hsl(var(--panel)/0.10)_68%,transparent_100%)] mix-blend-multiply"
          style={scrollDriven ? { height } : undefined}
          initial={scrollDriven ? false : { height: "0%" }}
          whileInView={scrollDriven ? undefined : { height: maxCover }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
          aria-hidden
        />
      )}
    </div>
  );
}

export default CurtainReveal;
