"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { type Path, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { MediaPicker } from "@/components/media";
import { DepartmentPicker, SchoolPicker } from "@/components/relationships";
import { PageHeader } from "@/components/shared/page-header";
import { StaffAssignmentEditor } from "@/components/staff/staff-assignment-editor";
import { usePermissions } from "@/hooks/use-permissions";
import { hasChangedPayload, pickChangedPayload, type PayloadFieldMap } from "@/lib/changed-fields";
import { richTextToEditorValue, richTextToPayloadValue } from "@/lib/rich-text-form";
import { Badge, Button, ConfirmDialog, Input, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Switch, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, JsonObjectEditor, RichTextEditor, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, type JsonEditorField } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { resolveMainMediaUrl, useActivatePerson, useDeactivatePerson, usePerson, useCreatePerson, useUpdatePerson, useRemovePersonPhoto, useStaffAssignments, useUploadPersonPhoto, type Person, type PersonCreatePayload, type PersonUpdatePayload, type StaffAssignment } from "@ksu/api-client";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import { Briefcase, Building2, Calendar, Camera, Clock, Edit, ImageIcon, Mail, MapPin, Phone, Plus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const personSchema = z.object({
    first_name: z.string().min(1, "First name is required").max(100),
    last_name: z.string().min(1, "Last name is required").max(100),
    middle_name: z.string().optional(),
    title: z.string().optional(),
    email: z.string().email("Invalid email").min(1, "Email is required"),
    phone: z.string().optional(),
    alternative_email: z.string().email("Invalid email").optional().or(z.literal("")),
    alternative_phone: z.string().optional(),
    bio: z.string().optional(),
    full_bio: z.string().optional(),
    qualifications: z.string().optional(),
    education_background: z.string().optional(),
    professional_memberships: z.string().optional(),
    awards_honors: z.string().optional(),
    employee_number: z.string().optional(),
    employment_type: z.string().min(1, "Employment type is required"),
    employment_start_date: z.string().optional(),
    employment_end_date: z.string().optional(),
    date_of_appointment: z.string().optional(),
    job_group: z.string().optional(),
    contract_type: z.string().optional(),
    department_id: z.string().optional(),
    academic_rank: z.string().optional(),
    tenure_status: z.string().optional(),
    specialization: z.string().optional(),
    research_interests: z.string().optional(),
    teaching_areas: z.string().optional(),
    courses_taught: z.string().optional(),
    publications_count: z.string().optional(),
    h_index: z.string().optional(),
    office_location: z.string().optional(),
    office_hours: z.string().optional(),
    office_phone: z.string().optional(),
    google_scholar_id: z.string().optional(),
    google_scholar_url: z.string().url().optional().or(z.literal("")),
    orcid: z.string().optional(),
    linkedin_url: z.string().url().optional().or(z.literal("")),
    website_url: z.string().url().optional().or(z.literal("")),
    researchgate_url: z.string().url().optional().or(z.literal("")),
    scopus_id: z.string().optional(),
    institutional_role: z.string().optional(),
    leadership_message: z.string().optional(),
    cv_file_id: z.string().optional(),
    is_active: z.boolean(),
    is_public: z.boolean(),
    is_researcher: z.boolean(),
    is_featured: z.boolean(),
    show_on_directory: z.boolean(),
});

type PersonFormValues = z.infer<typeof personSchema>;

const defaultValues: PersonFormValues = {
    first_name: "",
    last_name: "",
    middle_name: "",
    title: "",
    email: "",
    phone: "",
    alternative_email: "",
    alternative_phone: "",
    bio: "",
    full_bio: "",
    qualifications: "",
    education_background: "",
    professional_memberships: "",
    awards_honors: "",
    employee_number: "",
    employment_type: "full_time",
    employment_start_date: "",
    employment_end_date: "",
    date_of_appointment: "",
    job_group: "",
    contract_type: "",
    department_id: "",
    academic_rank: "",
    tenure_status: "",
    specialization: "",
    research_interests: "",
    teaching_areas: "",
    courses_taught: "",
    publications_count: "",
    h_index: "",
    office_location: "",
    office_hours: "",
    office_phone: "",
    google_scholar_id: "",
    google_scholar_url: "",
    orcid: "",
    linkedin_url: "",
    website_url: "",
    researchgate_url: "",
    scopus_id: "",
    institutional_role: "",
    leadership_message: "",
    cv_file_id: "",
    is_active: true,
    is_public: true,
    is_researcher: false,
    is_featured: false,
    show_on_directory: true,
};

const personPayloadFieldMap = {
    title: ["title"],
    first_name: ["first_name", "full_name"],
    middle_name: ["middle_name", "full_name"],
    last_name: ["last_name", "full_name"],
    email: ["email"],
    phone: ["phone"],
    alternative_email: ["alternative_email"],
    alternative_phone: ["alternative_phone"],
    bio: ["bio"],
    full_bio: ["full_bio"],
    qualifications: ["qualifications"],
    education_background: ["education_background"],
    professional_memberships: ["professional_memberships"],
    awards_honors: ["awards_honors"],
    employee_number: ["employee_number"],
    employment_type: ["employment_type"],
    employment_start_date: ["employment_start_date"],
    employment_end_date: ["employment_end_date"],
    date_of_appointment: ["date_of_appointment"],
    job_group: ["job_group"],
    contract_type: ["contract_type"],
    department_id: ["department_id"],
    academic_rank: ["academic_rank"],
    tenure_status: ["tenure_status"],
    specialization: ["specialization"],
    research_interests: ["research_interests"],
    teaching_areas: ["teaching_areas"],
    courses_taught: ["courses_taught"],
    publications_count: ["publications_count"],
    h_index: ["h_index"],
    office_location: ["office_location"],
    office_hours: ["office_hours"],
    office_phone: ["office_phone"],
    google_scholar_id: ["google_scholar_id"],
    google_scholar_url: ["google_scholar_url"],
    orcid: ["orcid"],
    linkedin_url: ["linkedin_url"],
    website_url: ["website_url"],
    researchgate_url: ["researchgate_url"],
    scopus_id: ["scopus_id"],
    institutional_role: ["institutional_role"],
    leadership_message: ["leadership_message"],
    cv_file_id: ["cv_file_id"],
    is_active: ["is_active"],
    is_public: ["is_public"],
    is_researcher: ["is_researcher"],
    is_featured: ["is_featured"],
    show_on_directory: ["show_on_directory"],
} satisfies PayloadFieldMap<PersonUpdatePayload>;

interface ConfirmState {
    title: string;
    description: string;
    confirmLabel: string;
    variant?: "default" | "destructive";
    onConfirm: () => Promise<void>;
}

const EMPLOYMENT_TYPES = [
    { label: "Full Time", value: "full_time" },
    { label: "Part Time", value: "part_time" },
    { label: "Contract", value: "contract" },
    { label: "Visiting", value: "visiting" },
    { label: "Adjunct", value: "adjunct" },
];

const QUALIFICATION_FIELDS: JsonEditorField[] = [
    { key: "degree", label: "Degree / qualification", placeholder: "BSc Software Engineering" },
    { key: "institution", label: "Institution", placeholder: "Kisii University" },
    { key: "year", label: "Year", type: "number", placeholder: "2021" },
];

const MEMBERSHIP_FIELDS: JsonEditorField[] = [
    { key: "name", label: "Professional body", placeholder: "Professional association" },
    { key: "role", label: "Role / status", placeholder: "Member" },
    { key: "year", label: "Year", type: "number", placeholder: "2024" },
];

const AWARD_FIELDS: JsonEditorField[] = [
    { key: "title", label: "Award", placeholder: "Award title" },
    { key: "issuer", label: "Issuer", placeholder: "Awarding body" },
    { key: "year", label: "Year", type: "number", placeholder: "2024" },
];

const OFFICE_HOURS_FIELDS: JsonEditorField[] = [
    { key: "monday", label: "Monday", placeholder: "09:00-12:00" },
    { key: "tuesday", label: "Tuesday", placeholder: "09:00-12:00" },
    { key: "wednesday", label: "Wednesday", placeholder: "09:00-12:00" },
    { key: "thursday", label: "Thursday", placeholder: "09:00-12:00" },
    { key: "friday", label: "Friday", placeholder: "09:00-12:00" },
    { key: "saturday", label: "Saturday", placeholder: "By appointment" },
    { key: "sunday", label: "Sunday", placeholder: "Closed" },
];

function objectToJson(value: unknown) {
    if (!value || typeof value !== "object") return "";
    return JSON.stringify(value, null, 2);
}

function safeJsonValue<T>(value: string | undefined, fallback: T): T {
    if (!value?.trim()) return fallback;
    try {
        return JSON.parse(value) as T;
    } catch {
        return fallback;
    }
}

function compactJsonObject(value: Record<string, unknown>) {
    return Object.fromEntries(
        Object.entries(value).filter(([, item]) => {
            if (item === null || item === undefined) return false;
            if (typeof item === "string") return item.trim() !== "";
            return true;
        })
    );
}

function parseOptionalJson(value?: string) {
    if (!value?.trim()) return null;
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Office hours must be a JSON object.");
    }
    const compacted = compactJsonObject(parsed as Record<string, unknown>);
    return Object.keys(compacted).length ? compacted : null;
}

