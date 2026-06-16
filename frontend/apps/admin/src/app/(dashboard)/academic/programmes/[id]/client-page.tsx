"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { MediaPicker } from "@/components/media";
import { DepartmentPicker, IntakePicker, PersonPicker } from "@/components/relationships";
import { PageHeader } from "@/components/shared/page-header";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { hasChangedPayload, pickChangedPayloadWithRecord, type PayloadFieldMap } from "@/lib/changed-fields";
import { richTextToEditorValue, richTextToPayloadValue } from "@/lib/rich-text-form";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
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
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import {
  useAddProgrammeIntake,
  useAddProgrammeTutor,
  useCreateProgramme,
  useProgramme,
  useUpdateProgramme,
  type Programme,
} from "@ksu/api-client";

const programmeSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255),
    slug: z.string().optional(),
    code: z.string().min(1, "Code is required").max(32),
    department_id: z.string().min(1, "Department is required"),
    level: z.string().min(1, "Level is required").max(32),
    mode_of_study: z.string().min(1, "Mode of study is required").max(32),
    duration: z.string().min(1, "Duration is required").max(64),
    credits_required: z.coerce.number().int().min(0).optional().or(z.literal("")),
    about: z.string().optional(),
    objectives: z.string().optional(),
    career_prospects: z.string().optional(),
    curriculum_overview: z.string().optional(),
    entry_requirements: z.string().optional(),
    cluster_subjects: z.unknown().optional(),
    fees_structure: z.unknown().optional(),
    intake_months: z.string().optional(),
    min_students: z.coerce.number().int().min(0).optional().or(z.literal("")),
    max_students: z.coerce.number().int().min(0).optional().or(z.literal("")),
    accreditation_status: z.string().max(128).optional(),
    accrediting_body: z.string().max(255).optional(),
    cover_image_id: z.string().uuid().optional().or(z.literal("")),
    brochure_id: z.string().uuid().optional().or(z.literal("")),
    display_order: z.coerce.number().int().min(0),
    is_active: z.boolean(),
  })
  .refine(
    (values) => {
      if (values.min_students === "" || values.max_students === "") return true;
      if (values.min_students === undefined || values.max_students === undefined) return true;
      return Number(values.min_students) <= Number(values.max_students);
    },
    { path: ["max_students"], message: "Maximum students must be greater than or equal to minimum students." },
  );

type ProgrammeFormValues = z.infer<typeof programmeSchema>;

const levels = ["certificate", "diploma", "bachelor", "master", "doctoral", "postgraduate"];
const modes = ["full_time", "part_time", "online", "evening", "weekend", "blended"];

const defaultValues: ProgrammeFormValues = {
  name: "",
  slug: "",
  code: "",
  department_id: "",
  level: "bachelor",
  mode_of_study: "full_time",
  duration: "",
  credits_required: "",
  about: "",
  objectives: "",
  career_prospects: "",
  curriculum_overview: "",
  entry_requirements: "",
  cluster_subjects: undefined,
  fees_structure: undefined,
  intake_months: "",
  min_students: "",
  max_students: "",
  accreditation_status: "",
  accrediting_body: "",
  cover_image_id: "",
  brochure_id: "",
  display_order: 100,
  is_active: true,
};

const programmePayloadFieldMap = {
  name: ["name"],
  slug: ["slug"],
  code: ["code"],
  department_id: ["department_id"],
  level: ["level"],
  mode_of_study: ["mode_of_study"],
  duration: ["duration"],
  credits_required: ["credits_required"],
  about: ["about"],
  objectives: ["objectives"],
  career_prospects: ["career_prospects"],
  curriculum_overview: ["curriculum_overview"],
  entry_requirements: ["entry_requirements"],
  cluster_subjects: ["cluster_subjects"],
  fees_structure: ["fees_structure"],
  intake_months: ["intake_months"],
  min_students: ["min_students"],
  max_students: ["max_students"],
  accreditation_status: ["accreditation_status"],
  accrediting_body: ["accrediting_body"],
  cover_image_id: ["cover_image_id"],
  brochure_id: ["brochure_id"],
  display_order: ["display_order"],
  is_active: ["is_active"],
} satisfies PayloadFieldMap<Partial<Programme>>;

const clusterSubjectFields = [
  { key: "subject", label: "Subject", placeholder: "Mathematics" },
  { key: "minimum_grade", label: "Minimum grade", placeholder: "C+" },
  { key: "is_mandatory", label: "Mandatory", type: "boolean" as const },
];

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
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

