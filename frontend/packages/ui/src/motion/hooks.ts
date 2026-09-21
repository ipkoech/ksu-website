"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
  const hasStarted = useRef(false);
  const currentCount = useRef(0);
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (reducedMotion || duration <= 0 || !Number.isFinite(duration)) {
      currentCount.current = end;
      setCount(end);
      return;
    }
    if (startOnView && !isInView && !hasStarted.current) return;
    hasStarted.current = true;
    const from = currentCount.current;
    if (from === end) return;
    const wait = Number.isFinite(delay) ? Math.max(0, delay) : 0;
    const startTime = Date.now() + wait;
    let frame: number | undefined;
    let delayTimer: ReturnType<typeof setTimeout> | undefined;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.max(0, Math.min(elapsed / duration, 1));
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = progress === 1 ? end : Math.floor(from + easeOut * (end - from));

      currentCount.current = current;
      setCount(current);

      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    if (wait > 0) {
      delayTimer = setTimeout(() => { frame = requestAnimationFrame(animate); }, wait);
    } else {
      frame = requestAnimationFrame(animate);
    }
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      if (delayTimer !== undefined) clearTimeout(delayTimer);
    };
  }, [end, duration, delay, startOnView, isInView, reducedMotion]);

  return { ref, count, isInView };
}

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => {
      setReducedMotion(mediaQuery.matches || document.documentElement.getAttribute("data-a11y-reduce-motion") === "true");
    };
    handler();
    const observer = new MutationObserver(handler);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-a11y-reduce-motion"] });
    mediaQuery.addEventListener("change", handler);
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handler);
    };
  }, []);

  return reducedMotion;
}

export function useImageRotation(
  images: string[],
  interval: number = timing.crossfade
) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    setIsTransitioning(false);
    if (images.length <= 1 || reducedMotion) return;
    let transitionTimer: ReturnType<typeof setTimeout> | undefined;

    const timer = setInterval(() => {
      if (transitionTimer !== undefined) return;
      setIsTransitioning(true);
      transitionTimer = setTimeout(() => {
        transitionTimer = undefined;
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsTransitioning(false);
      }, timing.slow);
    }, interval);

    return () => {
      clearInterval(timer);
      if (transitionTimer !== undefined) clearTimeout(transitionTimer);
    };
  }, [images.length, interval, reducedMotion]);

  const safeIndex = images.length ? currentIndex % images.length : 0;
  return {
    currentImage: images[safeIndex],
    currentIndex: safeIndex,
    isTransitioning,
    totalImages: images.length,
  };
}