function arrayToCsv(value?: string[] | null) {
    return value?.length ? value.join(", ") : "";
}

function parseCsv(value?: string) {
    const items = value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
    return items.length ? items : null;
}

function arrayToJson(value: unknown) {
    if (!Array.isArray(value) || value.length === 0) return "";
    return JSON.stringify(value, null, 2);
}

function parseOptionalJsonArray(value: string | undefined, label: string) {
    if (!value?.trim()) return null;
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) {
        throw new Error(`${label} must be a JSON array.`);
    }
    const compacted = parsed
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
        .map(compactJsonObject)
        .filter((item) => Object.keys(item).length > 0);
    return compacted.length ? compacted : null;
}

function parseOptionalInt(value: string | undefined, label: string) {
    if (!value?.trim()) return null;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 0) {
        throw new Error(`${label} must be a whole number.`);
    }
    return parsed;
}

function optionalValue(value?: string) {
    return value?.trim() ? value.trim() : null;
}

function buildFullName(values: Pick<PersonFormValues, "title" | "first_name" | "middle_name" | "last_name">) {
    return [values.first_name, values.middle_name, values.last_name].filter(Boolean).join(" ").trim();
}

type AssignmentEditorMode = "create" | "edit" | "reassign";

function formatAssignmentRole(assignment: StaffAssignment) {
    return assignment.title || assignment.role_display || assignment.role.replace(/_/g, " ");
}

