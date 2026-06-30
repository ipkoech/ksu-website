"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ActiveElement,
  type ChartData,
  type ChartEvent,
  type ChartOptions,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FlaskConical,
  HandCoins,
  Leaf,
  Newspaper,
  Plus,
  ScrollText,
} from "lucide-react";
import {
  auditLogsApi,
  researchServiceApi,
  type ResearchAnalyticsAttentionItem,
  type ResearchAnalyticsChart,
  type ResearchAnalyticsKpi,
  type ResearchAnalyticsPoint,
} from "@ksu/api-client";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  StatsCard,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib";
import { PageHeader } from "@/components/layout";
import { getPortalConfig } from "@/lib/portals/registry";
import {
  ResearchFirstLoginTour,
  ResearchSectionGuide,
} from "./_components/research-guidance";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
);

const quickActions = [
  { label: "Projects", href: "/research/projects", icon: Plus },
  { label: "Grants", href: "/research/grants", icon: Plus },
  { label: "Research news", href: "/research/content/news", icon: Newspaper },
  { label: "Research events", href: "/research/content/events", icon: CalendarDays },
];

const researchFrontendHref = process.env.NEXT_PUBLIC_RESEARCH_FRONTEND_URL || "/research";

const ACTION_LABELS: Record<string, string> = {
  create: "created",
  update: "updated",
  delete: "deleted",
  publish: "published",
  unpublish: "unpublished",
  login: "signed in",
  logout: "signed out",
  view: "viewed",
  approve: "approved",
  reject: "rejected",
};

const ZONES: Array<{
  key:
    | "portfolio_health"
    | "funding_pipeline"
    | "outputs_publications"
    | "partnerships_sustainability"
    | "applications_reviews"
    | "admin_activity";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: "portfolio_health",
    title: "Portfolio health",
    description: "Project status, ownership, type mix, and delivery progress.",
    icon: FlaskConical,
  },
  {
    key: "funding_pipeline",
    title: "Funding pipeline",
    description: "Grant status, applications, categories, and funding value.",
    icon: HandCoins,
  },
  {
    key: "outputs_publications",
    title: "Outputs & publications",
    description: "Publications, access coverage, outputs, innovations, and stories.",
    icon: ScrollText,
  },
  {
    key: "partnerships_sustainability",
    title: "Partnerships & sustainability",
    description: "Partner mix, partner status, sustainability, and impact categories.",
    icon: Leaf,
  },
  {
    key: "applications_reviews",
    title: "Applications & reviews",
    description: "Grant, scholarship, and mentorship review queues.",
    icon: CheckCircle2,
  },
  {
    key: "admin_activity",
    title: "Admin activity",
    description: "Research service audit action mix and operational health.",
    icon: BarChart3,
  },
];

