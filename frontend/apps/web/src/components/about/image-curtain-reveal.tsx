"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export function ImageCurtainReveal({
  children,
  className = "",
  direction = "right",
}: {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right";
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

  const exit = direction === "right" ? "translate-x-full" : "-translate-x-full";

  return (
    <div ref={ref} className={`relative isolate overflow-hidden bg-[#dce8f7] ${className}`}>
      <div className={`absolute inset-0 transition-[opacity,transform] duration-1000 ease-out motion-reduce:transition-none ${visible ? "scale-100 opacity-100" : "scale-[1.04] opacity-70"}`}>
        {children}
      </div>
      <span aria-hidden className={`pointer-events-none absolute inset-0 z-30 bg-[#b9d0ee]/95 transition-transform duration-1000 ease-[cubic-bezier(.77,0,.18,1)] motion-reduce:hidden ${visible ? exit : "translate-x-0"}`} />
      <span aria-hidden className={`pointer-events-none absolute inset-0 z-40 transition-transform duration-1000 ease-[cubic-bezier(.77,0,.18,1)] motion-reduce:hidden ${direction === "right" ? "border-l-[3px]" : "border-r-[3px]"} border-[#f3c96b] ${visible ? exit : "translate-x-0"}`} />
    </div>
  );
}
