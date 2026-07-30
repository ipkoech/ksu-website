"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { useInView, useAnimation } from "framer-motion";
import { timing, stagger } from "./transitions";

export interface UseScrollRevealOptions {
  threshold?: number;
  triggerOnce?: boolean;
  delay?: number;
}

export function useScrollReveal(options: UseScrollRevealOptions = {}) {
  const { threshold = 1, triggerOnce = true, delay = 0 } = options;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, {
    amount: threshold,
    once: triggerOnce,
  });
  const controls = useAnimation();

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        controls.start("visible");
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [isInView, controls, delay]);

  return { ref, controls, isInView };
}

export interface UseStaggerOptions {
  staggerDelay?: number;
  origin?: "start" | "center" | "end";
}

export function useStaggerChildren(
  itemCount: number,
  options: UseStaggerOptions = {}
) {
  const { staggerDelay = stagger.normal, origin = "center" } = options;

  const getDelay = useCallback(
    (index: number): number => {
      if (origin === "start") {
        return index * staggerDelay;
      }
      if (origin === "end") {
        return (itemCount - 1 - index) * staggerDelay;
      }
      const center = (itemCount - 1) / 2;
      const distance = Math.abs(index - center);
      return distance * staggerDelay;
    },
    [itemCount, staggerDelay, origin]
  );

  return { getDelay };
}

export interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  startOnView?: boolean;
}

export function useCountUp(
  end: number,
  options: UseCountUpOptions = {}
) {
  const { duration = 2000, delay = 0, startOnView = true } = options;
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (startOnView && !isInView) return;
    if (hasStarted) return;

    const startTime = Date.now() + delay;
    setHasStarted(true);

    const animate = () => {
      const now = Date.now();
      if (now < startTime) {
        requestAnimationFrame(animate);
        return;
      }

      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(easeOut * end);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, delay, startOnView, isInView, hasStarted]);

  return { ref, count, isInView };
}

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}

export function useImageRotation(
  images: string[],
  interval: number = timing.crossfade
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, timing.slow);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  return {
    currentImage: images[currentIndex],
    currentIndex,
    isTransitioning,
    totalImages: images.length,
  };
}
