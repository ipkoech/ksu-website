"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
} from "@ksu/api-client";
import { Alert, AlertDescription, Badge, Button, Input, Skeleton } from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";

export function SchoolAuditPage() {
  const { school } = useSchoolPortal();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const action = searchParams.get("action") || "";
  const resourceType = searchParams.get("resource_type") || "";
  const status = searchParams.get("status") || "";
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

  const updateUrl = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <main className="space-y-5 p-4 sm:p-6 lg:p-8">
      <header>
        <p className="text-sm font-medium text-primary">Governance</p>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Trail</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review school-scoped administrative activity and outcomes.
        </p>
      </header>

      <section aria-label="Audit filters" className="grid gap-3 sm:grid-cols-3">
        <Input
          aria-label="Filter by action"
          placeholder="Action"
          value={action}
          onChange={(event) => updateUrl("action", event.target.value)}
        />
        <Input
          aria-label="Filter by resource type"
          placeholder="Resource type"
          value={resourceType}
          onChange={(event) => updateUrl("resource_type", event.target.value)}
        />
        <Input
          aria-label="Filter by status"
          placeholder="Status"
          value={status}
          onChange={(event) => updateUrl("status", event.target.value)}
        />
      </section>

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
        <div className="overflow-x-auto rounded-lg border bg-background">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {auditQuery.data?.data.map((entry) => (
                <tr key={entry.id} className="align-top">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {new Date(entry.happened_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-medium">{entry.action}</td>
                  <td className="px-4 py-3">
                    <span className="block">{entry.resource_type || "—"}</span>
                    <span className="block max-w-56 truncate text-xs text-muted-foreground">
                      {entry.resource_id || entry.request_path}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {entry.user_id || "System"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={entry.status === "success" ? "secondary" : "destructive"}>
                      {entry.status} · {entry.status_code}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {auditQuery.data?.data.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              No audit entries match the selected filters.
            </div>
          ) : null}
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
    </main>
  );
}
