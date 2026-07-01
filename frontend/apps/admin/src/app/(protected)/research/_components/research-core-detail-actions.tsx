"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ResearchGenericRecord, type ResearchGenericPayload } from "@ksu/api-client";
import { toast } from "@ksu/ui";
import {
  Button,
  Input,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
} from "@ksu/ui/components";
import { Edit3, Eye, EyeOff, Star, StarOff, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

type CoreDetailResource = {
  update: (id: string, data: Partial<ResearchGenericPayload>) => Promise<{ data: ResearchGenericRecord }>;
  delete: (id: string) => Promise<void>;
};

type CoreActionConfirmation = {
  title: string;
  description: string;
  confirmText: string;
  variant?: "default" | "warning" | "destructive" | "success";
  payload?: Partial<ResearchGenericPayload>;
  deleteRecord?: boolean;
};

export function ResearchCoreDetailActions({
  record,
  resource,
  resourceLabel,
  listHref,
}: {
  record: ResearchGenericRecord;
  resource: CoreDetailResource;
  resourceLabel: string;
  listHref: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [confirmation, setConfirmation] = useState<CoreActionConfirmation | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const editableFields = useMemo(() => getEditableFields(record), [record]);
  const [editValues, setEditValues] = useState<Record<string, string | boolean>>(() => buildEditValues(record, editableFields));
  const id = String(record.id);
  const isActive = record.is_active !== false;
  const isFeatured = Boolean(record.is_featured);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<ResearchGenericPayload>) => resource.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["research-detail"] });
      setEditOpen(false);
      toast.success(`${resourceLabel} updated`);
    },
    onError: () => toast.error(`Failed to update ${resourceLabel.toLowerCase()}`),
  });

  const deleteMutation = useMutation({
    mutationFn: () => resource.delete(id),
    onSuccess: () => {
      toast.success(`${resourceLabel} deleted`);
      router.push(listHref);
      router.refresh();
    },
    onError: () => toast.error(`Failed to delete ${resourceLabel.toLowerCase()}`),
  });

  const busy = updateMutation.isPending || deleteMutation.isPending;
  const openEdit = () => {
    setEditValues(buildEditValues(record, editableFields));
    setEditOpen(true);
  };
  const submitEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    updateMutation.mutate(buildPayload(editValues, editableFields));
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="outline" disabled={busy} onClick={openEdit}>
          <Edit3 className="mr-2 h-4 w-4" />
          Edit {resourceLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => setConfirmation({
            title: isActive ? `Deactivate ${resourceLabel.toLowerCase()}` : `Activate ${resourceLabel.toLowerCase()}`,
            description: isActive ? "Hide this record from active research workflows without deleting it." : "Return this record to active research workflows.",
            confirmText: isActive ? "Deactivate" : "Activate",
            variant: isActive ? "warning" : "success",
            payload: { is_active: !isActive },
          })}
        >
          {isActive ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
          {isActive ? "Deactivate" : "Activate"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={busy}
          onClick={() => setConfirmation({
            title: isFeatured ? `Remove featured ${resourceLabel.toLowerCase()}` : `Feature ${resourceLabel.toLowerCase()}`,
            description: isFeatured ? "Remove this record from featured research displays." : "Mark this record as featured for research displays.",
            confirmText: isFeatured ? "Remove featured" : "Feature",
            payload: { is_featured: !isFeatured },
          })}
        >
          {isFeatured ? <StarOff className="mr-2 h-4 w-4" /> : <Star className="mr-2 h-4 w-4" />}
          {isFeatured ? "Unfeature" : "Feature"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="text-destructive hover:text-destructive"
          disabled={busy}
          onClick={() => setConfirmation({
            title: `Delete ${resourceLabel.toLowerCase()}`,
            description: "Delete this record permanently. This should only be used when the backend has no dependent records that need to remain linked.",
            confirmText: "Delete",
            variant: "destructive",
            deleteRecord: true,
          })}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
      <Sheet open={editOpen} onOpenChange={(open) => !busy && setEditOpen(open)}>
        <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
          <SheetHeader className="border-b px-6 py-5">
            <SheetTitle>Edit {resourceLabel}</SheetTitle>
            <SheetDescription>Update fields provided by the backend. Relationship mapping stays in the tabs below.</SheetDescription>
          </SheetHeader>
          <form onSubmit={submitEdit} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {editableFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-sm font-medium" htmlFor={`core-edit-${field.name}`}>{field.label}</label>
                  {field.kind === "boolean" ? (
                    <div className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span className="text-sm text-muted-foreground">{editValues[field.name] ? "Enabled" : "Disabled"}</span>
                      <Switch
                        id={`core-edit-${field.name}`}
                        checked={Boolean(editValues[field.name])}
                        onCheckedChange={(checked) => setEditValues((current) => ({ ...current, [field.name]: checked }))}
                      />
                    </div>
                  ) : field.kind === "long" || field.kind === "json" ? (
                    <textarea
                      id={`core-edit-${field.name}`}
                      className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={String(editValues[field.name] ?? "")}
                      onChange={(event) => setEditValues((current) => ({ ...current, [field.name]: event.target.value }))}
                    />
                  ) : (
                    <Input
                      id={`core-edit-${field.name}`}
                      type={field.kind === "number" ? "number" : "text"}
                      value={String(editValues[field.name] ?? "")}
                      onChange={(event) => setEditValues((current) => ({ ...current, [field.name]: event.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>
            <SheetFooter className="border-t px-6 py-4">
              <Button type="button" variant="outline" disabled={busy} onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{updateMutation.isPending ? "Saving..." : "Save changes"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={Boolean(confirmation)}
        onOpenChange={(open) => !open && setConfirmation(null)}
        title={confirmation?.title ?? "Confirm action"}
        description={confirmation?.description ?? ""}
        confirmText={confirmation?.confirmText ?? "Confirm"}
        variant={confirmation?.variant}
        isLoading={busy}
        onConfirm={() => {
          if (confirmation?.deleteRecord) {
            deleteMutation.mutate();
          } else if (confirmation?.payload) {
            updateMutation.mutate(confirmation.payload);
          }
          setConfirmation(null);
        }}
      />
    </>
  );
}

type EditableField = {
  name: string;
  label: string;
  kind: "text" | "long" | "number" | "boolean" | "json";
};

const HIDDEN_EDIT_FIELDS = new Set([
  "id",
  "created_at",
  "updated_at",
  "deleted_at",
]);

function getEditableFields(record: ResearchGenericRecord): EditableField[] {
  return Object.entries(record)
    .filter(([key, value]) => !HIDDEN_EDIT_FIELDS.has(key) && value !== null && typeof value !== "object")
    .map(([key, value]) => ({
      name: key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()),
      kind: typeof value === "boolean" ? "boolean" : typeof value === "number" ? "number" : String(value).length > 140 ? "long" : "text",
    }));
}

function buildEditValues(record: ResearchGenericRecord, fields: EditableField[]) {
  return fields.reduce<Record<string, string | boolean>>((values, field) => {
    const value = record[field.name];
    values[field.name] = typeof value === "boolean" ? value : value == null ? "" : String(value);
    return values;
  }, {});
}

function buildPayload(values: Record<string, string | boolean>, fields: EditableField[]) {
  return fields.reduce<Partial<ResearchGenericPayload>>((payload, field) => {
    const value = values[field.name];
    if (field.kind === "boolean") {
      payload[field.name] = Boolean(value);
      return payload;
    }
    if (field.kind === "number") {
      payload[field.name] = value === "" ? null : Number(value);
      return payload;
    }
    payload[field.name] = value === "" ? null : value;
    return payload;
  }, {});
}