function monthsFromInput(value?: string | null) {
  if (!value) return null;
  const items = value.split(",").map((item) => item.trim()).filter(Boolean);
  return items.length ? items : null;
}

function programmeValues(programme: Programme): ProgrammeFormValues {
  return {
    name: programme.name ?? "",
    slug: programme.slug ?? "",
    code: programme.code ?? "",
    department_id: programme.department_id ?? "",
    level: programme.level ?? "bachelor",
    mode_of_study: programme.mode_of_study ?? "full_time",
    duration: programme.duration ?? "",
    credits_required: programme.credits_required ?? "",
    about: richTextToEditorValue(programme.about),
    objectives: richTextToEditorValue(programme.objectives),
    career_prospects: richTextToEditorValue(programme.career_prospects),
    curriculum_overview: richTextToEditorValue(programme.curriculum_overview),
    entry_requirements: richTextToEditorValue(programme.entry_requirements),
    cluster_subjects: programme.cluster_subjects ?? undefined,
    fees_structure: programme.fees_structure ?? undefined,
    intake_months: programme.intake_months?.join(", ") ?? "",
    min_students: programme.min_students ?? "",
    max_students: programme.max_students ?? "",
    accreditation_status: programme.accreditation_status ?? "",
    accrediting_body: programme.accrediting_body ?? "",
    cover_image_id: programme.cover_image_id ?? "",
    brochure_id: programme.brochure_id ?? "",
    display_order: programme.display_order ?? 100,
    is_active: programme.is_active ?? true,
  };
}

