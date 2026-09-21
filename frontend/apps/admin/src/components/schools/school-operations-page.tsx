"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ClipboardList, FileBarChart, FolderOpen, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from "@ksu/ui/components";
import { schoolPortalApi, schoolPortalQueryKeys } from "@ksu/api-client";
import { useSchoolPortal } from "./school-portal-provider";
import { SchoolWorkspace, SchoolWorkspaceHeader } from "./shared/school-workspace";

export function SchoolOperationsPage({ kind }: { kind: "queue" | "reports" | "documents" }) {
  const { school, capabilities } = useSchoolPortal();
  const canViewDashboard = capabilities["school.dashboard.view"] === true;
  const query = useQuery({ queryKey: schoolPortalQueryKeys.dashboard(school.id, "30d"), enabled: canViewDashboard, queryFn: async () => (await schoolPortalApi.dashboard("30d")).data });
  const queueQuery = useQuery({
    queryKey: ["school-work-queue", school.id],
    enabled: canViewDashboard && kind === "queue",
    queryFn: async () => (await schoolPortalApi.workQueue()).data.items,
  });
  const config = { queue: ["Work queue", "Backend-supported school follow-up items and due work.", ClipboardList], reports: ["Reports", "Evidence-led reports from authorized school data.", FileBarChart], documents: ["Documents & evidence", "Required school evidence, verification, and expiry information.", FolderOpen] }[kind] as [string, string, typeof ClipboardList];
  const dashboard = query.data;
  const items = kind === "queue" ? queueQuery.data : dashboard?.quick_links;
  if (!canViewDashboard) {
    return <SchoolWorkspace><SchoolWorkspaceHeader eyebrow="School administration" title={config[0]} description="This workspace is unavailable in the active authorization scope." icon={config[2]} /><Alert><AlertTitle>Access restricted</AlertTitle><AlertDescription>Your current workspace permissions do not include access to this school workspace.</AlertDescription></Alert></SchoolWorkspace>;
  }
  return <SchoolWorkspace><SchoolWorkspaceHeader eyebrow="School administration" title={config[0]} description={config[1]} icon={config[2]} actions={<Button variant="outline" onClick={() => void Promise.all([query.refetch(), kind === "queue" ? queueQuery.refetch() : Promise.resolve()])} disabled={query.isFetching || queueQuery.isFetching}><RefreshCw className={query.isFetching || queueQuery.isFetching ? "mr-2 size-4 animate-spin" : "mr-2 size-4"} />Refresh</Button>} />{query.isPending || queueQuery.isPending ? <Skeleton className="h-64" /> : query.error || queueQuery.error ? <Alert variant="destructive"><AlertTitle>Unable to load workspace</AlertTitle><AlertDescription><Button variant="outline" onClick={() => void query.refetch()}>Retry</Button></AlertDescription></Alert> : <>{kind === "queue" ? <div className="grid gap-3 sm:grid-cols-3"><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Open</p><p className="text-2xl font-semibold">{dashboard?.attention_items?.reduce((sum, item) => sum + item.count, 0) ?? 0}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Priority</p><p className="text-2xl font-semibold">{dashboard?.attention_items?.filter((item) => item.severity === "critical").reduce((sum, item) => sum + item.count, 0) ?? 0}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Recent activity</p><p className="text-2xl font-semibold">{dashboard?.recent_activity?.length ?? 0}</p></CardContent></Card></div> : null}<Card><CardHeader><CardTitle>{kind === "queue" ? "Open follow-up" : kind === "reports" ? "Available reporting data" : "Evidence overview"}</CardTitle></CardHeader><CardContent className="space-y-3">{items?.map((item: any) => <Link key={item.key ?? item.id} href={item.href} className="flex items-center justify-between rounded-md border p-3 text-sm hover:bg-muted"><span>{item.label ?? item.title}</span><Badge variant="secondary">{item.count ?? "Open"}</Badge></Link>) ?? <p className="text-sm text-muted-foreground">No records are available in the active school scope.</p>}</CardContent></Card></>}</SchoolWorkspace>;
}
