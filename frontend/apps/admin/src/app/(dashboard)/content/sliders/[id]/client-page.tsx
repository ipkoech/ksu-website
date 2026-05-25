"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Edit,
  Eye,
  ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { contentAttachmentRoles } from "@/components/content/content-attachment-roles";
import { ContentRecordInspector } from "@/components/content/content-record-inspector";
import { AttachmentManager, MediaPicker, useCommitPendingAttachments, type PendingMediaAttachment } from "@/components/media";
import { MainScopePicker } from "@/components/relationships";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useRichTextAttachmentUpload } from "@/hooks/use-rich-text-attachment-upload";
import { hasChangedPayload, pickChangedPayloadWithRecord, type PayloadFieldMap } from "@/lib/changed-fields";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  ImageRenderer,
  Input,
  JsonObjectEditor,
  RichTextEditor,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
  richTextToPlainText,
  sanitizeRichText,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import {
  resolveMainMediaUrl,
  useCreateSlider,
  useDeleteSlider,
  useGroupSliders,
  useMediaItem,
  useSliderGroup,
  useUpdateSlider,
} from "@ksu/api-client";
import type { Media, Slider } from "@ksu/api-client";

const schema = z
  .object({
    title: z.string().min(1, "Title is required").max(255),
    subtitle: z.string().max(255).optional(),
    plain_text: z.string().optional(),
    structured_content: z.unknown().optional(),
    desktop_media_id: z.string().uuid().optional().or(z.literal("")),
    mobile_media_id: z.string().uuid().optional().or(z.literal("")),
    external_url: z.string().url().optional().or(z.literal("")),
    link_text: z.string().max(255).optional(),
    scope_type: z.string().max(32).optional(),
    scope_id: z.string().uuid().optional().or(z.literal("")),
    display_order: z.coerce.number().int().min(0),
    start_datetime: z.string().optional(),
    end_datetime: z.string().optional(),
    archived_at: z.string().optional(),
    is_main: z.boolean(),
    is_active: z.boolean(),
    is_public: z.boolean(),
    open_in_new_tab: z.boolean(),
  })
  .refine(
    (values) => {
      if (!values.start_datetime || !values.end_datetime) return true;
      return new Date(values.end_datetime).getTime() >= new Date(values.start_datetime).getTime();
    },
    {
      path: ["end_datetime"],
      message: "End date must be after the start date.",
    },
  );

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  title: "",
  subtitle: "",
  plain_text: "",
  structured_content: undefined,
  desktop_media_id: "",
  mobile_media_id: "",
  external_url: "",
  link_text: "",
  scope_type: "",
  scope_id: "",
  display_order: 100,
  start_datetime: "",
  end_datetime: "",
  archived_at: "",
  is_main: false,
  is_active: true,
  is_public: true,
  open_in_new_tab: false,
};

const sliderPayloadFieldMap = {
  title: ["title"],
  subtitle: ["subtitle"],
  plain_text: ["plain_text", "rich_text"],
  structured_content: ["structured_content"],
  desktop_media_id: ["desktop_media_id"],
  mobile_media_id: ["mobile_media_id"],
  external_url: ["external_url"],
  link_text: ["link_text"],
  scope_type: ["scope_type"],
  scope_id: ["scope_id"],
  display_order: ["display_order"],
  start_datetime: ["start_datetime"],
  end_datetime: ["end_datetime"],
  archived_at: ["archived_at"],
  is_main: ["is_main"],
  is_active: ["is_active"],
  is_public: ["is_public"],
  open_in_new_tab: ["open_in_new_tab"],
} satisfies PayloadFieldMap<Partial<Slider>>;

function toDateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDateTimeInput(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function optionalObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return Object.keys(value).length ? (value as Record<string, unknown>) : null;
}

function sliderValues(slider: Slider): FormValues {
  return {
    title: slider.title ?? "",
    subtitle: slider.subtitle ?? "",
    plain_text: slider.rich_text ?? slider.plain_text ?? "",
    structured_content: slider.structured_content ?? undefined,
    desktop_media_id: slider.desktop_media_id ?? "",
    mobile_media_id: slider.mobile_media_id ?? "",
    external_url: slider.external_url ?? "",
    link_text: slider.link_text ?? "",
    scope_type: slider.scope_type ?? "",
    scope_id: slider.scope_id ?? "",
    display_order: slider.display_order ?? 100,
    start_datetime: toDateTimeInput(slider.start_datetime),
    end_datetime: toDateTimeInput(slider.end_datetime),
    archived_at: toDateTimeInput(slider.archived_at),
    is_main: slider.is_main ?? false,
    is_active: slider.is_active ?? true,
    is_public: slider.is_public ?? true,
    open_in_new_tab: slider.open_in_new_tab ?? false,
  };
}

