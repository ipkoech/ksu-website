"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, FilterX, MoreHorizontal, Plus, Trash2 } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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

export interface EditableListFilter {
  name: string;
  label: string;
  type?: "select" | "entity" | "boolean";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  relation?: {
    adapter: keyof typeof relationshipAdapters;
    filters?: RelationshipFilters;
  };
}

export interface EditableRecordWorkflowAction<
  TRecord extends RecordShape,
  TPayload extends RecordShape,
> {
  label: string;
  successMessage?: string;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost";
  className?: string;
  payload: Partial<TPayload> | ((record: TRecord) => Partial<TPayload>);
  run?: (record: TRecord) => Promise<unknown>;
  confirmTitle?: string | ((record: TRecord) => string);
  confirmDescription?: string | ((record: TRecord) => string);
  confirmLabel?: string;
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
  list: (filters?: RecordShape) => Promise<{ data?: TRecord[] }>;
  listFilters?: EditableListFilter[];
  create: (payload: TPayload) => Promise<unknown>;
  update: (id: string, payload: Partial<TPayload>) => Promise<unknown>;
  delete?: (id: string) => Promise<unknown>;
  getRecordTitle: (record: TRecord) => string;
  getRecordMeta?: (record: TRecord) => string;
  getRecordDetailHref?: (record: TRecord) => string | null | undefined;
  getRecordWorkflowActions?: (record: TRecord) => Array<EditableRecordWorkflowAction<TRecord, TPayload>>;
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
  listFilters = [],
  create,
  update,
  delete: deleteRecord,
  getRecordTitle,
  getRecordMeta,
  getRecordDetailHref,
  getRecordWorkflowActions,
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
  const [workflowTarget, setWorkflowTarget] = useState<{
    record: TRecord;
    action: EditableRecordWorkflowAction<TRecord, TPayload>;
  } | null>(null);
  const [values, setValues] = useState<RecordShape>(() =>
    recordToValues(fields),
  );
  const [filterValues, setFilterValues] = useState<RecordShape>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const activeFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filterValues).filter(([, value]) => value !== undefined && value !== null && value !== ""),
      ),
    [filterValues],
  );
  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  const recordsQuery = useQuery({
    queryKey: [...queryKey, "filters", activeFilters],
    queryFn: () => list(activeFilters),
  });
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

  const updateFilter = (name: string, value: string | boolean | null) => {
    setFilterValues((current) => {
      const next = { ...current };
      if (value === null || value === "") {
        delete next[name];
      } else {
        next[name] = value;
      }
      return next;
    });
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

  const runWorkflowAction = async (
    record: TRecord,
    action: EditableRecordWorkflowAction<TRecord, TPayload>,
  ) => {
    if (!canEdit) {
      toast.error(`You do not have permission to update ${title.toLowerCase()}`);
      return;
    }

    try {
      if (action.run) {
        await action.run(record);
        await queryClient.invalidateQueries({ queryKey });
      } else {
        const payload =
          typeof action.payload === "function" ? action.payload(record) : action.payload;
        await updateMutation.mutateAsync({ id: record.id, payload });
      }
      toast.success(action.successMessage ?? `${title} updated successfully`);
    } catch {
      toast.error(`Failed to update ${title.toLowerCase()}`);
    }
  };

  const requestWorkflowAction = (
    record: TRecord,
    action: EditableRecordWorkflowAction<TRecord, TPayload>,
  ) => {
    setWorkflowTarget({ record, action });
  };

  const renderRecordActions = (record: TRecord) => {
    const detailHref = getRecordDetailHref?.(record);
    const workflowActions = getRecordWorkflowActions?.(record) ?? [];
    const canShowMenu =
      workflowActions.length > 0 ||
      Boolean(detailHref) ||
      canEdit ||
      Boolean(deleteRecord && canDelete);

    if (!canShowMenu) return null;

    return (
      <div className="flex shrink-0 items-center gap-2">
        {workflowActions.slice(0, 2).map((action) => (
          <Button
            key={action.label}
            type="button"
            variant={action.variant ?? "secondary"}
            size="sm"
            className={action.className}
            disabled={updateMutation.isPending}
            onClick={() => requestWorkflowAction(record, action)}
          >
            {action.label}
          </Button>
        ))}
        {detailHref ? (
          <Button asChild type="button" variant="outline" size="sm" className="min-w-[118px] justify-start">
            <Link href={detailHref}>
              <Eye className="mr-2 h-4 w-4" />
              Open Details
            </Link>
          </Button>
        ) : canEdit ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-w-[118px] justify-start"
            onClick={() => startEdit(record)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Record
          </Button>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${getRecordTitle(record)}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Record Actions</DropdownMenuLabel>
            {workflowActions.map((action) => (
              <DropdownMenuItem
                key={action.label}
                disabled={updateMutation.isPending}
                onClick={() => requestWorkflowAction(record, action)}
              >
                {action.label}
              </DropdownMenuItem>
            ))}
            {workflowActions.length > 0 && (detailHref || canEdit || (deleteRecord && canDelete)) ? (
              <DropdownMenuSeparator />
            ) : null}
            {detailHref ? (
              <DropdownMenuItem asChild>
                <Link href={detailHref}>
                  <Eye className="mr-2 h-4 w-4" />
                  View details
                </Link>
              </DropdownMenuItem>
            ) : null}
            {canEdit ? (
              <DropdownMenuItem onClick={() => startEdit(record)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit record
              </DropdownMenuItem>
            ) : null}
            {deleteRecord && canDelete ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteTarget(record)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete record
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div>
      <PageHeader title={title} description={description} backHref={backHref} />
      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Records</CardTitle>
              {listFilters.length > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-fit text-muted-foreground"
                  onClick={() => setFilterValues({})}
                  disabled={!hasActiveFilters}
                >
                  <FilterX className="mr-2 h-4 w-4" />
                  Clear Filters
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {listFilters.length > 0 ? (
              <div className="mb-4 grid gap-3 rounded-lg border bg-muted/20 p-3 sm:grid-cols-2 xl:grid-cols-3">
                {listFilters.map((filter) => (
                  <div key={filter.name} className="space-y-2">
                    <label className="text-sm font-medium">{filter.label}</label>
                    {filter.type === "entity" && filter.relation ? (
                      <EntityPicker
                        adapter={relationshipAdapters[filter.relation.adapter] as any}
                        value={filterValues[filter.name] || ""}
                        onChange={(nextValue) => updateFilter(filter.name, nextValue || null)}
                        filters={filter.relation.filters}
                        placeholder={filter.placeholder ?? `Filter by ${filter.label.toLowerCase()}`}
                        allowClear
                      />
                    ) : filter.type === "boolean" ? (
                      <Select
                        value={
                          typeof filterValues[filter.name] === "boolean"
                            ? String(filterValues[filter.name])
                            : "all"
                        }
                        onValueChange={(nextValue) =>
                          updateFilter(
                            filter.name,
                            nextValue === "all" ? null : nextValue === "true",
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={filter.placeholder ?? filter.label} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Select
                        value={filterValues[filter.name] || "all"}
                        onValueChange={(nextValue) =>
                          updateFilter(filter.name, nextValue === "all" ? null : nextValue)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={filter.placeholder ?? filter.label} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          {(filter.options ?? []).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
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
                    {renderRecordActions(record)}
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
      <ConfirmDialog
        open={!!workflowTarget}
        onOpenChange={(open) => {
          if (!open) setWorkflowTarget(null);
        }}
        title={
          workflowTarget
            ? typeof workflowTarget.action.confirmTitle === "function"
              ? workflowTarget.action.confirmTitle(workflowTarget.record)
              : workflowTarget.action.confirmTitle ?? `${workflowTarget.action.label} ${title.toLowerCase()}?`
            : "Confirm action"
        }
        description={
          workflowTarget
            ? typeof workflowTarget.action.confirmDescription === "function"
              ? workflowTarget.action.confirmDescription(workflowTarget.record)
              : workflowTarget.action.confirmDescription ??
                `This will run "${workflowTarget.action.label}" for "${getRecordTitle(workflowTarget.record)}".`
            : "Confirm this workflow action."
        }
        variant={workflowTarget?.action.variant === "destructive" ? "destructive" : "default"}
        confirmLabel={workflowTarget?.action.confirmLabel ?? workflowTarget?.action.label ?? "Confirm"}
        onConfirm={async () => {
          if (!workflowTarget) return;
          await runWorkflowAction(workflowTarget.record, workflowTarget.action);
          setWorkflowTarget(null);
        }}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
}
