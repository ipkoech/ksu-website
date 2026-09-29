"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@ksu/ui/button";
import { WorkspaceFeedback } from "@ksu/ui/components/workspace-feedback";
import { RWBatchController, researchWorkspaceApi } from "@ksu/api-client/research";
import type { RWModule, RWRow, RWTransition } from "@ksu/api-client/research";
import { useUnsavedGuard } from "./use-workspace";
const labels: Record<RWTransition, string> = { submit: "Submit for review", approve: "Approve and publish", reject: "Return to author", unpublish: "Unpublish" };
export function BulkEditorial({ module, rows, onClose }: { module: RWModule; rows: RWRow[]; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null), [controller] = useState(() => new RWBatchController());
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const available = (Object.keys(labels) as RWTransition[]).filter(action => rows.every(row => row.actions[action]));
  const [action, setAction] = useState<RWTransition>(available[0] ?? "submit"), [note, setNote] = useState(""), [error, setError] = useState("");
  const captured = state.items.length > 0;
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => { controller.pause(); node?.close(); }; }, [controller]);
  useUnsavedGuard(state.running || state.paused);
  function report() {
    const blob = new Blob([JSON.stringify(state.items.map(({ id, key, status, problem }) => ({ id, key, status, message: problem?.message ?? null })), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob), a = document.createElement("a"); a.href = url; a.download = `${module.key}-batch-results.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return <dialog ref={dialog} className="rw-dialog rw-dialog-wide" aria-labelledby="rw-batch-title" onCancel={event => { if (state.running) event.preventDefault(); else onClose(); }}><p className="rw-eyebrow">BATCH REVIEW</p><h2 id="rw-batch-title">Act on {rows.length} selected records</h2><p>Each record is authorized and committed separately. The batch pauses on an uncertain outcome or an authentication failure. Confirmed actions are never replayed.</p>
    {!available.length && <WorkspaceFeedback title="No common authorized action">Select records that share a permitted action and state.</WorkspaceFeedback>}
    {!captured ? <form className="rw-stack" onSubmit={event => { event.preventDefault(); if (!available.includes(action)) return; setError(""); void controller.start(module.key, action, rows, (id, key) => researchWorkspaceApi.transition(module.key, id, action, note, key)).catch(() => setError("The batch could not be started. Check your selection and secure browser context.")); }}><label>Action<select value={action} onChange={event => setAction(event.target.value as RWTransition)}>{available.map(value => <option value={value} key={value}>{labels[value]}</option>)}</select></label><label>Workflow note for every selected record<textarea rows={3} maxLength={2000} value={note} onChange={event => setNote(event.target.value)} /></label><ul className="rw-batch-preview">{rows.map(row => <li key={row.id}>{row.title}</li>)}</ul>{error && <p role="alert" className="rw-field-error">{error}</p>}<div className="rw-dialog-actions"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={!available.length}>Confirm {labels[action].toLowerCase()}</Button></div></form> : <>
      <p role="status" aria-live="polite">{state.items.filter(item => item.status === "confirmed").length} confirmed · {state.items.filter(item => item.status === "failed").length} failed · {state.items.filter(item => item.status === "uncertain").length} uncertain · {state.items.filter(item => item.status === "waiting").length} waiting</p>
      <ul className="rw-batch-results">{state.items.map(item => <li key={item.id}><strong>{item.title}</strong><span>{item.status}</span>{item.problem && <p>{item.problem.message}</p>}<small>Command key: {item.key}</small></li>)}</ul>
      {state.paused && <WorkspaceFeedback title="Batch paused">Resume explicitly to retry an uncertain item using its original key and continue waiting items. Failed items remain failed; inspect them individually.</WorkspaceFeedback>}
      <div className="rw-dialog-actions"><Button type="button" variant="outline" onClick={report}>Download result report</Button>{state.running ? <Button type="button" variant="outline" onClick={controller.pause}>Pause after current request</Button> : <><Button type="button" variant="outline" onClick={onClose}>Close and refresh list</Button>{state.paused && <Button type="button" onClick={() => { void controller.resume(); }}>Resume captured batch</Button>}</>}</div>
    </>}
  </dialog>;
}
