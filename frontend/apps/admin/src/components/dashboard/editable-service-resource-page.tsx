"use client";

import { useEffect, useId, useMemo, useState, type Dispatch, type KeyboardEvent, type ReactNode, type SetStateAction } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArchiveRestore, ArrowUpDown, ChevronDown, Database, Edit, Eye, FilterX, HelpCircle, MoreHorizontal, Plus, Search, ShieldCheck, SlidersHorizontal, Sparkles, Trash2 } from "lucide-react";

const RESEARCH_FRONTEND = process.env.NEXT_PUBLIC_RESEARCH_FRONTEND_URL;

async function revalidateResearch(resource: string) {
  if (!RESEARCH_FRONTEND) return;
  try {
    await fetch(`${RESEARCH_FRONTEND}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource, secret: "ksu-research-revalidate" }),
    });
  } catch { /* fire and forget */ }
}

import { PageHeader } from "@/components/layout";
import { DateTimePicker } from "@/components/shared/date-time-picker";
import { AttachmentManager, MediaPicker, getMediaLabel, getMediaUrl, isImageMedia, useCommitPendingAttachments, type AttachmentRoleOption, type PendingMediaAttachment } from "@/components/media";
import { EntityPicker, EntityTypeRecordPicker, MultiEntityPicker } from "@/components/relationships/entity-picker";
import { relationshipAdapters, type RelationshipFilters } from "@/components/relationships/relationship-adapters";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  EmptyState,
  Skeleton,
  RichTextEditor,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  ImageRenderer,
  richTextToPlainText,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { cn } from "@ksu/ui/lib";

type RecordShape = Record<string, any>;

type ListResponse<TRecord extends RecordShape> = {
  data?: TRecord[];
  meta?: {
    page?: number;
    per_page?: number;
    total?: number;
    pages?: number;
    total_pages?: number;
  };
};

type FieldType =
  | "text"
  | "email"
  | "url"
  | "textarea"
  | "richtext"
  | "number"
  | "date"
  | "datetime-local"
  | "select"
  | "entity"
  | "entity-multi"
  | "entity-record"
  | "media"
  | "attachments"
  | "boolean";

export interface EditableField {
  name: string;
  label: string;
  type?: FieldType;
  sourceNames?: string[];
  defaultValue?: any;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  relation?: {
    adapter: keyof typeof relationshipAdapters;
    filters?: RelationshipFilters;
    description?: string;
    allowClear?: boolean;
  };
  entityRecord?: {
    typeName: string;
    idName: string;
    configs: Array<{
      value: string;
      label: string;
      adapter: keyof typeof relationshipAdapters;
      filters?: RelationshipFilters;
      recordRequired?: boolean;
    }>;
    description?: string;
    typePlaceholder?: string;
    recordPlaceholder?: string;
    allowNone?: boolean;
  };
  media?: {
    mediaType?: string;
    folderId?: string;
    helperText?: string;
    accept?: string;
    uploadEntityType?: string;
    uploadEntityIdField?: string;
    uploadRole?: string;
    isPublic?: boolean;
    allowUpload?: boolean;
  };
  attachments?: {
    entityType: string;
    roles?: AttachmentRoleOption[];
    defaultRole?: string;
    isPublic?: boolean;
    allowVisibilityChange?: boolean;
    uploadEntityType?: string;
    uploadEntityIdField?: string;
  };
}

export interface EditableListFilter {
  name: string;
  label: string;
  type?: "select" | "entity" | "boolean" | "text" | "date";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  relation?: {
    adapter: keyof typeof relationshipAdapters;
    filters?: RelationshipFilters;
  };
}

export interface EditableSortOption {
  label: string;
  sort: string;
  order?: "asc" | "desc";
}

export interface EditableRecordWorkflowAction<
  TRecord extends RecordShape,
  TPayload extends RecordShape,
> {
  label: string;
  scopes?: string[];
  successMessage?: string;
  variant?: "default" | "outline" | "secondary" | "destructive" | "ghost";
  className?: string;
  mode?: "confirm" | "sheet";
  fields?: EditableField[];
  defaults?: RecordShape | ((record: TRecord) => RecordShape);
  buildPayload?: (
    values: RecordShape,
    record: TRecord,
  ) => Partial<TPayload>;
  validate?: (
    values: RecordShape,
    record: TRecord,
  ) => Record<string, string>;
  payload: Partial<TPayload> | ((record: TRecord) => Partial<TPayload>);
  run?: (record: TRecord, payload?: Partial<TPayload>) => Promise<unknown>;
  confirmTitle?: string | ((record: TRecord) => string);
  confirmDescription?: string | ((record: TRecord) => string);
  confirmLabel?: string;
}

export interface EditableRecordColumn<TRecord extends RecordShape> {
  key: string;
  label: string;
  className?: string;
  render: (record: TRecord) => ReactNode;
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
  list: (filters?: RecordShape) => Promise<ListResponse<TRecord>>;
  listFilters?: EditableListFilter[];
  create: (payload: TPayload) => Promise<unknown>;
  update: (id: string, payload: Partial<TPayload>) => Promise<unknown>;
  delete?: (id: string) => Promise<unknown>;
  getRecordTitle: (record: TRecord) => string;
  getRecordMeta?: (record: TRecord) => string;
  getRecordDetailHref?: (record: TRecord) => string | null | undefined;
  getRecordWorkflowActions?: (record: TRecord) => Array<EditableRecordWorkflowAction<TRecord, TPayload>>;
  hasAnyWorkflowScope?: (scopes: string[]) => boolean;
  recordColumns?: Array<EditableRecordColumn<TRecord>>;
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
  primaryActionLabel?: string;
  resourceKey?: string;
  toolbarSlot?: ReactNode;
  summarySlot?: ReactNode;
  editorMode?: "dialog" | "sheet" | "auto";
  /**
   * Opens record details in the editor dialog before editing. This is opt-in so
   * resources with dedicated detail routes keep their existing navigation.
   */
  viewInEditor?: boolean;
  renderMobileRecord?: (record: TRecord, actions: ReactNode, detailHref?: string | null) => ReactNode;
  hideHeader?: boolean;
  tableLayout?: "default" | "compact";
  actionsInMenuOnly?: boolean;
  sortOptions?: EditableSortOption[];
  defaultSort?: EditableSortOption;
  /**
   * Shows the "All records | Archived | Recently deleted" browser. The list
   * function receives a `record_state` param for the non-default views.
   */
  supportsRecovery?: boolean;
  /** Which recovery views the backend supports (defaults to both). */
  recoveryStates?: Array<"archived" | "deleted">;
  /** Restores an archived or soft-deleted record. Required for the recovery views. */
  restoreRecord?: (record: TRecord) => Promise<unknown>;
  emptyState?: {
    title?: string;
    description?: string;
    primaryActionLabel?: string;
    secondaryAction?: ReactNode;
  };
}

function defaultValue(field: EditableField) {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === "boolean") return true;
  if (field.type === "entity-multi") return [];
  if (field.type === "attachments") return [];
  if (field.type === "number") return "";
  return "";
}

function recordToValues(fields: EditableField[], record?: RecordShape | null) {
  const values: RecordShape = {};
  for (const field of fields) {
    if (field.type === "attachments") continue;
    if (field.type === "entity-record" && field.entityRecord) {
      values[field.entityRecord.typeName] =
        record?.[field.entityRecord.typeName] ?? "";
      values[field.entityRecord.idName] =
        record?.[field.entityRecord.idName] ?? "";
      continue;
    }

    const sourceNames = [field.name, ...(field.sourceNames ?? [])];
    const value = sourceNames
      .map((name) => record?.[name])
      .find((candidate) => candidate !== undefined && candidate !== null);
    if (field.type === "boolean") {
      values[field.name] = Boolean(value);
    } else if (field.type === "date" && typeof value === "string") {
      values[field.name] = value.split("T")[0];
    } else if (field.type === "datetime-local" && typeof value === "string") {
      values[field.name] = value.slice(0, 16);
    } else {
      values[field.name] = value ?? defaultValue(field);
    }
  }
  return values;
}

function normalizePayload(fields: EditableField[], values: RecordShape) {
  const payload: RecordShape = {};
  for (const field of fields) {
    if (field.type === "attachments") continue;
    if (field.type === "entity-record" && field.entityRecord) {
      payload[field.entityRecord.typeName] =
        values[field.entityRecord.typeName] || null;
      payload[field.entityRecord.idName] =
        values[field.entityRecord.idName] || null;
      continue;
    }

    const value = values[field.name];
    if (field.type === "number") {
      payload[field.name] =
        value === "" || value === undefined ? null : Number(value);
    } else if (field.type === "datetime-local") {
      payload[field.name] = value ? new Date(value).toISOString() : null;
    } else if (field.type === "textarea") {
      payload[field.name] = richTextToPlainText(value) || null;
    } else if (field.type === "richtext") {
      payload[field.name] = value === "" ? null : value;
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

function serializeSort(option?: Pick<EditableSortOption, "sort" | "order"> | null) {
  if (!option?.sort) return "";
  return `${option.sort}:${option.order ?? "desc"}`;
}

function deserializeSort(value: string, fallback?: EditableSortOption) {
  const serialized = value || serializeSort(fallback);
  if (!serialized) return null;
  const [sort, order] = serialized.split(":");
  if (!sort) return null;
  return {
    sort,
    order: order === "asc" ? ("asc" as const) : ("desc" as const),
  };
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
    if (field.type === "entity-record" && field.entityRecord) {
      if (
        field.required &&
        String(values[field.entityRecord.idName] ?? "").trim() === ""
      ) {
        errors[field.name] = `${field.label} is required.`;
      }
      continue;
    }

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
  hasAnyWorkflowScope,
  recordColumns = [],
  emptyMessage,
  buildPayload,
  validate,
  canCreate = true,
  canEdit = true,
  canDelete = true,
  readOnlyMessage = "You can view these records, but your current permissions do not allow changes.",
  primaryActionLabel,
  resourceKey,
  toolbarSlot,
  summarySlot,
  editorMode = "auto",
  viewInEditor = false,
  renderMobileRecord,
  hideHeader = false,
  tableLayout = "default",
  actionsInMenuOnly = false,
  sortOptions = [],
  defaultSort,
  supportsRecovery = false,
  recoveryStates = ["archived", "deleted"],
  restoreRecord,
  emptyState,
}: EditableServiceResourcePageProps<TRecord, TPayload>) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const formId = useId();
  const workflowFormId = useId();
  const commitPendingAttachments = useCommitPendingAttachments();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorIntent, setEditorIntent] = useState<"create" | "view" | "edit">("create");
  const [editingRecord, setEditingRecord] = useState<TRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TRecord | null>(null);
  const [workflowTarget, setWorkflowTarget] = useState<{
    record: TRecord;
    action: EditableRecordWorkflowAction<TRecord, TPayload>;
  } | null>(null);
  const [workflowEditorTarget, setWorkflowEditorTarget] = useState<{
    record: TRecord;
    action: EditableRecordWorkflowAction<TRecord, TPayload>;
  } | null>(null);
  const [values, setValues] = useState<RecordShape>(() =>
    recordToValues(fields),
  );
  const [workflowValues, setWorkflowValues] = useState<RecordShape>({});
  const [filterValues, setFilterValues] = useState<RecordShape>({});
  const [sortValue, setSortValue] = useState(() => serializeSort(defaultSort ?? sortOptions[0]));
  const [recordState, setRecordState] = useState<"active" | "archived" | "deleted">("active");
  const inRecoveryView = supportsRecovery && recordState !== "active";
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [workflowFieldErrors, setWorkflowFieldErrors] = useState<Record<string, string>>({});
  const activeFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(filterValues).filter(([, value]) => value !== undefined && value !== null && value !== ""),
      ),
    [filterValues],
  );
  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  const activeSort = useMemo(
    () => deserializeSort(sortValue, defaultSort ?? sortOptions[0]),
    [defaultSort, sortOptions, sortValue],
  );
  const recordsQuery = useQuery({
    queryKey: [...queryKey, "filters", activeFilters, "sort", activeSort, "page", page, "perPage", perPage, "recordState", recordState],
    queryFn: () =>
      list({
        page,
        per_page: perPage,
        ...(activeSort ? { sort: activeSort.sort, order: activeSort.order } : {}),
        ...(inRecoveryView ? { record_state: recordState } : {}),
        ...activeFilters,
      }),
  });
  const allRecords = useMemo(
    () => recordsQuery.data?.data ?? [],
    [recordsQuery.data],
  );
  const totalRecords = recordsQuery.data?.meta?.total ?? allRecords.length;
  const totalPages =
    recordsQuery.data?.meta?.pages ??
    recordsQuery.data?.meta?.total_pages ??
    Math.max(1, Math.ceil(allRecords.length / perPage));
  const records = useMemo(() => {
    if (recordsQuery.data?.meta?.total !== undefined) return allRecords;
    const start = (page - 1) * perPage;
    return allRecords.slice(start, start + perPage);
  }, [allRecords, page, perPage, recordsQuery.data?.meta?.total]);
  const resolvedEditorMode = viewInEditor ? "dialog" : editorMode === "auto" ? (fields.length > 10 ? "sheet" : "dialog") : editorMode;
  const visibleFrom = totalRecords === 0 ? 0 : (page - 1) * perPage + 1;
  const visibleTo = Math.min(page * perPage, totalRecords);

  useEffect(() => {
    setPage(1);
  }, [activeFilters, perPage, recordState]);

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
  const restoreMutation = useMutation({
    mutationFn: (record: TRecord) => restoreRecord?.(record) ?? Promise.resolve(),
    onSuccess: (_result, record) => {
      toast.success(`'${getRecordTitle(record)}' has been restored. It's back in your drafts.`);
      return queryClient.invalidateQueries({ queryKey });
    },
    onError: () => {
      toast.error(`Failed to restore ${title.toLowerCase()}`);
    },
  });

  const startEdit = (record: TRecord) => {
    if (!canEdit) return;
    setEditorIntent("edit");
    setEditingRecord(record);
    setValues(recordToValues(fields, record));
    setFieldErrors({});
    setEditorOpen(true);
  };

  const startView = (record: TRecord) => {
    if (!viewInEditor) return;
    setEditorIntent("view");
    setEditingRecord(record);
    setValues(recordToValues(fields, record));
    setFieldErrors({});
    setEditorOpen(true);
  };

  const startCreate = () => {
    if (!canCreate) return;
    setEditorIntent("create");
    setEditingRecord(null);
    setValues(recordToValues(fields));
    setFieldErrors({});
    setEditorOpen(true);
  };

  const resetForm = () => {
    setEditorIntent("create");
    setEditingRecord(null);
    setValues(recordToValues(fields));
    setFieldErrors({});
  };

  const closeEditor = () => {
    setEditorOpen(false);
    resetForm();
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
        const created = await createMutation.mutateAsync(payload);
        const createdId = (created as { data?: { id?: string }; id?: string } | null)?.data?.id
          ?? (created as { id?: string } | null)?.id;
        for (const field of fields) {
          if (field.type !== "attachments" || !field.attachments) continue;
          const attachments = values[field.name] as PendingMediaAttachment[] | undefined;
          if (!attachments?.length) continue;
          if (!createdId) throw new Error("Created record did not return an ID for attachment linking");
          await commitPendingAttachments({
            entityType: field.attachments.entityType,
            entityId: createdId,
            attachments,
          });
        }
        toast.success(`${title} created successfully`);
      }
      resetForm();
      setEditorOpen(false);
      if (resourceKey) revalidateResearch(resourceKey);
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
      if (resourceKey) revalidateResearch(resourceKey);
    } catch {
      toast.error(`Failed to delete ${title.toLowerCase()}`);
    }
  };

  const runWorkflowAction = async (
    record: TRecord,
    action: EditableRecordWorkflowAction<TRecord, TPayload>,
    overridePayload?: Partial<TPayload>,
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
        const payload = overridePayload ??
          (typeof action.payload === "function" ? action.payload(record) : action.payload);
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
    if (action.mode === "sheet" && action.fields?.length) {
      const defaults =
        typeof action.defaults === "function"
          ? action.defaults(record)
          : action.defaults ?? {};
      setWorkflowEditorTarget({ record, action });
      setWorkflowValues({
        ...recordToValues(action.fields, record),
        ...defaults,
      });
      setWorkflowFieldErrors({});
      return;
    }
    setWorkflowTarget({ record, action });
  };

  const closeWorkflowEditor = () => {
    setWorkflowEditorTarget(null);
    setWorkflowValues({});
    setWorkflowFieldErrors({});
  };

  const openRecordDetail = (record: TRecord) => {
    if (inRecoveryView) return;
    if (viewInEditor) {
      startView(record);
      return;
    }
    const detailHref = getRecordDetailHref?.(record);
    if (detailHref) router.push(detailHref);
  };

  const handleRecordKeyDown = (event: KeyboardEvent, record: TRecord) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openRecordDetail(record);
  };

  const submitWorkflowEditor = async () => {
    if (!workflowEditorTarget) return;
    const { record, action } = workflowEditorTarget;
    const workflowFields = action.fields ?? [];
    const nextErrors = {
      ...validateFields(workflowFields, workflowValues),
      ...(action.validate?.(workflowValues, record) ?? {}),
    };
    setWorkflowFieldErrors(nextErrors);
    const firstError = Object.values(nextErrors)[0];
    if (firstError) {
      toast.error(firstError);
      return;
    }

    const normalized = normalizePayload(workflowFields, workflowValues);
    const basePayload =
      typeof action.payload === "function" ? action.payload(record) : action.payload;
    const buildWorkflowPayload = action.buildPayload;
    const payload = {
      ...basePayload,
      ...(buildWorkflowPayload
        ? buildWorkflowPayload(normalized, record)
        : normalized),
    } as Partial<TPayload>;
    await runWorkflowAction(record, action, payload);
    closeWorkflowEditor();
  };

  const renderRecordActions = (record: TRecord) => {
    if (inRecoveryView) {
      const stampValue =
        recordState === "deleted"
          ? record.deleted_at
          : record.archived_at ?? record.updated_at;
      const stampDate = stampValue ? new Date(stampValue) : null;
      return (
        <div
          className="flex shrink-0 items-center gap-3"
          onClick={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
        >
          {stampDate && !Number.isNaN(stampDate.getTime()) ? (
            <span className="text-xs text-muted-foreground">
              {recordState === "deleted" ? "deleted on" : "archived on"}{" "}
              {stampDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
          ) : null}
          {restoreRecord && canEdit ? (
            <Button
              type="button"
              size="sm"
              disabled={restoreMutation.isPending}
              onClick={() => restoreMutation.mutate(record)}
            >
              <ArchiveRestore data-icon="inline-start" />
              Restore
            </Button>
          ) : null}
        </div>
      );
    }

    const detailHref = getRecordDetailHref?.(record);
    const workflowActions = (getRecordWorkflowActions?.(record) ?? []).filter(
      (action) => !action.scopes?.length || hasAnyWorkflowScope?.(action.scopes) === true,
    );
    const canShowMenu =
      workflowActions.length > 0 ||
      viewInEditor ||
      Boolean(detailHref) ||
      canEdit ||
      Boolean(deleteRecord && canDelete);

    if (!canShowMenu) return null;

    return (
      <div
        className="flex shrink-0 items-center gap-2"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        {!actionsInMenuOnly ? (
          <>
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
            {viewInEditor ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-[118px] justify-start"
                onClick={() => startView(record)}
              >
                <Eye data-icon="inline-start" />
                View Record
              </Button>
            ) : detailHref ? (
              <Button asChild type="button" variant="outline" size="sm" className="min-w-[118px] justify-start">
                <Link href={detailHref}>
                  <Eye data-icon="inline-start" />
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
                <Edit data-icon="inline-start" />
                Edit Record
              </Button>
            ) : null}
          </>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Actions for ${getRecordTitle(record)}`}
            >
              <MoreHorizontal data-icon="inline-start" />
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
            {workflowActions.length > 0 && (viewInEditor || detailHref || canEdit || (deleteRecord && canDelete)) ? (
              <DropdownMenuSeparator />
            ) : null}
            {viewInEditor ? (
              <DropdownMenuItem onClick={() => startView(record)}>
                <Eye data-icon="inline-start" />
                View record
              </DropdownMenuItem>
            ) : detailHref ? (
              <DropdownMenuItem asChild>
                <Link href={detailHref}>
                  <Eye data-icon="inline-start" />
                  View details
                </Link>
              </DropdownMenuItem>
            ) : null}
            {canEdit ? (
              <DropdownMenuItem onClick={() => startEdit(record)}>
                <Edit data-icon="inline-start" />
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
                  <Trash2 data-icon="inline-start" />
                  Delete record
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  const searchFilter = listFilters.find((filter) => filter.name === "search" && filter.type === "text");
  const menuFilters = tableLayout === "compact"
    ? listFilters.filter((filter) => filter.name !== searchFilter?.name)
    : listFilters;
  const hasMenuFilters = menuFilters.length > 0;
  const selectedSortLabel = activeSort
    ? sortOptions.find((option) => serializeSort(option) === serializeSort(activeSort))?.label ?? "Custom sort"
    : "Sort";

  const actionToolbar = (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-end",
        tableLayout === "compact" && "flex-wrap sm:items-center sm:justify-end",
      )}
    >
      {canCreate && !inRecoveryView ? (
        <Button type="button" size="sm" className="shadow-sm" onClick={startCreate}>
          <Plus data-icon="inline-start" />
          {primaryActionLabel ?? "Create Record"}
        </Button>
      ) : null}
      {toolbarSlot}
      {tableLayout !== "compact" && listFilters.length > 0 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-fit text-muted-foreground"
          onClick={() => setFilterValues({})}
          disabled={!hasActiveFilters}
        >
          <FilterX data-icon="inline-start" />
          Clear Filters
        </Button>
      ) : null}
    </div>
  );

  const renderFilterControl = (filter: EditableListFilter) => (
    <div key={filter.name} className="flex flex-col gap-2">
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
            <SelectGroup>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="true">Yes</SelectItem>
              <SelectItem value="false">No</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : filter.type === "text" ? (
        <Input
          value={filterValues[filter.name] ?? ""}
          placeholder={filter.placeholder ?? filter.label}
          onChange={(event) => updateFilter(filter.name, event.target.value || null)}
        />
      ) : filter.type === "date" ? (
        <DateTimePicker
          value={filterValues[filter.name] ?? ""}
          onChange={(nextValue) => updateFilter(filter.name, nextValue || null)}
          placeholder={filter.placeholder ?? filter.label}
        />
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
            <SelectGroup>
              <SelectItem value="all">All</SelectItem>
              {(filter.options ?? []).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </div>
  );

  return (
    <div>
      {!hideHeader ? <PageHeader title={title} description={description} backHref={backHref} /> : null}
      <div className={cn("space-y-5 p-4 sm:p-6", hideHeader && "pt-3")}>
        <ResourceCommandPanel
          title={title}
          description={description}
          totalRecords={totalRecords}
          visibleFrom={visibleFrom}
          visibleTo={visibleTo}
          canCreate={canCreate}
          canEdit={canEdit}
          canDelete={Boolean(deleteRecord && canDelete)}
          hasActiveFilters={hasActiveFilters}
          isFetching={recordsQuery.isFetching}
          actions={actionToolbar}
          compact={tableLayout === "compact"}
        />
        {summarySlot}
        <Card className="overflow-hidden border-white/70 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-background/90">
          {tableLayout !== "compact" ? (
            <CardHeader className="border-b bg-gradient-to-r from-muted/40 via-background to-muted/20">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-base">Records</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Backend-backed list with scoped filters and permission-aware actions.
                  </p>
                </div>
              </div>
            </CardHeader>
          ) : null}
          <CardContent className="p-4 sm:p-5">
            {supportsRecovery ? (
              <div className="mb-4 inline-flex flex-wrap items-center gap-1 rounded-full border bg-muted/30 p-1">
                {([
                  { value: "active", label: "All records" },
                  ...(recoveryStates.includes("archived")
                    ? [{ value: "archived", label: "Archived" }]
                    : []),
                  ...(recoveryStates.includes("deleted")
                    ? [{ value: "deleted", label: "Recently deleted" }]
                    : []),
                ] as Array<{ value: "active" | "archived" | "deleted"; label: string }>).map((segment) => (
                  <Button
                    key={segment.value}
                    type="button"
                    size="sm"
                    variant={recordState === segment.value ? "secondary" : "ghost"}
                    className="rounded-full"
                    aria-pressed={recordState === segment.value}
                    onClick={() => setRecordState(segment.value)}
                  >
                    {segment.label}
                  </Button>
                ))}
              </div>
            ) : null}
            {tableLayout === "compact" ? (
              <div className="mb-4 flex flex-col gap-3 rounded-2xl border bg-muted/20 p-3 lg:flex-row lg:items-center lg:justify-between">
                {searchFilter ? (
                  <div className="relative min-w-0 flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={filterValues[searchFilter.name] ?? ""}
                      placeholder={searchFilter.placeholder ?? "Search records"}
                      className="pl-9"
                      onChange={(event) => updateFilter(searchFilter.name, event.target.value || null)}
                    />
                  </div>
                ) : (
                  <div className="min-w-0 flex-1 rounded-xl border bg-background/70 px-3 py-2">
                    <p className="text-sm font-semibold">{title} records</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {hasActiveFilters
                        ? `${Object.keys(activeFilters).length} filter${Object.keys(activeFilters).length === 1 ? "" : "s"} active`
                        : "Use filters, sorting, and row actions to manage this workspace."}
                    </p>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {hasMenuFilters ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          <SlidersHorizontal data-icon="inline-start" />
                          Filters
                          {hasActiveFilters ? (
                            <Badge variant="secondary" className="ml-1 rounded-sm px-1.5">
                              {Object.keys(activeFilters).length}
                            </Badge>
                          ) : null}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        align="end"
                        sideOffset={8}
                        collisionPadding={16}
                        className="max-h-[min(72vh,560px)] w-[min(92vw,420px)] overflow-y-auto p-4"
                      >
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">Filter {title.toLowerCase()}</p>
                            <p className="text-xs text-muted-foreground">Narrow the table by {title.toLowerCase()} metadata.</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                            onClick={() => setFilterValues(searchFilter && filterValues[searchFilter.name] ? { [searchFilter.name]: filterValues[searchFilter.name] } : {})}
                            disabled={!hasActiveFilters}
                          >
                            <FilterX data-icon="inline-start" />
                            Clear
                          </Button>
                        </div>
                        <div className="grid gap-3 pr-1">
                          {menuFilters.map(renderFilterControl)}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : null}
                  {sortOptions.length > 0 ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button type="button" variant="outline" size="sm">
                          <ArrowUpDown data-icon="inline-start" />
                          {selectedSortLabel}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-64 p-2">
                        <div className="px-2 py-1.5">
                          <p className="text-sm font-semibold">Sort {title.toLowerCase()}</p>
                        </div>
                        <div className="grid gap-1">
                          {sortOptions.map((option) => (
                            <Button
                              key={serializeSort(option)}
                              type="button"
                              variant={serializeSort(option) === sortValue ? "secondary" : "ghost"}
                              size="sm"
                              className="justify-start"
                              onClick={() => setSortValue(serializeSort(option))}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  ) : null}
                </div>
              </div>
            ) : listFilters.length > 0 ? (
              <div className="mb-4 grid gap-3 rounded-2xl border bg-muted/20 p-3 sm:grid-cols-2 xl:grid-cols-3">
                {listFilters.map(renderFilterControl)}
              </div>
            ) : null}
            {recordsQuery.isLoading ? (
              <div className="flex flex-col gap-3">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="h-20 rounded-2xl" />
                ))}
              </div>
            ) : recordsQuery.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load {title.toLowerCase()}. Check the service connection and retry.
                </AlertDescription>
              </Alert>
            ) : records.length === 0 ? (
              <div className="rounded-2xl border bg-gradient-to-br from-background to-muted/25 p-8">
                <EmptyState
                  title={
                    inRecoveryView
                      ? recordState === "archived"
                        ? "Nothing in the archive"
                        : "Nothing recently deleted"
                      : emptyState?.title ?? "No records found"
                  }
                  description={
                    inRecoveryView
                      ? recordState === "archived"
                        ? "Records you archive will appear here — nothing is ever lost permanently."
                        : "Records you delete will appear here so you can restore them."
                      : emptyState?.description ?? emptyMessage
                  }
                />
                {!inRecoveryView && (canCreate || emptyState?.secondaryAction) ? (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {canCreate ? (
                      <Button type="button" size="sm" onClick={startCreate}>
                        <Plus data-icon="inline-start" />
                        {emptyState?.primaryActionLabel ?? primaryActionLabel ?? "Create Record"}
                      </Button>
                    ) : null}
                    {emptyState?.secondaryAction}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {recordColumns.length > 0 ? (
                  <div className="overflow-x-auto rounded-2xl border bg-background">
                    <table className="hidden w-full min-w-[960px] text-sm md:table">
                      <thead className="border-b bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          {recordColumns.map((column) => (
                            <th key={column.key} className={`px-4 py-3 font-semibold ${column.className ?? ""}`}>
                              {column.label}
                            </th>
                          ))}
                          <th className="w-[170px] px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-background">
                        {records.map((record) => (
                          <tr
                            key={record.id}
                            className={cn(
                              "align-top transition-colors",
                              !inRecoveryView && (viewInEditor || getRecordDetailHref?.(record)) && "cursor-pointer hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            )}
                            role={inRecoveryView ? undefined : viewInEditor ? "button" : getRecordDetailHref?.(record) ? "link" : undefined}
                            tabIndex={!inRecoveryView && (viewInEditor || getRecordDetailHref?.(record)) ? 0 : undefined}
                            onClick={() => openRecordDetail(record)}
                            onKeyDown={(event) => handleRecordKeyDown(event, record)}
                          >
                            {recordColumns.map((column) => (
                              <td key={column.key} className={`px-4 py-3 ${column.className ?? ""}`}>
                                {column.render(record)}
                              </td>
                            ))}
                            <td className="px-4 py-3">
                              <div className="flex justify-end">{renderRecordActions(record)}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="divide-y md:hidden">
                      {records.map((record) => (
                        renderMobileRecord ? (
                          <div
                            key={`mobile-${record.id}`}
                            className={cn(
                              "p-3",
                              !inRecoveryView && (viewInEditor || getRecordDetailHref?.(record)) && "cursor-pointer transition-colors hover:bg-muted/35",
                            )}
                            role={inRecoveryView ? undefined : viewInEditor ? "button" : getRecordDetailHref?.(record) ? "link" : undefined}
                            tabIndex={!inRecoveryView && (viewInEditor || getRecordDetailHref?.(record)) ? 0 : undefined}
                            onClick={() => openRecordDetail(record)}
                            onKeyDown={(event) => handleRecordKeyDown(event, record)}
                          >
                            {renderMobileRecord(record, renderRecordActions(record), getRecordDetailHref?.(record))}
                          </div>
                        ) : (
                          <RecordListRow
                            key={`mobile-${record.id}`}
                            record={record}
                            getRecordTitle={getRecordTitle}
                            getRecordMeta={getRecordMeta}
                            actions={renderRecordActions(record)}
                            detailHref={inRecoveryView ? null : getRecordDetailHref?.(record)}
                            openInEditor={viewInEditor && !inRecoveryView}
                            onOpen={() => openRecordDetail(record)}
                          />
                        )
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="divide-y rounded-2xl border bg-background">
                    {records.map((record) => (
                      renderMobileRecord ? (
                        <div
                          key={record.id}
                          className={cn(
                            "p-3",
                            (viewInEditor || getRecordDetailHref?.(record)) && "cursor-pointer transition-colors hover:bg-muted/35",
                          )}
                          role={inRecoveryView ? undefined : viewInEditor ? "button" : getRecordDetailHref?.(record) ? "link" : undefined}
                          tabIndex={!inRecoveryView && (viewInEditor || getRecordDetailHref?.(record)) ? 0 : undefined}
                          onClick={() => openRecordDetail(record)}
                          onKeyDown={(event) => handleRecordKeyDown(event, record)}
                        >
                          {renderMobileRecord(record, renderRecordActions(record), getRecordDetailHref?.(record))}
                        </div>
                      ) : (
                        <RecordListRow
                          key={record.id}
                          record={record}
                          getRecordTitle={getRecordTitle}
                          getRecordMeta={getRecordMeta}
                          actions={renderRecordActions(record)}
                          detailHref={inRecoveryView ? null : getRecordDetailHref?.(record)}
                          openInEditor={viewInEditor && !inRecoveryView}
                          onOpen={() => openRecordDetail(record)}
                        />
                      )
                    ))}
                  </div>
                )}
                <div className="flex flex-col gap-3 rounded-2xl border bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {visibleFrom}
                    </span>
                    {" - "}
                    <span className="font-medium text-foreground">
                      {visibleTo}
                    </span>{" "}
                    of <span className="font-medium text-foreground">{totalRecords}</span>
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      value={String(perPage)}
                      onValueChange={(value) => setPerPage(Number(value))}
                    >
                      <SelectTrigger className="h-9 w-[112px]">
                        <SelectValue aria-label="Rows per page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {[10, 25, 50, 100].map((option) => (
                            <SelectItem key={option} value={String(option)}>
                              {option} rows
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 1 || recordsQuery.isFetching}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                      Previous
                    </Button>
                    <span className="min-w-[92px] text-center text-sm text-muted-foreground">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages || recordsQuery.isFetching}
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {resolvedEditorMode === "sheet" ? (
        <Sheet
          open={editorOpen}
          onOpenChange={(open) => {
            if (!open) closeEditor();
          }}
        >
          <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-3xl">
            <SheetHeader>
              <SheetTitle>{editorTitle(title, editingRecord, editorIntent)}</SheetTitle>
              <SheetDescription>{editorDescription(title, editingRecord, getRecordTitle, editorIntent)}</SheetDescription>
            </SheetHeader>
            <EditorFormBody
              formId={formId}
              fields={fields}
              values={values}
              setValues={setValues}
              fieldErrors={fieldErrors}
              setFieldErrors={setFieldErrors}
              editingRecord={editingRecord}
              canCreate={canCreate}
              canEdit={canEdit}
              readOnlyMessage={readOnlyMessage}
              readOnly={false}
            />
            <SheetFooter className="sticky bottom-0 mt-auto gap-2 border-t bg-background pt-4 sm:gap-0">
              <EditorFooter
                editingRecord={editingRecord}
                canCreate={canCreate}
                canEdit={canEdit}
                isSaving={createMutation.isPending || updateMutation.isPending}
                onCancel={closeEditor}
                onSubmit={submit}
                editorIntent={editorIntent}
                onEdit={() => setEditorIntent("edit")}
              />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog
          open={editorOpen}
          onOpenChange={(open) => {
            if (!open) closeEditor();
          }}
        >
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{editorTitle(title, editingRecord, editorIntent)}</DialogTitle>
              <DialogDescription>{editorDescription(title, editingRecord, getRecordTitle, editorIntent)}</DialogDescription>
            </DialogHeader>
            <EditorFormBody
              formId={formId}
              fields={fields}
              values={values}
              setValues={setValues}
              fieldErrors={fieldErrors}
              setFieldErrors={setFieldErrors}
              editingRecord={editingRecord}
              canCreate={canCreate}
              canEdit={canEdit}
              readOnlyMessage={readOnlyMessage}
              readOnly={editorIntent === "view"}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <EditorFooter
                editingRecord={editingRecord}
                canCreate={canCreate}
                canEdit={canEdit}
                isSaving={createMutation.isPending || updateMutation.isPending}
                onCancel={closeEditor}
                onSubmit={submit}
                editorIntent={editorIntent}
                onEdit={() => setEditorIntent("edit")}
              />
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

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
      <Sheet
        open={!!workflowEditorTarget}
        onOpenChange={(open) => {
          if (!open) closeWorkflowEditor();
        }}
      >
        <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{workflowEditorTarget ? workflowEditorTarget.action.label : "Workflow Action"}</SheetTitle>
            <SheetDescription>
              {workflowEditorTarget
                ? workflowEditorTarget.action.confirmDescription
                  ? typeof workflowEditorTarget.action.confirmDescription === "function"
                    ? workflowEditorTarget.action.confirmDescription(workflowEditorTarget.record)
                    : workflowEditorTarget.action.confirmDescription
                  : `Update workflow details for "${getRecordTitle(workflowEditorTarget.record)}".`
                : "Update workflow details."}
            </SheetDescription>
          </SheetHeader>
          <EditorFormBody
            formId={workflowFormId}
            fields={workflowEditorTarget?.action.fields ?? []}
            values={workflowValues}
            setValues={setWorkflowValues}
            fieldErrors={workflowFieldErrors}
            setFieldErrors={setWorkflowFieldErrors}
            editingRecord={workflowEditorTarget?.record ?? null}
            canCreate={false}
            canEdit={canEdit}
            readOnlyMessage={readOnlyMessage}
          />
          <SheetFooter className="sticky bottom-0 mt-auto gap-2 border-t bg-background pt-4 sm:gap-0">
            <Button type="button" variant="outline" onClick={closeWorkflowEditor}>
              Cancel
            </Button>
            <Button type="button" onClick={submitWorkflowEditor} disabled={updateMutation.isPending}>
              {updateMutation.isPending
                ? "Saving..."
                : workflowEditorTarget?.action.confirmLabel ?? workflowEditorTarget?.action.label ?? "Save"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
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

function ResourceCommandPanel({
  title,
  description,
  totalRecords,
  visibleFrom,
  visibleTo,
  canCreate,
  canEdit,
  canDelete,
  hasActiveFilters,
  isFetching,
  actions,
  compact = false,
}: {
  title: string;
  description: string;
  totalRecords: number;
  visibleFrom: number;
  visibleTo: number;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  hasActiveFilters: boolean;
  isFetching: boolean;
  actions: ReactNode;
  compact?: boolean;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.86))] shadow-sm backdrop-blur dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.14),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.96),rgba(2,6,23,0.86))]",
        compact ? "rounded-2xl p-4" : "rounded-3xl p-5 sm:p-6",
      )}
    >
      <div className={cn("pointer-events-none absolute right-0 top-0 rounded-full bg-primary/10 blur-3xl", compact ? "h-20 w-20" : "h-28 w-28")} />
      <div className={cn("relative flex flex-col justify-between", compact ? "gap-3 lg:flex-row lg:items-center" : "gap-5 xl:flex-row xl:items-end")}>
        <div className={cn("min-w-0", compact ? "max-w-2xl" : "max-w-3xl")}>
          <div className={cn("inline-flex items-center gap-2 rounded-full border bg-background/80 text-xs font-medium text-muted-foreground shadow-sm", compact ? "mb-2 px-2.5 py-0.5" : "mb-3 px-3 py-1")}>
            <Sparkles className="size-3.5 text-orange-600" />
            Corporate Communication workspace
          </div>
          <h2 className={cn("font-semibold tracking-tight text-foreground", compact ? "text-xl md:text-2xl" : "text-2xl md:text-3xl")}>{title}</h2>
          <p className={cn("max-w-2xl text-sm text-muted-foreground", compact ? "mt-1 line-clamp-2 leading-5" : "mt-2 leading-6")}>{description}</p>
        </div>
        <div className={cn("flex flex-col", compact ? "gap-2 lg:items-end" : "gap-3")}>
          {!compact ? (
            <div className="grid gap-2 sm:grid-cols-3">
              <PremiumMetric icon={Database} label="Records" value={String(totalRecords)} />
              <PremiumMetric icon={ShieldCheck} label="Actions" value={canEdit ? "Edit" : "View"} />
              <PremiumMetric icon={SlidersHorizontal} label="Filters" value={hasActiveFilters ? "Active" : "Ready"} />
            </div>
          ) : null}
          {actions ? <div className="flex justify-start lg:justify-end">{actions}</div> : null}
        </div>
      </div>
      <div className={cn("relative flex flex-wrap items-center gap-2 text-xs text-muted-foreground", compact ? "mt-3" : "mt-5")}>
        <Badge variant="secondary" className="rounded-full">
          {compact ? `${visibleFrom}-${visibleTo} of ${totalRecords}` : `Showing ${visibleFrom}-${visibleTo}`}
        </Badge>
        <Badge variant="outline" className="rounded-full">
          {canEdit ? "Editable" : "Read only"}
        </Badge>
        {!compact ? (
          <>
            <Badge variant={canCreate ? "default" : "outline"} className="rounded-full">
              {canCreate ? "Create enabled" : "Create unavailable"}
            </Badge>
            <Badge variant={canDelete ? "destructive" : "outline"} className="rounded-full">
              {canDelete ? "Delete enabled" : "Protected records"}
            </Badge>
          </>
        ) : null}
        {compact && hasActiveFilters ? <Badge variant="secondary" className="rounded-full">Filters active</Badge> : null}
        {isFetching ? <Badge variant="outline" className="rounded-full">Refreshing</Badge> : null}
      </div>
    </section>
  );
}

function PremiumMetric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Database;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[132px] rounded-2xl border bg-background/80 p-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5 text-primary" />
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function RecordListRow<TRecord extends RecordShape>({
  record,
  getRecordTitle,
  getRecordMeta,
  actions,
  detailHref,
  openInEditor = false,
  onOpen,
}: {
  record: TRecord;
  getRecordTitle: (record: TRecord) => string;
  getRecordMeta?: (record: TRecord) => string;
  actions: ReactNode;
  detailHref?: string | null;
  openInEditor?: boolean;
  onOpen?: () => void;
}) {
  const isInteractive = openInEditor || Boolean(detailHref);
  const visualMedia = getRecordVisualMedia(record);
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isInteractive || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    onOpen?.();
  };

  return (
    <div
      className={cn(
        "group flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between",
        isInteractive && "cursor-pointer transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
      role={openInEditor ? "button" : detailHref ? "link" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={isInteractive ? onOpen : undefined}
      onKeyDown={handleKeyDown}
    >
      <div className="flex min-w-0 flex-1 gap-4">
        <RecordMediaPreview media={visualMedia} record={record} />
        <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="break-words font-semibold tracking-tight">{getRecordTitle(record)}</p>
          {record.status ? <Badge variant="outline">{record.status}</Badge> : null}
          {record.workflow_status ? <Badge variant="secondary">{String(record.workflow_status).replace(/_/g, " ")}</Badge> : null}
          {typeof record.is_active === "boolean" ? (
            <Badge variant={record.is_active ? "default" : "secondary"}>
              {record.is_active ? "Active" : "Inactive"}
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
          {getRecordMeta?.(record) ??
            record.updated_at ??
            record.created_at ??
            "No metadata"}
        </p>
        </div>
      </div>
      {actions}
    </div>
  );
}

function RecordMediaPreview({
  media,
  record,
}: {
  media?: RecordShape | null;
  record: RecordShape;
}) {
  const candidate = media ?? (isMediaLikeRecord(record) ? record : null);
  if (!candidate) return null;
  const url = getMediaUrl(candidate as any);
  const image = isImageMedia(candidate as any);
  const label = getMediaLabel(candidate as any);

  return (
    <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted shadow-sm transition-transform group-hover:scale-[1.02]">
      {url && image ? (
        <ImageRenderer src={url} alt={label} className="h-full border-0" imageClassName="h-full w-full" />
      ) : (
        <span className="px-2 text-center text-[11px] font-medium uppercase text-muted-foreground">
          {image ? "Image" : String(candidate.media_type ?? "File")}
        </span>
      )}
    </div>
  );
}

function getRecordVisualMedia(record: RecordShape): RecordShape | null {
  const keys = [
    "media",
    "featured_media",
    "featured_image",
    "cover_image",
    "image",
    "logo",
    "photo",
    "thumbnail",
  ];
  for (const key of keys) {
    const value = record[key];
    if (value && typeof value === "object") return value as RecordShape;
  }
  return null;
}

function isMediaLikeRecord(record: RecordShape) {
  return Boolean(record.media_type || record.mime_type || record.storage_path || record.public_url || record.cdn_url || record.thumbnail_url);
}

function editorDescription<TRecord extends RecordShape>(
  title: string,
  editingRecord: TRecord | null,
  getRecordTitle: (record: TRecord) => string,
  editorIntent: "create" | "view" | "edit",
) {
  if (editorIntent === "view" && editingRecord) {
    return `View ${getRecordTitle(editingRecord)} without leaving this list.`;
  }
  return editingRecord
    ? `Update ${getRecordTitle(editingRecord)} without leaving this list.`
    : `Create a ${title.toLowerCase()} record without leaving this list.`;
}

function editorTitle<TRecord extends RecordShape>(
  title: string,
  editingRecord: TRecord | null,
  editorIntent: "create" | "view" | "edit",
) {
  if (editorIntent === "view") return `View ${title}`;
  return editingRecord ? `Edit ${title}` : `Create ${title}`;
}

function EditorFormBody<TRecord extends RecordShape>({
  formId,
  fields,
  values,
  setValues,
  fieldErrors,
  setFieldErrors,
  editingRecord,
  canCreate,
  canEdit,
  readOnlyMessage,
  readOnly = false,
}: {
  formId: string;
  fields: EditableField[];
  values: RecordShape;
  setValues: Dispatch<SetStateAction<RecordShape>>;
  fieldErrors: Record<string, string>;
  setFieldErrors: Dispatch<SetStateAction<Record<string, string>>>;
  editingRecord: TRecord | null;
  canCreate: boolean;
  canEdit: boolean;
  readOnlyMessage: string;
  readOnly?: boolean;
}) {
  const canModify = editingRecord ? canEdit : canCreate;
  const shouldShowFields = readOnly || canModify;
  const fieldGroups = useMemo(() => groupEditableFields(fields), [fields]);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(fieldGroups.map((group, index) => [group.title, index < 2])),
  );

  useEffect(() => {
    setOpenGroups(Object.fromEntries(fieldGroups.map((group, index) => [group.title, index < 2])));
  }, [fieldGroups]);

  return (
    <div className="flex flex-col gap-4 py-2">
      {!readOnly && !editingRecord && !canCreate ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          {readOnlyMessage}
        </p>
      ) : null}
      {!readOnly && editingRecord && !canEdit ? (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          {readOnlyMessage}
        </p>
      ) : null}
      {shouldShowFields
        ? fieldGroups.map((group) => (
            <section key={group.title} className="rounded-lg border bg-background">
              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                aria-expanded={Boolean(openGroups[group.title])}
                onClick={() => setOpenGroups((current) => ({ ...current, [group.title]: !current[group.title] }))}
              >
                <span>
                  <span className="block text-sm font-semibold">{group.title}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{group.description}</span>
                </span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openGroups[group.title] ? "rotate-180" : ""}`} />
              </button>
              {openGroups[group.title] ? (
                <div className="grid gap-4 border-t p-4 md:grid-cols-2">
                  {group.fields.map((field) =>
                    readOnly ? (
                      <ReadOnlyFieldControl
                        key={field.name}
                        field={field}
                        value={values[field.name]}
                        values={values}
                        entityId={editingRecord?.id}
                      />
                    ) : (
                      <EditableFieldControl
                        key={field.name}
                        field={field}
                        id={`${formId}-${field.name}`}
                        value={values[field.name]}
                        values={values}
                        error={fieldErrors[field.name]}
                        setValues={setValues}
                        setFieldErrors={setFieldErrors}
                        entityId={editingRecord?.id}
                      />
                    ),
                  )}
                </div>
              ) : null}
            </section>
          ))
        : null}
    </div>
  );
}

