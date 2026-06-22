"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  richTextToPlainText,
  type JsonEditorField,
} from "@ksu/ui/components";
import {
  useCreateWing,
  useDepartments,
  useDivisions,
  useSchools,
  useStaffAssignments,
  useUpdateWing,
  useWing,
  type StaffAssignment,
  type Wing,
} from "@ksu/api-client";
import { MediaPicker } from "@/components/media";
import { PersonPicker } from "@/components/relationships";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { StaffAssignmentEditor } from "@/components/staff/staff-assignment-editor";
import { hasChangedPayload, pickChangedPayloadWithRecord, type PayloadFieldMap } from "@/lib/changed-fields";

const objectSchema = z.record(z.string(), z.unknown()).nullable().optional();

const schema = z.object({
  division_id: z.string().uuid("Division is required"),
  name: z.string().min(1, "Name is required").max(255),
  code: z.string().min(1, "Code is required").max(32),
  slug: z.string().optional(),
  wing_type: z.string().min(1).max(64),
  head_id: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  head_message: z.string().optional().nullable(),
  mandate: z.string().optional().nullable(),
  service_charter: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().nullable(),
  office_location: z.string().optional().nullable(),
  operating_hours: objectSchema,
  cover_image_id: z.string().optional().nullable(),
  is_public: z.boolean(),
  is_active: z.boolean(),
  display_order: z.coerce.number().int().optional(),
});

type FormValues = z.infer<typeof schema>;
type WingPayload = Partial<Wing>;