function formatAuditAction(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function formatAuditTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function ResearchDashboardClient() {
  const portal = getPortalConfig("research");
  const dashboardStats = portal?.dashboard.stats.filter((s) => !s.scopes?.length);

  const analytics = useQuery({
    queryKey: ["research", "dashboard-analytics"],
    queryFn: () => researchServiceApi.dashboardAnalytics(),
  });

  const auditLogs = useQuery({
    queryKey: ["research", "recent-activity"],
    queryFn: () =>
      auditLogsApi.list({
        service_name: "research",
        per_page: 10,
        sort_by: "created_at",
        sort_order: "desc",
      }),
  });

  const data = analytics.data?.data;
  const recentItems = (auditLogs.data?.data ?? []).slice(0, 8);

  return (
    <div>
      <PageHeader
        title="Research Office Dashboard"
        description="Dense operational analytics for portfolio health, funding, outputs, partnerships, reviews, and admin activity."
        primaryAction={{ label: "Projects", href: "/research/projects" }}
        secondaryActions={[
          { label: "View public portal", href: researchFrontendHref, variant: "outline" as const },
        ]}
      />

      <div className="space-y-6 p-6">
        <ResearchFirstLoginTour />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats?.map((stat) => (
            <PortalStatCard key={stat.title} stat={stat} />
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            <KpiStrip kpis={data?.kpis} loading={analytics.isLoading} />
            <AttentionStrip items={data?.attention} loading={analytics.isLoading} />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button key={action.href} variant="outline" size="sm" className="justify-start" asChild>
                      <Link href={action.href}>
                        <Icon className="mr-2 size-4" />
                        {action.label}
                      </Link>
                    </Button>
                  );
                })}
              </CardContent>
            </Card>

            {ZONES.map((zone) => (
              <AnalyticsZone
                key={zone.key}
                title={zone.title}
                description={zone.description}
                icon={zone.icon}
                charts={data?.[zone.key]}
                loading={analytics.isLoading}
              />
            ))}
          </div>

          <div className="flex min-w-0 flex-col gap-6">
            <ResearchSectionGuide title="Research Dashboard" />

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Public research portal</CardTitle>
                <CardDescription>
                  Manage what visitors see on the research website.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full justify-between" asChild>
                  <Link href={researchFrontendHref} target="_blank" rel="noopener noreferrer">
                    Visit research site
                    <ExternalLink className="size-3" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <RecentActivity loading={auditLogs.isLoading} items={recentItems} />
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiStrip({ kpis, loading }: { kpis?: ResearchAnalyticsKpi[]; loading: boolean }) {
  return (
    <div className="grid gap-3 md:grid-cols-3 2xl:grid-cols-6">
      {loading
        ? Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-28 rounded-lg border bg-background" />
          ))
        : (kpis ?? []).map((item) => (
          <Link
            key={item.key}
            href={item.href ?? "/research"}
            className="rounded-lg border bg-background p-4 transition-colors hover:bg-muted/40"
          >
            <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              {formatMetric(item.value, item.suffix)}
            </p>
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.description}</p>
          </Link>
        ))}
    </div>
  );
}