function ReadOnlyFieldControl({
  field,
  value,
  values,
  entityId,
}: {
  field: EditableField;
  value: unknown;
  values: RecordShape;
  entityId?: string | null;
}) {
  const wideField = field.type === "textarea" || field.type === "richtext" || field.type === "attachments" || field.type === "entity-record" || field.type === "entity-multi";

  if (field.type === "media") {
    return (
      <div className="flex flex-col gap-2 md:col-span-2">
        <p className="text-sm font-medium">{field.label}</p>
        {value ? (
          <MediaPicker
            value={String(value)}
            onChange={() => undefined}
            label={field.label}
            mediaType={field.media?.mediaType}
            folderId={field.media?.folderId}
            helperText={field.media?.helperText}
            accept={field.media?.accept}
            allowUpload={false}
            allowClear={false}
            disabled
          />
        ) : (
          <ReadOnlyEmptyValue />
        )}
      </div>
    );
  }

  if (field.type === "attachments" && field.attachments) {
    return (
      <div className="flex flex-col gap-2 md:col-span-2">
        <p className="text-sm font-medium">{field.label}</p>
        {entityId ? (
          <AttachmentManager
            entityType={field.attachments.entityType}
            entityId={entityId}
            roles={field.attachments.roles}
            defaultRole={field.attachments.defaultRole}
            disabled
            isPublic={field.attachments.isPublic}
            allowVisibilityChange={false}
          />
        ) : (
          <ReadOnlyEmptyValue />
        )}
      </div>
    );
  }

  if (field.type === "entity" && field.relation) {
    return (
      <div className={cn("flex flex-col gap-2", wideField && "md:col-span-2")}>
        <p className="text-sm font-medium">{field.label}</p>
        {value ? (
          <EntityPicker
            adapter={relationshipAdapters[field.relation.adapter] as any}
            value={String(value)}
            filters={field.relation.filters}
            onChange={() => undefined}
            disabled
            allowClear={false}
            placeholder={`Loading ${field.label.toLowerCase()}...`}
          />
        ) : (
          <ReadOnlyEmptyValue />
        )}
      </div>
    );
  }

  if (field.type === "entity-record" && field.entityRecord) {
    const typeValue = String(values[field.entityRecord.typeName] ?? "");
    const idValue = String(values[field.entityRecord.idName] ?? "");
    const selectedConfig = field.entityRecord.configs.find((config) => config.value === typeValue);
    return (
      <div className="flex flex-col gap-2 md:col-span-2">
        <p className="text-sm font-medium">{field.label}</p>
        {!selectedConfig ? (
          <ReadOnlyEmptyValue />
        ) : selectedConfig.recordRequired === false ? (
          <div className="min-h-10 rounded-md border bg-muted/30 px-3 py-2 text-sm text-foreground">
            {selectedConfig.label}
          </div>
        ) : idValue ? (
          <div className="flex flex-col gap-1.5">
            <p className="text-xs text-muted-foreground">{selectedConfig.label}</p>
            <EntityPicker
              adapter={relationshipAdapters[selectedConfig.adapter] as any}
              value={idValue}
              filters={selectedConfig.filters}
              onChange={() => undefined}
              disabled
              allowClear={false}
              placeholder={`Loading ${selectedConfig.label.toLowerCase()}...`}
            />
          </div>
        ) : (
          <ReadOnlyEmptyValue />
        )}
      </div>
    );
  }

  let displayValue: ReactNode = "—";

  if (field.type === "boolean") {
    displayValue = value ? "Yes" : "No";
  } else if (Array.isArray(value)) {
    displayValue = value.length ? value.join(", ") : "—";
  } else if (field.type === "select") {
    displayValue = field.options?.find((option) => option.value === String(value))?.label ?? String(value || "—");
  } else if (value !== null && value !== undefined && value !== "") {
    displayValue = String(value);
  }

  return (
    <div className={cn("flex flex-col gap-2", wideField && "md:col-span-2")}>
      <p className="text-sm font-medium">{field.label}</p>
      <div className="min-h-10 whitespace-pre-wrap break-words rounded-md border bg-muted/30 px-3 py-2 text-sm text-foreground">
        {displayValue}
      </div>
    </div>
  );
}

