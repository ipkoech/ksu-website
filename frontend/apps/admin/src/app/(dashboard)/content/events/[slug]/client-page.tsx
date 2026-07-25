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
import { MainScopePicker } from "@/components/relationships";
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
import { useCreateEvent, useEvent, useUpdateEvent } from "@ksu/api-client";
import type { Event } from "@ksu/api-client";

const eventSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(255),
    slug: z.string().optional(),
    summary: z.string().optional(),
    content: z.string().optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional(),
    location: z.string().max(255).optional(),
    is_virtual: z.boolean(),
    meeting_link: z.string().url().optional().or(z.literal("")),
    featured_media_id: z.string().uuid().optional().or(z.literal("")),
    scope_type: z.string().max(32).optional(),
    scope_id: z.string().uuid().optional().or(z.literal("")),
    is_featured: z.boolean(),
    is_main: z.boolean(),
    valid_from: z.string().optional(),
    valid_to: z.string().optional(),
    display_order: z.coerce.number().int().min(0),
    meta_title: z.string().max(255).optional(),
    meta_description: z.string().max(500).optional(),
    keywords: z.unknown().optional(),
    related_links: z.unknown().optional(),
    structured_content: z.unknown().optional(),
  })
  .refine(
    (values) => {
      if (!values.start_date || !values.end_date) return true;
      return new Date(values.end_date).getTime() >= new Date(values.start_date).getTime();
    },
    { path: ["end_date"], message: "End date must be after start date." },
  )
  .refine(
    (values) => {
      if (!values.valid_from || !values.valid_to) return true;
      return new Date(values.valid_to).getTime() >= new Date(values.valid_from).getTime();
    },
    { path: ["valid_to"], message: "Valid to must be after valid from." },
  );

type EventFormValues = z.infer<typeof eventSchema>;

const defaultValues: EventFormValues = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  start_date: "",
  end_date: "",
  location: "",
  is_virtual: false,
  meeting_link: "",
  featured_media_id: "",
  scope_type: "",
  scope_id: "",
  is_featured: false,
  is_main: false,
  valid_from: "",
  valid_to: "",
  display_order: 100,
  meta_title: "",
  meta_description: "",
  keywords: undefined,
  related_links: undefined,
  structured_content: undefined,
};

const eventPayloadFieldMap = {
  title: ["title"],
  slug: ["slug"],
  summary: ["summary"],
  content: ["plain_text", "rich_text"],
  start_date: ["start_date"],
  end_date: ["end_date"],
  location: ["location"],
  is_virtual: ["is_virtual"],
  meeting_link: ["meeting_link"],
  featured_media_id: ["featured_media_id"],
  scope_type: ["scope_type"],
  scope_id: ["scope_id"],
  is_featured: ["is_featured"],
  is_main: ["is_main"],
  valid_from: ["valid_from"],
  valid_to: ["valid_to"],
  display_order: ["display_order"],
  meta_title: ["meta_title"],
  meta_description: ["meta_description"],
  keywords: ["keywords"],
  related_links: ["related_links"],
  structured_content: ["structured_content"],
} satisfies PayloadFieldMap<Partial<Event>>;

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

function eventValues(event: Event): EventFormValues {
  return {
    title: event.title ?? "",
    slug: event.slug ?? "",
    summary: event.summary ?? "",
    content: event.rich_text ?? event.plain_text ?? event.content ?? "",
    start_date: toDateTimeInput(event.start_date),
    end_date: toDateTimeInput(event.end_date),
    location: event.location ?? event.venue ?? "",
    is_virtual: event.is_virtual ?? false,
    meeting_link: event.meeting_link ?? event.virtual_link ?? "",
    featured_media_id: event.featured_media_id ?? event.cover_image_id ?? "",
    scope_type: event.scope_type ?? "",
    scope_id: event.scope_id ?? "",
    is_featured: event.is_featured ?? false,
    is_main: event.is_main ?? false,
    valid_from: toDateTimeInput(event.valid_from),
    valid_to: toDateTimeInput(event.valid_to),
    display_order: event.display_order ?? 100,
    meta_title: event.meta_title ?? "",
    meta_description: event.meta_description ?? "",
    keywords: event.keywords ?? undefined,
    related_links: event.related_links ?? undefined,
    structured_content: event.structured_content ?? undefined,
  };
}

