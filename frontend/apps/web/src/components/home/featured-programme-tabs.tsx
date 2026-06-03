"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { PublicImage } from "@/components/public/public-image";
import type { HomeCard } from "@/lib/homepage-data";

const tabOrder = ["Postgraduate", "Undergraduate", "Diploma", "Certificate"];

function levelKey(value?: string | null) {
  const text = value?.toLowerCase() ?? "";
  if (text.includes("post")) return "Postgraduate";
  if (
    text.includes("under") ||
    text.includes("bachelor") ||
    text.includes("degree")
  )
    return "Undergraduate";
  if (text.includes("diploma")) return "Diploma";
  if (text.includes("cert")) return "Certificate";
  return "Undergraduate";
}

export function FeaturedProgrammeTabs({
  programmes,
}: {
  programmes: HomeCard[];
}) {
  const groups = useMemo(() => {
    const next = new Map<string, HomeCard[]>();
    for (const label of tabOrder) next.set(label, []);
    for (const programme of programmes) {
      const key = levelKey(programme.meta ?? programme.eyebrow);
      next.set(key, [...(next.get(key) ?? []), programme]);
    }
    return next;
  }, [programmes]);
  const availableTabs = tabOrder.filter(
    (label) => (groups.get(label)?.length ?? 0) > 0,
  );
  const [activeTab, setActiveTab] = useState(availableTabs[0] ?? tabOrder[0]);
  const activeProgrammes = groups.get(activeTab) ?? [];

  if (!programmes.length) {
    return null;
  }

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto rounded-md bg-blue-50 p-1">
        {(availableTabs.length ? availableTabs : tabOrder).map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveTab(label)}
            className={`min-h-8 shrink-0 rounded px-2.5 text-xs font-bold transition ${
              activeTab === label
                ? "bg-white text-primary shadow-sm"
                : "text-slate-600 hover:bg-white/70 hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 divide-y divide-blue-50 rounded-md border border-blue-50 bg-white">
        {(activeProgrammes.length ? activeProgrammes : programmes.slice(0, 4))
          .slice(0, 4)
          .map((programme) => (
            <Link
              key={programme.href}
              href={programme.href}
              className="group grid grid-cols-[36px_1fr_18px] items-center gap-3 p-2.5 transition hover:bg-blue-50/70"
            >
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded bg-blue-50 text-primary">
                <PublicImage
                  src={programme.imageUrl}
                  alt=""
                  ratio="profile"
                  fallbackSrc="/logos/ksu-bck1.jpg"
                  fallbackContent={<BookOpen className="h-4 w-4" aria-hidden />}
                  sizes="36px"
                  className="h-full w-full"
                />
              </span>
              <span className="min-w-0">
                <span className="line-clamp-1 text-xs font-bold text-slate-950 group-hover:text-primary">
                  {programme.title}
                </span>
                <span className="mt-0.5 block line-clamp-1 text-[11px] text-slate-500">
                  {programme.body || "Published academic programme"}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
      </div>
    </div>
  );
}
