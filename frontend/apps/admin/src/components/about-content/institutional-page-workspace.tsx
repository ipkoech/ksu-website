"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, ExternalLink, FilePlus2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Alert, AlertDescription, AlertTitle, Badge, Button, Card, CardContent, CardDescription,
  CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, Input, Select, SelectContent, SelectItem, SelectTrigger,
  SelectValue, Switch, Textarea,
} from "@ksu/ui/components";
import { MediaPicker } from "@/components/media";
import { usePermissions } from "@/hooks/use-permissions";
import {
  institutionalPagesApi,
  type InstitutionalItemPayload,
  type InstitutionalPage,
  type InstitutionalPageItem,
  type InstitutionalPagePayload,
  type InstitutionalPageSection,
  type InstitutionalSectionPayload,
  type InstitutionalSectionTheme,
  type InstitutionalSectionType,
} from "@/lib/api/about-content";
import { AboutWorkflowActions } from "./about-workflow-actions";

const SECTION_TYPES: Array<{ value: InstitutionalSectionType; label: string }> = [
  { value: "narrative", label: "Narrative" },
  { value: "commitments", label: "Commitments" },
  { value: "process", label: "Process / journey" },
  { value: "priorities", label: "Priorities" },
  { value: "outcomes", label: "Outcomes" },
  { value: "quote", label: "Quote" },
  { value: "document_collection", label: "Document collection" },
  { value: "related_links", label: "Related links" },
  { value: "governance_links", label: "Governance links" },
  { value: "institutional_profile", label: "Institutional profile" },
];
const THEMES: InstitutionalSectionTheme[] = ["light", "ivory", "blue", "green"];

function nullable(value: unknown) {
  const clean = String(value ?? "").trim();
  return clean || null;
}

function pageDefaults(page?: InstitutionalPage | null): InstitutionalPagePayload {
  return {
    eyebrow: page?.eyebrow ?? "", title: page?.title ?? "", introduction: page?.introduction ?? "",
    hero_media_id: page?.hero_media_id ?? "", mobile_hero_media_id: page?.mobile_hero_media_id ?? "",
    hero_alt_text: page?.hero_alt_text ?? "", primary_document_id: page?.primary_document_id ?? "",
    reporting_period_label: page?.reporting_period_label ?? "", effective_date: page?.effective_date ?? "",
    review_date: page?.review_date ?? "", seo_title: page?.seo_title ?? "",
    seo_description: page?.seo_description ?? "", is_enabled: page?.is_enabled ?? true,
  };
}

