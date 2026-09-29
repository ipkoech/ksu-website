"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Button } from "@ksu/ui/button";
import { Input } from "@ksu/ui/input";
import { WorkspaceLoading } from "@ksu/ui/components/workspace-feedback";
import { researchWorkspaceApi } from "@ksu/api-client/research";
import type { RWModule } from "@ksu/api-client/research";
import { useResearchWorkspace } from "./admin-shell";
import { useWorkspaceRead } from "./use-workspace";
import { Problem } from "./problem";

export function ReferencePicker({ resource, disabled, onSelect }: { resource: string; disabled?: boolean; onSelect: (id: string) => void }) {
  const { modules } = useResearchWorkspace(), module = modules.find(item => item.key === resource);
  const [open, setOpen] = useState(false);
  if (!module) return <p className="rw-help">The linked directory is not assigned to you. The service still validates manually entered IDs.</p>;
  return <><Button type="button" variant="outline" disabled={disabled} onClick={() => setOpen(true)}>Find in {module.label.toLowerCase()}</Button>
    {open && <PickerDialog module={module} onClose={() => setOpen(false)} onSelect={id => { onSelect(id); setOpen(false); }} />}</>;
}
function PickerDialog({ module, onClose, onSelect }: { module: RWModule; onClose: () => void; onSelect: (id: string) => void }) {
  const dialog = useRef<HTMLDialogElement>(null), titleId = useId(), searchId = useId();
  const [input, setInput] = useState(""), [search, setSearch] = useState(""), [page, setPage] = useState(1);
  const load = useCallback((signal: AbortSignal) => researchWorkspaceApi.list(module.key, { search: search || undefined, page, per_page: 10 }, signal), [module.key, search, page]);
  const { state, reload } = useWorkspaceRead(load);
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  const apply = () => { setSearch(input.trim()); setPage(1); };
  return <dialog ref={dialog} className="rw-dialog" aria-labelledby={titleId} onCancel={onClose}>
    <h2 id={titleId}>Choose from {module.label.toLowerCase()}</h2><p>Only records in your signed scope are listed. Selection does not save the parent record.</p>
    <label htmlFor={searchId}>Search records</label><div className="rw-array-row"><Input id={searchId} value={input} maxLength={255} onChange={event => setInput(event.target.value)}
      onKeyDown={event => { if (event.key === "Enter") { event.preventDefault(); event.stopPropagation(); apply(); } }} />
      <Button type="button" onClick={apply}>Search</Button></div>
    {state.status === "loading" ? <WorkspaceLoading label="Searching assigned records…" /> : state.status === "error" ? <Problem problem={state.error} onRetry={reload} /> : <>
      <div className="rw-picker-results">{state.data.data.map(row => <Button key={row.id} type="button" variant="outline" className="rw-picker-option" onClick={() => onSelect(row.id)}>
        <span>{row.title}<small>{row.id}</small></span></Button>)}{!state.data.data.length && <p>No matching records. Try a different search.</p>}</div>
      <div className="rw-pagination"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button>
        <span>Page {page} · {state.data.meta.total} records</span><Button type="button" variant="outline" disabled={page >= state.data.meta.total_pages} onClick={() => setPage(value => value + 1)}>Next</Button></div>
    </>}
    <div className="rw-dialog-actions"><Button type="button" variant="outline" onClick={onClose}>Close directory</Button></div>
  </dialog>;
}
