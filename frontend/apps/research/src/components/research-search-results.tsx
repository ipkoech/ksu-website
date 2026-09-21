"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { ResearchSearchResult } from "../app/search/search-model";

export function ResearchSearchResults({ query, results, view }: { query: string; results: ResearchSearchResult[]; view: "grid" | "list" }) {
  return (
    <div data-server-data-display="research-search-results" className={view === "grid" ? "mt-5 grid gap-4 lg:grid-cols-2" : "mt-5 overflow-hidden rounded-lg border border-border bg-white"}>
      {results.map((result) => view === "grid" ? <GridCard key={`${result.groupKey}-${result.id}`} result={result} query={query} /> : <ListRow key={`${result.groupKey}-${result.id}`} result={result} query={query} />)}
    </div>
  );
}

function ListRow({ result, query }: { result: ResearchSearchResult; query: string }) {
  return <Link href={result.href} className="grid gap-4 border-b border-border p-4 transition last:border-b-0 hover:bg-primary/5 md:grid-cols-[170px_minmax(0,1fr)_auto]"><Thumb result={result} /><div className="min-w-0"><div className="flex flex-wrap gap-2"><Badge result={result} />{result.isOpenAccess ? <span className="rounded-md border border-success/30 bg-success/10 px-2 py-1 text-xs font-semibold text-success">Open access</span> : null}</div><h3 className="mt-2 font-display text-xl font-semibold leading-7 text-foreground">{result.title}</h3><Highlight query={query} text={result.description} className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground" /><Meta result={result} /></div><ArrowRight aria-hidden className="mt-2 h-5 w-5 text-primary" /></Link>;
}

function GridCard({ result, query }: { result: ResearchSearchResult; query: string }) {
  return <Link href={result.href} className="group overflow-hidden rounded-lg border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"><Thumb result={result} large /><div className="p-5"><div className="flex flex-wrap gap-2"><Badge result={result} />{result.isFeatured ? <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold text-white">Featured</span> : null}</div><h3 className="mt-3 font-display text-xl font-semibold leading-7 text-foreground">{result.title}</h3><Highlight query={query} text={result.description} className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground" /><Meta result={result} /></div></Link>;
}

function Thumb({ result, large = false }: { result: ResearchSearchResult; large?: boolean }) { return <div className={`relative overflow-hidden rounded-md bg-surface-muted ${large ? "aspect-[16/9]" : "min-h-28"}`}><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${result.image}")` }} /></div>; }
function Badge({ result }: { result: ResearchSearchResult }) { return <span className="rounded-md bg-primary px-2 py-1 text-xs font-semibold text-white">{result.label}</span>; }
function Meta({ result }: { result: ResearchSearchResult }) { return <div className="mt-4 flex flex-wrap gap-2">{result.date ? <MetaChip>{result.date}</MetaChip> : null}{result.chips.map((chip) => <MetaChip key={chip}>{chip}</MetaChip>)}</div>; }
function MetaChip({ children }: { children: string }) { return <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface-subtle px-2 py-1 text-xs font-medium text-muted-foreground"><Check aria-hidden className="h-3 w-3 text-primary" />{children}</span>; }
function Highlight({ query, text, className }: { query: string; text: string; className: string }) { return <p className={className}>{splitHighlight(text || "Details will appear when published.", query).map((fragment, index) => fragment.match ? <mark key={`${fragment.text}-${index}`} className="rounded bg-secondary/15 px-1 text-foreground">{fragment.text}</mark> : <span key={`${fragment.text}-${index}`}>{fragment.text}</span>)}</p>; }
function splitHighlight(text: string, query: string) { if (!query.trim()) return [{ text, match: false }]; const parts = text.split(new RegExp(`(${escapeRegExp(query.trim())})`, "ig")); return parts.map((part) => ({ text: part, match: part.toLowerCase() === query.trim().toLowerCase() })); }
function escapeRegExp(value: string) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
