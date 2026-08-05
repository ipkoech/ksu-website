"use client";

import { Input } from "@ksu/ui/components";
import { SourceRecordPicker } from "@/components/page-cms/source-record-picker";
import { EditorActions, SharedSectionFields, createReferenceItem, itemLimitError, sourcePickerValue, toDateTimeInput, useTypedSectionEditor, type SectionEditorProps, type TypedSectionDraft } from "./shared-section-fields";

const DATE_SETTING_KEYS = ["timezone"] as const;

export function AcademicDatesEditor(props: SectionEditorProps) {
  const editor = useTypedSectionEditor({ ...props, ownedSettingKeys: DATE_SETTING_KEYS });
  const intake = editor.draft.items.find((item) => item.item_type === "reference" && item.source_type === "intake");
  const calendar = editor.draft.items.find((item) => item.item_type === "reference" && item.source_type === "academic_calendar");
  const validate = (draft: TypedSectionDraft) => {
    const count = draft.items.filter((item) => item.item_type === "reference" && (item.source_type === "intake" || item.source_type === "academic_calendar")).length;
    return itemLimitError(count, props.definition.min_items, props.definition.max_items, "Academic date sources");
  };
  const setReference = (sourceType: "intake" | "academic_calendar", sourceId?: string) => editor.setDraft((current) => ({ ...current, items: [...current.items.filter((item) => item.item_type !== "reference" || item.source_type !== sourceType), ...(sourceId ? [createReferenceItem(sourceType, sourceId, sourceType === "intake" ? 10 : 20)] : [])] }));
  return <div className="space-y-5"><SharedSectionFields draft={editor.draft} setDraft={editor.setDraft} readOnly={props.readOnly} /><fieldset disabled={props.readOnly} className="border-t border-border pt-4"><label className="space-y-2 text-sm font-medium">Display timezone<Input value={String(editor.draft.settings.timezone ?? "Africa/Nairobi")} onChange={(event) => editor.setDraft((current) => ({ ...current, settings: { ...current.settings, timezone: event.target.value } }))} placeholder="Africa/Nairobi" /></label></fieldset><section aria-label="Academic date sources" className="grid gap-4 border-t border-border pt-4 md:grid-cols-2"><SourceRecordPicker sourceType="intake" layoutVariant="date_timeline" scopeType={props.section.scope_type} scopeId={props.section.scope_id} label="Intake" value={sourcePickerValue(props.section, "intake", intake)} onChange={(value) => setReference("intake", value?.sourceId)} disabled={props.readOnly} /><SourceRecordPicker sourceType="academic_calendar" layoutVariant="date_timeline" scopeType={props.section.scope_type} scopeId={props.section.scope_id} label="Academic calendar" value={sourcePickerValue(props.section, "academic_calendar", calendar)} onChange={(value) => setReference("academic_calendar", value?.sourceId)} disabled={props.readOnly} /></section><p className="text-sm text-muted-foreground">Publication windows use UTC: {toDateTimeInput(props.section.valid_from) || "not scheduled"} to {toDateTimeInput(props.section.valid_to) || "not scheduled"}.</p><EditorActions section={props.section} dirty={editor.dirty} isSaving={editor.isSaving} saveError={editor.saveError} readOnly={props.readOnly} onReset={editor.reset} onSave={() => void editor.save(validate)} /></div>;
}
