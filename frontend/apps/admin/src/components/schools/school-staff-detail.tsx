"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@ksu/ui/components";
import { schoolPortalApi } from "@ksu/api-client";
import {
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "./shared/school-workspace";
import { Users } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { useSchoolPortal } from "./school-portal-provider";

export function SchoolStaffDetail({ id }: { id: string }) {
  const { can } = useSchoolPortal();
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["school-staff", id],
    queryFn: async () => (await schoolPortalApi.team.get(id)).data,
  });
  const lifecycle = useMutation({
    mutationFn: (action: "activate" | "deactivate" | "end") =>
      schoolPortalApi.team.lifecycle(id, action),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["school-staff", id] }),
  });
  const revoke = useMutation({
    mutationFn: () => schoolPortalApi.team.revokeAccess(id),
    onSuccess: () =>
      void qc.invalidateQueries({ queryKey: ["school-staff", id] }),
  });
  if (query.isPending)
    return (
      <SchoolWorkspace>
        <p>Loading staff record…</p>
      </SchoolWorkspace>
    );
  if (query.error)
    return (
      <SchoolWorkspace>
        <Alert variant="destructive">
          <AlertTitle>Staff record unavailable</AlertTitle>
          <AlertDescription>{query.error.message}</AlertDescription>
        </Alert>
      </SchoolWorkspace>
    );
  const data = query.data;
  return (
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="People & leadership"
        title={data.full_name ?? "Staff detail"}
        description="Manage the authorized staff assignment in the active school scope."
        icon={Users}
        actions={<Button asChild variant="outline"><Link href="/schools/team"><ArrowLeft className="mr-2 size-4" />Back to people</Link></Button>}
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Assignment details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Info label="Role" value={data.role} />
            <Info label="Department" value={data.department?.name} />
            <Info label="Status" value={data.is_active ? "Active" : "Inactive"} />
            <Info label="Access" value={data.portal_role ?? "Scoped assignment"} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Authorized actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {can("school.team.lifecycle") ? <Button
              className="w-full"
              onClick={() => lifecycle.mutate("activate")}
              disabled={lifecycle.isPending}
            >
              Activate assignment
            </Button> : null}
            {can("school.team.lifecycle") ? <Button
              variant="outline"
              className="w-full"
              onClick={() => lifecycle.mutate("deactivate")}
              disabled={lifecycle.isPending}
            >
              Deactivate assignment
            </Button> : null}
            {can("school.team.revoke") ? <Button
              variant="destructive"
              className="w-full"
              onClick={() => revoke.mutate()}
              disabled={revoke.isPending}
            >
              Revoke access
            </Button> : null}
          </CardContent>
        </Card>
      </div>
    </SchoolWorkspace>
  );
}
function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}
