"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { MediaPicker } from "@/components/media";
import { DepartmentPicker, PersonPicker, SchoolPicker } from "@/components/relationships";
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
  Switch,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useCreateDepartment, useDepartment, useUpdateDepartment, type Department } from "@ksu/api-client";

const departmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  slug: z.string().optional(),
  code: z.string().min(1, "Code is required").max(32),
  department_type: z.string().max(32).optional(),
  school_id: z.string().min(1, "School is required"),
  parent_department_id: z.string().uuid().optional().or(z.literal("")),
  head_id: z.string().uuid().optional().or(z.literal("")),
  postgraduate_coordinator_id: z.string().uuid().optional().or(z.literal("")),
  establishment_date: z.string().optional(),
  about: z.string().optional(),
  head_message: z.string().optional(),
  mission: z.string().optional(),
  vision: z.string().optional(),
  mandate: z.string().optional(),
  core_values: z.string().optional(),
  service_charter: z.string().optional(),
  guidelines: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  office_location: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  cover_image_id: z.string().uuid().optional().or(z.literal("")),
  student_count: z.coerce.number().int().min(0),
  postgraduate_student_count: z.coerce.number().int().min(0),
  display_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
  is_public: z.boolean(),
  allows_staff_management: z.boolean(),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

const defaultValues: DepartmentFormValues = {
  name: "",
  slug: "",
  code: "",
  department_type: "academic",
  school_id: "",
  parent_department_id: "",
  head_id: "",
  postgraduate_coordinator_id: "",
  establishment_date: "",
  about: "",
  head_message: "",
  mission: "",
  vision: "",
  mandate: "",
  core_values: "",
  service_charter: "",
  guidelines: "",
  email: "",
  phone: "",
  office_location: "",
  website: "",
  cover_image_id: "",
  student_count: 0,
  postgraduate_student_count: 0,
  display_order: 100,
  is_active: true,
  is_public: true,
  allows_staff_management: true,
};

const departmentPayloadFieldMap = {
  name: ["name"],
  slug: ["slug"],
  code: ["code"],
  department_type: ["department_type"],
  school_id: ["school_id"],
  parent_department_id: ["parent_department_id"],
  head_id: ["head_id"],
  postgraduate_coordinator_id: ["postgraduate_coordinator_id"],
  establishment_date: ["establishment_date"],
  about: ["about"],
  head_message: ["head_message"],
  mission: ["mission"],
  vision: ["vision"],
  mandate: ["mandate"],
  core_values: ["core_values"],
  service_charter: ["service_charter"],
  guidelines: ["guidelines"],
  email: ["email"],
  phone: ["phone"],
  office_location: ["office_location"],
  website: ["website"],
  cover_image_id: ["cover_image_id"],
  student_count: ["student_count"],
  postgraduate_student_count: ["postgraduate_student_count"],
  display_order: ["display_order"],
  is_active: ["is_active"],
  is_public: ["is_public"],
  allows_staff_management: ["allows_staff_management"],
} satisfies PayloadFieldMap<Partial<Department>>;

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function dateOnly(value?: string | null) {
  return value ? value.split("T")[0] : "";
}

function departmentValues(department: Department): DepartmentFormValues {
  return {
    name: department.name ?? "",
    slug: department.slug ?? "",
    code: department.code ?? "",
    department_type: department.department_type ?? "academic",
    school_id: department.school_id ?? "",
    parent_department_id: department.parent_department_id ?? "",
    head_id: department.head_id ?? department.hod_id ?? "",
    postgraduate_coordinator_id: department.postgraduate_coordinator_id ?? "",
    establishment_date: dateOnly(department.establishment_date),
    about: richTextToEditorValue(department.about),
    head_message: richTextToEditorValue(department.head_message),
    mission: richTextToEditorValue(department.mission),
    vision: richTextToEditorValue(department.vision),
    mandate: richTextToEditorValue(department.mandate),
    core_values: richTextToEditorValue(department.core_values),
    service_charter: richTextToEditorValue(department.service_charter),
    guidelines: richTextToEditorValue(department.guidelines),
    email: department.email ?? "",
    phone: department.phone ?? "",
    office_location: department.office_location ?? "",
    website: department.website ?? "",
    cover_image_id: department.cover_image_id ?? "",
    student_count: department.student_count ?? 0,
    postgraduate_student_count: department.postgraduate_student_count ?? 0,
    display_order: department.display_order ?? 100,
    is_active: department.is_active ?? true,
    is_public: department.is_public ?? true,
    allows_staff_management: department.allows_staff_management ?? true,
  };
}

