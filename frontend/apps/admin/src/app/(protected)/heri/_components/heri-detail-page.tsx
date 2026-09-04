"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, History, Loader2, Save } from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  RichTextEditor,
  RichTextRenderer,
} from "@ksu/ui/components";
import {
  useHeriRecordQuery,
  useHeriResourceMutation,
  heriRequest,
} from "@/lib/api/heri";
import { HeriMediaPicker } from "./heri-media-picker";

const workflowStatuses = [
  "draft",
  "in_review",
  "approved",
  "scheduled",
  "published",
  "archived",
];
const hiddenFields = new Set([
  "id",
  "created_at",
  "updated_at",
  "deleted_at",
  "file_hash",
  "storage_path",
]);
const richFields = new Set([
  "body",
  "biography",
  "description",
  "summary",
  "abstract",
  "citation",
  "internal_notes",
]);

function labelFor(field: string) {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function isMediaField(field: string) {
  return (
    field.endsWith("_url") ||
    ["photo_url", "logo_url", "featured_image_url"].includes(field)
  );
}
function isRichField(field: string, value: unknown) {
  return (
    richFields.has(field) || (typeof value === "string" && value.length > 140)
  );
}
function printable(value: unknown) {
  return value && typeof value === "object"
    ? JSON.stringify(value, null, 2)
    : String(value ?? "");
}

function isRichValue(field: string, value: unknown) {
  return richFields.has(field) || (typeof value === "string" && /<(p|h[1-6]|ul|ol|li|strong|em|a)\b/i.test(value));
}

type AuditEntry = {
  id: string;
  action: string;
  created_at?: string;
  new_value?: Record<string, unknown>;
  previous_value?: Record<string, unknown>;
};

export function HeriDetailPage() {
  const params = useParams<{ resource: string; id: string }>();
  const resource = params.resource;
  const id = params.id;
  const recordQuery = useHeriRecordQuery(resource, id);
  const mutation = useHeriResourceMutation(resource);
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [history, setHistory] = useState<AuditEntry[] | null>(null);
  const record = recordQuery.data;
  const fields = useMemo(
    () =>
      record ? Object.keys(record).filter((key) => !hiddenFields.has(key)) : [],
    [record],
  );
  const title = String(
    record?.title ?? record?.name ?? record?.slug ?? record?.file_name ?? id,
  );

  const beginEdit = () => {
    if (!record) return;
    setValues(
      Object.fromEntries(fields.map((field) => [field, record[field]])),
    );
    setEditing(true);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await mutation.mutateAsync({ id, payload: values });
      setEditing(false);
      toast.success("Record updated");
      await recordQuery.refetch();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Unable to update record",
      );
    }
  };
  const loadHistory = async () =>
    setHistory(
      await heriRequest<AuditEntry[]>(`/admin/${resource}/${id}/audit`).catch(
        () => [],
      ),
    );
  const updateStatus = async (status: string) => {
    try {
      await heriRequest(`/admin/${resource}/${id}/transition`, {
        method: "POST",
        body: JSON.stringify({ status, note: "Updated from HERI record detail" }),
      });
      toast.success("Workflow status updated");
      await recordQuery.refetch();
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Unable to update workflow status");
    }
  };
  const restore = async (entry: AuditEntry, direction: "previous" | "new") => {
    if (!window.confirm(`Restore the ${direction} state from this revision?`))
      return;
    try {
      await heriRequest(`/admin/${resource}/${id}/restore`, {
        method: "POST",
        body: JSON.stringify({ audit_id: entry.id, direction }),
      });
      toast.success("Revision restored");
      await recordQuery.refetch();
      await loadHistory();
    } catch (reason) {
      toast.error(
        reason instanceof Error ? reason.message : "Unable to restore revision",
      );
    }
  };

  if (recordQuery.isPending)
    return (
      <main className="p-4 md:p-6">
        <Loader2 className="size-5 animate-spin" />
        Loading record…
      </main>
    );
  if (recordQuery.error || !record)
    return (
      <main className="space-y-4 p-4 md:p-6">
        <h1 className="text-2xl font-semibold">Record unavailable</h1>
        <p className="text-sm text-red-700">
          {recordQuery.error instanceof Error
            ? recordQuery.error.message
            : "The requested record could not be found."}
        </p>
        <Link
          href={`/heri/${resource}`}
          className="inline-flex items-center gap-2 font-semibold text-emerald-700"
        >
          <ArrowLeft className="size-4" />
          Back to {labelFor(resource)}
        </Link>
      </main>
    );

  return (
    <main className="space-y-5 p-4 md:p-6">
      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <Link
            href={`/heri/${resource}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"
          >
            <ArrowLeft className="size-4" />
            Back to {labelFor(resource)}
          </Link>
          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            HERI Africa record
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {labelFor(resource)} · {id}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void loadHistory()}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold"
          >
            <History className="size-4" />
            History
          </button>
          <button
            onClick={beginEdit}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Edit record
          </button>
        </div>
      </header>
      {record.status && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
          <span className="text-sm font-medium">Workflow status</span>
          <select
            value={record.status}
            onChange={(event) => void updateStatus(event.target.value)}
            className="rounded-lg border bg-white px-3 py-2 text-sm"
          >
            {workflowStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
      )}
      <section className="grid gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <article
            className="rounded-2xl border bg-white p-5 shadow-sm"
            key={field}
          >
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {labelFor(field)}
            </h2>
            <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-6">
              {isMediaField(field) && typeof record[field] === "string" && record[field] ? (
                <div className="space-y-3">
                  {String(record[field]).match(/\.(avif|gif|jpe?g|png|webp)(\?.*)?$/i) ? (
                    <img src={String(record[field])} alt={labelFor(field)} className="max-h-56 w-full rounded-xl border object-cover" />
                  ) : null}
                  <a href={String(record[field])} target="_blank" rel="noreferrer" className="break-all font-medium text-emerald-700 hover:underline">
                    {String(record[field])}
                  </a>
                </div>
              ) : isRichValue(field, record[field]) ? (
                <RichTextRenderer content={String(record[field] ?? "")} className="prose-sm max-w-none" emptyFallback={<span className="text-slate-400">—</span>} />
              ) : record[field] === true
                ? "Yes"
                : record[field] === false
                  ? "No"
                  : printable(record[field]) || "—"}
            </div>
          </article>
        ))}
      </section>
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
          <form
            onSubmit={save}
            className="space-y-5"
          >
            <DialogHeader>
              <DialogTitle>Edit {title}</DialogTitle>
              <DialogDescription>Save changes to create an audited revision.</DialogDescription>
            </DialogHeader>
            {fields.map((field) => (
              <label
                className="block text-sm font-medium text-slate-700"
                key={field}
              >
                {labelFor(field)}
                {isMediaField(field) ? (
                  <HeriMediaPicker
                    value={String(values[field] ?? "")}
                    onChange={(value) =>
                      setValues((current) => ({ ...current, [field]: value }))
                    }
                  />
                ) : isRichField(field, values[field]) ? (
                  <RichTextEditor
                    value={String(values[field] ?? "")}
                    onChange={(value) =>
                      setValues((current) => ({ ...current, [field]: value }))
                    }
                    minHeight="14rem"
                    placeholder={`Write ${labelFor(field).toLowerCase()}…`}
                  />
                ) : typeof values[field] === "boolean" ? (
                  <input
                    type="checkbox"
                    checked={Boolean(values[field])}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field]: event.target.checked,
                      }))
                    }
                    className="ml-3 h-4 w-4 align-middle"
                  />
                ) : (
                  <input
                    type={typeof values[field] === "number" ? "number" : "text"}
                    value={String(values[field] ?? "")}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [field]:
                          typeof values[field] === "number"
                            ? Number(event.target.value)
                            : event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border px-3 py-2 font-normal"
                  />
                )}
              </label>
            ))}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={mutation.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Save className="size-4" />
                {mutation.isPending ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(history)} onOpenChange={(open) => !open && setHistory(null)}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Audited changes</p><h2 className="mt-1 text-xl font-semibold">Revision history</h2><p className="mt-1 text-sm text-slate-500">Review changes and restore a previous record state.</p></div>
              <button
                onClick={() => setHistory(null)}
                className="text-2xl text-slate-400"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            {history?.length ? (
              history.map((entry) => (
                <article
                  className="rounded-lg border p-3 text-sm"
                  key={entry.id}
                >
                  <div className="flex justify-between font-semibold">
                    <span>{entry.action}</span>
                    <time className="text-slate-500">
                      {entry.created_at
                        ? new Date(entry.created_at).toLocaleString()
                        : ""}
                    </time>
                  </div>
                  <pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-xs text-slate-600">
                    {JSON.stringify(entry.new_value ?? {}, null, 2)}
                  </pre>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.previous_value &&
                    Object.keys(entry.previous_value).length > 0 ? (
                      <button
                        onClick={() => void restore(entry, "previous")}
                        className="rounded border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50"
                      >
                        Restore previous
                      </button>
                    ) : null}
                    {entry.new_value &&
                    Object.keys(entry.new_value).length > 0 ? (
                      <button
                        onClick={() => void restore(entry, "new")}
                        className="rounded border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                      >
                        Restore this state
                      </button>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-slate-500">No revisions found.</p>
            )}
          </section>
        </DialogContent>
      </Dialog>
    </main>
  );
}
