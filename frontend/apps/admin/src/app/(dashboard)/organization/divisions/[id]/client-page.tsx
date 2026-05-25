"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "@ksu/ui";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  richTextToPlainText,
  type JsonEditorField,
} from "@ksu/ui/components";
import { useCreateDivision, useDivision, useUpdateDivision, type Division } from "@ksu/api-client";
import { MediaPicker } from "@/components/media";
import { PersonPicker } from "@/components/relationships";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { hasChangedPayload, pickChangedPayloadWithRecord, type PayloadFieldMap } from "@/lib/changed-fields";

const objectSchema = z.record(z.string(), z.unknown()).nullable().optional();

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  code: z.string().min(1, "Code is required").max(32),
  slug: z.string().optional(),
  division_type: z.string().min(1).max(64),
  head_id: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  head_message: z.string().optional().nullable(),
  mission: z.string().optional().nullable(),
  vision: z.string().optional().nullable(),
  core_values: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  office_location: z.string().optional().nullable(),
  operating_hours: objectSchema,
  cover_image_id: z.string().optional().nullable(),
  settings: objectSchema,
  is_public: z.boolean(),
  is_active: z.boolean(),
  display_order: z.coerce.number().int().optional(),
});

type FormValues = z.infer<typeof schema>;
type DivisionPayload = Partial<Division>;

const divisionFields = [
  "id",
  "name",
  "slug",
  "code",
  "division_type",
  "head_id",
  "description",
  "head_message",
  "mission",
  "vision",
  "core_values",
  "email",
  "phone",
  "office_location",
  "operating_hours",
  "cover_image_id",
  "settings",
  "is_public",
  "is_active",
  "display_order",
].join(",");

const officeHoursFields: JsonEditorField[] = [
  { key: "monday", label: "Monday", placeholder: "08:00-17:00" },
  { key: "tuesday", label: "Tuesday", placeholder: "08:00-17:00" },
  { key: "wednesday", label: "Wednesday", placeholder: "08:00-17:00" },
  { key: "thursday", label: "Thursday", placeholder: "08:00-17:00" },
  { key: "friday", label: "Friday", placeholder: "08:00-17:00" },
  { key: "saturday", label: "Saturday", placeholder: "Closed" },
  { key: "sunday", label: "Sunday", placeholder: "Closed" },
];

const divisionPayloadFieldMap: PayloadFieldMap<DivisionPayload> = {
  name: ["name"],
  code: ["code"],
  slug: ["slug"],
  division_type: ["division_type"],
  head_id: ["head_id"],
  description: ["description"],
  head_message: ["head_message"],
  mission: ["mission"],
  vision: ["vision"],
  core_values: ["core_values"],
  email: ["email"],
  phone: ["phone"],
  office_location: ["office_location"],
  operating_hours: ["operating_hours"],
  cover_image_id: ["cover_image_id"],
  settings: ["settings"],
  is_public: ["is_public"],
  is_active: ["is_active"],
  display_order: ["display_order"],
};

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function emptyToNull(value?: string | null) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : null;
}

function textToNull(value?: string | null) {
  return emptyToNull(richTextToPlainText(value ?? ""));
}

function buildPayload(values: FormValues): DivisionPayload {
  return {
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    slug: values.slug?.trim() || slugify(values.name),
    division_type: values.division_type,
    head_id: emptyToNull(values.head_id),
    description: textToNull(values.description),
    head_message: textToNull(values.head_message),
    mission: textToNull(values.mission),
    vision: textToNull(values.vision),
    core_values: textToNull(values.core_values),
    email: emptyToNull(values.email),
    phone: emptyToNull(values.phone),
    office_location: emptyToNull(values.office_location),
    operating_hours: values.operating_hours && Object.keys(values.operating_hours).length ? values.operating_hours : null,
    cover_image_id: emptyToNull(values.cover_image_id),
    settings: values.settings && Object.keys(values.settings).length ? values.settings : null,
    is_public: values.is_public,
    is_active: values.is_active,
    display_order: values.display_order ?? 100,
  };
}

function resolveRouteId(routeId: string, queryId: string | null) {
  if (routeId === "_static") return queryId || "";
  return routeId;
}

