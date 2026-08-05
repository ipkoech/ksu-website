"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
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
import { Bar, Line } from "react-chartjs-2";
import {
  corporateCommSettingsApi,
  corporateCommSettingsQueryKeys,
  type CorporateEngagementParams,
  type CorporateEngagementResponse,
} from "@ksu/api-client";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib/utils";
import {
  AlertCircle,
  Eye,
  Info,
  RefreshCw,
  Send,
  Users2,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend,
);

// Mirrors the corporate dashboard's chart palette; blue/emerald pair and the
// reserved status trio (posted/pending/failed) validated with the dataviz
// palette checker against the light surface.
const reachPalette = {
  views: "#2563eb",
  visitors: "#059669",
  posted: "#059669",
  pending: "#d97706",
  failed: "#e11d48",
};

const chartOptions = {
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

function compact(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function formatBucket(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function ReachCard({
  title,
  description,
  badge,
  children,
  className,
}: {
  title: string;
  description: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden shadow-sm", className)}>
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          </div>
          {badge}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function ChartEmpty({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-40 items-center justify-center rounded-lg border border-dashed bg-muted/20 px-6 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function TopContentList({
  engagement,
}: {
  engagement: CorporateEngagementResponse;
}) {
  const rows = engagement.website.top_content;
  if (rows.length === 0) {
    return (
      <ChartEmpty label="No content page views were recorded in this period." />
    );
  }
  const max = Math.max(...rows.map((row) => row.views), 1);
  return (
    <ol className="space-y-1" aria-label="Top content by page views">
      {rows.map((row, index) => (
        <li
          key={row.entity_id}
          className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/40"
        >
          <span className="text-center text-xs font-semibold tabular-nums text-muted-foreground">
            {index + 1}
          </span>
          <span className="min-w-0">
            <span className="flex min-w-0 items-center gap-2">
              <span className="truncate text-sm font-medium">
                {row.title ?? row.slug ?? row.path ?? "Untitled"}
              </span>
              {row.entity_type ? (
                <Badge variant="outline" className="shrink-0 font-normal capitalize">
                  {row.entity_type.replace(/_/g, " ")}
                </Badge>
              ) : null}
            </span>
            <span
              aria-hidden
              className="mt-1.5 block h-1 rounded-full bg-muted"
            >
              <span
                className="block h-1 rounded-full"
                style={{
                  width: `${Math.max((row.views / max) * 100, 3)}%`,
                  backgroundColor: reachPalette.views,
                }}
              />
            </span>
          </span>
          <span className="text-right">
            <span className="block text-sm font-semibold tabular-nums">
              {compact(row.views)}
            </span>
            <span className="block text-xs tabular-nums text-muted-foreground">
              {compact(row.visitors)} visitors
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function CorporateReachPanel({
  params,
}: {
  params?: CorporateEngagementParams;
}) {
  const engagementQuery = useQuery({
    queryKey: corporateCommSettingsQueryKeys.engagement(params),
    queryFn: async () =>
      (await corporateCommSettingsApi.engagement(params)).data,
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });
  const engagement = engagementQuery.data;

  if (engagementQuery.isLoading) {
    return (
      <section aria-label="Reach" className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </section>
    );
  }

  if (engagementQuery.isError || !engagement) {
    return (
      <Card className="border-destructive/40 bg-destructive/5">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden />
            <div>
              <p className="font-semibold text-destructive">
                Reach metrics are unavailable
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Website and social delivery numbers could not be loaded.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => void engagementQuery.refetch()}>
            <RefreshCw data-icon="inline-start" /> Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const trend = engagement.website.trend;
  const trendData: ChartData<"line"> = {
    labels: trend.map((point) => formatBucket(point.bucket)),
    datasets: [
      {
        label: "Page views",
        data: trend.map((point) => point.views),
        borderColor: reachPalette.views,
        backgroundColor: "rgba(37,99,235,.14)",
        fill: true,
        tension: 0.35,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: "Unique visitors",
        data: trend.map((point) => point.visitors),
        borderColor: reachPalette.visitors,
        backgroundColor: "transparent",
        borderDash: [6, 5],
        tension: 0.35,
        pointRadius: 0,
        pointHoverRadius: 5,
      },
    ],
  };

  const platforms = engagement.social.by_platform;
  const deliveriesData: ChartData<"bar"> = {
    labels: platforms.map((row) => row.platform),
    datasets: [
      {
        label: "Posted",
        data: platforms.map((row) => row.posted),
        backgroundColor: reachPalette.posted,
        borderRadius: 4,
        maxBarThickness: 42,
      },
      {
        label: "Pending",
        data: platforms.map((row) => row.pending),
        backgroundColor: reachPalette.pending,
        borderRadius: 4,
        maxBarThickness: 42,
      },
      {
        label: "Failed",
        data: platforms.map((row) => row.failed),
        backgroundColor: reachPalette.failed,
        borderRadius: 4,
        maxBarThickness: 42,
      },
    ],
  };

  const totals = engagement.social.totals;

  return (
    <section aria-label="Reach — website and social" className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            label: "Website page views",
            value: engagement.website.page_views,
            icon: Eye,
            detail: `${engagement.period.date_from} → ${engagement.period.date_to}`,
          },
          {
            label: "Unique visitors",
            value: engagement.website.unique_visitors,
            icon: Users2,
            detail: "Distinct anonymous sessions",
          },
          {
            label: "Social deliveries",
            value: totals.total,
            icon: Send,
            detail: `${totals.posted} posted · ${totals.failed} failed`,
          },
        ].map(({ label, value, icon: Icon, detail }) => (
          <Card key={label} className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-4">
              <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-2xl font-semibold tabular-nums tracking-tight">
                  {compact(value)}
                </span>
                <span className="block truncate text-sm font-medium">{label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {detail}
                </span>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
        <ReachCard
          title="Website traffic"
          description="Daily page views and unique visitors from first-party analytics."
        >
          <div className="h-64">
            {trend.some((point) => point.views > 0) ? (
              <Line
                data={trendData}
                options={chartOptions as ChartOptions<"line">}
              />
            ) : (
              <ChartEmpty label="No page views were recorded in this period." />
            )}
          </div>
        </ReachCard>
        <ReachCard
          title="Social deliveries by platform"
          description="Posts this portal published or attempted per platform."
          badge={
            <Badge variant="outline" className="gap-1 font-normal text-muted-foreground">
              <Info className="size-3" aria-hidden />
              Deliveries, not impressions
            </Badge>
          }
        >
          <div className="h-64">
            {platforms.length > 0 ? (
              <Bar
                data={deliveriesData}
                options={chartOptions as ChartOptions<"bar">}
              />
            ) : (
              <ChartEmpty label="No social deliveries were attempted in this period." />
            )}
          </div>
          <p className="text-xs leading-5 text-muted-foreground">
            {engagement.social.note}
          </p>
        </ReachCard>
      </div>

      <ReachCard
        title="Top content by page views"
        description="The most-viewed content items on the public website for the selected period."
      >
        <TopContentList engagement={engagement} />
      </ReachCard>
    </section>
  );
}
