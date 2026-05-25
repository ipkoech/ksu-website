"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { MediaPicker } from "@/components/media";
import { SchoolPicker } from "@/components/relationships";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
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
  RichTextEditor,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  sanitizeRichText,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useAdmissionInfo, useCreateAdmissionInfo, useUpdateAdmissionInfo, type AdmissionInfo } from "@ksu/api-client";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().optional(),
  content_type: z.string().min(1, "Content type is required").max(64),
  audience_levels: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  external_url: z.string().url().optional().or(z.literal("")),
  school_id: z.string().uuid().optional().or(z.literal("")),
  cover_image_id: z.string().uuid().optional().or(z.literal("")),
  attachment_media_id: z.string().uuid().optional().or(z.literal("")),
  is_published: z.boolean(),
  display_order: z.coerce.number().int().min(0),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  title: "",
  slug: "",
  content_type: "general",
  audience_levels: "",
  summary: "",
  content: "",
  external_url: "",
  school_id: "",
  cover_image_id: "",
  attachment_media_id: "",
  is_published: true,
  display_order: 100,
};

const admissionInfoPayloadFieldMap = {
  title: ["title"],
  slug: ["slug"],
  content_type: ["content_type"],
  audience_levels: ["audience_levels"],
  summary: ["summary"],
  content: ["content"],
  external_url: ["external_url"],
  school_id: ["school_id"],
  cover_image_id: ["cover_image_id"],
  attachment_media_id: ["attachment_media_id"],
  is_published: ["is_published"],
  display_order: ["display_order"],
} satisfies PayloadFieldMap<Partial<AdmissionInfo>>;

const contentTypes = [
  "general",
  "how_to_apply",
  "application_procedure",
  "requirements",
  "entry_requirements",
  "application",
  "fees",
  "fee_information",
  "scholarships",
  "financial_aid",
  "international",
  "international_students",
  "undergraduate",
  "postgraduate",
  "bridging_application",
  "graduation",
  "booklet",
  "brochure",
  "transfer",
];

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function parseAudienceLevels(value?: string | null) {
  if (!value) return null;
  const levels = value.split(",").map((item) => item.trim()).filter(Boolean);
  return levels.length ? levels : null;
}

function admissionInfoValues(item: AdmissionInfo): FormValues {
  return {
    title: item.title ?? "",
    slug: item.slug ?? "",
    content_type: item.content_type ?? "general",
    audience_levels: item.audience_levels?.join(", ") ?? "",
    summary: item.summary ?? "",
    content: item.content ?? "",
    external_url: item.external_url ?? "",
    school_id: item.school_id ?? "",
    cover_image_id: item.cover_image_id ?? "",
    attachment_media_id: item.attachment_media_id ?? "",
    is_published: item.is_published ?? true,
    display_order: item.display_order ?? 100,
  };
}

export default function AdmissionInfoEditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeId = params.id as string;
  const id = routeId === "_static" ? searchParams.get("id") || "" : routeId;
  const isNew = routeId === "new";
  const itemQuery = useAdmissionInfo(!isNew && id ? id : "", { enabled: !isNew && Boolean(id) });
  const item = itemQuery.data?.data ?? null;
  const createAdmissionInfo = useCreateAdmissionInfo();
  const updateAdmissionInfo = useUpdateAdmissionInfo();
  const isPending = createAdmissionInfo.isPending || updateAdmissionInfo.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    values: item ? admissionInfoValues(item) : defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    const payload: Partial<AdmissionInfo> = {
      title: values.title,
      slug: values.slug || slugify(values.title),
      content_type: values.content_type,
      audience_levels: parseAudienceLevels(values.audience_levels),
      summary: values.summary || null,
      content: sanitizeRichText(values.content) || null,
      external_url: values.external_url || null,
      school_id: values.school_id || null,
      cover_image_id: values.cover_image_id || null,
      attachment_media_id: values.attachment_media_id || null,
      is_published: values.is_published,
      display_order: values.display_order,
    };

    try {
      if (isNew) {
        await createAdmissionInfo.mutateAsync(payload);
        toast.success("Admission information created successfully");
      } else {
        const patch = pickChangedPayloadWithRecord(payload, form.formState.dirtyFields as Record<string, unknown>, admissionInfoPayloadFieldMap, item);
        if (!hasChangedPayload(patch)) {
          toast.info("No changes to save");
          return;
        }
        await updateAdmissionInfo.mutateAsync({ id: item!.id, data: patch });
        toast.success("Admission information updated successfully");
      }
      router.push("/admissions/info");
    } catch {
      toast.error(isNew ? "Failed to create admission information" : "Failed to update admission information");
    }
  };

  if (itemQuery.isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title={isNew ? "Create Admission Information" : "Edit Admission Information"}
        description={isNew ? "Create an admissions page or notice" : `Editing: ${item?.title}`}
        backHref="/admissions/info"
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Information Content</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Title *</FormLabel><FormControl><Input placeholder="Admission Requirements" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="slug" render={({ field }) => (
                      <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="admission-requirements" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="content_type" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Type *</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select content type" />
                            </SelectTrigger>
                            <SelectContent>
                              {contentTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type.replace(/_/g, " ")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="summary" render={({ field }) => (
                    <FormItem><FormLabel>Summary</FormLabel><FormControl><Textarea rows={4} placeholder="Short public summary" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="content" render={({ field }) => (
                    <FormItem><FormLabel>Content</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} minHeight="18rem" maxHeight="70vh" placeholder="Admission information..." /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Scope And Audience</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="school_id" render={({ field }) => (
                    <FormItem>
                      <SchoolPicker value={field.value} onChange={(value) => field.onChange(value)} label="School" placeholder="Institution-wide" />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="audience_levels" render={({ field }) => (
                    <FormItem><FormLabel>Audience Levels</FormLabel><FormControl><Input placeholder="undergraduate, postgraduate" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="external_url" render={({ field }) => (
                    <FormItem><FormLabel>External URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Media</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="cover_image_id" render={({ field }) => (
                    <FormItem><FormLabel>Cover Image</FormLabel><MediaPicker value={field.value} onChange={(value) => field.onChange(value)} mediaType="image" accept="image/*" label="Cover image" /><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="attachment_media_id" render={({ field }) => (
                    <FormItem><FormLabel>Attachment</FormLabel><MediaPicker value={field.value} onChange={(value) => field.onChange(value)} label="Attachment" /><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="is_published" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <FormLabel className="cursor-pointer">Published</FormLabel>
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="display_order" render={({ field }) => (
                    <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : isNew ? "Create Information" : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admissions/info")}>Cancel</Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
