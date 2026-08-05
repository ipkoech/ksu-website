"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { auditLogsApi } from "@ksu/api-client";
import type { AuditLog } from "@ksu/api-client";
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

type Tone = "primary" | "success" | "warning" | "danger" | "info";

const TONES: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
};

type CorporateMetric = {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  icon: typeof Activity;
  tone?: Tone;
};

function CorporateWorkspace({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-full bg-muted/20 p-4 sm:p-6 lg:p-8 ${className}`}>
      <div className="mx-auto max-w-[1600px] space-y-5">{children}</div>
    </div>
  );
}

function CorporateWorkspaceHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Activity;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 hidden rounded-xl bg-primary/10 p-2.5 text-primary sm:inline-flex">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          {actions}
        </div>
      ) : null}
    </header>
  );
}

function CorporateMetricGrid({ items }: { items: CorporateMetric[] }) {
  return (
    <section
      aria-label="At a glance"
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
    >
      {items.map(({ label, value, detail, icon: Icon, tone = "primary" }) => (
        <Card key={label} className="overflow-hidden shadow-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <span className={`rounded-xl p-2.5 ${TONES[tone]}`}>
              <Icon className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-2xl font-semibold tracking-tight">
                {value}
              </span>
              <span className="block truncate text-sm font-medium">
                {label}
              </span>
              {detail ? (
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {detail}
                </span>
              ) : null}
            </span>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function CorporateFilterBar({
  children,
  label = "Find and filter",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <section
      aria-label={label}
      className="rounded-xl border bg-background p-3 shadow-sm sm:p-4"
    >
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      {children}
    </section>
  );
}

function humanize(value: string) {
  return value
    .replaceAll(/[._-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
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

export function CorporateAuditPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const resourceType = searchParams.get("resource_type") || "";
  const status = searchParams.get("status") || "";
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const auditQuery = useQuery({
    queryKey: ["corporate-audit", { page, resourceType, status }],
    queryFn: () =>
      auditLogsApi.list({
        page,
        per_page: 25,
        resource_type: resourceType || undefined,
        status: status || undefined,
      }),
  });

  const entries = auditQuery.data?.data ?? [];
  const selected =
    entries.find((entry) => entry.id === selectedId) ?? entries[0] ?? null;

  const updateUrl = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <CorporateWorkspace>
      <CorporateWorkspaceHeader
        eyebrow="Governance"
        title="Audit trail"
        description="A record of administrative actions, affected resources, actors and their outcomes across the platform."
        icon={ShieldCheck}
      />
      <CorporateMetricGrid
        items={[
          {
            label: "Recorded events",
            value: auditQuery.data?.meta?.total ?? 0,
            detail: "Across current filters",
            icon: Activity,
          },
          {
            label: "Successful",
            value: entries.filter((item) => (item.status ?? "success") !== "failed")
              .length,
            detail: "Completed on this page",
            icon: CircleCheck,
            tone: "success",
          },
          {
            label: "Actors",
            value: new Set(entries.map((item) => item.user_id).filter(Boolean))
              .size,
            detail: "Distinct users on this page",
            icon: UserRound,
            tone: "info",
          },
          {
            label: "Action types",
            value: new Set(entries.map((item) => item.action)).size,
            detail: "Distinct operations",
            icon: ListFilter,
            tone: "warning",
          },
        ]}
      />
      <CorporateFilterBar label="Filter audit events">
        {/* The backend audit list supports resource_type and status filters
            only; an action filter would be silently ignored. */}
        <section className="grid gap-3 sm:grid-cols-2">
          <Input
            aria-label="Filter by resource type"
            placeholder="Resource type"
            defaultValue={resourceType}
            onKeyDown={(event) =>
              event.key === "Enter" &&
              updateUrl("resource_type", event.currentTarget.value.trim())
            }
          />
          <Select
            value={status || "all"}
            onValueChange={(value) =>
              updateUrl("status", value === "all" ? "" : value)
            }
          >
            <SelectTrigger aria-label="Filter by status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All outcomes</SelectItem>
              <SelectItem value="success">Successful</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </section>
      </CorporateFilterBar>

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
                <p className="text-xs text-muted-foreground">
                  Select an event to inspect its full context.
                </p>
              </div>
              <Badge variant="outline">{entries.length} on page</Badge>
            </header>
            <div className="divide-y">
              {entries.map((entry) => {
                const successful = (entry.status ?? "success") !== "failed";
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={`group flex w-full cursor-pointer gap-3 p-4 text-left transition-colors duration-200 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${selected?.id === entry.id ? "bg-primary/[0.045]" : ""}`}
                    onClick={() => setSelectedId(entry.id)}
                  >
                    <span
                      className={`mt-0.5 rounded-full p-2 ${successful ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-destructive/10 text-destructive"}`}
                    >
                      {successful ? (
                        <Check className="size-4" />
                      ) : (
                        <AlertTriangle className="size-4" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <strong className="text-sm">
                          {humanize(entry.action)}
                        </strong>
                        <Badge variant={successful ? "secondary" : "destructive"}>
                          {successful ? "OK" : "Error"}
                        </Badge>
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted-foreground">
                        {entry.resource_type || "System"} ·{" "}
                        {entry.user_id ? "User action" : "System process"}
                      </span>
                      <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock3 className="size-3" />
                        {new Date(entry.created_at).toLocaleString()}
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
                <p className="mt-1 text-sm text-muted-foreground">
                  Change the filters to broaden the activity view.
                </p>
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
                    <Badge
                      variant={
                        (selected.status ?? "success") !== "failed"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {selected.status ?? "success"}
                    </Badge>
                    <h2 className="mt-2 text-lg font-semibold">
                      {humanize(selected.action)}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(selected.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="grid gap-3 text-sm">
                    <Detail
                      icon={UserRound}
                      label="Actor"
                      value={selected.user_id || "System process"}
                    />
                    <Detail
                      icon={Database}
                      label="Resource"
                      value={`${selected.resource_type || "System"}${selected.resource_id ? ` · ${selected.resource_id}` : ""}`}
                    />
                    {selected.request_method && selected.request_path ? (
                      <Detail
                        icon={Activity}
                        label="Request"
                        value={`${selected.request_method} ${selected.request_path}`}
                      />
                    ) : null}
                    <Detail
                      icon={Fingerprint}
                      label="Event ID"
                      value={selected.id}
                    />
                    {selected.ip_address ? (
                      <Detail
                        icon={Activity}
                        label="IP Address"
                        value={selected.ip_address}
                      />
                    ) : null}
                  </div>
                  {selected.details || selected.changes ? (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Recorded context
                      </p>
                      <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-3 text-[11px] leading-5">
                        {JSON.stringify(
                          {
                            details: selected.details,
                            changes: selected.changes,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  ) : (
                    <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                      No additional change payload was recorded for this event.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select an audit event to see its details.
                </p>
              )}
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
          disabled={page >= (auditQuery.data?.meta?.pages ?? 1)}
          onClick={() => updateUrl("page", String(page + 1))}
        >
          Next
        </Button>
      </div>
    </CorporateWorkspace>
  );
}
