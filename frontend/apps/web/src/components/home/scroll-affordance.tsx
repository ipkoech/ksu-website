"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@ksu/ui/lib/utils";
import { focusVisibleStyles } from "@ksu/ui/motion";

type Mode = "down" | "up" | null;

/**
 * A single floating control that points the way out of wherever the reader is
 * parked: down while the hero fills the screen, back to the top once the
 * footer arrives, and nothing in between so it never hovers over the content.
 *
 * Sits bottom-left because the accessibility widget and the enquiry launcher
 * already occupy the bottom-right dock.
 */
export function ScrollAffordance() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<Mode>(null);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(
      'section[aria-labelledby="hero-heading"]',
    );
    const footer = document.querySelector<HTMLElement>("footer");
    if (!hero && !footer) return;

    // IntersectionObserver rather than a scroll listener: no work on frames
    // where nothing crossed a boundary.
    const state = { hero: false, footer: false };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === hero) state.hero = entry.isIntersecting;
          if (entry.target === footer) state.footer = entry.isIntersecting;
        }
        // Footer wins: at the bottom of a long page, getting back up is the
        // more useful of the two.
        setMode(state.footer ? "up" : state.hero ? "down" : null);
      },
      { threshold: 0.25 },
    );

    if (hero) observer.observe(hero);
    if (footer) observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const behavior: ScrollBehavior = reduce ? "auto" : "smooth";

  const onClick = () => {
    if (mode === "up") {
      window.scrollTo({ top: 0, behavior });
      return;
    }
    const hero = document.querySelector<HTMLElement>(
      'section[aria-labelledby="hero-heading"]',
    );
    // Land just past the hero rather than an arbitrary viewport down, so the
    // next section starts at the top of the screen.
    const target = hero
      ? hero.getBoundingClientRect().bottom + window.scrollY
      : window.scrollY + window.innerHeight;
    window.scrollTo({ top: target, behavior });
  };

  return (
    <AnimatePresence>
      {mode ? (
        <motion.button
          key={mode}
          type="button"
          onClick={onClick}
          aria-label={
            mode === "up"
              ? "Back to the top of the page"
              : "Skip past the introduction"
          }
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: 10 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "fixed bottom-[var(--ksu-floating-bottom-offset)] left-4 z-40 flex h-12 w-12 items-center justify-center rounded-full",
            "bg-brand-overlay/90 text-white shadow-[0_10px_28px_-10px_hsl(var(--brand-overlay)/0.8)] ring-1 ring-white/15 backdrop-blur-sm",
            "transition-colors duration-300 hover:bg-primary",
            focusVisibleStyles.white,
          )}
        >
          {mode === "up" ? (
            <ArrowUp className="h-5 w-5" aria-hidden />
          ) : (
            <motion.span
              animate={reduce ? undefined : { y: [0, 3, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="h-5 w-5" aria-hidden />
            </motion.span>
          )}
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}

export default ScrollAffordance;
