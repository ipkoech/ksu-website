"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePermissions } from "@/hooks/use-permissions";
import { getStoredAccessToken } from "@ksu/auth";
import { History, Loader2, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "@ksu/ui";

type RecordValue = string | number | boolean | null | undefined | Record<string, unknown>;
type HeriRecord = { id: string; [key: string]: RecordValue };
type AuditEntry = { id: string; action: string; actor_id?: string | null; previous_value?: Record<string, unknown> | null; new_value?: Record<string, unknown> | null; created_at?: string };
type Field = { name: string; label: string; type?: "text" | "textarea" | "select" | "boolean" | "number" | "date"; required?: boolean; options?: string[] };
type Config = { resource: string; title: string; description: string; fields: Field[]; permission?: string; workflow?: boolean };

const API = process.env.NEXT_PUBLIC_HERI_API_URL ?? "http://localhost:8003/api/v1/heri";
const statuses = ["draft", "in_review", "approved", "scheduled", "published", "archived"];

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredAccessToken();
  const response = await fetch(`${API}${path}`, { ...init, credentials: "include", headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(init?.headers ?? {}) } });
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 8;

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setRecords(await request<HeriRecord[]>(`/admin/${config.resource}`)); setSelectedIds(new Set()); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Unable to load records"; setError(message); toast.error(message); }
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
    try { config.fields.forEach((field) => { const value = form.get(field.name); if (field.type === "boolean") payload[field.name] = value === "on"; else if (value !== null && value !== "") payload[field.name] = ["contact", "social_links", "seo_defaults", "payload"].includes(field.name) ? JSON.parse(String(value)) : field.type === "number" ? Number(value) : value; }); }
    catch { setError("JSON fields must contain valid JSON."); setSaving(false); return; }
    try { await request(`/admin/${config.resource}${selected.id ? `/${selected.id}` : ""}`, { method: selected.id ? "PATCH" : "POST", body: JSON.stringify(payload) }); setSelected(null); toast.success(selected.id ? "Record updated" : "Record created"); await load(); }
    catch (reason) { const message = reason instanceof Error ? reason.message : "Unable to save record"; setError(message); toast.error(message); }
    finally { setSaving(false); }
  };
  const remove = async (record: HeriRecord) => { if (!canDelete || !window.confirm(`Delete ${display(record.title ?? record.name ?? record.slug)}?`)) return; try { await request(`/admin/${config.resource}/${record.id}`, { method: "DELETE" }); toast.success("Record deleted"); await load(); } catch (reason) { const message = reason instanceof Error ? reason.message : "Unable to delete record"; setError(message); toast.error(message); } };
  const removeSelected = async () => { if (!canDelete || selectedIds.size === 0 || !window.confirm(`Delete ${selectedIds.size} selected records?`)) return; try { await Promise.all(Array.from(selectedIds, (id) => request(`/admin/${config.resource}/${id}`, { method: "DELETE" }))); toast.success(`${selectedIds.size} record${selectedIds.size === 1 ? "" : "s"} deleted`); await load(); } catch (reason) { const message = reason instanceof Error ? reason.message : "Unable to delete selected records"; setError(message); toast.error(message); } };
  const toggleSelected = (id: string) => setSelectedIds((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const transition = async (record: HeriRecord, next: string) => { try { await request(`/admin/${config.resource}/${record.id}/transition`, { method: "POST", body: JSON.stringify({ status: next, note: "Updated from HERI admin workspace" }) }); await load(); } catch { await request(`/admin/${config.resource}/${record.id}`, { method: "PATCH", body: JSON.stringify({ status: next }) }); await load(); } };
  const showHistory = async (record: HeriRecord) => { setSelected(record); setHistory(await request<AuditEntry[]>(`/admin/${config.resource}/${record.id}/audit`).catch(() => [])); };

  return <main className="space-y-6 p-6 md:p-10">
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">HERI Africa administration</p><h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{config.title}</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{config.description}</p></div>{canWrite && <button onClick={() => setSelected({ id: "", ...Object.fromEntries(config.fields.map((field) => [field.name, field.type === "boolean" ? false : ""])) })} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"><Plus className="size-4" />Create record</button>}</header>
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex flex-col gap-3 md:flex-row"><label className="relative min-w-0 flex-1"><Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-slate-400" /><input aria-label="Filter records" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search records…" className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none transition-shadow focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" /></label>{config.fields.some((field) => field.name === "status") && <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"><option value="all">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}</select>}<button onClick={() => void load()} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"><RefreshCw className="size-4" />Refresh</button></div>{selectedIds.size > 0 && canDelete && <div className="mt-3 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"><span>{selectedIds.size} selected</span><button onClick={() => void removeSelected()} className="inline-flex cursor-pointer items-center gap-2 font-semibold hover:text-red-950"><Trash2 className="size-4" />Delete selected</button></div>}</section>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="w-12 px-4 py-3"><input type="checkbox" aria-label="Select all visible records" checked={visible.length > 0 && visible.every((record) => selectedIds.has(record.id))} onChange={(event) => setSelectedIds((current) => { const next = new Set(current); visible.forEach((record) => event.target.checked ? next.add(record.id) : next.delete(record.id)); return next; })} /></th>{columns.map((field) => <th className="px-4 py-3" key={field.name}>{field.label}</th>)}<th className="px-4 py-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={columns.length + 2} className="px-4 py-10 text-center text-slate-500"><span className="inline-flex items-center gap-2"><Loader2 className="size-4 animate-spin" />Loading records…</span></td></tr> : visible.length === 0 ? <tr><td colSpan={columns.length + 2} className="px-4 py-10 text-center text-slate-500">No records match this filter.</td></tr> : visible.map((record) => <tr key={record.id} className={`transition-colors hover:bg-emerald-50/40 ${selectedIds.has(record.id) ? "bg-emerald-50/60" : ""}`}><td className="px-4 py-3"><input type="checkbox" aria-label={`Select ${display(record.title ?? record.name ?? record.slug)}`} checked={selectedIds.has(record.id)} onChange={() => toggleSelected(record.id)} /></td>{columns.map((field) => <td className="max-w-xs px-4 py-3 text-slate-700" key={field.name}>{field.name === "status" ? <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${String(record[field.name]) === "published" ? "bg-emerald-100 text-emerald-800" : String(record[field.name]) === "draft" ? "bg-slate-100 text-slate-700" : "bg-amber-100 text-amber-800"}`}>{display(record[field.name]).replace("_", " ")}</span> : display(record[field.name])}</td>)}<td className="whitespace-nowrap px-4 py-3"><div className="flex flex-wrap items-center gap-3"><button onClick={() => setSelected(record)} className="inline-flex cursor-pointer items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900" disabled={!canWrite}><Pencil className="size-3.5" />Edit</button><button onClick={() => void showHistory(record)} className="inline-flex cursor-pointer items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"><History className="size-3.5" />History</button>{config.workflow && record.status && canWrite && <select aria-label={`Workflow status for ${display(record.title ?? record.name)}`} value={String(record.status)} onChange={(event) => void transition(record, event.target.value)} className="rounded border border-slate-300 px-1 py-0.5 text-xs">{statuses.map((item) => <option key={item}>{item}</option>)}</select>}<button onClick={() => void remove(record)} className="inline-flex cursor-pointer items-center gap-1 font-semibold text-red-600 hover:text-red-800" disabled={!canDelete}><Trash2 className="size-3.5" />Delete</button></div></td></tr>)}</tbody></table></div><div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between"><span>{filtered.length} records · page {page} of {pages}</span><div className="flex gap-2"><button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="cursor-pointer rounded border px-3 py-1 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button><button disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="cursor-pointer rounded border px-3 py-1 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button></div></div></section>
    {selected && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 p-4 md:p-10" role="presentation"><form onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="heri-editor-title" className="w-full max-w-2xl space-y-5 rounded-2xl bg-white p-6 shadow-xl"><div className="flex items-start justify-between"><div><h2 id="heri-editor-title" className="text-xl font-semibold text-slate-900">{selected.id ? "Edit record" : "Create record"}</h2><p className="mt-1 text-sm text-slate-500">Changes are audited and remain subject to your assigned HERI permissions.</p></div><button type="button" onClick={() => { setSelected(null); setHistory(null); }} className="cursor-pointer text-2xl leading-none text-slate-400 hover:text-slate-700" aria-label="Close">×</button></div>{history ? <div className="space-y-3"><h3 className="font-semibold text-slate-900">Revision history</h3>{history.length === 0 ? <p className="text-sm text-slate-500">No audit entries found.</p> : history.map((entry) => <article className="rounded-lg border border-slate-200 p-3 text-sm" key={entry.id}><div className="flex justify-between font-medium"><span>{entry.action}</span><time className="text-slate-500">{entry.created_at ? new Date(entry.created_at).toLocaleString() : ""}</time></div><pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-xs text-slate-600">{JSON.stringify(entry.new_value ?? {}, null, 2)}</pre></article>)}<button type="button" onClick={() => setHistory(null)} className="cursor-pointer rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">Back to editor</button></div> : <>{config.fields.map((field) => <label className="block text-sm font-medium text-slate-700" key={field.name}>{field.label}{field.required && <span className="text-red-600"> *</span>}{field.type === "textarea" ? <textarea name={field.name} defaultValue={display(selected[field.name]) === "—" ? "" : String(selected[field.name] ?? "")} required={field.required} rows={4} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" /> : field.type === "select" ? <select name={field.name} defaultValue={String(selected[field.name] ?? "")} required={field.required} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal"><option value="">Select…</option>{(field.options ?? []).map((option) => <option key={option}>{option}</option>)}</select> : field.type === "boolean" ? <input name={field.name} type="checkbox" defaultChecked={Boolean(selected[field.name])} className="ml-3 h-4 w-4 align-middle" /> : <input name={field.name} type={field.type === "number" ? "number" : field.type === "date" ? "datetime-local" : "text"} defaultValue={String(selected[field.name] ?? "")} required={field.required} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-normal" />}</label>)}<div className="flex justify-end gap-3"><button type="button" onClick={() => setSelected(null)} className="cursor-pointer rounded-lg border px-4 py-2 text-sm hover:bg-slate-50">Cancel</button><button disabled={saving} className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50">{saving && <Loader2 className="size-4 animate-spin" />}{saving ? "Saving…" : "Save changes"}</button></div></>}{/* audit history is read-only */}</form></div>}
  </main>;
}
