"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button, Input } from "@ksu/ui/components";
import { SourceRecordPicker } from "@/components/page-cms/source-record-picker";
import { EditorActions, SectionMediaRoles, SharedSectionFields, createReferenceItem, moveRow, sourcePickerValue, useTypedSectionEditor, type SectionEditorProps, type TypedSectionDraft } from "./shared-section-fields";

const PARTNERSHIP_SETTING_KEYS = ["pillars", "opportunities"] as const;
type RepeatableRow = { label: string; description: string; url: string; order: number };

function rows(value: unknown): RepeatableRow[] {
  return Array.isArray(value) ? value.map((row, index) => {
    const source = row && typeof row === "object" ? row as Record<string, unknown> : {};
    return { label: String(source.label ?? ""), description: String(source.description ?? ""), url: String(source.url ?? ""), order: Number(source.order ?? index + 1) };
  }) : [];
}

function RepeatableRows({ name, values, onChange, readOnly }: { name: "pillar" | "opportunity"; values: RepeatableRow[]; onChange: (value: RepeatableRow[]) => void; readOnly?: boolean }) {
  const update = (index: number, key: keyof RepeatableRow, value: string) => onChange(values.map((row, rowIndex) => rowIndex === index ? { ...row, [key]: key === "order" ? Number(value || 0) : value } : row));
  return <section aria-label={`${name}s`} className="space-y-3"><div className="flex items-center justify-between"><h3 className="text-sm font-semibold">{name === "pillar" ? "Pillars" : "Opportunities"}</h3><Button type="button" variant="outline" size="sm" disabled={readOnly} onClick={() => onChange([...values, { label: "", description: "", url: "", order: values.length + 1 }])}><Plus />Add {name}</Button></div>{values.map((row, index) => <div key={`${name}-${index}`} className="grid gap-3 border-b border-border pb-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_6rem_auto]"><label className="space-y-2 text-sm font-medium">Label<Input value={row.label} disabled={readOnly} onChange={(event) => update(index, "label", event.target.value)} /></label><label className="space-y-2 text-sm font-medium">Description<Input value={row.description} disabled={readOnly} onChange={(event) => update(index, "description", event.target.value)} /></label><label className="space-y-2 text-sm font-medium">Link<Input value={row.url} disabled={readOnly} placeholder="https:// or /path" onChange={(event) => update(index, "url", event.target.value)} /></label><label className="space-y-2 text-sm font-medium">Order<Input type="number" value={row.order} disabled={readOnly} onChange={(event) => update(index, "order", event.target.value)} /></label><div className="flex items-end gap-1"><Button type="button" variant="ghost" size="icon" aria-label={`Move ${name} up`} disabled={readOnly || index === 0} onClick={() => onChange(moveRow(values, index, -1))}><ArrowUp /></Button><Button type="button" variant="ghost" size="icon" aria-label={`Move ${name} down`} disabled={readOnly || index === values.length - 1} onClick={() => onChange(moveRow(values, index, 1))}><ArrowDown /></Button><Button type="button" variant="ghost" size="icon" aria-label={`Remove ${name}`} disabled={readOnly} onClick={() => onChange(values.filter((_, rowIndex) => rowIndex !== index))}><Trash2 /></Button></div></div>)}</section>;
}

export function PartnershipEditor(props: SectionEditorProps) {
  const editor = useTypedSectionEditor({ ...props, ownedSettingKeys: PARTNERSHIP_SETTING_KEYS });
  const partner = editor.draft.items.find((item) => item.item_type === "reference" && item.source_type === "research_partner");
  const setRows = (key: "pillars" | "opportunities", value: RepeatableRow[]) => editor.setDraft((current) => ({ ...current, settings: { ...current.settings, [key]: value.map((row, index) => ({ ...row, order: index + 1 })) } }));
  const updateCta = (key: "cta_label" | "cta_url", value: string) => editor.setDraft((current) => ({
    ...current,
    items: current.items.map((item) => item.item_type === "reference" && item.source_type === "research_partner"
      ? { ...item, editorial_overrides: { ...(item.editorial_overrides ?? {}), [key]: value || null } }
      : item),
  }));
  const validate = (draft: TypedSectionDraft) => {
    if (!draft.items.some((item) => item.item_type === "reference" && item.source_type === "research_partner")) return "Select a research partner.";
    const invalid = [...rows(draft.settings.pillars), ...rows(draft.settings.opportunities)].some((row) => !row.label.trim() || (row.url && !/^(https?:\/\/|\/)/.test(row.url)));
    return invalid ? "Repeatable rows need a label and valid optional link." : null;
  };
  return <div className="space-y-5"><SharedSectionFields draft={editor.draft} setDraft={editor.setDraft} readOnly={props.readOnly} /><fieldset disabled={props.readOnly} className="space-y-4 border-t border-border pt-4"><SourceRecordPicker sourceType="research_partner" layoutVariant="featured_partnership" scopeType={props.section.scope_type} scopeId={props.section.scope_id} label="Research partner" value={sourcePickerValue(props.section, "research_partner", partner)} onChange={(value) => editor.setDraft((current) => ({ ...current, items: [...current.items.filter((item) => item.item_type !== "reference" || item.source_type !== "research_partner"), ...(value ? [createReferenceItem("research_partner", value.sourceId, 10)] : [])] }))} disabled={props.readOnly} /><div className="grid gap-4 md:grid-cols-2"><label className="space-y-2 text-sm font-medium">CTA label<Input value={String(partner?.editorial_overrides?.cta_label ?? "")} disabled={props.readOnly || !partner} onChange={(event) => updateCta("cta_label", event.target.value)} /></label><label className="space-y-2 text-sm font-medium">CTA URL<Input value={String(partner?.editorial_overrides?.cta_url ?? "")} disabled={props.readOnly || !partner} placeholder="https:// or /path" onChange={(event) => updateCta("cta_url", event.target.value)} /></label></div></fieldset><div className="grid gap-5 border-t border-border pt-4 xl:grid-cols-2"><RepeatableRows name="pillar" values={rows(editor.draft.settings.pillars)} onChange={(value) => setRows("pillars", value)} readOnly={props.readOnly} /><RepeatableRows name="opportunity" values={rows(editor.draft.settings.opportunities)} onChange={(value) => setRows("opportunities", value)} readOnly={props.readOnly} /></div><SectionMediaRoles definition={props.definition} mediaLinks={editor.draft.media_links} onMediaLinksChange={(media_links) => editor.setDraft((current) => ({ ...current, media_links }))} readOnly={props.readOnly} /><EditorActions section={props.section} dirty={editor.dirty} isSaving={editor.isSaving} saveError={editor.saveError} readOnly={props.readOnly} onReset={editor.reset} onSave={() => void editor.save(validate)} /></div>;
}
