"use client";

import {
  BarChart3,
  Eye,
  MousePointerClick,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib/utils";
import type { ReportsOverview } from "@ksu/api-client";

type OverviewData = ReportsOverview | undefined;

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <Card className={cn("transition-colors", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function BarChart({
  data,
  loading,
  maxBars = 30,
}: {
  data?: Array<{ label: string; value: number }>;
  loading?: boolean;
  maxBars?: number;
}) {
  if (loading || !data?.length) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        {loading ? "Loading..." : "No data available"}
      </div>
    );
  }

  const displayData = data.slice(-maxBars);
  const max = Math.max(1, ...displayData.map((d) => d.value));

  return (
    <div className="flex h-[200px] items-end gap-1">
      {displayData.map((d, i) => (
        <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
          <div className="mb-1 hidden whitespace-nowrap rounded bg-popover px-1.5 py-0.5 text-[10px] text-popover-foreground shadow group-hover:block">
            {d.value}
          </div>
          <div
            className="w-full rounded-t bg-primary/70 transition-[height] group-hover:bg-primary"
            style={{
              height: `${Math.max(4, Math.round((d.value / max) * 100 * 0.9))}%`,
            }}
          />
          <span className="mt-1 text-[9px] leading-none text-muted-foreground truncate w-full text-center">
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function LineChart({
  data,
  loading,
}: {
  data?: Array<{ label: string; value: number }>;
  loading?: boolean;
}) {
  if (loading || !data?.length) {
    return (
      <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
        {loading ? "Loading..." : "No data available"}
      </div>
    );
  }

  const max = Math.max(1, ...data.map((d) => d.value));
  const points = data
    .map((d, i) => {
      const x = (i / Math.max(1, data.length - 1)) * 100;
      const y = 100 - (d.value / max) * 90;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="relative h-[200px]">
      <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {data.map((d, i) => {
        const x = (i / Math.max(1, data.length - 1)) * 100;
        const y = 100 - (d.value / max) * 90;
        return (
          <div
            key={i}
            className="group absolute cursor-default"
            style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
          >
            <div className="h-2 w-2 rounded-full bg-primary ring-4 ring-background" />
            <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-popover px-1.5 py-0.5 text-[10px] text-popover-foreground shadow group-hover:block">
              {d.value} — {d.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardAnalyticsSection({
  overview,
  traffic,
  isLoading,
}: {
  overview?: ReportsOverview;
  traffic?: Array<{ label: string; value: number }>;
  isLoading: boolean;
}) {
  const metrics = [
    {
      title: "Total events",
      value: isLoading ? "—" as const : (overview?.total_events ?? 0),
      description: "All tracked interactions",
      icon: BarChart3,
    },
    {
      title: "Page views",
      value: isLoading ? "—" as const : (overview?.page_views ?? 0),
      description: "Unique page impressions",
      icon: Eye,
    },
    {
      title: "Content views",
      value: isLoading ? "—" as const : (overview?.content_views ?? 0),
      description: "News, events, articles",
      icon: MousePointerClick,
    },
    {
      title: "Admin events",
      value: isLoading ? "—" as const : (overview?.admin_events ?? 0),
      description: "In selected period",
      icon: Users,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Analytics overview
        </h3>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            icon={metric.icon}
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily events</CardTitle>
            <CardDescription>Event count by day (last 30 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart data={traffic} loading={isLoading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Traffic trend</CardTitle>
            <CardDescription>Page views over time</CardDescription>
          </CardHeader>
          <CardContent>
            <LineChart data={traffic} loading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { BarChart, LineChart };