export function InstitutionalPageWorkspace({ slug }: { slug: "about" | "service-charter" | "strategic-plan" }) {
  const client = useQueryClient();
  const { hasAnyPermission } = usePermissions();
  const canManage = hasAnyPermission(["about.manage", "admin:*"]);
  const [pageValues, setPageValues] = useState<InstitutionalPagePayload>({});
  const [sectionEditor, setSectionEditor] = useState<InstitutionalPageSection | "new" | null>(null);
  const [itemEditor, setItemEditor] = useState<{ section: InstitutionalPageSection; item: InstitutionalPageItem | "new" } | null>(null);
  const pageQuery = useQuery({
    queryKey: ["institutional-page", slug],
    queryFn: () => institutionalPagesApi.getBySlug(slug),
  });
  const page = pageQuery.data?.data?.[0] ?? null;
  const sectionsQuery = useQuery({
    queryKey: ["institutional-sections", page?.id],
    queryFn: () => institutionalPagesApi.listSections(page!.id),
    enabled: Boolean(page?.id),
  });
  const sections = useMemo(
    () => [...(sectionsQuery.data?.data ?? [])].sort((a, b) => a.display_order - b.display_order),
    [sectionsQuery.data?.data],
  );

  useEffect(() => setPageValues(pageDefaults(page)), [page]);

  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ["institutional-page", slug] }),
      client.invalidateQueries({ queryKey: ["institutional-sections"] }),
      client.invalidateQueries({ queryKey: ["institutional-items"] }),
      client.invalidateQueries({ queryKey: ["institutional-documents"] }),
    ]);
  };
  const savePage = useMutation({
    mutationFn: () => institutionalPagesApi.update(page!.id, {
      ...pageValues,
      eyebrow: nullable(pageValues.eyebrow), title: nullable(pageValues.title) ?? "",
      introduction: nullable(pageValues.introduction) ?? "", hero_media_id: nullable(pageValues.hero_media_id),
      mobile_hero_media_id: nullable(pageValues.mobile_hero_media_id), hero_alt_text: nullable(pageValues.hero_alt_text),
      primary_document_id: nullable(pageValues.primary_document_id), reporting_period_label: nullable(pageValues.reporting_period_label),
      effective_date: nullable(pageValues.effective_date), review_date: nullable(pageValues.review_date),
      seo_title: nullable(pageValues.seo_title), seo_description: nullable(pageValues.seo_description),
    }),
    onSuccess: async () => { toast.success("Institutional page saved"); await refresh(); },
    onError: () => toast.error("Check the page fields and media accessibility details"),
  });
  const moveSection = useMutation({
    mutationFn: (ordered: InstitutionalPageSection[]) => institutionalPagesApi.reorderSections(page!.id, ordered.map((section, index) => ({ id: section.id, display_order: (index + 1) * 10 }))),
    onSuccess: refresh,
    onError: () => toast.error("Sections could not be reordered"),
  });

  const title = slug === "about" ? "About KSU structured content" : slug === "service-charter" ? "University Service Charter" : "Strategic Plan";
  const publicHref = slug === "about" ? "/about" : `/about/${slug}`;

  if (!pageQuery.isLoading && !page) return <Alert><AlertTitle>Institutional page missing</AlertTitle><AlertDescription>Run the scoped About content seeder to create the {title} record.</AlertDescription></Alert>;

  return (
    <section className="space-y-5">
      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><CardTitle>{title}</CardTitle><CardDescription>Manage substantive page copy, media, ordered sections, items and document relationships.</CardDescription></div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline"><Link href={publicHref} target="_blank">Preview <ExternalLink className="size-4" /></Link></Button>
            {page ? <AboutWorkflowActions kind="institutional_page" id={page.id} status={page.workflow_status} onCompleted={refresh} /> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2"><TextField label="Eyebrow" value={pageValues.eyebrow} onChange={(value) => setPageValues((current) => ({ ...current, eyebrow: value }))} /><TextField label="Page title" value={pageValues.title} onChange={(value) => setPageValues((current) => ({ ...current, title: value }))} /></div>
          <AreaField label="Introduction" value={pageValues.introduction} rows={5} onChange={(value) => setPageValues((current) => ({ ...current, introduction: value }))} />
          <div className="grid gap-4 md:grid-cols-3"><TextField label="Reporting period" value={pageValues.reporting_period_label} onChange={(value) => setPageValues((current) => ({ ...current, reporting_period_label: value }))} /><TextField label="Effective date" type="date" value={pageValues.effective_date} onChange={(value) => setPageValues((current) => ({ ...current, effective_date: value }))} /><TextField label="Review date" type="date" value={pageValues.review_date} onChange={(value) => setPageValues((current) => ({ ...current, review_date: value }))} /></div>
          <div className="grid gap-5 lg:grid-cols-2"><MediaPicker value={pageValues.hero_media_id ?? ""} onChange={(value) => setPageValues((current) => ({ ...current, hero_media_id: value }))} mediaType="image" accept="image/*" label="Desktop hero image" /><MediaPicker value={pageValues.mobile_hero_media_id ?? ""} onChange={(value) => setPageValues((current) => ({ ...current, mobile_hero_media_id: value }))} mediaType="image" accept="image/*" label="Mobile hero image" /></div>
          <TextField label="Hero image alt text" value={pageValues.hero_alt_text} onChange={(value) => setPageValues((current) => ({ ...current, hero_alt_text: value }))} />
          <TextField label="Primary document ID" value={pageValues.primary_document_id} onChange={(value) => setPageValues((current) => ({ ...current, primary_document_id: value }))} placeholder="Required before publishing document-led pages" />
          <div className="grid gap-4 md:grid-cols-2"><TextField label="SEO title" value={pageValues.seo_title} onChange={(value) => setPageValues((current) => ({ ...current, seo_title: value }))} /><TextField label="SEO description" value={pageValues.seo_description} onChange={(value) => setPageValues((current) => ({ ...current, seo_description: value }))} /></div>
          <div className="flex items-center justify-between rounded-xl border p-4"><div><p className="text-sm font-medium">Enabled</p><p className="text-xs text-muted-foreground">Include this record in public composition when published.</p></div><Switch checked={pageValues.is_enabled ?? true} onCheckedChange={(checked) => setPageValues((current) => ({ ...current, is_enabled: checked }))} disabled={!canManage} /></div>
          <Button type="button" onClick={() => savePage.mutate()} disabled={!canManage || !page || savePage.isPending}><Save className="size-4" />{savePage.isPending ? "Saving…" : "Save page setup"}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between"><div><CardTitle>Ordered page sections</CardTitle><CardDescription>Controlled section types keep public layouts flexible without arbitrary JSON.</CardDescription></div><Button type="button" onClick={() => setSectionEditor("new")} disabled={!canManage || !page}><Plus className="size-4" />Add section</Button></CardHeader>
        <CardContent className="space-y-4">
          {sections.map((section, index) => <SectionCard key={section.id} section={section} canManage={canManage} onEdit={() => setSectionEditor(section)} onAddItem={() => setItemEditor({ section, item: "new" })} onEditItem={(item) => setItemEditor({ section, item })} onChanged={refresh} onMove={(direction) => { const target = index + direction; if (target < 0 || target >= sections.length) return; const ordered = [...sections]; [ordered[index], ordered[target]] = [ordered[target], ordered[index]]; moveSection.mutate(ordered); }} />)}
          {!sectionsQuery.isLoading && sections.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No sections created.</p> : null}
        </CardContent>
      </Card>

      {page ? <SectionDialog pageId={page.id} record={sectionEditor} onClose={() => setSectionEditor(null)} onSaved={async () => { setSectionEditor(null); await refresh(); }} /> : null}
      <ItemDialog state={itemEditor} onClose={() => setItemEditor(null)} onSaved={async () => { setItemEditor(null); await refresh(); }} />
    </section>
  );
}

