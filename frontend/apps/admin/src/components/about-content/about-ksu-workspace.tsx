"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, ExternalLink, History, Pencil, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@ksu/ui/components";
import { MediaPicker } from "@/components/media";
import { usePermissions } from "@/hooks/use-permissions";
import { PageTransition } from "@/lib/animations";
import {
  aboutContentApi,
  historyMilestonesApi,
  type AboutPageContent,
  type AboutPageContentPayload,
  type HistoryMilestone,
  type HistoryMilestonePayload,
} from "@/lib/api/about-content";
import { AboutWorkflowActions } from "./about-workflow-actions";

const ABOUT_QUERY_KEY = ["about-content", "page"] as const;
const HISTORY_QUERY_KEY = ["about-content", "history"] as const;

function nullable(value: string | null | undefined) {
  const clean = value?.trim();
  return clean ? clean : null;
}

function aboutDefaults(record?: AboutPageContent | null): Partial<AboutPageContentPayload> {
  return {
    hero_eyebrow: record?.hero_eyebrow ?? "",
    hero_headline: record?.hero_headline ?? "",
    hero_introduction: record?.hero_introduction ?? "",
    identity_heading: record?.identity_heading ?? "",
    identity_narrative: record?.identity_narrative ?? "",
    mandate_introduction: record?.mandate_introduction ?? "",
    video_title: record?.video_title ?? "",
    video_url: record?.video_url ?? "",
    video_transcript_url: record?.video_transcript_url ?? "",
    hero_media_id: record?.hero_media_id ?? "",
    identity_media_id: record?.identity_media_id ?? "",
    video_poster_media_id: record?.video_poster_media_id ?? "",
    old_campus_media_id: record?.old_campus_media_id ?? "",
    modern_campus_media_id: record?.modern_campus_media_id ?? "",
    history_document_id: record?.history_document_id ?? "",
    is_enabled: record?.is_enabled ?? true,
  };
}

function milestoneDefaults(record?: HistoryMilestone | null): Partial<HistoryMilestonePayload> {
  return {
    about_page_content_id: record?.about_page_content_id ?? "",
    slug: record?.slug ?? "",
    year_label: record?.year_label ?? "",
    event_date: record?.event_date ?? "",
    title: record?.title ?? "",
    summary: record?.summary ?? "",
    expanded_body: record?.expanded_body ?? "",
    image_id: record?.image_id ?? "",
    image_alt_text: record?.image_alt_text ?? "",
    source_title: record?.source_title ?? "",
    source_url: record?.source_url ?? "",
    source_document_id: record?.source_document_id ?? "",
    display_order: record?.display_order ?? 100,
    is_featured: record?.is_featured ?? false,
    is_public: record?.is_public ?? true,
    is_enabled: record?.is_enabled ?? true,
  };
}

