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

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const currentTrack = track;

    function handleWheel(event: WheelEvent) {
      if (!window.matchMedia("(min-width: 1024px)").matches) return;

      const maxScrollLeft = currentTrack.scrollWidth - currentTrack.clientWidth;
      if (
        maxScrollLeft <= 0 ||
        Math.abs(event.deltaY) < Math.abs(event.deltaX)
      ) {
        return;
      }

      const atStart = currentTrack.scrollLeft <= 0;
      const atEnd = currentTrack.scrollLeft >= maxScrollLeft - 2;
      const scrollingForward = event.deltaY > 0;

      if ((scrollingForward && !atEnd) || (!scrollingForward && !atStart)) {
        event.preventDefault();
        currentTrack.scrollLeft += event.deltaY;
      }
    }

    currentTrack.addEventListener("wheel", handleWheel, { passive: false });
    return () => currentTrack.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div
      ref={trackRef}
      className="campus-life-horizontal-track lg:overflow-x-auto lg:snap-x lg:snap-mandatory lg:scroll-smooth"
      tabIndex={0}
      aria-label="Campus life audience stories"
    >
      {children}
    </div>
  );
}
