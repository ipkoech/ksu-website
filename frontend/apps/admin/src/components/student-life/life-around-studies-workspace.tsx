"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle2, Eye, Film, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { toast } from "@ksu/ui";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from "@ksu/ui/components";
import { PageTransition } from "@/lib/animations";
import { usePermissions } from "@/hooks/use-permissions";
import {
  LIFE_AROUND_STUDIES_AUDIENCES,
  LIFE_AROUND_STUDIES_SOURCE_TYPES,
  pageSectionsApi,
  sectionItemsApi,
  type LifeAroundStudiesAudience,
  type LifeAroundStudiesSourceType,
  type PageSection,
  type SectionItem,
  type SectionItemPayload,
} from "@/lib/api/page-cms";

type Draft = SectionItemPayload & { id?: string };

const audienceLabels: Record<LifeAroundStudiesAudience, string> = {
  all: "Everyone",
  prospective: "Prospective students",
  current_student: "Current students",
  visitor_partner: "Visitors and partners",
};

function draftFromItem(item?: SectionItem): Draft {
  return {
    id: item?.id,
    item_type: item?.item_type ?? "text",
    title: item?.title ?? "",
    subtitle: item?.subtitle ?? "",
    body_text: item?.body_text ?? "",
    cta_label: item?.cta_label ?? "",
    cta_url: item?.cta_url ?? "",
    video_provider: item?.video_provider ?? "youtube",
    video_url: item?.video_url ?? "",
    poster_media_id: item?.poster_media_id ?? "",
    transcript: item?.transcript ?? "",
    audience: item?.audience ?? "all",
    source_type: item?.source_type ?? "manual",
    source_id: item?.source_id ?? "",
    is_featured: item?.is_featured ?? false,
    display_order: item?.display_order ?? 0,
    is_enabled: item?.is_enabled ?? true,
  };
}