export default function EventFormPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const isNew = slug === "new";
  const eventQuery = useEvent(!isNew && slug ? slug : "", { enabled: !isNew });
  const eventData = eventQuery.data?.data ?? null;
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const uploadEditorImage = useRichTextImageUpload();
  const uploadEditorAttachment = useRichTextAttachmentUpload({ entityType: "event", entityId: eventData?.id, role: "body-attachment" });
  const [pendingAttachments, setPendingAttachments] = useState<PendingMediaAttachment[]>([]);
  const commitPendingAttachments = useCommitPendingAttachments();
  const isPending = createEvent.isPending || updateEvent.isPending;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues,
    values: eventData ? eventValues(eventData) : defaultValues,
  });

  const onSubmit = async (values: EventFormValues) => {
    const cleanContent = sanitizeRichText(values.content);
    const payload: Partial<Event> = {
      title: values.title,
      slug: values.slug || slugify(values.title),
      summary: values.summary || null,
      plain_text: richTextToPlainText(cleanContent) || null,
      rich_text: cleanContent || null,
      start_date: fromDateTimeInput(values.start_date) || new Date().toISOString(),
      end_date: fromDateTimeInput(values.end_date),
      location: values.location || null,
      is_virtual: values.is_virtual,
      meeting_link: values.meeting_link || null,
      featured_media_id: values.featured_media_id || null,
      scope_type: values.scope_type || null,
      scope_id: values.scope_id || null,
      is_featured: values.is_featured,
      is_main: values.is_main,
      valid_from: fromDateTimeInput(values.valid_from),
      valid_to: fromDateTimeInput(values.valid_to),
      display_order: values.display_order,
      meta_title: values.meta_title || null,
      meta_description: values.meta_description || null,
      keywords: optionalObject(values.keywords),
      related_links: optionalObjectArray(values.related_links),
      structured_content: optionalObject(values.structured_content),
    };

    try {
      if (isNew) {
        const response = await createEvent.mutateAsync(payload);
        if (pendingAttachments.length) {
          await commitPendingAttachments({ entityType: "event", entityId: response.data.id, attachments: pendingAttachments });
          setPendingAttachments([]);
        }
        toast.success("Event created successfully");
      } else {
        const patch = pickChangedPayloadWithRecord(
          payload,
          form.formState.dirtyFields as Record<string, unknown>,
          eventPayloadFieldMap,
          eventData,
        );
        if (!hasChangedPayload(patch) && !pendingAttachments.length) {
          toast.info("No changes to save");
          return;
        }
        if (hasChangedPayload(patch)) {
          await updateEvent.mutateAsync({ id: eventData!.id, data: patch });
        }
        if (pendingAttachments.length) {
          await commitPendingAttachments({ entityType: "event", entityId: eventData!.id, attachments: pendingAttachments });
          setPendingAttachments([]);
        }
        toast.success("Event updated successfully");
      }
      router.push("/content/events");
    } catch {
      toast.error(isNew ? "Failed to create event" : "Failed to update event");
    }
  };

  if (eventQuery.isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title={isNew ? "Create Event" : "Edit Event"} description={isNew ? "Create a new event" : `Editing: ${eventData?.title}`} backHref="/content/events" />

      {!isNew && eventData ? <ContentRecordInspector kind="event" record={eventData} /> : null}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Event Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="Event title" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="event-slug" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="summary" render={({ field }) => (
                  <FormItem><FormLabel>Short description</FormLabel><FormControl><Textarea rows={4} placeholder="Brief description" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem><FormLabel>Full content</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} placeholder="Event details" minHeight="16rem" maxHeight="70vh" onImageUpload={uploadEditorImage} onAttachmentUpload={uploadEditorAttachment} /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="start_date" render={({ field }) => (
                    <FormItem><FormLabel>Start date *</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="end_date" render={({ field }) => (
                    <FormItem><FormLabel>End date</FormLabel><FormControl><Input type="datetime-local" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>

                <FormField control={form.control} name="location" render={({ field }) => (
                  <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="Venue or address" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="meeting_link" render={({ field }) => (
                  <FormItem><FormLabel>Virtual meeting link</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
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
                        helperText="Shown on event lists, detail pages, and sharing previews."
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <AttachmentManager
                    entityType="event"
                    entityId={eventData?.id}
                    roles={contentAttachmentRoles}
                    pendingAttachments={pendingAttachments}
                    onPendingAttachmentsChange={setPendingAttachments}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Placement</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {(["is_featured", "is_main", "is_virtual"] as const).map((name) => (
                    <FormField key={name} control={form.control} name={name} render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel className="cursor-pointer">{name.replace("is_", "").replace("_", " ")}</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                  ))}
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Scope And Ownership</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="scope_type" render={({ field }) => (
                    <FormItem>
                      <MainScopePicker
                        label="Relationship"
                        description="Scope this event to a school, department, programme, division, or intake."
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

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : isNew ? "Create Event" : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/content/events")}>Cancel</Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
