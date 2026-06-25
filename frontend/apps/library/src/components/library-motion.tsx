"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function LibraryHeroMotion({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <section
      className="relative isolate overflow-hidden border-b border-slate-200 bg-primary px-4 text-white sm:px-6 lg:px-8 xl:px-10 2xl:px-12"
    >
      {children}
    </section>
  );
}

export function LibraryHeroContentMotion({
  children,
}: {
  children: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="min-w-0 max-w-4xl"
      initial={false}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.36, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function LibraryHeroAsideMotion({
  children,
}: {
  children: ReactNode;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="min-w-0 rounded-lg border border-white/20 bg-slate-950/30 p-4 shadow-2xl shadow-slate-950/20 backdrop-blur-md sm:p-5"
      initial={false}
      animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{
        delay: prefersReducedMotion ? 0 : 0.08,
        duration: prefersReducedMotion ? 0 : 0.36,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
