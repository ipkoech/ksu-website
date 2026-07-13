"use client";

import * as React from "react";
import { useMediaLinks, useUpdateMedia } from "@ksu/api-client";
import { Alert, AlertDescription, Button, Input, Switch, Textarea } from "@ksu/ui/components";
import { AttachmentManager, type AttachmentRoleOption } from "@/components/media/attachment-manager";
import type { SourceRecordPickerValue } from "@/components/page-cms/source-record-picker";
import type { PageCmsSectionDefinition, PageSection, PageSectionPayload, SectionItemPayload } from "@/lib/api/page-cms";
import type { PageCmsSourceType, SectionItem } from "@/lib/api/page-cms";

export type SectionSettings = Record<string, unknown>;

export type TypedSectionDraft = {
  title: string;
  subtitle: string;
  description: string;
  is_enabled: boolean;
  valid_from: string;
  valid_to: string;
  settings: SectionSettings;
  items: SectionItemPayload[];
};

export type SectionEditorProps = {
  section: PageSection;
  definition: PageCmsSectionDefinition;
  onSave: (payload: PageSectionPayload) => void | Promise<void>;
  onDirtyChange: (dirty: boolean) => void;
  readOnly?: boolean;
};

export function mergeSectionSettings(existing: SectionSettings | null | undefined, ownedKeys: readonly string[], nextSettings: SectionSettings): SectionSettings {
  const preserved = { ...(existing ?? {}) };
  for (const key of ownedKeys) delete preserved[key];
  return { ...preserved, ...nextSettings };
}

export function toDateTimeInput(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date).replace(" ", "T");
}