function formatAssignmentEntity(assignment: StaffAssignment) {
    return assignment.entity?.name || assignment.entity_type.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
    return value ? new Date(value).toLocaleDateString() : "Not set";
}

function dateOnly(value?: string | null) {
    return value ? value.split("T")[0] : "";
}

function personValues(person: Person): PersonFormValues {
    return {
        first_name: person.first_name || "",
        last_name: person.last_name || "",
        middle_name: person.middle_name || "",
        title: person.title || "",
        email: person.email || "",
        phone: person.phone || "",
        alternative_email: person.alternative_email || "",
        alternative_phone: person.alternative_phone || "",
        bio: richTextToEditorValue(person.bio),
        full_bio: richTextToEditorValue(person.full_bio),
        qualifications: arrayToJson(person.qualifications),
        education_background: arrayToJson(person.education_background),
        professional_memberships: arrayToJson(person.professional_memberships),
        awards_honors: arrayToJson(person.awards_honors),
        employee_number: person.employee_number || "",
        employment_type: person.employment_type || "full_time",
        employment_start_date: dateOnly(person.employment_start_date),
        employment_end_date: dateOnly(person.employment_end_date),
        date_of_appointment: dateOnly(person.date_of_appointment),
        job_group: person.job_group || "",
        contract_type: person.contract_type || "",
        department_id: person.department_id || "",
        academic_rank: person.academic_rank || "",
        tenure_status: person.tenure_status || "",
        specialization: richTextToEditorValue(person.specialization),
        research_interests: arrayToCsv(person.research_interests),
        teaching_areas: arrayToCsv(person.teaching_areas),
        courses_taught: arrayToCsv(person.courses_taught),
        publications_count: person.publications_count?.toString() || "",
        h_index: person.h_index?.toString() || "",
        office_location: person.office_location || "",
        office_hours: objectToJson(person.office_hours),
        office_phone: person.office_phone || "",
        google_scholar_id: person.google_scholar_id || "",
        google_scholar_url: person.google_scholar_url || "",
        orcid: person.orcid || "",
        linkedin_url: person.linkedin_url || "",
        website_url: person.website_url || "",
        researchgate_url: person.researchgate_url || "",
        scopus_id: person.scopus_id || "",
        institutional_role: person.institutional_role || "",
        leadership_message: richTextToEditorValue(person.leadership_message),
        cv_file_id: person.cv_file_id || "",
        is_active: person.is_active ?? true,
        is_public: person.is_public ?? true,
        is_researcher: person.is_researcher ?? false,
        is_featured: person.is_featured ?? false,
        show_on_directory: person.show_on_directory ?? true,
    };
}

