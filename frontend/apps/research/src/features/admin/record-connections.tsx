"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Link2, Plus, Unlink, Users } from "lucide-react";
import { Button } from "@ksu/ui/button";
import { WorkspaceFeedback, WorkspaceLoading } from "@ksu/ui/components/workspace-feedback";
import { researchOperationsApi, rwDisplay } from "@ksu/api-client/research";
import type { RWChild, RWField, RWModule, RWRelationship, RWRow } from "@ksu/api-client/research";
import { RecordForm } from "./record-form";
import { Problem } from "./problem";
import { useUnsavedGuard, useWorkspaceCommand, useWorkspaceRead } from "./use-workspace";

export function RecordConnections({ module, row }: { module: RWModule; row: RWRow }) {
  const load = useCallback((signal: AbortSignal) => researchOperationsApi.catalog(module.key, row.id, signal), [module.key, row.id]);
  const { state, reload } = useWorkspaceRead(load);
  return <section className="rw-stack" aria-labelledby="rw-connections-title"><div className="rw-page-heading"><div><p className="rw-eyebrow">CONNECTED RESEARCH</p><h2 id="rw-connections-title">Relationships and attribution</h2><p>Related records are checked against your assignment. Unlinking does not delete a related record.</p></div></div>
    {state.status === "loading" ? <WorkspaceLoading label="Loading available relationship controls…" /> : state.status === "error" ? <Problem problem={state.error} onRetry={reload} /> : <>
      {!state.data.relationships.length && !state.data.children.length && <WorkspaceFeedback title="No relationship editors are available here">Use the native reference fields in the record editor. Additional link controls are not inferred from unregistered tables.</WorkspaceFeedback>}
      {state.data.relationships.map(relation => <RelationshipPanel key={relation.target} module={module} row={row} relation={relation} />)}
      {state.data.children.map(child => <ChildPanel key={child.key} module={module} row={row} child={child} />)}
    </>}
  </section>;
}
function RelationshipPanel({ module, row, relation }: { module: RWModule; row: RWRow; relation: RWRelationship }) {
  const [page, setPage] = useState(1), [adding, setAdding] = useState(false), [removing, setRemoving] = useState<RWRow | null>(null), [notice, setNotice] = useState("");
  const load = useCallback((signal: AbortSignal) => researchOperationsApi.links(module.key, row.id, relation.target, page, signal), [module.key, row.id, relation.target, page]);
  const { state, reload } = useWorkspaceRead(load);
  const target: RWField = { key: "target_id", label: `Related ${relation.label.toLowerCase()} record`, section: "Record to link", kind: "uuid", required: true, nullable: false, create: true, update: true, max_length: null, minimum: null, maximum: null, default: null, reference_resource: relation.target };
  const linkModule: RWModule = { key: `${module.key}-${relation.target}-link`, label: relation.label, singular: "relationship", workflow: false, can_create: relation.can_link, title_key: "target_id", fields: [target, ...relation.fields] };
  function done(message: string) { setAdding(false); setRemoving(null); setNotice(message); reload(); }
  return <section className="rw-panel rw-inset"><div className="rw-section-heading"><h3><Link2 size={18} aria-hidden="true" />{relation.label}</h3>{relation.can_link && <Button type="button" variant="outline" onClick={() => setAdding(true)}><Plus aria-hidden="true" />Link existing record</Button>}</div>
    {relation.assignment && <p className="rw-help">This assignment also edits the target record. Both records must be editable, and an existing parent must be unlinked first.</p>}
    {notice && <WorkspaceFeedback title="Relationship confirmed" tone="success">{notice}</WorkspaceFeedback>}
    {state.status === "loading" ? <WorkspaceLoading label="Loading linked records…" /> : state.status === "error" ? <Problem problem={state.error} onRetry={reload} /> : <>
      <p className="rw-help">{state.data.meta.total} linked records visible in your assignment</p>
      {!state.data.data.length ? <p>No accessible records are linked on this page.</p> : <ul className="rw-connected-list">{state.data.data.map(targetRow => <li key={targetRow.id}><div><Link className="rw-record-title" href={`/admin/${relation.target}/${targetRow.id}`}>{targetRow.title}</Link><small>{targetRow.id}</small></div>
        {relation.can_link && <Button type="button" variant="ghost" aria-label={`Unlink ${targetRow.title}`} onClick={() => setRemoving(targetRow)}><Unlink aria-hidden="true" />Unlink</Button>}</li>)}</ul>}
      <Pages page={page} pages={state.data.meta.total_pages} onPage={setPage} />
    </>}
    {adding && <div className="rw-inline-editor"><RecordForm embedded module={linkModule} onCancel={() => setAdding(false)} onSaved={() => done("The native service confirmed the link.")}
      persist={(payload, key) => { const { target_id, ...values } = payload; return researchOperationsApi.link(module.key, row.id, relation.target, String(target_id), values, key); }} /></div>}
    {removing && <ConfirmRemoval title={`Unlink ${removing.title}`} explanation="Only this relationship will be removed. The related record will remain in its own working area."
      request={key => researchOperationsApi.link(module.key, row.id, relation.target, removing.id, {}, key, false)} onCancel={() => setRemoving(null)} onConfirmed={() => done("The relationship was removed; the related record was not deleted.")} />}
  </section>;
}
function ChildPanel({ module, row, child }: { module: RWModule; row: RWRow; child: RWChild }) {
  const [page, setPage] = useState(1), [editor, setEditor] = useState<RWRow | "new" | null>(null), [removing, setRemoving] = useState<RWRow | null>(null), [notice, setNotice] = useState("");
  const load = useCallback((signal: AbortSignal) => researchOperationsApi.children(module.key, row.id, child.key, page, signal), [module.key, row.id, child.key, page]);
  const { state, reload } = useWorkspaceRead(load);
  function done(message: string) { setEditor(null); setRemoving(null); setNotice(message); reload(); }
  return <section className="rw-panel rw-inset"><div className="rw-section-heading"><h3><Users size={18} aria-hidden="true" />{child.module.label}</h3>{child.module.can_create && <Button type="button" variant="outline" onClick={() => setEditor("new")}><Plus aria-hidden="true" />Add {child.module.singular}</Button>}</div>
    <p className="rw-help">Parent ownership is assigned by the server. Only native fields are editable. Team membership does not grant application access. Project principal investigators are assigned on the project form.</p>
    {notice && <WorkspaceFeedback title="Attribution updated" tone="success">{notice}</WorkspaceFeedback>}
    {state.status === "loading" ? <WorkspaceLoading label="Loading attribution records…" /> : state.status === "error" ? <Problem problem={state.error} onRetry={reload} /> : <>
      {!state.data.data.length ? <p>No attribution records on this page.</p> : <ul className="rw-connected-list">{state.data.data.map(item => <li key={item.id}><div><strong>{item.title}</strong><small>{rwDisplay(item.record.affiliation ?? item.record.role ?? item.record.person_id)}</small><details><summary>Attribution details</summary><dl className="rw-values">{child.module.fields.map(field => <div key={field.key}><dt>{field.label}</dt><dd>{rwDisplay(item.record[field.key])}</dd></div>)}</dl></details></div><div className="rw-actions">
        {item.actions.edit && <Button type="button" variant="outline" onClick={() => setEditor(item)}>Edit</Button>}{item.actions.delete && <Button type="button" variant="ghost" onClick={() => setRemoving(item)}>Remove</Button>}</div></li>)}</ul>}
      <Pages page={page} pages={state.data.meta.total_pages} onPage={setPage} />
    </>}
    {editor && <div className="rw-inline-editor"><RecordForm embedded key={editor === "new" ? "new" : editor.id} module={child.module} row={editor === "new" ? undefined : editor} onCancel={() => setEditor(null)} onSaved={() => done("The native service confirmed the attribution record.")}
      persist={(payload, key) => researchOperationsApi.saveChild(module.key, row.id, child.key, payload, key, editor === "new" ? undefined : editor.id, editor === "new" ? undefined : editor.revision)} /></div>}
    {removing && <ConfirmRemoval title={`Remove ${removing.title}`} explanation="Remove this attribution entry from the parent record. This does not delete the person's Main-service profile."
      request={key => researchOperationsApi.removeChild(module.key, row.id, child.key, removing.id, key, removing.revision)} onCancel={() => setRemoving(null)} onConfirmed={() => done("The attribution entry was removed.")} />}
  </section>;
}
function Pages({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  return <div className="rw-pagination"><Button type="button" variant="outline" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button><span>Page {page} of {Math.max(1, pages)}</span><Button type="button" variant="outline" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</Button></div>;
}
function ConfirmRemoval({ title, explanation, request, onCancel, onConfirmed }: { title: string; explanation: string; request: (key: string) => Promise<string>; onCancel: () => void; onConfirmed: () => void }) {
  const ref = useRef<HTMLDialogElement>(null), command = useWorkspaceCommand();
  useEffect(() => { const node = ref.current; node?.showModal(); return () => node?.close(); }, []);
  useUnsavedGuard(command.locked);
  return <dialog ref={ref} className="rw-dialog" aria-labelledby="rw-remove-connection" onCancel={event => { if (command.locked) event.preventDefault(); else onCancel(); }}><h2 id="rw-remove-connection">{title}</h2><p>{explanation}</p>{command.error && <Problem problem={command.error} onRetry={command.retry} command />}<div className="rw-dialog-actions"><Button type="button" variant="outline" disabled={command.locked} onClick={onCancel}>Cancel</Button><Button type="button" variant="destructive" disabled={command.locked} loading={command.pending} onClick={() => command.execute(request, onConfirmed)}>Confirm removal</Button></div></dialog>;
}
