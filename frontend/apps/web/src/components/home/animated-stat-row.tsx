"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Building2,
  GraduationCap,
  Landmark,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { HomeMetric } from "@/lib/homepage-data";

const factIcons = [Users, Landmark, Building2, BookOpen, GraduationCap] satisfies LucideIcon[];

function parseMetricValue(value: string) {
  const match = value.match(/^([\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return { numeric: null, suffix: "", text: value };

  return {
    numeric: Number(match[1].replace(/,/g, "")),
    suffix: match[2]?.trim() ?? "",
    text: value,
  };
}

function AnimatedValue({ value }: { value: string }) {
  const parsed = useMemo(() => parseMetricValue(value), [value]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (parsed.numeric === null || Number.isNaN(parsed.numeric)) return;

    let frame = 0;
    const duration = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(parsed.numeric * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [parsed.numeric]);

  if (parsed.numeric === null || Number.isNaN(parsed.numeric)) {
    return <>{parsed.text}</>;
  }

  return (
    <>
      {new Intl.NumberFormat("en-KE").format(current)}
      {parsed.suffix
        ? /^[+%]$/.test(parsed.suffix)
          ? parsed.suffix
          : ` ${parsed.suffix}`
        : null}
    </>
  );
}

export function AnimatedStatRow({ facts }: { facts: HomeMetric[] }) {
  return (
    <div className="-mx-4 grid grid-cols-2 gap-0 bg-primary text-white shadow-lg shadow-blue-100/70 sm:-mx-6 lg:-mx-8 lg:grid-cols-4 lg:divide-x lg:divide-white/24 xl:-mx-10 2xl:-mx-12">
      {facts.map((fact, index) => {
        const Icon = factIcons[index % factIcons.length];

        return (
          <div
            key={`${fact.label}-${fact.value}`}
            className="flex items-center justify-center gap-4 px-4 py-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center text-secondary">
              <Icon className="h-8 w-8 stroke-[1.8]" />
            </span>
            <span>
              <span className="block text-2xl font-bold leading-none text-white sm:text-3xl">
                <AnimatedValue value={fact.value} />
              </span>
              <span className="mt-1 block text-xs font-semibold leading-5 text-white/82">
                {fact.label}
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}
