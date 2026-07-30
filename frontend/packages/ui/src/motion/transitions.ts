/**
 * Motion timing and easing constants
 * Shared across all KSU frontend apps
 */

export const timing = {
  instant: 100,
  fast: 150,
  normal: 250,
  reveal: 400,
  slow: 600,
  slower: 800,
  kenBurns: 8000,
  crossfade: 6000,
} as const;

export const easing = {
  easeOut: [0.0, 0.0, 0.2, 1] as const,
  easeIn: [0.4, 0.0, 1, 1] as const,
  easeInOut: [0.4, 0.0, 0.2, 1] as const,
  spring: { stiffness: 300, damping: 24 },
  springGentle: { stiffness: 200, damping: 20 },
  springBouncy: { stiffness: 400, damping: 17 },
} as const;

export const stagger = {
  fast: 30,
  normal: 50,
  slow: 80,
  centerOut: 40,
} as const;

export type Timing = keyof typeof timing;
export type Easing = keyof typeof easing;