export function LifeAroundStudiesWorkspace() {
  const { hasAnyPermission } = usePermissions();
  const [section, setSection] = useState<PageSection | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [originalItemIds, setOriginalItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await pageSectionsApi.listAdmin({ page: 1, per_page: 100, page_key: "homepage", scope_type: "university" });
      const found = (response.data ?? []).find((candidate) => candidate.section_key === "campus-life");
      setSection(found ?? null);
      setDrafts((found?.items ?? []).map(draftFromItem));
      setOriginalItemIds((found?.items ?? []).map((item) => item.id));
    } catch {
      setError("Unable to load the Life Around Studies section.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const updateDraft = (index: number, values: Partial<Draft>) => {
    setDrafts((current) => current.map((draft, draftIndex) => draftIndex === index ? { ...draft, ...values } : draft));
  };

  const addDraft = () => setDrafts((current) => [...current, draftFromItem()]);
  const removeDraft = (index: number) => setDrafts((current) => current.filter((_, draftIndex) => draftIndex !== index));

  const save = async () => {
    if (!section) {
      toast.error("The seeded campus-life section was not found. Create it in Page CMS first.");
      return;
    }
    setSaving(true);
    try {
      await Promise.all(drafts.map(async (draft, index) => {
        const payload: SectionItemPayload = {
          ...draft,
          page_section_id: section.id,
          display_order: draft.display_order ?? index,
          title: draft.title || null,
          subtitle: draft.subtitle || null,
          body_text: draft.body_text || null,
          cta_label: draft.cta_label || null,
          cta_url: draft.cta_url || null,
          video_url: draft.video_url || null,
          poster_media_id: draft.poster_media_id || null,
          source_id: draft.source_id || null,
          transcript: draft.transcript || null,
        };
        if (draft.id) await sectionItemsApi.update(draft.id, payload);
        else await sectionItemsApi.create(section.id, payload);
      }));
      const retainedIds = new Set(drafts.flatMap((draft) => draft.id ? [draft.id] : []));
      await Promise.all(originalItemIds.filter((id) => !retainedIds.has(id)).map((id) => sectionItemsApi.disable(id)));
      toast.success("Life Around Studies content saved.");
      await load();
    } catch {
      toast.error("Some items could not be saved. Review the fields and try again.");
    } finally {
      setSaving(false);
    }
  };

  const enabledCount = useMemo(() => drafts.filter((draft) => draft.is_enabled).length, [drafts]);
  const featuredCount = useMemo(() => drafts.filter((draft) => draft.is_featured).length, [drafts]);
  const canManage = hasAnyPermission(["life_around_studies.manage", "homepage.manage", "section_items.manage", "admin:*"]);
  const canReview = hasAnyPermission(["life_around_studies.review", "page_sections.review", "content.review", "admin:*"]);
  const canPublish = hasAnyPermission(["life_around_studies.publish", "homepage.publish", "page_sections.publish", "content.publish", "admin:*"]);

  const runWorkflow = async (action: "submit" | "approve" | "request_changes" | "publish" | "unpublish" | "archive") => {
    if (!section) return;
    try {
      const response = await pageSectionsApi.workflow(section.id, action);
      setSection(response.data ?? section);
      toast.success(`Section ${action.replace(/_/g, " ")} complete.`);
      await load();
    } catch {
      toast.error(`Unable to ${action.replace(/_/g, " ")} this section.`);
    }
  };

  const workflowActions = section ? {
    submit: section.status === "draft" || section.status === "changes_requested",
    approve: section.status === "in_review",
    request_changes: section.status === "in_review",
    publish: section.status === "approved",
    unpublish: section.status === "published",
    archive: !["archived"].includes(section.status),
  } : { submit: false, approve: false, request_changes: false, publish: false, unpublish: false, archive: false };

  return (
    <PageTransition>
      <div className="space-y-6">
        <section className="rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-background p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" /> Editorial workspace
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Life Around Studies</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Curate the homepage preview and connect each story to live clubs, activities, sports, accommodation, arts, governance, or video content.
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <Badge variant="outline"><Eye className="mr-1 size-3.5" /> {enabledCount} enabled</Badge>
              <Badge variant="outline"><Sparkles className="mr-1 size-3.5" /> {featuredCount} featured</Badge>
            </div>
          </div>
        </section>

        {error ? <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</div> : null}
        {loading ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Loading editorial content…</div> : null}
        {!loading && !section ? <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No homepage campus-life section found. Seed or create the campus-life section in Page CMS first.</div> : null}

        {!loading && section ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <div>
                  <CardTitle>{section.title || "Life Around Studies"}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">Homepage section · {section.status.replace(/_/g, " ")}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  {workflowActions.submit && canManage ? <Button size="sm" variant="outline" onClick={() => void runWorkflow("submit")}>Submit for review</Button> : null}
                  {workflowActions.approve && canReview ? <Button size="sm" onClick={() => void runWorkflow("approve")}><CheckCircle2 data-icon="inline-start" /> Approve</Button> : null}
                  {workflowActions.request_changes && canReview ? <Button size="sm" variant="outline" onClick={() => void runWorkflow("request_changes")}>Request changes</Button> : null}
                  {workflowActions.publish && canPublish ? <Button size="sm" onClick={() => void runWorkflow("publish")}>Publish</Button> : null}
                  {workflowActions.unpublish && canPublish ? <Button size="sm" variant="outline" onClick={() => void runWorkflow("unpublish")}>Unpublish</Button> : null}
                  {workflowActions.archive && canManage ? <Button size="sm" variant="ghost" onClick={() => void runWorkflow("archive")}>Archive</Button> : null}
                  {canManage ? <Button onClick={addDraft} variant="outline"><Plus data-icon="inline-start" /> Add item</Button> : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                {drafts.length === 0 ? <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Add the first editorial item.</p> : null}
                {drafts.map((draft, index) => (
                  <article key={draft.id ?? `new-${index}`} className="rounded-xl border bg-muted/10 p-4">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-medium"><span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">{index + 1}</span>{draft.title || "Untitled item"}</div>
                      <Button variant="ghost" size="icon-sm" onClick={() => removeDraft(index)} aria-label="Remove item"><Trash2 className="size-4 text-destructive" /></Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-1.5 text-sm font-medium">Title<Input value={draft.title ?? ""} onChange={(event) => updateDraft(index, { title: event.target.value })} placeholder="Student clubs, sports and recreation" /></label>
                      <label className="space-y-1.5 text-sm font-medium">Subtitle<Input value={draft.subtitle ?? ""} onChange={(event) => updateDraft(index, { subtitle: event.target.value })} placeholder="A short editorial label" /></label>
                      <label className="space-y-1.5 text-sm font-medium md:col-span-2">Description<Textarea rows={3} value={draft.body_text ?? ""} onChange={(event) => updateDraft(index, { body_text: event.target.value })} placeholder="What should this audience understand?" /></label>
                      <label className="space-y-1.5 text-sm font-medium">Audience<select className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={draft.audience ?? "all"} onChange={(event) => updateDraft(index, { audience: event.target.value as LifeAroundStudiesAudience })}>{LIFE_AROUND_STUDIES_AUDIENCES.map((value) => <option key={value} value={value}>{audienceLabels[value]}</option>)}</select></label>
                      <label className="space-y-1.5 text-sm font-medium">Live source type<select className="flex h-10 w-full rounded-md border bg-background px-3 text-sm" value={draft.source_type ?? "manual"} onChange={(event) => updateDraft(index, { source_type: event.target.value as LifeAroundStudiesSourceType })}>{LIFE_AROUND_STUDIES_SOURCE_TYPES.map((value) => <option key={value} value={value}>{value.replace(/_/g, " ")}</option>)}</select></label>
                      <label className="space-y-1.5 text-sm font-medium">Source record ID<Input value={draft.source_id ?? ""} onChange={(event) => updateDraft(index, { source_id: event.target.value })} placeholder="UUID of a club, activity, sport, or story" /></label>
                      <label className="space-y-1.5 text-sm font-medium">Display order<Input type="number" value={draft.display_order ?? 0} onChange={(event) => updateDraft(index, { display_order: Number(event.target.value) })} /></label>
                      <label className="space-y-1.5 text-sm font-medium">CTA label<Input value={draft.cta_label ?? ""} onChange={(event) => updateDraft(index, { cta_label: event.target.value })} placeholder="Explore student life" /></label>
                      <label className="space-y-1.5 text-sm font-medium">CTA URL<Input value={draft.cta_url ?? ""} onChange={(event) => updateDraft(index, { cta_url: event.target.value })} placeholder="/campus-life/clubs" /></label>
                      <label className="space-y-1.5 text-sm font-medium">Poster media ID<Input value={draft.poster_media_id ?? ""} onChange={(event) => updateDraft(index, { poster_media_id: event.target.value })} placeholder="Optional media UUID" /></label>
                      <label className="space-y-1.5 text-sm font-medium">Video URL<Input value={draft.video_url ?? ""} onChange={(event) => updateDraft(index, { video_url: event.target.value })} placeholder="https://youtube.com/watch?v=…" /></label>
                      <label className="space-y-1.5 text-sm font-medium md:col-span-2">Video transcript<Textarea rows={3} value={draft.transcript ?? ""} onChange={(event) => updateDraft(index, { transcript: event.target.value })} placeholder="Accessible transcript for embedded video" /></label>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-5 text-sm">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(draft.is_featured)} onChange={(event) => updateDraft(index, { is_featured: event.target.checked })} /> Featured on homepage</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={draft.is_enabled !== false} onChange={(event) => updateDraft(index, { is_enabled: event.target.checked })} /> Visible</label>
                      {draft.video_url ? <span className="inline-flex items-center gap-1 text-muted-foreground"><Film className="size-4" /> Video attached</span> : null}
                    </div>
                  </article>
                ))}
              </CardContent>
            </Card>
            <div className="flex justify-end">
              {canManage ? <Button size="lg" onClick={() => void save()} disabled={saving}><Save data-icon="inline-start" /> {saving ? "Saving…" : "Save Life Around Studies"}</Button> : <p className="text-sm text-muted-foreground">You have view-only access to this workspace.</p>}
            </div>
          </>
        ) : null}
      </div>
    </PageTransition>
  );
}
