"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "@ksu/ui/components";
import type { ResearchGenericRecord } from "@ksu/api-client";
import { Link2, Search, Unlink } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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

type RelationshipConfirmation = {
  title: string;
  description: string;
  confirmText: string;
  variant?: "default" | "warning" | "destructive" | "success";
  onConfirm: () => void;
};

type BindableRecordsCardProps = {
  title: string;
  addLabel: string;
  relationshipLabel: string;
  queryKey: readonly unknown[];
  queryFn: () => Promise<{ data?: ResearchGenericRecord[] }>;
  candidateQueryFn: (search: string) => Promise<{ data?: ResearchGenericRecord[] }>;
  bindRecord: (recordId: string) => Promise<unknown>;
  unbindRecord: (recordId: string) => Promise<unknown>;
  emptyLabel: string;
  searchPlaceholder: string;
  metaFields?: string[];
  invalidateKeys?: Array<readonly unknown[]>;
};

export function BindableRecordsCard({
  title,
  addLabel,
  relationshipLabel,
  queryKey,
  queryFn,
  candidateQueryFn,
  bindRecord,
  unbindRecord,
  emptyLabel,
  searchPlaceholder,
  metaFields = ["code", "status"],
  invalidateKeys = [],
}: BindableRecordsCardProps) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [confirmation, setConfirmation] = useState<RelationshipConfirmation | null>(null);
  const linkedQuery = useQuery({ queryKey, queryFn });
  const linkedRecords = linkedQuery.data?.data ?? [];
  const linkedIds = useMemo(() => new Set(linkedRecords.map((record) => String(record.id))), [linkedRecords]);
  const candidatesQuery = useQuery({
    queryKey: [...queryKey, "candidates", search],
    queryFn: () => candidateQueryFn(search),
    enabled: dialogOpen,
  });
  const candidates = (candidatesQuery.data?.data ?? []).filter((record) => !linkedIds.has(String(record.id)));

  const invalidate = async () => {
    await Promise.all([queryKey, ...invalidateKeys].map((key) => queryClient.invalidateQueries({ queryKey: key })));
  };

  const bindMutation = useMutation({
    mutationFn: bindRecord,
    onSuccess: async () => {
      await invalidate();
      setDialogOpen(false);
      toast.success(`${relationshipLabel} linked`);
    },
    onError: () => toast.error(`Failed to link ${relationshipLabel.toLowerCase()}`),
  });

  const unbindMutation = useMutation({
    mutationFn: unbindRecord,
    onSuccess: async () => {
      await invalidate();
      toast.success(`${relationshipLabel} removed`);
    },
    onError: () => toast.error(`Failed to remove ${relationshipLabel.toLowerCase()}`),
  });

  const recordLabel = (record: ResearchGenericRecord) => String(record.title ?? record.name ?? record.code ?? "Untitled record");
  const recordMeta = (record: ResearchGenericRecord) => metaFields.map((field) => record[field]).filter(Boolean).join(" - ");
  const busy = bindMutation.isPending || unbindMutation.isPending;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b py-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {title}
            <Badge variant="secondary" className="rounded-sm px-1.5 py-0 text-[11px]">{linkedRecords.length}</Badge>
          </CardTitle>
          <Button type="button" size="sm" onClick={() => setDialogOpen(true)}>
            <Link2 className="mr-2 h-4 w-4" />
            {addLabel}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {linkedQuery.isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading linked records...</p>
          ) : linkedQuery.isError ? (
            <p className="p-4 text-sm text-destructive">Unable to load linked records.</p>
          ) : linkedRecords.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">{emptyLabel}</p>
          ) : (
            <div className="max-h-[320px] overflow-y-auto">
              {linkedRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{recordLabel(record)}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{recordMeta(record) || relationshipLabel}</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => setConfirmation({
                      title: `Unbind ${relationshipLabel.toLowerCase()}`,
                      description: `Remove the relationship between this record and "${recordLabel(record)}"? The related record itself will not be deleted.`,
                      confirmText: "Unbind",
                      variant: "destructive",
                      onConfirm: () => unbindMutation.mutate(String(record.id)),
                    })}
                  >
                    <Unlink className="mr-2 h-4 w-4" />
                    Unbind
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{addLabel}</DialogTitle>
            <DialogDescription>Select an existing record to bind as {relationshipLabel.toLowerCase()}.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={searchPlaceholder} className="pl-9" />
          </div>
          <div className="rounded-md border">
            {candidatesQuery.isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">Loading available records...</p>
            ) : candidatesQuery.isError ? (
              <p className="p-4 text-sm text-destructive">Unable to load available records.</p>
            ) : candidates.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">No available records to bind.</p>
            ) : (
              <div className="max-h-[360px] overflow-y-auto">
                {candidates.map((record) => (
                  <div key={record.id} className="flex items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{recordLabel(record)}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{recordMeta(record) || relationshipLabel}</p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={busy}
                      onClick={() => setConfirmation({
                        title: `Bind ${relationshipLabel.toLowerCase()}`,
                        description: `Bind "${recordLabel(record)}" as ${relationshipLabel.toLowerCase()}?`,
                        confirmText: "Bind",
                        onConfirm: () => bindMutation.mutate(String(record.id)),
                      })}
                    >
                      Bind
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} disabled={busy}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => !open && setConfirmation(null)}
        title={confirmation?.title ?? "Confirm relationship change"}
        description={confirmation?.description ?? ""}
        confirmText={confirmation?.confirmText ?? "Confirm"}
        variant={confirmation?.variant}
        isLoading={busy}
        onConfirm={() => {
          confirmation?.onConfirm();
          setConfirmation(null);
        }}
      />
    </>
  );
}
