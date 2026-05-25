"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { contentAttachmentRoles } from "@/components/content/content-attachment-roles";
import { ContentRecordInspector } from "@/components/content/content-record-inspector";
import { AttachmentManager, MediaPicker, useCommitPendingAttachments, type PendingMediaAttachment } from "@/components/media";
import { MainScopePicker, UserPicker } from "@/components/relationships";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { useRichTextAttachmentUpload } from "@/hooks/use-rich-text-attachment-upload";
import { useRichTextImageUpload } from "@/hooks/use-rich-text-image-upload";
import { hasChangedPayload, pickChangedPayloadWithRecord, type PayloadFieldMap } from "@/lib/changed-fields";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  JsonObjectEditor,
  RichTextEditor,
  Switch,
  Textarea,
  richTextToPlainText,
  sanitizeRichText,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useAnnouncement, useCreateAnnouncement, useUpdateAnnouncement } from "@ksu/api-client";
import type { Announcement } from "@ksu/api-client";

const schema = z
  .object({
    title: z.string().min(1, "Title is required").max(255),
    slug: z.string().optional(),
    summary: z.string().optional(),
    plain_text: z.string().optional(),
    priority: z.string().min(1).max(32),
    category: z.string().max(64).optional(),
    audience: z.string().min(1).max(64),
    scope_type: z.string().max(32).optional(),
    scope_id: z.string().uuid().optional().or(z.literal("")),
    featured_media_id: z.string().uuid().optional().or(z.literal("")),
    author_user_id: z.string().uuid().optional().or(z.literal("")),
    is_published: z.boolean(),
    is_main: z.boolean(),
    is_public: z.boolean(),
    published_at: z.string().optional(),
    valid_from: z.string().optional(),
    valid_to: z.string().optional(),
    archived_at: z.string().optional(),
    status: z.string().max(32).optional(),
    display_order: z.coerce.number().int().min(0),
    meta_title: z.string().max(255).optional(),
    meta_description: z.string().max(500).optional(),
    keywords: z.unknown().optional(),
    related_links: z.unknown().optional(),
    structured_content: z.unknown().optional(),
  })
  .refine(
    (values) => {
      if (!values.valid_from || !values.valid_to) return true;
      return new Date(values.valid_to).getTime() >= new Date(values.valid_from).getTime();
    },
    { path: ["valid_to"], message: "Valid to must be after valid from." },
  );

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  title: "",
  slug: "",
  summary: "",
  plain_text: "",
  priority: "normal",
  category: "general",
  audience: "all",
  scope_type: "",
  scope_id: "",
  featured_media_id: "",
  author_user_id: "",
  is_published: false,
  is_main: false,
  is_public: true,
  published_at: "",
  valid_from: "",
  valid_to: "",
  archived_at: "",
  status: "draft",
  display_order: 100,
  meta_title: "",
  meta_description: "",
  keywords: undefined,
  related_links: undefined,
  structured_content: undefined,
};

const announcementPayloadFieldMap = {
  title: ["title"],
  slug: ["slug"],
  summary: ["summary"],
  plain_text: ["plain_text", "rich_text"],
  priority: ["priority"],
  category: ["category"],
  audience: ["audience"],
  scope_type: ["scope_type"],
  scope_id: ["scope_id"],
  featured_media_id: ["featured_media_id"],
  author_user_id: ["author_user_id"],
  is_published: ["is_published", "status", "published_at"],
  is_main: ["is_main"],
  is_public: ["is_public"],
  published_at: ["published_at"],
  valid_from: ["valid_from"],
  valid_to: ["valid_to"],
  archived_at: ["archived_at"],
  status: ["status"],
  display_order: ["display_order"],
  meta_title: ["meta_title"],
  meta_description: ["meta_description"],
  keywords: ["keywords"],
  related_links: ["related_links"],
  structured_content: ["structured_content"],
} satisfies PayloadFieldMap<Partial<Announcement>>;

const relatedLinkFields = [
  { key: "title", label: "Title", placeholder: "Admissions portal" },
  { key: "url", label: "URL", type: "url" as const, placeholder: "https://..." },
  { key: "description", label: "Description", placeholder: "Optional context" },
];

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

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

function optionalObjectArray(value: unknown) {
  if (!Array.isArray(value)) return null;
  const items = value.filter((item) => item && typeof item === "object" && Object.keys(item).length);
  return items.length ? (items as Array<Record<string, unknown>>) : null;
}