export default function DivisionEditorPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = params.id as string;
  const divisionId = resolveRouteId(routeId, searchParams.get("id"));
  const isNew = divisionId === "new";

  const divisionQuery = useDivision(isNew ? "" : divisionId, {
    enabled: !isNew && Boolean(divisionId),
    fields: divisionFields,
  });
  const createDivision = useCreateDivision();
  const updateDivision = useUpdateDivision();
  const division = divisionQuery.data?.data;
  const isPending = createDivision.isPending || updateDivision.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      slug: "",
      division_type: "division",
      head_id: "",
      description: "",
      head_message: "",
      mission: "",
      vision: "",
      core_values: "",
      email: "",
      phone: "",
      office_location: "",
      operating_hours: {},
      cover_image_id: "",
      settings: {},
      is_public: true,
      is_active: true,
      display_order: 100,
    },
    values: division
      ? {
          name: division.name ?? "",
          code: division.code ?? "",
          slug: division.slug ?? "",
          division_type: division.division_type ?? "division",
          head_id: division.head_id ?? "",
          description: division.description ?? "",
          head_message: division.head_message ?? "",
          mission: division.mission ?? "",
          vision: division.vision ?? "",
          core_values: division.core_values ?? "",
          email: division.email ?? "",
          phone: division.phone ?? "",
          office_location: division.office_location ?? "",
          operating_hours: division.operating_hours ?? {},
          cover_image_id: division.cover_image_id ?? "",
          settings: division.settings ?? {},
          is_public: division.is_public ?? true,
          is_active: division.is_active ?? true,
          display_order: division.display_order ?? 100,
        }
      : undefined,
  });

  const onSubmit = async (values: FormValues) => {
    const payload = buildPayload(values);

    try {
      if (isNew) {
        await createDivision.mutateAsync(payload);
        toast.success("Division created");
      } else if (division) {
        const patch = pickChangedPayloadWithRecord(
          payload,
          form.formState.dirtyFields as Record<string, unknown>,
          divisionPayloadFieldMap,
          division,
        );
        if (!hasChangedPayload(patch)) {
          toast.info("No division changes to save");
          return;
        }
        await updateDivision.mutateAsync({ id: division.id, data: patch });
        toast.success("Division updated");
      }
      router.push("/organization/divisions");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : isNew ? "Failed to create division" : "Failed to update division");
    }
  };

  if (!isNew && !divisionId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Division not found" backHref="/organization/divisions" />
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Missing division id.</CardContent></Card>
      </div>
    );
  }

  if (divisionQuery.isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title={isNew ? "Create Division" : "Edit Division"}
        description={isNew ? "Create an organizational division from the backend contract." : `Editing: ${division?.name}`}
        backHref="/organization/divisions"
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Division Details</CardTitle>
                  <CardDescription>Core identity, leadership, and public contact fields.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="Administrative Division" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="code" render={({ field }) => (
                    <FormItem><FormLabel>Code *</FormLabel><FormControl><Input placeholder="ADMIN" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="administrative-division" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="division_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="division">Division</SelectItem>
                          <SelectItem value="directorate">Directorate</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="unit">Unit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="head_id" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Division Head</FormLabel>
                      <PersonPicker value={field.value ?? ""} onChange={field.onChange} filters={{ status: "active" }} placeholder="Search and select the division head" />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="division@kisiiuniversity.ac.ke" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="phone" render={({ field }) => (
                    <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+254..." {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="office_location" render={({ field }) => (
                    <FormItem><FormLabel>Office Location</FormLabel><FormControl><Input placeholder="Main Campus" {...field} value={field.value ?? ""} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="display_order" render={({ field }) => (
                    <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Public Content</CardTitle>
                  <CardDescription>Copy shown on public organizational pages.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="170px" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="head_message" render={({ field }) => (
                    <FormItem><FormLabel>Head Message</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="160px" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="mission" render={({ field }) => (
                      <FormItem><FormLabel>Mission</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="140px" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="vision" render={({ field }) => (
                      <FormItem><FormLabel>Vision</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="140px" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="core_values" render={({ field }) => (
                    <FormItem><FormLabel>Core Values</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="140px" /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Operating Details</CardTitle>
                  <CardDescription>Structured hours and optional division settings.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField control={form.control} name="operating_hours" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Hours</FormLabel>
                      <JsonObjectEditor mode="object" fields={officeHoursFields} value={field.value ?? {}} onChange={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="settings" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Settings</FormLabel>
                      <JsonObjectEditor value={field.value ?? {}} onChange={field.onChange} allowCustomFields emptyLabel="No settings added." />
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Media</CardTitle>
                  <CardDescription>Use the media library for the public cover image.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField control={form.control} name="cover_image_id" render={({ field }) => (
                    <FormItem>
                      <MediaPicker
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        label="Cover image"
                        mediaType="image"
                        accept="image/*"
                        helperText="Select or upload a division cover image."
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>Controls visibility and internal availability.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(["is_public", "is_active"] as const).map((name) => (
                    <FormField key={name} control={form.control} name={name} render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel className="cursor-pointer">{name === "is_public" ? "Public" : "Active"}</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : isNew ? "Create Division" : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/organization/divisions")}>Cancel</Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
