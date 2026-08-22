"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@ksu/ui/lib/utils";

export function ImageCurtainReveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  /** @deprecated Image curtains now consistently travel from top to bottom. */
  direction?: "left" | "right" | "up" | "down";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10%", threshold: 0.12 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "relative isolate overflow-hidden bg-primary/10",
        className,
      )}
    >
      <div
        className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none sm:duration-1000 ${visible ? "scale-100 opacity-100" : "scale-[1.025] opacity-70 sm:scale-[1.04]"}`}
      >
        {children}
      </div>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-30 bg-[hsl(var(--primary)/0.58)] transition-transform duration-700 ease-[cubic-bezier(.77,0,.18,1)] motion-reduce:hidden sm:duration-1000 ${visible ? "translate-y-full" : "translate-y-0"}`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-40 border-t-[3px] border-secondary transition-transform duration-700 ease-[cubic-bezier(.77,0,.18,1)] motion-reduce:hidden sm:duration-1000 ${visible ? "translate-y-full" : "translate-y-0"}`}
      />
    </div>
  );
}
