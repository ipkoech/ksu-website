"use client";

import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  FileText,
  GraduationCap,
  Megaphone,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { ScrollReveal } from "@ksu/ui/components";

export type SearchResultDto = {
  kind: "news" | "blogs" | "programmes" | "schools" | "departments" | "events" | "persons" | "announcements";
  label: string;
  title: string;
  excerpt: string;
  href: string;
};

type SearchResultsProps = {
  query: string;
  status: "idle" | "available" | "unavailable";
  results: SearchResultDto[];
};

const icons: Record<SearchResultDto["kind"], LucideIcon> = {
  news: Megaphone,
  blogs: FileText,
  programmes: GraduationCap,
  schools: GraduationCap,
  departments: Building2,
  events: CalendarDays,
  persons: UserRound,
  announcements: Megaphone,
};

function searchHref(query: string) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  const search = params.toString();
  return search ? `/search?${search}` : "/search";
}

function ResultRow({ item }: { item: SearchResultDto }) {
  const Icon = icons[item.kind];

  return (
    <Link
      href={item.href}
      className="group grid gap-4 rounded-lg border border-border bg-white p-4 transition hover:border-primary/30 hover:shadow-[0_16px_45px_-34px_rgba(15,23,42,0.55)] sm:grid-cols-[48px_minmax(0,1fr)_24px]"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/10">
        <Icon aria-hidden className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="text-xs font-semibold uppercase text-secondary">{item.label}</span>
        <span className="mt-1 block text-lg font-semibold leading-6 text-foreground">{item.title}</span>
        <span className="mt-2 block text-sm leading-6 text-muted-foreground">{item.excerpt}</span>
      </span>
      <span className="hidden items-center justify-center text-muted-foreground/70 transition group-hover:translate-x-0.5 group-hover:text-primary sm:flex">
        <ArrowRight aria-hidden className="h-5 w-5" />
      </span>
    </Link>
  );
}

export function SearchResults({ query, status, results }: SearchResultsProps) {
  const resultCount = results.length;

  return (
    <ScrollReveal
      as="section"
      className="bg-white px-4 py-7 sm:px-6 lg:px-8 lg:py-9"
      data-server-data-display="web-search-results"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-secondary">Search Results</p>
            <h2 className="mt-1 text-2xl font-semibold text-foreground">{query ? `Results for "${query}"` : "Start with a search"}</h2>
          </div>
          {query.length >= 2 ? <p className="text-sm font-medium text-muted-foreground">{resultCount} {resultCount === 1 ? "result" : "results"}</p> : null}
        </div>

        {query.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface-subtle p-5">
            <div className="flex gap-3">
              <Search aria-hidden className="h-8 w-8 text-primary" />
              <div>
                <p className="text-base font-semibold text-foreground">Start typing above to search.</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">Try a school name, programme, department, person, event, or public notice.</p>
              </div>
            </div>
          </div>
        ) : query.length < 2 ? (
          <div className="rounded-lg border border-border bg-surface-subtle p-5 text-sm font-medium text-muted-foreground">Search terms must include at least two characters.</div>
        ) : status === "unavailable" ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5" role="status">
            <p className="text-base font-semibold text-amber-950">Search is temporarily unavailable.</p>
            <p className="mt-1 text-sm leading-6 text-amber-900">Live search records could not be loaded. Try again shortly, or use the main navigation and contact page.</p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link href={searchHref(query)} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-950 transition hover:bg-amber-100">Retry search</Link>
              <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-950 transition hover:bg-amber-100">Contact support</Link>
            </div>
          </div>
        ) : results.length ? (
          <div className="space-y-3">
            {results.map((item) => <ResultRow key={`${item.kind}-${item.href}-${item.title}`} item={item} />)}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface-subtle p-5">
            <p className="text-base font-semibold text-foreground">No results found.</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Check spelling or try a broader term such as admissions, agriculture, school, news, or research.</p>
          </div>
        )}
      </div>
    </ScrollReveal>
  );
}
