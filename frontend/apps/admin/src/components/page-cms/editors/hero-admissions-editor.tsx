"use client";

import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ksu/ui/components";
import { SourceRecordPicker } from "@/components/page-cms/source-record-picker";
import { CtaFields, EditorActions, SectionMediaRoles, SharedSectionFields, createReferenceItem, sourcePickerValue, useTypedSectionEditor, type SectionEditorProps, type TypedSectionDraft } from "./shared-section-fields";

const HERO_SETTING_KEYS = ["eyebrow", "admissions_state", "primary_cta", "secondary_cta", "tertiary_cta"] as const;
const CTA_SETTING_KEYS = ["primary_cta", "secondary_cta", "tertiary_cta"] as const;
const ADMISSIONS_STATES = ["open", "closed", "override", "late"] as const;
const HERO_MEDIA_ROLES = ["hero_image", "mobile_image", "video", "poster"] as const;

type HeroCta = { label: string; url: string };

function heroCtas(draft: TypedSectionDraft): HeroCta[] {
  return CTA_SETTING_KEYS.map((key) => {
    const value = draft.settings[key];
    const cta = value && typeof value === "object" ? value as Record<string, unknown> : {};
    return { label: String(cta.label ?? ""), url: String(cta.href ?? "") };
  });
}

export function HeroAdmissionsEditor(props: SectionEditorProps) {
  const editor = useTypedSectionEditor({ ...props, ownedSettingKeys: HERO_SETTING_KEYS });
  const intake = editor.draft.items.find((item) => item.item_type === "reference" && item.source_type === "intake");
  const ctas = heroCtas(editor.draft);
  const updateCta = (index: number, value: { label: string; url: string; description: string }) => editor.setDraft((current) => {
    const key = CTA_SETTING_KEYS[index];
    const settings = { ...current.settings };
    if (!value.label && !value.url) delete settings[key];
    else settings[key] = { label: value.label, href: value.url };
    return { ...current, settings };
  });
  const validate = (draft: TypedSectionDraft) => {
    if (!draft.items.some((item) => item.item_type === "reference" && item.source_type === "intake")) return "Select the admissions intake.";
    if (heroCtas(draft).some((cta) => Boolean(cta.label) !== Boolean(cta.url))) return "Each hero CTA needs both a label and URL.";
    return null;
  };

  return <div className="space-y-5"><SharedSectionFields draft={editor.draft} setDraft={editor.setDraft} readOnly={props.readOnly} /><fieldset disabled={props.readOnly} className="space-y-4 border-t border-border pt-4"><SourceRecordPicker sourceType="intake" layoutVariant="hero_admissions" scopeType={props.section.scope_type} scopeId={props.section.scope_id} label="Admissions intake" value={sourcePickerValue(props.section, "intake", intake)} onChange={(value) => editor.setDraft((current) => ({ ...current, items: [...current.items.filter((item) => item.item_type !== "reference" || item.source_type !== "intake"), ...(value ? [createReferenceItem("intake", value.sourceId, 1)] : [])] }))} disabled={props.readOnly} /><label className="block space-y-2 text-sm font-medium">Eyebrow<Input value={String(editor.draft.settings.eyebrow ?? "")} onChange={(event) => editor.setDraft((current) => ({ ...current, settings: { ...current.settings, eyebrow: event.target.value } }))} /></label><label className="block space-y-2 text-sm font-medium">Admissions state<Select value={String(editor.draft.settings.admissions_state ?? "open")} onValueChange={(admissions_state) => editor.setDraft((current) => ({ ...current, settings: { ...current.settings, admissions_state } }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ADMISSIONS_STATES.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select></label></fieldset><section aria-label="Hero CTAs" className="space-y-3 border-t border-border pt-4">{ctas.map((cta, index) => <CtaFields key={CTA_SETTING_KEYS[index]} label={`Hero CTA ${index + 1}`} value={{ label: cta.label, url: cta.url, description: "" }} onChange={(value) => updateCta(index, value)} readOnly={props.readOnly} />)}</section><p className="sr-only">Required media roles: {HERO_MEDIA_ROLES.join(", ")}</p><SectionMediaRoles definition={props.definition} mediaLinks={editor.draft.media_links} onMediaLinksChange={(media_links) => editor.setDraft((current) => ({ ...current, media_links }))} readOnly={props.readOnly} /><EditorActions section={props.section} dirty={editor.dirty} isSaving={editor.isSaving} saveError={editor.saveError} readOnly={props.readOnly} onReset={editor.reset} onSave={() => void editor.save(validate)} /></div>;
}
