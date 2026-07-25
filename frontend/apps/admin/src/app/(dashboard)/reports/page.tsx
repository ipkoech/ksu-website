"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { BarChart3, Download, MousePointerClick, TrendingUp, Users } from "lucide-react";
import { adminReportsApi, useAdminActivityReport, useContentReport, useReportsOverview, useTrafficReport } from "@ksu/api-client";
import type { ReportDimension } from "@ksu/api-client";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import {
  MetricCard,
  BarChart,
} from "@/components/analytics/chart-cards";

const ranges = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "1 year", value: 365 },
];

function DimensionList({ title, rows, emptyLabel }: { title: string; rows?: ReportDimension[]; emptyLabel: string }) {
  const max = Math.max(...(rows?.map((row) => row.value) ?? [0]), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!rows?.length ? (
          <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={`${row.key}-${row.label}`} className="space-y-1">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="truncate font-medium">{row.label}</span>
                  <span className="text-muted-foreground">{row.value}</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${Math.round((row.value / max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SeriesChart({ rows, loading }: { rows?: Array<{ label: string; value: number }>; loading?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Daily events</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart data={rows} loading={loading} />
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  const [days, setDays] = useState(30);
  const params = useMemo(() => ({ days }), [days]);
  const overview = useReportsOverview(params);
  const traffic = useTrafficReport(params);
  const content = useContentReport(params);
  const adminActivity = useAdminActivityReport(params);

  const overviewData = overview.data?.data;
  const trafficData = traffic.data?.data;
  const contentData = content.data?.data;
  const adminData = adminActivity.data?.data;
  const isLoading = overview.isLoading || traffic.isLoading || content.isLoading || adminActivity.isLoading;

  const seriesData = useMemo(() => {
    const rows = trafficData?.by_day ?? [];
    if (!rows.length) return undefined;
    return rows.map((r) => ({ label: r.date, value: r.value }));
  }, [trafficData]);

  return (
    <PageTransition>
      <PageHeader title="Reports" description="Traffic, content, and back-office analytics from first-party events" />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {ranges.map((range) => (
            <Button key={range.value} variant={days === range.value ? "default" : "outline"} size="sm" onClick={() => setDays(range.value)}>
              {range.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={adminReportsApi.exportUrl("overview", { days, format: "csv" })} rel="noreferrer">
              <Download className="mr-1.5 h-4 w-4" />
              Overview CSV
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={adminReportsApi.exportUrl("content", { days, format: "csv" })} rel="noreferrer">
              <Download className="mr-1.5 h-4 w-4" />
              Content CSV
            </a>
          </Button>
        </div>
      </div>

      {overview.isError || traffic.isError || content.isError || adminActivity.isError ? (
        <Card className="mb-6 border-destructive/30">
          <CardContent className="p-4 text-sm text-destructive">Reports API is unavailable for this session.</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Events" value={isLoading ? "—" : (overviewData?.total_events ?? 0)} icon={BarChart3} />
        <MetricCard title="Page Views" value={isLoading ? "—" : (trafficData?.page_views ?? overviewData?.page_views ?? 0)} icon={TrendingUp} />
        <MetricCard title="Content Views" value={isLoading ? "—" : (contentData?.content_views ?? overviewData?.content_views ?? 0)} icon={MousePointerClick} />
        <MetricCard title="Active Admins" value={isLoading ? "—" : (adminData?.active_admins ?? 0)} icon={Users} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SeriesChart rows={seriesData} loading={isLoading} />
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border bg-background p-3">
              <span className="text-sm font-medium">Admin events</span>
              <span className="text-sm font-semibold text-primary">{adminData?.admin_events ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-background p-3">
              <span className="text-sm font-medium">Content interactions</span>
              <span className="text-sm font-semibold text-primary">{contentData?.interactions ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <DimensionList title="Top Content" rows={contentData?.top_content ?? overviewData?.top_content} emptyLabel="No content analytics recorded yet." />
        <DimensionList title="Top Paths" rows={trafficData?.top_paths} emptyLabel="No page view paths recorded yet." />
        <DimensionList title="Referrers" rows={trafficData?.referrers} emptyLabel="No referrer data recorded yet." />
      </div>
    </PageTransition>
  );
}