function SectionCard({ section, canManage, onEdit, onAddItem, onEditItem, onChanged, onMove }: { section: InstitutionalPageSection; canManage: boolean; onEdit: () => void; onAddItem: () => void; onEditItem: (item: InstitutionalPageItem) => void; onChanged: () => Promise<void>; onMove: (direction: -1 | 1) => void }) {
  const [documentId, setDocumentId] = useState("");
  const itemsQuery = useQuery({ queryKey: ["institutional-items", section.id], queryFn: () => institutionalPagesApi.listItems(section.id) });
  const docsQuery = useQuery({ queryKey: ["institutional-documents", section.id], queryFn: () => institutionalPagesApi.listDocuments(section.id), enabled: section.section_type === "document_collection" });
  const items = [...(itemsQuery.data?.data ?? [])].sort((a, b) => a.display_order - b.display_order);
  const removeSection = useMutation({ mutationFn: () => institutionalPagesApi.deleteSection(section.id), onSuccess: onChanged, onError: () => toast.error("Published sections must be unpublished before deletion") });
  const removeItem = useMutation({ mutationFn: (id: string) => institutionalPagesApi.deleteItem(id), onSuccess: onChanged, onError: () => toast.error("Published items must be unpublished before deletion") });
  const attachDocument = useMutation({ mutationFn: () => institutionalPagesApi.attachDocument(section.id, { document_id: documentId, public_label: null, display_order: ((docsQuery.data?.data?.length ?? 0) + 1) * 10, is_featured: false, is_enabled: true }), onSuccess: async () => { setDocumentId(""); await onChanged(); }, onError: () => toast.error("Document could not be attached") });
  const deleteDocument = useMutation({ mutationFn: (id: string) => institutionalPagesApi.deleteDocument(id), onSuccess: onChanged });

  return <article className="rounded-2xl border bg-background p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{section.heading}</h3><Badge variant="secondary">{section.section_type.replace(/_/g, " ")}</Badge><Badge variant="outline">{section.theme}</Badge><Badge variant={section.workflow_status === "published" ? "default" : "outline"}>{section.workflow_status.replace(/_/g, " ")}</Badge></div><p className="mt-2 text-sm leading-6 text-muted-foreground">{section.summary || section.body || "No section summary supplied."}</p></div>{canManage ? <div className="flex gap-1"><Button size="icon" variant="ghost" aria-label="Move section up" onClick={() => onMove(-1)}><ArrowUp className="size-4" /></Button><Button size="icon" variant="ghost" aria-label="Move section down" onClick={() => onMove(1)}><ArrowDown className="size-4" /></Button><Button size="icon" variant="outline" aria-label="Edit section" onClick={onEdit}><Pencil className="size-4" /></Button><Button size="icon" variant="outline" aria-label="Delete section" onClick={() => removeSection.mutate()} disabled={section.workflow_status === "published"}><Trash2 className="size-4" /></Button></div> : null}</div><div className="mt-3"><AboutWorkflowActions kind="institutional_section" id={section.id} status={section.workflow_status} compact onCompleted={onChanged} /></div>
    <div className="mt-4 space-y-2 border-t pt-4">{items.map((item) => <div key={item.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/35 p-3"><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold">{item.title}</p><Badge variant="outline">{item.workflow_status.replace(/_/g, " ")}</Badge></div><p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p><div className="mt-2"><AboutWorkflowActions kind="institutional_item" id={item.id} status={item.workflow_status} compact onCompleted={onChanged} /></div></div>{canManage ? <div className="flex gap-1"><Button size="icon" variant="ghost" aria-label={`Edit ${item.title}`} onClick={() => onEditItem(item)}><Pencil className="size-4" /></Button><Button size="icon" variant="ghost" aria-label={`Delete ${item.title}`} onClick={() => removeItem.mutate(item.id)} disabled={item.workflow_status === "published"}><Trash2 className="size-4" /></Button></div> : null}</div>)}<Button type="button" size="sm" variant="outline" onClick={onAddItem} disabled={!canManage}><Plus className="size-4" />Add item</Button></div>
    {section.section_type === "document_collection" ? <div className="mt-4 space-y-3 border-t pt-4"><p className="text-sm font-semibold">Attached documents</p>{(docsQuery.data?.data ?? []).map((document) => <div key={document.id} className="flex items-center justify-between rounded-lg border p-2 text-xs"><span>{document.public_label || document.document_id}</span><Button size="icon" variant="ghost" aria-label="Remove document" onClick={() => deleteDocument.mutate(document.id)}><Trash2 className="size-4" /></Button></div>)}<div className="flex gap-2"><Input value={documentId} onChange={(event) => setDocumentId(event.target.value)} placeholder="Document UUID" /><Button type="button" variant="outline" onClick={() => attachDocument.mutate()} disabled={!documentId.trim()}><FilePlus2 className="size-4" />Attach</Button></div></div> : null}
  </article>;
}

function SectionDialog({ pageId, record, onClose, onSaved }: { pageId: string; record: InstitutionalPageSection | "new" | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const editing = record && record !== "new" ? record : null;
  const [values, setValues] = useState<Partial<InstitutionalSectionPayload>>({});
  useEffect(() => { if (record) setValues({ institutional_page_id: pageId, slug: editing?.slug ?? "", section_type: editing?.section_type ?? "narrative", eyebrow: editing?.eyebrow ?? "", heading: editing?.heading ?? "", summary: editing?.summary ?? "", body: editing?.body ?? "", layout_variant: editing?.layout_variant ?? "default", theme: editing?.theme ?? "light", primary_media_id: editing?.primary_media_id ?? "", media_alt_text: editing?.media_alt_text ?? "", video_url: editing?.video_url ?? "", display_order: editing?.display_order ?? 100, is_enabled: editing?.is_enabled ?? true }); }, [editing, pageId, record]);
  const mutation = useMutation({ mutationFn: () => { const payload: InstitutionalSectionPayload = { institutional_page_id: pageId, slug: String(values.slug ?? "").trim(), section_type: values.section_type ?? "narrative", eyebrow: nullable(values.eyebrow), heading: String(values.heading ?? "").trim(), summary: nullable(values.summary), body: nullable(values.body), layout_variant: String(values.layout_variant ?? "default"), theme: values.theme ?? "light", primary_media_id: nullable(values.primary_media_id), media_alt_text: nullable(values.media_alt_text), video_url: nullable(values.video_url), display_order: Number(values.display_order ?? 100), is_enabled: values.is_enabled ?? true }; if (editing) { const { institutional_page_id: _page, slug: _slug, section_type: _type, ...update } = payload; return institutionalPagesApi.updateSection(editing.id, update); } return institutionalPagesApi.createSection(pageId, payload); }, onSuccess: onSaved, onError: () => toast.error("Section could not be saved") });
  return <Dialog open={Boolean(record)} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{editing ? "Edit section" : "Add section"}</DialogTitle><DialogDescription>Choose a controlled content and layout contract for the public renderer.</DialogDescription></DialogHeader><div className="grid gap-4 sm:grid-cols-2"><TextField label="Slug" value={values.slug} disabled={Boolean(editing)} onChange={(value) => setValues((current) => ({ ...current, slug: value }))} /><SelectField label="Section type" value={values.section_type ?? "narrative"} options={SECTION_TYPES} disabled={Boolean(editing)} onChange={(value) => setValues((current) => ({ ...current, section_type: value as InstitutionalSectionType }))} /></div><TextField label="Eyebrow" value={values.eyebrow} onChange={(value) => setValues((current) => ({ ...current, eyebrow: value }))} /><TextField label="Heading" value={values.heading} onChange={(value) => setValues((current) => ({ ...current, heading: value }))} /><AreaField label="Summary" value={values.summary} rows={3} onChange={(value) => setValues((current) => ({ ...current, summary: value }))} /><AreaField label="Body" value={values.body} rows={5} onChange={(value) => setValues((current) => ({ ...current, body: value }))} /><div className="grid gap-4 sm:grid-cols-3"><SelectField label="Theme" value={values.theme ?? "light"} options={THEMES.map((value) => ({ value, label: value }))} onChange={(value) => setValues((current) => ({ ...current, theme: value as InstitutionalSectionTheme }))} /><TextField label="Layout variant" value={values.layout_variant} onChange={(value) => setValues((current) => ({ ...current, layout_variant: value }))} /><TextField label="Display order" type="number" value={values.display_order} onChange={(value) => setValues((current) => ({ ...current, display_order: Number(value) }))} /></div><MediaPicker value={values.primary_media_id ?? ""} onChange={(value) => setValues((current) => ({ ...current, primary_media_id: value }))} mediaType="image" accept="image/*" label="Section image" /><TextField label="Media alt text" value={values.media_alt_text} onChange={(value) => setValues((current) => ({ ...current, media_alt_text: value }))} /><TextField label="Video URL" value={values.video_url} onChange={(value) => setValues((current) => ({ ...current, video_url: value }))} /><ToggleField label="Enabled" checked={values.is_enabled ?? true} onChange={(checked) => setValues((current) => ({ ...current, is_enabled: checked }))} /><DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : "Save section"}</Button></DialogFooter></DialogContent></Dialog>;
}

function ItemDialog({ state, onClose, onSaved }: { state: { section: InstitutionalPageSection; item: InstitutionalPageItem | "new" } | null; onClose: () => void; onSaved: () => Promise<void> }) {
  const editing = state?.item && state.item !== "new" ? state.item : null;
  const [values, setValues] = useState<Partial<InstitutionalItemPayload>>({});
  useEffect(() => { if (state) setValues({ section_id: state.section.id, title: editing?.title ?? "", description: editing?.description ?? "", supporting_label: editing?.supporting_label ?? "", supporting_value: editing?.supporting_value ?? "", icon_key: editing?.icon_key ?? "", image_id: editing?.image_id ?? "", image_alt_text: editing?.image_alt_text ?? "", link_label: editing?.link_label ?? "", link_url: editing?.link_url ?? "", display_order: editing?.display_order ?? 100, is_enabled: editing?.is_enabled ?? true }); }, [editing, state]);
  const mutation = useMutation({ mutationFn: () => { const payload: InstitutionalItemPayload = { section_id: state!.section.id, title: String(values.title ?? "").trim(), description: nullable(values.description), supporting_label: nullable(values.supporting_label), supporting_value: nullable(values.supporting_value), icon_key: nullable(values.icon_key), image_id: nullable(values.image_id), image_alt_text: nullable(values.image_alt_text), link_label: nullable(values.link_label), link_url: nullable(values.link_url), display_order: Number(values.display_order ?? 100), is_enabled: values.is_enabled ?? true }; if (editing) { const { section_id: _section, ...update } = payload; return institutionalPagesApi.updateItem(editing.id, update); } return institutionalPagesApi.createItem(state!.section.id, payload); }, onSuccess: onSaved, onError: () => toast.error("Section item could not be saved") });
  return <Dialog open={Boolean(state)} onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>{editing ? "Edit item" : "Add item"}</DialogTitle><DialogDescription>Maintain concise content used by the selected structured section.</DialogDescription></DialogHeader><TextField label="Title" value={values.title} onChange={(value) => setValues((current) => ({ ...current, title: value }))} /><AreaField label="Description" value={values.description} rows={4} onChange={(value) => setValues((current) => ({ ...current, description: value }))} /><div className="grid gap-4 sm:grid-cols-3"><TextField label="Supporting label" value={values.supporting_label} onChange={(value) => setValues((current) => ({ ...current, supporting_label: value }))} /><TextField label="Supporting value" value={values.supporting_value} onChange={(value) => setValues((current) => ({ ...current, supporting_value: value }))} /><TextField label="Icon key" value={values.icon_key} onChange={(value) => setValues((current) => ({ ...current, icon_key: value }))} /></div><MediaPicker value={values.image_id ?? ""} onChange={(value) => setValues((current) => ({ ...current, image_id: value }))} mediaType="image" accept="image/*" label="Item image" /><TextField label="Image alt text" value={values.image_alt_text} onChange={(value) => setValues((current) => ({ ...current, image_alt_text: value }))} /><div className="grid gap-4 sm:grid-cols-2"><TextField label="Link label" value={values.link_label} onChange={(value) => setValues((current) => ({ ...current, link_label: value }))} /><TextField label="Link URL" value={values.link_url} onChange={(value) => setValues((current) => ({ ...current, link_url: value }))} /></div><TextField label="Display order" type="number" value={values.display_order} onChange={(value) => setValues((current) => ({ ...current, display_order: Number(value) }))} /><ToggleField label="Enabled" checked={values.is_enabled ?? true} onChange={(checked) => setValues((current) => ({ ...current, is_enabled: checked }))} /><DialogFooter><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? "Saving…" : "Save item"}</Button></DialogFooter></DialogContent></Dialog>;
}

function TextField({ label, value, onChange, placeholder, type = "text", disabled = false }: { label: string; value: unknown; onChange: (value: string) => void; placeholder?: string; type?: string; disabled?: boolean }) { return <label className="space-y-2 text-sm font-medium"><span>{label}</span><Input type={type} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} /></label>; }
function AreaField({ label, value, rows, onChange }: { label: string; value: unknown; rows: number; onChange: (value: string) => void }) { return <label className="space-y-2 text-sm font-medium"><span>{label}</span><Textarea rows={rows} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} /></label>; }
function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) { return <label className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium"><span>{label}</span><Switch checked={checked} onCheckedChange={onChange} /></label>; }
function SelectField({ label, value, options, onChange, disabled = false }: { label: string; value: string; options: Array<{ value: string; label: string }>; onChange: (value: string) => void; disabled?: boolean }) { return <label className="space-y-2 text-sm font-medium"><span>{label}</span><Select value={value} onValueChange={onChange} disabled={disabled}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></label>; }
