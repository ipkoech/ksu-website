"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

type CampusLifeHorizontalScrollerProps = {
  children: ReactNode;
};

/** Maps ordinary page scrolling to a bounded horizontal story rail. */
export function CampusLifeHorizontalScroller({
  children,
}: CampusLifeHorizontalScrollerProps) {
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scene = sceneRef.current?.closest(
      ".campus-life-scroll-scene",
    ) as HTMLElement | null;
    const rail = railRef.current;
    const frame = sceneRef.current;
    if (!scene || !rail || !frame) return;

    let raf = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1024px)");

    const update = () => {
      raf = 0;
      if (!desktop.matches || reduceMotion.matches) {
        rail.style.transform = "translate3d(0,0,0)";
        scene.style.height = "";
        return;
      }

      const maxTranslate = Math.max(rail.scrollWidth - frame.clientWidth, 0);
      const stickyHeight = frame.clientHeight;
      const travel = Math.min(Math.max(Math.ceil(maxTranslate * 0.52), 1), 760);
      scene.style.height = `${stickyHeight + travel}px`;

      const top = scene.getBoundingClientRect().top + window.scrollY;
      const start = top - (parseFloat(getComputedStyle(frame).top) || 0);
      const progress = Math.min(
        Math.max((window.scrollY - start) / travel, 0),
        1,
      );
      rail.style.transform = `translate3d(${-progress * maxTranslate}px,0,0)`;
    };

    const requestUpdate = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(requestUpdate);
    observer.observe(frame);
    observer.observe(rail);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    desktop.addEventListener("change", requestUpdate);
    reduceMotion.addEventListener("change", requestUpdate);
    requestUpdate();

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      desktop.removeEventListener("change", requestUpdate);
      reduceMotion.removeEventListener("change", requestUpdate);
      scene.style.height = "";
      rail.style.transform = "";
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className="campus-life-sticky-frame lg:sticky lg:top-[var(--public-header-offset,96px)] lg:flex lg:min-h-[460px] lg:items-center"
    >
      <div className="campus-life-horizontal-track w-full overflow-hidden" aria-label="Life around studies stories">
        <div
          ref={railRef}
          className="campus-life-horizontal-rail flex w-max items-stretch gap-5 transition-transform duration-75 ease-linear will-change-transform motion-reduce:transform-none motion-reduce:transition-none"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
