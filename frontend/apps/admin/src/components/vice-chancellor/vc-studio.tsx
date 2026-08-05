"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  Check,
  ExternalLink,
  Eye,
  FileText,
  Film,
  Images,
  LayoutDashboard,
  Link2,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  Undo2,
  UploadCloud,
} from "lucide-react";
import { toast } from "@ksu/ui";
import {
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@ksu/ui/components";
import {
  queryKeys,
  useCreateVcGallery,
  useCreateVcPlacement,
  useCreateVcSpeech,
  useCreateVcVideo,
  useDeleteVcGallery,
  useDeleteVcPlacement,
  useDeleteVcSpeech,
  useDeleteVcVideo,
  useUpdateVcGallery,
  useUpdateVcHub,
  useUpdateVcPlacement,
  useUpdateVcSpeech,
  useUpdateVcVideo,
  useVcContentWorkflow,
  useVcEventsLookup,
  useVcGalleries,
  useVcHub,
  useVcHubWorkflow,
  useVcNewsLookup,
  useVcPlacements,
  useVcSpeeches,
  useVcVideos,
  viceChancellorApi,
  type VcGalleryAlbum,
  type VcGalleryPayload,
  type VcHub,
  type VcHubPlacement,
  type VcPlacementPayload,
  type VcPlacementSection,
  type VcSection,
  type VcSpeech,
  type VcSpeechPayload,
  type VcVideo,
  type VcVideoPayload,
  type VcWorkflowAction,
  type VcWorkflowStatus,
} from "@ksu/api-client";
import { MediaPicker } from "@/components/media";
import { usePermissions } from "@/hooks/use-permissions";
import { VcPortraitLibrary } from "./vc-portrait-library";

const TABS = [
  ["overview", "Overview", LayoutDashboard],
  ["videos", "Videos", Film],
  ["speeches", "Speeches", FileText],
  ["galleries", "Galleries", Images],
  ["activities", "Activities & events", CalendarDays],
  ["curation", "Curation", Settings2],
  ["preview", "Preview", Eye],
] as const;
const SECTIONS: Array<{ value: VcSection; label: string }> = [
  { value: "story", label: "The VC's story" },
  { value: "activities", label: "Activities" },
  { value: "speeches", label: "Speeches" },
  { value: "videos", label: "Videos" },
  { value: "events", label: "Events" },
  { value: "gallery", label: "Gallery" },
];
const PUBLIC_VC_URL = `${process.env.NEXT_PUBLIC_WEB_URL || "http://localhost:3000"}/about/vice-chancellor`;

const VC_SPEECH_VIDEO_ROLES = [
  { value: "primary", label: "Primary recording" },
  { value: "full_recording", label: "Full recording" },
  { value: "excerpt", label: "Excerpt / highlight" },
  { value: "related", label: "Related video" },
] as const;

function clean(value?: string | null) {
  return value?.trim() || null;
}
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function dateValue(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}
function datePayload(value?: string) {
  return value ? `${value}T00:00:00Z` : null;
}
function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : "The change could not be saved.";
}

function StatusBadge({ status }: { status?: VcWorkflowStatus }) {
  const tone =
    status === "published"
      ? "default"
      : status === "approved"
        ? "secondary"
        : "outline";
  return (
    <Badge variant={tone}>{(status ?? "draft").replaceAll("_", " ")}</Badge>
  );
}

