"use client";

import { useMemo, useState } from "react";
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
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  AlertTriangle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  CircleGauge,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  ImageIcon,
  Lightbulb,
  Megaphone,
  Newspaper,
  Printer,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  statsApi,
  type CorporateDashboardMetric,
  type CorporateDashboardParams,
  type CorporateDashboardResponse,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  StatusBadge,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib";
import { PageHeader } from "@/components/layout";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
);

const palette = {
  navy: "#17365d",
  blue: "#2563eb",
  sky: "#60a5fa",
  cyan: "#0891b2",
  emerald: "#059669",
  amber: "#d97706",
  rose: "#e11d48",
  violet: "#7c3aed",
  slate: "#64748b",
  pale: "#cbd5e1",
};

const contentOptions = [
  { value: "all", label: "All content" },
  { value: "news", label: "News" },
  { value: "press-releases", label: "Press releases" },
  { value: "notices", label: "Public notices" },
  { value: "events", label: "Events" },
  { value: "club-events", label: "Club events" },
  { value: "club-media", label: "Club media" },
  { value: "page-sections", label: "Page sections" },
  { value: "partnership-spotlights", label: "Partnership spotlights" },
  { value: "sliders", label: "Slider items" },
];

const ownerOptions = [
  { value: "all", label: "All sources" },
  { value: "main", label: "Main site" },
  { value: "schools", label: "Schools" },
  { value: "departments", label: "Departments" },
  { value: "research", label: "Research" },
  { value: "library", label: "Library" },
  { value: "student-clubs", label: "Student clubs" },
];

const quickLinks = [
  {
    title: "Review Queue",
    description: "Review submitted public content",
    href: "/corporate-communication/review-queue",
    icon: ClipboardCheck,
    scopes: ["content.review", "content.publish", "content.manage"],
  },
  {
    title: "Create News",
    description: "Open the newsroom workspace",
    href: "/corporate-communication/newsroom/news",
    icon: Newspaper,
    scopes: ["content.manage_news", "content.manage"],
  },
  {
    title: "Public Notices",
    description: "Manage university notices",
    href: "/corporate-communication/newsroom/notices",
    icon: Megaphone,
    scopes: ["content.manage_announcements", "content.manage"],
  },
  {
    title: "Events Calendar",
    description: "Schedule and publish events",
    href: "/corporate-communication/newsroom/events",
    icon: CalendarClock,
    scopes: ["content.manage_events", "content.manage"],
  },
  {
    title: "Media Library",
    description: "Upload and organise assets",
    href: "/corporate-communication/media/assets",
    icon: ImageIcon,
    scopes: ["media.view", "media.manage", "media.upload"],
  },
  {
    title: "Page CMS",
    description: "Compose structured page sections",
    href: "/corporate-communication/page-cms",
    icon: FileText,
    scopes: ["page_sections.view", "page_sections.manage", "homepage.manage"],
  },
];

function isoDate(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function rangeForDays(days: number) {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - (days - 1));
  return { date_from: isoDate(from), date_to: isoDate(to) };
}

function compactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatMetricValue(metric: CorporateDashboardMetric | undefined, fallback = 0) {
  if (!metric) return compactNumber(fallback);
  if (metric.unit === "percent") return `${metric.value}%`;
  if (metric.unit === "hours") return `${metric.value}h`;
  return compactNumber(metric.value);
}

