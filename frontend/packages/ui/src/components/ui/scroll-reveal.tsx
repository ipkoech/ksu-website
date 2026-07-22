"use client";

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";

type AnimationVariant =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom-in"
  | "zoom-out";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  variant?: AnimationVariant;
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  rootMargin?: string;
  as?: ElementType;
}

const variantStyles: Record<AnimationVariant, { initial: string; animate: string }> = {
  "fade-up": {
    initial: "opacity-0 translate-y-6",
    animate: "opacity-100 translate-y-0",
  },
  "fade-down": {
    initial: "opacity-0 -translate-y-6",
    animate: "opacity-100 translate-y-0",
  },
  "fade-left": {
    initial: "opacity-0 translate-x-6",
    animate: "opacity-100 translate-x-0",
  },
  "fade-right": {
    initial: "opacity-0 -translate-x-6",
    animate: "opacity-100 translate-x-0",
  },
  "zoom-in": {
    initial: "opacity-0 scale-95",
    animate: "opacity-100 scale-100",
  },
  "zoom-out": {
    initial: "opacity-0 scale-105",
    animate: "opacity-100 scale-100",
  },
};

export function ScrollReveal({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  duration = 600,
  threshold = 0.01,
  once = true,
  rootMargin = "0px 0px 12% 0px",
  as = "div",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = mediaQuery.matches;
    setPrefersReducedMotion(reducedMotion);

    if (reducedMotion || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const rect = element.getBoundingClientRect();
    const viewportBuffer = window.innerHeight * 0.12;
    if (rect.top < window.innerHeight + viewportBuffer && rect.bottom > 0) {
      setIsVisible(true);
      if (once) return;
    } else {
      setIsVisible(false);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  // Keep the primitive resilient when a consuming app has a stale package
  // bundle during dev/hot reload or passes an older variant name.
  const styles = variantStyles[variant] ?? variantStyles["fade-up"];
  const Component = as;
  const visible = isVisible || prefersReducedMotion;
  const style: CSSProperties = prefersReducedMotion
    ? {}
    : {
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
      };

  return createElement(
    Component,
    {
      ref,
      "data-scroll-reveal": true,
      className: cn(
        prefersReducedMotion ? undefined : "transition-all ease-out",
        "motion-reduce:!translate-x-0 motion-reduce:!translate-y-0 motion-reduce:!scale-100 motion-reduce:!opacity-100 motion-reduce:!transition-none",
        visible ? styles.animate : styles.initial,
        className
      ),
      style,
    },
    children
  );
}

interface ScrollRevealGroupProps {
  children: ReactNode;
  className?: string;
  variant?: AnimationVariant;
  staggerDelay?: number;
  duration?: number;
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  as?: ElementType;
}

export function ScrollRevealGroup({
  children,
  className,
  variant = "fade-up",
  staggerDelay = 75,
  duration = 600,
  threshold = 0.01,
  rootMargin = "0px 0px 12% 0px",
  once = true,
  as = "div",
}: ScrollRevealGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reducedMotion = mediaQuery.matches;
    setPrefersReducedMotion(reducedMotion);

    if (reducedMotion || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const rect = element.getBoundingClientRect();
    const viewportBuffer = window.innerHeight * 0.12;
    if (rect.top < window.innerHeight + viewportBuffer && rect.bottom > 0) {
      setIsVisible(true);
      if (once) return;
    } else {
      setIsVisible(false);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  const styles = variantStyles[variant] ?? variantStyles["fade-up"];
  const items = Array.isArray(children) ? children : [children];
  const Component = as;
  const visible = isVisible || prefersReducedMotion;

  return createElement(
    Component,
    { ref, className },
    items.map((child, index) => (
      <div
        key={index}
        data-scroll-reveal
        className={cn(
          prefersReducedMotion ? undefined : "transition-all ease-out",
          "motion-reduce:!translate-x-0 motion-reduce:!translate-y-0 motion-reduce:!scale-100 motion-reduce:!opacity-100 motion-reduce:!transition-none",
          visible ? styles.animate : styles.initial
        )}
        style={
          prefersReducedMotion
            ? undefined
            : {
                transitionDuration: `${duration}ms`,
                transitionDelay: `${index * staggerDelay}ms`,
              }
        }
      >
        {child}
      </div>
    ))
  );
}
