"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, ConfirmDialog, Input, Switch, RichTextEditor, richTextToPlainText } from "@ksu/ui/components";
import { toast } from "@ksu/ui";

type RecordShape = Record<string, any>;

type FieldType = "text" | "textarea" | "number" | "date" | "datetime-local" | "boolean";

export interface EditableField {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
}

interface EditableServiceResourcePageProps<TRecord extends RecordShape, TPayload extends RecordShape> {
  title: string;
  description: string;
  backHref: string;
  queryKey: readonly unknown[];
  fields: EditableField[];
  list: () => Promise<{ data?: TRecord[] }>;
  create: (payload: TPayload) => Promise<unknown>;
  update: (id: string, payload: Partial<TPayload>) => Promise<unknown>;
  delete?: (id: string) => Promise<unknown>;
  getRecordTitle: (record: TRecord) => string;
  getRecordMeta?: (record: TRecord) => string;
  emptyMessage: string;
  buildPayload?: (values: RecordShape, editingRecord?: TRecord | null) => TPayload;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  readOnlyMessage?: string;
}

function defaultValue(field: EditableField) {
  if (field.type === "boolean") return true;
  if (field.type === "number") return "";
  return "";
}

function recordToValues(fields: EditableField[], record?: RecordShape | null) {
  return Object.fromEntries(
    fields.map((field) => {
      const value = record?.[field.name];
      if (field.type === "boolean") return [field.name, Boolean(value)];
      if (field.type === "date" && typeof value === "string") return [field.name, value.split("T")[0]];
      if (field.type === "datetime-local" && typeof value === "string") return [field.name, value.slice(0, 16)];
      return [field.name, value ?? defaultValue(field)];
    })
  );
}

