"use client";

import { useCallback, useEffect, useState } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { getStoredAccessToken } from "@ksu/auth";
import {
  History,
  Loader2,
  Download,
  Eye,
  BarChart3,
  CheckCircle2,
  Clock3,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Label,
  RichTextEditor,
  RichTextRenderer,
} from "@ksu/ui/components";
import { useHeriPartnerSync, useHeriResourceMutation, useHeriResourceQuery } from "@/lib/api/heri";
import { HeriMediaPicker } from "./heri-media-picker";

type RecordValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Record<string, unknown>;
type HeriRecord = { id: string; [key: string]: RecordValue };
type AuditEntry = {
  id: string;
  action: string;
  actor_id?: string | null;
  previous_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  created_at?: string;
};
type Field = {
  name: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "richtext"
    | "select"
    | "boolean"
    | "number"
    | "date"
    | "media";
  required?: boolean;
  options?: string[];
};
type Config = {
  resource: string;
  title: string;
  description: string;
  fields: Field[];
  permission?: string;
  workflow?: boolean;
};

const API =
  process.env.NEXT_PUBLIC_HERI_API_URL ?? "http://localhost:8003/api/v1/heri";
const statuses = [
  "draft",
  "in_review",
  "approved",
  "scheduled",
  "published",
  "archived",
];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredAccessToken();
  const response = await fetch(`${API}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function display(value: RecordValue) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value && typeof value === "object") return JSON.stringify(value);
  return value == null || value === "" ? "—" : String(value);
}

function isRichTextField(field: Field) {
  return field.type === "richtext";
}

export function HeriCrudWorkspace({ config }: { config: Config }) {
  const { hasPermission, isAdmin } = usePermissions();
  const canWrite =
    isAdmin || hasPermission(config.permission ?? "heri.content.write");
  const canDelete = isAdmin || hasPermission("heri.content.write");
  const [records, setRecords] = useState<HeriRecord[]>([]);
  const [selected, setSelected] = useState<HeriRecord | null>(null);
  const [history, setHistory] = useState<AuditEntry[] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);
  const [editorValues, setEditorValues] = useState<Record<string, string>>({});
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 8;
  const resourceQuery = useHeriResourceQuery<HeriRecord>(config.resource, {
    page,
    per_page: pageSize,
    search: query || undefined,
    status: status === "all" ? undefined : status,
  });
  const resourceMutation = useHeriResourceMutation(config.resource);
  const partnerSync = useHeriPartnerSync();
  const loading = resourceQuery.isPending || resourceQuery.isFetching;

  const load = useCallback(async () => {
    setError(null);
    setSelectedIds(new Set());
    try {
      await resourceQuery.refetch();
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Unable to load records";
      setError(message);
      toast.error(message);
    }
  }, [resourceQuery]);
  useEffect(() => {
    if (resourceQuery.data) setRecords(resourceQuery.data.data);
  }, [resourceQuery.data]);
  useEffect(() => {
    if (resourceQuery.error) {
      const message =
        resourceQuery.error instanceof Error
          ? resourceQuery.error.message
          : "Unable to load records";
      setError(message);
    }
  }, [resourceQuery.error]);
  useEffect(() => {
    const guard = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [isDirty]);

  const pages = resourceQuery.data?.meta.pages ?? 1;
  const filtered = records;
  const visible = records;
  const columns = config.fields.slice(0, 4);
  const openEditor = (record: HeriRecord) => {
    setSelected(record);
    setHistory(null);
    setIsDirty(false);
    setEditorValues(
      Object.fromEntries(
        config.fields
          .filter((field) => field.type === "richtext")
          .map((field) => [field.name, String(record[field.name] ?? "")]),
      ),
    );
  };

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selected || !canWrite) return;
    setSaving(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {};
    try {
      config.fields.forEach((field) => {
        const value = form.get(field.name);
        if (field.type === "richtext")
          payload[field.name] = editorValues[field.name] ?? "";
        else if (field.type === "boolean") payload[field.name] = value === "on";
        else if (value !== null && value !== "")
          payload[field.name] = [
            "contact",
            "social_links",
            "seo_defaults",
            "payload",
            "collaboration_areas",
            "values",
          ].includes(field.name)
            ? JSON.parse(String(value))
            : field.type === "number"
              ? Number(value)
              : value;
      });
    } catch {
      setError("JSON fields must contain valid JSON.");
      setSaving(false);
      return;
    }
    try {
      await resourceMutation.mutateAsync({
        id: selected.id || undefined,
        payload,
      });
      setSelected(null);
      setIsDirty(false);
      toast.success(selected.id ? "Record updated" : "Record created");
      await load();
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Unable to save record";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };
  const remove = async (record: HeriRecord) => {
    if (
      !canDelete ||
      !window.confirm(
        `Delete ${display(record.title ?? record.name ?? record.slug)}?`,
      )
    )
      return;
    try {
      await request(`/admin/${config.resource}/${record.id}`, {
        method: "DELETE",
      });
      toast.success("Record deleted");
      await load();
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Unable to delete record";
      setError(message);
      toast.error(message);
    }
  };
  const removeSelected = async () => {
    if (
      !canDelete ||
      selectedIds.size === 0 ||
      !window.confirm(`Delete ${selectedIds.size} selected records?`)
    )
      return;
    try {
      await Promise.all(
        Array.from(selectedIds, (id) =>
          request(`/admin/${config.resource}/${id}`, { method: "DELETE" }),
        ),
      );
      toast.success(
        `${selectedIds.size} record${selectedIds.size === 1 ? "" : "s"} deleted`,
      );
      await load();
    } catch (reason) {
      const message =
        reason instanceof Error
          ? reason.message
          : "Unable to delete selected records";
      setError(message);
      toast.error(message);
    }
  };

  const syncPartners = async () => {
    try {
      const result = await partnerSync.mutateAsync();
      toast.success(`Synced ${result.total} partners (${result.created} new, ${result.updated} updated)`);
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Unable to sync partners");
    }
  };
  const toggleSelected = (id: string) =>
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const transitionSelected = async (nextStatus: string) => {
    if (!canWrite || selectedIds.size === 0) return;
    try {
      await Promise.all(
        Array.from(selectedIds, (id) =>
          request(`/admin/${config.resource}/${id}/transition`, {
            method: "POST",
            body: JSON.stringify({ status: nextStatus, note: "Bulk workflow update from HERI admin workspace" }),
          }),
        ),
      );
      toast.success(`${selectedIds.size} workflow records updated`);
      await load();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Unable to update workflow",
      );
    }
  };
  const exportCsv = () => {
    const exportRows =
      selectedIds.size > 0
        ? visible.filter((record) => selectedIds.has(record.id))
        : visible;
    if (exportRows.length === 0) {
      toast.error("No records to export");
      return;
    }
    const escapeCell = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;
    const fields = config.fields.map((field) => field.name);
    const csv = [
      fields.map(escapeCell).join(","),
      ...exportRows.map((record) =>
        fields.map((field) => escapeCell(display(record[field]))).join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `heri-${config.resource}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    toast.success(
      `${exportRows.length} record${exportRows.length === 1 ? "" : "s"} exported`,
    );
  };
  const transition = async (record: HeriRecord, next: string) => {
    try {
      await request(`/admin/${config.resource}/${record.id}/transition`, {
        method: "POST",
        body: JSON.stringify({
          status: next,
          note: "Updated from HERI admin workspace",
        }),
      });
      await load();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Unable to update workflow");
    }
  };
  const showHistory = async (record: HeriRecord) => {
    setSelected(record);
    setHistory(
      await request<AuditEntry[]>(
        `/admin/${config.resource}/${record.id}/audit`,
      ).catch(() => []),
    );
  };

  return (
    <main className="min-h-full bg-muted/20 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-5">
      <header className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            HERI Africa administration
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {config.title}
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-5 text-slate-600">
            {config.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {config.resource === "partners" && canWrite && (
            <button
              onClick={() => void syncPartners()}
              disabled={partnerSync.isPending}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-300 px-4 py-2.5 text-sm font-semibold text-emerald-800 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${partnerSync.isPending ? "animate-spin" : ""}`} />
              {partnerSync.isPending ? "Syncing…" : "Sync from Research Service"}
            </button>
          )}
          {canWrite && (
            <button
              onClick={() =>
                openEditor({
                  id: "",
                  ...Object.fromEntries(
                    config.fields.map((field) => [
                      field.name,
                      field.type === "boolean" ? false : "",
                    ]),
                  ),
                })
              }
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <Plus className="size-4" />
              Create record
            </button>
          )}
        </div>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" />
            <input
              aria-label="Filter records"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search records…"
              className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none transition-shadow focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          {config.fields.some((field) => field.name === "status") && (
            <select
              aria-label="Filter by status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
            >
              <option value="all">All statuses</option>
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item.replace("_", " ")}
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() => void load()}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
          <button
            onClick={exportCsv}
            disabled={loading || visible.length === 0}
            aria-label={
              selectedIds.size > 0
                ? "Export selected records"
                : "Export records"
            }
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="size-4" />
            {selectedIds.size > 0 ? "Export selected" : "Export CSV"}
          </button>
        </div>
        {selectedIds.size > 0 && (canDelete || canWrite) && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-800">
            <span>{selectedIds.size} selected</span>
            <div className="flex flex-wrap gap-2">
              {config.workflow && canWrite && (
                <select
                  aria-label="Bulk workflow status"
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value)
                      void transitionSelected(event.target.value);
                  }}
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs"
                >
                  <option value="">Change status…</option>
                  {statuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              )}
              {canDelete && (
                <button
                  onClick={() => void removeSelected()}
                  className="inline-flex cursor-pointer items-center gap-2 font-semibold text-red-700 hover:text-red-950"
                >
                  <Trash2 className="size-4" />
                  Delete selected
                </button>
              )}
            </div>
          </div>
        )}
      </section>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <section aria-label={`${config.title} overview`} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total records", value: resourceQuery.data?.meta.total ?? records.length, detail: "Across this HERI workspace", icon: FileText, tone: "text-slate-700" },
          { label: "Published", value: records.filter((record) => record.status === "published").length, detail: "Visible on the public site", icon: CheckCircle2, tone: "text-emerald-700" },
          { label: "Needs attention", value: records.filter((record) => ["draft", "in_review"].includes(String(record.status))).length, detail: "Draft or under review", icon: Clock3, tone: "text-amber-700" },
          { label: "On this page", value: records.length, detail: `Page ${page} of ${pages}`, icon: BarChart3, tone: "text-sky-700" },
        ].map((metric) => (
          <Card key={metric.label} className="border-slate-200 shadow-sm">
            <CardContent className="flex items-start justify-between p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{metric.label}</p>
                <p className={`mt-2 text-2xl font-bold tracking-tight ${metric.tone}`}>{metric.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
              </div>
              <metric.icon className={`size-5 ${metric.tone}`} />
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Select all visible records"
                    checked={
                      visible.length > 0 &&
                      visible.every((record) => selectedIds.has(record.id))
                    }
                    onChange={(event) =>
                      setSelectedIds((current) => {
                        const next = new Set(current);
                        visible.forEach((record) =>
                          event.target.checked
                            ? next.add(record.id)
                            : next.delete(record.id),
                        );
                        return next;
                      })
                    }
                  />
                </th>
                {columns.map((field) => (
                  <th className="px-4 py-3" key={field.name}>
                    {field.label}
                  </th>
                ))}
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Loading records…
                    </span>
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 2}
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No records match this filter.
                  </td>
                </tr>
              ) : (
                visible.map((record) => (
                  <tr
                    key={record.id}
                    className={`transition-colors hover:bg-emerald-50/40 ${selectedIds.has(record.id) ? "bg-emerald-50/60" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label={`Select ${display(record.title ?? record.name ?? record.slug)}`}
                        checked={selectedIds.has(record.id)}
                        onChange={() => toggleSelected(record.id)}
                      />
                    </td>
                    {columns.map((field) => (
                      <td
                        className="max-w-xs px-4 py-3 text-slate-700"
                        key={field.name}
                      >
                        {field.name === "status" ? (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${String(record[field.name]) === "published" ? "bg-emerald-100 text-emerald-800" : String(record[field.name]) === "draft" ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-800"}`}
                          >
                            {display(record[field.name]).replace("_", " ")}
                          </span>
                        ) : (
                          display(record[field.name])
                        )}
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href={`/heri/${config.resource}/${record.id}`}
                          className="inline-flex items-center gap-1 font-semibold text-slate-700 hover:text-emerald-800"
                        >
                          <Eye className="size-3.5" />
                          View
                        </a>
                        <button
                          onClick={() => openEditor(record)}
                          className="inline-flex cursor-pointer items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900"
                          disabled={!canWrite}
                        >
                          <Pencil className="size-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => void showHistory(record)}
                          className="inline-flex cursor-pointer items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
                        >
                          <History className="size-3.5" />
                          History
                        </button>
                        {config.workflow && record.status && canWrite && (
                          <select
                            aria-label={`Workflow status for ${display(record.title ?? record.name)}`}
                            value={String(record.status)}
                            onChange={(event) =>
                              void transition(record, event.target.value)
                            }
                            className="rounded border border-slate-300 px-1 py-0.5 text-xs"
                          >
                            {statuses.map((item) => (
                              <option key={item}>{item}</option>
                            ))}
                          </select>
                        )}
                        <button
                          onClick={() => void remove(record)}
                          className="inline-flex cursor-pointer items-center gap-1 font-semibold text-red-600 hover:text-red-800"
                          disabled={!canDelete}
                        >
                          <Trash2 className="size-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {filtered.length} records · page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="cursor-pointer rounded border px-3 py-1 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= pages}
              onClick={() => setPage((current) => current + 1)}
              className="cursor-pointer rounded border px-3 py-1 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (open) return;
          if (isDirty && !window.confirm("Discard unsaved changes?")) return;
          setSelected(null);
          setHistory(null);
          setIsDirty(false);
        }}
      >
        <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-4xl">
          {selected && (
          <form
            onChange={() => setIsDirty(true)}
            onSubmit={save}
            className="space-y-5"
          >
            <DialogHeader className="border-b px-6 py-5">
              <DialogTitle>{selected.id ? "Edit record" : "Create record"}</DialogTitle>
              <DialogDescription>Changes are audited and remain subject to your assigned HERI permissions.</DialogDescription>
            </DialogHeader>
            {history ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">
                  Revision history
                </h3>
                {history.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No audit entries found.
                  </p>
                ) : (
                  history.map((entry) => (
                    <article
                      className="rounded-lg border border-slate-200 p-3 text-sm"
                      key={entry.id}
                    >
                      <div className="flex justify-between font-medium">
                        <span>{entry.action}</span>
                        <time className="text-slate-500">
                          {entry.created_at
                            ? new Date(entry.created_at).toLocaleString()
                            : ""}
                        </time>
                      </div>
                      <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-xs text-slate-600">
                        {JSON.stringify(entry.new_value ?? {}, null, 2)}
                      </pre>
                    </article>
                  ))
                )}
                <button
                  type="button"
                  onClick={() => setHistory(null)}
                  className="cursor-pointer rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Back to editor
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 px-6 pb-2">
                {config.fields.map((field) => (
                  <div className="space-y-2" key={field.name}>
                    <Label>{field.label}{field.required && <span className="text-red-600"> *</span>}</Label>
                    {field.type === "richtext" ? (
                      <RichTextEditor
                        value={String(selected[field.name] ?? "")}
                        onChange={(value) => {
                          setSelected((current) => current ? { ...current, [field.name]: value } : current);
                          setEditorValues((current) => ({ ...current, [field.name]: value }));
                          setIsDirty(true);
                        }}
                        minHeight="10rem"
                        placeholder={`Write ${field.label.toLowerCase()}…`}
                      />
                    ) : field.type === "media" ? (
                      <>
                        <input type="hidden" name={field.name} value={String(selected[field.name] ?? "")} />
                        <HeriMediaPicker value={String(selected[field.name] ?? "")} onChange={(value) => { selected[field.name] = value; setSelected({ ...selected }); setIsDirty(true); }} />
                      </>
                    ) : field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        defaultValue={
                          display(selected[field.name]) === "—"
                            ? ""
                            : String(selected[field.name] ?? "")
                        }
                        required={field.required}
                        rows={4}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                      />
                    ) : field.type === "select" ? (
                      <select
                        name={field.name}
                        defaultValue={String(selected[field.name] ?? "")}
                        required={field.required}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                      >
                        <option value="">Select…</option>
                        {(field.options ?? []).map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    ) : field.type === "boolean" ? (
                      <input
                        name={field.name}
                        type="checkbox"
                        defaultChecked={Boolean(selected[field.name])}
                        className="ml-3 h-4 w-4 align-middle"
                      />
                    ) : (
                      <input
                        name={field.name}
                        type={
                          field.type === "number"
                            ? "number"
                            : field.type === "date"
                              ? "datetime-local"
                              : "text"
                        }
                        defaultValue={String(selected[field.name] ?? "")}
                        required={field.required}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"
                      />
                    )}
                  </div>
                ))}
                </div>
                <div className="flex justify-end gap-3 border-t px-6 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        isDirty &&
                        !window.confirm("Discard unsaved changes?")
                      )
                        return;
                      setSelected(null);
                      setIsDirty(false);
                    }}
                    className="cursor-pointer rounded-lg border px-4 py-2 text-sm hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={saving}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving && <Loader2 className="size-4 animate-spin" />}
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </>
            )}
            {/* audit history is read-only */}
          </form>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </main>
  );
}
