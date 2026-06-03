"use client";

import { useId, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { EntityPicker } from "@/components/relationships/entity-picker";
import { relationshipAdapters, type RelationshipFilters } from "@/components/relationships/relationship-adapters";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  RichTextEditor,
  richTextToPlainText,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";

type RecordShape = Record<string, any>;

type FieldType =
  | "text"
  | "email"
  | "url"
  | "textarea"
  | "number"
  | "date"
  | "datetime-local"
  | "select"
  | "entity"
  | "boolean";

export interface EditableField {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  relation?: {
    adapter: keyof typeof relationshipAdapters;
    filters?: RelationshipFilters;
    description?: string;
    allowClear?: boolean;
  };
}

interface EditableServiceResourcePageProps<
  TRecord extends RecordShape,
  TPayload extends RecordShape,
> {
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
  buildPayload?: (
    values: RecordShape,
    editingRecord?: TRecord | null,
  ) => TPayload;
  validate?: (
    values: RecordShape,
    editingRecord?: TRecord | null,
  ) => Record<string, string>;
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
      if (field.type === "date" && typeof value === "string")
        return [field.name, value.split("T")[0]];
      if (field.type === "datetime-local" && typeof value === "string")
        return [field.name, value.slice(0, 16)];
      return [field.name, value ?? defaultValue(field)];
    }),
  );
}

function normalizePayload(fields: EditableField[], values: RecordShape) {
  const payload: RecordShape = {};
  for (const field of fields) {
    const value = values[field.name];
    if (field.type === "number") {
      payload[field.name] =
        value === "" || value === undefined ? null : Number(value);
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
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inputType(field: EditableField) {
  if (field.type) return field.type;
  if (field.name.includes("email")) return "email";
  if (field.name.includes("url")) return "url";
  return "text";
}

function validateFields(fields: EditableField[], values: RecordShape) {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = values[field.name];
    const textValue = String(value ?? "").trim();

    if (field.required && textValue === "") {
      errors[field.name] = `${field.label} is required.`;
      continue;
    }

    if (textValue === "") continue;

    const type = inputType(field);
    if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textValue)) {
      errors[field.name] = "Enter a valid email address.";
    }
    if (type === "url") {
      try {
        new URL(textValue);
      } catch {
        errors[field.name] = "Enter a full URL, including https://.";
      }
    }
  }

  return errors;
}

export function EditableServiceResourcePage<
  TRecord extends RecordShape,
  TPayload extends RecordShape,