export default function PersonFormPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const routeId = params.id as string;
    const id = routeId === "_static" ? searchParams.get("id") || "" : routeId;
    const isNew = routeId === "new";
    const { canCreate, canEdit } = usePermissions();
    const canWriteProfile = isNew ? canCreate("staff") || canCreate("persons") : canEdit("staff") || canEdit("persons");

    const { data: personData, isLoading } = usePerson(!isNew && id ? id : "");
    const assignmentsQuery = useStaffAssignments(
        {
            person_id: !isNew ? id : undefined,
            status: "all",
            fields: "id,person_id,entity_type,entity_id,role,title,hierarchy_level,status,start_date,end_date,is_primary,is_acting,is_public,term_years,term_renewable,show_term_dates,reports_to_id,notes,display_order,created_at,updated_at",
        },
        { enabled: !isNew && !!id }
    );
    const [selectedSchoolId, setSelectedSchoolId] = useState("");
    const createPerson = useCreatePerson();
    const updatePerson = useUpdatePerson();
    const uploadPhoto = useUploadPersonPhoto();
    const removePhoto = useRemovePersonPhoto();
    const activatePerson = useActivatePerson();
    const deactivatePerson = useDeactivatePerson();
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [shouldRemovePhoto, setShouldRemovePhoto] = useState(false);
    const [assignmentEditorOpen, setAssignmentEditorOpen] = useState(false);
    const [assignmentEditorMode, setAssignmentEditorMode] = useState<AssignmentEditorMode>("create");
    const [selectedAssignment, setSelectedAssignment] = useState<StaffAssignment | null>(null);
    const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [hasHydratedRecord, setHasHydratedRecord] = useState(isNew);

    const isPending = createPerson.isPending || updatePerson.isPending || uploadPhoto.isPending || removePhoto.isPending || activatePerson.isPending || deactivatePerson.isPending || confirmLoading;

    const form = useForm<PersonFormValues>({
        resolver: zodResolver(personSchema),
        defaultValues,
    });

    useEffect(() => {
        if (personData?.data) {
            form.reset(personValues(personData.data));
            setSelectedSchoolId(personData.data.department?.school_id || "");
            setPhotoFile(null);
            setPhotoPreview(null);
            setShouldRemovePhoto(false);
            setHasHydratedRecord(true);
        } else if (isNew) {
            form.reset(defaultValues);
            setHasHydratedRecord(true);
        }
    }, [form, isNew, personData?.data]);

    useEffect(() => {
        if (!selectedSchoolId && personData?.data?.department?.school_id) {
            setSelectedSchoolId(personData.data.department.school_id);
        }
    }, [personData?.data?.department?.school_id, selectedSchoolId]);

    const renderInput = (name: Path<PersonFormValues>, label: string, placeholder?: string, type = "text") => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <Input
                            type={type}
                            placeholder={placeholder}
                            {...field}
                            value={typeof field.value === "boolean" ? "" : field.value ?? ""}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    const renderRichText = (name: Path<PersonFormValues>, label: string, placeholder?: string, rows = 3) => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <RichTextEditor
                            placeholder={placeholder}
                            toolbar="simple"
                            minHeight={`${Math.max(rows * 44, 140)}px`}
                            value={typeof field.value === "boolean" ? "" : field.value ?? ""}
                            onChange={field.onChange}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    const renderJsonArrayEditor = (name: Path<PersonFormValues>, label: string, fields: JsonEditorField[], itemLabel: string) => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <JsonObjectEditor
                            mode="array"
                            fields={fields}
                            itemLabel={itemLabel}
                            addLabel={`Add ${itemLabel.toLowerCase()}`}
                            value={safeJsonValue<Record<string, unknown>[]>(typeof field.value === "string" ? field.value : "", [])}
                            onChange={(nextValue) => field.onChange(JSON.stringify(nextValue, null, 2))}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    const renderJsonObjectEditor = (name: Path<PersonFormValues>, label: string, fields: JsonEditorField[]) => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                        <JsonObjectEditor
                            mode="object"
                            fields={fields}
                            value={safeJsonValue<Record<string, unknown>>(typeof field.value === "string" ? field.value : "", {})}
                            onChange={(nextValue) => field.onChange(JSON.stringify(nextValue, null, 2))}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    const renderSwitch = (name: Path<PersonFormValues>, label: string) => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <FormLabel className="cursor-pointer">{label}</FormLabel>
                    <FormControl>
                        <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
                    </FormControl>
                </FormItem>
            )}
        />
    );

    const savePerson = async (payload: PersonCreatePayload) => {
        let savedId = id;
        if (isNew) {
            const response = await createPerson.mutateAsync(payload);
            savedId = response.data.id;
            toast.success("Person created successfully");
        } else {
            const updatePayload: PersonUpdatePayload = payload;
            const patch = pickChangedPayload(
                updatePayload,
                form.formState.dirtyFields as Record<string, unknown>,
                personPayloadFieldMap,
            );
            const hasProfileChanges = hasChangedPayload(patch);
            const hasPhotoChanges = Boolean(photoFile || shouldRemovePhoto);
            if (!hasProfileChanges && !hasPhotoChanges) {
                toast.info("No changes to save");
                return;
            }
            if (hasProfileChanges) {
                const response = await updatePerson.mutateAsync({ id, data: patch });
                form.reset(personValues(response.data));
                toast.success("Person updated successfully");
            }
        }

        if (photoFile) {
            const response = await uploadPhoto.mutateAsync({ id: savedId, file: photoFile });
            if (!isNew) {
                form.reset(personValues(response.data));
            }
            setPhotoFile(null);
            setPhotoPreview(null);
            toast.success("Profile image updated");
        } else if (shouldRemovePhoto && !isNew) {
            const response = await removePhoto.mutateAsync(savedId);
            form.reset(personValues(response.data));
            setShouldRemovePhoto(false);
            toast.success("Profile image removed");
        }
        if (isNew) {
            router.push("/people/persons");
        }
    };

    const onSubmit = (values: PersonFormValues) => {
        try {
            const payload: PersonCreatePayload = {
                title: values.title || null,
                first_name: values.first_name,
                middle_name: values.middle_name || null,
                last_name: values.last_name,
                full_name: buildFullName(values),
                email: values.email,
                phone: values.phone || null,
                alternative_email: values.alternative_email || null,
                alternative_phone: values.alternative_phone || null,
                bio: richTextToPayloadValue(values.bio),
                full_bio: richTextToPayloadValue(values.full_bio),
                qualifications: parseOptionalJsonArray(values.qualifications, "Qualifications") as PersonCreatePayload["qualifications"],
                education_background: parseOptionalJsonArray(values.education_background, "Education background"),
                professional_memberships: parseOptionalJsonArray(values.professional_memberships, "Professional memberships"),
                awards_honors: parseOptionalJsonArray(values.awards_honors, "Awards and honors"),
                employee_number: values.employee_number || null,
                employment_type: values.employment_type,
                employment_start_date: optionalValue(values.employment_start_date),
                employment_end_date: optionalValue(values.employment_end_date),
                date_of_appointment: optionalValue(values.date_of_appointment),
                job_group: values.job_group || null,
                contract_type: values.contract_type || null,
                department_id: values.department_id || null,
                academic_rank: values.academic_rank || null,
                tenure_status: values.tenure_status || null,
                specialization: richTextToPayloadValue(values.specialization),
                research_interests: parseCsv(values.research_interests),
                teaching_areas: parseCsv(values.teaching_areas),
                courses_taught: parseCsv(values.courses_taught),
                publications_count: parseOptionalInt(values.publications_count, "Publications count") ?? 0,
                h_index: parseOptionalInt(values.h_index, "H-index"),
                office_location: values.office_location || null,
                office_hours: parseOptionalJson(values.office_hours),
                office_phone: values.office_phone || null,
                institutional_role: values.institutional_role || null,
                leadership_message: richTextToPayloadValue(values.leadership_message),
                google_scholar_id: values.google_scholar_id || null,
                google_scholar_url: values.google_scholar_url || null,
                orcid: values.orcid || null,
                linkedin_url: values.linkedin_url || null,
                website_url: values.website_url || null,
                researchgate_url: values.researchgate_url || null,
                scopus_id: values.scopus_id || null,
                cv_file_id: values.cv_file_id || null,
                is_active: values.is_active,
                is_public: values.is_public,
                is_researcher: values.is_researcher,
                is_featured: values.is_featured,
                show_on_directory: values.show_on_directory,
            };

            const photoAction = photoFile ? " The selected profile image will also be uploaded." : shouldRemovePhoto && !isNew ? " The existing profile image will also be removed." : "";
            setConfirmState({
                title: isNew ? "Create person?" : "Save person changes?",
                description: `${isNew ? "This will create a new staff/person profile." : "This will update this staff/person profile."}${photoAction}`,
                confirmLabel: isNew ? "Create person" : "Save changes",
                onConfirm: () => savePerson(payload),
            });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : isNew ? "Failed to prepare person creation" : "Failed to prepare person update");
        }
    };

    const confirmLifecycleChange = () => {
        const isActive = personData?.data?.is_active;
        setConfirmState({
            title: isActive ? "Deactivate person?" : "Activate person?",
            description: isActive
                ? "This will mark the person inactive and end active assignments according to backend lifecycle rules."
                : "This will restore the person as active.",
            confirmLabel: isActive ? "Deactivate" : "Activate",
            variant: isActive ? "destructive" : "default",
            onConfirm: async () => {
                if (isActive) {
                    await deactivatePerson.mutateAsync(id);
                    toast.success("Person deactivated");
                } else {
                    await activatePerson.mutateAsync(id);
                    toast.success("Person activated");
                }
            },
        });
    };

    const assignments = assignmentsQuery.data?.data ?? [];
    const activeAssignments = assignments.filter((assignment) => assignment.status === "active");
    const historicalAssignments = assignments.filter((assignment) => assignment.status !== "active");
    const primaryAssignment = activeAssignments.find((assignment) => assignment.is_primary) || activeAssignments[0];

    const openAssignmentEditor = (mode: AssignmentEditorMode, assignment?: StaffAssignment) => {
        setAssignmentEditorMode(mode);
        setSelectedAssignment(assignment ?? null);
        setAssignmentEditorOpen(true);
    };

    const renderAssignmentItem = (assignment: StaffAssignment) => (
        <div key={assignment.id} className="space-y-3 rounded-md border p-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-medium">{formatAssignmentRole(assignment)}</p>
                        <Badge variant={assignment.status === "active" ? "default" : "secondary"}>{assignment.status}</Badge>
                        {assignment.is_primary ? <Badge variant="outline">Primary</Badge> : null}
                        {assignment.is_acting ? <Badge variant="warning">Acting</Badge> : null}
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-3.5 w-3.5" />
                            <span>{formatAssignmentEntity(assignment)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                {assignment.start_date ? `Started ${formatDate(assignment.start_date)}` : "Start date not set"}
                                {assignment.end_date ? `, ended ${formatDate(assignment.end_date)}` : ""}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" disabled={!canWriteProfile} onClick={() => openAssignmentEditor("edit", assignment)}>
                    <Edit data-icon="inline-start" />
                    Edit
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={!canWriteProfile} onClick={() => openAssignmentEditor("reassign", assignment)}>
                    <RefreshCw data-icon="inline-start" />
                    Reassign
                </Button>
            </div>
        </div>
    );

    if (isLoading || !hasHydratedRecord) {
        return <LoadingSkeleton rows={12} />;
    }

    const fullName = personData?.data 
        ? [personData.data.title, personData.data.first_name, personData.data.last_name].filter(Boolean).join(" ")
        : "";
    const currentPhoto = shouldRemovePhoto ? null : photoPreview || resolveMainMediaUrl(personData?.data?.photo_url) || null;
    const person = personData?.data;
    const departmentName = person?.department?.name || person?.department_name || "No department assigned";
    const profileStatus = person?.deleted_at ? "Deleted" : person?.is_active === false ? "Inactive" : "Active";
    const profileInitials = [person?.first_name?.[0], person?.last_name?.[0]].filter(Boolean).join("") || "?";

    const renderPhotoActions = () => (
        <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" disabled={!canWriteProfile || isPending} asChild>
                <label>
                    <Camera data-icon="inline-start" />
                    Upload image
                    <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;
                            setPhotoFile(file);
                            setShouldRemovePhoto(false);
                            setPhotoPreview(file ? URL.createObjectURL(file) : null);
                        }}
                    />
                </label>
            </Button>
            {currentPhoto ? (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    disabled={!canWriteProfile || isPending}
                    onClick={() => setConfirmState({
                        title: "Remove profile image?",
                        description: isNew
                            ? "This will remove the selected image from this unsaved profile."
                            : "This will remove the profile image when you save the person profile.",
                        confirmLabel: "Remove image",
                        variant: "destructive",
                        onConfirm: async () => {
                            setPhotoFile(null);
                            setPhotoPreview(null);
                            setShouldRemovePhoto(true);
                        },
                    })}
                >
                    <Trash2 data-icon="inline-start" />
                    Remove
                </Button>
            ) : null}
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <PageHeader
                title={isNew ? "Add Person" : "Edit Person"}
                description={isNew ? "Add a new person" : `Editing: ${fullName}`}
                backHref="/people/persons"
                actions={!isNew && canWriteProfile ? (
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" onClick={() => router.push(`/people/persons/_static/assignments?id=${encodeURIComponent(id)}`)}>
                            Manage Assignments
                        </Button>
                        <Button
                            type="button"
                            variant={personData?.data?.is_active ? "outline" : "default"}
                            onClick={confirmLifecycleChange}
                        >
                            {personData?.data?.is_active ? "Deactivate" : "Activate"}
                        </Button>
                    </div>
                ) : undefined}
            />

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <Card>
                        <CardContent className="p-5">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md border bg-muted">
                                        {currentPhoto ? (
                                            <Image src={currentPhoto} alt={fullName || "Profile image"} fill className="object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                                                {profileInitials}
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 space-y-3">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="text-2xl font-semibold tracking-tight">{isNew ? "New Staff Profile" : fullName || "Staff profile"}</h2>
                                                <Badge variant={profileStatus === "Active" ? "default" : "secondary"}>{profileStatus}</Badge>
                                                {person?.is_public ? <Badge variant="outline">Public</Badge> : null}
                                                {person?.show_on_directory ? <Badge variant="outline">Directory</Badge> : null}
                                            </div>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {primaryAssignment ? formatAssignmentRole(primaryAssignment) : person?.academic_rank || person?.institutional_role || "No primary role assigned"}
                                            </p>
                                        </div>
                                        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                                            <span className="flex min-w-0 items-center gap-2">
                                                <Building2 className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{departmentName}</span>
                                            </span>
                                            <span className="flex min-w-0 items-center gap-2">
                                                <Mail className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{person?.email || "Email not set"}</span>
                                            </span>
                                            <span className="flex min-w-0 items-center gap-2">
                                                <Phone className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{person?.phone || person?.office_phone || "Phone not set"}</span>
                                            </span>
                                            <span className="flex min-w-0 items-center gap-2">
                                                <MapPin className="h-4 w-4 shrink-0" />
                                                <span className="truncate">{person?.office_location || "Office not set"}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2">{renderPhotoActions()}</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Tabs defaultValue="profile" className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4 lg:w-fit">
                            <TabsTrigger value="profile">Profile</TabsTrigger>
                            <TabsTrigger value="assignments">Assignments</TabsTrigger>
                            <TabsTrigger value="history">History</TabsTrigger>
                            <TabsTrigger value="media">Media</TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-4 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="title"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Title</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Prof." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="first_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="last_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Doe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="middle_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Middle Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Middle name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {renderInput("tenure_status", "Tenure Status", "Tenured, contract, non-tenure")}
                                        {renderInput("institutional_role", "Institutional Role", "dean, hod, director")}
                                    </div>

                                    {renderRichText("specialization", "Specialization", "Areas of specialization...", 3)}

                                    <div className="grid grid-cols-2 gap-4">
                                        {renderInput("research_interests", "Research Interests", "AI, public health, governance")}
                                        {renderInput("teaching_areas", "Teaching Areas", "Software engineering, databases")}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {renderInput("courses_taught", "Courses Taught", "CSC 101, CSC 220")}
                                        {renderInput("office_phone", "Office Phone", "+254...")}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email *</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="john.doe@university.ac.ke" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+254..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {renderInput("alternative_email", "Alternative Email", "person@example.com", "email")}
                                        {renderInput("alternative_phone", "Alternative Phone", "+254...")}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="employment_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Employment Type *</FormLabel>
                                                    <FormControl>
                                                        <Select value={field.value || ""} onValueChange={field.onChange}>
                                                            <SelectTrigger><SelectValue placeholder="Select employment type" /></SelectTrigger>
                                                            <SelectContent>
                                                                <SelectGroup>
                                                                    {EMPLOYMENT_TYPES.map((type) => (
                                                                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                                                    ))}
                                                                </SelectGroup>
                                                            </SelectContent>
                                                        </Select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
                                            Full name is generated from first, middle, and last name.
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {renderInput("employee_number", "Employee Number", "KSU/HR/0001")}
                                        {renderInput("job_group", "Job Group", "Grade")}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        {renderInput("employment_start_date", "Employment Start", undefined, "date")}
                                        {renderInput("employment_end_date", "Employment End", undefined, "date")}
                                        {renderInput("date_of_appointment", "Date of Appointment", undefined, "date")}
                                    </div>

                                    {renderInput("contract_type", "Contract Type", "Permanent, fixed term")}

                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Professional Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <SchoolPicker
                                                value={selectedSchoolId}
                                                onChange={(value) => {
                                                    setSelectedSchoolId(value);
                                                    form.setValue("department_id", "", { shouldDirty: true });
                                                }}
                                                label="School"
                                                placeholder="Select school"
                                            />
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="department_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <DepartmentPicker
                                                            value={field.value}
                                                            onChange={(value) => field.onChange(value)}
                                                            filters={selectedSchoolId ? { school_id: selectedSchoolId } : undefined}
                                                            label="Department"
                                                            placeholder={selectedSchoolId ? "Select department" : "Select school first or search all departments"}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="academic_rank"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Academic Rank</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Senior Lecturer" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="office_location"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Office Location</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Room 101" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {renderJsonObjectEditor("office_hours", "Office Hours", OFFICE_HOURS_FIELDS)}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Short Bio</FormLabel>
                                                <FormControl>
                                                    <RichTextEditor
                                                        value={field.value ?? ""}
                                                        onChange={field.onChange}
                                                        placeholder="Brief biography..."
                                                        toolbar="simple"
                                                        minHeight="140px"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="full_bio"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Full Bio</FormLabel>
                                                <FormControl>
                                                    <RichTextEditor
                                                        value={field.value ?? ""}
                                                        onChange={field.onChange}
                                                        placeholder="Detailed biography..."
                                                        minHeight="260px"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {renderRichText("leadership_message", "Leadership Message", "Message shown on public leadership profiles...", 4)}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Research & Social</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="google_scholar_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Google Scholar ID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="abc123..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="orcid"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>ORCID</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="0000-0000-0000-0000" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="linkedin_url"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>LinkedIn URL</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://linkedin.com/in/..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="website_url"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Website URL</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="https://..." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {renderInput("google_scholar_url", "Google Scholar URL", "https://scholar.google.com/...")}
                                        {renderInput("researchgate_url", "ResearchGate URL", "https://www.researchgate.net/...")}
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        {renderInput("scopus_id", "Scopus ID", "Scopus author ID")}
                                        {renderInput("publications_count", "Publications Count", "0", "number")}
                                        {renderInput("h_index", "H-Index", "0", "number")}
	                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Structured Profile Data</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {renderJsonArrayEditor("qualifications", "Qualifications", QUALIFICATION_FIELDS, "Qualification")}
                                    {renderJsonArrayEditor("education_background", "Education Background", QUALIFICATION_FIELDS, "Education item")}
                                    {renderJsonArrayEditor("professional_memberships", "Professional Memberships", MEMBERSHIP_FIELDS, "Membership")}
                                    {renderJsonArrayEditor("awards_honors", "Awards And Honors", AWARD_FIELDS, "Award")}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            {!isNew ? (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <CardTitle>Assignments</CardTitle>
                                                {primaryAssignment ? (
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Primary: {formatAssignmentRole(primaryAssignment)}
                                                    </p>
                                                ) : null}
                                            </div>
                        <Button type="button" size="sm" disabled={!canWriteProfile} onClick={() => openAssignmentEditor("create")}>
                                                <Plus data-icon="inline-start" />
                                                Add
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {assignmentsQuery.isLoading ? (
                                            <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">Loading assignments...</p>
                                        ) : activeAssignments.length === 0 ? (
                                            <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                                                No active assignments. Add one to connect this person to a school, department, division, board, or university role.
                                            </div>
                                        ) : (
                                            <div className="space-y-3">{activeAssignments.map(renderAssignmentItem)}</div>
                                        )}

                                        {historicalAssignments.length > 0 ? (
                                            <div className="space-y-2">
                                                <p className="text-sm font-medium">History</p>
                                                <div className="space-y-3">{historicalAssignments.slice(0, 3).map(renderAssignmentItem)}</div>
                                                {historicalAssignments.length > 3 ? (
                                                    <Button type="button" variant="outline" size="sm" onClick={() => router.push(`/people/persons/_static/assignments?id=${encodeURIComponent(id)}`)}>
                                                        View all history
                                                    </Button>
                                                ) : null}
                                            </div>
                                        ) : null}
                                    </CardContent>
                                </Card>
                            ) : null}

                            <Card>
                                <CardHeader>
                                    <CardTitle>Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {renderSwitch("is_active", "Active")}
                                    {renderSwitch("is_public", "Public profile")}
                                    {renderSwitch("show_on_directory", "Show on directory")}
                                    {renderSwitch("is_researcher", "Researcher")}
                                    {renderSwitch("is_featured", "Featured")}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                        </TabsContent>

                        <TabsContent value="assignments" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                        <div>
                                            <CardTitle>Assignments</CardTitle>
                                            <CardDescription>
                                                Active roles, reporting relationships, reassignment, and ended assignment history for this staff profile.
                                            </CardDescription>
                                        </div>
                                        {!isNew ? (
                                            <Button type="button" disabled={!canWriteProfile} onClick={() => openAssignmentEditor("create")}>
                                                <Plus data-icon="inline-start" />
                                                Add assignment
                                            </Button>
                                        ) : null}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <section className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                                            <h3 className="font-medium">Active Assignments</h3>
                                            <Badge variant="secondary">{activeAssignments.length}</Badge>
                                        </div>
                                        {assignmentsQuery.isLoading ? (
                                            <p className="rounded-md border bg-background p-4 text-sm text-muted-foreground">Loading assignments...</p>
                                        ) : activeAssignments.length === 0 ? (
                                            <p className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
                                                No active assignments. Add one to connect this staff profile to a real school, department, division, board, or university role.
                                            </p>
                                        ) : (
                                            <div className="grid gap-3 xl:grid-cols-2">{activeAssignments.map(renderAssignmentItem)}</div>
                                        )}
                                    </section>

                                    <section className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <h3 className="font-medium">Ended Or Inactive Assignments</h3>
                                            <Badge variant="secondary">{historicalAssignments.length}</Badge>
                                        </div>
                                        {historicalAssignments.length === 0 ? (
                                            <p className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">No ended or inactive assignments.</p>
                                        ) : (
                                            <div className="grid gap-3 xl:grid-cols-2">{historicalAssignments.map(renderAssignmentItem)}</div>
                                        )}
                                    </section>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>History</CardTitle>
                                    <CardDescription>Lifecycle and assignment history available from the current backend records.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div className="rounded-md border p-3 text-sm">
                                            <p className="text-muted-foreground">Created</p>
                                            <p className="mt-1 font-medium">{formatDate(person?.created_at)}</p>
                                        </div>
                                        <div className="rounded-md border p-3 text-sm">
                                            <p className="text-muted-foreground">Last updated</p>
                                            <p className="mt-1 font-medium">{formatDate(person?.updated_at)}</p>
                                        </div>
                                        <div className="rounded-md border p-3 text-sm">
                                            <p className="text-muted-foreground">Deleted</p>
                                            <p className="mt-1 font-medium">{person?.deleted_at ? formatDate(person.deleted_at) : "Not deleted"}</p>
                                        </div>
                                    </div>
                                    {historicalAssignments.length > 0 ? (
                                        <div className="space-y-3">
                                            <h3 className="font-medium">Assignment Timeline</h3>
                                            <div className="space-y-3">{historicalAssignments.map(renderAssignmentItem)}</div>
                                        </div>
                                    ) : (
                                        <p className="rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">No assignment history has been recorded for this staff profile.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="media" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Media</CardTitle>
                                    <CardDescription>Profile image and related staff media references.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6 lg:grid-cols-[180px_1fr]">
                                    <div className="space-y-3">
                                        <div className="relative h-40 w-40 overflow-hidden rounded-md border bg-muted">
                                            {currentPhoto ? (
                                                <Image src={currentPhoto} alt={fullName || "Profile image"} fill className="object-cover" />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center">
                                                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        {renderPhotoActions()}
                                    </div>
                                    <div className="space-y-4">
                                        <div className="rounded-md border bg-muted/40 p-4 text-sm">
                                            <p className="font-medium">Profile image</p>
                                            <p className="mt-1 text-muted-foreground">
                                                Images are uploaded through the existing media service and saved to this staff profile.
                                            </p>
                                        </div>
                                        <FormField
                                            control={form.control}
                                            name="cv_file_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>CV / Profile Document</FormLabel>
                                                    <FormControl>
                                                        <MediaPicker
                                                            value={typeof field.value === "string" ? field.value : ""}
                                                            onChange={(value) => field.onChange(value)}
                                                            label="CV or profile document"
                                                            placeholder="No CV document selected"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {person?.photo_url ? (
                                            <div className="rounded-md border p-3 text-sm">
                                                <p className="font-medium">Current image URL</p>
                                                <p className="mt-1 break-all text-muted-foreground">{person.photo_url}</p>
                                            </div>
                                        ) : null}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={isPending || !canWriteProfile}>
                            {isPending ? "Saving..." : isNew ? "Add Person" : "Save Changes"}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => router.push("/people/persons")}>
                            Cancel
                        </Button>
                    </div>

                    <ConfirmDialog
                        open={!!confirmState}
                        onOpenChange={(open) => !open && setConfirmState(null)}
                        title={confirmState?.title}
                        description={confirmState?.description}
                        confirmLabel={confirmState?.confirmLabel}
                        variant={confirmState?.variant}
                        isLoading={confirmLoading}
                        onConfirm={async () => {
                            if (!confirmState) return;
                            setConfirmLoading(true);
                            try {
                                await confirmState.onConfirm();
                                setConfirmState(null);
                            } catch (error) {
                                toast.error(error instanceof Error ? error.message : "Action failed");
                            } finally {
                                setConfirmLoading(false);
                            }
                        }}
                    />
                </form>
            </Form>

            {!isNew ? (
                <StaffAssignmentEditor
                    open={assignmentEditorOpen}
                    onOpenChange={setAssignmentEditorOpen}
                    mode={assignmentEditorMode}
                    assignment={selectedAssignment}
                    presetPersonId={id}
                    onSuccess={() => assignmentsQuery.refetch()}
                />
            ) : null}
        </motion.div>
    );
}
