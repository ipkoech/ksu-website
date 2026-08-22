"use client";

import { Printer, SlidersHorizontal } from "lucide-react";

export function PrintTimetableButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex min-h-12 items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-white/15"
    >
      Print timetable <Printer aria-hidden className="h-4 w-4" />
    </button>
  );
}

export function MobileTimetableFilterButton() {
  const openFilters = () => {
    const filters = document.getElementById("mobile-filters");
    if (filters instanceof HTMLDetailsElement) {
      filters.open = true;
      filters.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <button
      type="button"
      onClick={openFilters}
      className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-xs font-bold uppercase tracking-wide text-primary ring-1 ring-primary/20"
    >
      <SlidersHorizontal aria-hidden className="h-4 w-4" /> Filter
    </button>
  );
}
