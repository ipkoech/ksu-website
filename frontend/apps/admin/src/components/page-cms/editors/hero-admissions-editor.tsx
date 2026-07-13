"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ksu/ui/components";
import { SourceRecordPicker } from "@/components/page-cms/source-record-picker";
import { CtaFields, EditorActions, SectionMediaRoles, SharedSectionFields, createReferenceItem, sourcePickerValue, useTypedSectionEditor, type SectionEditorProps, type TypedSectionDraft } from "./shared-section-fields";

const HERO_SETTING_KEYS = ["eyebrow", "admissions_state", "primary_cta", "secondary_cta", "tertiary_cta"] as const;
const ADMISSIONS_STATES = ["open", "closed", "override", "late"] as const;
const HERO_MEDIA_ROLES = ["hero_image", "mobile_image", "video", "poster"] as const;

function heroCtas(draft: TypedSectionDraft) {
  const existing = draft.items.filter((item) => item.item_type === "cta");
  return Array.from({ length: 3 }, (_, index) => existing[index] ?? { item_type: "cta" as const, display_order: (index + 1) * 10, is_enabled: true });
}

export function HeroAdmissionsEditor(props: SectionEditorProps) {
  const editor = useTypedSectionEditor({ ...props, ownedSettingKeys: HERO_SETTING_KEYS });
  const intake = editor.draft.items.find((item) => item.item_type === "reference" && item.source_type === "intake");
  const ctas = heroCtas(editor.draft);
  const updateCta = (index: number, value: { label: string; url: string; description: string }) => editor.setDraft((current) => {
    const nextCtas = heroCtas(current).map((cta, position) => position === index ? { ...cta, title: value.label || null, cta_label: value.label || null, cta_url: value.url || null, cta_description: value.description || null } : cta);
    return { ...current, items: [...current.items.filter((item) => item.item_type !== "cta"), ...nextCtas] };
  });
  const validate = (draft: TypedSectionDraft) => {
    if (!draft.items.some((item) => item.item_type === "reference" && item.source_type === "intake")) return "Select the admissions intake.";
    if (ctas.some((item) => Boolean(item.cta_label) !== Boolean(item.cta_url))) return "Each hero CTA needs both a label and URL.";
    return null;
  };

  return <div className="space-y-5"><SharedSectionFields draft={editor.draft} setDraft={editor.setDraft} readOnly={props.readOnly} /><fieldset disabled={props.readOnly} className="space-y-4 border-t border-border pt-4"><SourceRecordPicker sourceType="intake" layoutVariant="hero_admissions" scopeType={props.section.scope_type} scopeId={props.section.scope_id} label="Admissions intake" value={sourcePickerValue(props.section, "intake", intake)} onChange={(value) => editor.setDraft((current) => ({ ...current, items: [...current.items.filter((item) => item.item_type !== "reference" || item.source_type !== "intake"), ...(value ? [createReferenceItem("intake", value.sourceId, 1)] : [])] }))} disabled={props.readOnly} /><label className="block space-y-2 text-sm font-medium">Admissions state<Select value={String(editor.draft.settings.admissions_state ?? "open")} onValueChange={(admissions_state) => editor.setDraft((current) => ({ ...current, settings: { ...current.settings, admissions_state } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ADMISSIONS_STATES.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select></label></fieldset><section aria-label="Hero CTAs" className="space-y-3 border-t border-border pt-4">{ctas.map((cta, index) => <CtaFields key={index} label={`Hero CTA ${index + 1}`} value={{ label: cta.cta_label ?? "", url: cta.cta_url ?? "", description: cta.cta_description ?? "" }} onChange={(value) => updateCta(index, value)} readOnly={props.readOnly} />)}</section><p className="sr-only">Required media roles: {HERO_MEDIA_ROLES.join(", ")}</p><SectionMediaRoles section={props.section} definition={props.definition} readOnly={props.readOnly} /><EditorActions section={props.section} dirty={editor.dirty} isSaving={editor.isSaving} saveError={editor.saveError} readOnly={props.readOnly} onReset={editor.reset} onSave={() => void editor.save(validate)} /></div>;
}
