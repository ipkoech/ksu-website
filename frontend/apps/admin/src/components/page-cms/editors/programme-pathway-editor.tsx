"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { Button, Input, Switch } from "@ksu/ui/components";
import { EditorActions, SharedSectionFields, moveRow, useTypedSectionEditor, type SectionEditorProps, type TypedSectionDraft } from "./shared-section-fields";

const PROGRAMME_SETTING_KEYS = ["filters", "pathway_steps"] as const;
const PROGRAMME_FILTERS = ["qualification", "school", "department", "mode", "campus", "intake"] as const;
const PATHWAY_STEP_COUNT = 5;
type PathwayStep = { title: string; description: string; label: string; url: string; order: number };

function pathwaySteps(value: unknown): PathwayStep[] {
  const rows = Array.isArray(value) ? value : [];
  return Array.from({ length: PATHWAY_STEP_COUNT }, (_, index) => {
    const row = rows[index] && typeof rows[index] === "object" ? rows[index] as Record<string, unknown> : {};
    return { title: String(row.title ?? ""), description: String(row.description ?? ""), label: String(row.label ?? ""), url: String(row.url ?? ""), order: Number(row.order ?? index + 1) };
  });
}

export function ProgrammePathwayEditor(props: SectionEditorProps) {
  const editor = useTypedSectionEditor({ ...props, ownedSettingKeys: PROGRAMME_SETTING_KEYS });
  const filters = Array.isArray(editor.draft.settings.filters) ? editor.draft.settings.filters.filter((value): value is string => typeof value === "string") : [];
  const steps = pathwaySteps(editor.draft.settings.pathway_steps);
  const setSteps = (next: PathwayStep[]) => editor.setDraft((current) => ({ ...current, settings: { ...current.settings, pathway_steps: next.map((step, index) => ({ ...step, order: index + 1 })) } }));
  const validate = (draft: TypedSectionDraft) => {
    const invalidStep = pathwaySteps(draft.settings.pathway_steps).some((step) => Boolean(step.url) !== Boolean(step.label) || (step.url && !/^(https?:\/\/|\/)/.test(step.url)));
    return invalidStep ? "Each pathway link needs a label, URL, and a valid destination." : null;
  };
  return <div className="space-y-5"><SharedSectionFields draft={editor.draft} setDraft={editor.setDraft} readOnly={props.readOnly} /><fieldset disabled={props.readOnly} className="space-y-3 border-t border-border pt-4"><legend className="text-sm font-semibold">Programme filters</legend><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{PROGRAMME_FILTERS.map((filter) => <label key={filter} className="flex min-h-10 items-center justify-between gap-3 border border-border px-3 text-sm font-medium"><span>{filter}</span><Switch checked={filters.includes(filter)} onCheckedChange={(checked) => editor.setDraft((current) => ({ ...current, settings: { ...current.settings, filters: checked ? [...filters, filter] : filters.filter((value) => value !== filter) } }))} /></label>)}</div></fieldset><section aria-label="Programme pathway steps" className="space-y-3 border-t border-border pt-4"><div><h3 className="text-sm font-semibold">Five pathway steps</h3><p className="mt-1 text-sm text-muted-foreground">Each step stays in its ordered position; leave unused steps blank.</p></div>{steps.map((step, index) => <div key={index} className="grid gap-3 border-b border-border pb-3 lg:grid-cols-[2rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"><span className="pt-3 text-sm tabular-nums text-muted-foreground">{index + 1}</span><label className="space-y-2 text-sm font-medium">Title<Input value={step.title} disabled={props.readOnly} onChange={(event) => setSteps(steps.map((row, rowIndex) => rowIndex === index ? { ...row, title: event.target.value } : row))} /></label><label className="space-y-2 text-sm font-medium">Description<Input value={step.description} disabled={props.readOnly} onChange={(event) => setSteps(steps.map((row, rowIndex) => rowIndex === index ? { ...row, description: event.target.value } : row))} /></label><label className="space-y-2 text-sm font-medium">Link label<Input value={step.label} disabled={props.readOnly} onChange={(event) => setSteps(steps.map((row, rowIndex) => rowIndex === index ? { ...row, label: event.target.value } : row))} /></label><label className="space-y-2 text-sm font-medium">Link URL<Input value={step.url} disabled={props.readOnly} placeholder="https:// or /path" onChange={(event) => setSteps(steps.map((row, rowIndex) => rowIndex === index ? { ...row, url: event.target.value } : row))} /></label><div className="flex items-end gap-1"><Button type="button" variant="ghost" size="icon" aria-label="Move pathway step up" disabled={props.readOnly || index === 0} onClick={() => setSteps(moveRow(steps, index, -1))}><ArrowUp /></Button><Button type="button" variant="ghost" size="icon" aria-label="Move pathway step down" disabled={props.readOnly || index === PATHWAY_STEP_COUNT - 1} onClick={() => setSteps(moveRow(steps, index, 1))}><ArrowDown /></Button></div></div>)}</section><EditorActions section={props.section} dirty={editor.dirty} isSaving={editor.isSaving} saveError={editor.saveError} readOnly={props.readOnly} onReset={editor.reset} onSave={() => void editor.save(validate)} /></div>;
}
