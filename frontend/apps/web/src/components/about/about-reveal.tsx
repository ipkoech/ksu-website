"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealVariant = "up" | "left" | "right" | "fade" | "scale";

const hiddenVariant: Record<RevealVariant, string> = {
  up: "translate-y-6",
  left: "-translate-x-8",
  right: "translate-x-8",
  fade: "translate-y-0",
  scale: "scale-[0.975]",
};

export function AboutReveal({
  children,
  className = "",
  delay = 0,
  variant = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: RevealVariant;
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
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`${className} transition-[opacity,transform] duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none ${visible ? "translate-x-0 translate-y-0 scale-100 opacity-100" : `${hiddenVariant[variant]} opacity-0`}`}>{children}</div>;
}