export function fromDateTimeInput(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  const date = new Date(`${trimmed}Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function itemLimitError(count: number, minimum: number, maximum: number, label: string): string | null {
  if (count < minimum) return `${label} requires at least ${minimum} items.`;
  if (count > maximum) return `${label} supports no more than ${maximum} items.`;
  return null;
}

export function sourcePickerValue(section: PageSection, sourceType: PageCmsSourceType, item?: SectionItemPayload | SectionItem): SourceRecordPickerValue | null {
  if (!item?.source_id || item.source_type !== sourceType) return null;
  return {
    sourceType,
    sourceId: item.source_id,
    summary: { id: item.source_id, source_type: sourceType, label: `${sourceType.replace(/_/g, " ")} selected`, status: "selected", metadata: {}, selectable: true },
    selectionContext: { sourceType, layoutVariant: section.layout_variant, scopeType: section.scope_type, scopeId: section.scope_id ?? null },
  };
}

export function createReferenceItem(sourceType: PageCmsSourceType, sourceId: string, displayOrder: number): SectionItemPayload {
  return { item_type: "reference", source_type: sourceType, source_id: sourceId, display_order: displayOrder, is_enabled: true };
}

export function moveRow<T>(rows: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (nextIndex < 0 || nextIndex >= rows.length) return rows;
  const next = [...rows];
  [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
  return next;
}

function draftFromSection(section: PageSection): TypedSectionDraft {
  return {
    title: section.title ?? "",
    subtitle: section.subtitle ?? "",
    description: section.description ?? "",
    is_enabled: section.is_enabled,
    valid_from: toDateTimeInput(section.valid_from),
    valid_to: toDateTimeInput(section.valid_to),
    settings: { ...(section.settings ?? {}) },
    items: section.items.map((item) => ({
      item_type: item.item_type,
      title: item.title ?? null,
      subtitle: item.subtitle ?? null,
      body_text: item.body_text ?? null,
      content: item.content ?? null,
      cta_label: item.cta_label ?? null,
      cta_url: item.cta_url ?? null,
      cta_description: item.cta_description ?? null,
      media_caption: item.media_caption ?? null,
      media_alt_text: item.media_alt_text ?? null,
      source_type: item.source_type ?? null,
      source_id: item.source_id ?? null,
      editorial_overrides: item.editorial_overrides ?? null,
      display_order: item.display_order,
      is_enabled: item.is_enabled,
    })),
  };
}

function draftSignature(draft: TypedSectionDraft) {
  return JSON.stringify(draft);
}

export function validateSharedDraft(draft: TypedSectionDraft, definition: PageCmsSectionDefinition) {
  if (definition.required_fields.includes("title") && !draft.title.trim()) return "Title is required.";
  const startsAt = fromDateTimeInput(draft.valid_from);
  const endsAt = fromDateTimeInput(draft.valid_to);
  if (draft.valid_from && !startsAt) return "Valid from must be a valid UTC date and time.";
  if (draft.valid_to && !endsAt) return "Valid to must be a valid UTC date and time.";
  if (startsAt && endsAt && endsAt < startsAt) return "Valid to must be after valid from.";
  return null;
}

export function useTypedSectionEditor({ section, definition, onSave, onDirtyChange, ownedSettingKeys }: SectionEditorProps & { ownedSettingKeys: readonly string[] }) {
  const initialRef = React.useRef(draftFromSection(section));
  const [draft, setDraft] = React.useState<TypedSectionDraft>(initialRef.current);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const initialSignature = draftSignature(initialRef.current);
  const dirty = draftSignature(draft) !== initialSignature;

  React.useEffect(() => {
    const next = draftFromSection(section);
    initialRef.current = next;
    setDraft(next);
    setSaveError(null);
  }, [section]);

  React.useEffect(() => {
    onDirtyChange(dirty);
    return () => onDirtyChange(false);
  }, [dirty, onDirtyChange]);

  const reset = React.useCallback(() => {
    setDraft(initialRef.current);
    setSaveError(null);
  }, []);

  const save = React.useCallback(async (validate: (next: TypedSectionDraft) => string | null) => {
    const sharedError = validateSharedDraft(draft, definition);
    const error = sharedError ?? validate(draft);
    if (error) {
      setSaveError(error);
      return false;
    }

    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave({
        title: draft.title.trim() || null,
        subtitle: draft.subtitle.trim() || null,
        description: draft.description.trim() || null,
        is_enabled: draft.is_enabled,
        valid_from: fromDateTimeInput(draft.valid_from),
        valid_to: fromDateTimeInput(draft.valid_to),
        settings: mergeSectionSettings(section.settings, ownedSettingKeys, draft.settings),
        items: draft.items,
      });
      initialRef.current = draft;
      return true;
    } catch {
      setSaveError("Changes could not be saved. Your edits are still available to retry.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [definition, draft, onSave, ownedSettingKeys, section.settings]);

  return { draft, setDraft, dirty, isSaving, saveError, reset, save };
}

export function SharedSectionFields({ draft, setDraft, readOnly }: { draft: TypedSectionDraft; setDraft: React.Dispatch<React.SetStateAction<TypedSectionDraft>>; readOnly?: boolean }) {
  const update = (key: "title" | "subtitle" | "description", value: string) => setDraft((current) => ({ ...current, [key]: value }));
  return (
    <fieldset disabled={readOnly} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">Title<Input value={draft.title} onChange={(event) => update("title", event.target.value)} /></label>
        <label className="space-y-2 text-sm font-medium">Subtitle<Input value={draft.subtitle} onChange={(event) => update("subtitle", event.target.value)} /></label>
      </div>
      <label className="block space-y-2 text-sm font-medium">Description<Textarea rows={3} value={draft.description} onChange={(event) => update("description", event.target.value)} /></label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium">Valid from (UTC)<Input type="datetime-local" value={draft.valid_from} onChange={(event) => setDraft((current) => ({ ...current, valid_from: event.target.value }))} /></label>
        <label className="space-y-2 text-sm font-medium">Valid to (UTC)<Input type="datetime-local" value={draft.valid_to} onChange={(event) => setDraft((current) => ({ ...current, valid_to: event.target.value }))} /></label>
      </div>
      <label className="flex min-h-10 items-center gap-3 text-sm font-medium"><Switch checked={draft.is_enabled} onCheckedChange={(is_enabled) => setDraft((current) => ({ ...current, is_enabled }))} />Enabled</label>
    </fieldset>
  );
}

export function CtaFields({ label, value, onChange, readOnly }: { label: string; value: { label?: string; url?: string; description?: string }; onChange: (value: { label: string; url: string; description: string }) => void; readOnly?: boolean }) {
  return (
    <fieldset disabled={readOnly} className="grid gap-3 border-y border-border py-3 md:grid-cols-3">
      <legend className="sr-only">{label}</legend>
      <label className="space-y-2 text-sm font-medium">{label} label<Input value={value.label ?? ""} onChange={(event) => onChange({ label: event.target.value, url: value.url ?? "", description: value.description ?? "" })} /></label>
      <label className="space-y-2 text-sm font-medium">{label} URL<Input value={value.url ?? ""} placeholder="https:// or /path" onChange={(event) => onChange({ label: value.label ?? "", url: event.target.value, description: value.description ?? "" })} /></label>
      <label className="space-y-2 text-sm font-medium">{label} description<Input value={value.description ?? ""} onChange={(event) => onChange({ label: value.label ?? "", url: value.url ?? "", description: event.target.value })} /></label>
    </fieldset>
  );
}

function MediaAltTextControls({ sectionId, readOnly }: { sectionId: string; readOnly?: boolean }) {
  const linksQuery = useMediaLinks({ entity_type: "page_section", entity_id: sectionId, include: "media" }, { enabled: Boolean(sectionId) });
  const updateMedia = useUpdateMedia();
  const links = (linksQuery.data?.data ?? []) as Array<{ id: string; role?: string; media?: { id: string; alt_text?: string | null; title?: string | null } | null }>;

  if (!links.length) return null;
  return <div className="space-y-3">{links.map((link) => {
    const media = link.media;
    if (!media) return null;
    return <label key={link.id} className="block space-y-2 text-sm font-medium">{link.role?.replace(/_/g, " ") ?? "Media"} alt text<Input defaultValue={media.alt_text ?? ""} disabled={readOnly || updateMedia.isPending} onBlur={(event) => { const alt_text = event.target.value.trim() || null; if (alt_text !== (media.alt_text ?? null)) void updateMedia.mutateAsync({ id: media.id, data: { alt_text } }); }} /></label>;
  })}</div>;
}

export function SectionMediaRoles({ section, definition, readOnly }: Pick<SectionEditorProps, "section" | "definition" | "readOnly">) {
  const roles: AttachmentRoleOption[] = Object.entries(definition.media_roles).map(([value, role]) => ({ value, label: role.label, mediaType: role.media_type, accept: role.media_type === "video" ? "video/*" : "image/*", description: role.required ? "Required for this template." : undefined }));
  if (!roles.length) return null;
  return <section aria-label="Section media" className="space-y-3 border-t border-border pt-4"><AttachmentManager entityType="page_section" entityId={section.id} roles={roles} title="Section media" description="Choose media by role. The picker includes a preview; update alternative text below." disabled={readOnly} allowVisibilityChange={false} /><MediaAltTextControls sectionId={section.id} readOnly={readOnly} /></section>;
}

export function EditorActions({ section, dirty, isSaving, saveError, readOnly, onSave, onReset }: { section: PageSection; dirty: boolean; isSaving: boolean; saveError: string | null; readOnly?: boolean; onSave: () => void; onReset: () => void }) {
  return <div className="space-y-3 border-t border-border pt-4">{section.status === "published" ? <Alert><AlertDescription>Published changes reset approval after this save is confirmed.</AlertDescription></Alert> : null}{saveError ? <p role="alert" className="text-sm text-destructive">{saveError}</p> : null}<div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="outline" disabled={readOnly || !dirty || isSaving} onClick={onReset}>Reset</Button><Button type="button" disabled={readOnly || !dirty || isSaving} onClick={onSave}>{isSaving ? "Saving..." : "Save changes"}</Button></div></div>;
}