function normalizePayload(fields: EditableField[], values: RecordShape) {
  const payload: RecordShape = {};
  for (const field of fields) {
    const value = values[field.name];
    if (field.type === "number") {
      payload[field.name] = value === "" || value === undefined ? null : Number(value);
    } else if (field.type === "datetime-local") {
      payload[field.name] = value ? new Date(value).toISOString() : null;
    } else if (field.type === "textarea") {
      payload[field.name] = richTextToPlainText(value) || null;
    } else {
      payload[field.name] = value === "" ? null : value;
    }
  }
  return payload;
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function EditableServiceResourcePage<TRecord extends RecordShape, TPayload extends RecordShape>({
  title,
  description,
  backHref,
  queryKey,
  fields,
  list,
  create,
  update,
  delete: deleteRecord,
  getRecordTitle,
  getRecordMeta,
  emptyMessage,
  buildPayload,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  readOnlyMessage = "You can view these records, but your current permissions do not allow changes.",
}: EditableServiceResourcePageProps<TRecord, TPayload>) {
  const queryClient = useQueryClient();
  const [editingRecord, setEditingRecord] = useState<TRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TRecord | null>(null);
  const [values, setValues] = useState<RecordShape>(() => recordToValues(fields));
  const recordsQuery = useQuery({ queryKey, queryFn: list });
  const records = useMemo(() => recordsQuery.data?.data ?? [], [recordsQuery.data]);

  const createMutation = useMutation({
    mutationFn: create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TPayload> }) => update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecord?.(id) ?? Promise.resolve(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const startEdit = (record: TRecord) => {
    if (!canEdit) return;
    setEditingRecord(record);
    setValues(recordToValues(fields, record));
  };

  const resetForm = () => {
    setEditingRecord(null);
    setValues(recordToValues(fields));
  };

  const submit = async () => {
    if (editingRecord && !canEdit) {
      toast.error(`You do not have permission to update ${title.toLowerCase()}`);
      return;
    }
    if (!editingRecord && !canCreate) {
      toast.error(`You do not have permission to create ${title.toLowerCase()}`);
      return;
    }

    const missingField = fields.find((field) => {
      if (!field.required) return false;
      const value = values[field.name];
      return value === null || value === undefined || String(value).trim() === "";
    });
    if (missingField) {
      toast.error(`${missingField.label} is required`);
      return;
    }

    const basePayload = normalizePayload(fields, values);
    if (!basePayload.slug && typeof basePayload.title === "string") basePayload.slug = slugify(basePayload.title);
    if (!basePayload.slug && typeof basePayload.name === "string") basePayload.slug = slugify(basePayload.name);
    const payload = buildPayload ? buildPayload(basePayload, editingRecord) : (basePayload as TPayload);

    try {
      if (editingRecord) {
        await updateMutation.mutateAsync({ id: editingRecord.id, payload });
        toast.success(`${title} updated successfully`);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(`${title} created successfully`);
      }
      resetForm();
    } catch {
      toast.error(editingRecord ? `Failed to update ${title.toLowerCase()}` : `Failed to create ${title.toLowerCase()}`);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteRecord) return;
    if (!canDelete) {
      toast.error(`You do not have permission to delete ${title.toLowerCase()}`);
      return;
    }
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(`${title} deleted successfully`);
      setDeleteTarget(null);
    } catch {
      toast.error(`Failed to delete ${title.toLowerCase()}`);
    }
  };

  return (
    <div>
      <PageHeader title={title} description={description} backHref={backHref} />
      <div className="grid gap-6 p-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader><CardTitle>Records</CardTitle></CardHeader>
          <CardContent>
            {recordsQuery.isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div>
            ) : records.length === 0 ? (
              <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">{emptyMessage}</p>
            ) : (
              <div className="divide-y rounded-lg border">
                {records.map((record) => (
                  <div key={record.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{getRecordTitle(record)}</p>
                        {record.status ? <Badge variant="outline">{record.status}</Badge> : null}
                        {typeof record.is_active === "boolean" ? <Badge variant={record.is_active ? "default" : "secondary"}>{record.is_active ? "Active" : "Inactive"}</Badge> : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{getRecordMeta?.(record) ?? record.updated_at ?? record.created_at ?? "No metadata"}</p>
                    </div>
                    <div className="flex gap-2">
                      {canEdit ? (
                        <Button type="button" variant="outline" size="sm" onClick={() => startEdit(record)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      ) : null}
                      {deleteRecord && canDelete ? (
                        <Button type="button" variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteTarget(record)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {editingRecord ? "Edit Record" : "Create Record"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!editingRecord && !canCreate ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {readOnlyMessage}
              </p>
            ) : null}
            {editingRecord && !canEdit ? (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                {readOnlyMessage}
              </p>
            ) : null}
            {(editingRecord ? canEdit : canCreate) ? (
              <>
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <label className="text-sm font-medium">{field.label}{field.required ? " *" : ""}</label>
                {field.type === "textarea" ? (
                  <RichTextEditor
                    toolbar="simple"
                    minHeight="180px"
                    placeholder={field.placeholder}
                    value={values[field.name] ?? ""}
                    onChange={(html) => setValues((current) => ({ ...current, [field.name]: html }))}
                  />
                ) : field.type === "boolean" ? (
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <span className="text-sm text-muted-foreground">{field.placeholder ?? field.label}</span>
                    <Switch checked={Boolean(values[field.name])} onCheckedChange={(checked) => setValues((current) => ({ ...current, [field.name]: checked }))} />
                  </div>
                ) : (
                  <Input
                    type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "datetime-local" ? "datetime-local" : "text"}
                    placeholder={field.placeholder}
                    value={values[field.name] ?? ""}
                    onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2">
              <Button type="button" onClick={submit} disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingRecord ? "Save Changes" : "Create"}
              </Button>
              {editingRecord ? <Button type="button" variant="outline" onClick={resetForm}>Cancel Edit</Button> : null}
            </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title={`Delete ${title.toLowerCase()}?`}
        description={`This will delete "${deleteTarget ? getRecordTitle(deleteTarget) : "this record"}".`}
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
