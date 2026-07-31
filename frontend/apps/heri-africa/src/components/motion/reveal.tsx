"use client";

import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  duration?: number;
  once?: boolean;
} & Pick<MotionProps, "viewport">;

export function Reveal({
  children,
  className,
  delay = 0,
  distance = 24,
  duration = 0.65,
  once = true,
  viewport,
}: RevealProps) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once, amount: 0.18, ...viewport }}
    >
      {children}
    </motion.div>
  );
}

export function ImageReveal({
  children,
  className,
  delay = 0,
}: Pick<RevealProps, "children" | "className" | "delay">) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, scale: 1.04, y: 18 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