const wingFields = [
  "id",
  "division_id",
  "name",
  "slug",
  "code",
  "wing_type",
  "head_id",
  "description",
  "head_message",
  "mandate",
  "service_charter",
  "email",
  "phone",
  "office_location",
  "operating_hours",
  "cover_image_id",
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

const payloadFieldMap: PayloadFieldMap<WingPayload> = {
  division_id: ["division_id"],
  name: ["name"],
  code: ["code"],
  slug: ["slug"],
  wing_type: ["wing_type"],
  head_id: ["head_id"],
  description: ["description"],
  head_message: ["head_message"],
  mandate: ["mandate"],
  service_charter: ["service_charter"],
  email: ["email"],
  phone: ["phone"],
  office_location: ["office_location"],
  operating_hours: ["operating_hours"],
  cover_image_id: ["cover_image_id"],
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

function resolveRouteId(routeId: string, queryId: string | null) {
  if (routeId === "_static") return queryId || "";
  return routeId;
}

function buildPayload(values: FormValues): WingPayload {
  return {
    division_id: values.division_id,
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    slug: values.slug?.trim() || slugify(values.name),
    wing_type: values.wing_type,
    head_id: emptyToNull(values.head_id),
    description: textToNull(values.description),
    head_message: textToNull(values.head_message),
    mandate: textToNull(values.mandate),
    service_charter: textToNull(values.service_charter),
    email: emptyToNull(values.email),
    phone: emptyToNull(values.phone),
    office_location: emptyToNull(values.office_location),
    operating_hours: values.operating_hours && Object.keys(values.operating_hours).length ? values.operating_hours : null,
    cover_image_id: emptyToNull(values.cover_image_id),
    is_public: values.is_public,
    is_active: values.is_active,
    display_order: values.display_order ?? 100,
  };
}

function personName(assignment: StaffAssignment) {
  const person = assignment.person;
  return (
    person?.full_name ||
    [person?.title, person?.first_name, person?.last_name].filter(Boolean).join(" ") ||
    "Staff assignment"
  );
}

function assignmentTitle(assignment: StaffAssignment) {
  return assignment.title || assignment.role_display || assignment.role?.replace(/_/g, " ") || "Staff role";
}

export default function DirectorateEditorPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const routeId = params.id as string;
  const wingId = resolveRouteId(routeId, searchParams.get("id"));
  const isNew = wingId === "new";
  const initialDivisionId = searchParams.get("division_id") ?? "";
  const [assignmentEditorOpen, setAssignmentEditorOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<StaffAssignment | null>(null);

  const wingQuery = useWing(isNew ? "" : wingId, {
    enabled: !isNew && Boolean(wingId),
    fields: wingFields,
  });
  const divisionsQuery = useDivisions({
    is_active: true,
    fields: "id,name,slug,code,division_type",
    per_page: 100,
  });
  const createWing = useCreateWing();
  const updateWing = useUpdateWing();
  const wing = wingQuery.data?.data;
  const isPending = createWing.isPending || updateWing.isPending;

  const staffAssignmentsQuery = useStaffAssignments(
    {
      entity_type: "wing",
      entity_id: wingId,
      status: "all",
      fields: "id,person_id,entity_type,entity_id,role,title,hierarchy_level,is_primary,is_acting,is_public,status,display_order,start_date,end_date",
      include: "person:id,title,first_name,last_name,full_name,email",
      per_page: 80,
    },
    { enabled: !isNew && Boolean(wingId) },
  );
  const departmentsQuery = useDepartments({
    wing_id: wingId,
    department_type: "administrative",
    fields: "id,name,slug,code,wing_id,department_type,display_order",
    per_page: 100,
  });
  const schoolsQuery = useSchools({
    administrative_wing_id: wingId,
    fields: "id,name,slug,code,administrative_wing_id,display_order",
    per_page: 100,
  });
  const assignments = staffAssignmentsQuery.data?.data ?? [];
  const departments = departmentsQuery.data?.data ?? [];
  const schools = schoolsQuery.data?.data ?? [];

  const defaultValues = useMemo<FormValues>(
    () => ({
      division_id: initialDivisionId,
      name: "",
      code: "",
      slug: "",
      wing_type: "directorate",
      head_id: "",
      description: "",
      head_message: "",
      mandate: "",
      service_charter: "",
      email: "",
      phone: "",
      office_location: "",
      operating_hours: {},
      cover_image_id: "",
      is_public: true,
      is_active: true,
      display_order: 100,
    }),
    [initialDivisionId],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (wing) {
      form.reset({
        division_id: wing.division_id,
        name: wing.name ?? "",
        code: wing.code ?? "",
        slug: wing.slug ?? "",
        wing_type: wing.wing_type ?? "directorate",
        head_id: wing.head_id ?? "",
        description: wing.description ?? "",
        head_message: wing.head_message ?? "",
        mandate: wing.mandate ?? "",
        service_charter: wing.service_charter ?? "",
        email: wing.email ?? "",
        phone: wing.phone ?? "",
        office_location: wing.office_location ?? "",
        operating_hours: wing.operating_hours ?? {},
        cover_image_id: wing.cover_image_id ?? "",
        is_public: wing.is_public ?? true,
        is_active: wing.is_active ?? true,
        display_order: wing.display_order ?? 100,
      });
    } else if (isNew) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, isNew, wing]);

  const onSubmit = async (values: FormValues) => {
    const payload = buildPayload(values);

    try {
      if (isNew) {
        const response = await createWing.mutateAsync(payload);
        toast.success("Directorate created");
        router.push(`/organization/directorates/_static?id=${encodeURIComponent(response.data.id)}`);
      } else if (wing) {
        const patch = pickChangedPayloadWithRecord(
          payload,
          form.formState.dirtyFields as Record<string, unknown>,
          payloadFieldMap,
          wing,
        );
        if (!hasChangedPayload(patch)) {
          toast.info("No directorate changes to save");
          return;
        }
        const response = await updateWing.mutateAsync({ id: wing.id, data: patch });
        form.reset({
          division_id: response.data.division_id,
          name: response.data.name ?? "",
          code: response.data.code ?? "",
          slug: response.data.slug ?? "",
          wing_type: response.data.wing_type ?? "directorate",
          head_id: response.data.head_id ?? "",
          description: response.data.description ?? "",
          head_message: response.data.head_message ?? "",
          mandate: response.data.mandate ?? "",
          service_charter: response.data.service_charter ?? "",
          email: response.data.email ?? "",
          phone: response.data.phone ?? "",
          office_location: response.data.office_location ?? "",
          operating_hours: response.data.operating_hours ?? {},
          cover_image_id: response.data.cover_image_id ?? "",
          is_public: response.data.is_public ?? true,
          is_active: response.data.is_active ?? true,
          display_order: response.data.display_order ?? 100,
        });
        toast.success("Directorate updated");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : isNew ? "Failed to create directorate" : "Failed to update directorate");
    }
  };

  if (!isNew && !wingId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Directorate not found" backHref="/organization/divisions" />
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Missing directorate id.</CardContent></Card>
      </div>
    );
  }

  if (wingQuery.isLoading) return <LoadingSkeleton rows={10} />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <PageHeader
        title={isNew ? "Create Directorate" : "Edit Directorate"}
        description={isNew ? "Create an administration directorate or wing." : `Editing: ${wing?.name}`}
        backHref="/organization/divisions"
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Directorate Details</CardTitle>
                  <CardDescription>Core identity and parent division.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <FormField control={form.control} name="division_id" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Division *</FormLabel>
                      <Select value={field.value || undefined} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select division" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectGroup>
                            {(divisionsQuery.data?.data ?? []).map((division) => (
                              <SelectItem key={division.id} value={division.id}>
                                {division.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Name *</FormLabel><FormControl><Input placeholder="Registrar Academic Affairs" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="code" render={({ field }) => (
                    <FormItem><FormLabel>Code *</FormLabel><FormControl><Input placeholder="RAA" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="slug" render={({ field }) => (
                    <FormItem><FormLabel>Slug</FormLabel><FormControl><Input placeholder="registrar-academic-affairs" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="wing_type" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="directorate">Directorate</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="unit">Unit</SelectItem>
                            <SelectItem value="wing">Wing</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="head_id" render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Head</FormLabel>
                      <PersonPicker value={field.value ?? ""} onChange={field.onChange} filters={{ status: "active" }} placeholder="Search and select the head of office" />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="office@kisiiuniversity.ac.ke" {...field} /></FormControl><FormMessage /></FormItem>
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
                  <CardDescription>Content rendered on the public directorate page.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="170px" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="head_message" render={({ field }) => (
                    <FormItem><FormLabel>Head Message</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="150px" /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="mandate" render={({ field }) => (
                      <FormItem><FormLabel>Mandate</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="140px" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="service_charter" render={({ field }) => (
                      <FormItem><FormLabel>Service Charter</FormLabel><FormControl><RichTextEditor value={field.value ?? ""} onChange={field.onChange} toolbar="simple" minHeight="140px" /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Operating Details</CardTitle>
                  <CardDescription>Structured office hours for the public page.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField control={form.control} name="operating_hours" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Operating Hours</FormLabel>
                      <JsonObjectEditor mode="object" fields={officeHoursFields} value={field.value ?? {}} onChange={field.onChange} />
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
                        helperText="Select or upload a directorate cover image."
                      />
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                  <CardDescription>Controls public visibility.</CardDescription>
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

              {!isNew && wing ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Directorate Team</CardTitle>
                      <CardDescription>Attach public staff assignments to this directorate.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          setSelectedAssignment(null);
                          setAssignmentEditorOpen(true);
                        }}
                      >
                        Attach staff
                      </Button>
                      <div className="space-y-2">
                        {assignments.map((assignment) => (
                          <button
                            type="button"
                            key={assignment.id}
                            className="w-full rounded-lg border p-3 text-left transition hover:bg-muted"
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setAssignmentEditorOpen(true);
                            }}
                          >
                            <p className="text-sm font-semibold">{personName(assignment)}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{assignmentTitle(assignment)}</p>
                          </button>
                        ))}
                        {!assignments.length ? (
                          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                            No staff assignments attached.
                          </p>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Linked Records</CardTitle>
                      <CardDescription>Administrative departments and schools attached to this directorate.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Departments</p>
                        <div className="mt-2 space-y-2">
                          {departments.map((department) => (
                            <Link
                              key={department.id}
                              href={`/academic/departments/_static?id=${encodeURIComponent(department.id)}`}
                              className="block rounded-lg border p-3 text-sm font-medium transition hover:bg-muted"
                            >
                              {department.name}
                            </Link>
                          ))}
                          {!departments.length ? (
                            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                              No administrative departments attached.
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Schools</p>
                        <div className="mt-2 space-y-2">
                          {schools.map((school) => (
                            <Link
                              key={school.id}
                              href={`/academic/schools/_static?id=${encodeURIComponent(school.id)}`}
                              className="block rounded-lg border p-3 text-sm font-medium transition hover:bg-muted"
                            >
                              {school.name}
                            </Link>
                          ))}
                          {!schools.length ? (
                            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
                              No schools attached.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : isNew ? "Create Directorate" : "Save Changes"}</Button>
            <Button type="button" variant="outline" onClick={() => router.push("/organization/divisions")}>Cancel</Button>
          </div>
        </form>
      </Form>
      {!isNew && wing ? (
        <StaffAssignmentEditor
          open={assignmentEditorOpen}
          onOpenChange={setAssignmentEditorOpen}
          mode={selectedAssignment ? "edit" : "create"}
          assignment={selectedAssignment}
          presetEntityType="wing"
          presetEntityId={wing.id}
          presetEntityLabel={wing.name}
          lockEntity
          onSuccess={() => {
            staffAssignmentsQuery.refetch();
          }}
        />
      ) : null}
    </motion.div>
  );
}
