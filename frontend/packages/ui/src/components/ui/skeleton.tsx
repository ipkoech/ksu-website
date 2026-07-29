"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}

export function SkeletonCard() {
  return (
    <div className="flex h-14 w-full items-center gap-4 rounded-lg border border-muted bg-muted/50 p-4 animate-pulse">
      <div className="h-9 w-9 shrink-0 rounded-md bg-muted"></div>
      <div className="flex-1 space-y-1">
        <div className="h-3 w-2/3 rounded bg-muted"></div>
        <div className="h-2 w-1/2 rounded bg-muted"></div>
      </div>
    </div>
  );
}

export function SkeletonSection({
  titleLines = 3,
  bodyLines = 4,
}: {
  titleLines?: number;
  bodyLines?: number;
}) {
  return (
    <div className="border-y border-muted px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto grid w-full max-w-[1680px] gap-8 xl:grid-cols-[260px_minmax(0,1fr)] xl:items-start">
        <div className="xl:sticky xl:top-28">
          <p className="text-sm font-semibold uppercase text-muted">
            Skeleton Eyebrow
          </p>
          <div className="mt-4 space-y-2">
            {Array.from({ length: titleLines }).map((_, i) => (
              <div key={i} className="h-8 w-full rounded bg-muted" />
            ))}
          </div>
          <div className="mt-5 space-y-2">
            {Array.from({ length: bodyLines }).map((_, i) => (
              <div key={i} className="h-4 w-3/4 rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="min-w-0 space-y-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}