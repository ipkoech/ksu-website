"use client";

import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolTeamMember,
  type SchoolTeamMemberCreate,
  type SchoolTeamRole,
} from "@ksu/api-client";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
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
  open,
  onOpenChange,
}: {
  member: SchoolTeamMember | null;
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{member ? "Team member details" : "Add team member"}</SheetTitle>
          <SheetDescription>
            {member ? "Update the school assignment and access lifecycle." : "Add an existing person or create a new staff identity."}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-5 py-6">
          {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
          {!member ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" value={values.first_name} onChange={(value) => setValues((current) => ({ ...current, first_name: value }))} />
              <Field label="Last name" value={values.last_name} onChange={(value) => setValues((current) => ({ ...current, last_name: value }))} />
              <Field label="Email" type="email" value={values.email} onChange={(value) => setValues((current) => ({ ...current, email: value }))} />
              <Field label="Employee number" value={values.employee_number} onChange={(value) => setValues((current) => ({ ...current, employee_number: value }))} />
            </div>
          ) : (
            <div className="rounded-lg border p-4">
              <p className="font-medium">{member.full_name || member.email}</p>
              <p className="text-sm text-muted-foreground">{member.email}</p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={values.role} onValueChange={(role) => setValues((current) => ({ ...current, role: role as SchoolTeamRole }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TEAM_ROLES.map((role) => <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Field label="Title" value={values.title} onChange={(value) => setValues((current) => ({ ...current, title: value }))} />
            <Field label="Department ID" value={values.department_id} onChange={(value) => setValues((current) => ({ ...current, department_id: value || null }))} />
            <Field label="Phone" value={values.phone} onChange={(value) => setValues((current) => ({ ...current, phone: value }))} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <Label htmlFor="team-public">Show on public school page</Label>
            <Switch id="team-public" checked={values.is_public ?? true} onCheckedChange={(checked) => setValues((current) => ({ ...current, is_public: checked }))} />
          </div>
          {!member ? (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div><Label htmlFor="invite-user">Invite to School Portal</Label><p className="text-xs text-muted-foreground">Creates access after the member is saved.</p></div>
                <Switch id="invite-user" checked={values.invite_user ?? false} onCheckedChange={(checked) => setValues((current) => ({ ...current, invite_user: checked, portal_role: checked ? "school_editor" : null }))} />
              </div>
              {values.invite_user ? (
                <Select value={values.portal_role ?? "school_editor"} onValueChange={(portalRole) => setValues((current) => ({ ...current, portal_role: portalRole as "school_admin" | "school_editor" }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="school_editor">School editor</SelectItem><SelectItem value="school_admin">School admin</SelectItem></SelectContent>
                </Select>
              ) : null}
            </div>
          ) : null}

          {member && canManage ? (
            <div className="space-y-3 border-t pt-5">
              <h3 className="font-medium">Lifecycle actions</h3>
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
                      <Field label="Replacement person ID" value={replacementPersonId} onChange={setReplacementPersonId} />
                      <div className="flex items-center justify-between">
                        <Label htmlFor="acknowledge-vacancy">Acknowledge temporary vacancy</Label>
                        <Switch id="acknowledge-vacancy" checked={acknowledgeVacancy} onCheckedChange={setAcknowledgeVacancy} />
                      </div>
                    </>
                  ) : null}
                  <div className="space-y-2">
                    <Label htmlFor="lifecycle-notes">Notes</Label>
                    <Textarea id="lifecycle-notes" value={notes} onChange={(event) => setNotes(event.target.value)} />
                  </div>
                  <Button variant="destructive" disabled={!lifecycleReady || lifecycleMutation.isPending} onClick={() => lifecycleMutation.mutate()}>
                    Confirm {action}
                  </Button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          {(!member || canManage) ? <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate()}>
            {saveMutation.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {member ? "Save changes" : "Add member"}
          </Button> : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
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
