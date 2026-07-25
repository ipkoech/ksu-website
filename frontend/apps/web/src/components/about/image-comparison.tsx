"use client";

import Image from "next/image";
import { ChevronsLeftRight } from "lucide-react";
import { useState } from "react";

export function ImageComparison({
  before,
  after,
  beforeAlt,
  afterAlt,
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
}) {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative min-h-[280px] overflow-hidden bg-brand-overlay">
      <Image
        src={after}
        alt={afterAlt}
        fill
        sizes="(min-width:1024px) 65vw, 100vw"
        className="object-cover"
      />
      <Image
        src={before}
        alt={beforeAlt}
        fill
        sizes="(min-width:1024px) 65vw, 100vw"
        className="object-cover grayscale"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      />
      <div
        aria-hidden
        className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,.2)]"
        style={{ left: `${position}%` }}
      >
        <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-xl">
          <ChevronsLeftRight className="h-5 w-5" />
        </span>
      </div>
      <span className="absolute bottom-5 left-5 rounded-full bg-brand-overlay/75 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">Then</span>
      <span className="absolute bottom-5 right-5 rounded-full bg-primary/85 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white">Now</span>
      <label className="sr-only" htmlFor="campus-comparison">Compare the historic and modern Kisii University campus images</label>
      <input
        id="campus-comparison"
        type="range"
        min="5"
        max="95"
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        aria-valuetext={`${position}% historic campus, ${100 - position}% modern campus`}
      />
    </div>
  );
}
