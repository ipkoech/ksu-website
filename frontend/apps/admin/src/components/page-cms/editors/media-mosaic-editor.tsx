"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button, Input, Textarea } from "@ksu/ui/components";
import { EditorActions, SectionMediaRoles, SharedSectionFields, itemLimitError, useTypedSectionEditor, type SectionEditorProps, type TypedSectionDraft } from "./shared-section-fields";

export function MediaMosaicEditor(props: SectionEditorProps) {
  const editor = useTypedSectionEditor({ ...props, ownedSettingKeys: [] });
  const notes = editor.draft.items.filter((item) => item.item_type === "media");
  const limitReached = notes.length >= props.definition.max_items;
  const updateNotes = (next: typeof notes) => editor.setDraft((current) => ({ ...current, items: next.map((item, index) => ({ ...item, display_order: (index + 1) * 10 })) }));
  const validate = (draft: TypedSectionDraft) => {
    const mediaItems = draft.items.filter((item) => item.item_type === "media" && item.is_enabled !== false);
    const limitError = itemLimitError(mediaItems.length, props.definition.min_items, props.definition.max_items, "Mosaic images");
    if (limitError) return limitError;
    if (mediaItems.some((item) => !item.media_alt_text?.trim())) return "Each mosaic image needs alt text.";
    return null;
  };

  return <div className="space-y-5"><SharedSectionFields draft={editor.draft} setDraft={editor.setDraft} readOnly={props.readOnly} /><section aria-label="Attachment roles" className="space-y-3 border-t border-border pt-4"><div><h3 className="text-sm font-semibold">Attachment roles</h3><p className="mt-1 text-sm text-muted-foreground">Choose images by the allowed role. Media is staged and linked only when this section is saved.</p></div><SectionMediaRoles definition={props.definition} mediaLinks={editor.draft.media_links} onMediaLinksChange={(media_links) => editor.setDraft((current) => ({ ...current, media_links }))} readOnly={props.readOnly} /></section><section aria-label="Mosaic image descriptions" className="space-y-3 border-t border-border pt-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-sm font-semibold">Image descriptions</h3><p className="mt-1 text-sm text-muted-foreground">Add a description for each staged mosaic image. Attachment roles determine the visible media order.</p></div><Button type="button" variant="outline" size="sm" disabled={props.readOnly || limitReached} onClick={() => updateNotes([...notes, { item_type: "media", title: "", media_alt_text: "", media_caption: "", display_order: (notes.length + 1) * 10, is_enabled: true }])}><Plus />Add image description</Button></div>{limitReached ? <p className="text-sm text-muted-foreground">The definition allows no more than {props.definition.max_items} mosaic images. Remove a description before adding another.</p> : null}{notes.map((note, index) => <div key={note.id ?? index} className="grid gap-3 border-b border-border pb-3 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"><label className="space-y-2 text-sm font-medium">Image label<Input value={note.title ?? ""} disabled={props.readOnly} onChange={(event) => updateNotes(notes.map((row, rowIndex) => rowIndex === index ? { ...row, title: event.target.value } : row))} /></label><label className="space-y-2 text-sm font-medium">Alt text<Textarea rows={2} value={note.media_alt_text ?? ""} disabled={props.readOnly} placeholder="Describe the image for accessibility" onChange={(event) => updateNotes(notes.map((row, rowIndex) => rowIndex === index ? { ...row, media_alt_text: event.target.value } : row))} /></label><Button type="button" variant="ghost" size="icon" aria-label="Remove image description" disabled={props.readOnly || notes.length <= props.definition.min_items} onClick={() => updateNotes(notes.filter((_, rowIndex) => rowIndex !== index))}><Trash2 /></Button></div>)}</section><EditorActions section={props.section} dirty={editor.dirty} isSaving={editor.isSaving} saveError={editor.saveError} readOnly={props.readOnly} onReset={editor.reset} onSave={() => void editor.save(validate)} /></div>;
}