function mediaUrl(media?: Media | null) {
  if (!media) return null;
  return (
    resolveMainMediaUrl(media.cdn_url) ??
    resolveMainMediaUrl(media.public_url) ??
    resolveMainMediaUrl(media.thumbnail_url) ??
    resolveMainMediaUrl(media.url) ??
    null
  );
}

function mediaLabel(media?: Media | null) {
  return media?.title || media?.original_filename || media?.filename || "Selected image";
}

function MediaThumb({ media, className = "h-20 w-28" }: { media?: Media | null; className?: string }) {
  const url = mediaUrl(media);

  return (
    <div className={`overflow-hidden rounded-lg border bg-muted ${className}`}>
      {url ? (
        <ImageRenderer src={url} alt={mediaLabel(media)} className="h-full border-0" imageClassName="h-full w-full" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
          <ImageIcon className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}

function sliderStatus(slider: Slider) {
  const now = Date.now();
  const startsAt = slider.start_datetime ? new Date(slider.start_datetime).getTime() : null;
  const endsAt = slider.end_datetime ? new Date(slider.end_datetime).getTime() : null;

  if (slider.archived_at) return { label: "Archived", variant: "secondary" as const };
  if (!slider.is_active) return { label: "Inactive", variant: "secondary" as const };
  if (startsAt && startsAt > now) return { label: "Scheduled", variant: "outline" as const };
  if (endsAt && endsAt < now) return { label: "Ended", variant: "secondary" as const };
  return { label: "Active", variant: "default" as const };
}

function SlideRow({
  slider,
  onView,
  onEdit,
  onDelete,
}: {
  slider: Slider;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const previewMediaId = slider.desktop_media_id || slider.mobile_media_id || "";
  const mediaQuery = useMediaItem(previewMediaId, { enabled: Boolean(previewMediaId) });
  const status = sliderStatus(slider);

  return (
    <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 gap-3">
        <MediaThumb media={mediaQuery.data?.data ?? null} className="h-20 w-28 shrink-0" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-medium">{slider.title}</p>
            <Badge variant={status.variant}>{status.label}</Badge>
            {slider.is_public ? <Badge variant="outline">Public</Badge> : <Badge variant="secondary">Private</Badge>}
            {slider.is_main ? <Badge variant="outline">Main</Badge> : null}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{slider.subtitle || slider.plain_text || "No slide text"}</p>
          <p className="mt-1 text-xs text-muted-foreground">Display order {slider.display_order}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onView}>
          <Eye className="mr-2 h-4 w-4" />
          Details
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button type="button" variant="outline" size="sm" className="text-destructive" onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function SliderItemsPage() {
  const groupId = useParams().id as string;
  const groupQuery = useSliderGroup(groupId);
  const slidersQuery = useGroupSliders(groupId);
  const createSlider = useCreateSlider();
  const updateSlider = useUpdateSlider();
  const deleteSlider = useDeleteSlider();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Slider | null>(null);
  const [pendingAttachments, setPendingAttachments] = useState<PendingMediaAttachment[]>([]);
  const commitPendingAttachments = useCommitPendingAttachments();
  const sliders = useMemo(() => slidersQuery.data?.data ?? [], [slidersQuery.data]);
  const editingSlider = sliders.find((slider) => slider.id === editingId) ?? null;
  const detailSlider = sliders.find((slider) => slider.id === detailId) ?? null;
  const uploadEditorAttachment = useRichTextAttachmentUpload({
    entityType: "slider",
    entityId: editingSlider?.id,
    role: "body-attachment",
  });
  const isPending = createSlider.isPending || updateSlider.isPending;
  const groupName = groupQuery.data?.data?.name ?? "selected group";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    values: editingSlider ? sliderValues(editingSlider) : defaultValues,
  });

  const openCreatePanel = () => {
    setEditingId(null);
    setPendingAttachments([]);
    form.reset(defaultValues);
    setEditorOpen(true);
  };

  const openEditPanel = (slider: Slider) => {
    setEditingId(slider.id);
    setPendingAttachments([]);
    form.reset(sliderValues(slider));
    setEditorOpen(true);
  };

  const closeEditorPanel = () => {
    setEditorOpen(false);
    setEditingId(null);
    setPendingAttachments([]);
    form.reset(defaultValues);
  };

  const activeSlides = sliders.filter((slider) => sliderStatus(slider).label === "Active").length;
  const scheduledSlides = sliders.filter((slider) => sliderStatus(slider).label === "Scheduled").length;
  const privateSlides = sliders.filter((slider) => slider.is_public === false).length;

  const onSubmit = async (values: FormValues) => {
    const cleanBody = sanitizeRichText(values.plain_text);
    const payload: Partial<Slider> = {
      slider_group_id: groupId,
      title: values.title,
      subtitle: values.subtitle || null,
      plain_text: richTextToPlainText(cleanBody) || null,
      rich_text: cleanBody || null,
      structured_content: optionalObject(values.structured_content),
      desktop_media_id: values.desktop_media_id || null,
      mobile_media_id: values.mobile_media_id || null,
      external_url: values.external_url || null,
      link_text: values.link_text || null,
      scope_type: values.scope_type || null,
      scope_id: values.scope_id || null,
      display_order: values.display_order,
      start_datetime: fromDateTimeInput(values.start_datetime),
      end_datetime: fromDateTimeInput(values.end_datetime),
      archived_at: editingSlider ? fromDateTimeInput(values.archived_at) : undefined,
      is_main: values.is_main,
      is_active: values.is_active,
      is_public: values.is_public,
      open_in_new_tab: values.open_in_new_tab,
    };

    try {
      if (editingSlider) {
        const patch = pickChangedPayloadWithRecord(
          payload,
          form.formState.dirtyFields as Record<string, unknown>,
          sliderPayloadFieldMap,
          editingSlider,
        );
        if (!hasChangedPayload(patch) && !pendingAttachments.length) {
          toast.info("No changes to save");
          return;
        }
        if (hasChangedPayload(patch)) {
          await updateSlider.mutateAsync({ id: editingSlider.id, data: patch });
        }
        if (pendingAttachments.length) {
          await commitPendingAttachments({ entityType: "slider", entityId: editingSlider.id, attachments: pendingAttachments });
          setPendingAttachments([]);
        }
        toast.success("Slider updated successfully");
      } else {
        const response = await createSlider.mutateAsync({ groupId, data: payload });
        if (pendingAttachments.length) {
          await commitPendingAttachments({ entityType: "slider", entityId: response.data.id, attachments: pendingAttachments });
          setPendingAttachments([]);
        }
        toast.success("Slider created successfully");
      }
      closeEditorPanel();
    } catch {
      toast.error(editingSlider ? "Failed to update slider" : "Failed to create slider");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteSlider.mutateAsync(deleteTarget.id);
      toast.success("Slider deleted successfully");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete slider");
    }
  };

  if (groupQuery.isLoading || slidersQuery.isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Sliders"
        description={`Slider items for ${groupName}`}
        backHref="/content/sliders"
        actions={
          <Button type="button" onClick={openCreatePanel}>
            <Plus className="h-4 w-4" />
            Add Slider
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total slides</p>
            <p className="mt-2 text-2xl font-bold">{sliders.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Active now</p>
            <p className="mt-2 text-2xl font-bold">{activeSlides}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Scheduled</p>
            <p className="mt-2 text-2xl font-bold">{scheduledSlides}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Private</p>
            <p className="mt-2 text-2xl font-bold">{privateSlides}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Slides</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Review live, scheduled, private, and inactive slider items for this group.</p>
          </div>
          <Button type="button" variant="outline" onClick={openCreatePanel}>
            <Plus className="h-4 w-4" />
            Add Slider
          </Button>
        </CardHeader>
        <CardContent>
          {sliders.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
              <ImageIcon className="mx-auto h-9 w-9 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No slides have been added</p>
              <p className="mt-1 text-sm text-muted-foreground">Create the first slide for this slider group.</p>
              <Button type="button" className="mt-4" onClick={openCreatePanel}>
                <Plus className="h-4 w-4" />
                Add Slider
              </Button>
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {sliders.map((slider) => (
                <SlideRow
                  key={slider.id}
                  slider={slider}
                  onView={() => setDetailId(slider.id)}
                  onEdit={() => openEditPanel(slider)}
                  onDelete={() => setDeleteTarget(slider)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet
        open={editorOpen}
        onOpenChange={(open) => {
          if (open) {
            setEditorOpen(true);
          } else {
            closeEditorPanel();
          }
        }}
      >
        <SheetContent className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl">
          <SheetHeader className="border-b px-6 py-5">
            <SheetTitle>{editingSlider ? "Edit Slider" : "Add Slider"}</SheetTitle>
            <SheetDescription>
              {editingSlider ? `Update "${editingSlider.title}" and save only changed fields.` : "Create a new slide for this slider group."}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                  <div className="min-w-0 space-y-5">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Slide Content</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                          <FormItem><FormLabel>Title *</FormLabel><Input placeholder="Slide title" {...field} /><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="subtitle" render={({ field }) => (
                          <FormItem><FormLabel>Subtitle</FormLabel><Input placeholder="Slide subtitle" {...field} /><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="plain_text" render={({ field }) => (
                          <FormItem><FormLabel>Body</FormLabel><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="16rem" maxHeight="36rem" placeholder="Slide text" onAttachmentUpload={uploadEditorAttachment} /><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="structured_content" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Structured content</FormLabel>
                            <JsonObjectEditor value={field.value} onChange={field.onChange} allowCustomFields emptyLabel="No structured content added." />
                            <FormMessage />
                          </FormItem>
                        )} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Images</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <FormField control={form.control} name="desktop_media_id" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Desktop image</FormLabel>
                            <MediaPicker
                              label="Desktop image"
                              value={field.value ?? ""}
                              onChange={(value) => field.onChange(value)}
                              mediaType="image"
                              accept="image/*"
                              helperText="Recommended for wide hero banners."
                            />
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="mobile_media_id" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mobile image</FormLabel>
                            <MediaPicker
                              label="Mobile image"
                              value={field.value ?? ""}
                              onChange={(value) => field.onChange(value)}
                              mediaType="image"
                              accept="image/*"
                              helperText="Optional portrait or compact crop for small screens."
                            />
                            <FormMessage />
                          </FormItem>
                        )} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Attachments</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <AttachmentManager
                          entityType="slider"
                          entityId={editingSlider?.id}
                          roles={contentAttachmentRoles}
                          pendingAttachments={pendingAttachments}
                          onPendingAttachmentsChange={setPendingAttachments}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-5">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Link</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField control={form.control} name="external_url" render={({ field }) => (
                          <FormItem><FormLabel>Link URL</FormLabel><Input placeholder="https://..." {...field} /><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="link_text" render={({ field }) => (
                          <FormItem><FormLabel>Link Text</FormLabel><Input placeholder="Learn more" {...field} /><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="open_in_new_tab" render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <FormLabel className="cursor-pointer">Open in new tab</FormLabel>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormItem>
                        )} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Schedule</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField control={form.control} name="start_datetime" render={({ field }) => (
                          <FormItem><FormLabel>Starts</FormLabel><Input type="datetime-local" {...field} /><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="end_datetime" render={({ field }) => (
                          <FormItem><FormLabel>Ends</FormLabel><Input type="datetime-local" {...field} /><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="display_order" render={({ field }) => (
                          <FormItem><FormLabel>Display Order</FormLabel><Input type="number" min={0} {...field} /><FormMessage /></FormItem>
                        )} />
                        {editingSlider ? (
                          <FormField control={form.control} name="archived_at" render={({ field }) => (
                            <FormItem><FormLabel>Archived at</FormLabel><Input type="datetime-local" {...field} /><FormMessage /></FormItem>
                          )} />
                        ) : null}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Scope</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField control={form.control} name="scope_type" render={({ field }) => (
                          <FormItem>
                            <MainScopePicker
                              label="Relationship"
                              description="Scope this slide to a school, department, programme, division, or intake."
                              typeValue={field.value}
                              idValue={form.watch("scope_id")}
                              onChange={(value) => {
                                form.setValue("scope_type", value.type, { shouldDirty: true, shouldValidate: true });
                                form.setValue("scope_id", value.id, { shouldDirty: true, shouldValidate: true });
                              }}
                            />
                            <FormMessage />
                          </FormItem>
                        )} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Visibility</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {(["is_active", "is_public", "is_main"] as const).map((name) => (
                          <FormField key={name} control={form.control} name={name} render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-3">
                              <FormLabel className="cursor-pointer">{name.replace(/_/g, " ")}</FormLabel>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormItem>
                          )} />
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <SheetFooter className="border-t bg-background px-6 py-4">
                <Button type="button" variant="outline" onClick={closeEditorPanel}>Cancel</Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : editingSlider ? "Save Slide" : "Add Slide"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <Sheet
        open={Boolean(detailSlider)}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-5xl">
          <SheetHeader>
            <SheetTitle>{detailSlider?.title ?? "Slider details"}</SheetTitle>
            <SheetDescription>Review placement, schedule, media, links, and content before editing this slide.</SheetDescription>
          </SheetHeader>
          {detailSlider ? (
            <div className="mt-6">
              <ContentRecordInspector
                kind="slider"
                record={detailSlider}
                compact
                mediaFields={[
                  {
                    label: "Desktop image",
                    mediaId: detailSlider.desktop_media_id,
                    description: "Wide hero crop used for desktop layouts.",
                    icon: "desktop",
                  },
                  {
                    label: "Mobile image",
                    mediaId: detailSlider.mobile_media_id,
                    description: "Compact crop used on small screens.",
                    icon: "mobile",
                  },
                ]}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete slide?"
        description={`This will remove "${deleteTarget?.title ?? "this slide"}" from the slider group.`}
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        isLoading={deleteSlider.isPending}
      />
    </div>
  );
}
