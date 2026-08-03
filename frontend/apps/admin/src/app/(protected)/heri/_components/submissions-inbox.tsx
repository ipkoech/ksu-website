"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Mail, MessageSquare, Save, XCircle } from "lucide-react";
import { toast } from "@ksu/ui";
import { usePermissions } from "@/hooks/use-permissions";
import {
  heriRequest,
  useHeriResourceMutation,
  useHeriResourceQuery,
  type HeriRecord,
} from "@/lib/api/heri";

type Submission = HeriRecord & {
  kind?: string;
  name?: string;
  email?: string;
  organisation?: string;
  country?: string;
  message?: string;
  payload?: Record<string, unknown>;
  status?: string;
  internal_notes?: string;
};
const statuses = [
  "new",
  "reviewing",
  "assigned",
  "in_progress",
  "responded",
  "approved",
  "rejected",
  "closed",
  "spam",
];

export function SubmissionsInbox() {
  const { hasPermission, isAdmin } = usePermissions();
  const canWrite = isAdmin || hasPermission("heri.submissions.write");
  const [status, setStatus] = useState("all");
  const [kind, setKind] = useState("all");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [notes, setNotes] = useState("");
  const query = useHeriResourceQuery<Submission>("submissions", {
    page: 1,
    per_page: 100,
    status: status === "all" ? undefined : status,
  });
  const mutation = useHeriResourceMutation("submissions");
  const records = useMemo(
    () =>
      (query.data?.data ?? []).filter(
        (item) => kind === "all" || item.kind === kind,
      ),
    [query.data, kind],
  );
  const kinds = useMemo(
    () =>
      [
        ...new Set(
          (query.data?.data ?? []).map((item) =>
            String(item.kind ?? "general"),
          ),
        ),
      ].sort(),
    [query.data],
  );
  const open = (record: Submission) => {
    setSelected(record);
    setNotes(String(record.internal_notes ?? ""));
  };
  const update = async (values: Record<string, unknown>) => {
    if (!selected || !canWrite) return;
    try {
      await mutation.mutateAsync({ id: selected.id, payload: values });
      setSelected({ ...selected, ...values });
      await query.refetch();
      toast.success("Submission updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update submission",
      );
    }
  };
  return (
    <main className="space-y-6 p-6 md:p-10">
      <header>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          HERI Africa administration
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">
          Submissions inbox
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Review contact, partnership, event, network, and newsletter enquiries
          in one auditable workflow.
        </p>
      </header>
      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Visible submissions" value={records.length} />
        <Stat
          label="New"
          value={records.filter((item) => item.status === "new").length}
        />
        <Stat
          label="In progress"
          value={
            records.filter((item) =>
              ["reviewing", "assigned", "in_progress"].includes(
                String(item.status),
              ),
            ).length
          }
        />
      </section>
      <section className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <select
          aria-label="Filter submissions by status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {statuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select
          aria-label="Filter submissions by type"
          value={kind}
          onChange={(event) => setKind(event.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">All types</option>
          {kinds.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
      </section>
      <section className="space-y-3">
        {records.map((record) => (
          <button
            type="button"
            key={record.id}
            onClick={() => open(record)}
            className="flex w-full items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-emerald-300"
          >
            <div className="mt-1 rounded-full bg-emerald-50 p-2 text-emerald-700">
              <MessageSquare className="size-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">
                  {String(record.kind ?? "general")}
                </span>
                <span className="text-xs text-slate-400">
                  {String(record.status ?? "new")}
                </span>
              </div>
              <h2 className="mt-1 font-semibold text-slate-900">
                {record.name || "Anonymous"}
              </h2>
              <p className="truncate text-sm text-slate-600">
                {record.email} · {record.organisation || "No organisation"}
              </p>
              <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                {record.message || "No message provided"}
              </p>
            </div>
            <span className="text-xs text-slate-400">Open →</span>
          </button>
        ))}
        {!query.isLoading && records.length === 0 && (
          <p className="rounded-xl border bg-white p-6 text-sm text-slate-500">
            No submissions match these filters.
          </p>
        )}
      </section>
      {selected && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 md:p-10">
          <div className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                  {String(selected.kind ?? "general")}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  {selected.name}
                </h2>
                <a
                  href={`mailto:${selected.email}`}
                  className="mt-1 inline-flex items-center gap-2 text-sm text-emerald-700"
                >
                  <Mail className="size-4" />
                  {selected.email}
                </a>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-2xl text-slate-400"
              >
                ×
              </button>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_.8fr]">
              <div className="space-y-5">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Message
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {selected.message || "No message provided"}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Submitted details
                  </p>
                  <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap text-xs text-slate-600">
                    {JSON.stringify(
                      selected.payload ?? {
                        organisation: selected.organisation,
                        country: selected.country,
                      },
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-700">
                  Workflow status
                  <select
                    disabled={!canWrite}
                    value={String(selected.status ?? "new")}
                    onChange={(event) =>
                      void update({ status: event.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="new">New</option>
                    {statuses
                      .filter((item) => item !== "new")
                      .map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Internal notes
                  <textarea
                    disabled={!canWrite}
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    rows={6}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </label>
                {canWrite && (
                  <button
                    type="button"
                    onClick={() => void update({ internal_notes: notes })}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white"
                  >
                    <Save className="size-4" />
                    Save notes
                  </button>
                )}
                <div className="flex gap-2 border-t pt-4">
                  {canWrite && (
                    <>
                      <button
                        type="button"
                        onClick={() => void update({ status: "responded" })}
                        className="inline-flex items-center gap-2 rounded-lg border border-emerald-300 px-3 py-2 text-xs font-semibold text-emerald-800"
                      >
                        <CheckCircle2 className="size-4" />
                        Mark responded
                      </button>
                      <button
                        type="button"
                        onClick={() => void update({ status: "rejected" })}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-300 px-3 py-2 text-xs font-semibold text-red-700"
                      >
                        <XCircle className="size-4" />
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
