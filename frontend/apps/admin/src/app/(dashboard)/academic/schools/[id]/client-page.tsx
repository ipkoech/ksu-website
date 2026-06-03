"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { MediaPicker } from "@/components/media";
import { PersonPicker } from "@/components/relationships";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { hasChangedPayload, pickChangedPayloadWithRecord, type PayloadFieldMap } from "@/lib/changed-fields";
import { richTextToEditorValue, richTextToPayloadValue } from "@/lib/rich-text-form";
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
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import {
  useCreateSchool,
  useDivisions,
  useSchool,
  useUpdateSchool,
  useWing,
  useWingsByDivision,
  type School,
} from "@ksu/api-client";

const schoolSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().optional(),
  code: z.string().min(1, "Code is required").max(32),
  school_type: z.string().max(32).optional(),
  administrative_wing_id: z.string().uuid().optional().or(z.literal("")),
  dean_id: z.string().uuid().optional().or(z.literal("")),
  establishment_date: z.string().optional(),
  about: z.string().optional(),
  head_message: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  mandate: z.string().optional(),
  core_values: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  office_location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  logo_image_id: z.string().uuid().optional().or(z.literal("")),
  cover_image_id: z.string().uuid().optional().or(z.literal("")),
  brochure_id: z.string().uuid().optional().or(z.literal("")),
  display_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
  is_public: z.boolean(),
});

type SchoolFormValues = z.infer<typeof schoolSchema>;

const defaultValues: SchoolFormValues = {
  name: "",
  slug: "",
  code: "",
  school_type: "school",
  administrative_wing_id: "",
  dean_id: "",
  establishment_date: "",
  about: "",
  head_message: "",
  mission: "",
  vision: "",
  mandate: "",
  core_values: "",
  email: "",
  phone: "",
  office_location: "",
  website: "",
  logo_image_id: "",
  cover_image_id: "",
  brochure_id: "",
  display_order: 100,
  is_active: true,
  is_public: true,
};

const schoolPayloadFieldMap = {
  name: ["name"],
  slug: ["slug"],
  code: ["code"],
  school_type: ["school_type"],
  administrative_wing_id: ["administrative_wing_id"],
  dean_id: ["dean_id"],
  establishment_date: ["establishment_date"],
  about: ["about"],
  head_message: ["head_message"],
  mission: ["mission"],
  vision: ["vision"],
  mandate: ["mandate"],
  core_values: ["core_values"],
  email: ["email"],
  phone: ["phone"],
  office_location: ["office_location"],
  website: ["website"],
  logo_image_id: ["logo_image_id"],
  cover_image_id: ["cover_image_id"],
  brochure_id: ["brochure_id"],
  display_order: ["display_order"],
  is_active: ["is_active"],
  is_public: ["is_public"],
} satisfies PayloadFieldMap<Partial<School>>;

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function dateOnly(value?: string | null) {
  return value ? value.split("T")[0] : "";
}

function schoolValues(school: School): SchoolFormValues {
  return {
    name: school.name ?? "",
    slug: school.slug ?? "",
    code: school.code ?? "",
    school_type: school.school_type ?? "school",
    administrative_wing_id: school.administrative_wing_id ?? "",
    dean_id: school.dean_id ?? "",
    establishment_date: dateOnly(school.establishment_date),
    about: richTextToEditorValue(school.about ?? school.description),
    head_message: richTextToEditorValue(school.head_message),
    mission: richTextToEditorValue(school.mission),
    vision: richTextToEditorValue(school.vision),
    mandate: richTextToEditorValue(school.mandate),
    core_values: richTextToEditorValue(school.core_values),
    email: school.email ?? "",
    phone: school.phone ?? "",
    office_location: school.office_location ?? "",
    website: school.website ?? "",
    logo_image_id: school.logo_image_id ?? "",
    cover_image_id: school.cover_image_id ?? "",
    brochure_id: school.brochure_id ?? "",
    display_order: school.display_order ?? 100,
    is_active: school.is_active ?? true,
    is_public: school.is_public ?? true,
  };
}

