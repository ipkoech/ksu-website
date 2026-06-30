"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import type { ResearchGenericRecord } from "@ksu/api-client";

export function RelatedRecordsGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 lg:grid-cols-2">{children}</div>;
}

export function RelatedRecordsCard({
  title,
  queryKey,
  queryFn,
  emptyLabel,
  metaFields = ["status", "updated_at"],
}: {
  title: string;
  queryKey: readonly unknown[];
  queryFn: () => Promise<{ data?: ResearchGenericRecord[] }>;
  emptyLabel: string;
  metaFields?: string[];
}) {
  const query = useQuery({ queryKey, queryFn });
  const records = query.data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading related records...</p>
        ) : query.isError ? (
          <p className="text-sm text-destructive">Unable to load related records.</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="divide-y rounded-md border">
            {records.map((record) => (
              <div key={record.id} className="p-3">
                <p className="font-medium">{record.title ?? record.name ?? record.code ?? "Untitled related record"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {metaFields.map((field) => record[field]).filter(Boolean).join(" - ") || "Related research record"}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