function ReadOnlyEmptyValue() {
  return (
    <div className="min-h-10 rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
      —
    </div>
  );
}

function groupEditableFields(fields: EditableField[]) {
  const groups = [
    {
      title: "Basics",
      description: "Core naming, status, and primary identifiers.",
      fields: [] as EditableField[],
    },
    {
      title: "Relationships",
      description: "Readable selectors for backend-linked records.",
      fields: [] as EditableField[],
    },
    {
      title: "Dates and Numbers",
      description: "Timeline, budget, counts, and measurable values.",
      fields: [] as EditableField[],
    },
    {
      title: "Content",
      description: "Long-form copy shown in admin or public contexts.",
      fields: [] as EditableField[],
    },
    {
      title: "Media and Links",
      description: "Media uploads, URLs, and external references.",
      fields: [] as EditableField[],
    },
    {
      title: "Visibility",
      description: "Publication, featured, and active-state controls.",
      fields: [] as EditableField[],
    },
  ];

  const byTitle = Object.fromEntries(groups.map((group) => [group.title, group]));
  for (const field of fields) {
    const name = field.name.toLowerCase();
    if (field.type === "entity" || field.type === "entity-record" || name.endsWith("_id")) {
      byTitle.Relationships.fields.push(field);
    } else if (field.type === "date" || field.type === "datetime-local" || field.type === "number" || /amount|budget|value|count|year|percentage|order|capacity|award|score|rate/.test(name)) {
      byTitle["Dates and Numbers"].fields.push(field);
    } else if (field.type === "textarea" || field.type === "richtext" || /summary|description|abstract|background|objectives|methodology|outcomes|impact|deliverables|eligibility|requirements|content|notes|story|body|about|mandate|vision|mission/.test(name)) {
      byTitle.Content.fields.push(field);
    } else if (field.type === "media" || field.type === "url" || /url|image|media|document|file|attachment|doi|pdf/.test(name)) {
      byTitle["Media and Links"].fields.push(field);
    } else if (field.type === "boolean" || /^is_/.test(name) || /status|visibility|featured|active|public|required/.test(name)) {
      byTitle.Visibility.fields.push(field);
    } else {
      byTitle.Basics.fields.push(field);
    }
  }

  return groups.filter((group) => group.fields.length > 0);
}