function formatPeriodLabel(value: string) {
  const date = new Date(`${value.length === 7 ? `${value}-01` : value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: value.length === 10 ? "numeric" : undefined,
    month: "short",
    year: value.length === 7 ? "numeric" : undefined,
  });
}

const baseChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index" as const, intersect: false },
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: { usePointStyle: true, boxWidth: 8, padding: 18 },
    },
    tooltip: {
      backgroundColor: "#0f172a",
      padding: 12,
      cornerRadius: 8,
      titleSpacing: 6,
      bodySpacing: 6,
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
    y: { beginAtZero: true, grid: { color: "rgba(148,163,184,.16)" }, ticks: { precision: 0 } },
  },
};

export function CorporateCommunicationDashboard() {
  const { hasAnyScope } = usePermissions();
  const [days, setDays] = useState(30);
  const [contentType, setContentType] = useState("all");
  const [ownerPortal, setOwnerPortal] = useState("all");
  const dates = useMemo(() => rangeForDays(days), [days]);
  const params = useMemo<CorporateDashboardParams>(() => ({
    ...dates,
    compare: "previous",
    bucket: "auto",
    content_type: contentType === "all" ? undefined : contentType,
    owner_portal: ownerPortal === "all" ? undefined : ownerPortal,
  }), [contentType, dates, ownerPortal]);
  const dashboardQuery = useQuery({
    queryKey: ["corporate-communication", "dashboard", params],
    queryFn: () => statsApi.corporateDashboard(params),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });
  const dashboard = dashboardQuery.data?.data;

  const activityMetrics = useMemo(
    () => new Map(dashboard?.activity.metrics.map((metric) => [metric.key, metric]) ?? []),
    [dashboard?.activity.metrics],
  );
  const visibleQuickLinks = quickLinks.filter((item) => hasAnyScope(item.scopes));

  return (
    <div className="print:bg-white">
      <style jsx global>{`
        @media print {
          html, body { height: auto !important; overflow: visible !important; background: white !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          aside, header.sticky { display: none !important; }
          div.flex.h-screen.overflow-hidden { height: auto !important; overflow: visible !important; }
          main { overflow: visible !important; background: white !important; }
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}</style>
      <PageHeader
        title="Communications Intelligence"
        description="Editorial workflow health, publishing output, readiness controls, and operational analysis."
      />

      <div className="space-y-6 p-4 sm:p-6 print:p-0">
        <DashboardToolbar
          days={days}
          setDays={setDays}
          contentType={contentType}
          setContentType={setContentType}
          ownerPortal={ownerPortal}
          setOwnerPortal={setOwnerPortal}
          params={params}
          dashboard={dashboard}
          refreshing={dashboardQuery.isFetching}
        />

        {dashboardQuery.isError ? (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-destructive">Dashboard analytics are unavailable</p>
                <p className="mt-1 text-sm text-muted-foreground">The portal remains available through the quick actions below.</p>
              </div>
              <Button variant="outline" onClick={() => void dashboardQuery.refetch()}>
                <RefreshCw data-icon="inline-start" /> Retry
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {!dashboard && dashboardQuery.isLoading ? (
          <DashboardSkeleton />
        ) : dashboard ? (
          <>
            <KpiGrid dashboard={dashboard} metrics={activityMetrics} />
            <PrimaryCharts dashboard={dashboard} />
            <OperationalCharts dashboard={dashboard} />
            <ReadinessAndInsights dashboard={dashboard} />
            <AttentionAndCalendar dashboard={dashboard} />
          </>
        ) : null}

        <QuickLinks links={visibleQuickLinks} />
      </div>
    </div>
  );
}

function DashboardToolbar({
  days,
  setDays,
  contentType,
  setContentType,
  ownerPortal,
  setOwnerPortal,
  params,
  dashboard,
  refreshing,
}: {
  days: number;
  setDays: (days: number) => void;
  contentType: string;
  setContentType: (value: string) => void;
  ownerPortal: string;
  setOwnerPortal: (value: string) => void;
  params: CorporateDashboardParams;
  dashboard?: CorporateDashboardResponse;
  refreshing: boolean;
}) {
  return (
    <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-background via-background to-primary/[0.035] shadow-sm print:border-slate-200 print:shadow-none">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CircleGauge className="size-4 text-primary" /> Reporting period
              </div>
              {[7, 30, 90].map((value) => (
                <Button
                  key={value}
                  type="button"
                  size="sm"
                  variant={days === value ? "default" : "outline"}
                  onClick={() => setDays(value)}
                  className="print:hidden"
                >
                  {value} days
                </Button>
              ))}
              {refreshing ? <RefreshCw className="size-3.5 animate-spin text-muted-foreground" aria-label="Refreshing dashboard" /> : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="w-[210px] print:hidden"><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup>{contentOptions.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
              <Select value={ownerPortal} onValueChange={setOwnerPortal}>
                <SelectTrigger className="w-[190px] print:hidden"><SelectValue /></SelectTrigger>
                <SelectContent><SelectGroup>{ownerOptions.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup></SelectContent>
              </Select>
              <div className="hidden text-sm print:block">
                {contentOptions.find((item) => item.value === contentType)?.label} · {ownerOptions.find((item) => item.value === ownerPortal)?.label}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            {dashboard ? (
              <div className="text-xs text-muted-foreground">
                {dashboard.period.date_from} to {dashboard.period.date_to}
                {dashboard.comparison_period ? ` · compared with ${dashboard.comparison_period.date_from} to ${dashboard.comparison_period.date_to}` : ""}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2 print:hidden">
              <Button asChild variant="outline" size="sm">
                <a href={statsApi.corporateDashboardExportUrl(params)}>
                  <Download data-icon="inline-start" /> Export CSV
                </a>
              </Button>
              <Button type="button" size="sm" onClick={() => window.print()}>
                <Printer data-icon="inline-start" /> Export PDF
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KpiGrid({
  dashboard,
  metrics,
}: {
  dashboard: CorporateDashboardResponse;
  metrics: Map<string, CorporateDashboardMetric>;
}) {
  const cards = [
    {
      title: "Review backlog",
      value: compactNumber(dashboard.snapshot.review_backlog.total),
      description: `${dashboard.snapshot.review_backlog.overdue} waiting over 48 hours`,
      icon: ClipboardCheck,
      tone: dashboard.snapshot.review_backlog.overdue ? "warning" : "positive",
    },
    {
      title: "Published output",
      value: formatMetricValue(metrics.get("published")),
      description: "Items published in the selected period",
      icon: CheckCircle2,
      metric: metrics.get("published"),
      tone: "positive",
    },
    {
      title: "Median decision time",
      value: formatMetricValue(metrics.get("median_decision_hours")),
      description: "Submission to first editorial decision",
      icon: Clock3,
      metric: metrics.get("median_decision_hours"),
      tone: "neutral",
    },
    {
      title: "Rework rate",
      value: formatMetricValue(metrics.get("rework_rate")),
      description: "Review decisions requesting changes",
      icon: RefreshCw,
      metric: metrics.get("rework_rate"),
      tone: "warning",
    },
    {
      title: "Scheduled next 30 days",
      value: compactNumber(dashboard.snapshot.scheduled.next_30_days),
      description: `${dashboard.snapshot.scheduled.next_7_days} scheduled in the next week`,
      icon: CalendarClock,
      tone: "neutral",
    },
  ] as const;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title} className="relative overflow-hidden shadow-sm transition-colors hover:border-primary/30 print:break-inside-avoid print:shadow-none">
          <div className={cn(
            "absolute inset-x-0 top-0 h-1",
            card.tone === "positive" && "bg-emerald-500",
            card.tone === "warning" && "bg-amber-500",
            card.tone === "neutral" && "bg-primary",
          )} />
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">{card.title}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight">{card.value}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary"><card.icon className="size-5" /></div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{card.description}</p>
            {"metric" in card && card.metric ? <MetricDelta metric={card.metric} /> : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MetricDelta({ metric }: { metric: CorporateDashboardMetric }) {
  const Icon = metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : null;
  if (metric.previous_value === null || metric.previous_value === undefined) return null;
  return (
    <div className={cn(
      "mt-3 flex items-center gap-1.5 text-xs font-medium",
      metric.favourability === "positive" && "text-emerald-700 dark:text-emerald-400",
      metric.favourability === "negative" && "text-rose-700 dark:text-rose-400",
      metric.favourability === "neutral" && "text-muted-foreground",
    )}>
      {Icon ? <Icon className="size-3.5" /> : null}
      <span>{metric.change_percent == null ? `${metric.change ?? 0} vs previous` : `${Math.abs(metric.change_percent)}% ${metric.trend} vs previous`}</span>
    </div>
  );
}

function PrimaryCharts({ dashboard }: { dashboard: CorporateDashboardResponse }) {
  const current = dashboard.publishing.series;
  const previous = dashboard.publishing.previous_series;
  const lineData: ChartData<"line"> = {
    labels: current.map((point) => formatPeriodLabel(point.period)),
    datasets: [
      {
        label: "Current period",
        data: current.map((point) => point.total),
        borderColor: palette.blue,
        backgroundColor: "rgba(37,99,235,.14)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: "Previous period",
        data: previous.map((point) => point.total),
        borderColor: palette.slate,
        borderDash: [6, 5],
        backgroundColor: "transparent",
        tension: 0.35,
        pointRadius: 0,
      },
    ],
  };
  const statusData: ChartData<"doughnut"> = {
    labels: dashboard.snapshot.status_distribution.map((item) => item.label),
    datasets: [{
      data: dashboard.snapshot.status_distribution.map((item) => item.value),
      backgroundColor: [palette.blue, palette.amber, palette.emerald, palette.violet, palette.rose, palette.sky, palette.slate],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.7fr)]">
      <ChartCard
        title="Publishing throughput"
        description="Published items over time compared with the immediately preceding period."
        badge={`${dashboard.period.bucket} view`}
      >
        {current.some((point) => point.total > 0) ? (
          <Line data={lineData} options={baseChartOptions as ChartOptions<"line">} />
        ) : <ChartEmpty label="No publishing transitions were recorded in this period." />}
      </ChartCard>
      <ChartCard title="Workflow status" description="Current distribution of active portal content." badge={`${dashboard.snapshot.status_distribution.reduce((sum, item) => sum + item.value, 0)} records`}>
        {statusData.datasets[0].data.some((value) => Number(value) > 0) ? (
          <Doughnut data={statusData} options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "66%",
            plugins: baseChartOptions.plugins,
          }} />
        ) : <ChartEmpty label="No active content records are available." />}
      </ChartCard>
    </div>
  );
}

function OperationalCharts({ dashboard }: { dashboard: CorporateDashboardResponse }) {
  const aging = dashboard.workflow.backlog_aging;
  const ownerRows = dashboard.workflow.by_owner_portal.slice(0, 6);
  const agingData: ChartData<"bar"> = {
    labels: aging.map((item) => item.label),
    datasets: [{
      label: "Review items",
      data: aging.map((item) => item.value),
      backgroundColor: [palette.sky, palette.blue, palette.amber, palette.rose],
      borderRadius: 7,
      maxBarThickness: 54,
    }],
  };
  const ownerData: ChartData<"bar"> = {
    labels: ownerRows.map((item) => item.label),
    datasets: [
      { label: "Submitted", data: ownerRows.map((item) => item.submitted), backgroundColor: palette.sky, borderRadius: 5 },
      { label: "Published", data: ownerRows.map((item) => item.published), backgroundColor: palette.emerald, borderRadius: 5 },
    ],
  };
  const values = dashboard.activity.values;
  const decisionData: ChartData<"doughnut"> = {
    labels: ["Approved", "Changes requested", "Rejected"],
    datasets: [{
      data: [values.approved ?? 0, values.changes_requested ?? 0, values.rejected ?? 0],
      backgroundColor: [palette.emerald, palette.amber, palette.rose],
      borderWidth: 0,
      hoverOffset: 7,
    }],
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      <ChartCard title="Backlog aging" description="How long submitted content has waited for an editorial outcome.">
        <Bar data={agingData} options={baseChartOptions as ChartOptions<"bar">} />
      </ChartCard>
      <ChartCard title="Source throughput" description="Submissions and publications grouped by owner portal.">
        {ownerRows.length ? <Bar data={ownerData} options={baseChartOptions as ChartOptions<"bar">} /> : <ChartEmpty label="No owner-portal workflow activity was recorded." />}
      </ChartCard>
      <ChartCard title="Editorial decisions" description="Outcome mix for review decisions during the selected period.">
        {decisionData.datasets[0].data.some((value) => Number(value) > 0) ? (
          <Doughnut data={decisionData} options={{ responsive: true, maintainAspectRatio: false, cutout: "60%", plugins: baseChartOptions.plugins }} />
        ) : <ChartEmpty label="No editorial decisions were recorded." />}
      </ChartCard>
    </div>
  );
}

function ReadinessAndInsights({ dashboard }: { dashboard: CorporateDashboardResponse }) {
  const readinessRows = dashboard.readiness.checks.filter((item) => item.value > 0).slice(0, 8);
  const readinessData: ChartData<"bar"> = {
    labels: readinessRows.map((item) => item.label),
    datasets: [{
      label: "Affected records",
      data: readinessRows.map((item) => item.value),
      backgroundColor: readinessRows.map((_, index) => index % 3 === 0 ? palette.amber : index % 3 === 1 ? palette.rose : palette.blue),
      borderRadius: 5,
    }],
  };
  const horizontalOptions: ChartOptions<"bar"> = {
    ...baseChartOptions,
    indexAxis: "y",
    scales: {
      x: { beginAtZero: true, grid: { color: "rgba(148,163,184,.16)" }, ticks: { precision: 0 } },
      y: { grid: { display: false } },
    },
  };
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
      <ChartCard title="Readiness controls" description="Objective metadata, media, expiry, and processing checks." badge={`${dashboard.readiness.issue_total} findings`}>
        {readinessRows.length ? <Bar data={readinessData} options={horizontalOptions} /> : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <ShieldCheck className="size-10 text-emerald-500" />
            <p className="mt-3 font-semibold">No readiness exceptions found</p>
            <p className="mt-1 text-sm text-muted-foreground">The selected content scope passed the configured controls.</p>
          </div>
        )}
      </ChartCard>
      <Card className="overflow-hidden shadow-sm print:break-inside-avoid print:shadow-none">
        <CardHeader className="border-b bg-gradient-to-r from-primary/[0.06] to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Sparkles className="size-5" /></div>
            <div><CardTitle>Operational analysis</CardTitle><CardDescription>Explainable findings calculated from portal records.</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          {dashboard.insights.length ? dashboard.insights.map((insight) => (
            <Link
              key={insight.code}
              href={insight.href || "/corporate-communication"}
              className={cn(
                "group block rounded-xl border p-4 transition-colors hover:border-primary/35 hover:bg-muted/30",
                insight.severity === "critical" && "border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20",
                insight.severity === "warning" && "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20",
                insight.severity === "success" && "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20",
              )}
            >
              <div className="flex items-start gap-3">
                {insight.severity === "critical" || insight.severity === "warning" ? <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" /> : insight.severity === "success" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />}
                <div className="min-w-0 flex-1"><p className="font-semibold">{insight.title}</p><p className="mt-1 text-sm leading-relaxed text-muted-foreground">{insight.description}</p></div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          )) : <ChartEmpty label="No operational findings were generated for this period." />}
        </CardContent>
      </Card>
    </div>
  );
}

function AttentionAndCalendar({ dashboard }: { dashboard: CorporateDashboardResponse }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,.75fr)]">
      <Card className="shadow-sm print:break-inside-avoid print:shadow-none">
        <CardHeader><CardTitle>Attention required</CardTitle><CardDescription>Highest-priority records selected by severity and age.</CardDescription></CardHeader>
        <CardContent>
          {dashboard.attention_items.length ? (
            <div className="divide-y rounded-xl border">
              {dashboard.attention_items.slice(0, 8).map((item) => (
                <Link key={`${item.content_type}-${item.id}`} href={item.href} className="group flex flex-col gap-3 p-4 transition-colors hover:bg-muted/35 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><p className="truncate font-semibold">{item.title}</p><StatusBadge status={item.status} /></div>
                    <p className="mt-1 text-xs text-muted-foreground">{item.content_type_label} · {item.source_label}{item.age_hours !== null && item.age_hours !== undefined ? ` · ${Math.round(item.age_hours)} hours old` : ""}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">{item.issue_codes.slice(0, 3).map((code) => <Badge key={code} variant="outline" className="text-[10px]">{code.replaceAll("_", " ")}</Badge>)}</div>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          ) : <ChartEmpty label="No actionable exceptions were found." />}
        </CardContent>
      </Card>
      <Card className="shadow-sm print:break-inside-avoid print:shadow-none">
        <CardHeader><CardTitle>Publishing calendar</CardTitle><CardDescription>Scheduled content during the next 30 days.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border bg-muted/25 p-4"><p className="text-xs text-muted-foreground">Covered days</p><p className="mt-1 text-2xl font-bold">{dashboard.publishing.calendar.covered_days}</p></div>
            <div className="rounded-xl border bg-muted/25 p-4"><p className="text-xs text-muted-foreground">Longest gap</p><p className="mt-1 text-2xl font-bold">{dashboard.publishing.calendar.longest_gap_days}d</p></div>
          </div>
          {dashboard.publishing.calendar.upcoming.length ? (
            <div className="space-y-2">
              {dashboard.publishing.calendar.upcoming.slice(0, 6).map((item) => (
                <Link key={`${item.content_type}-${item.id}`} href={item.href} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:border-primary/35">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary"><CalendarClock className="size-4" /></div>
                  <div className="min-w-0"><p className="truncate text-sm font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{new Date(item.scheduled_at).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p></div>
                </Link>
              ))}
            </div>
          ) : <p className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">No content is scheduled in the next 30 days.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function ChartCard({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden shadow-sm print:break-inside-avoid print:shadow-none">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div><CardTitle>{title}</CardTitle><CardDescription className="mt-1">{description}</CardDescription></div>
        {badge ? <Badge variant="secondary" className="shrink-0">{badge}</Badge> : null}
      </CardHeader>
      <CardContent><div className="h-[300px] min-h-0">{children}</div></CardContent>
    </Card>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return <div className="flex h-full items-center justify-center rounded-xl border border-dashed bg-muted/15 p-6 text-center text-sm text-muted-foreground">{label}</div>;
}

function QuickLinks({ links }: { links: typeof quickLinks }) {
  return (
    <Card className="shadow-sm print:hidden">
      <CardHeader><CardTitle>Quick actions</CardTitle><CardDescription>Move directly from analysis to the relevant portal workspace.</CardDescription></CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {links.map((item) => (
          <Link key={item.href} href={item.href} className="group rounded-xl border bg-background p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.025]">
            <div className="flex items-start justify-between"><div className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary"><item.icon className="size-5" /></div><ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" /></div>
            <p className="mt-4 font-semibold">{item.title}</p><p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading communications dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-44 rounded-xl" />)}</div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,.7fr)]"><Skeleton className="h-[390px] rounded-xl" /><Skeleton className="h-[390px] rounded-xl" /></div>
      <div className="grid gap-6 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-[390px] rounded-xl" />)}</div>
    </div>
  );
}
