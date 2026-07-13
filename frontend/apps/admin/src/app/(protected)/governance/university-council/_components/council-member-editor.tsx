"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, CheckCircle2, EyeOff, Pencil, Send, UploadCloud } from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from "@ksu/ui/components";
import { MediaPicker } from "@/components/media";
import { PersonPicker } from "@/components/relationships";
import { governanceAdminApi, type CouncilMember, type GovernanceRole } from "@/lib/api/organization";

type MemberForm = Partial<CouncilMember> & {
  photo_id?: string | null;
  publish_without_portrait_override?: boolean;
  publication_notes?: string | null;
};

const defaultForm: MemberForm = {
  person_id: "",
  governance_role_id: "",
  public_role_label: "",
  appointment_category: "",
  official_designation: "",
  represented_institution: "",
  current_office: "",
  appointing_authority: "",
  appointment_reference: "",
  profile_slug: "",
  profile_summary: "",
  start_date: "",
  end_date: "",
  term_number: null,
  is_acting: false,
  is_ex_officio: false,
  is_voting_member: true,
  show_contact_publicly: false,
  publish_without_portrait_override: false,
  photo_id: "",
  publication_notes: "",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  published: "Published",
  unpublished: "Unpublished",
  archived: "Archived",
};

function memberName(member: CouncilMember) {
  return member.person?.display_name ?? member.person?.full_name ?? "Unnamed council member";
}

function roleLabel(member: CouncilMember) {
  return member.public_role_label || member.governance_role?.public_label || member.role || "Council member";
}

function compactPayload(values: MemberForm): Partial<CouncilMember> {
  return {
    person_id: values.person_id,
    governance_role_id: values.governance_role_id || null,
    public_role_label: values.public_role_label || "",
    appointment_category: values.appointment_category || null,
    official_designation: values.official_designation || null,
    represented_institution: values.represented_institution || null,
    current_office: values.current_office || null,
    appointing_authority: values.appointing_authority || null,
    appointment_reference: values.appointment_reference || null,
    profile_slug: values.profile_slug || null,
    profile_summary: values.profile_summary || null,
    start_date: values.start_date || null,
    end_date: values.end_date || null,
    term_number: values.term_number ? Number(values.term_number) : null,
    is_acting: Boolean(values.is_acting),
    is_ex_officio: Boolean(values.is_ex_officio),
    is_voting_member: Boolean(values.is_voting_member),
    show_contact_publicly: Boolean(values.show_contact_publicly),
    publish_without_portrait_override: Boolean(values.publish_without_portrait_override),
    publication_notes: values.publication_notes || null,
  };
}

function workflowActions(status: string) {
  if (status === "draft") return ["submit-review", "archive"];
  if (status === "submitted") return ["approve", "archive"];
  if (status === "approved") return ["publish", "archive"];
  if (status === "published") return ["unpublish", "archive"];
  if (status === "unpublished") return ["publish", "archive"];
  return [];
}

const workflowIcons: Record<string, typeof Send> = {
  "submit-review": Send,
  approve: CheckCircle2,
  publish: UploadCloud,
  unpublish: EyeOff,
  archive: Archive,
};

const workflowLabels: Record<string, string> = {
  "submit-review": "Submit for review",
  approve: "Approve",
  publish: "Publish",
  unpublish: "Unpublish",
  archive: "Archive",
};

