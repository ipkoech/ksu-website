"use client";

import type { ReactNode } from "react";
import { ReactLenis } from "lenis/react";

export function AboutPageLenis({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.08,
        duration: 1.1,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1,
      }}
    >
      {children}
    </ReactLenis>
  );
}
