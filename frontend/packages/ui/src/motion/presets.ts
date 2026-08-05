/**
 * Framer Motion animation presets
 * Designed for symmetric layouts with center-out reveals
 */

import type { Variants, Transition } from "framer-motion";
import { timing, easing } from "./transitions";

const baseTransition: Transition = {
  duration: timing.reveal / 1000,
  ease: easing.easeOut,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: baseTransition,
  },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: baseTransition,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: timing.normal / 1000, ease: easing.easeOut },
  },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: baseTransition,
  },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: baseTransition,
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: timing.normal / 1000,
      ease: easing.easeOut,
    },
  },
};

export const scaleUp: Variants = {
  hidden: { opacity: 0, scale: 0.85, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: timing.reveal / 1000,
      ease: easing.easeOut,
    },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: baseTransition,
  },
};

export const hoverLift = {
  scale: 1.02,
  y: -4,
  transition: { duration: timing.fast / 1000, ease: easing.easeOut },
};

export const hoverGlow = {
  scale: 1.01,
  boxShadow: "0 8px 30px -8px rgba(0, 119, 182, 0.35)",
  transition: { duration: timing.fast / 1000, ease: easing.easeOut },
};

export const tapScale = {
  scale: 0.97,
  transition: { duration: timing.instant / 1000 },
};

export const kenBurns: Variants = {
  initial: { scale: 1, x: 0, y: 0 },
  animate: {
    scale: 1.08,
    x: [0, -10, 0],
    y: [0, -5, 0],
    transition: {
      duration: timing.kenBurns / 1000,
      ease: "linear",
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};

export const crossfade: Variants = {
  enter: {
    opacity: 1,
    transition: { duration: timing.slow / 1000, ease: easing.easeInOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: timing.slow / 1000, ease: easing.easeInOut },
  },
};

export const pageSlideLeft: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: timing.normal / 1000, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: timing.fast / 1000, ease: easing.easeIn },
  },
};

export const pageSlideRight: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: timing.normal / 1000, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: timing.fast / 1000, ease: easing.easeIn },
  },
};

export const pageFade: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: timing.normal / 1000, ease: easing.easeOut },
  },
  exit: {
    opacity: 0,
    transition: { duration: timing.fast / 1000, ease: easing.easeIn },
  },
};

export const presets = {
  fadeUp,
  fadeDown,
  fadeIn,
  fadeLeft,
  fadeRight,
  scaleIn,
  scaleUp,
  staggerContainer,
  staggerItem,
  kenBurns,
  crossfade,
  pageSlideLeft,
  pageSlideRight,
  pageFade,
} as const;

export const interactions = {
  hoverLift,
  hoverGlow,
  tapScale,
} as const;

export type PresetName = keyof typeof presets;
