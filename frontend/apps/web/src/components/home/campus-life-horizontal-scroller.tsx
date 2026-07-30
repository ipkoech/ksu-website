"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

type CampusLifeHorizontalScrollerProps = {
  children: ReactNode;
};

/**
 * A bounded horizontal story rail. Wheel input advances the rail while the
 * pointer is over it, but the rail never changes the document's height.
 */
export function CampusLifeHorizontalScroller({
  children,
}: CampusLifeHorizontalScrollerProps) {
  const railRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      if (maxScroll <= 0) return;

      const next = Math.min(
        Math.max(rail.scrollLeft + event.deltaY, 0),
        maxScroll,
      );
      if (next === rail.scrollLeft) return;
      event.preventDefault();
      rail.scrollLeft = next;
    };

    rail.addEventListener("wheel", onWheel, { passive: false });
    return () => rail.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div
      ref={railRef}
      className="campus-life-horizontal-track overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-color:hsl(var(--primary)/.35)_transparent] [scrollbar-width:thin]"
      tabIndex={0}
      aria-label="Life around studies stories"
    >
      {children}
    </div>
  );
}