export function CouncilMemberEditor({ archivedOnly = false }: { archivedOnly?: boolean }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<CouncilMember | null>(null);
  const [values, setValues] = useState<MemberForm>(defaultForm);
  const [error, setError] = useState("");

  const membersQuery = useQuery({
    queryKey: ["governance", "university-council", "members"],
    queryFn: () => governanceAdminApi.listCouncilMembers({ page: 1, per_page: 100 }),
  });
  const rolesQuery = useQuery({
    queryKey: ["governance", "roles"],
    queryFn: () => governanceAdminApi.listRoles(),
  });

  const roles = (rolesQuery.data?.data ?? []) as GovernanceRole[];
  const members = useMemo(() => {
    const list = (membersQuery.data?.data ?? []) as CouncilMember[];
    return archivedOnly
      ? list.filter((member) => member.workflow_status === "archived" || member.appointment_status === "inactive")
      : list.filter((member) => member.workflow_status !== "archived");
  }, [archivedOnly, membersQuery.data?.data]);

  useEffect(() => {
    if (!editing) return;
    setValues({
      ...defaultForm,
      ...editing,
      governance_role_id: editing.governance_role_id ?? "",
      photo_id: "",
      term_number: editing.term_number ?? null,
      publish_without_portrait_override: editing.publish_without_portrait_override ?? false,
    });
  }, [editing]);

  const invalidateCouncil = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["governance", "university-council"] }),
      queryClient.invalidateQueries({ queryKey: ["governance", "roles"] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: (payload: Partial<CouncilMember>) =>
      editing ? governanceAdminApi.updateCouncilMember(editing.id, payload) : governanceAdminApi.createCouncilMember(payload),
    onSuccess: async () => {
      toast.success(editing ? "Council member updated" : "Council member created");
      setEditing(null);
      setValues(defaultForm);
      setError("");
      await invalidateCouncil();
    },
    onError: () => setError("Save failed. Check the required fields and try again."),
  });

  const transitionMutation = useMutation({
    mutationFn: ({ member, action }: { member: CouncilMember; action: string }) =>
      governanceAdminApi.transitionCouncilMember(member.id, action, {
        comment: values.publication_notes || `Council member ${action}`,
      }),
    onSuccess: async () => {
      toast.success("Workflow status updated");
      await invalidateCouncil();
    },
    onError: () => toast.error("Workflow action failed"),
  });

  const setField = <K extends keyof MemberForm>(key: K, value: MemberForm[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const selectRole = (roleId: string) => {
    const role = roles.find((item) => item.id === roleId);
    setValues((current) => ({
      ...current,
      governance_role_id: roleId,
      public_role_label: current.public_role_label || role?.public_label || "",
      appointment_category: current.appointment_category || role?.category || "",
    }));
  };

  const save = () => {
    if (!values.person_id) {
      setError("Select a person before saving this Council appointment.");
      return;
    }
    if (!values.public_role_label) {
      setError("Public role label is required for public cards and profile pages.");
      return;
    }
    saveMutation.mutate(compactPayload(values));
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader>
          <CardTitle>{editing ? "Edit Council Member" : archivedOnly ? "Archived Council Members" : "Add Council Member"}</CardTitle>
          <CardDescription>
            Use readable relationship controls for the person, portrait, appointment details, and publication workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {archivedOnly ? (
            <p className="rounded-md border bg-muted/20 p-3 text-sm text-muted-foreground">
              Archived records are shown on the right for review. Select a member to inspect or restore through available workflow actions.
            </p>
          ) : null}

          {!archivedOnly ? (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Person</label>
                  <PersonPicker
                    value={values.person_id ?? ""}
                    onChange={(value) => setField("person_id", value)}
                    filters={{ status: "active" }}
                    placeholder="Search and select a person"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Governance role</label>
                  <Select value={values.governance_role_id || undefined} onValueChange={selectRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a configured role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.public_label || role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <TextField label="Public role label" value={values.public_role_label} onChange={(value) => setField("public_role_label", value)} />
                <TextField label="Appointment category" value={values.appointment_category} onChange={(value) => setField("appointment_category", value)} />
                <TextField label="Represented institution" value={values.represented_institution} onChange={(value) => setField("represented_institution", value)} />
                <TextField label="Official designation" value={values.official_designation} onChange={(value) => setField("official_designation", value)} />
                <TextField label="Current office" value={values.current_office} onChange={(value) => setField("current_office", value)} />
                <TextField label="Appointing authority" value={values.appointing_authority} onChange={(value) => setField("appointing_authority", value)} />
                <TextField label="Appointment reference" value={values.appointment_reference} onChange={(value) => setField("appointment_reference", value)} />
                <TextField label="Profile slug" value={values.profile_slug} onChange={(value) => setField("profile_slug", value)} />
                <TextField
                  label="Term number"
                  type="number"
                  value={values.term_number?.toString() ?? ""}
                  onChange={(value) => setField("term_number", value ? Number(value) : null)}
                />
                <TextField label="Start date" type="date" value={values.start_date} onChange={(value) => setField("start_date", value)} />
                <TextField label="End date" type="date" value={values.end_date} onChange={(value) => setField("end_date", value)} />
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profile summary</label>
                  <Textarea
                    rows={6}
                    value={values.profile_summary ?? ""}
                    onChange={(event) => setField("profile_summary", event.target.value)}
                    placeholder="Short public biography and Council contribution"
                  />
                </div>
                <MediaPicker
                  value={values.photo_id ?? ""}
                  onChange={(value) => setField("photo_id", value)}
                  mediaType="image"
                  accept="image/*"
                  label="Portrait"
                  helperText="Attach or upload a portrait for media readiness. Public cards use the selected person's approved photo until the Council API exposes a dedicated portrait field."
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                <ToggleField label="Acting appointment" checked={Boolean(values.is_acting)} onChange={(value) => setField("is_acting", value)} />
                <ToggleField label="Ex-officio member" checked={Boolean(values.is_ex_officio)} onChange={(value) => setField("is_ex_officio", value)} />
                <ToggleField label="Voting member" checked={Boolean(values.is_voting_member)} onChange={(value) => setField("is_voting_member", value)} />
                <ToggleField label="Show contact publicly" checked={Boolean(values.show_contact_publicly)} onChange={(value) => setField("show_contact_publicly", value)} />
                <ToggleField
                  label="Publish without approved portrait"
                  checked={Boolean(values.publish_without_portrait_override)}
                  onChange={(value) => setField("publish_without_portrait_override", value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Publication notes</label>
                <Textarea
                  rows={3}
                  value={values.publication_notes ?? ""}
                  onChange={(event) => setField("publication_notes", event.target.value)}
                  placeholder="Optional context for reviewers and publishers"
                />
              </div>

              {error ? <p className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p> : null}

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={save} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : editing ? "Save Changes" : "Create Member"}
                </Button>
                {editing ? (
                  <Button type="button" variant="outline" onClick={() => { setEditing(null); setValues(defaultForm); }}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>

      <aside className="space-y-3">
        <Card>
          <CardHeader>
            <CardTitle>Public card preview</CardTitle>
            <CardDescription>Review the readable name and role that visitors will see.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border p-4">
              <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {(editing ? memberName(editing) : "New").slice(0, 1)}
              </div>
              <h3 className="mt-4 font-semibold">{editing ? memberName(editing) : "Selected person"}</h3>
              <p className="text-sm text-muted-foreground">{values.public_role_label || "Public role label"}</p>
              {values.represented_institution ? <p className="mt-2 text-xs text-muted-foreground">{values.represented_institution}</p> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{archivedOnly ? "Archived records" : "Current members"}</CardTitle>
            <CardDescription>{membersQuery.isLoading ? "Loading members..." : `${members.length} records`}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {members.map((member) => (
              <div key={member.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{memberName(member)}</p>
                    <p className="text-sm text-muted-foreground">{roleLabel(member)}</p>
                    {member.represented_institution ? <p className="mt-1 text-xs text-muted-foreground">{member.represented_institution}</p> : null}
                  </div>
                  <Badge variant={member.workflow_status === "published" ? "default" : "outline"}>
                    {statusLabels[member.workflow_status] ?? member.workflow_status}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setEditing(member)}>
                    <Pencil className="size-4" />
                    Edit
                  </Button>
                  {workflowActions(member.workflow_status).map((action) => {
                    const Icon = workflowIcons[action] ?? Send;
                    return (
                      <Button
                        key={action}
                        type="button"
                        variant={action === "archive" ? "ghost" : "outline"}
                        size="sm"
                        disabled={transitionMutation.isPending}
                        onClick={() => transitionMutation.mutate({ member, action })}
                      >
                        <Icon className="size-4" />
                        {workflowLabels[action] ?? action}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
            {!members.length && !membersQuery.isLoading ? (
              <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No Council members found for this view.</p>
            ) : null}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function TextField({
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
  return (
    <label className="space-y-2 text-sm font-medium">
      <span>{label}</span>
      <Input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ToggleField({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