export default function DepartmentFormPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeId = params.id as string;
  const id = routeId === "_static" ? searchParams.get("id") || "" : routeId;
  const isNew = routeId === "new";
  const departmentQuery = useDepartment(!isNew && id ? id : "", { enabled: !isNew && Boolean(id) });
  const department = departmentQuery.data?.data ?? null;
  const createDepartment = useCreateDepartment();
  const updateDepartment = useUpdateDepartment();
  const isPending = createDepartment.isPending || updateDepartment.isPending;
  const [hasHydratedRecord, setHasHydratedRecord] = useState(isNew);

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues,
  });

  useEffect(() => {
    if (department) {
      form.reset(departmentValues(department));
      setHasHydratedRecord(true);
    } else if (isNew) {
      form.reset(defaultValues);
      setHasHydratedRecord(true);
    }
  }, [department, form, isNew]);

  const selectedSchoolId = form.watch("school_id");

  const onSubmit = async (values: DepartmentFormValues) => {
    const payload: Partial<Department> = {
      name: values.name,
      slug: values.slug || slugify(values.name),
      code: values.code.toUpperCase(),
      department_type: values.department_type || "academic",
      school_id: values.school_id || null,
      parent_department_id: values.parent_department_id || null,
      head_id: values.head_id || null,
      postgraduate_coordinator_id: values.postgraduate_coordinator_id || null,
      establishment_date: values.establishment_date || null,
      about: richTextToPayloadValue(values.about),
      head_message: richTextToPayloadValue(values.head_message),
      mission: richTextToPayloadValue(values.mission),
      vision: richTextToPayloadValue(values.vision),
      mandate: richTextToPayloadValue(values.mandate),
      core_values: richTextToPayloadValue(values.core_values),
      service_charter: richTextToPayloadValue(values.service_charter),
      guidelines: richTextToPayloadValue(values.guidelines),
      email: values.email || null,
      phone: values.phone || null,
      office_location: values.office_location || null,
      website: values.website || null,
      cover_image_id: values.cover_image_id || null,
      student_count: values.student_count,
      postgraduate_student_count: values.postgraduate_student_count,
      display_order: values.display_order,
      is_active: values.is_active,
      is_public: values.is_public,
      allows_staff_management: values.allows_staff_management,
    };

    try {
      if (isNew) {
        await createDepartment.mutateAsync(payload);
        toast.success("Department created successfully");
      } else {
        const patch = pickChangedPayloadWithRecord(payload, form.formState.dirtyFields as Record<string, unknown>, departmentPayloadFieldMap, department);
        if (!hasChangedPayload(patch)) {
          toast.info("No changes to save");
          return;
        }
        const response = await updateDepartment.mutateAsync({ id: department!.id, data: patch });
        form.reset(departmentValues(response.data));
        toast.success("Department updated successfully");
      }
      router.push("/academic/departments");
    } catch {
      toast.error(isNew ? "Failed to create department" : "Failed to update department");
    }
  };

  if (departmentQuery.isLoading || !hasHydratedRecord) return <LoadingSkeleton rows={10} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title={isNew ? "Create Department" : "Edit Department"} description={isNew ? "Add a new department" : `Editing: ${department?.name}`} backHref="/academic/departments" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Department Name *</FormLabel><FormControl><Input placeholder="Department of Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField control={form.control} name="code" render={({ field }) => (
                      <FormItem><FormLabel>Code *</FormLabel><FormControl><Input placeholder="DCS" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="slug" render={({ field }) => (
                      <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="department-of-computer-science" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="department_type" render={({ field }) => (
                      <FormItem><FormLabel>Type</FormLabel><FormControl><Input placeholder="academic" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="school_id" render={({ field }) => (
                    <FormItem>
                      <SchoolPicker value={field.value} onChange={(value) => field.onChange(value)} label="School *" placeholder="Select school" required />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="parent_department_id" render={({ field }) => (
                    <FormItem>
                      <DepartmentPicker
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        filters={{ school_id: selectedSchoolId || undefined }}
                        label="Parent Department"
                        placeholder="Select parent department"
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
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
                <CardHeader><CardTitle>Student Services And Guidelines</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="service_charter" render={({ field }) => (
                    <FormItem><FormLabel>Service Charter</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="130px" placeholder="Service charter..." /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="guidelines" render={({ field }) => (
                    <FormItem><FormLabel>Guidelines</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="130px" placeholder="Department guidelines..." /></FormControl><FormMessage /></FormItem>
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
                      <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="dept@university.ac.ke" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="website" render={({ field }) => (
                    <FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="office_location" render={({ field }) => (
                    <FormItem><FormLabel>Office Location</FormLabel><FormControl><Input placeholder="Science block, room 12" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Leadership</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="head_id" render={({ field }) => (
                    <FormItem><PersonPicker value={field.value} onChange={(value) => field.onChange(value)} label="Head of Department" placeholder="Select head" filters={{ status: "active", department_id: department?.id }} /><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="postgraduate_coordinator_id" render={({ field }) => (
                    <FormItem><PersonPicker value={field.value} onChange={(value) => field.onChange(value)} label="Postgraduate Coordinator" placeholder="Select coordinator" filters={{ status: "active", department_id: department?.id }} /><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="head_message" render={({ field }) => (
                    <FormItem><FormLabel>Head Message</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="130px" placeholder="Leadership message..." /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="establishment_date" render={({ field }) => (
                    <FormItem><FormLabel>Establishment Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Media</CardTitle></CardHeader>
                <CardContent>
                  <FormField control={form.control} name="cover_image_id" render={({ field }) => (
                    <FormItem><FormLabel>Cover Image</FormLabel><MediaPicker value={field.value} onChange={(value) => field.onChange(value)} mediaType="image" accept="image/*" label="Cover image" /><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Numbers</CardTitle></CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  <FormField control={form.control} name="student_count" render={({ field }) => (
                    <FormItem><FormLabel>Students</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="postgraduate_student_count" render={({ field }) => (
                    <FormItem><FormLabel>Postgraduate Students</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Publishing</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {(["is_active", "is_public", "allows_staff_management"] as const).map((name) => (
                    <FormField key={name} control={form.control} name={name} render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel className="cursor-pointer">{name.replace(/_/g, " ")}</FormLabel>
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
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : isNew ? "Create Department" : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/academic/departments")}>Cancel</Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
}
