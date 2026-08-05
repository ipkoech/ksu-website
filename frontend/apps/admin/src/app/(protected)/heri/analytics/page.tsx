"use client";

import { useEffect, useState } from "react";
import { getStoredAccessToken } from "@ksu/auth";

type Report = { total_events: number; page_views: number; content_views: number; form_submissions: number; downloads: number; registrations: number; top_pages: Array<{ path: string; count: number }>; top_search_terms: Array<{ term: string; count: number }>; cta_conversions: Array<{ cta: string; count: number }> };
const API = process.env.NEXT_PUBLIC_HERI_API_URL ?? "http://localhost:8003/api/v1/heri";

export default function HeriAnalyticsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { const token = getStoredAccessToken(); fetch(`${API}/admin/analytics/report`, { credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(async (response) => { if (!response.ok) throw new Error("Unable to load analytics report"); return response.json() as Promise<Report>; }).then(setReport).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load analytics report")); }, []);
  const cards: Array<[keyof Report, string]> = [["total_events", "Total events"], ["page_views", "Page views"], ["content_views", "Content views"], ["form_submissions", "Form submissions"], ["downloads", "Downloads"], ["registrations", "Registrations"]];
  const lists: Array<[string, Array<{ path?: string; term?: string; cta?: string; count: number }>]> = [["Top pages", report?.top_pages ?? []], ["Search terms", report?.top_search_terms ?? []], ["CTA conversions", report?.cta_conversions ?? []]];
  return <main className="space-y-6 p-6 md:p-10"><header><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">HERI Africa administration</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">Analytics</h1><p className="mt-2 text-sm text-slate-600">Reporting from the HERI analytics event stream for the last 30 days.</p></header>{error && <p role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{error}</p>}<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([key, label]) => <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={key}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-900">{report ? String(report[key]) : "—"}</p></article>)}</div><div className="grid gap-6 lg:grid-cols-3">{lists.map(([title, rows]) => <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={title}><h2 className="font-semibold text-slate-900">{title}</h2><ul className="mt-4 space-y-3 text-sm">{rows.length ? rows.map((row) => <li className="flex justify-between gap-3 border-b border-slate-100 pb-2" key={`${row.path ?? row.term ?? row.cta}`}><span className="truncate text-slate-600">{row.path ?? row.term ?? row.cta}</span><strong>{row.count}</strong></li>) : <li className="text-slate-500">No activity recorded.</li>}</ul></section>)}</div></main>;
}
