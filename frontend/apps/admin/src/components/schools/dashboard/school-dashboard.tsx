"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@ksu/auth";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolPortalDashboardRange,
  type SchoolPortalDashboardResponse,
} from "@ksu/api-client";
import { AlertCircle, RefreshCw } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Skeleton,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import { SchoolWorkspace } from "@/components/schools/shared/school-workspace";
import { SchoolDashboardHeader } from "./school-dashboard-header";
import {
  SchoolActivityPanel,
  SchoolAttentionPanel,
  SchoolDistributionPanel,
  SchoolQuickActions,
  SchoolRecentActivity,
} from "./school-dashboard-panels";
import { SchoolStatCard } from "./school-stat-card";

const VALID_RANGES = new Set<SchoolPortalDashboardRange>(["7d", "30d", "90d", "12m"]);

function DashboardSkeleton() {
  return (
    <div className="min-h-full bg-muted/20 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="space-y-2"><Skeleton className="h-5 w-64" /><Skeleton className="h-9 w-80" /><Skeleton className="h-4 w-72" /></div>
          <Skeleton className="h-10 w-56" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-32" />)}
        </div>
        <div className="grid gap-4 xl:grid-cols-12">
          <Skeleton className="h-[22rem] xl:col-span-6" />
          <Skeleton className="h-[22rem] xl:col-span-3" />
          <Skeleton className="h-[22rem] xl:col-span-3" />
        </div>
        <div className="grid gap-4 xl:grid-cols-12">
          {Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-[20rem] xl:col-span-4" />)}
        </div>
      </div>
    </div>
  );
}

export function SchoolDashboard() {
  const { school } = useSchoolPortal();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const requestedRange = params.get("range") as SchoolPortalDashboardRange | null;
  const range = requestedRange && VALID_RANGES.has(requestedRange) ? requestedRange : "30d";
  const dashboardQuery = useQuery({
    queryKey: schoolPortalQueryKeys.dashboard(school.id, range),
    queryFn: async () => (await schoolPortalApi.dashboard(range)).data,
    placeholderData: keepPreviousData,
  });
  const dashboard = dashboardQuery.data;

  const changeRange = (nextRange: SchoolPortalDashboardRange) => {
    const next = new URLSearchParams(params);
    if (nextRange === "30d") next.delete("range");
    else next.set("range", nextRange);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  if (dashboardQuery.isPending) return <DashboardSkeleton />;
  if (!dashboard && dashboardQuery.error) {
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

  const contentWorkflow = combineDistribution(
    dashboard.distributions.content_by_status ?? [],
    [
      ["draft", "Draft", ["draft"]],
      ["review", "In review", ["submitted", "in_review", "under_review"]],
      ["changes_requested", "Changes requested", ["changes_requested"]],
      ["published", "Published", ["approved", "published"]],
      ["archived", "Archived", ["archived"]],
    ],
  );
  const inquiryStatus = combineDistribution(
    dashboard.distributions.inquiries_by_status ?? [],
    [
      ["new", "New", ["new"]],
      ["active", "In progress", ["open", "in_progress", "replied"]],
      ["waiting", "Waiting", ["waiting_for_requester"]],
      ["resolved", "Resolved", ["resolved"]],
      ["closed", "Closed", ["closed", "spam"]],
    ],
  );

  return (
    <SchoolWorkspace>
      <SchoolDashboardHeader
        userName={user?.name || "School Admin"}
        schoolName={school.name}
        generatedAt={dashboard.generated_at}
        range={range}
        fetching={dashboardQuery.isFetching}
        onRangeChange={changeRange}
      />

      {dashboardQuery.error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>The latest range could not be loaded. Showing the last available dashboard.</span>
            <Button size="sm" variant="outline" onClick={() => dashboardQuery.refetch()}><RefreshCw className="mr-2 size-4" /> Retry</Button>
          </AlertDescription>
        </Alert>
      ) : null}

      <section aria-label="School summary" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {dashboard.summary_cards.map((card) => <SchoolStatCard key={card.key} card={card} />)}
      </section>

      <section className="grid items-stretch gap-4 xl:grid-cols-12">
        <div className="xl:col-span-6"><SchoolActivityPanel dashboard={dashboard} /></div>
        <div className="xl:col-span-3">
          <SchoolDistributionPanel
            title="Content workflow"
            description="Where school content is in review"
            items={contentWorkflow}
            href="/schools/content"
            actionLabel="View all content"
          />
        </div>
        <div className="xl:col-span-3">
          <SchoolAttentionPanel items={dashboard.attention_items} profile={dashboard.profile_completeness} />
        </div>
      </section>

      <section className="grid items-stretch gap-4 xl:grid-cols-12">
        <div className="xl:col-span-4"><SchoolRecentActivity items={dashboard.recent_activity} /></div>
        <div className="xl:col-span-4"><SchoolQuickActions actions={dashboard.quick_actions} /></div>
        <div className="xl:col-span-4">
          <SchoolDistributionPanel
            title="Inquiry status"
            description="Requester conversations by state"
            items={inquiryStatus}
            href="/schools/inquiries"
            actionLabel="View all inquiries"
          />
        </div>
      </section>

      <footer className="flex flex-col gap-1 border-t pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>Dashboard generated {new Date(dashboard.generated_at).toLocaleString()}</span>
        <span>School Administration Portal · {school.name}</span>
      </footer>
    </SchoolWorkspace>
  );
}

function combineDistribution(
  items: SchoolPortalDashboardResponse["distributions"][string],
  groups: Array<[key: string, label: string, sourceKeys: string[]]>,
) {
  const values = new Map(items.map((item) => [item.key, item.value]));
  return groups.map(([key, label, sourceKeys]) => ({
    key,
    label,
    value: sourceKeys.reduce((total, sourceKey) => total + (values.get(sourceKey) ?? 0), 0),
  }));
}
