"use client";

import { Children, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type RevealVariant = "fade" | "fade-up" | "fade-down" | "fade-left" | "fade-right";

const offsets: Record<RevealVariant, { x?: number; y?: number }> = {
  fade: {},
  "fade-up": { y: 24 },
  "fade-down": { y: -24 },
  "fade-left": { x: 24 },
  "fade-right": { x: -24 },
};

const easeOut = [0, 0, 0.2, 1] as const;

export function Reveal({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  duration = 600,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
}) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <div className={className}>{children}</div>;

  const offset = offsets[variant] ?? {};
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: offset.x ?? 0, y: offset.y ?? 0 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: false, amount: 0.2, margin: "0px 0px -60px 0px" }}
      transition={{
        duration: duration / 1000,
        delay: delay / 1000,
        ease: easeOut,
      }}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({
  children,
  className,
  variant = "fade-up",
  staggerDelay = 100,
  duration = 600,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  staggerDelay?: number;
  duration?: number;
}) {
  const reducedMotion = useReducedMotion();
  if (reducedMotion) return <div className={className}>{children}</div>;

  const offset = offsets[variant] ?? {};
  const items = Children.toArray(children);

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.1, margin: "0px 0px -60px 0px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay / 1000 } },
      }}
    >
      {items.map((child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, x: offset.x ?? 0, y: offset.y ?? 0 },
            visible: {
              opacity: 1,
              x: 0,
              y: 0,
              transition: { duration: duration / 1000, ease: easeOut },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
