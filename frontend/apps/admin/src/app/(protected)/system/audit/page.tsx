"use client";

import * as React from "react";
import { Button } from "@ksu/ui/components";
import { DataTable, PageHeader, Badge } from "@ksu/ui/components";
import { SlidersHorizontal, X, ChevronRight, Clock, User, Globe, Terminal, AlertCircle } from "lucide-react";
import { useAuditLogs } from "@ksu/api-client/hooks/admin";
import type { AuditLog } from "@ksu/api-client/types/admin";

const SERVICE_OPTIONS = [
  { value: "main", label: "Main Service" },
  { value: "library", label: "Library Service" },
  { value: "research", label: "Research Service" },
];

const RESOURCE_OPTIONS = [
  { value: "users", label: "Users" },
  { value: "roles", label: "Roles" },
  { value: "permissions", label: "Permissions" },
  { value: "settings", label: "Settings" },
  { value: "media", label: "Media" },
];

export default function AuditPage() {
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(20);
  const [filtersOpen, setFiltersOpen] = React.useState(false);
  const [resourceType, setResourceType] = React.useState<string | null>(null);
  const [serviceName, setServiceName] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<string | null>(null);
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);

  const audit = useAuditLogs({
    page,
    limit,
    resource_type: resourceType ?? undefined,
    service_name: serviceName ?? undefined,
    status: status ?? undefined,
  });

  const activeFiltersCount = [resourceType, serviceName, status].filter(Boolean).length;

  const clearFilters = () => {
    setResourceType(null);
    setServiceName(null);
    setStatus(null);
  };

  const getStatusBadge = (code: number) => {
    if (code >= 200 && code < 300) return <Badge variant="success">{code}</Badge>;
    if (code >= 400 && code < 500) return <Badge variant="warning">{code}</Badge>;
    if (code >= 500) return <Badge variant="destructive">{code}</Badge>;
    return <Badge variant="secondary">{code}</Badge>;
  };

  return (
    <div className="relative flex h-[calc(100vh-8rem)]">
      <div className="flex-1 overflow-auto p-6">
        <PageHeader
          title="Audit logs"
          description="View privileged changes across the platform."
          breadcrumbs={[{ label: "System", href: "/system" }, { label: "Audit logs" }]}
        />
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen(true)}
                className="gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              {activeFiltersCount > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {resourceType && (
                <Badge variant="outline" className="gap-1">
                  Resource: {resourceType}
                  <button onClick={() => setResourceType(null)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {serviceName && (
                <Badge variant="outline" className="gap-1">
                  Service: {serviceName}
                  <button onClick={() => setServiceName(null)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {status && (
                <Badge variant="outline" className="gap-1">
                  Status: {status}
                  <button onClick={() => setStatus(null)} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          <DataTable<AuditLog>
            columns={[
              { key: "happened_at", header: "Time", cell: (row) => new Date(row.happened_at).toLocaleString(), sortable: true },
              { key: "service_name", header: "Service", cell: (row) => <span className="capitalize">{row.service_name}</span> },
              { key: "action", header: "Action", cell: (row) => <span className="capitalize">{row.action}</span> },
              { key: "resource_type", header: "Resource", cell: (row) => row.resource_type ?? "-" },
              { key: "user", header: "User", cell: (row) => row.user?.full_name ?? row.user?.email ?? "System" },
              { key: "status_code", header: "Status", cell: (row) => getStatusBadge(row.status_code) },
            ]}
            data={audit.data?.data ?? []}
            pagination={audit.data ? { page: audit.data.meta.page, limit: audit.data.meta.per_page, total: audit.data.meta.total, totalPages: audit.data.meta.pages } : { page, limit, total: 0, totalPages: 1 }}
            onPaginationChange={(nextPage, nextLimit) => {
              setPage(nextPage);
              setLimit(nextLimit);
            }}
            isLoading={audit.isLoading}
            onRowClick={(row) => setSelectedLog(row)}
          />
        </div>
      </div>

      {/* Side Panel */}
      <div
        className={`fixed right-0 top-0 z-40 h-full w-full max-w-md transform border-l bg-background transition-transform duration-300 ease-in-out ${
          selectedLog ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">Audit Details</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedLog(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Timestamp</div>
                  <div className="font-medium">{selectedLog && new Date(selectedLog.happened_at).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">Service</div>
                  <div className="font-medium capitalize">{selectedLog?.service_name}</div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Terminal className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">Request</div>
                  <div className="font-muncate rounded bg-muted px-2 py-1 text-sm">
                    <span className="font-semibold">{selectedLog?.request_method}</span> {selectedLog?.request_path}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-muted-foreground">Action</div>
                  <div className="capitalize">{selectedLog?.action}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Resource</div>
                  <div>{selectedLog?.resource_type ?? "-"}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <div>{selectedLog && getStatusBadge(selectedLog.status_code)}</div>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-xs text-muted-foreground">User</div>
                  <div className="font-medium">{selectedLog?.user?.full_name ?? selectedLog?.user?.email ?? "System"}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground">IP Address</div>
                <div className="font-mono text-sm">{selectedLog?.ip_address ?? "-"}</div>
              </div>

              {selectedLog?.error_message && (
                <div className="flex items-start gap-2 rounded border border-destructive/50 bg-destructive/10 p-3">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <div>
                    <div className="text-xs font-medium text-destructive">Error</div>
                    <div className="text-sm text-destructive">{selectedLog.error_message}</div>
                  </div>
                </div>
              )}

              {selectedLog?.details && (
                <div>
                  <div className="mb-2 text-xs text-muted-foreground">Details</div>
                  <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Dialog */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" size="icon" onClick={() => setFiltersOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Service</label>
                <select
                  className="w-full rounded-md border p-2"
                  value={serviceName ?? ""}
                  onChange={(e) => setServiceName(e.target.value || null)}
                >
                  <option value="">All services</option>
                  {SERVICE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource Type</label>
                <select
                  className="w-full rounded-md border p-2"
                  value={resourceType ?? ""}
                  onChange={(e) => setResourceType(e.target.value || null)}
                >
                  <option value="">All resources</option>
                  {RESOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full rounded-md border p-2"
                  value={status ?? ""}
                  onChange={(e) => setStatus(e.target.value || null)}
                >
                  <option value="">All statuses</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                  <option value="warning">Warning</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={clearFilters}>Clear</Button>
              <Button onClick={() => setFiltersOpen(false)}>Apply</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
