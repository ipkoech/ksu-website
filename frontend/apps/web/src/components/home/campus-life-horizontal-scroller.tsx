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

    function updateHorizontalPosition() {
      animationFrame = 0;
      const section = currentTrack.closest(".campus-life-scroll-scene");
      if (!section || !window.matchMedia("(min-width: 1024px)").matches) {
        currentRail.style.transform = "translate3d(0px, 0, 0)";
        return;
      }

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const scrollableDistance = Math.max(
        section.clientHeight - window.innerHeight,
        1,
      );
      const progress = Math.min(
        Math.max((window.scrollY - sectionTop) / scrollableDistance, 0),
        1,
      );
      const maxTranslate = Math.max(
        currentRail.scrollWidth - currentTrack.clientWidth,
        0,
      );
      const translateX = -progress * maxTranslate;

      currentRail.style.transform = `translate3d(${translateX}px, 0, 0)`;
    }

    function requestUpdate() {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateHorizontalPosition);
    }

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <div
      ref={trackRef}
      className="campus-life-horizontal-track overflow-visible lg:overflow-hidden"
      tabIndex={0}
      aria-label="Campus life audience stories"
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
