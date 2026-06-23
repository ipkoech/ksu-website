"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DepartmentPicker, SchoolPicker } from "@/components/relationships";
import {
  libraryBranchRelationshipAdapter,
  researchCenterRelationshipAdapter,
} from "@/components/relationships/relationship-adapters";
import {
  Badge,
  Button,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
  RichTextEditor,
  richTextToPlainText,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import {
  useCheckPositionConflict,
  useCreatePerson,
  useCreateStaffAssignment,
  useEndStaffAssignment,
  useEntityTypes,
  usePersons,
  useReassignStaffAssignment,
  useRoles,
  useStaffAssignments,
  useStaffEntities,
  useUpdateStaffAssignment,
} from "@ksu/api-client";
import type {
  Person,
  StaffAssignment,
  StaffAssignmentConflict,
  StaffAssignmentConflictResolution,
  StaffAssignmentCreatePayload,
  StaffAssignmentUpdatePayload,
  StaffEntityOption,
} from "@ksu/api-client";
import { Plus, Search, UserPlus } from "lucide-react";

type AssignmentEntityOption = Pick<
  StaffEntityOption,
  "id" | "entity_type" | "label" | "subtitle" | "is_active"
>;

type EditorMode = "create" | "edit" | "reassign";

interface ConfirmState {
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "destructive";
  onConfirm: () => Promise<void>;
}

interface StaffAssignmentEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: EditorMode;
  assignment?: StaffAssignment | null;
  presetPersonId?: string;
  presetEntityType?: string;
  presetEntityId?: string | null;
  presetEntityLabel?: string;
  lockEntity?: boolean;
  onSuccess?: (assignment: StaffAssignment) => void;
}

interface AssignmentFormState {
  person_id: string;
  entity_type: string;
  entity_id: string;
  role: string;
  title: string;
  hierarchy_level: number;
  reports_to_id: string;
  start_date: string;
  end_date: string;
  term_years: string;
  notes: string;
  is_primary: boolean;
  is_acting: boolean;
  is_public: boolean;
  term_renewable: boolean;
  show_term_dates: boolean;
  status: string;
}

const defaultForm: AssignmentFormState = {
  person_id: "",
  entity_type: "department",
  entity_id: "",
  role: "",
  title: "",
  hierarchy_level: 10,
  reports_to_id: "",
  start_date: "",
  end_date: "",
  term_years: "",
  notes: "",
  is_primary: false,
  is_acting: false,
  is_public: true,
  term_renewable: true,
  show_term_dates: false,
  status: "active",
};

function valueOrNull(value: string) {
  return value.trim() ? value.trim() : null;
}

function buildFullName(firstName: string, lastName: string) {
  return [firstName, lastName].filter(Boolean).join(" ").trim();
}

function formatPersonName(person?: Person | null) {
  if (!person) return "";
  return person.full_name || [person.title, person.first_name, person.last_name].filter(Boolean).join(" ").trim() || person.email || "";
}

function formatEntityType(value?: string | null) {
  return value ? value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Entity";
}

function assignmentRoleLabel(assignment: StaffAssignment) {
  return assignment.title || assignment.role_display || assignment.role.replace(/_/g, " ");
}

function assignmentEntityLabel(assignment: StaffAssignment) {
  return assignment.entity?.name || formatEntityType(assignment.entity_type);
}

function assignmentOptionLabel(assignment: StaffAssignment) {
  const personName = formatPersonName(assignment.person);
  return [personName, assignmentRoleLabel(assignment), assignmentEntityLabel(assignment)].filter(Boolean).join(" - ");
}

