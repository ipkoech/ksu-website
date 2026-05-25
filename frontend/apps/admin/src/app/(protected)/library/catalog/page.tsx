"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, ConfirmDialog, Input, Switch, RichTextEditor, richTextToPlainText } from "@ksu/ui/components";
import { toast } from "@ksu/ui";
import { libraryServiceApi, type LibraryResource } from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";

const defaults = {
  title: "",
  subtitle: "",
  authors: "",
  publisher: "",
  publication_year: "",
  resource_type: "book",
  status: "available",
  total_copies: 1,
  available_copies: 1,
  description: "",
  is_loanable: true,
  is_reference_only: false,
  is_active: true,
};

export default function LibraryCatalogPage() {
  const queryClient = useQueryClient();
  const { hasScope } = usePermissions();
  const canManageResources = hasScope("library.manage_resources") || hasScope("library:write");
  const [libraryId, setLibraryId] = useState("");
  const [editing, setEditing] = useState<LibraryResource | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LibraryResource | null>(null);
  const [values, setValues] = useState<Record<string, any>>(defaults);

  const branchesQuery = useQuery({
    queryKey: ["library", "branches", "catalog"],
    queryFn: () => libraryServiceApi.branches.list({ active_only: false, page: 1, per_page: 100 }),
  });
  const branches = branchesQuery.data?.data ?? [];

  useEffect(() => {
    if (!libraryId && branches[0]?.id) setLibraryId(branches[0].id);
  }, [branches, libraryId]);

  const resourcesQuery = useQuery({
    queryKey: ["library", "resources", libraryId],
    queryFn: () => libraryServiceApi.resources.list({ library_id: libraryId, page: 1, per_page: 100 }),
    enabled: !!libraryId,
  });
  const resources = useMemo(() => resourcesQuery.data?.data ?? [], [resourcesQuery.data]);

  const createResource = useMutation({
    mutationFn: libraryServiceApi.resources.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["library", "resources", libraryId] }),
  });
  const updateResource = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, any> }) => libraryServiceApi.resources.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["library", "resources", libraryId] }),
  });
  const deleteResource = useMutation({
    mutationFn: libraryServiceApi.resources.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["library", "resources", libraryId] }),
  });

  const edit = (resource: LibraryResource) => {
    setEditing(resource);
    setValues({
      title: resource.title ?? "",
      subtitle: resource.subtitle ?? "",
      authors: resource.authors ?? "",
      publisher: resource.publisher ?? "",
      publication_year: resource.publication_year ?? "",
      resource_type: resource.resource_type ?? "book",
      status: resource.status ?? "available",
      total_copies: resource.total_copies ?? 1,
      available_copies: resource.available_copies ?? 1,
      description: resource.description ?? "",
      is_loanable: resource.is_loanable ?? true,
      is_reference_only: resource.is_reference_only ?? false,
      is_active: resource.is_active ?? true,
    });
  };

  const reset = () => {
    setEditing(null);
    setValues(defaults);
  };

  const submit = async () => {
    if (!libraryId) {
      toast.error("Select a library branch first");
      return;
    }
    if (!canManageResources) {
      toast.error("You do not have permission to manage catalog resources");
      return;
    }
    const payload = {
      library_id: libraryId,
      title: values.title,
      subtitle: values.subtitle || null,
      authors: values.authors || null,
      publisher: values.publisher || null,
      publication_year: values.publication_year === "" ? null : Number(values.publication_year),
      resource_type: values.resource_type || "book",
      status: values.status || "available",
      total_copies: Number(values.total_copies ?? 1),
      available_copies: Number(values.available_copies ?? 1),
      description: richTextToPlainText(values.description) || null,
      is_loanable: Boolean(values.is_loanable),
      is_reference_only: Boolean(values.is_reference_only),
      is_active: Boolean(values.is_active),
    };

    try {
      if (editing) {
        await updateResource.mutateAsync({ id: editing.id, payload });
        toast.success("Catalog resource updated");
      } else {
        await createResource.mutateAsync(payload);
        toast.success("Catalog resource created");
      }
      reset();
    } catch {
      toast.error("Failed to save catalog resource");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteResource.mutateAsync(deleteTarget.id);
      toast.success("Catalog resource deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete catalog resource");
    }
  };

  return (
    <div>
      <PageHeader title="Library Catalog" description="Manage branch-scoped library resources." backHref="/library" />
      <div className="grid gap-6 p-6 xl:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={libraryId}
              onChange={(event) => setLibraryId(event.target.value)}
            >
              <option value="">Select branch</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>

            {resourcesQuery.isLoading ? (
              <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div>
            ) : resources.length === 0 ? (
              <p className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">No catalog resources found for this branch.</p>
            ) : (
              <div className="divide-y rounded-lg border">
                {resources.map((resource) => (
                  <div key={resource.id} className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{resource.title}</p>
                        <Badge variant="outline">{resource.resource_type}</Badge>
                        <Badge variant={resource.status === "available" ? "default" : "secondary"}>{resource.status}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{[resource.authors, resource.publisher, resource.publication_year].filter(Boolean).join(" · ") || "No bibliographic metadata"}</p>
                    </div>
                    <div className="flex gap-2">
                      {canManageResources ? (
                        <>
                          <Button variant="outline" size="sm" onClick={() => edit(resource)}><Edit className="mr-2 h-4 w-4" />Edit</Button>
                          <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDeleteTarget(resource)}><Trash2 className="mr-2 h-4 w-4" />Delete</Button>
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
          <CardHeader><CardTitle>{editing ? "Edit Resource" : "Create Resource"}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              ["title", "Title"],
              ["subtitle", "Subtitle"],
              ["authors", "Authors"],
              ["publisher", "Publisher"],
              ["publication_year", "Publication Year"],
              ["resource_type", "Resource Type"],
              ["status", "Status"],
              ["total_copies", "Total Copies"],
              ["available_copies", "Available Copies"],
            ].map(([name, label]) => (
              <div key={name} className="space-y-2">
                <label className="text-sm font-medium">{label}</label>
                <Input
                  disabled={!canManageResources}
                  type={name.includes("copies") || name === "publication_year" ? "number" : "text"}
                  value={values[name] ?? ""}
                  onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <RichTextEditor disabled={!canManageResources} toolbar="simple" minHeight="170px" value={values.description ?? ""} onChange={(description) => setValues((current) => ({ ...current, description }))} />
            </div>
            {(["is_loanable", "is_reference_only", "is_active"] as const).map((name) => (
              <div key={name} className="flex items-center justify-between rounded-lg border p-3">
                <span className="text-sm font-medium">{name.replace(/_/g, " ")}</span>
                <Switch disabled={!canManageResources} checked={Boolean(values[name])} onCheckedChange={(checked) => setValues((current) => ({ ...current, [name]: checked }))} />
              </div>
            ))}
            <div className="flex gap-2">
              <Button onClick={submit} disabled={!canManageResources || createResource.isPending || updateResource.isPending}>{createResource.isPending || updateResource.isPending ? "Saving..." : editing ? "Save Changes" : "Create Resource"}</Button>
              {editing ? <Button variant="outline" onClick={reset}>Cancel Edit</Button> : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete catalog resource?"
        description={`This will delete "${deleteTarget?.title ?? "this resource"}".`}
        variant="destructive"
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        isLoading={deleteResource.isPending}
      />
    </div>
  );
}
