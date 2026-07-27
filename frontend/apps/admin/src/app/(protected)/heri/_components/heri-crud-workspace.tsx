"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePermissions } from "@/hooks/use-permissions";

type RecordValue = string | number | boolean | null | undefined | Record<string, unknown>;
type HeriRecord = { id: string; [key: string]: RecordValue };
type AuditEntry = { id: string; action: string; actor_id?: string | null; previous_value?: Record<string, unknown> | null; new_value?: Record<string, unknown> | null; created_at?: string };
type Field = { name: string; label: string; type?: "text" | "textarea" | "select" | "boolean" | "number" | "date"; required?: boolean; options?: string[] };
type Config = { resource: string; title: string; description: string; fields: Field[]; permission?: string; workflow?: boolean };

const API = process.env.NEXT_PUBLIC_HERI_API_URL ?? "http://localhost:8003/api/v1/heri";
const statuses = ["draft", "in_review", "approved", "scheduled", "published", "archived"];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
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

export function HeriCrudWorkspace({ config }: { config: Config }) {
  const { hasPermission, isAdmin } = usePermissions();
  const canWrite = isAdmin || hasPermission(config.permission ?? "heri.content.write");
  const canDelete = isAdmin || hasPermission("heri.content.write");
  const [records, setRecords] = useState<HeriRecord[]>([]);
  const [selected, setSelected] = useState<HeriRecord | null>(null);
  const [history, setHistory] = useState<AuditEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 8;

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRecords(await request<HeriRecord[]>(`/admin/${config.resource}`)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to load records"); }
    finally { setLoading(false); }
  }, [config.resource]);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => records.filter((record) => {
    const haystack = Object.values(record).map(display).join(" ").toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (status === "all" || String(record.status ?? "") === status);
  }), [records, query, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const columns = config.fields.slice(0, 4);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (!selected || !canWrite) return;
    setSaving(true); setError(null);
    const form = new FormData(event.currentTarget); const payload: Record<string, unknown> = {};
    config.fields.forEach((field) => { const value = form.get(field.name); if (field.type === "boolean") payload[field.name] = value === "on"; else if (value !== null && value !== "") payload[field.name] = field.type === "number" ? Number(value) : value; });
    try { await request(`/admin/${config.resource}${selected.id ? `/${selected.id}` : ""}`, { method: selected.id ? "PATCH" : "POST", body: JSON.stringify(payload) }); setSelected(null); await load(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to save record"); }
    finally { setSaving(false); }
  };
  const remove = async (record: HeriRecord) => { if (!canDelete || !window.confirm(`Delete ${display(record.title ?? record.name ?? record.slug)}?`)) return; try { await request(`/admin/${config.resource}/${record.id}`, { method: "DELETE" }); await load(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to delete record"); } };
  const transition = async (record: HeriRecord, next: string) => { try { await request(`/admin/${config.resource}/${record.id}/transition`, { method: "POST", body: JSON.stringify({ status: next, note: "Updated from HERI admin workspace" }) }); await load(); } catch { await request(`/admin/${config.resource}/${record.id}`, { method: "PATCH", body: JSON.stringify({ status: next }) }); await load(); } };
  const showHistory = async (record: HeriRecord) => { setSelected(record); setHistory(await request<AuditEntry[]>(`/admin/${config.resource}/${record.id}/audit`).catch(() => [])); };

  return <main className="space-y-6 p-6 md:p-10">
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">HERI Africa administration</p><h1 className="mt-2 text-3xl font-semibold text-slate-900">{config.title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{config.description}</p></div>{canWrite && <button onClick={() => setSelected({ id: "", ...Object.fromEntries(config.fields.map((field) => [field.name, field.type === "boolean" ? false : ""])) })} className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">Create record</button>}</header>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 md:flex-row"><input aria-label="Filter records" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search records…" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm" />{config.fields.some((field) => field.name === "status") && <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option value="all">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}</select>}<button onClick={() => void load()} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium">Refresh</button></div></section>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{columns.map((field) => <th className="px-4 py-3" key={field.name}>{field.label}</th>)}<th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">Loading records…</td></tr> : visible.length === 0 ? <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-500">No records match this filter.</td></tr> : visible.map((record) => <tr key={record.id} className="hover:bg-slate-50">{columns.map((field) => <td className="max-w-xs px-4 py-3 text-slate-700" key={field.name}>{display(record[field.name])}</td>)}<td className="whitespace-nowrap px-4 py-3"><div className="flex flex-wrap gap-2"><button onClick={() => setSelected(record)} className="font-semibold text-emerald-700" disabled={!canWrite}>Edit</button><button onClick={() => void showHistory(record)} className="font-semibold text-slate-600">History</button>{config.workflow && record.status && canWrite && <select aria-label={`Workflow status for ${display(record.title ?? record.name)}`} value={String(record.status)} onChange={(event) => void transition(record, event.target.value)} className="rounded border border-slate-300 px-1 py-0.5 text-xs">{statuses.map((item) => <option key={item}>{item}</option>)}</select>}<button onClick={() => void remove(record)} className="font-semibold text-red-600" disabled={!canDelete}>Delete</button></div></td></tr>)}</tbody></table></div><div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm text-slate-600"><span>{filtered.length} records · page {page} of {pages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded border px-3 py-1 disabled:opacity-40">Previous</button><button disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="rounded border px-3 py-1 disabled:opacity-40">Next</button></div></div></section>
    {selected && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 p-4 md:p-10"><form onSubmit={save} className="w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold text-slate-900">{selected.id ? "Edit record" : "Create record"}</h2><p className="mt-1 text-sm text-slate-500">Changes are audited and remain subject to your assigned HERI permissions.</p></div><button type="button" onClick={() => { setSelected(null); setHistory(null); }} className="text-2xl leading-none text-slate-400" aria-label="Close">×</button></div>{history ? <div className="space-y-3"><h3 className="font-semibold text-slate-900">Revision history</h3>{history.length === 0 ? <p className="text-sm text-slate-500">No audit entries found.</p> : history.map((entry) => <article className="rounded-lg border border-slate-200 p-3 text-sm" key={entry.id}><div className="flex justify-between font-medium"><span>{entry.action}</span><time className="text-slate-500">{entry.created_at ? new Date(entry.created_at).toLocaleString() : ""}</time></div><pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-xs text-slate-600">{JSON.stringify(entry.new_value ?? {}, null, 2)}</pre></article>)}<button type="button" onClick={() => setHistory(null)} className="rounded-lg border px-4 py-2 text-sm">Back to editor</button></div> : <>{config.fields.map((field) => <label className="block text-sm font-medium text-slate-700" key={field.name}>{field.label}{field.required && <span className="text-red-600"> *</span>}{field.type === "textarea" ? <textarea name={field.name} defaultValue={display(selected[field.name]) === "—" ? "" : String(selected[field.name] ?? "")} required={field.required} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /> : field.type === "select" ? <select name={field.name} defaultValue={String(selected[field.name] ?? "")} required={field.required} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"><option value="">Select…</option>{(field.options ?? []).map((option) => <option key={option}>{option}</option>)}</select> : field.type === "boolean" ? <input name={field.name} type="checkbox" defaultChecked={Boolean(selected[field.name])} className="ml-3 h-4 w-4 align-middle" /> : <input name={field.name} type={field.type === "number" ? "number" : field.type === "date" ? "datetime-local" : "text"} defaultValue={String(selected[field.name] ?? "")} required={field.required} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />}</label>)}<div className="flex justify-end gap-3"><button type="button" onClick={() => setSelected(null)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button><button disabled={saving} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button></div></>}{/* audit history is read-only */}</form></div>}
  </main>;
}
