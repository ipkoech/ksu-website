"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { BarChart3, Download, FileText, TrendingUp, Users } from "lucide-react";
import { adminReportsApi, useAdminActivityReport, useContentReport, useReportsOverview, useTrafficReport } from "@ksu/api-client";
import type { ReportDimension, ReportSeriesPoint } from "@ksu/api-client";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";

const ranges = [
  { label: "7 days", value: 7 },
  { label: "30 days", value: 30 },
  { label: "90 days", value: 90 },
  { label: "1 year", value: 365 },
];

function MetricCard({ title, value, icon }: { title: string; value?: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value ?? "--"}</div>
      </CardContent>
    </Card>
  );
}

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
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.max(4, (row.value / max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DailySeries({ rows }: { rows?: ReportSeriesPoint[] }) {
  const max = Math.max(...(rows?.map((row) => row.value) ?? [0]), 1);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Traffic Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {!rows?.length ? (
          <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">No traffic events have been recorded for this range.</p>
        ) : (
          <div className="flex h-44 items-end gap-2">
            {rows.map((row) => (
              <div key={row.date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <div className="w-full rounded-t bg-primary" style={{ height: `${Math.max(6, (row.value / max) * 160)}px` }} />
                <span className="w-full truncate text-center text-[10px] text-muted-foreground">{row.date.slice(5)}</span>
              </div>
            ))}
          </div>
        )}
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
            <a href={adminReportsApi.exportUrl("overview", { days, format: "csv" })}>
              <Download data-icon="inline-start" />
              Overview CSV
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={adminReportsApi.exportUrl("content", { days, format: "csv" })}>
              <Download data-icon="inline-start" />
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
        <MetricCard title="Total Events" value={isLoading ? undefined : overviewData?.total_events} icon={<BarChart3 className="h-4 w-4" />} />
        <MetricCard title="Page Views" value={isLoading ? undefined : trafficData?.page_views ?? overviewData?.page_views} icon={<TrendingUp className="h-4 w-4" />} />
        <MetricCard title="Content Views" value={isLoading ? undefined : contentData?.content_views ?? overviewData?.content_views} icon={<FileText className="h-4 w-4" />} />
        <MetricCard title="Active Admins" value={isLoading ? undefined : adminData?.active_admins} icon={<Users className="h-4 w-4" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <DailySeries rows={trafficData?.by_day ?? overviewData?.traffic_by_day} />
        <Card>
          <CardHeader>
            <CardTitle>Admin Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border bg-background p-3">
              <span className="text-sm font-medium">Admin events</span>
              <Badge>{adminData?.admin_events ?? 0}</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-background p-3">
              <span className="text-sm font-medium">Content interactions</span>
              <Badge variant="secondary">{contentData?.interactions ?? 0}</Badge>
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
