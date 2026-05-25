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
import { useBlog, useCreateBlog, useUpdateBlog } from "@ksu/api-client";
import type { Blog } from "@ksu/api-client";

const schema = z
  .object({
    title: z.string().min(1, "Title is required").max(255),
    slug: z.string().optional(),
    summary: z.string().optional(),
    plain_text: z.string().optional(),
    excerpt: z.string().optional(),
    featured_media_id: z.string().uuid().optional().or(z.literal("")),
    author_user_id: z.string().uuid().optional().or(z.literal("")),
    scope_type: z.string().max(32).optional(),
    scope_id: z.string().uuid().optional().or(z.literal("")),
    is_published: z.boolean(),
    is_featured: z.boolean(),
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
  excerpt: "",
  featured_media_id: "",
  author_user_id: "",
  scope_type: "",
  scope_id: "",
  is_published: false,
  is_featured: false,
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

const blogPayloadFieldMap = {
  title: ["title"],
  slug: ["slug"],
  summary: ["summary"],
  plain_text: ["plain_text", "rich_text"],
  excerpt: ["excerpt"],
  featured_media_id: ["featured_media_id"],
  author_user_id: ["author_user_id"],
  scope_type: ["scope_type"],
  scope_id: ["scope_id"],
  is_published: ["is_published", "status", "published_at"],
  is_featured: ["is_featured"],
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
} satisfies PayloadFieldMap<Partial<Blog>>;

const relatedLinkFields = [
  { key: "title", label: "Title", placeholder: "Related item" },
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

function blogValues(blog: Blog): FormValues {
  return {
    title: blog.title ?? "",
    slug: blog.slug ?? "",
    summary: blog.summary ?? "",
    plain_text: blog.rich_text ?? blog.plain_text ?? blog.content ?? "",
    excerpt: blog.excerpt ?? "",
    featured_media_id: blog.featured_media_id ?? blog.cover_image_id ?? "",
    author_user_id: blog.author_user_id ?? "",
    scope_type: blog.scope_type ?? "",
    scope_id: blog.scope_id ?? "",
    is_published: blog.is_published ?? false,
    is_featured: blog.is_featured ?? false,
    is_main: blog.is_main ?? false,
    is_public: blog.is_public ?? true,
    published_at: toDateTimeInput(blog.published_at),
    valid_from: toDateTimeInput(blog.valid_from),
    valid_to: toDateTimeInput(blog.valid_to),
    archived_at: toDateTimeInput(blog.archived_at),
    status: blog.status ?? (blog.is_published ? "published" : "draft"),
    display_order: blog.display_order ?? 100,
    meta_title: blog.meta_title ?? "",
    meta_description: blog.meta_description ?? "",
    keywords: blog.keywords ?? undefined,
    related_links: blog.related_links ?? undefined,
    structured_content: blog.structured_content ?? undefined,
  };
}

export default function BlogEditorPage() {
  const router = useRouter();
  const id = useParams().id as string;
  const isNew = id === "new";
  const blogQuery = useBlog(isNew ? "" : id, { enabled: !isNew });
  const createBlog = useCreateBlog();
  const updateBlog = useUpdateBlog();
  const uploadEditorImage = useRichTextImageUpload();
  const blog = blogQuery.data?.data ?? null;
  const uploadEditorAttachment = useRichTextAttachmentUpload({ entityType: "blog", entityId: blog?.id, role: "body-attachment" });
  const [pendingAttachments, setPendingAttachments] = useState<PendingMediaAttachment[]>([]);
  const commitPendingAttachments = useCommitPendingAttachments();
  const isPending = createBlog.isPending || updateBlog.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    values: blog ? blogValues(blog) : defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    const cleanContent = sanitizeRichText(values.plain_text);
    const publishedAt =
      fromDateTimeInput(values.published_at) ??
      (values.is_published ? blog?.published_at ?? new Date().toISOString() : null);
    const payload: Partial<Blog> = {
      title: values.title,
      slug: values.slug || slugify(values.title),
      summary: values.summary || null,
      plain_text: richTextToPlainText(cleanContent) || null,
      rich_text: cleanContent || null,
      excerpt: values.excerpt || null,
      featured_media_id: values.featured_media_id || null,
      author_user_id: values.author_user_id || null,
      scope_type: values.scope_type || null,
      scope_id: values.scope_id || null,
      is_published: values.is_published,
      is_featured: values.is_featured,
      is_main: values.is_main,
      is_public: values.is_public,
      published_at: publishedAt,
      valid_from: fromDateTimeInput(values.valid_from),
      valid_to: fromDateTimeInput(values.valid_to),
      archived_at: isNew ? undefined : fromDateTimeInput(values.archived_at),
      status: values.status || (values.is_published ? "published" : "draft"),
      display_order: values.display_order,
      meta_title: values.meta_title || null,
      meta_description: values.meta_description || null,
      keywords: optionalObject(values.keywords),
      related_links: optionalObjectArray(values.related_links),
      structured_content: optionalObject(values.structured_content),
    };

    try {
      if (isNew) {
        const response = await createBlog.mutateAsync(payload);
        if (pendingAttachments.length) {
          await commitPendingAttachments({ entityType: "blog", entityId: response.data.id, attachments: pendingAttachments });
          setPendingAttachments([]);
        }
        toast.success("Blog created successfully");
      } else {
        const patch = pickChangedPayloadWithRecord(
          payload,
          form.formState.dirtyFields as Record<string, unknown>,
          blogPayloadFieldMap,
          blog,
        );
        if (!hasChangedPayload(patch) && !pendingAttachments.length) {
          toast.info("No changes to save");
          return;
        }
        if (hasChangedPayload(patch)) {
          await updateBlog.mutateAsync({ id: blog!.id, data: patch });
        }
        if (pendingAttachments.length) {
          await commitPendingAttachments({ entityType: "blog", entityId: blog!.id, attachments: pendingAttachments });
          setPendingAttachments([]);
        }
        toast.success("Blog updated successfully");
      }
      router.push("/content/blogs");
    } catch {
      toast.error(isNew ? "Failed to create blog" : "Failed to update blog");
    }
  };

  if (blogQuery.isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title={isNew ? "Create Blog" : "Edit Blog"} description={isNew ? "Create a new blog post" : `Editing: ${blog?.title}`} backHref="/content/blogs" />
      {!isNew && blog ? <ContentRecordInspector kind="blog" record={blog} /> : null}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Blog Content</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="Blog title" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="blog-slug" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="summary" render={({ field }) => (
                  <FormItem><FormLabel>Summary</FormLabel><FormControl><Textarea rows={4} placeholder="Short summary" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="excerpt" render={({ field }) => (
                  <FormItem><FormLabel>Excerpt</FormLabel><FormControl><Textarea rows={3} placeholder="Blog excerpt" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="plain_text" render={({ field }) => (
                  <FormItem><FormLabel>Content</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} minHeight="18rem" maxHeight="70vh" placeholder="Blog body" onImageUpload={uploadEditorImage} onAttachmentUpload={uploadEditorAttachment} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Metadata And Links</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <FormField control={form.control} name="related_links" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related links</FormLabel>
                    <JsonObjectEditor mode="array" value={field.value} onChange={field.onChange} fields={relatedLinkFields} itemLabel="Link" addLabel="Add link" emptyLabel="No related links added." />
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

            <div className="space-y-6 lg:col-start-3 lg:row-start-1">
              <Card>
                <CardHeader><CardTitle>Media</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="featured_media_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Featured image</FormLabel>
                      <MediaPicker
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        mediaType="image"
                        accept="image/*"
                        label="Featured image"
                        helperText="Shown on blog lists, detail pages, and sharing previews."
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <AttachmentManager
                    entityType="blog"
                    entityId={blog?.id}
                    roles={contentAttachmentRoles}
                    pendingAttachments={pendingAttachments}
                    onPendingAttachmentsChange={setPendingAttachments}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {(["is_published", "is_featured", "is_main", "is_public"] as const).map((name) => (
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
                  <FormField control={form.control} name="published_at" render={({ field }) => (
                    <FormItem><FormLabel>Published at</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                    <FormField control={form.control} name="valid_from" render={({ field }) => (
                      <FormItem><FormLabel>Valid from</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="valid_to" render={({ field }) => (
                      <FormItem><FormLabel>Valid to</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="display_order" render={({ field }) => (
                    <FormItem><FormLabel>Display order</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
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
                        description="Scope this blog post to a school, department, programme, division, or intake."
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
                    <FormItem><FormLabel>Meta title</FormLabel><FormControl><Input placeholder="SEO title" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="meta_description" render={({ field }) => (
                    <FormItem><FormLabel>Meta description</FormLabel><FormControl><Textarea rows={3} placeholder="SEO description" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : isNew ? "Create Blog" : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/content/blogs")}>Cancel</Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
