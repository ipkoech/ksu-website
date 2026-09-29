"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@ksu/ui/button";
import { WorkspaceField } from "@ksu/ui/components/workspace-field";
import { buildRWPayload, researchWorkspaceApi, rwDraft } from "@ksu/api-client/research";
import type { RWDraft, RWModule, RWNativeCommand, RWRow } from "@ksu/api-client/research";
import { Problem } from "./problem";
import { useUnsavedGuard, useWorkspaceCommand } from "./use-workspace";
import { ReferencePicker } from "./reference-picker";

export function RecordOperations({ module, row, onConfirmed }: { module: RWModule; row: RWRow; onConfirmed: () => void }) {
  const [selected, setSelected] = useState<RWNativeCommand | "delete" | null>(null);
  const commands = (module.commands ?? []).filter(item => row.commands?.includes(item.key));
  if (!commands.length && !row.actions.delete) return null;
  return <section className="rw-panel rw-inset"><p className="rw-eyebrow">NATIVE ACTIONS</p><h2>Manage this record</h2>
    <p>Each command is authorized and applied by the owning service. Publication and archive actions affect visibility.</p>
    <div className="rw-vertical-actions">{commands.map(item => <Button key={item.key} variant="outline" onClick={() => setSelected(item)}>{item.label}</Button>)}
      {row.actions.delete && <Button variant="destructive" onClick={() => setSelected("delete")}>Delete record</Button>}</div>
    {selected && <OperationDialog module={module} row={row} selected={selected} onClose={() => setSelected(null)} onConfirmed={() => { setSelected(null); onConfirmed(); }} />}
  </section>;
}
function OperationDialog({ module, row, selected, onClose, onConfirmed }: {
  module: RWModule; row: RWRow; selected: RWNativeCommand | "delete"; onClose: () => void; onConfirmed: () => void;
}) {
  const router = useRouter(), dialog = useRef<HTMLDialogElement>(null), command = useWorkspaceCommand();
  const [confirmation, setConfirmation] = useState("");
  const descriptor: RWModule = { key: module.key, label: module.label, singular: module.singular, workflow: false,
    can_create: true, fields: selected === "delete" ? [] : selected.fields };
  const [draft, setDraft] = useState<RWDraft>(() => rwDraft(descriptor));
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const isDelete = selected === "delete", label = isDelete ? "Delete record" : selected.label;
  useEffect(() => { const element = dialog.current; element?.showModal(); return () => element?.close(); }, []);
  useUnsavedGuard(command.locked || Boolean(confirmation) || Object.values(draft).some(value => value !== ""));
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (command.locked) return;
    if (isDelete) {
      if (confirmation !== row.title) { setErrors({ confirmation: ["Enter the exact record title to confirm deletion."] }); return; }
      command.execute(key => researchWorkspaceApi.remove(module.key, row.id, key, row.revision), () => router.replace(`/admin/${module.key}?deleted=1`));
      return;
    }
    const result = buildRWPayload(descriptor, draft);
    if (Object.keys(result.errors).length) { setErrors(result.errors); return; }
    setErrors({});
    const payload = result.payload, action = selected.key;
    command.execute(key => researchWorkspaceApi.command(module.key, row.id, action, payload, key), onConfirmed);
  }
  return <dialog ref={dialog} className="rw-dialog" aria-labelledby="rw-operation-title" aria-describedby="rw-operation-description"
    onCancel={event => { if (command.locked) event.preventDefault(); else onClose(); }}>
    <form onSubmit={submit}><p className="rw-eyebrow">CONFIRM RECORD ACTION</p><h2 id="rw-operation-title">{label}</h2><p className="rw-dialog-record">{row.title}</p>
      <p id="rw-operation-description">{isDelete ? "This uses the service’s soft-delete command. The record disappears from active lists. This workspace does not provide a restore command." : selected.description}</p>
      {isDelete ? <div><label htmlFor="rw-delete-confirm">Type the exact title: {row.title}</label><input id="rw-delete-confirm" value={confirmation} disabled={command.locked} autoComplete="off" onChange={event => { command.reset(); setConfirmation(event.target.value); setErrors({}); }} aria-invalid={Boolean(errors.confirmation)} aria-describedby={errors.confirmation ? "rw-delete-error" : undefined} />{errors.confirmation && <p id="rw-delete-error" role="alert" className="rw-field-error">{errors.confirmation.join(" ")}</p>}</div> :
        <div className="rw-stack">{descriptor.fields.filter(field => field.create).map(field => <WorkspaceField key={field.key} field={field} value={draft[field.key] ?? ""} disabled={command.locked}
          errors={errors[field.key] || command.error?.fields[field.key]} onChange={value => { command.reset(); setDraft(previous => ({ ...previous, [field.key]: value })); setErrors({}); }}
          trailing={field.kind === "uuid" && field.reference_resource ? <ReferencePicker resource={field.reference_resource} disabled={command.locked} onSelect={id => setDraft(previous => ({ ...previous, [field.key]: id }))} /> : undefined} />)}</div>}
      {Object.keys(errors).length > 0 && <p role="alert" className="rw-field-error">Correct the highlighted input before continuing.</p>}
      {command.error && <Problem problem={command.error} onRetry={command.retry} command />}
      <div className="rw-dialog-actions"><Button variant="outline" type="button" disabled={command.locked} onClick={onClose}>Cancel</Button><Button type="submit" variant={isDelete || selected.destructive ? "destructive" : "default"} loading={command.pending} disabled={command.locked}>{label}</Button></div>
    </form></dialog>;
}
