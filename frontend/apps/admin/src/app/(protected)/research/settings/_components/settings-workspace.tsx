"use client";

import { useQuery } from "@tanstack/react-query";
import { Activity, FileText, ImageIcon, MessageSquare, Settings, Wifi } from "lucide-react";
import { auditLogsApi, realtimeApi, slidersApi } from "@ksu/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import {
  labelize,
  researchCount,
  ResearchWorkspaceHeader,
} from "../../_components/research-workspace";

export const settingsTabs = [
  { label: "General", href: "/research/settings/general" },
  { label: "Services", href: "/research/settings/services" },
  { label: "Resources", href: "/research/settings/resources" },
  { label: "Guidelines", href: "/research/settings/guidelines" },
  { label: "Sliders", href: "/research/settings/sliders" },
];

export function ResearchSettingsWorkspaceHeader() {
  return (
    <div className="space-y-3">
      <ResearchWorkspaceHeader
        tabs={settingsTabs}
        metrics={[
          { title: "General Settings", queryKey: ["research", "settings", "metrics", "general"], queryFn: () => researchCount("donationSettings", { is_active: true }), icon: <Settings className="h-4 w-4" /> },
          { title: "Services", queryKey: ["research", "settings", "metrics", "services"], queryFn: () => researchCount("services", { is_active: true }), icon: <MessageSquare className="h-4 w-4" /> },
          { title: "Resources", queryKey: ["research", "settings", "metrics", "resources"], queryFn: () => researchCount("resources", { is_active: true }), icon: <FileText className="h-4 w-4" /> },
          { title: "Guidelines", queryKey: ["research", "settings", "metrics", "guidelines"], queryFn: () => researchCount("guidelines", { is_active: true }), icon: <FileText className="h-4 w-4" /> },
          { title: "Sliders", queryKey: ["research", "settings", "metrics", "sliders"], queryFn: () => slidersApi.listAdminSliders({ scope_type: "research" }), icon: <ImageIcon className="h-4 w-4" /> },
        ]}
      />
      <ResearchSettingsOperationsPanel />
    </div>
  );
}

function ResearchSettingsOperationsPanel() {
  const auditQuery = useQuery({
    queryKey: ["research", "settings", "audit-preview"],
    queryFn: () => auditLogsApi.list({ service_name: "research", per_page: 4 }),
  });
  const realtimeQuery = useQuery({
    queryKey: ["research", "settings", "realtime-config"],
    queryFn: () => realtimeApi.researchConfig(),
  });
  const audits = auditQuery.data?.data ?? [];
  const realtimeConfig = realtimeQuery.data?.data;

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4" />
            Recent Research Changes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {auditQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading audit trail...</p>
          ) : audits.length ? (
            audits.map((log) => (
              <div key={log.id} className="rounded-md border p-2 text-sm">
                <p className="font-medium">{labelize(log.action)}</p>
                <p className="text-xs text-muted-foreground">
                  {[labelize(log.entity_type), new Date(log.created_at).toLocaleString()].filter(Boolean).join(" · ")}
                </p>
              </div>
            ))
          ) : (
            <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
              No research audit records were returned by the admin audit endpoint.
            </p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Wifi className="h-4 w-4" />
            Realtime Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-md border p-3 text-sm">
            <p className="font-medium">{realtimeConfig?.websocket_path ?? "/api/v1/realtime"}</p>
            {realtimeQuery.isLoading ? (
              <p className="mt-1 text-xs text-muted-foreground">Loading research realtime configuration...</p>
            ) : realtimeQuery.isError ? (
              <p className="mt-1 text-xs text-destructive">Research realtime configuration could not be loaded.</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Research uses the authenticated websocket with {realtimeConfig?.heartbeat_seconds ?? 25}s heartbeat and explicit research channels.
              </p>
            )}
          </div>
          {realtimeConfig?.channels?.length ? (
            <div className="flex flex-wrap gap-2">
              {realtimeConfig.channels.map((channel) => (
                <span key={channel} className="rounded-md border px-2 py-1 text-xs text-muted-foreground">
                  {channel}
                </span>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