export function AboutKsuWorkspace() {
  const queryClient = useQueryClient();
  const { hasAnyPermission } = usePermissions();
  const canManage = hasAnyPermission(["about.manage", "admin:*"]);
  const [values, setValues] = useState<Partial<AboutPageContentPayload>>(() => aboutDefaults());
  const [milestoneEditor, setMilestoneEditor] = useState<HistoryMilestone | "new" | null>(null);

  const aboutQuery = useQuery({
    queryKey: ABOUT_QUERY_KEY,
    queryFn: () => aboutContentApi.get(),
  });
  const about = aboutQuery.data?.data ?? null;

  const historyQuery = useQuery({
    queryKey: [...HISTORY_QUERY_KEY, about?.id],
    queryFn: () => historyMilestonesApi.list(about!.id),
    enabled: Boolean(about?.id),
  });
  const milestones = useMemo(
    () => [...(historyQuery.data?.data ?? [])].sort((a, b) => a.display_order - b.display_order),
    [historyQuery.data?.data],
  );

  useEffect(() => {
    if (about) setValues(aboutDefaults(about));
  }, [about]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!about) throw new Error("About content has not been seeded");
      const payload: Partial<AboutPageContentPayload> = {
        ...values,
        hero_eyebrow: nullable(values.hero_eyebrow),
        hero_headline: nullable(values.hero_headline),
        hero_introduction: nullable(values.hero_introduction),
        identity_heading: nullable(values.identity_heading),
        identity_narrative: nullable(values.identity_narrative),
        mandate_introduction: nullable(values.mandate_introduction),
        video_title: nullable(values.video_title),
        video_url: nullable(values.video_url),
        video_transcript_url: nullable(values.video_transcript_url),
        hero_media_id: nullable(values.hero_media_id),
        identity_media_id: nullable(values.identity_media_id),
        video_poster_media_id: nullable(values.video_poster_media_id),
        old_campus_media_id: nullable(values.old_campus_media_id),
        modern_campus_media_id: nullable(values.modern_campus_media_id),
        history_document_id: nullable(values.history_document_id),
      };
      return aboutContentApi.update(about.id, payload);
    },
    onSuccess: async () => {
      toast.success("About KSU page content saved");
      await queryClient.invalidateQueries({ queryKey: ABOUT_QUERY_KEY });
    },
    onError: () => toast.error("About KSU content could not be saved"),
  });

  const refreshAbout = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ABOUT_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: HISTORY_QUERY_KEY }),
    ]);
  };

  const setField = <K extends keyof AboutPageContentPayload>(key: K, value: AboutPageContentPayload[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  return (
    <PageTransition>
      <section className="mb-5 overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_top_left,rgba(5,82,62,0.16),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.88))] p-4 shadow-sm dark:bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.14),transparent_32%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(2,6,23,0.9))]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-background/75 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              <Sparkles className="size-3.5 text-amber-600" />
              Institutional story workspace
            </div>
            <h1 className="mt-2 text-xl font-semibold tracking-tight md:text-2xl">About KSU</h1>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">
              Keep the public About experience concise while maintaining the complete, sourced university journey behind its conditional history panel.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {about ? <WorkflowBadge status={about.workflow_status} /> : null}
            <Button asChild variant="outline">
              <Link href="/about?history=open" target="_blank">
                Public preview <ExternalLink className="size-4" />
              </Link>
            </Button>
            {about ? (
              <AboutWorkflowActions kind="about" id={about.id} status={about.workflow_status} onCompleted={refreshAbout} />
            ) : null}
          </div>
        </div>
      </section>

      {!canManage ? (
        <Alert className="mb-6">
          <AlertTitle>Read-only workspace</AlertTitle>
          <AlertDescription>Your account needs the About content management scope to edit these records.</AlertDescription>
        </Alert>
      ) : null}

      {aboutQuery.isError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>About content unavailable</AlertTitle>
          <AlertDescription>The admin API could not load the About KSU record.</AlertDescription>
        </Alert>
      ) : null}

      {!aboutQuery.isLoading && !about ? (
        <Alert className="mb-6">
          <AlertTitle>Launch content has not been created</AlertTitle>
          <AlertDescription>Run the scoped About seeder before opening this editorial workspace.</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="content" className="space-y-5">
        <TabsList className="h-auto w-full justify-start overflow-x-auto p-1 sm:w-fit">
          <TabsTrigger value="content"><BookOpen className="mr-2 size-4" />Page Content</TabsTrigger>
          <TabsTrigger value="history"><History className="mr-2 size-4" />History Milestones <Badge variant="secondary" className="ml-2">{milestones.length}</Badge></TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-5">
          <AboutContentEditor
            values={values}
            setField={setField}
            canManage={canManage && Boolean(about)}
            isSaving={saveMutation.isPending}
            onSave={() => saveMutation.mutate()}
          />
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle>Our History</CardTitle>
                <CardDescription>Ordered, sourced milestones shown only when visitors open the history experience.</CardDescription>
              </div>
              {canManage && about ? (
                <Button type="button" onClick={() => setMilestoneEditor("new")}><Plus className="size-4" />Add milestone</Button>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3">
              {historyQuery.isLoading ? <StateMessage label="Loading history milestones..." /> : null}
              {historyQuery.isError ? <StateMessage label="History milestones could not be loaded." tone="error" /> : null}
              {!historyQuery.isLoading && milestones.length === 0 ? <StateMessage label="No milestones have been created." /> : null}
              {milestones.map((milestone) => (
                <MilestoneCard
                  key={milestone.id}
                  milestone={milestone}
                  canManage={canManage}
                  onEdit={() => setMilestoneEditor(milestone)}
                  onChanged={refreshAbout}
                />
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {about ? (
        <MilestoneEditorDialog
          aboutId={about.id}
          record={milestoneEditor}
          onOpenChange={(open) => !open && setMilestoneEditor(null)}
          onSaved={async () => {
            setMilestoneEditor(null);
            await refreshAbout();
          }}
        />
      ) : null}
    </PageTransition>
  );
}

function AboutContentEditor({
  values,
  setField,
  canManage,
  isSaving,
  onSave,
}: {
  values: Partial<AboutPageContentPayload>;
  setField: <K extends keyof AboutPageContentPayload>(key: K, value: AboutPageContentPayload[K]) => void;
  canManage: boolean;
  isSaving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(20rem,0.75fr)]">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><CardTitle>Narrative and identity</CardTitle><CardDescription>Public hero, identity, mandate, video and accessibility copy.</CardDescription></div>
          <Button type="button" onClick={onSave} disabled={!canManage || isSaving}><Save className="size-4" />{isSaving ? "Saving..." : "Save content"}</Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Hero eyebrow" value={values.hero_eyebrow} onChange={(value) => setField("hero_eyebrow", value)} />
            <TextField label="Hero headline" value={values.hero_headline} onChange={(value) => setField("hero_headline", value)} />
          </div>
          <AreaField label="Hero introduction" value={values.hero_introduction} rows={7} onChange={(value) => setField("hero_introduction", value)} help="Use two concise paragraphs. History belongs in the milestone drawer." />
          <TextField label="Identity heading" value={values.identity_heading} onChange={(value) => setField("identity_heading", value)} />
          <AreaField label="Identity narrative" value={values.identity_narrative} rows={6} onChange={(value) => setField("identity_narrative", value)} />
          <AreaField label="Mandate introduction" value={values.mandate_introduction} rows={4} onChange={(value) => setField("mandate_introduction", value)} />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Video title" value={values.video_title} onChange={(value) => setField("video_title", value)} />
            <TextField label="Video URL" value={values.video_url} onChange={(value) => setField("video_url", value)} placeholder="https://..." />
          </div>
          <TextField label="Video transcript URL" value={values.video_transcript_url} onChange={(value) => setField("video_transcript_url", value)} placeholder="Required when a video URL is supplied" />
          <div className="flex items-center justify-between rounded-xl border p-4">
            <div><p className="text-sm font-medium">Enabled</p><p className="text-xs text-muted-foreground">Allow this record to participate in public composition.</p></div>
            <Switch checked={values.is_enabled ?? true} onCheckedChange={(checked) => setField("is_enabled", checked)} disabled={!canManage} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Media and documents</CardTitle><CardDescription>Choose accessible images for the curated public experience.</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <MediaPicker value={values.hero_media_id ?? ""} onChange={(value) => setField("hero_media_id", value)} mediaType="image" accept="image/*" label="Hero aerial image" helperText="Large cinematic campus image." />
          <MediaPicker value={values.identity_media_id ?? ""} onChange={(value) => setField("identity_media_id", value)} mediaType="image" accept="image/*" label="Identity campus image" />
          <MediaPicker value={values.video_poster_media_id ?? ""} onChange={(value) => setField("video_poster_media_id", value)} mediaType="image" accept="image/*" label="Video poster image" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <MediaPicker value={values.old_campus_media_id ?? ""} onChange={(value) => setField("old_campus_media_id", value)} mediaType="image" accept="image/*" label="Old campus image" />
            <MediaPicker value={values.modern_campus_media_id ?? ""} onChange={(value) => setField("modern_campus_media_id", value)} mediaType="image" accept="image/*" label="Modern campus image" />
          </div>
          <TextField label="Full history document ID" value={values.history_document_id} onChange={(value) => setField("history_document_id", value)} placeholder="Optional document UUID" />
          <p className="rounded-lg bg-muted/50 p-3 text-xs leading-5 text-muted-foreground">Old and modern campus images must be supplied together. Video content requires a transcript URL before publication.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function MilestoneCard({ milestone, canManage, onEdit, onChanged }: { milestone: HistoryMilestone; canManage: boolean; onEdit: () => void; onChanged: () => Promise<void> }) {
  const deleteMutation = useMutation({
    mutationFn: () => historyMilestonesApi.delete(milestone.id),
    onSuccess: async () => { toast.success("Milestone deleted"); await onChanged(); },
    onError: () => toast.error("Published milestones must be unpublished before deletion"),
  });

  return (
    <article className="grid gap-4 rounded-2xl border bg-background p-4 md:grid-cols-[6rem_minmax(0,1fr)_auto] md:items-start">
      <div><p className="text-2xl font-semibold text-primary">{milestone.year_label}</p><p className="mt-1 text-xs text-muted-foreground">Order {milestone.display_order}</p></div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{milestone.title}</h3><WorkflowBadge status={milestone.workflow_status} />{!milestone.is_public ? <Badge variant="outline">Private</Badge> : null}</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{milestone.summary}</p>
        <p className="mt-2 text-xs text-muted-foreground">Source: {milestone.source_title || "Not supplied"}</p>
        <div className="mt-3"><AboutWorkflowActions kind="milestone" id={milestone.id} status={milestone.workflow_status} compact onCompleted={onChanged} /></div>
      </div>
      {canManage ? (
        <div className="flex gap-2 md:justify-end">
          <Button type="button" size="icon" variant="outline" aria-label={`Edit ${milestone.title}`} onClick={onEdit}><Pencil className="size-4" /></Button>
          <Button type="button" size="icon" variant="outline" aria-label={`Delete ${milestone.title}`} disabled={deleteMutation.isPending || milestone.workflow_status === "published"} onClick={() => { if (window.confirm(`Delete ${milestone.title}?`)) deleteMutation.mutate(); }}><Trash2 className="size-4" /></Button>
        </div>
      ) : null}
    </article>
  );
}

function MilestoneEditorDialog({ aboutId, record, onOpenChange, onSaved }: { aboutId: string; record: HistoryMilestone | "new" | null; onOpenChange: (open: boolean) => void; onSaved: () => Promise<void> }) {
  const editing = record && record !== "new" ? record : null;
  const [values, setValues] = useState<Partial<HistoryMilestonePayload>>(() => milestoneDefaults());

  useEffect(() => {
    if (record) setValues({ ...milestoneDefaults(editing), about_page_content_id: aboutId });
  }, [aboutId, editing, record]);

  const mutation = useMutation({
    mutationFn: () => {
      const payload: HistoryMilestonePayload = {
        about_page_content_id: aboutId,
        slug: String(values.slug ?? "").trim(),
        year_label: String(values.year_label ?? "").trim(),
        event_date: nullable(values.event_date),
        title: String(values.title ?? "").trim(),
        summary: String(values.summary ?? "").trim(),
        expanded_body: nullable(values.expanded_body),
        image_id: nullable(values.image_id),
        image_alt_text: nullable(values.image_alt_text),
        source_title: nullable(values.source_title),
        source_url: nullable(values.source_url),
        source_document_id: nullable(values.source_document_id),
        display_order: Number(values.display_order ?? 100),
        is_featured: values.is_featured ?? false,
        is_public: values.is_public ?? true,
        is_enabled: values.is_enabled ?? true,
      };
      if (!payload.slug || !payload.year_label || !payload.title || !payload.summary) throw new Error("Required milestone fields are missing");
      if (editing) {
        const { about_page_content_id: _pageId, slug: _slug, ...update } = payload;
        return historyMilestonesApi.update(editing.id, update);
      }
      return historyMilestonesApi.create(payload);
    },
    onSuccess: async () => { toast.success(editing ? "Milestone updated" : "Milestone created"); await onSaved(); },
    onError: () => toast.error("Check the milestone fields and source information"),
  });

  const setField = <K extends keyof HistoryMilestonePayload>(key: K, value: HistoryMilestonePayload[K]) => setValues((current) => ({ ...current, [key]: value }));

  return (
    <Dialog open={Boolean(record)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>{editing ? "Edit milestone" : "Add history milestone"}</DialogTitle><DialogDescription>Maintain concise display copy, expanded context, source provenance and accessibility metadata.</DialogDescription></DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Slug" value={values.slug} disabled={Boolean(editing)} onChange={(value) => setField("slug", value)} placeholder="chartered-university" />
          <TextField label="Year label" value={values.year_label} onChange={(value) => setField("year_label", value)} placeholder="2013 or Today" />
          <TextField label="Event date" type="date" value={values.event_date} onChange={(value) => setField("event_date", value)} />
          <TextField label="Display order" type="number" value={values.display_order} onChange={(value) => setField("display_order", Number(value))} />
        </div>
        <TextField label="Title" value={values.title} onChange={(value) => setField("title", value)} />
        <AreaField label="Short description" value={values.summary} rows={4} onChange={(value) => setField("summary", value)} />
        <AreaField label="Expanded history" value={values.expanded_body} rows={7} onChange={(value) => setField("expanded_body", value)} />
        <MediaPicker value={values.image_id ?? ""} onChange={(value) => setField("image_id", value)} mediaType="image" accept="image/*" label="Historical photograph" />
        <TextField label="Image alt text" value={values.image_alt_text} onChange={(value) => setField("image_alt_text", value)} />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Source title" value={values.source_title} onChange={(value) => setField("source_title", value)} />
          <TextField label="Source URL" value={values.source_url} onChange={(value) => setField("source_url", value)} placeholder="https://..." />
        </div>
        <TextField label="Source document ID" value={values.source_document_id} onChange={(value) => setField("source_document_id", value)} placeholder="Optional document UUID" />
        <div className="grid gap-3 sm:grid-cols-3">
          <ToggleField label="Public" checked={values.is_public ?? true} onChange={(checked) => setField("is_public", checked)} />
          <ToggleField label="Featured" checked={values.is_featured ?? false} onChange={(checked) => setField("is_featured", checked)} />
          <ToggleField label="Enabled" checked={values.is_enabled ?? true} onChange={(checked) => setField("is_enabled", checked)} />
        </div>
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="button" onClick={() => mutation.mutate()} disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save milestone"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TextField({ label, value, onChange, placeholder, type = "text", disabled = false }: { label: string; value: unknown; onChange: (value: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return <label className="space-y-2 text-sm font-medium"><span>{label}</span><Input type={type} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} /></label>;
}

function AreaField({ label, value, onChange, rows, help }: { label: string; value: unknown; onChange: (value: string) => void; rows: number; help?: string }) {
  return <label className="space-y-2 text-sm font-medium"><span>{label}</span><Textarea rows={rows} value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} />{help ? <span className="block text-xs font-normal text-muted-foreground">{help}</span> : null}</label>;
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex items-center justify-between rounded-xl border p-3 text-sm font-medium"><span>{label}</span><Switch checked={checked} onCheckedChange={onChange} /></label>;
}

function WorkflowBadge({ status }: { status: string }) {
  return <Badge variant={status === "published" ? "default" : status === "approved" ? "secondary" : "outline"}>{status.replace(/_/g, " ")}</Badge>;
}

function StateMessage({ label, tone = "default" }: { label: string; tone?: "default" | "error" }) {
  return <p className={`rounded-xl border border-dashed p-5 text-center text-sm ${tone === "error" ? "border-destructive/40 text-destructive" : "text-muted-foreground"}`}>{label}</p>;
}
