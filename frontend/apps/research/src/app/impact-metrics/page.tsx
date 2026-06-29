import Link from "next/link";
import { ArrowRight, BarChart3, TrendingUp } from "lucide-react";
import { researchServiceApi } from "@ksu/api-client";

export const metadata = {
  title: "Impact Dashboard | KSU Research",
  description: "Research impact metrics, statistics, and performance indicators.",
};

export const revalidate = 300;

type StatItem = {
  key: string;
  label: string;
  value: number;
  description: string;
  href?: string | null;
};

function BarChart({ data, maxBars = 15 }: { data: StatItem[]; maxBars?: number }) {
  const display = data.slice(0, maxBars);
  const max = Math.max(1, ...display.map((d) => d.value));

  return (
    <div className="flex h-[160px] items-end gap-1.5">
      {display.map((d) => (
        <div key={d.key} className="group relative flex flex-1 flex-col items-center justify-end">
          <div className="mb-1 hidden whitespace-nowrap rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-white shadow group-hover:block">
            {d.value.toLocaleString()}
          </div>
          <div
            className="w-full rounded-t bg-primary/60 transition-[height] group-hover:bg-primary"
            style={{ height: `${Math.max(3, Math.round((d.value / max) * 100 * 0.85))}%` }}
          />
          <span className="mt-1 text-[9px] leading-none text-slate-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function MetricGrid({ stats, cols = 4 }: { stats: StatItem[]; cols?: number }) {
  const colClass = cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4";
  return (
    <div className={`grid gap-3 ${colClass}`}>
      {stats.map((stat) => {
        const content = (
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md">
            <p className="text-xs font-semibold uppercase text-slate-500">{stat.label}</p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold text-slate-950">{stat.value.toLocaleString()}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{stat.description}</p>
          </div>
        );
        return stat.href ? <Link key={stat.key} href={stat.href} className="block">{content}</Link> : <div key={stat.key}>{content}</div>;
      })}
    </div>
  );
}

export default async function ImpactDashboardPage() {
  let stats: StatItem[] = [];
  let error: string | null = null;

  try {
    const response = await researchServiceApi.stats();
    stats = (response as any).data?.stats ?? [];
  } catch {
    error = "Impact statistics are temporarily unavailable.";
  }

  const top = stats.filter((s) => ["research_centres", "research_projects", "publications", "open_access_publications"].includes(s.key));
  const remaining = stats.filter((s) => !["research_centres", "research_projects", "publications", "open_access_publications"].includes(s.key));

  return (
    <article className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:py-10">
      <p className="text-sm font-semibold uppercase text-secondary">Impact Dashboard</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight text-slate-950">Research at a glance</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">Key metrics from the research ecosystem. Data is updated from live records.</p>

      {error ? <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6"><p className="text-sm font-semibold text-amber-800">{error}</p></div> : null}

      {top.length > 0 ? <div className="mt-8"><MetricGrid stats={top} cols={4} /></div> : null}

      {remaining.length > 0 ? (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 aria-hidden className="h-5 w-5 text-primary" />
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">Performance by category</h2>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><BarChart data={remaining} /></div>
        </div>
      ) : null}

      {stats.length > 0 ? (
        <div className="mt-8">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp aria-hidden className="h-5 w-5 text-primary" />
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-slate-950">All indicators</h2>
          </div>
          <MetricGrid stats={stats} cols={3} />
        </div>
      ) : null}

      <div className="mt-12 rounded-[1.25rem] border border-blue-100 bg-blue-50/60 p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><BarChart3 aria-hidden className="h-5 w-5" /></span>
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Explore the records</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Browse projects, publications, and partners from the research portal.</p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-secondary">Browse projects <ArrowRight aria-hidden className="h-4 w-4" /></Link>
              <Link href="/search" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-secondary">Search records <ArrowRight aria-hidden className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
