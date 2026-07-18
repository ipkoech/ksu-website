"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolTeamMember,
  type SchoolTeamMemberCreate,
  type SchoolTeamRole,
} from "@ksu/api-client";
import {
  AlertTriangle,
  Building2,
  Loader2,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
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
  Textarea,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";

const TEAM_ROLES: Array<{ value: SchoolTeamRole; label: string }> = [
  { value: "dean", label: "Dean" },
  { value: "deputy_dean", label: "Deputy Dean" },
  { value: "cod", label: "Chair of Department" },
  { value: "hod", label: "Head of Department" },
  { value: "coordinator", label: "Coordinator" },
  { value: "school_administrator", label: "School Administrator" },
  { value: "administrative_staff", label: "Administrative Staff" },
  { value: "lecturer", label: "Lecturer" },
  { value: "technician", label: "Technician" },
  { value: "support_staff", label: "Support Staff" },
];

const EMPTY_MEMBER: SchoolTeamMemberCreate = {
  first_name: "",
  last_name: "",
  email: "",
  role: "lecturer",
  is_public: true,
  invite_user: false,
};

export function TeamMemberSheet({
  member,
  members,
  open,
  onOpenChange,
}: {
  member: SchoolTeamMember | null;
  members: SchoolTeamMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { school, can } = useSchoolPortal();
  const queryClient = useQueryClient();
  const [values, setValues] = useState<SchoolTeamMemberCreate>(EMPTY_MEMBER);
  const [action, setAction] = useState<"deactivate" | "end" | "remove" | "revoke" | null>(null);
  const [replacementPersonId, setReplacementPersonId] = useState("");
  const [acknowledgeVacancy, setAcknowledgeVacancy] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const departmentsQuery = useQuery({
    queryKey: [...schoolPortalQueryKeys.departments(school.id), { purpose: "team-member-selector" }],
    queryFn: () => schoolPortalApi.departments.list({ page: 1, per_page: 100, is_active: true }),
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });
  const departments = departmentsQuery.data?.data ?? [];

  useEffect(() => {
    if (!open) return;
    setValues(
      member
        ? {
            role: member.role,
            title: member.title,
            department_id: member.department_id,
            phone: member.phone,
            is_primary: member.is_primary,
            is_public: member.is_public,
            display_order: member.display_order,
          }
        : EMPTY_MEMBER,
    );
    setAction(null);
    setReplacementPersonId("");
    setAcknowledgeVacancy(false);
    setNotes("");
    setError("");
  }, [member, open]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: schoolPortalQueryKeys.team(school.id) });
  };
  const saveMutation = useMutation({
    mutationFn: () =>
      member
        ? schoolPortalApi.team.update(member.id, values)
        : schoolPortalApi.team.create(values),
    onSuccess: async () => {
      await refresh();
      onOpenChange(false);
    },
    onError: (caught) => setError(caught instanceof Error ? caught.message : "Unable to save the team member."),
  });
  const lifecycleMutation = useMutation({
    mutationFn: async () => {
      if (!member || !action) return;
      if (action === "remove") return schoolPortalApi.team.remove(member.id);
      if (action === "revoke") return schoolPortalApi.team.revokeAccess(member.id);
      return schoolPortalApi.team.lifecycle(member.id, action, {
        replacement_person_id: replacementPersonId || null,
        acknowledge_vacancy: acknowledgeVacancy,
        notes: notes || null,
      });
    },
    onSuccess: async () => {
      await refresh();
      onOpenChange(false);
    },
    onError: (caught) => setError(caught instanceof Error ? caught.message : "Unable to complete the lifecycle action."),
  });

  const protectedRole = member?.role === "dean" || member?.portal_role === "school_admin";
  const lifecycleReady = !protectedRole || Boolean(replacementPersonId) || acknowledgeVacancy;
  const canManage = can("school.team.manage");
  const canManageRoles = can("school.team.roles");
  const replacementCandidates = members.filter(
    (candidate) => candidate.id !== member?.id && candidate.is_active && candidate.person_id,
  );
  const createReady = Boolean(
    values.first_name?.trim() &&
    values.last_name?.trim() &&
    values.email?.trim() &&
    values.role,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{member ? "Team member details" : "Add team member"}</SheetTitle>
          <SheetDescription>
            {member
              ? "Update this staff member's school assignment, visibility and access."
              : "Create a staff identity, assign their role and optionally grant portal access."}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-5 py-6">
          {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}

          {!member ? (
            <section className="space-y-4 rounded-xl border p-4">
              <SectionHeading icon={UserRound} title="Staff identity" description="Basic details used across the school portal." />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" value={values.first_name} onChange={(value) => setValues((current) => ({ ...current, first_name: value }))} />
                <Field label="Last name" value={values.last_name} onChange={(value) => setValues((current) => ({ ...current, last_name: value }))} />
                <Field label="Email" type="email" value={values.email} onChange={(value) => setValues((current) => ({ ...current, email: value }))} />
                <Field label="Employee number" value={values.employee_number} onChange={(value) => setValues((current) => ({ ...current, employee_number: value }))} />
              </div>
            </section>
          ) : (
            <div className="overflow-hidden rounded-xl border bg-gradient-to-br from-primary/10 via-background to-emerald-500/10 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">
                  {initials(member.full_name || member.email || "Team member")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{member.full_name || member.email}</p>
                  {member.email ? (
                    <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-muted-foreground">
                      <Mail className="size-3.5" />{member.email}
                    </p>
                  ) : null}
                </div>
                <Badge variant={member.is_active ? "secondary" : "outline"}>
                  {member.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline">{member.role.replaceAll("_", " ")}</Badge>
                {member.portal_role ? (
                  <Badge variant="outline">
                    <ShieldCheck className="mr-1 size-3" />{member.portal_role.replaceAll("_", " ")}
                  </Badge>
                ) : null}
                {member.department?.name ? (
                  <Badge variant="outline">
                    <Building2 className="mr-1 size-3" />{member.department.name}
                  </Badge>
                ) : null}
              </div>
            </div>
          )}

          <section className="space-y-4 rounded-xl border p-4">
            <SectionHeading icon={Building2} title="School assignment" description="Choose the member's role and where they work." />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="team-role">Role</Label>
                <Select value={values.role} onValueChange={(role) => setValues((current) => ({ ...current, role: role as SchoolTeamRole }))}>
                  <SelectTrigger id="team-role"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TEAM_ROLES.map((role) => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Field label="Title" value={values.title} onChange={(value) => setValues((current) => ({ ...current, title: value }))} />
              <div className="space-y-2">
                <Label htmlFor="team-department">Department</Label>
                <Select
                  value={values.department_id ?? "school-wide"}
                  onValueChange={(departmentId) => setValues((current) => ({
                    ...current,
                    department_id: departmentId === "school-wide" ? null : departmentId,
                  }))}
                >
                  <SelectTrigger id="team-department"><SelectValue placeholder="Select a department" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="school-wide">School-wide</SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {departmentsQuery.isError ? <p className="text-xs text-destructive">Departments could not be loaded.</p> : null}
              </div>
              <Field label="Phone" value={values.phone} onChange={(value) => setValues((current) => ({ ...current, phone: value }))} />
            </div>
          </section>

          <section className="space-y-4 rounded-xl border p-4">
            <SectionHeading icon={ShieldCheck} title="Visibility & access" description="Control public visibility and portal permissions." />
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="team-public">Show on public school page</Label>
                <p className="mt-1 text-xs text-muted-foreground">Display this staff profile on the public website.</p>
              </div>
              <Switch id="team-public" checked={values.is_public ?? true} onCheckedChange={(checked) => setValues((current) => ({ ...current, is_public: checked }))} />
            </div>
            {!member ? (
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label htmlFor="invite-user">Invite to School Portal</Label>
                    <p className="mt-1 text-xs text-muted-foreground">Creates access after the member is saved.</p>
                  </div>
                  <Switch
                    id="invite-user"
                    checked={values.invite_user ?? false}
                    onCheckedChange={(checked) => setValues((current) => ({
                      ...current,
                      invite_user: checked,
                      portal_role: checked ? "school_editor" : null,
                    }))}
                  />
                </div>
                {values.invite_user ? (
                  <Select
                    value={values.portal_role ?? "school_editor"}
                    onValueChange={(portalRole) => setValues((current) => ({
                      ...current,
                      portal_role: portalRole as "school_admin" | "school_editor",
                    }))}
                  >
                    <SelectTrigger aria-label="Portal role"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school_editor">School editor</SelectItem>
                      <SelectItem value="school_admin">School admin</SelectItem>
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
            ) : null}
          </section>

          {member && canManage ? (
            <div className="space-y-3 border-t pt-5">
              <div>
                <h3 className="font-medium">Lifecycle actions</h3>
                <p className="mt-1 text-xs text-muted-foreground">Manage assignment status or remove portal access.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setAction("deactivate")}>Deactivate</Button>
                <Button variant="outline" size="sm" onClick={() => setAction("end")}>End assignment</Button>
                <Button variant="destructive" size="sm" onClick={() => setAction("remove")}>Delete</Button>
                {member.portal_role && canManageRoles ? (
                  <>
                    <Button variant="outline" size="sm" onClick={() => schoolPortalApi.team.resendInvite(member.id)}>Resend invite</Button>
                    <Button variant="destructive" size="sm" onClick={() => setAction("revoke")}>Revoke portal access</Button>
                  </>
                ) : null}
              </div>
              {action ? (
                <div className="space-y-3 rounded-lg border border-destructive/30 p-4">
                  <Alert variant="destructive">
                    <AlertTriangle className="size-4" />
                    <AlertDescription>
                      Confirm {action}. Dean and final-admin actions require a replacement or explicit vacancy acknowledgement.
                    </AlertDescription>
                  </Alert>
                  {protectedRole ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="replacement-person">Replacement team member</Label>
                        <Select
                          value={replacementPersonId || "none"}
                          onValueChange={(value) => setReplacementPersonId(value === "none" ? "" : value)}
                        >
                          <SelectTrigger id="replacement-person"><SelectValue placeholder="Select a replacement" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No replacement selected</SelectItem>
                            {replacementCandidates.map((candidate) => (
                              <SelectItem key={candidate.id} value={candidate.person_id}>
                                {candidate.full_name || candidate.email || "Unnamed team member"} · {candidate.role.replaceAll("_", " ")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <Label htmlFor="acknowledge-vacancy">Acknowledge temporary vacancy</Label>
                          <p className="mt-1 text-xs text-muted-foreground">Continue without assigning a replacement.</p>
                        </div>
                        <Switch id="acknowledge-vacancy" checked={acknowledgeVacancy} onCheckedChange={setAcknowledgeVacancy} />
                      </div>
                    </>
                  ) : null}
                  <div className="space-y-2">
                    <Label htmlFor="lifecycle-notes">Notes</Label>
                    <Textarea id="lifecycle-notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
                  </div>
                  <Button
                    variant="destructive"
                    disabled={!lifecycleReady || lifecycleMutation.isPending}
                    onClick={() => lifecycleMutation.mutate()}
                  >
                    Confirm {action}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {!member || canManage ? (
            <Button
              disabled={saveMutation.isPending || (!member && !createReady)}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {member ? "Save changes" : "Add member"}
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="rounded-lg bg-primary/10 p-2 text-primary"><Icon className="size-4" /></span>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value?: string | null;
  onChange: (value: string) => void;
  type?: string;
}) {
  const id = `team-${label.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
