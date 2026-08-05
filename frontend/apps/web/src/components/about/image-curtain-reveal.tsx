"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function ImageCurtainReveal({
  children,
  className = "",
  direction = "down",
}: {
  children: ReactNode;
  className?: string;
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
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -10%", threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const exitClassName =
    direction === "right"
      ? "translate-x-full"
      : direction === "left"
        ? "-translate-x-full"
        : direction === "up"
          ? "-translate-y-full"
          : "translate-y-full";
  const edgeClassName =
    direction === "right"
      ? "border-l-[3px]"
      : direction === "left"
        ? "border-r-[3px]"
        : direction === "up"
          ? "border-b-[3px]"
          : "border-t-[3px]";

  return (
    <div
      ref={ref}
      className={`relative isolate overflow-hidden bg-primary/10 ${className}`}
    >
      <div
        className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none sm:duration-1000 ${visible ? "scale-100 opacity-100" : "scale-[1.025] opacity-70 sm:scale-[1.04]"}`}
      >
        {children}
      </div>
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-30 bg-[hsl(var(--primary)/0.25)] transition-transform duration-700 ease-[cubic-bezier(.77,0,.18,1)] motion-reduce:hidden sm:duration-1000 ${visible ? exitClassName : "translate-x-0 translate-y-0"}`}
      />
      <span
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-40 border-secondary transition-transform duration-700 ease-[cubic-bezier(.77,0,.18,1)] motion-reduce:hidden sm:duration-1000 ${edgeClassName} ${visible ? exitClassName : "translate-x-0 translate-y-0"}`}
      />
    </div>
  );
}
