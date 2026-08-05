"use client";

import Link from "next/link";
import { CalendarDays, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Reveal, RevealItem } from "../motion/reveal";
import type {
  EventSummary,
  NewsSummary,
  OpportunitySummary,
} from "../../lib/api";

type Insight =
  | (NewsSummary & { kind: "News" })
  | (EventSummary & { kind: "Events" })
  | (OpportunitySummary & { kind: "Opportunities" });

const filters = ["All", "News", "Events", "Opportunities"];

export function InsightsFeed({
  news,
  events,
  opportunities,
}: {
  news: NewsSummary[];
  events: EventSummary[];
  opportunities: OpportunitySummary[];
}) {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const insights = useMemo<Insight[]>(
    () => [
      ...news.map((item) => ({ ...item, kind: "News" as const })),
      ...events.map((item) => ({ ...item, kind: "Events" as const })),
      ...opportunities.map((item) => ({
        ...item,
        kind: "Opportunities" as const,
      })),
    ],
    [events, news, opportunities],
  );
  const visible = insights.filter((item) => {
    const matchesFilter = filter === "All" || item.kind === filter;
    const text =
      `${item.title} ${"excerpt" in item ? (item.excerpt ?? "") : item.summary}`.toLowerCase();
    return matchesFilter && text.includes(query.toLowerCase());
  });
  const featured = visible[0];

  return (
    <section className="mx-auto max-w-7xl px-6 py-14 lg:px-10">
      <div className="flex flex-col gap-5 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              aria-pressed={filter === item}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${filter === item ? "bg-heri-lime text-heri-ink" : "text-slate-600 hover:bg-white"}`}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200">
          <Search className="size-4 text-slate-400" />
          <span className="sr-only">Search news, events and opportunities</span>
          <input
            className="w-full min-w-52 bg-transparent text-sm outline-none"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search news, events, topics..."
            value={query}
          />
        </label>
      </div>
      {featured ? (
        <Reveal>
          <article className="mt-10 rounded-3xl bg-heri-cream/60 p-8 md:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-heri-teal">
              Featured {featured.kind === "Events" ? "event" : "story"}
            </p>
            <h2 className="mt-4 max-w-3xl text-3xl font-bold text-heri-blue md:text-4xl">
              {featured.title}
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              {"excerpt" in featured ? featured.excerpt : featured.summary}
            </p>
            <Link
              className="mt-6 inline-flex rounded-lg bg-heri-lime px-5 py-3 text-xs font-bold text-heri-ink"
              href={`/news-insights/${featured.slug}`}
            >
              READ FULL STORY <span className="ml-4">→</span>
            </Link>
          </article>
        </Reveal>
      ) : null}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.slice(featured ? 1 : 0).map((item, index) => (
          <RevealItem key={`${item.kind}-${item.id}`} index={index}>
            <article className="h-full rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-heri-teal">
                {item.kind}
              </p>
              <h3 className="mt-3 text-xl font-bold leading-tight text-heri-blue">
                {item.title}
              </h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                {"excerpt" in item ? item.excerpt : item.summary}
              </p>
              {item.kind === "Events" && (
                <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                  <CalendarDays className="size-4 text-heri-teal" />
                  {item.starts_at
                    ? new Date(item.starts_at).toLocaleDateString()
                    : "Date to be announced"}
                </p>
              )}
              {item.kind === "Opportunities" && (
                <p className="mt-4 text-xs font-semibold text-heri-teal">
                  {item.closing_at
                    ? `Closes ${new Date(item.closing_at).toLocaleDateString()}`
                    : "Open opportunity"}
                </p>
              )}
              <Link
                className="mt-5 inline-block text-xs font-bold uppercase text-heri-blue"
                href={`/news-insights/${item.slug}`}
              >
                Read more <span className="ml-2 text-heri-lime">→</span>
              </Link>
            </article>
          </RevealItem>
        ))}
      </div>
      {!visible.length && (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-600">
          No stories match your search.
        </p>
      )}
    </section>
  );
}
