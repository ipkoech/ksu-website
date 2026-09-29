"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, Download, Filter, Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@ksu/ui/button";
import { Input } from "@ksu/ui/input";
import { WorkspaceFeedback, WorkspaceLoading, WorkspaceStatus } from "@ksu/ui/components/workspace-feedback";
import { researchWorkspaceApi, rwDisplay, rwListFilters, rwListQuery, rwPageCsv } from "@ksu/api-client/research";
import type { RWFilters, RWModule, RWRow, RWState } from "@ksu/api-client/research";
import { useResearchWorkspace } from "./admin-shell";
import { useWorkspaceRead } from "./use-workspace";
import { Problem } from "./problem";
import { ExportMatches } from "./export-matches";
import { BulkEditorial } from "./bulk-editorial";

export function ResourceList({ resource, review = false }: { resource: string; review?: boolean }) {
  const { modules } = useResearchWorkspace(), module = modules.find(item => item.key === resource);
  if (!module) return <WorkspaceFeedback title="Working area not assigned">This record area is not available to your current assignment.</WorkspaceFeedback>;
  return <Suspense fallback={<WorkspaceLoading label="Loading filters…" />}><ResourceTable key={`${module.key}:${review}`} module={module} review={review} /></Suspense>;
}
function ResourceTable({ module, review }: { module: RWModule; review: boolean }) {
  const params = useSearchParams(), router = useRouter(), pathname = usePathname();
  const query = params.toString();
  const filters = useMemo(() => rwListFilters(new URLSearchParams(query), review), [query, review]);
  const [exportError, setExportError] = useState("");
  const { context } = useResearchWorkspace();
  const [selected, setSelected] = useState<string[]>([]), [batch, setBatch] = useState<RWRow[] | null>(null);
  useEffect(() => { setSelected([]); }, [query, module.key]);
  const load = useCallback((signal: AbortSignal) => researchWorkspaceApi.list(module.key, filters, signal), [module.key, filters]);
  const { state, reload } = useWorkspaceRead(load);
  const setFilters = (next: RWFilters) => router.replace(`${pathname}?${rwListQuery(next)}`, { scroll: false });
  const columns = module.columns?.length ? module.columns : module.fields.filter(field => field.kind !== "text" && field.kind !== "json" && field.key !== module.title_key).slice(0, 3).map(field => field.key);
  function exportPage() {
    if (state.status !== "ready") return;
    try {
      const blob = new Blob([rwPageCsv(module, state.data.data)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob), link = document.createElement("a");
      link.href = url; link.download = `${module.key}-page-${filters.page}.csv`;
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportError("");
    } catch { setExportError("The browser could not export this page. No additional records were requested."); }
  }
  return <div className="rw-stack">
    <div className="rw-page-heading"><div><p className="rw-eyebrow">{review ? "EDITORIAL REVIEW" : module.group ?? "RESEARCH RECORDS"}</p>
      <h1>{review ? `${module.label} awaiting review` : module.label}</h1><p>{module.description || "Search and manage the records in your assigned scope."}</p></div>
      <div className="rw-actions"><Button type="button" variant="outline" disabled={state.status === "loading"} onClick={reload}><RefreshCw aria-hidden="true" />Refresh</Button>
        {!review && module.can_create && <Button asChild><Link href={`/admin/${module.key}/new`}><Plus aria-hidden="true" />Create {module.singular}</Link></Button>}</div></div>
    <section className="rw-panel">
      <Filters key={`${module.key}:${query}`} module={module} filters={filters} review={review} onApply={setFilters} />
      {state.status === "loading" ? <div className="rw-inset"><WorkspaceLoading label="Loading scope-checked records…" /></div> : state.status === "error" ?
        <div className="rw-inset"><Problem problem={state.error} onRetry={reload} /></div> : <>
        <div className="rw-table-caption"><div><strong>{state.data.meta.total.toLocaleString()} matching records</strong><p className="rw-help">Page {state.data.meta.page} of {Math.max(1, state.data.meta.total_pages)} · constrained by your assignment</p></div>
          <div className="rw-actions">{context.capabilities["research.manage_reports"] && <ExportMatches module={module} filters={filters} />}<Button type="button" variant="outline" disabled={!state.data.data.length} onClick={exportPage}><Download aria-hidden="true" />Export this page</Button></div></div>
        {module.workflow && state.data.data.length > 0 && <div className="rw-selection-bar"><Button type="button" variant="ghost" onClick={() => setSelected(state.data.data.slice(0, 50).map(row => row.id))}>Select up to 50 on this page</Button><span role="status">{selected.length} selected</span><Button type="button" variant="ghost" disabled={!selected.length} onClick={() => setSelected([])}>Clear selection</Button><Button type="button" disabled={!selected.length} onClick={() => setBatch(state.data.data.filter(row => selected.includes(row.id)))}>Review selected actions</Button></div>}
        {exportError && <p role="alert" className="rw-field-error rw-inset">{exportError}</p>}
        {!state.data.data.length ? <div className="rw-inset"><WorkspaceFeedback title={filters.page && filters.page > 1 ? "This page has no records" : "No records match these filters"}>
          {state.data.meta.total > 0 ? "The collection changed or this page is beyond the current result set." : "No matching records were returned by the service. This is not a gateway error."}
          <p><Button type="button" variant="outline" onClick={() => setFilters({ page: 1, per_page: filters.per_page, ...(review ? { state: "pending" } : {}) })}>Clear filters and return to page 1</Button></p>
        </WorkspaceFeedback></div> : <div className="rw-table-scroll" role="region" aria-label={`${module.label} results`} tabIndex={0}><table className="rw-table">
          <caption className="sr-only">{module.label} in the current authorized result page</caption><thead><tr>{module.workflow && <th scope="col"><span className="sr-only">Select record</span></th>}<th scope="col">Record</th>
            {module.workflow && <th scope="col">Editorial state</th>}{columns.map(key => <th key={key} scope="col">{module.fields.find(field => field.key === key)?.label ?? key.replace(/_/g, " ")}</th>)}<th scope="col"><span className="sr-only">Open record</span></th></tr></thead>
          <tbody>{state.data.data.map(row => <tr key={row.id}>{module.workflow && <td><input className="rw-row-checkbox" type="checkbox" aria-label={`Select ${row.title}`} checked={selected.includes(row.id)} disabled={!selected.includes(row.id) && selected.length >= 50} onChange={event => setSelected(current => event.target.checked ? [...current, row.id] : current.filter(id => id !== row.id))} /></td>}<td><Link href={`/admin/${module.key}/${row.id}`} className="rw-record-title">{row.title}</Link><small>{row.record.slug ? String(row.record.slug) : row.id}</small></td>
            {module.workflow && <td><WorkspaceStatus value={row.workflow_state} /></td>}{columns.map(key => <td key={key}>{key === "status" ? <WorkspaceStatus value={typeof row.record[key] === "string" ? String(row.record[key]) : null} /> : rwDisplay(row.record[key])}</td>)}
            <td><Button asChild variant="ghost"><Link href={`/admin/${module.key}/${row.id}`} aria-label={`Open ${row.title}`}><ArrowRight aria-hidden="true" /></Link></Button></td></tr>)}</tbody></table></div>}
        <div className="rw-pagination"><label className="rw-page-size">Records per page<select value={filters.per_page} onChange={event => setFilters({ ...filters, page: 1, per_page: Number(event.target.value) })}>{[10, 20, 50, 100].map(size => <option key={size} value={size}>{size}</option>)}</select></label>
          <div><Button type="button" variant="outline" disabled={state.data.meta.page <= 1} onClick={() => setFilters({ ...filters, page: state.data.meta.page - 1 })}>Previous</Button>
            <span>Page {state.data.meta.page}</span><Button type="button" variant="outline" disabled={state.data.meta.page >= state.data.meta.total_pages} onClick={() => setFilters({ ...filters, page: state.data.meta.page + 1 })}>Next</Button></div></div>
      </>}
    </section><p className="rw-help">Page exports contain displayed records only. Authorized matching-record exports apply all current filters. Editorial commands recheck each record’s state and scope on the server.</p>
    {batch && <BulkEditorial module={module} rows={batch} onClose={() => { setBatch(null); setSelected([]); reload(); }} />}
  </div>;
}
function Filters({ module, filters, review, onApply }: { module: RWModule; filters: RWFilters; review: boolean; onApply: (filters: RWFilters) => void }) {
  const [search, setSearch] = useState(filters.search ?? ""), [state, setState] = useState(filters.state ?? ""), [status, setStatus] = useState(filters.status ?? "");
  const [field, setField] = useState(filters.filter_field ?? ""), [value, setValue] = useState(filters.filter_value ?? "");
  const [order, setOrder] = useState(filters.order ?? "desc");
  function apply(event: FormEvent) { event.preventDefault(); onApply({ page: 1, per_page: filters.per_page, search: search.trim() || undefined,
    state: review ? "pending" : state ? state as RWState : undefined, status: status.trim() || undefined, order,
    ...(field && value.trim() ? { filter_field: field, filter_value: value.trim() } : {}) }); }
  return <form className="rw-filters" onSubmit={apply}><label className="rw-search"><span className="rw-field-label">Search {module.label.toLowerCase()}</span><span><Search size={17} aria-hidden="true" /><Input value={search} maxLength={255} onChange={event => setSearch(event.target.value)} placeholder="Search native record fields" /></span></label>
    {module.workflow && !review && <label><span className="rw-field-label">Editorial state</span><select value={state} onChange={event => setState(event.target.value as RWState | "")}><option value="">All states</option>{["draft", "pending", "published", "rejected"].map(value => <option key={value}>{value}</option>)}</select></label>}
    {!module.workflow && module.fields.some(item => item.key === "status") && <label><span className="rw-field-label">Native status</span><Input value={status} maxLength={32} onChange={event => setStatus(event.target.value)} placeholder="All statuses" /></label>}
    {!!module.filter_fields?.length && <><label><span className="rw-field-label">Filter field</span><select value={field} onChange={event => { setField(event.target.value); setValue(""); }}><option value="">No extra filter</option>{module.filter_fields.map(key => <option key={key} value={key}>{module.fields.find(item => item.key === key)?.label ?? key}</option>)}</select></label>
      {field && <label><span className="rw-field-label">Exact filter value</span><Input value={value} maxLength={255} onChange={event => setValue(event.target.value)} required /></label>}</>}
    <label><span className="rw-field-label">Last updated</span><select value={order} onChange={event => setOrder(event.target.value as "asc" | "desc")}><option value="desc">Newest first</option><option value="asc">Oldest first</option></select></label>
    <Button type="submit"><Filter aria-hidden="true" />Apply filters</Button><Button type="button" variant="ghost" onClick={() => onApply({ page: 1, per_page: 20, ...(review ? { state: "pending" } : {}) })}>Reset</Button>
  </form>;
}