function announcementValues(announcement: Announcement): FormValues {
  return {
    title: announcement.title ?? "",
    slug: announcement.slug ?? "",
    summary: announcement.summary ?? "",
    plain_text: announcement.rich_text ?? announcement.plain_text ?? announcement.content ?? "",
    priority: announcement.priority ?? "normal",
    category: announcement.category ?? "general",
    audience: announcement.audience ?? "all",
    scope_type: announcement.scope_type ?? "",
    scope_id: announcement.scope_id ?? "",
    featured_media_id: announcement.featured_media_id ?? "",
    author_user_id: announcement.author_user_id ?? "",
    is_published: announcement.is_published ?? false,
    is_main: announcement.is_main ?? false,
    is_public: announcement.is_public ?? true,
    published_at: toDateTimeInput(announcement.published_at),
    valid_from: toDateTimeInput(announcement.valid_from),
    valid_to: toDateTimeInput(announcement.valid_to),
    archived_at: toDateTimeInput(announcement.archived_at),
    status: announcement.status ?? (announcement.is_published ? "published" : "draft"),
    display_order: announcement.display_order ?? 100,
    meta_title: announcement.meta_title ?? "",
    meta_description: announcement.meta_description ?? "",
    keywords: announcement.keywords ?? undefined,
    related_links: announcement.related_links ?? undefined,
    structured_content: announcement.structured_content ?? undefined,
  };
}

