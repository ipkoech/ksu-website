"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolPortalDashboardRange,
} from "@ksu/api-client";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  LayoutDashboard,
  RefreshCw,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Skeleton,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import {
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "@/components/schools/shared/school-workspace";
import { SchoolStatCard } from "./school-stat-card";
import { SchoolTrendChart } from "./school-trend-chart";

const RANGES: Array<{ value: SchoolPortalDashboardRange; label: string }> = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "12m", label: "12 months" },
];

function DashboardSkeleton() {
  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}

export function SchoolDashboard() {
  const { school } = useSchoolPortal();
  const [range, setRange] = useState<SchoolPortalDashboardRange>("30d");
  const dashboardQuery = useQuery({
    queryKey: schoolPortalQueryKeys.dashboard(school.id, range),
    queryFn: async () => (await schoolPortalApi.dashboard(range)).data,
  });
  const dashboard = dashboardQuery.data;

  if (dashboardQuery.isPending) return <DashboardSkeleton />;
  if (dashboardQuery.error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Dashboard unavailable</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            <span>{dashboardQuery.error.message}</span>
            <Button size="sm" variant="outline" onClick={() => dashboardQuery.refetch()}>
              <RefreshCw className="mr-2 size-4" /> Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  if (!dashboard) return null;

  return (
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="School operations"
        title="Administration dashboard"
        description="A live view of your people, academic portfolio, publishing workflow, and requester activity."
        schoolName={school.name}
        icon={LayoutDashboard}
        meta={<p className="text-xs text-muted-foreground">Updated {new Date(dashboard.generated_at).toLocaleString()}</p>}
        actions={<div className="flex flex-wrap gap-1 rounded-lg border bg-background p-1" aria-label="Dashboard range">
          {RANGES.map((item) => (
            <Button
              key={item.value}
              size="sm"
              variant={range === item.value ? "default" : "ghost"}
              className="cursor-pointer"
              onClick={() => setRange(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>}
      />

      <section aria-label="School summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboard.summary_cards.map((card) => (
          <SchoolStatCard key={card.key} card={card} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.8fr)]">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Activity trend</CardTitle>
            <CardDescription>School changes during the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <SchoolTrendChart points={dashboard.trends} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profile completeness</CardTitle>
            <CardDescription>
              {dashboard.profile_completeness.completed_fields} of{" "}
              {dashboard.profile_completeness.total_fields} fields complete
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span>Public profile readiness</span>
              <strong>{dashboard.profile_completeness.percent}%</strong>
            </div>
            <Progress value={dashboard.profile_completeness.percent} />
            {dashboard.profile_completeness.missing_fields.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                Next: {dashboard.profile_completeness.missing_fields.slice(0, 3).join(", ")}
              </p>
            ) : (
              <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="size-4" /> Profile is complete
              </p>
            )}
            <Button asChild variant="outline" size="sm" className="w-full cursor-pointer">
              <Link href="/schools/profile">Review profile</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {Object.entries(dashboard.distributions).map(([key, items]) => {
          const total = items.reduce((sum, item) => sum + item.value, 0);
          return (
            <Card key={key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base capitalize">{key.replaceAll("_", " ")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No records in this range.</p>
                ) : (
                  items.map((item) => (
                    <div key={item.key} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span>{item.label}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                      <Progress value={total ? (item.value / total) * 100 : 0} />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Needs attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard.attention_items.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4" /> Nothing needs attention.
              </p>
            ) : (
              dashboard.attention_items.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="flex cursor-pointer items-center justify-between rounded-md border p-3 transition-colors hover:bg-muted"
                >
                  <span className="text-sm">{item.label}</span>
                  <Badge variant={item.severity === "critical" ? "destructive" : "secondary"}>
                    {item.count}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.recent_activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent changes.</p>
            ) : (
              dashboard.recent_activity.slice(0, 6).map((item) => (
                <div key={item.id} className="flex gap-3 border-b pb-3 last:border-0 last:pb-0">
                  <Clock3 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.summary}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(item.occurred_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dashboard.quick_links.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="flex cursor-pointer items-center justify-between rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted"
              >
                <span>{item.label}</span>
                <span className="flex items-center gap-2 font-medium">
                  {item.count} <ArrowRight className="size-4" />
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </SchoolWorkspace>
  );
}
