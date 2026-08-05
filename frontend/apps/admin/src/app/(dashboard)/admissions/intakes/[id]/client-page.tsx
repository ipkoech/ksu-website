"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { MediaPicker } from "@/components/media";
import { AcademicCalendarPicker } from "@/components/relationships";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { hasChangedPayload, pickChangedPayloadWithRecord, type PayloadFieldMap } from "@/lib/changed-fields";
import { Button, Card, CardContent, CardHeader, CardTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Switch } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { useCreateIntake, useIntake, useUpdateIntake, type Intake } from "@ksu/api-client";
import { HomepageAdmissionForm } from "./homepage-admission-form";

const schema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    code: z.string().min(1, "Code is required").max(32),
    slug: z.string().optional(),
    academic_calendar_id: z.string().min(1, "Academic calendar is required"),
    application_start: z.string().min(1, "Application start is required"),
    application_end: z.string().min(1, "Application end is required"),
    late_application_end: z.string().optional(),
    max_students: z.coerce.number().int().min(0).optional().or(z.literal("")),
    cover_image_id: z.string().uuid().optional().or(z.literal("")),
    is_active: z.boolean(),
    is_open: z.boolean(),
  })
  .refine(
    (values) => new Date(values.application_end).getTime() >= new Date(values.application_start).getTime(),
    { path: ["application_end"], message: "Applications close date must be after open date." },
  )
  .refine(
    (values) => !values.late_application_end || new Date(values.late_application_end).getTime() >= new Date(values.application_end).getTime(),
    { path: ["late_application_end"], message: "Late deadline must be after the normal close date." },
  );

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  name: "",
  code: "",
  slug: "",
  academic_calendar_id: "",
  application_start: "",
  application_end: "",
  late_application_end: "",
  max_students: "",
  cover_image_id: "",
  is_active: true,
  is_open: false,
};

const intakePayloadFieldMap = {
  name: ["name"],
  code: ["code"],
  slug: ["slug"],
  academic_calendar_id: ["academic_calendar_id"],
  application_start: ["application_start"],
  application_end: ["application_end"],
  late_application_end: ["late_application_end"],
  max_students: ["max_students"],
  cover_image_id: ["cover_image_id"],
  is_active: ["is_active"],
  is_open: ["is_open"],
} satisfies PayloadFieldMap<Partial<Intake>>;

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function dateOnly(value?: string | null) {
  return value ? value.split("T")[0] : "";
}

function intakeValues(intake: Intake): FormValues {
  return {
    name: intake.name ?? "",
    code: intake.code ?? "",
    slug: intake.slug ?? "",
    academic_calendar_id: intake.academic_calendar_id ?? "",
    application_start: dateOnly(intake.application_start),
    application_end: dateOnly(intake.application_end),
    late_application_end: dateOnly(intake.late_application_end),
    max_students: intake.max_students ?? "",
    cover_image_id: intake.cover_image_id ?? "",
    is_active: intake.is_active ?? true,
    is_open: intake.is_open ?? false,
  };
}

export default function IntakeEditorPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = params.id as string;
  const id = routeId === "_static" ? searchParams.get("id") || "" : routeId;
  const isNew = routeId === "new";
  const intakeQuery = useIntake(isNew || !id ? "" : id, { enabled: !isNew && Boolean(id) });
  const createIntake = useCreateIntake();
  const updateIntake = useUpdateIntake();
  const intake = intakeQuery.data?.data ?? null;
  const isPending = createIntake.isPending || updateIntake.isPending;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    values: intake ? intakeValues(intake) : defaultValues,
  });

  const onSubmit = async (values: FormValues) => {
    const payload: Partial<Intake> = {
      name: values.name,
      code: values.code.toUpperCase(),
      slug: values.slug || slugify(values.name),
      academic_calendar_id: values.academic_calendar_id,
      application_start: values.application_start,
      application_end: values.application_end,
      late_application_end: values.late_application_end || null,
      max_students: values.max_students === "" ? null : Number(values.max_students),
      cover_image_id: values.cover_image_id || null,
      is_active: values.is_active,
      is_open: values.is_open,
    };

    try {
      if (isNew) {
        await createIntake.mutateAsync(payload);
        toast.success("Intake created successfully");
      } else {
        const patch = pickChangedPayloadWithRecord(payload, form.formState.dirtyFields as Record<string, unknown>, intakePayloadFieldMap, intake);
        if (!hasChangedPayload(patch)) {
          toast.info("No changes to save");
          return;
        }
        await updateIntake.mutateAsync({ id: intake!.id, data: patch });
        toast.success("Intake updated successfully");
      }
      router.push("/admissions/intakes");
    } catch {
      toast.error(isNew ? "Failed to create intake" : "Failed to update intake");
    }
  };

  if (intakeQuery.isLoading) return <LoadingSkeleton rows={8} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title={isNew ? "Create Intake" : "Edit Intake"} description={isNew ? "Create an admission intake" : `Editing: ${intake?.name}`} backHref="/admissions/intakes" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle>Intake Details</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="September 2026 Intake" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="code" render={({ field }) => (
                  <FormItem><FormLabel>Code *</FormLabel><FormControl><Input placeholder="SEP_2026" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="slug" render={({ field }) => (
                  <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="september-2026-intake" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="academic_calendar_id" render={({ field }) => (
                  <FormItem>
                    <AcademicCalendarPicker value={field.value} onChange={(value) => field.onChange(value)} label="Academic Calendar *" placeholder="Select academic calendar" required />
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="application_start" render={({ field }) => (
                  <FormItem><FormLabel>Applications Open *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="application_end" render={({ field }) => (
                  <FormItem><FormLabel>Applications Close *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="late_application_end" render={({ field }) => (
                  <FormItem><FormLabel>Late Deadline</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="max_students" render={({ field }) => (
                  <FormItem><FormLabel>Maximum Students</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Media</CardTitle></CardHeader>
                <CardContent>
                  <FormField control={form.control} name="cover_image_id" render={({ field }) => (
                    <FormItem><FormLabel>Cover Image</FormLabel><MediaPicker value={field.value} onChange={(value) => field.onChange(value)} mediaType="image" accept="image/*" label="Cover image" /><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {(["is_active", "is_open"] as const).map((name) => (
                    <FormField key={name} control={form.control} name={name} render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-3">
                        <FormLabel className="cursor-pointer">{name === "is_open" ? "Open for applications" : "Active"}</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      </FormItem>
                    )} />
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : isNew ? "Create Intake" : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/admissions/intakes")}>Cancel</Button>
          </div>
        </form>
      </Form>
      {!isNew && intake ? <HomepageAdmissionForm intakeId={intake.id} /> : null}
    </motion.div>
  );
}