export function StaffAssignmentEditor({
  open,
  onOpenChange,
  mode = "create",
  assignment,
  presetPersonId,
  presetEntityType,
  presetEntityId,
  presetEntityLabel,
  lockEntity = false,
  onSuccess,
}: StaffAssignmentEditorProps) {
  const [form, setForm] = useState<AssignmentFormState>(defaultForm);
  const [personSearch, setPersonSearch] = useState("");
  const [entitySearch, setEntitySearch] = useState("");
  const [reportsToSearch, setReportsToSearch] = useState("");
  const [showCreatePerson, setShowCreatePerson] = useState(false);
  const [newPerson, setNewPerson] = useState({ first_name: "", last_name: "", email: "", department_id: "" });
  const [newPersonSchoolId, setNewPersonSchoolId] = useState("");
  const [conflict, setConflict] = useState<StaffAssignmentConflict | null>(null);
  const [resolutionEndDate, setResolutionEndDate] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [endDialogOpen, setEndDialogOpen] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [endNotes, setEndNotes] = useState("");
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const entityTypes = useEntityTypes();
  const roles = useRoles(form.entity_type);
  const usesExternalEntityAdapter = form.entity_type === "library" || form.entity_type === "research";
  const entities = useStaffEntities(
    { entity_type: form.entity_type, search: entitySearch, limit: 40 },
    {
      enabled:
        open &&
        !!form.entity_type &&
        form.entity_type !== "university" &&
        !usesExternalEntityAdapter,
    }
  );
  const externalEntities = useQuery({
    queryKey: ["staff-assignment-entities", form.entity_type, entitySearch],
    queryFn: async () => {
      const adapter =
        form.entity_type === "library"
          ? libraryBranchRelationshipAdapter
          : researchCenterRelationshipAdapter;
      const options = await adapter.search({
        search: entitySearch,
        filters:
          form.entity_type === "library"
            ? { active_only: false }
            : { is_active: true },
        limit: 40,
      });
      return options.map((option): AssignmentEntityOption => ({
        id: option.id,
        entity_type: form.entity_type,
        label: option.label,
        subtitle: option.description,
        is_active: !option.disabled,
      }));
    },
    enabled: open && usesExternalEntityAdapter,
  });
  const persons = usePersons({ search: personSearch || undefined, status: "all", per_page: 20 });
  const reportingAssignments = useStaffAssignments(
    {
      status: "active",
      entity_type: form.entity_type || undefined,
      entity_id: form.entity_type === "university" ? undefined : form.entity_id || undefined,
      fields: "id,person_id,entity_type,entity_id,role,title,hierarchy_level,status,start_date,is_primary,is_acting",
      include: "person:id,title,first_name,last_name,full_name,email",
      limit: 100,
    },
    {
      enabled:
        open &&
        Boolean(form.entity_type) &&
        (form.entity_type === "university" || Boolean(form.entity_id)),
    }
  );
  const createPerson = useCreatePerson();
  const createAssignment = useCreateStaffAssignment();
  const updateAssignment = useUpdateStaffAssignment();
  const reassignAssignment = useReassignStaffAssignment();
  const endAssignment = useEndStaffAssignment();
  const checkConflict = useCheckPositionConflict();

  useEffect(() => {
    if (!open) return;
    setConflict(null);
    setResolutionEndDate("");
    setResolutionNotes("");
    if (assignment) {
      setForm({
        person_id: presetPersonId || assignment.person_id,
        entity_type: assignment.entity_type || presetEntityType || "department",
        entity_id: assignment.entity_id || presetEntityId || "",
        role: assignment.role || "",
        title: assignment.title || "",
        hierarchy_level: assignment.hierarchy_level || 10,
        reports_to_id: assignment.reports_to_id || "",
        start_date: assignment.start_date || "",
        end_date: assignment.end_date || "",
        term_years: assignment.term_years ? String(assignment.term_years) : "",
        notes: assignment.notes || "",
        is_primary: assignment.is_primary,
        is_acting: assignment.is_acting,
        is_public: assignment.is_public,
        term_renewable: assignment.term_renewable,
        show_term_dates: assignment.show_term_dates,
        status: assignment.status || "active",
      });
      setPersonSearch(formatPersonName(assignment.person) || assignment.person?.email || "");
      setEntitySearch(assignment.entity?.name || presetEntityLabel || "");
      setReportsToSearch(assignment.reports_to ? assignmentOptionLabel(assignment.reports_to) : "");
      return;
    }
    setForm({
      ...defaultForm,
      person_id: presetPersonId || "",
      entity_type: presetEntityType || defaultForm.entity_type,
      entity_id: presetEntityId || "",
    });
    setPersonSearch("");
    setEntitySearch(presetEntityLabel || "");
    setReportsToSearch("");
  }, [assignment, open, presetEntityId, presetEntityLabel, presetEntityType, presetPersonId]);

  const selectedRole = useMemo(
    () => roles.data?.data.find((role) => role.role === form.role),
    [form.role, roles.data?.data]
  );

  useEffect(() => {
    if (selectedRole && selectedRole.hierarchy_level !== form.hierarchy_level) {
      setForm((current) => ({ ...current, hierarchy_level: selectedRole.hierarchy_level }));
    }
  }, [selectedRole, form.hierarchy_level]);

  const people = persons.data?.data ?? [];
  const entityOptions: AssignmentEntityOption[] = usesExternalEntityAdapter
    ? externalEntities.data ?? []
    : entities.data?.data ?? [];
  const isFetchingEntities = usesExternalEntityAdapter
    ? externalEntities.isFetching
    : entities.isFetching;
  const selectedEntity = entityOptions.find((entity) => entity.id === form.entity_id);
  const reportingAssignmentOptions = (reportingAssignments.data?.data ?? [])
    .filter((item) => item.id !== assignment?.id)
    .filter((item) => {
      const search = reportsToSearch.trim().toLowerCase();
      if (!search) return true;
      return [
        formatPersonName(item.person),
        item.title,
        item.role_display,
        item.role,
        assignmentEntityLabel(item),
      ].some((value) => value?.toLowerCase().includes(search));
    })
    .slice(0, 40);
  const selectedReportsTo =
    reportingAssignmentOptions.find((item) => item.id === form.reports_to_id) ||
    (assignment?.reports_to_id === form.reports_to_id ? assignment?.reports_to : undefined);
  const isSaving = createAssignment.isPending || updateAssignment.isPending || reassignAssignment.isPending || endAssignment.isPending || createPerson.isPending || confirmLoading;

  const updateField = <Key extends keyof AssignmentFormState>(key: Key, value: AssignmentFormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const selectPerson = (person: Person) => {
    updateField("person_id", person.id);
    setPersonSearch(formatPersonName(person) || person.email);
  };

  const selectEntity = (entity: AssignmentEntityOption) => {
    setForm((current) => ({
      ...current,
      entity_id: entity.id || "",
      reports_to_id: "",
    }));
    setEntitySearch(entity.label);
    setReportsToSearch("");
  };

  const selectReportsTo = (selectedAssignment: StaffAssignment) => {
    updateField("reports_to_id", selectedAssignment.id);
    setReportsToSearch(assignmentOptionLabel(selectedAssignment));
  };

  const createStaffInline = () => {
    if (!newPerson.first_name.trim() || !newPerson.last_name.trim() || !newPerson.email.trim()) {
      toast.error("First name, last name, and email are required");
      return;
    }
    const name = buildFullName(newPerson.first_name, newPerson.last_name);
    setConfirmState({
      title: "Create staff profile?",
      description: `This will create ${name} and select the new profile for this assignment.`,
      confirmLabel: "Create and select",
      onConfirm: async () => {
        const response = await createPerson.mutateAsync({
          first_name: newPerson.first_name.trim(),
          last_name: newPerson.last_name.trim(),
          full_name: name,
          email: newPerson.email.trim(),
          department_id: newPerson.department_id || null,
          employment_type: "full_time",
          is_active: true,
          is_public: true,
          is_researcher: false,
        });
        const created = response.data;
        setForm((current) => ({ ...current, person_id: created.id }));
        setPersonSearch(created.full_name || created.email);
        setShowCreatePerson(false);
        toast.success("Staff profile created");
      },
    });
  };

  const validateAssignmentForm = (resolution?: StaffAssignmentConflictResolution) => {
    if (!form.person_id || !form.entity_type || !form.role) {
      toast.error("Person, entity type, and role are required");
      return false;
    }
    if (form.entity_type !== "university" && !form.entity_id) {
      toast.error("Select the specific entity for this assignment");
      return false;
    }
    if (resolution === "replace_current" && (!resolutionEndDate || !resolutionNotes.trim())) {
      toast.error("Replacement requires an end date and notes");
      return false;
    }
    return true;
  };

  const buildPayload = (resolution?: StaffAssignmentConflictResolution): StaffAssignmentCreatePayload => ({
    person_id: form.person_id,
    entity_type: form.entity_type,
    entity_id: form.entity_type === "university" ? null : valueOrNull(form.entity_id),
    role: form.role,
    title: valueOrNull(form.title),
    hierarchy_level: form.hierarchy_level,
    reports_to_id: valueOrNull(form.reports_to_id),
    is_primary: form.is_primary,
    is_acting: resolution === "assign_acting" ? true : form.is_acting,
    is_public: form.is_public,
    start_date: valueOrNull(form.start_date),
    end_date: valueOrNull(form.end_date),
    term_years: form.term_years ? Number(form.term_years) : null,
    term_renewable: form.term_renewable,
    show_term_dates: form.show_term_dates,
    status: form.status,
    display_order: 100,
    notes: valueOrNull(richTextToPlainText(form.notes)),
    conflict_resolution: resolution ?? null,
    conflict_end_date: resolution === "replace_current" ? valueOrNull(resolutionEndDate) : null,
    conflict_notes: resolution === "replace_current" ? valueOrNull(resolutionNotes) : null,
  });

  const runConflictCheck = async () => {
    const strictUniqueRole =
      (form.entity_type === "school" && form.role === "dean") ||
      (form.entity_type === "department" && ["hod", "cod", "head"].includes(form.role));
    if (!form.entity_type || !form.role || (form.is_acting && !strictUniqueRole) || form.status !== "active") return null;
    const response = await checkConflict.mutateAsync({
      entity_type: form.entity_type,
      entity_id: form.entity_type === "university" ? null : valueOrNull(form.entity_id),
      role: form.role,
      exclude_assignment_id: assignment?.id ?? null,
    });
    return response.data;
  };

  const save = async (resolution?: StaffAssignmentConflictResolution, options?: { skipConflictCheck?: boolean }) => {
    if (!validateAssignmentForm(resolution)) return;
    if (!resolution && !options?.skipConflictCheck) {
      const conflictResult = await runConflictCheck();
      if (conflictResult?.has_conflict) {
        setConflict(conflictResult);
        return;
      }
    }

    const payload = buildPayload(resolution);
    let response: { data: StaffAssignment };
    if (mode === "reassign" && assignment) {
      response = await reassignAssignment.mutateAsync({
        id: assignment.id,
        data: {
          person_id: form.person_id,
          title: valueOrNull(form.title),
          start_date: valueOrNull(form.start_date),
          end_previous_date: resolution === "replace_current" ? valueOrNull(resolutionEndDate) : undefined,
          notes: valueOrNull(richTextToPlainText(form.notes)),
          conflict_resolution: resolution ?? null,
          conflict_end_date: resolution === "replace_current" ? valueOrNull(resolutionEndDate) : null,
          conflict_notes: resolution === "replace_current" ? valueOrNull(resolutionNotes) : null,
        },
      });
    } else if (assignment) {
      const updatePayload = { ...payload } as Partial<StaffAssignmentCreatePayload>;
      delete updatePayload.person_id;
      response = await updateAssignment.mutateAsync({ id: assignment.id, data: updatePayload as StaffAssignmentUpdatePayload });
    } else {
      response = await createAssignment.mutateAsync(payload);
    }
    toast.success(mode === "reassign" ? "Assignment reassigned" : assignment ? "Assignment updated" : "Assignment created");
    onSuccess?.(response.data);
    onOpenChange(false);
  };

  const requestSaveConfirmation = async (resolution?: StaffAssignmentConflictResolution) => {
    if (!validateAssignmentForm(resolution)) return;
    if (!resolution) {
      const conflictResult = await runConflictCheck();
      if (conflictResult?.has_conflict) {
        setConflict(conflictResult);
        return;
      }
    }

    const action = resolution === "assign_acting"
      ? "assign this role as acting"
      : resolution === "replace_current"
        ? "replace the current holder"
        : mode === "reassign"
          ? "reassign this position"
          : assignment
            ? "save assignment changes"
            : "create this assignment";
    setConfirmState({
      title: `${action.charAt(0).toUpperCase()}${action.slice(1)}?`,
      description: "This will update staff assignment records and may affect public staff listings and reporting lines.",
      confirmLabel: resolution === "assign_acting" ? "Assign as acting" : resolution === "replace_current" ? "Replace holder" : mode === "reassign" ? "Reassign" : assignment ? "Save changes" : "Assign staff",
      variant: resolution === "replace_current" ? "destructive" : "default",
      onConfirm: () => save(resolution, { skipConflictCheck: true }),
    });
  };

  const requestConflictResolutionConfirmation = (resolution: Exclude<StaffAssignmentConflictResolution, "cancel" | "edit_selection">) => {
    if (!validateAssignmentForm(resolution)) return;
    setConflict(null);
    void requestSaveConfirmation(resolution);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    requestSaveConfirmation().catch((error) => toast.error(error instanceof Error ? error.message : "Failed to prepare assignment"));
  };

  const endCurrentAssignment = async () => {
    if (!assignment) return;
    await endAssignment.mutateAsync({ id: assignment.id, data: { end_date: valueOrNull(endDate), notes: valueOrNull(richTextToPlainText(endNotes)) } });
    toast.success("Assignment ended");
    setEndDialogOpen(false);
    onOpenChange(false);
    onSuccess?.({ ...assignment, status: "ended", end_date: endDate || assignment.end_date });
  };

  const requestEndCurrentAssignment = () => {
    if (!assignment) return;
    setEndDialogOpen(false);
    setConfirmState({
      title: "End assignment?",
      description: "This will end the active assignment and keep it in staff history.",
      confirmLabel: "End assignment",
      variant: "destructive",
      onConfirm: endCurrentAssignment,
    });
  };

  const selectedPerson = people.find((person: Person) => person.id === form.person_id);
  const isEntityLocked = lockEntity && !!presetEntityType;
  const allowedConflictResolutions = conflict?.allowed_resolutions ?? [];
  const canAssignActing = allowedConflictResolutions.includes("assign_acting");
  const canReplaceCurrent = allowedConflictResolutions.includes("replace_current");

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>{mode === "reassign" ? "Reassign Position" : assignment ? "Edit Assignment" : "Assign Staff"}</SheetTitle>
            <SheetDescription>
              Manage the staff member, entity, role, reporting line, dates, visibility, and conflict handling in one workflow.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={submit} className="flex-1 space-y-5 py-4">
            {mode !== "edit" && !presetPersonId ? (
              <section className="space-y-3 rounded-md border p-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Label>Staff member</Label>
                </div>
                <Input value={personSearch} onChange={(event) => setPersonSearch(event.target.value)} placeholder="Search by name or email" />
                <div className="max-h-56 overflow-y-auto rounded-md border bg-background">
                  {people.length > 0 ? (
                    people.map((person: Person) => (
                      <button
                        key={person.id}
                        type="button"
                        className={`flex w-full items-start justify-between gap-3 border-b p-3 text-left text-sm last:border-b-0 ${
                          form.person_id === person.id ? "bg-primary/5" : "hover:bg-muted/60"
                        }`}
                        onClick={() => selectPerson(person)}
                      >
                        <span>
                          <span className="block font-medium">{formatPersonName(person)}</span>
                          <span className="block text-xs text-muted-foreground">{person.email}</span>
                        </span>
                        {form.person_id === person.id ? <Badge variant="default">Selected</Badge> : null}
                      </button>
                    ))
                  ) : (
                    <p className="p-3 text-sm text-muted-foreground">
                      {persons.isFetching ? "Searching staff profiles..." : "No matching staff profiles. Create one below."}
                    </p>
                  )}
                </div>
                {selectedPerson ? (
                  <div className="rounded-md border bg-muted/40 p-3 text-sm">
                    <span className="font-medium">Selected:</span> {formatPersonName(selectedPerson)}{" "}
                    <span className="text-muted-foreground">({selectedPerson.email})</span>
                  </div>
                ) : null}
                <div className="rounded-md bg-muted/50 p-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowCreatePerson((value) => !value)}>
                    <UserPlus data-icon="inline-start" />
                    Create staff profile
                  </Button>
                  {showCreatePerson ? (
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                      <Input placeholder="First name" value={newPerson.first_name} onChange={(event) => setNewPerson((current) => ({ ...current, first_name: event.target.value }))} />
                      <Input placeholder="Last name" value={newPerson.last_name} onChange={(event) => setNewPerson((current) => ({ ...current, last_name: event.target.value }))} />
                      <Input type="email" placeholder="Email" value={newPerson.email} onChange={(event) => setNewPerson((current) => ({ ...current, email: event.target.value }))} />
                      <div className="space-y-2 md:col-span-3">
                        <SchoolPicker
                          value={newPersonSchoolId}
                          onChange={(value) => {
                            setNewPersonSchoolId(value);
                            setNewPerson((current) => ({ ...current, department_id: "" }));
                          }}
                          label="School"
                          placeholder="Select school"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-3">
                        <DepartmentPicker
                          value={newPerson.department_id}
                          onChange={(value) => setNewPerson((current) => ({ ...current, department_id: value }))}
                          filters={newPersonSchoolId ? { school_id: newPersonSchoolId } : undefined}
                          label="Department"
                          placeholder={newPersonSchoolId ? "Select department" : "Optional department"}
                        />
                      </div>
                      <Button type="button" size="sm" onClick={createStaffInline} disabled={createPerson.isPending}>
                        <Plus data-icon="inline-start" />
                        Create and select
                      </Button>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {isEntityLocked ? (
              <div className="rounded-md border bg-muted/40 p-4 text-sm">
                <Label className="text-xs text-muted-foreground">Governance body</Label>
                <p className="mt-1 font-medium">{presetEntityLabel || selectedEntity?.label || formatEntityType(form.entity_type)}</p>
                <p className="text-xs text-muted-foreground">This member will be attached to the current council or board.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Entity type</Label>
                  <Select
                    value={form.entity_type}
                    onValueChange={(value) => {
                      setForm((current) => ({
                        ...current,
                        entity_type: value,
                        entity_id: "",
                        role: "",
                        reports_to_id: "",
                      }));
                      setEntitySearch("");
                      setReportsToSearch("");
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select entity type" /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {entityTypes.data?.data.map((entityType: { type: string; label: string }) => (
                          <SelectItem key={entityType.type} value={entityType.type}>{entityType.label}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Entity</Label>
                  {form.entity_type === "university" ? (
                    <div className="flex h-10 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">University-level assignment</div>
                  ) : (
                    <>
                      <Input placeholder="Search entity" value={entitySearch} onChange={(event) => setEntitySearch(event.target.value)} />
                      <div className="max-h-48 overflow-y-auto rounded-md border bg-background">
                        {entityOptions.length > 0 ? (
                          entityOptions.map((entity) => (
                            <button
                              key={entity.id || entity.label}
                              type="button"
                              className={`flex w-full items-start justify-between gap-3 border-b p-3 text-left text-sm last:border-b-0 ${
                                form.entity_id === entity.id ? "bg-primary/5" : "hover:bg-muted/60"
                              }`}
                              onClick={() => selectEntity(entity)}
                              disabled={!entity.id}
                            >
                              <span>
                                <span className="block font-medium">{entity.label}</span>
                                {entity.subtitle ? <span className="block text-xs text-muted-foreground">{entity.subtitle}</span> : null}
                              </span>
                              {form.entity_id === entity.id ? <Badge variant="default">Selected</Badge> : null}
                            </button>
                          ))
                        ) : (
                          <p className="p-3 text-sm text-muted-foreground">
                            {isFetchingEntities ? "Searching entities..." : "No matching entities."}
                          </p>
                        )}
                      </div>
                      {selectedEntity ? (
                        <div className="rounded-md border bg-muted/40 p-3 text-sm">
                          <span className="font-medium">Selected:</span> {selectedEntity.label}
                          {selectedEntity.subtitle ? <span className="text-muted-foreground"> - {selectedEntity.subtitle}</span> : null}
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(value) => updateField("role", value)}>
                  <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {roles.data?.data.map((role) => (
                        <SelectItem key={role.role} value={role.role}>
                          {role.label}{role.is_unique ? " (unique)" : ""}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <div className="max-h-40 overflow-y-auto rounded-md border bg-background">
                  {roles.data?.data.length ? (
                    roles.data.data.map((role) => (
                      <button
                        key={role.role}
                        type="button"
                        className={`flex w-full items-center justify-between gap-3 border-b p-2 text-left text-sm last:border-b-0 ${
                          form.role === role.role ? "bg-primary/5" : "hover:bg-muted/60"
                        }`}
                        onClick={() => updateField("role", role.role)}
                      >
                        <span>{role.label}</span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          Level {role.hierarchy_level}
                          {role.is_unique ? <Badge variant="outline">Unique</Badge> : null}
                        </span>
                      </button>
                    ))
                  ) : (
                    <p className="p-3 text-sm text-muted-foreground">Select an entity type to load roles.</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Display title</Label>
                <Input value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Senior Lecturer" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Hierarchy</Label>
                <Input type="number" min={1} max={11} value={form.hierarchy_level} onChange={(event) => updateField("hierarchy_level", Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Start date</Label>
                <Input type="date" value={form.start_date} onChange={(event) => updateField("start_date", event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End date</Label>
                <Input type="date" value={form.end_date} onChange={(event) => updateField("end_date", event.target.value)} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Reports to</Label>
                {form.entity_type !== "university" && !form.entity_id ? (
                  <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                    Select an entity first to choose a reporting assignment.
                  </div>
                ) : (
                  <>
                    <Input
                      value={reportsToSearch}
                      onChange={(event) => setReportsToSearch(event.target.value)}
                      placeholder="Search active assignments by staff, role, or entity"
                    />
                    {selectedReportsTo ? (
                      <div className="flex items-start justify-between gap-3 rounded-md border bg-muted/40 p-3 text-sm">
                        <span>
                          <span className="block font-medium">Selected reporting line</span>
                          <span className="block text-muted-foreground">{assignmentOptionLabel(selectedReportsTo)}</span>
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            updateField("reports_to_id", "");
                            setReportsToSearch("");
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    ) : null}
                    <div className="max-h-48 overflow-y-auto rounded-md border bg-background">
                      {reportingAssignmentOptions.length > 0 ? (
                        reportingAssignmentOptions.map((reportingAssignment) => (
                          <button
                            key={reportingAssignment.id}
                            type="button"
                            className={`flex w-full items-start justify-between gap-3 border-b p-3 text-left text-sm last:border-b-0 ${
                              form.reports_to_id === reportingAssignment.id ? "bg-primary/5" : "hover:bg-muted/60"
                            }`}
                            onClick={() => selectReportsTo(reportingAssignment)}
                          >
                            <span>
                              <span className="block font-medium">{assignmentRoleLabel(reportingAssignment)}</span>
                              <span className="block text-xs text-muted-foreground">
                                {formatPersonName(reportingAssignment.person) || "Unassigned staff name"} - {assignmentEntityLabel(reportingAssignment)}
                              </span>
                            </span>
                            {form.reports_to_id === reportingAssignment.id ? <Badge variant="default">Selected</Badge> : null}
                          </button>
                        ))
                      ) : (
                        <p className="p-3 text-sm text-muted-foreground">
                          {reportingAssignments.isFetching ? "Loading reporting assignments..." : "No active reporting assignments found for this selection."}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
              <div className="space-y-2">
                <Label>Term years</Label>
                <Input type="number" min={1} max={10} value={form.term_years} onChange={(event) => updateField("term_years", event.target.value)} placeholder="3" />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {([
                ["is_primary", "Primary role"],
                ["is_acting", "Acting appointment"],
                ["is_public", "Public profile"],
                ["term_renewable", "Renewable term"],
                ["show_term_dates", "Show term dates"],
              ] as const).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between rounded-md border p-3">
                  <Label>{label}</Label>
                  <Switch checked={form[key]} onCheckedChange={(value) => updateField(key, value)} />
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <RichTextEditor toolbar="simple" minHeight="160px" value={form.notes} onChange={(notes) => updateField("notes", notes)} />
            </div>
          </form>

          <SheetFooter className="border-t pt-4">
            {assignment && mode !== "reassign" ? (
              <Button type="button" variant="outline" className="mr-auto" onClick={() => setEndDialogOpen(true)}>
                End assignment
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="button" disabled={isSaving} onClick={() => requestSaveConfirmation().catch((error) => toast.error(error instanceof Error ? error.message : "Failed to prepare assignment"))}>
              {isSaving ? "Saving..." : mode === "reassign" ? "Reassign" : assignment ? "Save changes" : "Assign staff"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={!!conflict} onOpenChange={(nextOpen) => !nextOpen && setConflict(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Position conflict</DialogTitle>
            <DialogDescription>
              {conflict?.role_label} for {conflict?.entity_label} is already assigned.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-md border p-4 text-sm">
              <p className="font-medium">{conflict?.current_holder?.person_name || "Current holder"}</p>
              <p className="text-muted-foreground">Started {conflict?.current_holder?.start_date || "unknown"}</p>
            </div>
            {canReplaceCurrent ? (
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Replacement end date</Label>
                  <Input type="date" value={resolutionEndDate} onChange={(event) => setResolutionEndDate(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Replacement notes</Label>
                  <Input value={resolutionNotes} onChange={(event) => setResolutionNotes(event.target.value)} placeholder="Reason for replacement" />
                </div>
              </div>
            ) : null}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setConflict(null)}>Cancel</Button>
            <Button type="button" variant="outline" onClick={() => setConflict(null)}>Edit selection</Button>
            {canAssignActing ? (
              <Button type="button" variant="secondary" onClick={() => requestConflictResolutionConfirmation("assign_acting")}>Assign as acting</Button>
            ) : null}
            {canReplaceCurrent ? (
              <Button type="button" onClick={() => requestConflictResolutionConfirmation("replace_current")}>Replace current holder</Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={endDialogOpen} onOpenChange={setEndDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End assignment</DialogTitle>
            <DialogDescription>Ending preserves the assignment in staff history.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>End date</Label>
              <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <RichTextEditor toolbar="simple" minHeight="140px" value={endNotes} onChange={setEndNotes} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setEndDialogOpen(false)}>Cancel</Button>
            <Button type="button" variant="destructive" disabled={endAssignment.isPending} onClick={requestEndCurrentAssignment}>
              {endAssignment.isPending ? "Ending..." : "End assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmState}
        onOpenChange={(nextOpen) => !nextOpen && setConfirmState(null)}
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
    </>
  );
}
