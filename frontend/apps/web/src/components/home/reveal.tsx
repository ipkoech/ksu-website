"use client";

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { cn } from "@ksu/ui/lib/utils";

/** Framer-free reduced-motion preference (SSR-safe, live-updating). */
export function useReducedMotionPref(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms. */
  delay?: number;
  /** Fraction of the element that must be visible before revealing. */
  amount?: number;
  as?: "div" | "section" | "article" | "figure" | "ul" | "li" | "aside";
  style?: CSSProperties;
  id?: string;
}

/**
 * The landing's one reveal: opacity + 20px rise over 450ms, played once on
 * entering the viewport. Pure CSS transitions driven by IntersectionObserver
 * — no animation library. Elements already in view on mount render visible
 * (no first-paint flicker), and reduced motion renders static.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  amount = 0.25,
  as: Tag = "div",
  style,
  id,
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const reduced = useReducedMotionPref();

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return;
    // Above-the-fold content must never flash hidden.
    const rect = node.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setShown(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { threshold: amount },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [amount, shown]);

  const visible = reduced || shown;

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      id={id}
      className={cn(
        "transition-[opacity,transform] duration-[450ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
        className,
      )}
      style={{ ...style, transitionDelay: visible ? `${delay}ms` : undefined }}
    >
      {children}
    </Tag>
  );
}
