"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button, Input, Textarea } from "@ksu/ui/components";
import { useEffect } from "react";
import type { SectionItemPayload } from "@/lib/api/page-cms";
import { EditorActions, SharedSectionFields, itemLimitError, moveRow, useTypedSectionEditor, type SectionEditorProps, type TypedSectionDraft } from "./shared-section-fields";

const MIN_PILLARS = 2;
const MAX_PILLARS = 6;
const RECOMMENDED_PILLARS = [
  { title: "Academic excellence", body_text: "Teaching and learning that prepares graduates for meaningful work." },
  { title: "Research and innovation", body_text: "Knowledge creation that responds to regional and global challenges." },
  { title: "Community engagement", body_text: "Partnerships that connect the university with communities." },
  { title: "Student success", body_text: "Support that helps every learner progress and thrive." },
];

function defaultPillars(): SectionItemPayload[] {
  return RECOMMENDED_PILLARS.map((pillar, index) => ({ item_type: "card" as const, title: pillar.title, body_text: pillar.body_text, display_order: (index + 1) * 10, is_enabled: true }));
}

export function PillarGridEditor(props: SectionEditorProps) {
  const editor = useTypedSectionEditor({ ...props, ownedSettingKeys: [] });
  const pillars = editor.draft.items.filter((item) => item.item_type === "card");
  const visiblePillars: SectionItemPayload[] = pillars.length ? pillars : defaultPillars();
  const updatePillars = (next: SectionItemPayload[]) => editor.setDraft((current) => ({ ...current, items: next.map((item, index) => ({ ...item, display_order: (index + 1) * 10 })) }));
  useEffect(() => {
    if (!pillars.length) editor.setDraft((current) => ({ ...current, items: defaultPillars() }));
  }, [editor, pillars.length]);
  const validate = (draft: TypedSectionDraft) => {
    const count = draft.items.filter((item) => item.item_type === "card").length;
    const limitError = itemLimitError(count, MIN_PILLARS, MAX_PILLARS, "Pillars");
    if (limitError) return limitError;
    if (draft.items.some((item) => item.item_type === "card" && !item.title?.trim())) return "Each pillar needs a title.";
    return null;
  };
  const prepareDefaults = () => { if (!pillars.length) updatePillars(defaultPillars()); };
  return <div className="space-y-5"><SharedSectionFields draft={editor.draft} setDraft={editor.setDraft} readOnly={props.readOnly} /><section aria-label="Pillar rows" className="space-y-3 border-t border-border pt-4" onFocusCapture={prepareDefaults}><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-semibold">Pillars</h3><p className="mt-1 text-sm text-muted-foreground">Start with four recommended pillars. Keep two to six rows.</p></div><Button type="button" variant="outline" size="sm" disabled={props.readOnly || visiblePillars.length >= MAX_PILLARS} onClick={() => updatePillars([...visiblePillars, { item_type: "card", title: "", body_text: "", display_order: (visiblePillars.length + 1) * 10, is_enabled: true }])}><Plus />Add pillar</Button></div>{visiblePillars.map((pillar, index) => <div key={index} className="grid gap-3 border-b border-border pb-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"><label className="space-y-2 text-sm font-medium">Title<Input value={pillar.title ?? ""} disabled={props.readOnly} onChange={(event) => updatePillars(visiblePillars.map((row, rowIndex) => rowIndex === index ? { ...row, title: event.target.value } : row))} /></label><label className="space-y-2 text-sm font-medium">Description<Textarea rows={2} value={pillar.body_text ?? ""} disabled={props.readOnly} onChange={(event) => updatePillars(visiblePillars.map((row, rowIndex) => rowIndex === index ? { ...row, body_text: event.target.value } : row))} /></label><div className="flex items-end gap-1"><Button type="button" variant="ghost" size="icon" aria-label="Move pillar up" disabled={props.readOnly || index === 0} onClick={() => updatePillars(moveRow(visiblePillars, index, -1))}><ArrowUp /></Button><Button type="button" variant="ghost" size="icon" aria-label="Move pillar down" disabled={props.readOnly || index === visiblePillars.length - 1} onClick={() => updatePillars(moveRow(visiblePillars, index, 1))}><ArrowDown /></Button><Button type="button" variant="ghost" size="icon" aria-label="Remove pillar" disabled={props.readOnly || visiblePillars.length <= MIN_PILLARS} onClick={() => updatePillars(visiblePillars.filter((_, rowIndex) => rowIndex !== index))}><Trash2 /></Button></div></div>)}</section><EditorActions section={props.section} dirty={editor.dirty} isSaving={editor.isSaving} saveError={editor.saveError} readOnly={props.readOnly} onReset={editor.reset} onSave={() => { prepareDefaults(); void editor.save(validate); }} /></div>;
}