function AttentionStrip({ items, loading }: { items?: ResearchAnalyticsAttentionItem[]; loading: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-4 text-amber-600" />
          <CardTitle className="text-base">Attention needed</CardTitle>
        </div>
        <CardDescription>Operational queues and data-quality risks to review first.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-2 md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-20 rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-5">
            {(items ?? []).map((item) => (
              <Link
                key={item.key}
                href={item.href ?? "/research"}
                className={cn(
                  "rounded-lg border p-3 transition-colors hover:bg-muted/40",
                  item.severity === "danger" && "border-red-200 bg-red-50/70 text-red-950",
                  item.severity === "warning" && "border-amber-200 bg-amber-50/70 text-amber-950",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-lg font-semibold">{formatMetric(item.value)}</p>
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 opacity-75">{item.description}</p>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AnalyticsZone({
  title,
  description,
  icon: Icon,
  charts,
  loading,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  charts?: ResearchAnalyticsChart[];
  loading: boolean;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
            <Icon className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="truncate text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <ChartSkeleton key={index} />)
          : (charts ?? []).map((chart) => <AnalyticsChartCard key={chart.key} chart={chart} />)}
      </div>
    </section>
  );
}

function AnalyticsChartCard({ chart }: { chart: ResearchAnalyticsChart }) {
  return (
    <Card className="min-h-[380px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{chart.title}</CardTitle>
        {chart.description ? <CardDescription>{chart.description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <ChartRenderer chart={chart} />
      </CardContent>
    </Card>
  );
}

function ChartRenderer({ chart }: { chart: ResearchAnalyticsChart }) {
  if (!chart.data.length) {
    return <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No data available</div>;
  }
  if (chart.chart_type === "donut") return <DoughnutAnalyticsChart chart={chart} />;
  if (chart.chart_type === "line" || shouldRenderAsLineChart(chart)) return <LineAnalyticsChart chart={chart} />;
  if (chart.chart_type === "stacked") return <StackedBarAnalyticsChart chart={chart} />;
  return <BarAnalyticsChart chart={chart} />;
}

function shouldRenderAsLineChart(chart: ResearchAnalyticsChart) {
  return ["project_progress", "funding_value", "audit_actions"].includes(chart.key);
}

function BarAnalyticsChart({ chart }: { chart: ResearchAnalyticsChart }) {
  const data: ChartData<"bar"> = {
    labels: chart.data.map((item) => item.label),
    datasets: [
      {
        label: chart.title,
        data: chart.data.map((item) => Number(item.value || 0)),
        backgroundColor: chart.data.map((_, index) => chartStroke(index, 0.78)),
        borderColor: chart.data.map((_, index) => chartStroke(index)),
        borderRadius: 6,
        borderWidth: 1,
        maxBarThickness: 34,
      },
    ],
  };

  return (
    <ChartPanel chart={chart}>
      <Bar data={data} options={buildChartOptions("bar", chart)} />
    </ChartPanel>
  );
}

function StackedBarAnalyticsChart({ chart }: { chart: ResearchAnalyticsChart }) {
  const hasSecondary = chart.data.some((item) => Number(item.secondary_value || 0) > 0);
  const data: ChartData<"bar"> = {
    labels: chart.data.map((item) => item.label),
    datasets: [
      {
        label: "Primary",
        data: chart.data.map((item) => Number(item.value || 0)),
        backgroundColor: chartStroke(0, 0.78),
        borderColor: chartStroke(0),
        borderRadius: 6,
        borderWidth: 1,
        maxBarThickness: 34,
      },
      ...(hasSecondary
        ? [
            {
              label: "Secondary",
              data: chart.data.map((item) => Number(item.secondary_value || 0)),
              backgroundColor: chartStroke(1, 0.78),
              borderColor: chartStroke(1),
              borderRadius: 6,
              borderWidth: 1,
              maxBarThickness: 34,
            },
          ]
        : []),
    ],
  };

  return (
    <ChartPanel chart={chart}>
      <Bar data={data} options={buildChartOptions("bar", chart, { stacked: true })} />
    </ChartPanel>
  );
}

function LineAnalyticsChart({ chart }: { chart: ResearchAnalyticsChart }) {
  const data: ChartData<"line"> = {
    labels: chart.data.map((item) => item.label),
    datasets: [
      {
        label: chart.title,
        data: chart.data.map((item) => Number(item.value || 0)),
        backgroundColor: chartStroke(0, 0.16),
        borderColor: chartStroke(0),
        borderWidth: 2,
        fill: true,
        pointBackgroundColor: chart.data.map((_, index) => chartStroke(index)),
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.35,
      },
    ],
  };

  return (
    <ChartPanel chart={chart}>
      <Line data={data} options={buildChartOptions("line", chart)} />
    </ChartPanel>
  );
}

function DoughnutAnalyticsChart({ chart }: { chart: ResearchAnalyticsChart }) {
  const data: ChartData<"doughnut"> = {
    labels: chart.data.map((item) => item.label),
    datasets: [
      {
        label: chart.title,
        data: chart.data.map((item) => Number(item.value || 0)),
        backgroundColor: chart.data.map((_, index) => chartStroke(index, 0.78)),
        borderColor: "hsl(var(--background))",
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  return (
    <ChartPanel chart={chart} compact>
      <Doughnut data={data} options={buildChartOptions("doughnut", chart)} />
    </ChartPanel>
  );
}

function ChartPanel({
  chart,
  children,
  compact = false,
}: {
  chart: ResearchAnalyticsChart;
  children: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className={cn("relative h-64", compact && "mx-auto max-w-[280px]")}>
        {children}
      </div>
      <ChartLegend data={chart.data} />
    </div>
  );
}

function ChartLegend({ data }: { data: ResearchAnalyticsPoint[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {data.map((item, index) => (
        <Link
          key={item.key}
          href={item.href ?? "#"}
          className="flex items-center justify-between gap-3 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/40"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="size-2 shrink-0 rounded-full" style={{ background: chartStroke(index) }} />
            <span className="truncate">{item.label}</span>
          </span>
          <span className="shrink-0 font-semibold">{formatMetric(item.value, item.suffix)}</span>
        </Link>
      ))}
    </div>
  );
}

function buildChartOptions<TType extends "bar" | "line" | "doughnut">(
  type: TType,
  chart: ResearchAnalyticsChart,
  options: { stacked?: boolean } = {},
): ChartOptions<TType> {
  const base = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 350,
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
    onClick: (_event: ChartEvent, elements: ActiveElement[]) => {
      const index = elements[0]?.index;
      const href = typeof index === "number" ? chart.data[index]?.href : undefined;
      if (href) {
        window.location.assign(href);
      }
    },
    plugins: {
      legend: {
        display: type !== "doughnut" && options.stacked === true,
        position: "bottom" as const,
        labels: {
          boxWidth: 10,
          boxHeight: 10,
          color: "hsl(var(--muted-foreground))",
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "hsl(var(--popover))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
        bodyColor: "hsl(var(--popover-foreground))",
        displayColors: true,
        padding: 12,
        titleColor: "hsl(var(--foreground))",
        callbacks: {
          label: (context: any) => {
            const point = chart.data[context.dataIndex];
            const value = Number(context.parsed?.y ?? context.parsed?.x ?? context.raw ?? 0);
            return `${context.dataset.label}: ${formatMetric(value, point?.suffix)}`;
          },
          afterLabel: (context: any) => chart.data[context.dataIndex]?.description ?? "",
        },
      },
    },
  };

  if (type === "doughnut") {
    return {
      ...base,
      cutout: "62%",
      interaction: {
        intersect: true,
      },
      plugins: {
        ...base.plugins,
        legend: {
          ...base.plugins.legend,
          display: false,
        },
      },
    } as unknown as ChartOptions<TType>;
  }

  return {
    ...base,
    scales: {
      x: {
        stacked: options.stacked,
        grid: {
          color: "hsl(var(--border) / 0.45)",
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
          maxRotation: 0,
          autoSkip: true,
        },
      },
      y: {
        beginAtZero: true,
        stacked: options.stacked,
        grid: {
          color: "hsl(var(--border) / 0.45)",
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
          precision: 0,
        },
      },
    },
  } as unknown as ChartOptions<TType>;
}

function RecentActivity({ loading, items }: { loading: boolean; items: any[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent activity</CardTitle>
        <CardDescription>Latest admin actions across the research portal.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border bg-background p-3">
                <div className="size-2 shrink-0 rounded-full bg-muted-foreground/20" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <div className="space-y-1">
            {items.map((log) => (
              <div key={log.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/50">
                <div className="size-2 shrink-0 rounded-full bg-primary/60" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-medium capitalize">{formatAuditAction(log.action)}</span>{" "}
                    {log.entity_type ? (
                      <span className="text-muted-foreground">
                        {log.entity_type.replace(/_/g, " ")}
                        {log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ""}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatAuditTime(log.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ChartSkeleton() {
  return (
    <Card className="min-h-[290px]">
      <CardHeader>
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="h-3 w-56 rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="h-3 w-32 rounded bg-muted" />
            <div className="h-2 rounded bg-muted" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function PortalStatCard({
  stat,
}: {
  stat: NonNullable<ReturnType<typeof getPortalConfig>>["dashboard"]["stats"][number];
}) {
  const query = useQuery({
    queryKey: stat.queryKey,
    queryFn: stat.query,
  });
  const Icon = stat.icon;

  return (
    <StatsCard
      title={stat.title}
      value={
        (query.data as any)?.data?.stats?.[0]?.value?.toLocaleString() ??
        (query.data as any)?.meta?.total?.toLocaleString() ??
        "--"
      }
      icon={<Icon className="size-4 text-muted-foreground" />}
      href={stat.href}
    />
  );
}

function formatMetric(value: number, suffix = "") {
  const numeric = Number(value || 0);
  const formatted = Math.abs(numeric) >= 1_000_000
    ? `${(numeric / 1_000_000).toFixed(1)}M`
    : Math.abs(numeric) >= 1_000
      ? `${(numeric / 1_000).toFixed(1)}K`
      : numeric.toLocaleString();
  return suffix ? `${formatted} ${suffix}` : formatted;
}

function chartStroke(index: number, alpha = 1) {
  const [r, g, b] = [
    [37, 99, 235],
    [5, 150, 105],
    [245, 158, 11],
    [244, 63, 94],
    [124, 58, 237],
    [8, 145, 178],
    [100, 116, 139],
    [101, 163, 13],
  ][index % 8];
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
