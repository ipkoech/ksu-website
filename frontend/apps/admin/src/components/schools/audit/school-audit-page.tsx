"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
} from "@ksu/api-client";
import {
  Activity,
  AlertTriangle,
  Check,
  ChevronRight,
  CircleCheck,
  Clock3,
  Database,
  Fingerprint,
  ListFilter,
  Route,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import {
  SchoolFilterBar,
  SchoolMetricGrid,
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "@/components/schools/shared/school-workspace";

export function SchoolAuditPage() {
  const { school } = useSchoolPortal();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const action = searchParams.get("action") || "";
  const resourceType = searchParams.get("resource_type") || "";
  const status = searchParams.get("status") || "";
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const auditQuery = useQuery({
    queryKey: [
      ...schoolPortalQueryKeys.audit(school.id),
      { page, action, resourceType, status },
    ],
    queryFn: () =>
      schoolPortalApi.audit.list({
        page,
        per_page: 25,
        action: action || undefined,
        resource_type: resourceType || undefined,
        status: status || undefined,
      }),
  });
  const teamQuery = useQuery({
    queryKey: [...schoolPortalQueryKeys.team(school.id), { purpose: "audit-actor-labels" }],
    queryFn: () => schoolPortalApi.team.list({ page: 1, per_page: 100 }),
    staleTime: 5 * 60 * 1000,
  });
  const actorNames = new Map(
    (teamQuery.data?.data ?? [])
      .filter((member) => member.user_id)
      .map((member) => [member.user_id!, member.full_name || member.email || "School user"]),
  );
  const entries = auditQuery.data?.data ?? [];
  const selected = entries.find((entry) => entry.id === selectedId) ?? entries[0] ?? null;

  const updateUrl = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="Governance"
        title="Audit trail"
        description="A school-scoped record of administrative actions, affected resources, actors and their outcomes."
        schoolName={school.name}
        icon={ShieldCheck}
      />
      <SchoolMetricGrid items={[
        { label: "Recorded events", value: auditQuery.data?.meta.total ?? 0, detail: "Across current filters", icon: Activity },
        { label: "Successful", value: auditQuery.data?.data.filter((item) => item.status === "success").length ?? 0, detail: "Completed on this page", icon: CircleCheck, tone: "success" },
        { label: "Actors", value: new Set(auditQuery.data?.data.map((item) => item.user_id).filter(Boolean) ?? []).size, detail: "Distinct users on this page", icon: UserRound, tone: "info" },
        { label: "Action types", value: new Set(auditQuery.data?.data.map((item) => item.action) ?? []).size, detail: "Distinct operations", icon: ListFilter, tone: "warning" },
      ]} />
      <SchoolFilterBar label="Filter audit events">
      <section className="grid gap-3 sm:grid-cols-3">
        <Input
          aria-label="Filter by action"
          placeholder="Action"
          defaultValue={action}
          onKeyDown={(event) => event.key === "Enter" && updateUrl("action", event.currentTarget.value.trim())}
        />
        <Input
          aria-label="Filter by resource type"
          placeholder="Resource type"
          defaultValue={resourceType}
          onKeyDown={(event) => event.key === "Enter" && updateUrl("resource_type", event.currentTarget.value.trim())}
        />
        <Select value={status || "all"} onValueChange={(value) => updateUrl("status", value === "all" ? "" : value)}>
          <SelectTrigger aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All outcomes</SelectItem>
            <SelectItem value="success">Successful</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </section>
      </SchoolFilterBar>

      {auditQuery.error ? (
        <Alert variant="destructive">
          <AlertDescription>{auditQuery.error.message}</AlertDescription>
        </Alert>
      ) : null}

      {auditQuery.isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,.75fr)]">
          <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
            <header className="flex items-center justify-between border-b bg-muted/20 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">Activity stream</h2>
                <p className="text-xs text-muted-foreground">Select an event to inspect its full context.</p>
              </div>
              <Badge variant="outline">{entries.length} on page</Badge>
            </header>
            <div className="divide-y">
              {entries.map((entry) => {
                const successful = entry.status === "success";
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={`group flex w-full cursor-pointer gap-3 p-4 text-left transition-colors duration-200 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${selected?.id === entry.id ? "bg-primary/[0.045]" : ""}`}
                    onClick={() => setSelectedId(entry.id)}
                  >
                    <span className={`mt-0.5 rounded-full p-2 ${successful ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-destructive/10 text-destructive"}`}>
                      {successful ? <Check className="size-4" /> : <AlertTriangle className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm">{humanize(entry.action)}</strong>
                        <Badge variant={successful ? "secondary" : "destructive"}>{entry.status_code}</Badge>
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {entry.resource_type || "Portal"} · {entry.user_id ? actorNames.get(entry.user_id) || "School user" : "System"}
                      </span>
                      <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock3 className="size-3" />{new Date(entry.happened_at).toLocaleString()}
                      </span>
                    </span>
                    <ChevronRight className="mt-3 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
            {!entries.length ? (
              <div className="px-6 py-16 text-center">
                <ShieldCheck className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-3 font-medium">No audit events found</p>
                <p className="mt-1 text-sm text-muted-foreground">Change the filters to broaden the activity view.</p>
              </div>
            ) : null}
          </section>
          <Card className="h-fit shadow-sm xl:sticky xl:top-4">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-base">Event details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-4">
              {selected ? (
                <>
                  <div>
                    <Badge variant={selected.status === "success" ? "secondary" : "destructive"}>{selected.status}</Badge>
                    <h2 className="mt-2 text-lg font-semibold">{humanize(selected.action)}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(selected.happened_at).toLocaleString()}</p>
                  </div>
                  <div className="grid gap-3 text-sm">
                    <Detail icon={UserRound} label="Actor" value={selected.user_id ? actorNames.get(selected.user_id) || "School user" : "System process"} />
                    <Detail icon={Database} label="Resource" value={`${selected.resource_type || "Portal"}${selected.resource_id ? ` · ${selected.resource_id}` : ""}`} />
                    <Detail icon={Route} label="Request" value={`${selected.request_method} ${selected.request_path}`} />
                    <Detail icon={Fingerprint} label="Event ID" value={selected.id} />
                  </div>
                  {selected.details || selected.changes ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recorded context</p>
                      <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-[11px] leading-5">
                        {JSON.stringify(selected.changes || selected.details, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">No additional change payload was recorded for this event.</p>
                  )}
                </>
              ) : <p className="text-sm text-muted-foreground">Select an audit event to see its details.</p>}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => updateUrl("page", String(page - 1))}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= (auditQuery.data?.meta.pages ?? 1)}
          onClick={() => updateUrl("page", String(page + 1))}
        >
          Next
        </Button>
      </div>
    </SchoolWorkspace>
  );
}

function humanize(value: string) {
  return value.replaceAll(/[._-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-0.5 break-words text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
