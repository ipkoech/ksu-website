"use client";

import { useQuery } from "@tanstack/react-query";
import { FileText, ImageIcon, MessageSquare, Settings, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { slidersApi, staffApi } from "@ksu/api-client";
import { researchCount, ResearchWorkspaceTabs } from "../../_components/research-workspace";

export const settingsTabs = [
  { label: "Profile", href: "/research/settings/profile" },
  { label: "Staff", href: "/research/content/staff" },
  { label: "Services", href: "/research/settings/services" },
  { label: "Documents", href: "/research/settings/resources" },
  { label: "Policies", href: "/research/settings/guidelines" },
  { label: "Media", href: "/research/settings/sliders" },
  { label: "Settings", href: "/research/settings/general" },
];

const administrationMetrics = [
  {
    title: "Staff",
    helper: "People attached to research administration",
    queryKey: ["research", "settings", "metrics", "staff"],
    queryFn: () => staffApi.listAssignments({ entity_type: "research", status: "active", page: 1, per_page: 1 }),
    icon: Users,
  },
  {
    title: "Services",
    helper: "Active support services",
    queryKey: ["research", "settings", "metrics", "services"],
    queryFn: () => researchCount("services", { is_active: true }),
    icon: MessageSquare,
  },
  {
    title: "Documents",
    helper: "Resources and access documents",
    queryKey: ["research", "settings", "metrics", "resources"],
    queryFn: () => researchCount("resources", { is_active: true }),
    icon: FileText,
  },
  {
    title: "Policies",
    helper: "Active guidelines and procedures",
    queryKey: ["research", "settings", "metrics", "guidelines"],
    queryFn: () => researchCount("guidelines", { is_active: true }),
    icon: ShieldCheck,
  },
  {
    title: "Media",
    helper: "Research scoped public visuals",
    queryKey: ["research", "settings", "metrics", "sliders"],
    queryFn: () => slidersApi.listAdminSliders({ scope_type: "research", per_page: 1 }),
    icon: ImageIcon,
  },
  {
    title: "Settings",
    helper: "Public and operational values",
    queryKey: ["research", "settings", "metrics", "general"],
    queryFn: () => researchCount("donationSettings", { is_active: true }),
    icon: Settings,
  },
];

export function ResearchSettingsWorkspaceHeader() {
  return (
    <div className="space-y-3">
      <ResearchWorkspaceTabs tabs={settingsTabs} />
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-6">
        {administrationMetrics.map((metric) => (
          <AdministrationMetric key={metric.title} metric={metric} />
        ))}
      </div>
    </div>
  );
}

function AdministrationMetric({
  metric,
}: {
  metric: {
    title: string;
    helper: string;
    queryKey: readonly unknown[];
    queryFn: () => Promise<any>;
    icon: LucideIcon;
  };
}) {
  const query = useQuery({
    queryKey: metric.queryKey,
    queryFn: metric.queryFn,
    staleTime: 60_000,
  });
  const Icon = metric.icon;
  const value = query.isLoading ? "..." : String(query.data?.meta?.total ?? query.data?.data?.length ?? 0);

  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{metric.title}</p>
          <p className="text-base font-semibold leading-none">{value}</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-1 text-[11px] text-muted-foreground">{metric.helper}</p>
    </div>
  );
}
