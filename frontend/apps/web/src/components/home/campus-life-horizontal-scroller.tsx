"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

type CampusLifeHorizontalScrollerProps = {
  children: ReactNode;
};

export function CampusLifeHorizontalScroller({
  children,
}: CampusLifeHorizontalScrollerProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    const rail = railRef.current;
    if (!track || !rail) return;
    const currentTrack = track;
    const currentRail = rail;
    let animationFrame = 0;
    const desktopQuery = window.matchMedia("(min-width: 1024px)");
    const reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    function updateHorizontalPosition() {
      animationFrame = 0;
      const section = currentTrack.closest(
        ".campus-life-scroll-scene",
      ) as HTMLElement | null;
      if (!section || !desktopQuery.matches || reduceMotionQuery.matches) {
        currentRail.style.transform = "translate3d(0px, 0, 0)";
        currentTrack.style.setProperty("--campus-progress", "0");
        section?.style.setProperty("--campus-progress", "0");
        if (section) section.style.minHeight = "";
        return;
      }

      const maxTranslate = Math.max(
        currentRail.scrollWidth - currentTrack.clientWidth,
        0,
      );
      const stickyFrame = currentTrack.closest(
        ".campus-life-sticky-frame",
      ) as HTMLElement | null;
      const stickyHeight = stickyFrame?.clientHeight ?? window.innerHeight;
      const stickyTop = stickyFrame
        ? parseFloat(window.getComputedStyle(stickyFrame).top) || 0
        : 0;
      // A 1:1 vertical-to-horizontal mapping creates a very long pinned
      // scene, especially on wide desktops. Compress the travel distance
      // while still allowing the rail to reach its final story.
      const scrollableDistance = Math.max(
        Math.min(Math.ceil(maxTranslate * 0.48), 640),
        1,
      );
      section.style.minHeight = `${Math.ceil(stickyHeight + scrollableDistance)}px`;

      const sectionTop =
        section.getBoundingClientRect().top + window.scrollY - stickyTop;
      const progress = Math.min(
        Math.max((window.scrollY - sectionTop) / scrollableDistance, 0),
        1,
      );
      const translateX = -progress * maxTranslate;

      currentRail.style.transform = `translate3d(${translateX}px, 0, 0)`;
      currentTrack.style.setProperty("--campus-progress", String(progress));
      section.style.setProperty("--campus-progress", String(progress));
    }

    function requestUpdate() {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateHorizontalPosition);
    }

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    desktopQuery.addEventListener("change", requestUpdate);
    reduceMotionQuery.addEventListener("change", requestUpdate);

    const resizeObserver = new ResizeObserver(requestUpdate);
    resizeObserver.observe(currentTrack);
    resizeObserver.observe(currentRail);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      desktopQuery.removeEventListener("change", requestUpdate);
      reduceMotionQuery.removeEventListener("change", requestUpdate);
      resizeObserver.disconnect();
      const section = currentTrack.closest(
        ".campus-life-scroll-scene",
      ) as HTMLElement | null;
      if (section) section.style.minHeight = "";
    };
  }, []);

  return (
    <div
      ref={trackRef}
      className="campus-life-horizontal-track overflow-visible lg:overflow-hidden"
      tabIndex={0}
      aria-label="Life around studies stories"
    >
      <div
        ref={railRef}
        className="campus-life-horizontal-rail transition-transform duration-75 ease-linear will-change-transform motion-reduce:transform-none motion-reduce:transition-none"
      >
        {children}
      </div>
    </div>
  );
}
