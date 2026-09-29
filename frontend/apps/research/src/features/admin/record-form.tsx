"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState, type FormEvent } from "react";
import { Save } from "lucide-react";
import { Button } from "@ksu/ui/button";
import { WorkspaceField } from "@ksu/ui/components/workspace-field";
import { SupportPicker } from "./support-picker";
import { ReferencePicker } from "./reference-picker";
import { WorkspaceFeedback } from "@ksu/ui/components/workspace-feedback";
import { researchWorkspaceApi, researchWorkspacePayload, rwDraft, rwFieldErrors } from "@ksu/api-client/research";
import type { RWDraft, RWModule, RWRow, RWValue } from "@ksu/api-client/research";
import { useResearchWorkspace } from "./admin-shell";
import { Problem } from "./problem";
import { useUnsavedGuard, useWorkspaceCommand } from "./use-workspace";

export function NewRecord({ resource }: { resource: string }) {
  const { modules } = useResearchWorkspace(), resourceModule = modules.find(item => item.key === resource);
  if (!resourceModule?.can_create) return <WorkspaceFeedback title="Creation is not assigned">Your current signed assignment does not permit creation in this working area.</WorkspaceFeedback>;
  return <RecordForm key={resourceModule.key} module={resourceModule} />;
}
export function RecordForm({ module: resourceModule, row, onSaved, onCancel, persist, embedded = false }:
  { module: RWModule; row?: RWRow; onSaved?: () => void; onCancel?: () => void; persist?: (payload: Record<string, RWValue>, key: string) => Promise<string>; embedded?: boolean }) {
  const router = useRouter(), command = useWorkspaceCommand();
  const instance = useId().replace(/[^A-Za-z0-9_-]/g, ""), idPrefix = `rw-${instance}`;
  const Heading = embedded ? "h2" : "h1";
  const initial = useMemo(() => rwDraft(resourceModule, row), [resourceModule, row]);
  const [draft, setDraft] = useState<RWDraft>(initial), [errors, setErrors] = useState<Record<string, string[]>>({});
  const form = useRef<HTMLFormElement>(null);
  const [saved, setSaved] = useState(false);
  const dirty = Object.keys(draft).some(key => draft[key] !== initial[key]);
  const dismissUnsaved = useUnsavedGuard(!saved && (dirty || command.locked));
  const fields = resourceModule.fields.filter(field => row ? field.update : field.create);
  const sections = [...new Set(fields.map(field => field.section))];
  const allErrors = { ...errors, ...rwFieldErrors(fields, command.error?.fields ?? {}) };
  function supportingPicker(field: typeof fields[number]) {
    const media = /^(?:cover_image_id|logo_id|document_id|gallery_media_ids|attachment_media_ids|document_media_ids)$/.test(field.key);
    const person = /^(?:pi_id|applicant_id|reviewer_id|submitter_id|director_id|lead_id|person_id|editor_in_chief_id)$/.test(field.key);
    if (!media && !person) return undefined;
    return <SupportPicker kind={media ? "media" : "persons"} disabled={command.locked || saved} onSelect={id => {
      if (field.kind !== "json") { change(field.key, id); return; }
      try {
        const previous: unknown = draft[field.key] ? JSON.parse(String(draft[field.key])) : [];
        if (!Array.isArray(previous) || previous.some(item => typeof item !== "string")) throw new Error();
        change(field.key, JSON.stringify([...new Set([...previous, id])], null, 2));
      } catch { setErrors(current => ({ ...current, [field.key]: ["Correct the existing ID array before adding media."] })); }
    }} />;
  }
  function change(key: string, value: string | boolean) {
    command.reset();
    setDraft(current => ({ ...current, [key]: value }));
    setErrors(current => Object.fromEntries(Object.entries(current).filter(([field]) => field !== key)));
  }
  function focusField(key: string) {
    const element = form.current?.elements.namedItem(key);
    if (element instanceof HTMLElement) element.focus();
    else document.getElementById(`${idPrefix}-${key}`)?.focus();
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    if (command.locked) return;
    const result = researchWorkspacePayload(resourceModule, draft, row ? initial : undefined);
    setErrors(result.errors);
    const first = Object.keys(result.errors)[0];
    if (first) { focusField(first); return; }
    if (row && Object.keys(result.payload).length === 0) { setErrors({ _form: ["No fields have changed."] }); return; }
    // Capture a validated snapshot, not a mutable draft reference.
    command.execute(key => persist ? persist(result.payload, key) : researchWorkspaceApi.save(resourceModule.key, result.payload, key, row?.id, row?.revision), id => {
      dismissUnsaved(); setSaved(true);
      if (onSaved) onSaved();
      else router.replace(`/admin/${resourceModule.key}/${id}`);
    });
  }
  return <form ref={form} onSubmit={submit} noValidate className="rw-stack">
    <div className="rw-page-heading"><div><p className="rw-eyebrow">{row ? "RECORD EDITOR" : "NEW RECORD"}</p><Heading>{row ? `Edit ${resourceModule.singular}` : `Create ${resourceModule.singular}`}</Heading>
      <p>Only native service fields are included. Required fields are marked; optional empty values are not invented.</p></div></div>
    {resourceModule.workflow && !row && <WorkspaceFeedback title="The server controls the initial editorial state">
      Creation can save a draft or submit it automatically according to your signed authority. New records are not requested as publicly visible; publication still follows the canonical workflow.
    </WorkspaceFeedback>}
    {command.error && <Problem problem={command.error} onRetry={command.retry} command />}
    {command.error?.kind === "conflict" && !command.error.uncertain && row && <Button type="button" variant="outline" onClick={() => {
      if (window.confirm("Reload the latest record? Unsaved input in this form will be discarded.")) { dismissUnsaved(); window.location.reload(); }
    }}>Reload latest record</Button>}
    {Object.keys(allErrors).length > 0 && <div role="alert" id={`${idPrefix}-_form`} tabIndex={-1} className="rw-error-summary"><h2>Review these fields</h2><ul>
      {Object.entries(allErrors).map(([key, values]) => <li key={key}><a href={`#${idPrefix}-${key}`} onClick={() => focusField(key)}>{resourceModule.fields.find(field => field.key === key)?.label ?? key}: {values.join(" ")}</a></li>)}</ul></div>}
    <nav className="rw-form-nav" aria-label="Form sections">{sections.map(section => <a key={section} href={`#${idPrefix}-section-${section.replace(/\W+/g, "-").toLowerCase()}`}>{section}</a>)}</nav>
    {sections.map(section => <fieldset id={`${idPrefix}-section-${section.replace(/\W+/g, "-").toLowerCase()}`} key={section} className="rw-panel rw-fieldset" disabled={command.locked || saved}>
      <legend>{section}</legend><div className="rw-fields">{fields.filter(field => field.section === section).map(field => {
        const applied = row && field.update_constraints ? { ...field, ...field.update_constraints } : field;
        return <WorkspaceField key={field.key} idPrefix={idPrefix} field={applied} value={draft[field.key] ?? ""} errors={allErrors[field.key]} disabled={command.locked || saved}
          onChange={value => change(field.key, value)} trailing={field.reference_resource && field.kind === "uuid" ?
            <ReferencePicker resource={field.reference_resource} disabled={command.locked || saved} onSelect={id => change(field.key, id)} /> : supportingPicker(field)} />;
      })}</div></fieldset>)}
    <div className="rw-savebar"><div><strong>{command.pending ? "Submitting command…" : command.error?.uncertain ? "Outcome not confirmed" : dirty ? "Unsaved changes" : "No unsaved changes"}</strong><p>Inputs stay in this open page. Never automatically replay a write.</p></div>
      <div className="rw-actions">{onCancel ? <Button type="button" variant="outline" disabled={command.locked} onClick={() => { if (!dirty || window.confirm("Discard these unsaved edits?")) onCancel(); }}>Cancel</Button> :
        <Button asChild variant="outline"><Link href={`/admin/${resourceModule.key}`}>Back to records</Link></Button>}
        <Button type="submit" loading={command.pending} disabled={command.locked || saved || Boolean(row && !dirty)}><Save aria-hidden="true" />{row ? "Save changes" : `Create ${resourceModule.singular}`}</Button></div>
    </div>
  </form>;
}
