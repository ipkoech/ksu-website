"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getStoredAccessToken } from "@ksu/auth";
import { Activity, AlertTriangle, BarChart3, CheckCircle2, Clock3, FileText, Image as ImageIcon, Loader2, RefreshCw, Send, Users } from "lucide-react";
import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { SchoolMetricGrid, SchoolWorkspace, SchoolWorkspaceHeader } from "@/components/schools/shared/school-workspace";

type Summary = { published_articles: number; drafts_awaiting_review: number; scheduled_content: number; upcoming_events: number; new_submissions: number; publications: number; active_projects: number; team_members: number; partners: number; social_failures: number; total_articles: number; total_pages: number; published_pages: number; research_themes: number; featured_projects: number; upcoming_opportunities: number; media_assets: number; media_missing_alt_text: number; visible_page_sections: number; submissions_in_progress: number };
const API = process.env.NEXT_PUBLIC_HERI_API_URL ?? "http://localhost:8003/api/v1/heri";
const formatNumber = (value: number) => new Intl.NumberFormat("en-KE").format(value);

export function HeriDashboardClient() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = getStoredAccessToken();
      const response = await fetch(`${API}/admin/dashboard`, { credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (!response.ok) throw new Error("Unable to load live dashboard data");
      setData(await response.json() as Summary); setError(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load dashboard"); }
    finally { setRefreshing(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const total = useMemo(() => data ? data.published_articles + data.drafts_awaiting_review + data.scheduled_content : 0, [data]);
  const liveRate = total ? Math.round(((data?.published_articles ?? 0) / total) * 100) : 0;
  if (error && !data) return <SchoolWorkspace><Alert variant="destructive"><AlertDescription className="flex items-center justify-between gap-4"><span><strong>Dashboard data unavailable.</strong> {error}</span><Button variant="outline" size="sm" onClick={() => void load()}>Retry</Button></AlertDescription></Alert></SchoolWorkspace>;
  const actions: Array<[string, typeof Send, string, number | undefined]> = [["/heri/submissions", Send, "New submissions", data?.new_submissions], ["/heri/events", Clock3, "Upcoming events", data?.upcoming_events], ["/heri/content", CheckCircle2, "Awaiting review", data?.drafts_awaiting_review]];
  return (
    <SchoolWorkspace>
      <SchoolWorkspaceHeader eyebrow="HERI Africa administration" title="Research chair dashboard" description="Monitor research communication, publishing momentum, and priority actions from one institutional workspace." icon={BarChart3} actions={<Button variant="outline" onClick={() => void load()} disabled={refreshing}>{refreshing ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}Refresh data</Button>} />
      <SchoolMetricGrid items={[{ label: "Published stories", value: data ? formatNumber(data.published_articles) : "—", detail: "Live on the public platform", icon: FileText, tone: "success" }, { label: "Research outputs", value: data ? formatNumber(data.publications) : "—", detail: "Published publications", icon: BarChart3, tone: "info" }, { label: "Active projects", value: data ? formatNumber(data.active_projects) : "—", detail: "Visible research projects", icon: Activity, tone: "primary" }, { label: "Research team", value: data ? formatNumber(data.team_members) : "—", detail: "Active profiles", icon: Users, tone: "warning" }]} />
      <SchoolMetricGrid items={[{ label: "Published pages", value: data ? formatNumber(data.published_pages) : "—", detail: `${data?.total_pages ?? "—"} total pages`, icon: FileText, tone: "primary" }, { label: "Research themes", value: data ? formatNumber(data.research_themes) : "—", detail: "Published areas of focus", icon: BarChart3, tone: "info" }, { label: "Open opportunities", value: data ? formatNumber(data.upcoming_opportunities) : "—", detail: "Available to applicants", icon: CheckCircle2, tone: "success" }, { label: "Media assets", value: data ? formatNumber(data.media_assets) : "—", detail: data ? `${formatNumber(data.media_missing_alt_text)} missing alt text` : "Accessibility status", icon: ImageIcon, tone: "warning" }]} />
      <div className="grid gap-4 lg:grid-cols-[1.25fr_.95fr]">
        <Card><CardHeader className="pb-3"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Editorial pipeline</p><CardTitle className="mt-1 text-lg">Publishing health</CardTitle></div><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700">{liveRate}% live</span></div></CardHeader><CardContent><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${liveRate}%` }} /></div><div className="mt-5 grid grid-cols-3 gap-3 text-center">{[[data?.published_articles, "Published"], [data?.drafts_awaiting_review, "In review"], [data?.scheduled_content, "Scheduled"]].map(([value, label]) => <div key={String(label)}><p className="text-xl font-semibold">{value == null ? "—" : formatNumber(Number(value))}</p><p className="text-xs text-muted-foreground">{label}</p></div>)}</div></CardContent></Card>
        <Card><CardHeader className="pb-3"><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action centre</p><CardTitle className="mt-1 text-lg">What needs attention</CardTitle></CardHeader><CardContent className="space-y-2">{actions.map(([href, Icon, label, value]) => <Link href={href} key={label} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5 text-sm transition-colors hover:bg-muted"><span className="flex items-center gap-2"><Icon className="size-4 text-primary" />{label}</span><strong>{value == null ? "—" : formatNumber(value)}</strong></Link>)}{data?.social_failures ? <Link href="/heri/settings" className="flex items-center justify-between rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"><span className="flex items-center gap-2"><AlertTriangle className="size-4" />Social failures</span><strong>{formatNumber(data.social_failures)}</strong></Link> : null}</CardContent></Card>
      </div>
      {error ? <p className="text-xs text-amber-700">{error}</p> : null}
    </SchoolWorkspace>
  );
}
