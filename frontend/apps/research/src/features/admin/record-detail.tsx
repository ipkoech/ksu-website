"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, History, Pencil, RefreshCw, Send, Undo2 } from "lucide-react";
import { Button } from "@ksu/ui/button";
import { WorkspaceFeedback, WorkspaceLoading, WorkspaceStatus } from "@ksu/ui/components/workspace-feedback";
import { researchWorkspaceApi, rwDisplay, rwMoney } from "@ksu/api-client/research";
import type { RWModule, RWRow, RWTransition } from "@ksu/api-client/research";
import { useResearchWorkspace } from "./admin-shell";
import { Problem } from "./problem";
import { RecordForm } from "./record-form";
import { RecordConnections } from "./record-connections";
import { RelatedRecords } from "./related-records";
import { RecordOperations } from "./record-operations";
import { useUnsavedGuard, useWorkspaceCommand, useWorkspaceRead } from "./use-workspace";

const labels: Record<RWTransition, string> = { submit: "Submit for review", approve: "Approve and publish", reject: "Return to author", unpublish: "Unpublish record" };
const explanations: Record<RWTransition, string> = {
  submit: "Move this editable draft into the review queue. Further editing will be blocked while it is pending.",
  approve: "Approve this pending record and publish it in the same command. Both review and publish authority, plus the backend’s recent-MFA check, are required.",
  reject: "Return this pending record to its author as rejected so it can be revised. Your note is recorded in workflow history.",
  unpublish: "Remove this record from public visibility and return it to an editable, rejected state. Recent MFA may be required.",
};
export function RecordDetail({ resource, id }: { resource: string; id: string }) {
  const { modules } = useResearchWorkspace(), resourceModule = modules.find(item => item.key === resource);
  if (!resourceModule) return <WorkspaceFeedback title="Working area not assigned">No record has been loaded outside your assignment.</WorkspaceFeedback>;
  return <Detail key={`${resourceModule.key}:${id}`} module={resourceModule} id={id} />;
}
function Detail({ module: resourceModule, id }: { module: RWModule; id: string }) {
  const [editing, setEditing] = useState(false), [action, setAction] = useState<RWTransition | null>(null), [notice, setNotice] = useState("");
  const load = useCallback((signal: AbortSignal) => researchWorkspaceApi.get(resourceModule.key, id, signal), [resourceModule.key, id]);
  const { state, reload } = useWorkspaceRead(load);
  const [historyVersion, setHistoryVersion] = useState(0);
  if (state.status === "loading") return <WorkspaceLoading label="Loading the scope-checked record…" />;
  if (state.status === "error") return <Problem problem={state.error} onRetry={reload} />;
  const row = state.data;
  function saved(message: string) { setNotice(message); setEditing(false); setAction(null); setHistoryVersion(value => value + 1); reload(); }
  if (editing && row.actions.edit) return <RecordForm module={resourceModule} row={row} onCancel={() => setEditing(false)} onSaved={() => saved("Changes saved. Current service data has been requested.")} />;
  const sections = [...new Set(resourceModule.fields.map(field => field.section))];
  return <div className="rw-stack"><Link href={`/admin/${resourceModule.key}`} className="rw-text-link"><ArrowLeft size={16} aria-hidden="true" />Back to {resourceModule.label.toLowerCase()}</Link>
    {notice && <WorkspaceFeedback title="Command confirmed" tone="success">{notice}</WorkspaceFeedback>}
    <div className="rw-page-heading"><div><p className="rw-eyebrow">{resourceModule.singular.toUpperCase()}</p><h1>{row.title}</h1><div className="rw-record-meta"><WorkspaceStatus value={resourceModule.workflow ? row.workflow_state : typeof row.record.status === "string" ? row.record.status : null} /><span>{row.actions.edit ? "Editable with your assignment" : "Read only in the current state"}</span></div></div>
      <div className="rw-actions"><Button type="button" variant="outline" onClick={reload}><RefreshCw aria-hidden="true" />Reload record</Button>{row.actions.edit && <Button onClick={() => setEditing(true)}><Pencil aria-hidden="true" />Edit record</Button>}</div></div>
    <div className="rw-detail-grid"><div className="rw-stack">{sections.map(section => <section key={section} className="rw-panel rw-inset"><h2>{section}</h2><dl className="rw-values">
      {resourceModule.fields.filter(field => field.section === section).map(field => <div key={field.key} className={["text", "json"].includes(field.kind) ? "rw-value-wide" : ""}><dt>{field.label}</dt><dd>
        {!(field.key in row.record) ? "Not returned by this endpoint" : field.kind === "decimal" && row.record.currency != null && /amount|budget|award|value|balance|fee|cost|distribution/.test(field.key) ? rwMoney(row.record[field.key], row.record.currency) : rwDisplay(row.record[field.key])}
      </dd></div>)}</dl></section>)}</div>
      <aside className="rw-stack"><section className="rw-panel rw-inset rw-action-panel"><p className="rw-eyebrow">NEXT ACTION</p><h2>Record controls</h2>
        {resourceModule.workflow ? <><p>Only actions authorized for this record and its current state are shown.</p><div className="rw-vertical-actions">
          {(Object.keys(labels) as RWTransition[]).filter(key => row.actions[key]).map(key => <Button key={key} variant={key === "unpublish" || key === "reject" ? "outline" : "default"} onClick={() => setAction(key)}>
            {key === "approve" ? <Check aria-hidden="true" /> : key === "submit" ? <Send aria-hidden="true" /> : <Undo2 aria-hidden="true" />}{labels[key]}</Button>)}
          {!(Object.keys(labels) as RWTransition[]).some(key => row.actions[key]) && <p className="rw-help">No editorial transition is currently assigned to you.</p>}</div></> :
          <p>This record uses its native service contract. Available specialized actions are listed below; no generic approval is assumed.</p>}
        <dl className="rw-record-id"><dt>Record ID</dt><dd>{row.id}</dd><dt>Last updated</dt><dd>{rwDisplay(row.record.updated_at)}</dd></dl></section>
      <RelatedRecords module={resourceModule} row={row} />
      <RecordOperations module={resourceModule} row={row} onConfirmed={() => saved("The service confirmed the action. Current record data is being requested.")} />
      {row.actions.history && <RecordHistory key={`${row.id}:${historyVersion}`} module={resourceModule} row={row} />}</aside></div>
    <RecordConnections key={`${row.id}:${historyVersion}`} module={resourceModule} row={row} />
    {action && <TransitionDialog module={resourceModule} row={row} action={action} onClose={() => setAction(null)} onConfirmed={() => saved(`${labels[action]} completed. The record is being refreshed.`)} />}
  </div>;
}
function TransitionDialog({ module: resourceModule, row, action, onClose, onConfirmed }:
  { module: RWModule; row: RWRow; action: RWTransition; onClose: () => void; onConfirmed: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null), command = useWorkspaceCommand(), [note, setNote] = useState("");
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  useUnsavedGuard(command.locked || Boolean(note));
  return <dialog ref={dialog} className="rw-dialog" aria-labelledby="rw-transition-title" aria-describedby="rw-transition-description"
    onCancel={event => { if (command.locked) event.preventDefault(); else onClose(); }}>
    <form onSubmit={event => { event.preventDefault(); if (!command.locked) command.execute(key => researchWorkspaceApi.transition(resourceModule.key, row.id, action, note, key), onConfirmed); }}>
      <p className="rw-eyebrow">CONFIRM EDITORIAL ACTION</p><h2 id="rw-transition-title">{labels[action]}</h2><p className="rw-dialog-record">{row.title}</p>
      <p id="rw-transition-description">{explanations[action]}</p>
      <label htmlFor="rw-review-note">Workflow note <span className="rw-help">Optional · up to 2,000 characters</span></label>
      <textarea id="rw-review-note" rows={5} value={note} maxLength={2000} disabled={command.locked} onChange={event => { command.reset(); setNote(event.target.value); }} />
      <p className="rw-help">{note.length.toLocaleString()} / 2,000 characters</p>
      {command.error && <Problem problem={command.error} onRetry={command.retry} command />}
      {command.error?.fields.note && <p role="alert" className="rw-field-error">{command.error.fields.note.join(" ")}</p>}
      <div className="rw-dialog-actions"><Button variant="outline" type="button" disabled={command.locked} onClick={onClose}>Cancel</Button>
        <Button type="submit" variant={action === "unpublish" ? "destructive" : "default"} loading={command.pending} disabled={command.locked}>{labels[action]}</Button></div>
    </form></dialog>;
}
function RecordHistory({ module: resourceModule, row }: { module: RWModule; row: RWRow }) {
  const [page, setPage] = useState(1);
  const load = useCallback((signal: AbortSignal) => researchWorkspaceApi.history(resourceModule.key, row.id, page, signal), [resourceModule.key, row.id, page]);
  const { state, reload } = useWorkspaceRead(load);
  return <section className="rw-panel rw-inset"><h2 className="rw-inline-heading"><History size={18} aria-hidden="true" />Workflow history</h2>
    {state.status === "loading" ? <WorkspaceLoading label="Loading history…" /> : state.status === "error" ? <Problem problem={state.error} onRetry={reload} /> : <>
      {state.data.length === 0 ? <p className="rw-help">No events on this page. Legacy records may not have historical events.</p> : <ol className="rw-history">{state.data.map(event => <li key={event.id}>
        <strong>{event.previous_state} → {event.target_state}</strong><time dateTime={event.created_at}>{new Date(event.created_at).toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })} EAT</time>
        {event.note && <p>{event.note}</p>}<small>Actor: {event.actor_id}</small></li>)}</ol>}
      <div className="rw-history-paging"><Button variant="outline" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Newer</Button><span>Page {page}</span><Button variant="outline" disabled={state.data.length < 25} onClick={() => setPage(value => value + 1)}>Older</Button></div>
    </>}
  </section>;
}
