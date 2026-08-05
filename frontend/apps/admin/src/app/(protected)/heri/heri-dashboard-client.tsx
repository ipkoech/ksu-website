"use client";

import { useEffect, useState } from "react";
import { getStoredAccessToken } from "@ksu/auth";

type Summary = { published_articles: number; drafts_awaiting_review: number; scheduled_content: number; upcoming_events: number; new_submissions: number; publications: number; active_projects: number; team_members: number; partners: number; social_failures: number };

const cards: Array<[keyof Summary, string]> = [["published_articles", "Published articles"], ["drafts_awaiting_review", "Awaiting review"], ["scheduled_content", "Scheduled content"], ["new_submissions", "New submissions"], ["publications", "Publications"], ["active_projects", "Active projects"], ["team_members", "Team members"], ["partners", "Partners"], ["social_failures", "Social failures"]];

export function HeriDashboardClient() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { const base = process.env.NEXT_PUBLIC_HERI_API_URL ?? "http://localhost:8003/api/v1/heri"; const token = getStoredAccessToken(); fetch(`${base}/admin/dashboard`, { credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {} }).then(async (response) => { if (!response.ok) throw new Error("Unable to load HERI dashboard"); return response.json() as Promise<Summary>; }).then(setData).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Unable to load HERI dashboard")); }, []);
  return <section aria-label="HERI dashboard metrics">{error && <p className="mb-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-800">{error}. Sign in with a HERI role to view live metrics.</p>}<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([key, label]) => <article className="rounded-2xl border border-slate-200 bg-white p-5" key={key}><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-900">{data ? data[key] : "—"}</p></article>)}</div></section>;
}
