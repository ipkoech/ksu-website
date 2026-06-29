"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Card, CardContent } from "@ksu/ui/components";
import { cn } from "@ksu/ui/lib";
import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import {
  relationshipAdapters,
  type RelationshipAdapter,
} from "@/components/relationships/relationship-adapters";

type CountQuery = () => Promise<{ meta?: { total?: number }; data?: unknown[] }>;

export function ResearchWorkspaceHeader({
  metrics,
  tabs,
}: {
  metrics: Array<{ title: string; queryKey: readonly unknown[]; queryFn: CountQuery; icon: ReactNode }>;
  tabs: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <ResearchMetric key={metric.title} {...metric} />
        ))}
      </div>
      <ResearchWorkspaceTabs tabs={tabs} />
    </div>
  );
}

function ResearchMetric({
  title,
  queryKey,
  queryFn,
  icon,
}: {
  title: string;
  queryKey: readonly unknown[];
  queryFn: CountQuery;
  icon: ReactNode;
}) {
  const query = useQuery({ queryKey, queryFn });
  const value = query.data?.meta?.total ?? query.data?.data?.length ?? 0;

  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">{title}</p>
          <p className="mt-1 text-2xl font-semibold">{query.isLoading ? "--" : value.toLocaleString()}</p>
        </div>
        <div className="flex size-9 items-center justify-center rounded-md border bg-muted/30 text-muted-foreground">
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}

export function ResearchWorkspaceTabs({ tabs }: { tabs: Array<{ label: string; href: string }> }) {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto rounded-lg border bg-background p-1">
      <div className="flex min-w-max gap-1">
        {tabs.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function RelationCell({
  id,
  adapterKey,
  emptyLabel,
}: {
  id?: string | null;
  adapterKey: keyof typeof relationshipAdapters;
  emptyLabel: string;
}) {
  const adapter = relationshipAdapters[adapterKey] as RelationshipAdapter;
  const relationQuery = useQuery({
    queryKey: ["research", "workspace-relation", adapterKey, id],
    queryFn: () => adapter.get(id as string),
    enabled: Boolean(id),
    staleTime: 60_000,
  });

  if (!id) return <span className="text-sm text-muted-foreground">{emptyLabel}</span>;
  if (relationQuery.isLoading) return <span className="text-sm text-muted-foreground">Loading...</span>;
  const option = relationQuery.data;
  return (
    <div className="space-y-1">
      <p className="font-medium">{option?.label ?? "Related record unavailable"}</p>
      {option?.description ? <p className="text-xs text-muted-foreground">{option.description}</p> : null}
    </div>
  );
}

export function StatusBadge({ value }: { value?: string | null }) {
  return <Badge variant="outline">{labelize(value) || "Unspecified"}</Badge>;
}

export function DateValue({ value }: { value?: string | null }) {
  return <span>{formatDate(value) || "No date"}</span>;
}

export function MoneyValue({
  amount,
  currency,
}: {
  amount?: string | number | null;
  currency?: string | null;
}) {
  if (amount === null || amount === undefined || amount === "") {
    return <span className="text-sm text-muted-foreground">No amount</span>;
  }
  const numeric = Number(amount);
  return (
    <span className="font-medium">
      {currency ?? "KES"} {Number.isFinite(numeric) ? numeric.toLocaleString() : String(amount)}
    </span>
  );
}

export function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function labelize(value?: string | null) {
  if (!value) return "";
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function titleOf(record: ResearchGenericRecord) {
  return record.title ?? record.name ?? record.display_name ?? record.organization_name ?? record.code ?? "Untitled";
}

export function researchCount(resource: keyof typeof researchServiceApi, params: Record<string, any> = {}) {
  const api = researchServiceApi[resource];
  if (!api || typeof api !== "object" || !("list" in api)) {
    return Promise.resolve({ data: [] });
  }
  return (api as { list: (params?: Record<string, any>) => Promise<{ data?: unknown[]; meta?: { total?: number } }> }).list({
    page: 1,
    per_page: 1,
    fields: "id",
    ...params,
  });
}