export default function ProgrammeFormPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeId = params.id as string;
  const id = routeId === "_static" ? searchParams.get("id") || "" : routeId;
  const isNew = routeId === "new";
  const listHref = pathname.startsWith("/schools")
    ? "/schools/programmes"
    : pathname.startsWith("/departments")
      ? "/departments/programmes"
      : "/academic/programmes";
  const programmeQuery = useProgramme(!isNew && id ? id : "", { enabled: !isNew && Boolean(id) });
  const programme = programmeQuery.data?.data ?? null;
  const createProgramme = useCreateProgramme();
  const updateProgramme = useUpdateProgramme();
  const addTutor = useAddProgrammeTutor();
  const addIntake = useAddProgrammeIntake();
  const isPending = createProgramme.isPending || updateProgramme.isPending;
  const [hasHydratedRecord, setHasHydratedRecord] = useState(isNew);
  const [tutorForm, setTutorForm] = useState({ person_id: "", role: "programme_tutor", is_lead: false });
  const [intakeForm, setIntakeForm] = useState({
    intake_id: "",
    slots_available: "",
    application_deadline: "",
    is_active: true,
  });
  const [confirmAction, setConfirmAction] = useState<"tutor" | "intake" | null>(null);

  const form = useForm<ProgrammeFormValues>({
    resolver: zodResolver(programmeSchema),
    defaultValues,
  });

  useEffect(() => {
    if (programme) {
      form.reset(programmeValues(programme));
      setHasHydratedRecord(true);
    } else if (isNew) {
      form.reset(defaultValues);
      setHasHydratedRecord(true);
    }
  }, [form, isNew, programme]);

  const onSubmit = async (values: ProgrammeFormValues) => {
    const payload: Partial<Programme> = {
      name: values.name,
      slug: values.slug || slugify(values.name),
      code: values.code.toUpperCase(),
      department_id: values.department_id,
      level: values.level,
      mode_of_study: values.mode_of_study,
      duration: values.duration,
      credits_required: values.credits_required === "" ? null : Number(values.credits_required),
      about: richTextToPayloadValue(values.about),
      objectives: richTextToPayloadValue(values.objectives),
      career_prospects: richTextToPayloadValue(values.career_prospects),
      curriculum_overview: richTextToPayloadValue(values.curriculum_overview),
      entry_requirements: richTextToPayloadValue(values.entry_requirements),
      cluster_subjects: optionalObjectArray(values.cluster_subjects) as Programme["cluster_subjects"],
      fees_structure: optionalObject(values.fees_structure),
      intake_months: monthsFromInput(values.intake_months),
      min_students: values.min_students === "" ? null : Number(values.min_students),
      max_students: values.max_students === "" ? null : Number(values.max_students),
      accreditation_status: values.accreditation_status || null,
      accrediting_body: values.accrediting_body || null,
      cover_image_id: values.cover_image_id || null,
      brochure_id: values.brochure_id || null,
      display_order: values.display_order,
      is_active: values.is_active,
    };

    try {
      if (isNew) {
        await createProgramme.mutateAsync(payload);
        toast.success("Programme created successfully");
      } else {
        const patch = pickChangedPayloadWithRecord(payload, form.formState.dirtyFields as Record<string, unknown>, programmePayloadFieldMap, programme);
        if (!hasChangedPayload(patch)) {
          toast.info("No changes to save");
          return;
        }
        const response = await updateProgramme.mutateAsync({ id: programme!.id, data: patch });
        form.reset(programmeValues(response.data));
        toast.success("Programme updated successfully");
      }
      router.push(listHref);
    } catch {
      toast.error(isNew ? "Failed to create programme" : "Failed to update programme");
    }
  };

  const attachTutor = async () => {
    if (!programme || !tutorForm.person_id) {
      toast.error("Select a tutor before attaching");
      return;
    }
    await addTutor.mutateAsync({
      id: programme.id,
      data: {
        person_id: tutorForm.person_id,
        role: tutorForm.role || "programme_tutor",
        is_lead: tutorForm.is_lead,
      },
    });
    toast.success("Programme tutor attached");
    setTutorForm({ person_id: "", role: "programme_tutor", is_lead: false });
    setConfirmAction(null);
  };

  const attachIntake = async () => {
    if (!programme || !intakeForm.intake_id) {
      toast.error("Select an intake before attaching");
      return;
    }
    const slots = intakeForm.slots_available.trim();
    await addIntake.mutateAsync({
      id: programme.id,
      data: {
        intake_id: intakeForm.intake_id,
        slots_available: slots ? Number(slots) : undefined,
        application_deadline: intakeForm.application_deadline || undefined,
        is_active: intakeForm.is_active,
      },
    });
    toast.success("Programme intake attached");
    setIntakeForm({ intake_id: "", slots_available: "", application_deadline: "", is_active: true });
    setConfirmAction(null);
  };

  if (programmeQuery.isLoading || !hasHydratedRecord) return <LoadingSkeleton rows={15} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader title={isNew ? "Create Programme" : "Edit Programme"} description={isNew ? "Add a new programme" : `Editing: ${programme?.name}`} backHref={listHref} />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Programme Name *</FormLabel><FormControl><Input placeholder="Bachelor of Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid gap-4 md:grid-cols-3">
                    <FormField control={form.control} name="code" render={({ field }) => (
                      <FormItem><FormLabel>Code *</FormLabel><FormControl><Input placeholder="BSC-CS" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="slug" render={({ field }) => (
                      <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="bachelor-of-computer-science" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="duration" render={({ field }) => (
                      <FormItem><FormLabel>Duration *</FormLabel><FormControl><Input placeholder="4 years" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="department_id" render={({ field }) => (
                    <FormItem>
                      <DepartmentPicker value={field.value} onChange={(value) => field.onChange(value)} label="Department *" placeholder="Select department" required />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="level" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level *</FormLabel>
                        <FormControl>
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field}>
                            {levels.map((level) => <option key={level} value={level}>{level.replace(/_/g, " ")}</option>)}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="mode_of_study" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mode of Study *</FormLabel>
                        <FormControl>
                          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...field}>
                            {modes.map((mode) => <option key={mode} value={mode}>{mode.replace(/_/g, " ")}</option>)}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="credits_required" render={({ field }) => (
                    <FormItem><FormLabel>Credits Required</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Programme Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="about" render={({ field }) => (
                    <FormItem><FormLabel>About</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="160px" placeholder="Programme overview..." /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="objectives" render={({ field }) => (
                    <FormItem><FormLabel>Objectives</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="160px" placeholder="Programme objectives..." /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="entry_requirements" render={({ field }) => (
                    <FormItem><FormLabel>Entry Requirements</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="160px" placeholder="Admission requirements..." /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="career_prospects" render={({ field }) => (
                    <FormItem><FormLabel>Career Prospects</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="130px" placeholder="Career opportunities..." /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="curriculum_overview" render={({ field }) => (
                    <FormItem><FormLabel>Curriculum Overview</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="160px" placeholder="Course structure..." /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Structured Requirements</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <FormField control={form.control} name="cluster_subjects" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cluster Subjects</FormLabel>
                      <JsonObjectEditor mode="array" value={field.value} onChange={field.onChange} fields={clusterSubjectFields} itemLabel="Subject" addLabel="Add subject" emptyLabel="No cluster subjects added." />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="fees_structure" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fees Structure</FormLabel>
                      <JsonObjectEditor value={field.value} onChange={field.onChange} allowCustomFields emptyLabel="No fees structure added." />
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Capacity And Accreditation</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                    <FormField control={form.control} name="min_students" render={({ field }) => (
                      <FormItem><FormLabel>Min Students</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="max_students" render={({ field }) => (
                      <FormItem><FormLabel>Max Students</FormLabel><FormControl><Input type="number" min={0} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="intake_months" render={({ field }) => (
                    <FormItem><FormLabel>Intake Months</FormLabel><FormControl><Input placeholder="January, May, September" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="accreditation_status" render={({ field }) => (
                    <FormItem><FormLabel>Accreditation Status</FormLabel><FormControl><Input placeholder="accredited" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="accrediting_body" render={({ field }) => (
                    <FormItem><FormLabel>Accrediting Body</FormLabel><FormControl><Input placeholder="CUE" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Media</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="cover_image_id" render={({ field }) => (
                    <FormItem><FormLabel>Cover Image</FormLabel><MediaPicker value={field.value} onChange={(value) => field.onChange(value)} mediaType="image" accept="image/*" label="Cover image" /><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="brochure_id" render={({ field }) => (
                    <FormItem><FormLabel>Brochure</FormLabel><MediaPicker value={field.value} onChange={(value) => field.onChange(value)} label="Brochure" /><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </Card>

              {!isNew && programme ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Teaching Team</CardTitle>
                    <CardDescription>Attach tutors through the programme tutor endpoint.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <PersonPicker
                      value={tutorForm.person_id}
                      onChange={(value) => setTutorForm((current) => ({ ...current, person_id: value }))}
                      filters={{ status: "active" }}
                      label="Tutor"
                      placeholder="Select tutor"
                    />
                    <Input
                      value={tutorForm.role}
                      onChange={(event) => setTutorForm((current) => ({ ...current, role: event.target.value }))}
                      placeholder="programme_tutor"
                    />
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <FormLabel className="cursor-pointer">Lead tutor</FormLabel>
                      <Switch
                        checked={tutorForm.is_lead}
                        onCheckedChange={(value) => setTutorForm((current) => ({ ...current, is_lead: value }))}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={addTutor.isPending || !tutorForm.person_id}
                      onClick={() => setConfirmAction("tutor")}
                    >
                      Attach Tutor
                    </Button>
                  </CardContent>
                </Card>
              ) : null}

              {!isNew && programme ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Admissions Intake</CardTitle>
                    <CardDescription>Attach intakes through the programme intake endpoint.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <IntakePicker
                      value={intakeForm.intake_id}
                      onChange={(value) => setIntakeForm((current) => ({ ...current, intake_id: value }))}
                      filters={{ is_open: true }}
                      label="Intake"
                      placeholder="Select intake"
                    />
                    <Input
                      type="number"
                      min={0}
                      value={intakeForm.slots_available}
                      onChange={(event) => setIntakeForm((current) => ({ ...current, slots_available: event.target.value }))}
                      placeholder="Slots available"
                    />
                    <Input
                      type="date"
                      value={intakeForm.application_deadline}
                      onChange={(event) => setIntakeForm((current) => ({ ...current, application_deadline: event.target.value }))}
                    />
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <FormLabel className="cursor-pointer">Active intake</FormLabel>
                      <Switch
                        checked={intakeForm.is_active}
                        onCheckedChange={(value) => setIntakeForm((current) => ({ ...current, is_active: value }))}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      disabled={addIntake.isPending || !intakeForm.intake_id}
                      onClick={() => setConfirmAction("intake")}
                    >
                      Attach Intake
                    </Button>
                  </CardContent>
                </Card>
              ) : null}

              <Card>
                <CardHeader><CardTitle>Status</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="is_active" render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-3">
                      <FormLabel className="cursor-pointer">Active</FormLabel>
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
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : isNew ? "Create Programme" : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push(listHref)}>Cancel</Button>
          </div>
        </form>
      </Form>
      <ConfirmDialog
        open={confirmAction === "tutor"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Attach tutor?"
        description="This will attach the selected person to this programme through the programme tutor endpoint."
        confirmLabel="Attach tutor"
        onConfirm={attachTutor}
        isLoading={addTutor.isPending}
      />
      <ConfirmDialog
        open={confirmAction === "intake"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title="Attach intake?"
        description="This will make the selected intake available for this programme."
        confirmLabel="Attach intake"
        onConfirm={attachIntake}
        isLoading={addIntake.isPending}
      />
    </motion.div>
  );
}
