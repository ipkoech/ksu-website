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
    <div className="-mx-4 border-b border-blue-100 bg-white px-4 py-4 shadow-sm shadow-blue-100/70 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 xl:-mx-10 xl:px-10 2xl:-mx-12 2xl:px-12">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((fact, index) => {
          const Icon = factIcons[index % factIcons.length];

          return (
            <div
              key={`${fact.label}-${fact.value}`}
              className="flex min-h-24 items-center gap-4 rounded-md border border-blue-100 bg-[linear-gradient(135deg,#ffffff_0%,#f0f7ff_100%)] px-4 py-4 shadow-sm shadow-blue-100/50"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-blue-50 text-secondary ring-1 ring-blue-100">
                <Icon className="h-6 w-6 stroke-[1.8]" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block font-[family-name:var(--font-display)] text-3xl font-bold leading-none text-primary">
                  <AnimatedValue value={fact.value} />
                </span>
                <span className="mt-2 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  {fact.label}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