export default function SchoolFormPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeId = params.id as string;
  const id = routeId === "_static" ? searchParams.get("id") || "" : routeId;
  const isNew = routeId === "new";
  const schoolQuery = useSchool(!isNew && id ? id : "", { enabled: !isNew && Boolean(id) });
  const school = schoolQuery.data?.data ?? null;
  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const isPending = createSchool.isPending || updateSchool.isPending;
  const [hasHydratedRecord, setHasHydratedRecord] = useState(isNew);
  const [selectedDivisionId, setSelectedDivisionId] = useState("");

  const form = useForm<SchoolFormValues>({
    resolver: zodResolver(schoolSchema),
    defaultValues,
  });
  const selectedAdministrativeWingId = form.watch("administrative_wing_id");
  const divisionsQuery = useDivisions({
    is_active: true,
    fields: "id,name,slug,code,division_type",
    per_page: 100,
  });
  const selectedWingQuery = useWing(selectedAdministrativeWingId || "", {
    enabled: Boolean(selectedAdministrativeWingId),
    fields: "id,name,division_id",
  });
  const wingsQuery = useWingsByDivision(
    selectedDivisionId,
    { is_active: true, fields: "id,name,slug,code,wing_type,division_id" },
    { enabled: Boolean(selectedDivisionId) },
  );

  useEffect(() => {
    if (school) {
      form.reset(schoolValues(school));
      setHasHydratedRecord(true);
    } else if (isNew) {
      form.reset(defaultValues);
      setHasHydratedRecord(true);
    }
  }, [form, isNew, school]);

  useEffect(() => {
    const divisionId = selectedWingQuery.data?.data?.division_id;
    if (divisionId) {
      setSelectedDivisionId(divisionId);
    }
  }, [selectedWingQuery.data?.data?.division_id]);

  const onSubmit = async (values: SchoolFormValues) => {
    const payload: Partial<School> = {
      name: values.name,
      slug: values.slug || slugify(values.name),
      code: values.code.toUpperCase(),
      school_type: values.school_type || "school",
      administrative_wing_id: values.administrative_wing_id || null,
      dean_id: values.dean_id || null,
      establishment_date: values.establishment_date || null,
      about: richTextToPayloadValue(values.about),
      head_message: richTextToPayloadValue(values.head_message),
      mission: richTextToPayloadValue(values.mission),
      vision: richTextToPayloadValue(values.vision),
      mandate: richTextToPayloadValue(values.mandate),
      core_values: richTextToPayloadValue(values.core_values),
      email: values.email || null,
      phone: values.phone || null,
      office_location: values.office_location || null,
      website: values.website || null,
      logo_image_id: values.logo_image_id || null,
      cover_image_id: values.cover_image_id || null,
      brochure_id: values.brochure_id || null,
      display_order: values.display_order,
      is_active: values.is_active,
      is_public: values.is_public,
    };

    try {
      if (isNew) {
        await createSchool.mutateAsync(payload);
        toast.success("School created successfully");
        router.push("/academic/schools");
      } else {
        const patch = pickChangedPayloadWithRecord(
          payload,
          form.formState.dirtyFields as Record<string, unknown>,
          schoolPayloadFieldMap,
          school,
        );
        if (!hasChangedPayload(patch)) {
          toast.info("No changes to save");
          return;
        }
        const response = await updateSchool.mutateAsync({ id: school!.id, data: patch });
        form.reset(schoolValues(response.data));
        toast.success("School updated successfully");
      }
    } catch {
      toast.error(isNew ? "Failed to create school" : "Failed to update school");
    }
  };

  if (schoolQuery.isLoading || !hasHydratedRecord) return <LoadingSkeleton rows={10} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title={isNew ? "Create School" : "Edit School"}
        description={isNew ? "Add a new school or faculty" : `Editing: ${school?.name}`}
        backHref="/academic/schools"
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>School Name *</FormLabel><FormControl><Input placeholder="School of Computing" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField control={form.control} name="code" render={({ field }) => (
                      <FormItem><FormLabel>Code *</FormLabel><FormControl><Input placeholder="SOC" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="slug" render={({ field }) => (
                      <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="school-of-computing" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="school_type" render={({ field }) => (
                      <FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="school" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="about" render={({ field }) => (
                    <FormItem><FormLabel>About</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="160px" placeholder="Brief description..." /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="mission" render={({ field }) => (
                      <FormItem><FormLabel>Mission</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="130px" placeholder="Mission statement..." /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="vision" render={({ field }) => (
                      <FormItem><FormLabel>Vision</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="130px" placeholder="Vision statement..." /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="mandate" render={({ field }) => (
                    <FormItem><FormLabel>Mandate</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="130px" placeholder="Mandate..." /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="core_values" render={({ field }) => (
                    <FormItem><FormLabel>Core Values</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="130px" placeholder="Core values..." /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone</FormLabel><FormControl><Input placeholder="+254..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="school@university.ac.ke" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="website" render={({ field }) => (
                    <FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="office_location" render={({ field }) => (
                    <FormItem><FormLabel>Office Location</FormLabel><FormControl><Input placeholder="Administration block, floor 2" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Leadership</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="dean_id" render={({ field }) => (
                    <FormItem>
                      <PersonPicker value={field.value} onChange={(value) => field.onChange(value)} label="Dean" placeholder="Select dean" filters={{ status: "active" }} />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="head_message" render={({ field }) => (
                    <FormItem><FormLabel>Dean Message</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="130px" placeholder="Leadership message..." /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="establishment_date" render={({ field }) => (
                    <FormItem><FormLabel>Establishment Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Administrative Office</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormItem>
                    <FormLabel>Division</FormLabel>
                    <Select
                      value={selectedDivisionId || undefined}
                      onValueChange={(value) => {
                        setSelectedDivisionId(value);
                        form.setValue("administrative_wing_id", "", {
                          shouldDirty: true,
                          shouldTouch: true,
                        });
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(divisionsQuery.data?.data ?? []).map((division) => (
                          <SelectItem key={division.id} value={division.id}>
                            {division.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                  <FormField control={form.control} name="administrative_wing_id" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Directorate / Wing</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={!selectedDivisionId || wingsQuery.isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={selectedDivisionId ? "Select directorate" : "Select a division first"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(wingsQuery.data?.data ?? []).map((wing) => (
                            <SelectItem key={wing.id} value={wing.id}>
                              {wing.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  {selectedAdministrativeWingId ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue("administrative_wing_id", "", {
                          shouldDirty: true,
                          shouldTouch: true,
                        });
                      }}
                    >
                      Clear directorate
                    </Button>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Media</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="cover_image_id" render={({ field }) => (
                    <FormItem><FormLabel>Cover Image</FormLabel><MediaPicker value={field.value} onChange={(value) => field.onChange(value)} mediaType="image" accept="image/*" label="Cover image" /><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="logo_image_id" render={({ field }) => (
                    <FormItem><FormLabel>Logo</FormLabel><MediaPicker value={field.value} onChange={(value) => field.onChange(value)} mediaType="image" accept="image/*" label="Logo" /><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="brochure_id" render={({ field }) => (
                    <FormItem><FormLabel>Brochure</FormLabel><MediaPicker value={field.value} onChange={(value) => field.onChange(value)} label="Brochure" /><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {(["is_active", "is_public"] as const).map((name) => (
                    <FormField key={name} control={form.control} name={name} render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel className="cursor-pointer">{name === "is_public" ? "Public" : "Active"}</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                  ))}
                  <FormField control={form.control} name="display_order" render={({ field }) => (
                    <FormItem><FormLabel>Display Order</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : isNew ? "Create School" : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/academic/schools")}>Cancel</Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