export default function AnnouncementEditorPage() {
  const router = useRouter();
  const id = useParams().id as string;
  const isNew = id === "new";
  const announcementQuery = useAnnouncement(isNew ? "" : id, { enabled: !isNew });
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const uploadEditorImage = useRichTextImageUpload();
  const announcement = announcementQuery.data?.data ?? null;
  const uploadEditorAttachment = useRichTextAttachmentUpload({ entityType: "announcement", entityId: announcement?.id, role: "body-attachment" });
  const [pendingAttachments, setPendingAttachments] = useState<PendingMediaAttachment[]>([]);
  const commitPendingAttachments = useCommitPendingAttachments();
  const isPending = createAnnouncement.isPending || updateAnnouncement.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    values: announcement ? announcementValues(announcement) : defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    const cleanBody = sanitizeRichText(values.plain_text);
    const publishedAt =
      fromDateTimeInput(values.published_at) ??
      (values.is_published ? announcement?.published_at ?? new Date().toISOString() : null);
    const status = values.status || (values.is_published ? "published" : "draft");
    const payload: Partial<Announcement> = {
      title: values.title,
      slug: values.slug || slugify(values.title),
      summary: values.summary || null,
      plain_text: richTextToPlainText(cleanBody) || null,
      rich_text: cleanBody || null,
      priority: values.priority,
      category: values.category || null,
      audience: values.audience,
      scope_type: values.scope_type || null,
      scope_id: values.scope_id || null,
      featured_media_id: values.featured_media_id || null,
      author_user_id: values.author_user_id || null,
      is_published: values.is_published,
      is_main: values.is_main,
      is_public: values.is_public,
      published_at: publishedAt,
      valid_from: fromDateTimeInput(values.valid_from),
      valid_to: fromDateTimeInput(values.valid_to),
      archived_at: isNew ? undefined : fromDateTimeInput(values.archived_at),
      status,
      display_order: values.display_order,
      meta_title: values.meta_title || null,
      meta_description: values.meta_description || null,
      keywords: optionalObject(values.keywords),
      related_links: optionalObjectArray(values.related_links),
      structured_content: optionalObject(values.structured_content),
    };

    try {
      if (isNew) {
        const response = await createAnnouncement.mutateAsync(payload);
        if (pendingAttachments.length) {
          await commitPendingAttachments({ entityType: "announcement", entityId: response.data.id, attachments: pendingAttachments });
          setPendingAttachments([]);
        }
        toast.success("Announcement created successfully");
      } else {
        const patch = pickChangedPayloadWithRecord(
          payload,
          form.formState.dirtyFields as Record<string, unknown>,
          announcementPayloadFieldMap,
          announcement,
        );
        if (!hasChangedPayload(patch) && !pendingAttachments.length) {
          toast.info("No changes to save");
          return;
        }
        if (hasChangedPayload(patch)) {
          await updateAnnouncement.mutateAsync({ id: announcement!.id, data: patch });
        }
        if (pendingAttachments.length) {
          await commitPendingAttachments({ entityType: "announcement", entityId: announcement!.id, attachments: pendingAttachments });
          setPendingAttachments([]);
        }
        toast.success("Announcement updated successfully");
      }
      router.push("/content/announcements");
    } catch {
      toast.error(isNew ? "Failed to create announcement" : "Failed to update announcement");
    }
  };

  if (announcementQuery.isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title={isNew ? "Create Announcement" : "Edit Announcement"}
        description={isNew ? "Create a new announcement" : `Editing: ${announcement?.title}`}
        backHref="/content/announcements"
      />

      {!isNew && announcement ? <ContentRecordInspector kind="announcement" record={announcement} /> : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="min-w-0 space-y-6">
              <Card>
                <CardHeader><CardTitle>Announcement Content</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="Announcement title" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="announcement-slug" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="summary" render={({ field }) => (
                    <FormItem><FormLabel>Summary</FormLabel><FormControl><Textarea rows={4} placeholder="Short public summary" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="plain_text" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          minHeight="18rem"
                          maxHeight="70vh"
                          placeholder="Announcement body"
                          onImageUpload={uploadEditorImage}
                          onAttachmentUpload={uploadEditorAttachment}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Metadata And Links</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <FormField control={form.control} name="related_links" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Related links</FormLabel>
                      <JsonObjectEditor
                        mode="array"
                        value={field.value}
                        onChange={field.onChange}
                        fields={relatedLinkFields}
                        itemLabel="Link"
                        addLabel="Add link"
                        emptyLabel="No related links added."
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid gap-6 lg:grid-cols-2">
                    <FormField control={form.control} name="keywords" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Keywords</FormLabel>
                        <JsonObjectEditor value={field.value} onChange={field.onChange} allowCustomFields emptyLabel="No keywords added." />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="structured_content" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Structured content</FormLabel>
                        <JsonObjectEditor value={field.value} onChange={field.onChange} allowCustomFields emptyLabel="No structured content added." />
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Classification</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                    <FormField control={form.control} name="priority" render={({ field }) => (
                      <FormItem><FormLabel>Priority</FormLabel><FormControl><Input placeholder="normal" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="general" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="audience" render={({ field }) => (
                      <FormItem><FormLabel>Audience</FormLabel><FormControl><Input placeholder="all" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Featured Media</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="featured_media_id" render={({ field }) => (
                    <FormItem>
                      <MediaPicker
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        mediaType="image"
                        accept="image/*"
                        label="Featured image"
                        helperText="Shown on announcement lists, detail pages, and sharing previews."
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <AttachmentManager
                    entityType="announcement"
                    entityId={announcement?.id}
                    roles={contentAttachmentRoles}
                    pendingAttachments={pendingAttachments}
                    onPendingAttachmentsChange={setPendingAttachments}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {(["is_published", "is_main", "is_public"] as const).map((name) => (
                    <FormField key={name} control={form.control} name={name} render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel className="cursor-pointer">{name.replace("is_", "").replace("_", " ")}</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                  ))}
                  <FormField control={form.control} name="status" render={({ field }) => (
                    <FormItem><FormLabel>Status</FormLabel><FormControl><Input placeholder="draft" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="display_order" render={({ field }) => (
                    <FormItem><FormLabel>Display order</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="published_at" render={({ field }) => (
                    <FormItem><FormLabel>Published at</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="valid_from" render={({ field }) => (
                    <FormItem><FormLabel>Valid from</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="valid_to" render={({ field }) => (
                    <FormItem><FormLabel>Valid to</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  {!isNew ? (
                    <FormField control={form.control} name="archived_at" render={({ field }) => (
                      <FormItem><FormLabel>Archived at</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Scope And Ownership</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="scope_type" render={({ field }) => (
                    <FormItem>
                      <MainScopePicker
                        label="Relationship"
                        description="Scope this announcement to a school, department, programme, division, or intake."
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
                  <FormField control={form.control} name="author_user_id" render={({ field }) => (
                    <FormItem>
                      <UserPicker
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        filters={{ is_active: true }}
                        label="Author"
                        placeholder="Select author"
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="meta_title" render={({ field }) => (
                    <FormItem><FormLabel>Meta title</FormLabel><FormControl><Input placeholder="Search title" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="meta_description" render={({ field }) => (
                    <FormItem><FormLabel>Meta description</FormLabel><FormControl><Textarea rows={4} placeholder="Search description" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              {!isNew && announcement ? (
                <Card>
                  <CardHeader><CardTitle>Record Metadata</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>Created: {new Date(announcement.created_at).toLocaleString()}</p>
                    <p>Updated: {new Date(announcement.updated_at).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : isNew ? "Create Announcement" : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/content/announcements")}>Cancel</Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