function WorkflowActions({
  resource,
  id,
  status,
  canManage,
  canReview,
  canPublish,
}: {
  resource: "hub" | "videos" | "speeches" | "galleries";
  id?: string;
  status: VcWorkflowStatus;
  canManage: boolean;
  canReview: boolean;
  canPublish: boolean;
}) {
  const hub = useVcHubWorkflow();
  const content = useVcContentWorkflow();
  const [reasonDialog, setReasonDialog] = useState<{ action: VcWorkflowAction; label: string } | null>(null);
  const [reason, setReason] = useState("");

  const actions: Array<{
    action: VcWorkflowAction;
    label: string;
    allowed: boolean;
    icon: typeof Send;
    needsReason?: boolean;
  }> = [];
  if (["draft", "changes_requested"].includes(status))
    actions.push({
      action: "submit",
      label: "Submit",
      allowed: canManage,
      icon: Send,
    });
  if (status === "in_review")
    actions.push(
      { action: "approve", label: "Approve", allowed: canReview, icon: Check },
      {
        action: "request_changes",
        label: "Request changes",
        allowed: canReview,
        icon: Undo2,
        needsReason: true,
      },
    );
  if (status === "approved")
    actions.push({
      action: "publish",
      label: "Publish",
      allowed: canPublish,
      icon: UploadCloud,
    });
  if (status === "published")
    actions.push({
      action: "unpublish",
      label: "Unpublish",
      allowed: canPublish,
      icon: Undo2,
    });

  const run = async (action: VcWorkflowAction, actionReason?: string) => {
    try {
      if (resource === "hub") await hub.mutateAsync({ action, reason: actionReason });
      else if (id) await content.mutateAsync({ resource, id, action, reason: actionReason });
      toast.success("Workflow updated");
      setReasonDialog(null);
      setReason("");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const handleClick = (item: typeof actions[0]) => {
    if (item.needsReason) {
      setReasonDialog({ action: item.action, label: item.label });
    } else {
      void run(item.action);
    }
  };

  const confirmWithReason = () => {
    if (!reasonDialog) return;
    if (!reason.trim()) {
      toast.error("Please provide a reason for requesting changes");
      return;
    }
    void run(reasonDialog.action, reason.trim());
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions
          .filter((item) => item.allowed)
          .map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.action}
                size="sm"
                variant={
                  item.action === "publish" || item.action === "approve"
                    ? "default"
                    : "outline"
                }
                disabled={hub.isPending || content.isPending}
                onClick={() => handleClick(item)}
              >
                <Icon className="mr-2 size-4" />
                {item.label}
              </Button>
            );
          })}
      </div>
      <Dialog open={Boolean(reasonDialog)} onOpenChange={(open) => !open && setReasonDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{reasonDialog?.label}</DialogTitle>
            <DialogDescription>Explain what changes are needed before this content can be approved.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="vc-workflow-reason">Revision note</label>
            <Textarea
              id="vc-workflow-reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe the required changes..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReasonDialog(null)}>Cancel</Button>
            <Button onClick={confirmWithReason} disabled={hub.isPending || content.isPending}>
              {hub.isPending || content.isPending ? "Working..." : "Request changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function StudioHeader({
  hub,
  permissions,
}: {
  hub?: VcHub;
  permissions: ReturnType<typeof permissionState>;
}) {
  return (
    <div className="rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-orange-500/10 p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Corporate Communication</Badge>
            <StatusBadge status={hub?.workflow_status} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Meet the VC content studio
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Shape the public experience around the Vice-Chancellor: films,
            speeches, activities, events and photographic stories.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href={PUBLIC_VC_URL} target="_blank">
              <ExternalLink className="mr-2 size-4" />
              Public page
            </Link>
          </Button>
          {hub ? (
            <WorkflowActions
              resource="hub"
              status={hub.workflow_status}
              {...permissions}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function permissionState(hasAnyPermission: (items: string[]) => boolean) {
  return {
    canManage: hasAnyPermission(["vc_hub.manage", "admin:*"]),
    canReview: hasAnyPermission(["vc_hub.review", "admin:*"]),
    canPublish: hasAnyPermission(["vc_hub.publish", "admin:*"]),
  };
}

function OverviewTab({ hub, canManage }: { hub: VcHub; canManage: boolean }) {
  const videosQuery = useVcVideos();
  const save = useUpdateVcHub();
  const [form, setForm] = useState(() => ({
    ...hub,
    section_order: [...hub.section_order],
    section_visibility: { ...hub.section_visibility },
  }));
  useEffect(
    () =>
      setForm({
        ...hub,
        section_order: [...hub.section_order],
        section_visibility: { ...hub.section_visibility },
      }),
    [hub],
  );
  const update = <K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const move = (index: number, direction: -1 | 1) => {
    const next = [...form.section_order];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    update("section_order", next);
  };
  const submit = async () => {
    try {
      await save.mutateAsync({
        eyebrow: form.eyebrow,
        title: form.title,
        introduction: clean(form.introduction),
        welcome_title: clean(form.welcome_title),
        welcome_message: clean(form.welcome_message),
        welcome_video_id: clean(form.welcome_video_id),
        professional_profile_url: form.professional_profile_url,
        section_order: form.section_order,
        section_visibility: form.section_visibility,
      });
      toast.success("VC landing page saved");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.75fr)]">
      <div className="xl:col-span-2">
        <VcPortraitLibrary canManage={canManage} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Landing page story</CardTitle>
          <CardDescription>
            Control the hero and the welcoming message visitors see first.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field label="Eyebrow">
            <Input
              value={form.eyebrow}
              disabled={!canManage}
              onChange={(e) => update("eyebrow", e.target.value)}
            />
          </Field>
          <Field label="Page title">
            <Input
              value={form.title}
              disabled={!canManage}
              onChange={(e) => update("title", e.target.value)}
            />
          </Field>
          <Field label="Introduction">
            <Textarea
              rows={4}
              value={form.introduction ?? ""}
              disabled={!canManage}
              onChange={(e) => update("introduction", e.target.value)}
            />
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Welcome heading">
              <Input
                value={form.welcome_title ?? ""}
                disabled={!canManage}
                onChange={(e) => update("welcome_title", e.target.value)}
              />
            </Field>
            <Field label="Welcome video">
              <Select
                value={form.welcome_video_id ?? "none"}
                disabled={!canManage}
                onValueChange={(value) =>
                  update("welcome_video_id", value === "none" ? null : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select video" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No welcome video</SelectItem>
                  {(videosQuery.data?.data.items ?? []).map((video) => (
                    <SelectItem key={video.id} value={video.id}>
                      {video.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Welcome message">
            <Textarea
              rows={6}
              value={form.welcome_message ?? ""}
              disabled={!canManage}
              onChange={(e) => update("welcome_message", e.target.value)}
            />
          </Field>
          <Field label="Professional profile route">
            <Input
              value={form.professional_profile_url}
              disabled={!canManage}
              onChange={(e) =>
                update("professional_profile_url", e.target.value)
              }
            />
          </Field>
          {canManage ? (
            <Button onClick={() => void submit()} disabled={save.isPending}>
              <Save className="mr-2 size-4" />
              Save landing page
            </Button>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Section order</CardTitle>
          <CardDescription>
            Arrange the public narrative and hide sections that are not ready.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {form.section_order.map((section, index) => {
            const label =
              SECTIONS.find((item) => item.value === section)?.label ?? section;
            return (
              <div
                key={section}
                className="flex items-center gap-2 rounded-lg border p-3"
              >
                <Switch
                  checked={form.section_visibility[section] !== false}
                  disabled={!canManage}
                  aria-label={`Show ${label}`}
                  onCheckedChange={(checked) =>
                    update("section_visibility", {
                      ...form.section_visibility,
                      [section]: checked,
                    })
                  }
                />
                <span className="min-w-0 flex-1 text-sm font-medium">
                  {label}
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={!canManage || index === 0}
                  aria-label={`Move ${label} up`}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={
                    !canManage || index === form.section_order.length - 1
                  }
                  aria-label={`Move ${label} down`}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed p-10 text-center">
      <Sparkles className="mx-auto size-8 text-muted-foreground" />
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
function ItemCard({
  title,
  summary,
  status,
  featured,
  actions,
}: {
  title: string;
  summary?: string | null;
  status: VcWorkflowStatus;
  featured?: boolean;
  actions: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{title}</h3>
            <StatusBadge status={status} />
            {featured ? <Badge variant="secondary">Featured</Badge> : null}
          </div>
          {summary ? (
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {summary}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">{actions}</div>
      </CardContent>
    </Card>
  );
}

function VideosTab({
  permissions,
}: {
  permissions: ReturnType<typeof permissionState>;
}) {
  const client = useQueryClient();
  const query = useVcVideos();
  const create = useCreateVcVideo();
  const update = useUpdateVcVideo();
  const remove = useDeleteVcVideo();
  const [editor, setEditor] = useState<VcVideo | "new" | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const items = query.data?.data.items ?? [];

  const save = async (payload: VcVideoPayload) => {
    try {
      if (editor === "new") await create.mutateAsync(payload);
      else if (editor)
        await update.mutateAsync({ id: editor.id, data: payload });
      toast.success("Video saved");
      setEditor(null);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const destroy = async (item: VcVideo) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await remove.mutateAsync(item.id);
      toast.success("Video deleted");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };

  const refreshMetadata = async (item: VcVideo) => {
    if (item.provider !== "youtube") return;
    setRefreshingId(item.id);
    try {
      await viceChancellorApi.refreshVideo(item.id);
      await client.invalidateQueries({ queryKey: queryKeys.viceChancellor.videos });
      toast.success("Metadata refreshed");
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setRefreshingId(null);
    }
  };
  return (
    <ContentPanel
      title="Video library"
      description="Cast approved YouTube recordings safely or reference uploaded films."
      action={
        permissions.canManage ? (
          <Button onClick={() => setEditor("new")}>
            <Plus className="mr-2 size-4" />
            Add video
          </Button>
        ) : null
      }
    >
      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.title}
              summary={item.summary}
              status={item.workflow_status}
              featured={item.is_featured}
              actions={
                <>
                  <WorkflowActions
                    resource="videos"
                    id={item.id}
                    status={item.workflow_status}
                    {...permissions}
                  />
                  {permissions.canManage ? (
                    <>
                      {item.provider === "youtube" ? (
                        <Button
                          size="icon"
                          variant="outline"
                          aria-label={`Refresh metadata for ${item.title}`}
                          onClick={() => void refreshMetadata(item)}
                          disabled={refreshingId === item.id}
                        >
                          {refreshingId === item.id ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                        </Button>
                      ) : null}
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Edit ${item.title}`}
                        onClick={() => setEditor(item)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Delete ${item.title}`}
                        onClick={() => void destroy(item)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </>
                  ) : null}
                </>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No VC videos yet"
          description="Add the first YouTube or uploaded recording."
        />
      )}
      <VideoEditor
        item={editor}
        open={Boolean(editor)}
        onOpenChange={(open) => !open && setEditor(null)}
        onSave={save}
        pending={create.isPending || update.isPending}
      />
    </ContentPanel>
  );
}

function VideoEditor({
  item,
  open,
  onOpenChange,
  onSave,
  pending,
}: {
  item: VcVideo | "new" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: VcVideoPayload) => Promise<void>;
  pending: boolean;
}) {
  const current = item === "new" ? null : item;
  const [form, setForm] = useState<Partial<VcVideoPayload>>({
    provider: "youtube",
  });
  const [youtubePreview, setYoutubePreview] = useState<{
    title?: string;
    thumbnail_url?: string;
    author_name?: string;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(
    () => {
      setForm(
        current
          ? {
              title: current.title,
              slug: current.slug,
              summary: current.summary,
              transcript: current.transcript,
              provider: current.provider,
              source_url: current.source_url,
              uploaded_media_id: current.uploaded_media_id,
              poster_media_id: current.poster_media_id,
              recorded_at: dateValue(current.recorded_at),
              category: current.category,
              is_featured: current.is_featured,
            }
          : { provider: "youtube", is_featured: false },
      );
      setYoutubePreview(null);
    },
    [current, open],
  );

  const set = (key: keyof VcVideoPayload, value: unknown) =>
    setForm((valueNow) => ({ ...valueNow, [key]: value }));

  const previewYoutube = async () => {
    if (!form.source_url) return;
    setPreviewLoading(true);
    try {
      const response = await viceChancellorApi.previewYoutube(form.source_url);
      setYoutubePreview(response.data);
      if (response.data.title && !form.title) {
        set("title", response.data.title);
        set("slug", slugify(response.data.title));
      }
      toast.success("YouTube video validated");
    } catch (error) {
      toast.error(errorMessage(error));
      setYoutubePreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{current ? "Edit video" : "Add video"}</DialogTitle>
          <DialogDescription>
            YouTube links are converted to privacy-enhanced embeds by the
            server.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input
                value={form.title ?? ""}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!current) set("slug", slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Slug">
              <Input
                value={form.slug ?? ""}
                onChange={(e) => set("slug", slugify(e.target.value))}
              />
            </Field>
          </div>
          <Field label="Summary">
            <Textarea
              rows={3}
              value={form.summary ?? ""}
              onChange={(e) => set("summary", e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Source">
              <Select
                value={form.provider ?? "youtube"}
                onValueChange={(value) => set("provider", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="uploaded">Uploaded video</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Category">
              <Input
                value={form.category ?? ""}
                onChange={(e) => set("category", e.target.value)}
              />
            </Field>
          </div>
          {form.provider === "youtube" ? (
            <div className="space-y-3">
              <Field label="YouTube URL">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=…"
                    value={form.source_url ?? ""}
                    onChange={(e) => { set("source_url", e.target.value); setYoutubePreview(null); }}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void previewYoutube()}
                    disabled={!form.source_url || previewLoading}
                  >
                    {previewLoading ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
                    Preview
                  </Button>
                </div>
              </Field>
              {youtubePreview ? (
                <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
                  {youtubePreview.thumbnail_url ? (
                    <img src={youtubePreview.thumbnail_url} alt="" className="h-16 w-28 rounded object-cover" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{youtubePreview.title || "Untitled video"}</p>
                    {youtubePreview.author_name ? <p className="text-xs text-muted-foreground">{youtubePreview.author_name}</p> : null}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <MediaPicker
              label="Uploaded video"
              mediaType="video"
              accept="video/*"
              value={form.uploaded_media_id}
              onChange={(value) => set("uploaded_media_id", value)}
              isPublic
            />
          )}
          <MediaPicker
            label="Poster image"
            mediaType="image"
            accept="image/*"
            value={form.poster_media_id}
            onChange={(value) => set("poster_media_id", value)}
            isPublic
          />
          <Field label="Transcript">
            <Textarea
              rows={5}
              value={form.transcript ?? ""}
              onChange={(e) => set("transcript", e.target.value)}
            />
          </Field>
          <Field label="Recorded date">
            <Input
              type="date"
              value={dateValue(form.recorded_at)}
              onChange={(e) => set("recorded_at", e.target.value)}
            />
          </Field>
          <label className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm font-medium">Feature this video</span>
            <Switch
              checked={form.is_featured ?? false}
              onCheckedChange={(checked) => set("is_featured", checked)}
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={
              pending ||
              !form.title ||
              !form.slug ||
              (form.provider === "youtube"
                ? !form.source_url
                : !form.uploaded_media_id)
            }
            onClick={() =>
              void onSave({
                title: form.title!,
                slug: form.slug!,
                provider: form.provider ?? "youtube",
                summary: clean(form.summary),
                transcript: clean(form.transcript),
                source_url: clean(form.source_url),
                uploaded_media_id: clean(form.uploaded_media_id),
                poster_media_id: clean(form.poster_media_id),
                recorded_at: datePayload(dateValue(form.recorded_at)),
                category: clean(form.category),
                is_featured: form.is_featured,
              })
            }
          >
            {pending ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <Save className="mr-2 size-4" />
            )}
            Save video
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SpeechesTab({
  permissions,
}: {
  permissions: ReturnType<typeof permissionState>;
}) {
  const query = useVcSpeeches();
  const create = useCreateVcSpeech();
  const update = useUpdateVcSpeech();
  const remove = useDeleteVcSpeech();
  const [editor, setEditor] = useState<VcSpeech | "new" | null>(null);
  const items = query.data?.data.items ?? [];
  const save = async (payload: VcSpeechPayload) => {
    try {
      if (editor === "new") await create.mutateAsync(payload);
      else if (editor)
        await update.mutateAsync({ id: editor.id, data: payload });
      toast.success("Speech saved");
      setEditor(null);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  return (
    <ContentPanel
      title="Speeches & statements"
      description="Publish full text, context, downloadable documents and matching recordings."
      action={
        permissions.canManage ? (
          <Button onClick={() => setEditor("new")}>
            <Plus className="mr-2 size-4" />
            New speech
          </Button>
        ) : null
      }
    >
      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.title}
              summary={item.summary}
              status={item.workflow_status}
              featured={item.is_featured}
              actions={
                <>
                  <WorkflowActions
                    resource="speeches"
                    id={item.id}
                    status={item.workflow_status}
                    {...permissions}
                  />
                  {permissions.canManage ? (
                    <>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Edit ${item.title}`}
                        onClick={() => setEditor(item)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <DeleteButton
                        label={item.title}
                        onDelete={() => remove.mutateAsync(item.id)}
                      />
                    </>
                  ) : null}
                </>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No speeches yet"
          description="Create the first speech, address or statement."
        />
      )}
      <SpeechEditor
        item={editor}
        open={Boolean(editor)}
        videos={useVcVideos().data?.data.items ?? []}
        onOpenChange={(open) => !open && setEditor(null)}
        onSave={save}
        pending={create.isPending || update.isPending}
      />
    </ContentPanel>
  );
}

function SpeechEditor({
  item,
  open,
  videos,
  onOpenChange,
  onSave,
  pending,
}: {
  item: VcSpeech | "new" | null;
  open: boolean;
  videos: VcVideo[];
  onOpenChange: (open: boolean) => void;
  onSave: (payload: VcSpeechPayload) => Promise<void>;
  pending: boolean;
}) {
  const current = item === "new" ? null : item;
  const client = useQueryClient();
  const [form, setForm] = useState<Partial<VcSpeechPayload>>({
    speech_type: "speech",
  });
  const [videoId, setVideoId] = useState("");
  const [videoRole, setVideoRole] = useState<"primary" | "full_recording" | "excerpt" | "related">("full_recording");
  const links = useQuery({
    queryKey: ["vice-chancellor", "speech-videos", current?.id],
    queryFn: () => viceChancellorApi.listSpeechVideos(current!.id),
    enabled: Boolean(current?.id && open),
  });
  useEffect(
    () => {
      setForm(
        current
          ? {
              title: current.title,
              slug: current.slug,
              summary: current.summary,
              plain_text: current.plain_text,
              speech_type: current.speech_type,
              delivered_at: dateValue(current.delivered_at),
              venue: current.venue,
              occasion: current.occasion,
              audience: current.audience,
              featured_media_id: current.featured_media_id,
              document_media_id: current.document_media_id,
              is_featured: current.is_featured,
            }
          : { speech_type: "speech", is_featured: false },
      );
      setVideoId("");
      setVideoRole("full_recording");
    },
    [current, open],
  );
  const set = (key: keyof VcSpeechPayload, value: unknown) =>
    setForm((now) => ({ ...now, [key]: value }));
  const attach = async () => {
    if (!current || !videoId) return;
    try {
      await viceChancellorApi.attachSpeechVideo(current.id, {
        video_id: videoId,
        role: videoRole,
      });
      setVideoId("");
      await links.refetch();
      toast.success("Recording attached");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  const detach = async (linkId: string) => {
    if (!current) return;
    await viceChancellorApi.detachSpeechVideo(current.id, linkId);
    await links.refetch();
    await client.invalidateQueries({ queryKey: queryKeys.viceChancellor.all });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{current ? "Edit speech" : "Create speech"}</DialogTitle>
          <DialogDescription>
            Add the complete address and optionally connect one or more
            recordings after saving.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input
                value={form.title ?? ""}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!current) set("slug", slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Slug">
              <Input
                value={form.slug ?? ""}
                onChange={(e) => set("slug", slugify(e.target.value))}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              <Select
                value={form.speech_type ?? "speech"}
                onValueChange={(value) => set("speech_type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "speech",
                    "address",
                    "statement",
                    "reflection",
                    "interview",
                  ].map((value) => (
                    <SelectItem key={value} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Delivered date">
              <Input
                type="date"
                value={dateValue(form.delivered_at)}
                onChange={(e) => set("delivered_at", e.target.value)}
              />
            </Field>
          </div>
          <Field label="Summary">
            <Textarea
              rows={3}
              value={form.summary ?? ""}
              onChange={(e) => set("summary", e.target.value)}
            />
          </Field>
          <Field label="Full speech text">
            <Textarea
              rows={10}
              value={form.plain_text ?? ""}
              onChange={(e) => set("plain_text", e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Venue">
              <Input
                value={form.venue ?? ""}
                onChange={(e) => set("venue", e.target.value)}
              />
            </Field>
            <Field label="Occasion">
              <Input
                value={form.occasion ?? ""}
                onChange={(e) => set("occasion", e.target.value)}
              />
            </Field>
            <Field label="Audience">
              <Input
                value={form.audience ?? ""}
                onChange={(e) => set("audience", e.target.value)}
              />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <MediaPicker
              label="Featured image"
              mediaType="image"
              accept="image/*"
              value={form.featured_media_id}
              onChange={(value) => set("featured_media_id", value)}
              isPublic
            />
            <MediaPicker
              label="Speech document"
              accept=".pdf,.doc,.docx"
              value={form.document_media_id}
              onChange={(value) => set("document_media_id", value)}
              isPublic
            />
          </div>
          {current ? (
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Matching recordings</h3>
              <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_140px_auto]">
                <Select value={videoId} onValueChange={setVideoId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a video" />
                  </SelectTrigger>
                  <SelectContent>
                    {videos.map((video) => (
                      <SelectItem key={video.id} value={video.id}>
                        {video.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={videoRole} onValueChange={(value) => setVideoRole(value as typeof videoRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VC_SPEECH_VIDEO_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  disabled={!videoId}
                  onClick={() => void attach()}
                >
                  <Link2 className="mr-2 size-4" />
                  Attach
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {(links.data?.data ?? []).map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between rounded-md bg-muted p-3 text-sm"
                  >
                    <div>
                      <span className="font-medium">{link.video?.title ?? "Attached video"}</span>
                      {link.role ? <span className="ml-2 text-xs text-muted-foreground">({link.role.replace(/_/g, " ")})</span> : null}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void detach(link.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              Save the speech first, then reopen it to match YouTube recordings.
            </p>
          )}
          <label className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm font-medium">Feature this speech</span>
            <Switch
              checked={form.is_featured ?? false}
              onCheckedChange={(value) => set("is_featured", value)}
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={pending || !form.title || !form.slug}
            onClick={() =>
              void onSave({
                title: form.title!,
                slug: form.slug!,
                summary: clean(form.summary),
                plain_text: clean(form.plain_text),
                speech_type: form.speech_type,
                delivered_at: datePayload(dateValue(form.delivered_at)),
                venue: clean(form.venue),
                occasion: clean(form.occasion),
                audience: clean(form.audience),
                featured_media_id: clean(form.featured_media_id),
                document_media_id: clean(form.document_media_id),
                is_featured: form.is_featured,
              })
            }
          >
            <Save className="mr-2 size-4" />
            Save speech
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function GalleriesTab({
  permissions,
}: {
  permissions: ReturnType<typeof permissionState>;
}) {
  const query = useVcGalleries();
  const create = useCreateVcGallery();
  const update = useUpdateVcGallery();
  const remove = useDeleteVcGallery();
  const [editor, setEditor] = useState<VcGalleryAlbum | "new" | null>(null);
  const items = query.data?.data.items ?? [];
  const save = async (payload: VcGalleryPayload) => {
    try {
      if (editor === "new") await create.mutateAsync(payload);
      else if (editor)
        await update.mutateAsync({ id: editor.id, data: payload });
      toast.success("Gallery saved");
      setEditor(null);
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  return (
    <ContentPanel
      title="Photo galleries"
      description="Build visual stories with an ordered selection of uploaded photographs."
      action={
        permissions.canManage ? (
          <Button onClick={() => setEditor("new")}>
            <Plus className="mr-2 size-4" />
            New gallery
          </Button>
        ) : null
      }
    >
      {items.length ? (
        <div className="space-y-3">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              title={item.title}
              summary={item.summary}
              status={item.workflow_status}
              featured={item.is_featured}
              actions={
                <>
                  <WorkflowActions
                    resource="galleries"
                    id={item.id}
                    status={item.workflow_status}
                    {...permissions}
                  />
                  {permissions.canManage ? (
                    <>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label={`Edit ${item.title}`}
                        onClick={() => setEditor(item)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <DeleteButton
                        label={item.title}
                        onDelete={() => remove.mutateAsync(item.id)}
                      />
                    </>
                  ) : null}
                </>
              }
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No galleries yet"
          description="Create an album and upload its first photographs."
        />
      )}
      <GalleryEditor
        item={editor}
        open={Boolean(editor)}
        onOpenChange={(open) => !open && setEditor(null)}
        onSave={save}
        pending={create.isPending || update.isPending}
      />
    </ContentPanel>
  );
}

function GalleryEditor({
  item,
  open,
  onOpenChange,
  onSave,
  pending,
}: {
  item: VcGalleryAlbum | "new" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: VcGalleryPayload) => Promise<void>;
  pending: boolean;
}) {
  const current = item === "new" ? null : item;
  const [form, setForm] = useState<Partial<VcGalleryPayload>>({});
  const [newMedia, setNewMedia] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newAltText, setNewAltText] = useState("");
  const links = useQuery({
    queryKey: ["vice-chancellor", "gallery-media", current?.id],
    queryFn: () => viceChancellorApi.listGalleryMedia(current!.id),
    enabled: Boolean(current?.id && open),
  });
  useEffect(
    () => {
      setForm(
        current
          ? {
              title: current.title,
              slug: current.slug,
              summary: current.summary,
              event_date: dateValue(current.event_date),
              location: current.location,
              cover_media_id: current.cover_media_id,
              is_featured: current.is_featured,
            }
          : { is_featured: false },
      );
      setNewMedia("");
      setNewCaption("");
      setNewAltText("");
    },
    [current, open],
  );
  const set = (key: keyof VcGalleryPayload, value: unknown) =>
    setForm((now) => ({ ...now, [key]: value }));
  const attach = async () => {
    if (!current || !newMedia) return;
    try {
      await viceChancellorApi.attachGalleryMedia(current.id, {
        media_id: newMedia,
        display_order: links.data?.data.length ?? 0,
        caption: newCaption.trim() || null,
        alt_text: newAltText.trim() || null,
      });
      setNewMedia("");
      setNewCaption("");
      setNewAltText("");
      await links.refetch();
      toast.success("Photo added");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  const detach = async (id: string) => {
    if (!current) return;
    await viceChancellorApi.detachGalleryMedia(current.id, id);
    await links.refetch();
  };
  const move = async (index: number, direction: -1 | 1) => {
    if (!current) return;
    const ordered = [...(links.data?.data ?? [])];
    const target = index + direction;
    if (target < 0 || target >= ordered.length) return;
    [ordered[index], ordered[target]] = [ordered[target]!, ordered[index]!];
    await viceChancellorApi.reorderGalleryMedia(
      current.id,
      ordered.map((entry, order) => ({ id: entry.id, display_order: order })),
    );
    await links.refetch();
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {current ? "Edit gallery" : "Create gallery"}
          </DialogTitle>
          <DialogDescription>
            Choose a cover, then add and arrange photographs after the album is
            saved.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title">
              <Input
                value={form.title ?? ""}
                onChange={(e) => {
                  set("title", e.target.value);
                  if (!current) set("slug", slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Slug">
              <Input
                value={form.slug ?? ""}
                onChange={(e) => set("slug", slugify(e.target.value))}
              />
            </Field>
          </div>
          <Field label="Summary">
            <Textarea
              rows={3}
              value={form.summary ?? ""}
              onChange={(e) => set("summary", e.target.value)}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Event date">
              <Input
                type="date"
                value={dateValue(form.event_date)}
                onChange={(e) => set("event_date", e.target.value)}
              />
            </Field>
            <Field label="Location">
              <Input
                value={form.location ?? ""}
                onChange={(e) => set("location", e.target.value)}
              />
            </Field>
          </div>
          <MediaPicker
            label="Cover image"
            mediaType="image"
            accept="image/*"
            value={form.cover_media_id}
            onChange={(value) => set("cover_media_id", value)}
            isPublic
          />
          {current ? (
            <div className="rounded-lg border p-4">
              <h3 className="font-medium">Gallery photographs</h3>
              <div className="mt-3 space-y-3">
                <MediaPicker
                  label="New photograph"
                  mediaType="image"
                  accept="image/*"
                  value={newMedia}
                  onChange={setNewMedia}
                  isPublic
                />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Field label="Caption (optional)">
                    <Input
                      value={newCaption}
                      onChange={(e) => setNewCaption(e.target.value)}
                      placeholder="Photo caption"
                    />
                  </Field>
                  <Field label="Alt text (accessibility)">
                    <Input
                      value={newAltText}
                      onChange={(e) => setNewAltText(e.target.value)}
                      placeholder="Describe the image"
                    />
                  </Field>
                </div>
                <Button
                  variant="outline"
                  disabled={!newMedia}
                  onClick={() => void attach()}
                >
                  <Plus className="mr-2 size-4" />
                  Add photograph
                </Button>
              </div>
              <div className="mt-4 space-y-2">
                {(links.data?.data ?? []).map((link, index) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 rounded-md bg-muted p-2"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {link.media?.title ||
                        link.media?.original_filename ||
                        `Photo ${index + 1}`}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={index === 0}
                      onClick={() => void move(index, -1)}
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      disabled={index === (links.data?.data.length ?? 0) - 1}
                      onClick={() => void move(index, 1)}
                    >
                      <ArrowDown className="size-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => void detach(link.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              Save the gallery first, then reopen it to upload and order
              photographs.
            </p>
          )}
          <label className="flex items-center justify-between rounded-lg border p-3">
            <span className="text-sm font-medium">Feature this gallery</span>
            <Switch
              checked={form.is_featured ?? false}
              onCheckedChange={(value) => set("is_featured", value)}
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={pending || !form.title || !form.slug}
            onClick={() =>
              void onSave({
                title: form.title!,
                slug: form.slug!,
                summary: clean(form.summary),
                event_date: datePayload(dateValue(form.event_date)),
                location: clean(form.location),
                cover_media_id: clean(form.cover_media_id),
                is_featured: form.is_featured,
              })
            }
          >
            <Save className="mr-2 size-4" />
            Save gallery
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ActivitiesTab({ canManage }: { canManage: boolean }) {
  const placements = useVcPlacements();
  const [searchQuery, setSearchQuery] = useState("");
  const news = useVcNewsLookup(searchQuery);
  const events = useVcEventsLookup(searchQuery);
  const create = useCreateVcPlacement();
  const [kind, setKind] = useState<"news" | "event">("event");
  const [selected, setSelected] = useState("");
  const [section, setSection] = useState<VcPlacementSection>("events");
  const existing = (placements.data?.data ?? []).filter(
    (item) => item.news_id || item.event_id,
  );
  const options =
    kind === "news" ? (news.data?.data ?? []) : (events.data?.data ?? []);
  const add = async () => {
    if (!selected) return;
    const payload: VcPlacementPayload = {
      section,
      is_enabled: true,
      ...(kind === "news" ? { news_id: selected } : { event_id: selected }),
    };
    try {
      await create.mutateAsync(payload);
      setSelected("");
      toast.success("Item added to Meet the VC");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  return (
    <ContentPanel
      title="Activities & events"
      description="Select existing newsroom stories and calendar events that show the VC at work."
      action={null}
    >
      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-[180px_180px_1fr_auto]">
          <Field label="Source">
            <Select
              value={kind}
              onValueChange={(value) => {
                setKind(value as "news" | "event");
                setSelected("");
                setSection(value === "news" ? "activities" : "events");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="event">Event</SelectItem>
                <SelectItem value="news">News/activity</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Public section">
            <Select
              value={section}
              onValueChange={(value) => setSection(value as VcPlacementSection)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activities">Activities</SelectItem>
                <SelectItem value="events">Events</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Search and select">
            <div className="space-y-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${kind === "news" ? "news" : "events"}...`}
              />
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger>
                  <SelectValue placeholder={`Choose ${kind}`} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {String(item.title)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Field>
          <Button
            className="self-end"
            disabled={!canManage || !selected || create.isPending}
            onClick={() => void add()}
          >
            <Plus className="mr-2 size-4" />
            Add
          </Button>
        </CardContent>
      </Card>
      {existing.length ? (
        <div className="space-y-3">
          {existing.map((item) => (
            <PlacementCard key={item.id} item={item} canManage={canManage} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No activities selected"
          description="Choose news or events to tell the story of the VC's work."
        />
      )}
    </ContentPanel>
  );
}

function PlacementCard({
  item,
  title,
  canManage,
}: {
  item: VcHubPlacement;
  title?: string;
  canManage: boolean;
}) {
  const update = useUpdateVcPlacement();
  const remove = useDeleteVcPlacement();
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{item.section}</Badge>
            {item.is_featured ? (
              <Badge variant="secondary">Featured</Badge>
            ) : null}
          </div>
          <p className="mt-2 truncate font-medium">
            {title ||
              item.title_override ||
              item.editorial_label ||
              "Curated content"}
          </p>
        </div>
        <Switch
          checked={item.is_enabled}
          disabled={!canManage}
          aria-label="Show item"
          onCheckedChange={(is_enabled) =>
            void update.mutateAsync({ id: item.id, data: { is_enabled } })
          }
        />
        <Button
          size="icon"
          variant="outline"
          aria-label="Remove item"
          disabled={!canManage}
          onClick={() => void remove.mutateAsync(item.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

function CurationTab({ canManage }: { canManage: boolean }) {
  const placements = useVcPlacements();
  const videos = useVcVideos();
  const speeches = useVcSpeeches();
  const galleries = useVcGalleries();
  const client = useQueryClient();
  const update = useUpdateVcPlacement();
  const remove = useDeleteVcPlacement();
  const create = useCreateVcPlacement();
  const [source, setSource] = useState<"video" | "speech" | "gallery">("video");
  const [selected, setSelected] = useState("");
  const items = useMemo(
    () =>
      [...(placements.data?.data ?? [])].sort(
        (a, b) => a.display_order - b.display_order,
      ),
    [placements.data?.data],
  );
  const title = (item: VcHubPlacement) =>
    videos.data?.data.items.find((x) => x.id === item.video_id)?.title ||
    speeches.data?.data.items.find((x) => x.id === item.speech_id)?.title ||
    galleries.data?.data.items.find((x) => x.id === item.gallery_album_id)
      ?.title ||
    item.title_override ||
    item.editorial_label ||
    (item.news_id ? "News activity" : "Event");
  const selectable =
    source === "video"
      ? (videos.data?.data.items ?? []).map((item) => ({
          id: item.id,
          title: item.title,
        }))
      : source === "speech"
        ? (speeches.data?.data.items ?? []).map((item) => ({
            id: item.id,
            title: item.title,
          }))
        : (galleries.data?.data.items ?? []).map((item) => ({
            id: item.id,
            title: item.title,
          }));
  const add = async () => {
    if (!selected) return;
    const section: VcPlacementSection =
      source === "gallery"
        ? "gallery"
        : source === "speech"
          ? "speeches"
          : "videos";
    const reference =
      source === "gallery"
        ? { gallery_album_id: selected }
        : source === "speech"
          ? { speech_id: selected }
          : { video_id: selected };
    try {
      await create.mutateAsync({ section, is_enabled: true, ...reference });
      setSelected("");
      toast.success("Content added to the page");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  const move = async (index: number, direction: -1 | 1) => {
    const next = [...items];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    await viceChancellorApi.reorderPlacements(
      next.map((item, order) => ({ id: item.id, display_order: order })),
    );
    await client.invalidateQueries({
      queryKey: queryKeys.viceChancellor.placements,
    });
  };
  return (
    <ContentPanel
      title="Page curation"
      description="Control the precise order, emphasis and visibility of content chosen for each section."
      action={null}
    >
      <Card>
        <CardContent className="grid gap-4 p-5 md:grid-cols-[180px_1fr_auto]">
          <Field label="Content type">
            <Select
              value={source}
              onValueChange={(value) => {
                setSource(value as typeof source);
                setSelected("");
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="speech">Speech</SelectItem>
                <SelectItem value="gallery">Gallery</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Studio content">
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger>
                <SelectValue placeholder={`Choose a ${source}`} />
              </SelectTrigger>
              <SelectContent>
                {selectable.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Button
            className="self-end"
            disabled={!canManage || !selected || create.isPending}
            onClick={() => void add()}
          >
            <Plus className="mr-2 size-4" />
            Add to page
          </Button>
        </CardContent>
      </Card>
      {items.length ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card key={item.id}>
              <CardContent className="flex items-center gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <Badge variant="outline">{item.section}</Badge>
                  <p className="mt-2 truncate font-medium">{title(item)}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={!canManage || index === 0}
                  onClick={() => void move(index, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={!canManage || index === items.length - 1}
                  onClick={() => void move(index, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Switch
                  checked={item.is_enabled}
                  disabled={!canManage}
                  aria-label={`Show ${title(item)}`}
                  onCheckedChange={(is_enabled) =>
                    void update.mutateAsync({
                      id: item.id,
                      data: { is_enabled },
                    })
                  }
                />
                <Button
                  size="sm"
                  variant={item.is_featured ? "secondary" : "ghost"}
                  disabled={!canManage}
                  onClick={() =>
                    void update.mutateAsync({
                      id: item.id,
                      data: { is_featured: !item.is_featured },
                    })
                  }
                >
                  {item.is_featured ? "Featured" : "Feature"}
                </Button>
                <PlacementEditButton item={item} disabled={!canManage} />
                <Button
                  size="icon"
                  variant="outline"
                  disabled={!canManage}
                  aria-label={`Remove ${title(item)}`}
                  onClick={() => void remove.mutateAsync(item.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Nothing curated yet"
          description="Add activities and events, then arrange them here."
        />
      )}
    </ContentPanel>
  );
}

function PlacementEditButton({
  item,
  disabled,
}: {
  item: VcHubPlacement;
  disabled: boolean;
}) {
  const update = useUpdateVcPlacement();
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState(item.editorial_label ?? "");
  const [title, setTitle] = useState(item.title_override ?? "");
  const [summary, setSummary] = useState(item.summary_override ?? "");
  useEffect(() => {
    setLabel(item.editorial_label ?? "");
    setTitle(item.title_override ?? "");
    setSummary(item.summary_override ?? "");
  }, [item]);
  const save = async () => {
    try {
      await update.mutateAsync({
        id: item.id,
        data: {
          editorial_label: clean(label),
          title_override: clean(title),
          summary_override: clean(summary),
        },
      });
      setOpen(false);
      toast.success("Editorial overrides saved");
    } catch (error) {
      toast.error(errorMessage(error));
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        size="icon"
        variant="ghost"
        disabled={disabled}
        aria-label="Edit presentation"
        onClick={() => setOpen(true)}
      >
        <Pencil className="size-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit presentation</DialogTitle>
          <DialogDescription>
            Override how this item is introduced on the Meet the VC page without
            changing its source record.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Editorial label">
            <Input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </Field>
          <Field label="Title override">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </Field>
          <Field label="Summary override">
            <Textarea
              rows={4}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={update.isPending} onClick={() => void save()}>
            <Save className="mr-2 size-4" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreviewTab({ hub }: { hub: VcHub }) {
  const videos = useVcVideos();
  const speeches = useVcSpeeches();
  const galleries = useVcGalleries();
  return (
    <div className="overflow-hidden rounded-2xl border bg-background shadow-sm">
      <div className="bg-primary px-6 py-12 text-primary-foreground sm:px-10">
        <Badge variant="secondary">Draft preview</Badge>
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.2em] opacity-75">
          {hub.eyebrow}
        </p>
        <h2 className="mt-3 max-w-4xl text-4xl font-semibold sm:text-6xl">
          {hub.title}
        </h2>
        <p className="mt-5 max-w-2xl text-lg opacity-75">{hub.introduction}</p>
      </div>
      <div className="grid gap-6 p-6 sm:grid-cols-3 sm:p-10">
        {[
          {
            label: "Videos",
            count: videos.data?.data.items.length ?? 0,
            icon: Film,
          },
          {
            label: "Speeches",
            count: speeches.data?.data.items.length ?? 0,
            icon: FileText,
          },
          {
            label: "Galleries",
            count: galleries.data?.data.items.length ?? 0,
            icon: Images,
          },
        ].map(({ label, count, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <Icon className="size-6 text-primary" />
              <p className="mt-4 text-3xl font-semibold">{count}</p>
              <p className="text-sm text-muted-foreground">
                {label} in the studio
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="border-t p-6 sm:p-10">
        <h3 className="text-2xl font-semibold">
          {hub.welcome_title || "A word from the Vice-Chancellor"}
        </h3>
        <p className="mt-4 max-w-3xl whitespace-pre-line leading-7 text-muted-foreground">
          {hub.welcome_message || "Add a welcome message in the Overview tab."}
        </p>
      </div>
    </div>
  );
}

function ContentPanel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
function DeleteButton({
  label,
  onDelete,
}: {
  label: string;
  onDelete: () => Promise<unknown>;
}) {
  return (
    <Button
      size="icon"
      variant="outline"
      aria-label={`Delete ${label}`}
      onClick={async () => {
        if (!confirm(`Delete "${label}"?`)) return;
        try {
          await onDelete();
          toast.success("Deleted");
        } catch (error) {
          toast.error(errorMessage(error));
        }
      }}
    >
      <Trash2 className="size-4" />
    </Button>
  );
}

export function VcStudio() {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const tab = TABS.some(([value]) => value === search.get("tab"))
    ? search.get("tab")!
    : "overview";
  const hubQuery = useVcHub();
  const { hasAnyPermission } = usePermissions();
  const permissions = permissionState(hasAnyPermission);
  const setTab = (value: string) => {
    const next = new URLSearchParams(search);
    next.set("tab", value);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };
  if (hubQuery.isLoading)
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Loader2 className="size-7 animate-spin text-primary" />
        <span className="ml-3 text-sm text-muted-foreground">
          Loading VC studio…
        </span>
      </div>
    );
  if (!hubQuery.data?.data)
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8">
        <h1 className="text-xl font-semibold">
          The VC studio could not be opened
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Confirm that the VC hub seed has run and that your account has VC
          content access.
        </p>
        <Button
          className="mt-5"
          variant="outline"
          onClick={() => void hubQuery.refetch()}
        >
          Try again
        </Button>
      </div>
    );
  const hub = hubQuery.data.data;
  return (
    <div className="space-y-7 p-4 sm:p-6 lg:p-8">
      <StudioHeader hub={hub} permissions={permissions} />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-xl p-1">
          {TABS.map(([value, label, Icon]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="min-h-11 gap-2 whitespace-nowrap"
            >
              <Icon className="size-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <OverviewTab hub={hub} canManage={permissions.canManage} />
        </TabsContent>
        <TabsContent value="videos" className="mt-6">
          <VideosTab permissions={permissions} />
        </TabsContent>
        <TabsContent value="speeches" className="mt-6">
          <SpeechesTab permissions={permissions} />
        </TabsContent>
        <TabsContent value="galleries" className="mt-6">
          <GalleriesTab permissions={permissions} />
        </TabsContent>
        <TabsContent value="activities" className="mt-6">
          <ActivitiesTab canManage={permissions.canManage} />
        </TabsContent>
        <TabsContent value="curation" className="mt-6">
          <CurationTab canManage={permissions.canManage} />
        </TabsContent>
        <TabsContent value="preview" className="mt-6">
          <PreviewTab hub={hub} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
