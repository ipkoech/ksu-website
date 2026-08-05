"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@ksu/ui/components";
import { SourceRecordPicker, type SourceRecordPickerValue } from "@/components/page-cms/source-record-picker";
import { EditorActions, SharedSectionFields, createReferenceItem, itemLimitError, moveRow, sourcePickerValue, useTypedSectionEditor, type SectionEditorProps, type TypedSectionDraft } from "./shared-section-fields";

function factMetadata(value: SourceRecordPickerValue) {
  const metadata = value.summary.metadata;
  return {
    source_date: String(metadata.source_date ?? value.summary.published_at ?? "Not supplied"),
    verification_state: String(metadata.verification_state ?? (metadata.verified === true ? "verified" : "verified by source catalog")),
  };
}

function isVerifiedPublicStat(value: SourceRecordPickerValue) {
  const state = String(value.summary.metadata.verification_state ?? "").toLowerCase();
  return value.summary.selectable && (state === "" || state === "verified" || value.summary.metadata.verified === true);
}

export function FactsEditor(props: SectionEditorProps) {
  const editor = useTypedSectionEditor({ ...props, ownedSettingKeys: [] });
  const facts = editor.draft.items.filter((item) => item.item_type === "reference");
  const limitReached = facts.length >= props.definition.max_items;
  const updateFacts = (next: typeof facts) => editor.setDraft((current) => ({ ...current, items: next.map((item, index) => ({ ...item, display_order: (index + 1) * 10 })) }));
  const selectFact = (index: number, value: SourceRecordPickerValue) => {
    if (!isVerifiedPublicStat(value)) return;
    updateFacts(facts.map((row, rowIndex) => rowIndex === index ? { ...createReferenceItem("public_stat", value.sourceId, row.display_order ?? 10), editorial_overrides: factMetadata(value) } : row));
  };
  const validate = (draft: TypedSectionDraft) => {
    const activeFacts = draft.items.filter((item) => item.is_enabled !== false);
    const limitError = itemLimitError(activeFacts.length, props.definition.min_items, props.definition.max_items, "Verified public statistics");
    if (limitError) return limitError;
    if (activeFacts.some((item) => item.source_type !== "public_stat" || String(item.editorial_overrides?.verification_state ?? "").toLowerCase().includes("unverified"))) return "Only verified public statistics can be saved.";
    return null;
  };

  return <div className="space-y-5"><SharedSectionFields draft={editor.draft} setDraft={editor.setDraft} readOnly={props.readOnly} /><section aria-label="Verified public statistics" className="space-y-3 border-t border-border pt-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-semibold">Verified public statistics</h3><p className="mt-1 text-sm text-muted-foreground">Only verified public_stat records are selectable. Unverified or unavailable statistics are disabled by the source catalog.</p></div><Button type="button" variant="outline" size="sm" disabled={props.readOnly || limitReached} onClick={() => updateFacts([...facts, { item_type: "reference", source_type: "public_stat", display_order: (facts.length + 1) * 10, is_enabled: true }])}><Plus />Add statistic</Button></div>{limitReached ? <p className="text-sm text-muted-foreground">The definition allows no more than {props.definition.max_items} verified public statistics. Remove one before selecting another.</p> : null}{facts.map((fact, index) => { const overrides = fact.editorial_overrides ?? {}; return <div key={fact.id ?? index} className="grid gap-3 border-b border-border pb-3 md:grid-cols-[minmax(0,1fr)_auto]"><div className="space-y-2"><SourceRecordPicker sourceType="public_stat" layoutVariant="facts_strip" scopeType={props.section.scope_type} scopeId={props.section.scope_id} label="Verified public statistic" value={sourcePickerValue(props.section, "public_stat", fact)} onChange={(value) => value && selectFact(index, value)} disabled={props.readOnly} /><div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2"><span>Source date: {String(overrides.source_date ?? "Select a statistic")}</span><span>Verification state: {String(overrides.verification_state ?? "Verified selection required")}</span></div></div><div className="flex items-end gap-1"><Button type="button" variant="ghost" size="icon" aria-label="Move statistic up" disabled={props.readOnly || index === 0} onClick={() => updateFacts(moveRow(facts, index, -1))}><ArrowUp /></Button><Button type="button" variant="ghost" size="icon" aria-label="Move statistic down" disabled={props.readOnly || index === facts.length - 1} onClick={() => updateFacts(moveRow(facts, index, 1))}><ArrowDown /></Button><Button type="button" variant="ghost" size="icon" aria-label="Remove statistic" disabled={props.readOnly || facts.length <= props.definition.min_items} onClick={() => updateFacts(facts.filter((_, rowIndex) => rowIndex !== index))}><Trash2 /></Button></div></div>; })}</section><EditorActions section={props.section} dirty={editor.dirty} isSaving={editor.isSaving} saveError={editor.saveError} readOnly={props.readOnly} onReset={editor.reset} onSave={() => void editor.save(validate)} /></div>;
}
