"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button, Input } from "@ksu/ui/components";
import { SourceRecordPicker } from "@/components/page-cms/source-record-picker";
import { EditorActions, SharedSectionFields, createReferenceItem, itemLimitError, moveRow, sourcePickerValue, useTypedSectionEditor, type SectionEditorProps, type TypedSectionDraft } from "./shared-section-fields";
import type { PageCmsSourceType } from "@/lib/api/page-cms";

const PULSE_SETTING_KEYS = ["priority", "expires_at", "icon_key"] as const;
const MAX_PULSE_SOURCES = 4;
const PULSE_SOURCE_TYPES: PageCmsSourceType[] = ["news", "event", "research_project", "club_activity"];

export function PulseEditor(props: SectionEditorProps) {
  const editor = useTypedSectionEditor({ ...props, ownedSettingKeys: PULSE_SETTING_KEYS });
  const sources = editor.draft.items.filter((item) => item.item_type === "reference");
  const definition = props.definition;
  const limit = Math.min(MAX_PULSE_SOURCES, definition.max_items);
  const updateSources = (next: typeof sources) => editor.setDraft((current) => ({ ...current, items: next.map((item, index) => ({ ...item, display_order: (index + 1) * 10 })) }));
  const validate = (draft: TypedSectionDraft) => {
    const selected = draft.items.filter((item) => item.item_type === "reference");
    return itemLimitError(selected.length, props.definition.min_items, limit, "Pulse sources");
  };

  return <div className="space-y-5"><SharedSectionFields draft={editor.draft} setDraft={editor.setDraft} readOnly={props.readOnly} /><fieldset disabled={props.readOnly} className="grid gap-4 border-t border-border pt-4 md:grid-cols-3"><label className="space-y-2 text-sm font-medium">Priority<Input type="number" min="0" value={String(editor.draft.settings.priority ?? 0)} onChange={(event) => editor.setDraft((current) => ({ ...current, settings: { ...current.settings, priority: Number(event.target.value || 0) } }))} /></label><label className="space-y-2 text-sm font-medium">Expiry (UTC)<Input type="datetime-local" value={String(editor.draft.settings.expires_at ?? "").replace(/:00\.000Z$/, "")} onChange={(event) => editor.setDraft((current) => ({ ...current, settings: { ...current.settings, expires_at: event.target.value ? new Date(`${event.target.value}Z`).toISOString() : null } }))} /></label><label className="space-y-2 text-sm font-medium">Icon key<Input value={String(editor.draft.settings.icon_key ?? "")} onChange={(event) => editor.setDraft((current) => ({ ...current, settings: { ...current.settings, icon_key: event.target.value } }))} /></label></fieldset><section aria-label="Pulse sources" className="space-y-3 border-t border-border pt-4"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold">Pulse sources</h3><Button type="button" variant="outline" size="sm" disabled={props.readOnly || sources.length >= limit} onClick={() => updateSources([...sources, { item_type: "reference", display_order: (sources.length + 1) * 10, is_enabled: true }])}><Plus />Add source</Button></div>{sources.map((item, index) => <div key={`${item.source_type ?? "new"}-${index}`} className="grid gap-3 border-b border-border pb-3 md:grid-cols-[minmax(0,1fr)_auto]"><div className="grid gap-3 md:grid-cols-2">{PULSE_SOURCE_TYPES.map((sourceType) => <SourceRecordPicker key={sourceType} sourceType={sourceType} layoutVariant="pulse_strip" scopeType={props.section.scope_type} scopeId={props.section.scope_id} label={sourceType.replace(/_/g, " ")} value={sourcePickerValue(props.section, sourceType, item)} onChange={(value) => value && updateSources(sources.map((row, rowIndex) => rowIndex === index ? createReferenceItem(sourceType, value.sourceId, row.display_order ?? 10) : row))} disabled={props.readOnly} />)}</div><div className="flex items-end gap-1"><Button type="button" variant="ghost" size="icon" aria-label="Move source up" disabled={props.readOnly || index === 0} onClick={() => updateSources(moveRow(sources, index, -1))}><ArrowUp /></Button><Button type="button" variant="ghost" size="icon" aria-label="Move source down" disabled={props.readOnly || index === sources.length - 1} onClick={() => updateSources(moveRow(sources, index, 1))}><ArrowDown /></Button><Button type="button" variant="ghost" size="icon" aria-label="Remove source" disabled={props.readOnly} onClick={() => updateSources(sources.filter((_, rowIndex) => rowIndex !== index))}><Trash2 /></Button></div></div>)}</section><EditorActions section={props.section} dirty={editor.dirty} isSaving={editor.isSaving} saveError={editor.saveError} readOnly={props.readOnly} onReset={editor.reset} onSave={() => void editor.save(validate)} /></div>;
}