function EditableFieldControl({
  field,
  id,
  value,
  values,
  error,
  setValues,
  setFieldErrors,
  entityId,
}: {
  field: EditableField;
  id: string;
  value: unknown;
  values: RecordShape;
  error?: string;
  setValues: Dispatch<SetStateAction<RecordShape>>;
  setFieldErrors: Dispatch<SetStateAction<Record<string, string>>>;
  entityId?: string | null;
}) {
  const labelId = `${id}-label`;
  const describedBy = error ? `${id}-error` : undefined;
  const resolvedType = inputType(field);
  const stringValue = value === null || value === undefined ? "" : String(value);
  const wideField = field.type === "textarea" || field.type === "richtext" || field.type === "media" || field.type === "attachments" || field.type === "entity-record" || field.type === "entity-multi";
  const clearError = () => {
    if (!error) return;
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[field.name];
      return next;
    });
  };
  const setFieldValue = (nextValue: unknown) => {
    setValues((current) => ({
      ...current,
      [field.name]: nextValue,
    }));
    clearError();
  };

  return (
    <div className={cn("flex flex-col gap-2", wideField && "md:col-span-2")}>
      <div className="flex items-center gap-1.5">
        <label
          id={labelId}
          htmlFor={
            field.type === "boolean" || field.type === "textarea" || field.type === "richtext"
              ? undefined
              : id
          }
          className="text-sm font-medium"
        >
          {field.label}
          {field.required ? " *" : ""}
        </label>
        {field.helpText ? <FieldHelp label={field.label} text={field.helpText} /> : null}
      </div>
      {field.type === "textarea" || field.type === "richtext" ? (
        <RichTextEditor
          editorId={id}
          ariaLabelledby={labelId}
          ariaDescribedby={describedBy}
          ariaInvalid={Boolean(error)}
          toolbar="simple"
          minHeight="180px"
          placeholder={field.placeholder}
          value={stringValue}
          onChange={setFieldValue}
        />
      ) : field.type === "media" ? (
        <MediaPicker
          value={stringValue}
          onChange={setFieldValue}
          label={field.label}
          mediaType={field.media?.mediaType}
          folderId={field.media?.folderId}
          helperText={field.media?.helperText}
          placeholder={field.placeholder}
          accept={field.media?.accept}
          isPublic={field.media?.isPublic}
          uploadEntityType={field.media?.uploadEntityType}
          uploadEntityId={
            field.media?.uploadEntityIdField && typeof values[field.media.uploadEntityIdField] === "string"
              ? values[field.media.uploadEntityIdField]
              : undefined
          }
          uploadRole={field.media?.uploadRole}
          allowUpload={field.media?.allowUpload}
          allowClear={!field.required}
        />
      ) : field.type === "attachments" && field.attachments ? (
        <AttachmentManager
          entityType={field.attachments.entityType}
          entityId={entityId}
          roles={field.attachments.roles}
          defaultRole={field.attachments.defaultRole}
          pendingAttachments={Array.isArray(value) ? value as PendingMediaAttachment[] : []}
          onPendingAttachmentsChange={setFieldValue}
          isPublic={field.attachments.isPublic ?? (typeof values.is_public === "boolean" ? values.is_public : true)}
          allowVisibilityChange={field.attachments.allowVisibilityChange}
          uploadEntityType={field.attachments.uploadEntityType}
          uploadEntityId={
            field.attachments.uploadEntityIdField && typeof values[field.attachments.uploadEntityIdField] === "string"
              ? values[field.attachments.uploadEntityIdField]
              : undefined
          }
        />
      ) : field.type === "entity" && field.relation ? (
        <EntityPicker
          adapter={relationshipAdapters[field.relation.adapter] as any}
          value={stringValue}
          onChange={(nextValue) => setFieldValue(nextValue || "")}
          filters={field.relation.filters}
          placeholder={field.placeholder ?? `Select ${field.label.toLowerCase()}`}
          description={field.relation.description}
          allowClear={field.relation.allowClear ?? !field.required}
          required={field.required}
        />
      ) : field.type === "entity-multi" && field.relation ? (
        <MultiEntityPicker
          adapter={relationshipAdapters[field.relation.adapter] as any}
          value={Array.isArray(value) ? value.map(String) : []}
          onChange={(nextValue) => setFieldValue(nextValue)}
          filters={field.relation.filters}
          placeholder={field.placeholder ?? `Add ${field.label.toLowerCase()}`}
          description={field.relation.description}
        />
      ) : field.type === "entity-record" && field.entityRecord ? (
        <EntityTypeRecordPicker
          typeValue={String(values[field.entityRecord.typeName] ?? "")}
          idValue={String(values[field.entityRecord.idName] ?? "")}
          onChange={({ type, id: recordId }) => {
            setValues((current) => ({
              ...current,
              [field.entityRecord!.typeName]: type,
              [field.entityRecord!.idName]: recordId,
            }));
            clearError();
          }}
          configs={field.entityRecord.configs.map((config) => ({
            ...config,
            adapter: relationshipAdapters[config.adapter] as any,
          }))}
          label={undefined}
          description={field.entityRecord.description}
          typePlaceholder={field.entityRecord.typePlaceholder}
          recordPlaceholder={field.entityRecord.recordPlaceholder}
          allowNone={field.entityRecord.allowNone}
        />
      ) : field.type === "select" ? (
        <Select
          value={stringValue || undefined}
          onValueChange={setFieldValue}
        >
          <SelectTrigger
            id={id}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
          >
            <SelectValue placeholder={field.placeholder ?? field.label} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {(field.options ?? []).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      ) : field.type === "boolean" ? (
        <div className="flex items-center justify-between rounded-lg border p-3">
          <span id={`${id}-label`} className="text-sm text-muted-foreground">
            {field.placeholder ?? field.label}
          </span>
          <Switch
            aria-labelledby={`${id}-label`}
            checked={Boolean(value)}
            onCheckedChange={setFieldValue}
          />
        </div>
      ) : field.type === "date" || field.type === "datetime-local" ? (
        <DateTimePicker
          id={id}
          mode={field.type}
          value={stringValue}
          onChange={setFieldValue}
          placeholder={field.placeholder ?? field.label}
          required={field.required}
          ariaInvalid={Boolean(error)}
          ariaDescribedby={describedBy}
        />
      ) : (
        <Input
          id={id}
          type={
            resolvedType === "number"
              ? "number"
              : resolvedType === "email"
                    ? "email"
                    : resolvedType === "url"
                      ? "url"
                      : "text"
          }
          inputMode={resolvedType === "number" ? "numeric" : undefined}
          placeholder={field.placeholder}
          value={stringValue}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          error={Boolean(error)}
          autoComplete={
            resolvedType === "email" ? "email" : resolvedType === "url" ? "url" : undefined
          }
          onChange={(event) => setFieldValue(event.target.value)}
        />
      )}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function FieldHelp({ label, text }: { label: string; text: string }) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Help for ${label}`}
          >
            <HelpCircle className="size-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-64 text-sm" align="start">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function EditorFooter<TRecord extends RecordShape>({
  editingRecord,
  canCreate,
  canEdit,
  isSaving,
  onCancel,
  onSubmit,
  editorIntent,
  onEdit,
}: {
  editingRecord: TRecord | null;
  canCreate: boolean;
  canEdit: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  editorIntent: "create" | "view" | "edit";
  onEdit: () => void;
}) {
  return (
    <>
      <Button type="button" variant="outline" onClick={onCancel}>
        {editorIntent === "view" ? "Close" : "Cancel"}
      </Button>
      {editorIntent === "view" && canEdit ? (
        <Button type="button" onClick={onEdit}>
          <Edit data-icon="inline-start" />
          Edit Record
        </Button>
      ) : (editingRecord ? canEdit : canCreate) ? (
        <Button type="button" onClick={onSubmit} disabled={isSaving}>
          {isSaving ? "Saving..." : editingRecord ? "Save Changes" : "Create"}
        </Button>
      ) : null}
    </>
  );
}