>({
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
  validate,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  readOnlyMessage = "You can view these records, but your current permissions do not allow changes.",
}: EditableServiceResourcePageProps<TRecord, TPayload>) {
  const queryClient = useQueryClient();
  const formId = useId();
  const [editingRecord, setEditingRecord] = useState<TRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TRecord | null>(null);
  const [values, setValues] = useState<RecordShape>(() =>
    recordToValues(fields),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const recordsQuery = useQuery({ queryKey, queryFn: list });
  const records = useMemo(
    () => recordsQuery.data?.data ?? [],
    [recordsQuery.data],
  );

  const createMutation = useMutation({
    mutationFn: create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<TPayload> }) =>
      update(id, payload),
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
    setFieldErrors({});
  };

  const resetForm = () => {
    setEditingRecord(null);
    setValues(recordToValues(fields));
    setFieldErrors({});
  };

  const submit = async () => {
    if (editingRecord && !canEdit) {
      toast.error(
        `You do not have permission to update ${title.toLowerCase()}`,
      );
      return;
    }
    if (!editingRecord && !canCreate) {
      toast.error(
        `You do not have permission to create ${title.toLowerCase()}`,
      );
      return;
    }

    const nextErrors = {
      ...validateFields(fields, values),
      ...(validate?.(values, editingRecord) ?? {}),
    };
    setFieldErrors(nextErrors);
    const firstError = Object.values(nextErrors)[0];
    if (firstError) {
      toast.error(firstError);
      return;
    }

    const basePayload = normalizePayload(fields, values);
    if (!basePayload.slug && typeof basePayload.title === "string")
      basePayload.slug = slugify(basePayload.title);
    if (!basePayload.slug && typeof basePayload.name === "string")
      basePayload.slug = slugify(basePayload.name);
    const payload = buildPayload
      ? buildPayload(basePayload, editingRecord)
      : (basePayload as TPayload);

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
      toast.error(
        editingRecord
          ? `Failed to update ${title.toLowerCase()}`
          : `Failed to create ${title.toLowerCase()}`,
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || !deleteRecord) return;
    if (!canDelete) {
      toast.error(
        `You do not have permission to delete ${title.toLowerCase()}`,
      );
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
      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Records</CardTitle>
          </CardHeader>
          <CardContent>
            {recordsQuery.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            ) : recordsQuery.isError ? (
              <p
                role="status"
                className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
              >
                Failed to load {title.toLowerCase()}. Check the service
                connection and retry.
              </p>
            ) : records.length === 0 ? (
              <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                {emptyMessage}
              </p>
            ) : (
              <div className="divide-y rounded-lg border">
                {records.map((record) => (
                  <div
                    key={record.id}
                    className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words font-medium">
                          {getRecordTitle(record)}
                        </p>
                        {record.status ? (
                          <Badge variant="outline">{record.status}</Badge>
                        ) : null}
                        {typeof record.is_active === "boolean" ? (
                          <Badge
                            variant={record.is_active ? "default" : "secondary"}
                          >
                            {record.is_active ? "Active" : "Inactive"}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 break-words text-sm text-muted-foreground">
                        {getRecordMeta?.(record) ??
                          record.updated_at ??
                          record.created_at ??
                          "No metadata"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canEdit ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(record)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      ) : null}
                      {deleteRecord && canDelete ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setDeleteTarget(record)}
                        >
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
                {fields.map((field) => {
                  const id = `${formId}-${field.name}`;
                  const labelId = `${id}-label`;
                  const error = fieldErrors[field.name];
                  const describedBy = error ? `${id}-error` : undefined;
                  const resolvedType = inputType(field);

                  return (
                    <div key={field.name} className="space-y-2">
                      <label
                        id={labelId}
                        htmlFor={
                          field.type === "boolean" || field.type === "textarea"
                            ? undefined
                            : id
                        }
                        className="text-sm font-medium"
                      >
                        {field.label}
                        {field.required ? " *" : ""}
                      </label>
                      {field.type === "textarea" ? (
                        <RichTextEditor
                          editorId={id}
                          ariaLabelledby={labelId}
                          ariaDescribedby={describedBy}
                          ariaInvalid={Boolean(error)}
                          toolbar="simple"
                          minHeight="180px"
                          placeholder={field.placeholder}
                          value={values[field.name] ?? ""}
                          onChange={(html) => {
                            setValues((current) => ({
                              ...current,
                              [field.name]: html,
                            }));
                            if (error) {
                              setFieldErrors((current) => {
                                const next = { ...current };
                                delete next[field.name];
                                return next;
                              });
                            }
                          }}
                        />
                      ) : field.type === "entity" && field.relation ? (
                        <EntityPicker
                          adapter={relationshipAdapters[field.relation.adapter] as any}
                          value={values[field.name] || ""}
                          onChange={(nextValue) => {
                            setValues((current) => ({
                              ...current,
                              [field.name]: nextValue,
                            }));
                            if (error) {
                              setFieldErrors((current) => {
                                const next = { ...current };
                                delete next[field.name];
                                return next;
                              });
                            }
                          }}
                          filters={field.relation.filters}
                          placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`}
                          description={field.relation.description}
                          allowClear={field.relation.allowClear ?? !field.required}
                          required={field.required}
                        />
                      ) : field.type === "select" ? (
                        <Select
                          value={values[field.name] || undefined}
                          onValueChange={(nextValue) => {
                            setValues((current) => ({
                              ...current,
                              [field.name]: nextValue,
                            }));
                            if (error) {
                              setFieldErrors((current) => {
                                const next = { ...current };
                                delete next[field.name];
                                return next;
                              });
                            }
                          }}
                        >
                          <SelectTrigger
                            id={id}
                            aria-invalid={Boolean(error)}
                            aria-describedby={describedBy}
                          >
                            <SelectValue placeholder={field.placeholder ?? field.label} />
                          </SelectTrigger>
                          <SelectContent>
                            {(field.options ?? []).map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === "boolean" ? (
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <span
                            id={`${id}-label`}
                            className="text-sm text-muted-foreground"
                          >
                            {field.placeholder ?? field.label}
                          </span>
                          <Switch
                            aria-labelledby={`${id}-label`}
                            checked={Boolean(values[field.name])}
                            onCheckedChange={(checked) =>
                              setValues((current) => ({
                                ...current,
                                [field.name]: checked,
                              }))
                            }
                          />
                        </div>
                      ) : (
                        <Input
                          id={id}
                          type={
                            resolvedType === "number"
                              ? "number"
                              : resolvedType === "date"
                                ? "date"
                                : resolvedType === "datetime-local"
                                  ? "datetime-local"
                                  : resolvedType === "email"
                                    ? "email"
                                    : resolvedType === "url"
                                      ? "url"
                                      : "text"
                          }
                          inputMode={
                            resolvedType === "number" ? "numeric" : undefined
                          }
                          placeholder={field.placeholder}
                          value={values[field.name] ?? ""}
                          aria-invalid={Boolean(error)}
                          aria-describedby={describedBy}
                          error={Boolean(error)}
                          autoComplete={
                            resolvedType === "email"
                              ? "email"
                              : resolvedType === "url"
                                ? "url"
                                : undefined
                          }
                          onChange={(event) => {
                            const nextValue = event.target.value;
                            setValues((current) => ({
                              ...current,
                              [field.name]: nextValue,
                            }));
                            if (error) {
                              setFieldErrors((current) => {
                                const next = { ...current };
                                delete next[field.name];
                                return next;
                              });
                            }
                          }}
                        />
                      )}
                      {error ? (
                        <p
                          id={`${id}-error`}
                          className="text-sm text-destructive"
                        >
                          {error}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    type="button"
                    onClick={submit}
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? "Saving..."
                      : editingRecord
                        ? "Save Changes"
                        : "Create"}
                  </Button>
                  {editingRecord ? (
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancel Edit
                    </Button>
                  ) : null}
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
