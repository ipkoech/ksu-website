"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Input,
  Switch,
  RichTextEditor,
  richTextToPlainText,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { libraryServiceApi, type LibraryGenericRecord } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

const defaults = {
  person_id: "",
  job_title: "",
  department: "",
  role: "librarian",
  specialization: "",
  bio: "",
  is_public: false,
  is_active: true,
  sort_order: 0,
};

export default function LibraryStaffPage() {
  const queryClient = useQueryClient();
  const formId = useId();
  const { hasScope } = usePermissions();
  const canManageStaff =
    hasScope("library.manage_staff") || hasScope("library:write");
  const [libraryId, setLibraryId] = useState("");
  const [editing, setEditing] = useState<LibraryGenericRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LibraryGenericRecord | null>(
    null,
  );
  const [values, setValues] = useState<Record<string, any>>(defaults);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const branchesQuery = useQuery({
    queryKey: ["library", "branches", "staff"],
    queryFn: () =>
      libraryServiceApi.branches.list({
        active_only: false,
        page: 1,
        per_page: 100,
      }),
  });
  const branches = branchesQuery.data?.data ?? [];

  useEffect(() => {
    if (!libraryId && branches[0]?.id) setLibraryId(branches[0].id);
  }, [branches, libraryId]);

  const staffQuery = useQuery({
    queryKey: ["library", "staff", libraryId],
    queryFn: () =>
      libraryServiceApi.staff.list({
        library_id: libraryId,
        page: 1,
        per_page: 100,
      }),
    enabled: !!libraryId,
  });
  const staff = useMemo(() => staffQuery.data?.data ?? [], [staffQuery.data]);

  const createStaff = useMutation({
    mutationFn: libraryServiceApi.staff.create,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["library", "staff", libraryId],
      }),
  });
  const updateStaff = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Record<string, any>;
    }) => libraryServiceApi.staff.update(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["library", "staff", libraryId],
      }),
  });
  const deleteStaff = useMutation({
    mutationFn: libraryServiceApi.staff.delete,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: ["library", "staff", libraryId],
      }),
  });

  const edit = (member: LibraryGenericRecord) => {
    setEditing(member);
    setValues({
      person_id: member.person_id ?? "",
      job_title: member.job_title ?? "",
      department: member.department ?? "",
      role: member.role ?? "librarian",
      specialization: member.specialization ?? "",
      bio: member.bio ?? "",
      is_public: member.is_public ?? false,
      is_active: member.is_active ?? true,
      sort_order: member.sort_order ?? 0,
    });
  };

  const reset = () => {
    setEditing(null);
    setValues(defaults);
    setFieldErrors({});
  };

  const submit = async () => {
    if (!libraryId) {
      toast.error("Select a library branch first");
      return;
    }
    if (!canManageStaff) {
      toast.error("You do not have permission to manage library staff");
      return;
    }
    const nextErrors: Record<string, string> = {};
    if (!editing && !String(values.person_id || "").trim())
      nextErrors.person_id = "Person ID is required.";
    if (values.sort_order !== "" && !Number.isFinite(Number(values.sort_order)))
      nextErrors.sort_order = "Sort order must be a number.";
    setFieldErrors(nextErrors);
    const firstError = Object.values(nextErrors)[0];
    if (firstError) {
      toast.error(firstError);
      return;
    }

    const editablePayload = {
      job_title: values.job_title || null,
      department: values.department || null,
      role: values.role || "librarian",
      specialization: values.specialization || null,
      bio: richTextToPlainText(values.bio) || null,
      is_public: Boolean(values.is_public),
      is_active: Boolean(values.is_active),
      sort_order: Number(values.sort_order ?? 0),
    };
    const payload = editing
      ? editablePayload
      : {
          ...editablePayload,
          library_id: libraryId,
          person_id: values.person_id,
        };

    try {
      if (editing) {
        await updateStaff.mutateAsync({ id: editing.id, payload });
        toast.success("Library staff member updated");
      } else {
        await createStaff.mutateAsync(payload);
        toast.success("Library staff member created");
      }
      reset();
    } catch {
      toast.error("Failed to save library staff member");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStaff.mutateAsync(deleteTarget.id);
      toast.success("Library staff member deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete library staff member");
    }
  };

  return (
    <div>
      <PageHeader
        title="Library Staff"
        description="Manage branch-scoped staff listings and public librarian profiles."
        backHref="/library"
      />
      <div className="grid gap-6 p-4 sm:p-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Staff</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor={`${formId}-branch`}
                className="text-sm font-medium"
              >
                Library branch
              </label>
              <select
                id={`${formId}-branch`}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={libraryId}
                onChange={(event) => setLibraryId(event.target.value)}
              >
                <option value="">Select branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            {branchesQuery.isError ? (
              <p
                role="status"
                className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
              >
                Failed to load library branches.
              </p>
            ) : staffQuery.isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-lg bg-muted"
                  />
                ))}
              </div>
            ) : staffQuery.isError ? (
              <p
                role="status"
                className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
              >
                Failed to load staff records for this branch.
              </p>
            ) : staff.length === 0 ? (
              <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
                No staff records found for this branch.
              </p>
            ) : (
              <div className="divide-y rounded-lg border">
                {staff.map((member) => (
                  <div
                    key={member.id}
                    className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="break-words font-medium">
                          {member.job_title || member.role || member.person_id}
                        </p>
                        <Badge variant="outline">
                          {member.role || "staff"}
                        </Badge>
                        {typeof member.is_active === "boolean" ? (
                          <Badge
                            variant={member.is_active ? "default" : "secondary"}
                          >
                            {member.is_active ? "Active" : "Inactive"}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="mt-1 break-words text-sm text-muted-foreground">
                        {[
                          member.department,
                          member.specialization,
                          member.person_id,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "No staff metadata"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {canManageStaff ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => edit(member)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive"
                            onClick={() => setDeleteTarget(member)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {editing ? "Edit Staff Member" : "Create Staff Member"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!editing ? (
              <div className="space-y-2">
                <label
                  htmlFor={`${formId}-person_id`}
                  className="text-sm font-medium"
                >
                  Person ID *
                </label>
                <Input
                  id={`${formId}-person_id`}
                  disabled={!canManageStaff}
                  value={values.person_id ?? ""}
                  aria-invalid={Boolean(fieldErrors.person_id)}
                  aria-describedby={
                    fieldErrors.person_id
                      ? `${formId}-person_id-error`
                      : undefined
                  }
                  error={Boolean(fieldErrors.person_id)}
                  onChange={(event) => {
                    setValues((current) => ({
                      ...current,
                      person_id: event.target.value,
                    }));
                    if (fieldErrors.person_id) {
                      setFieldErrors((current) => {
                        const next = { ...current };
                        delete next.person_id;
                        return next;
                      });
                    }
                  }}
                />
                {fieldErrors.person_id ? (
                  <p
                    id={`${formId}-person_id-error`}
                    className="text-sm text-destructive"
                  >
                    {fieldErrors.person_id}
                  </p>
                ) : null}
              </div>
            ) : null}
            {[
              ["job_title", "Job Title"],
              ["department", "Department"],
              ["role", "Role"],
              ["specialization", "Specialization"],
              ["sort_order", "Sort Order"],
            ].map(([name, label]) => (
              <div key={name} className="space-y-2">
                <label
                  htmlFor={`${formId}-${name}`}
                  className="text-sm font-medium"
                >
                  {label}
                </label>
                <Input
                  id={`${formId}-${name}`}
                  disabled={!canManageStaff}
                  type={name === "sort_order" ? "number" : "text"}
                  inputMode={name === "sort_order" ? "numeric" : undefined}
                  value={values[name] ?? ""}
                  aria-invalid={Boolean(fieldErrors[name])}
                  aria-describedby={
                    fieldErrors[name] ? `${formId}-${name}-error` : undefined
                  }
                  error={Boolean(fieldErrors[name])}
                  onChange={(event) => {
                    setValues((current) => ({
                      ...current,
                      [name]: event.target.value,
                    }));
                    if (fieldErrors[name]) {
                      setFieldErrors((current) => {
                        const next = { ...current };
                        delete next[name];
                        return next;
                      });
                    }
                  }}
                />
                {fieldErrors[name] ? (
                  <p
                    id={`${formId}-${name}-error`}
                    className="text-sm text-destructive"
                  >
                    {fieldErrors[name]}
                  </p>
                ) : null}
              </div>
            ))}
            <div className="space-y-2">
              <label id={`${formId}-bio-label`} className="text-sm font-medium">
                Bio
              </label>
              <RichTextEditor
                editorId={`${formId}-bio`}
                ariaLabelledby={`${formId}-bio-label`}
                disabled={!canManageStaff}
                toolbar="simple"
                minHeight="170px"
                value={values.bio ?? ""}
                onChange={(bio) =>
                  setValues((current) => ({ ...current, bio }))
                }
              />
            </div>
            {(["is_public", "is_active"] as const).map((name) => (
              <div
                key={name}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <span id={`${formId}-${name}`} className="text-sm font-medium">
                  {name.replace(/_/g, " ")}
                </span>
                <Switch
                  aria-labelledby={`${formId}-${name}`}
                  disabled={!canManageStaff}
                  checked={Boolean(values[name])}
                  onCheckedChange={(checked) =>
                    setValues((current) => ({ ...current, [name]: checked }))
                  }
                />
              </div>
            ))}
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={submit}
                disabled={
                  !canManageStaff ||
                  createStaff.isPending ||
                  updateStaff.isPending
                }
              >
                {createStaff.isPending || updateStaff.isPending
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create Staff"}
              </Button>
              {editing ? (
                <Button variant="outline" onClick={reset}>
                  Cancel Edit
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete library staff member?"
        description="This will remove the staff member from this library branch."
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        isLoading={deleteStaff.isPending}
      />
    </div>
  );
}
