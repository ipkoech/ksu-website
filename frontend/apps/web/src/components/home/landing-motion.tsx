"use client";

import type { ElementType, ReactNode } from "react";
import { ScrollReveal } from "@ksu/ui/components";

type RevealHeadingProps = {
  children: ReactNode;
  className?: string;
  as?: Extract<ElementType, "h1" | "h2" | "h3" | "h4">;
  delay?: number;
};

/** A restrained masked heading reveal used for editorial landing-page titles. */
export function RevealHeading({
  children,
  className,
  as = "h2",
  delay = 0,
}: RevealHeadingProps) {
  return (
    <ScrollReveal
      as={as}
      variant="mask-up"
      delay={delay}
      duration={760}
      className={className}
    >
      {children}
    </ScrollReveal>
  );
}

export function RevealCopy({
  children,
  className,
  delay = 100,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <ScrollReveal
      variant="blur-up"
      delay={delay}
      duration={620}
      className={className}
    >
      {children}
    </ScrollReveal>
  );
}
