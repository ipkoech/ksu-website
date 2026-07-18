"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolTeamRole,
} from "@ksu/api-client";
import { Download, Plus, Search, ShieldCheck, Upload, UserCheck, UserRound, UsersRound } from "lucide-react";
import {
  Alert,
  AlertDescription,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@ksu/ui/components";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import {
  SchoolFilterBar,
  SchoolMetricGrid,
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "@/components/schools/shared/school-workspace";
import { TeamImportDialog } from "./team-import-dialog";
import { TeamMemberSheet } from "./team-member-sheet";

const GROUPS: Array<{
  label: string;
  roles: SchoolTeamRole[];
}> = [
  { label: "Leadership", roles: ["dean", "deputy_dean"] },
  { label: "CODs & Coordinators", roles: ["cod", "hod", "coordinator"] },
  { label: "Administrative Staff", roles: ["school_administrator", "administrative_staff"] },
  { label: "Lecturers", roles: ["lecturer"] },
  { label: "Support Staff", roles: ["technician", "support_staff"] },
];

export function SchoolTeamPage() {
  const { school, can } = useSchoolPortal();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") ?? "";
  const status = searchParams.get("status") ?? "active";
  const focusedId = searchParams.get("member");
  const createRequested = searchParams.get("action") === "create";
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const teamQuery = useQuery({
    queryKey: [...schoolPortalQueryKeys.team(school.id), { search, status }],
    queryFn: () =>
      schoolPortalApi.team.list({
        page: 1,
        per_page: 100,
        search: search || undefined,
        status: status === "all" ? undefined : status,
      }),
  });
  const members = useMemo(() => teamQuery.data?.data ?? [], [teamQuery.data?.data]);
  const focused = members.find((member) => member.id === focusedId) ?? null;
  const grouped = useMemo(
    () =>
      GROUPS.map((group) => ({
        ...group,
        members: members.filter((member) => group.roles.includes(member.role)),
      })),
    [members],
  );
  const updateUrl = (key: string, value?: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="People & access"
        title="School team"
        description="Organise leadership, academic and support staff, and control who can work in this portal."
        schoolName={school.name}
        icon={UsersRound}
        actions={<>
          {can("school.team.bulk") ? (
            <>
              <Button asChild variant="outline"><a href={schoolPortalApi.team.templateUrl()} download><Download className="mr-2 size-4" /> Template</a></Button>
              <Button variant="outline" onClick={() => setImportOpen(true)}><Upload className="mr-2 size-4" /> Import</Button>
            </>
          ) : null}
          {can("school.team.manage") ? <Button onClick={() => setCreateOpen(true)}><Plus className="mr-2 size-4" /> Add member</Button> : null}
        </>}
      />
      <SchoolMetricGrid items={[
        { label: "Team assignments", value: teamQuery.data?.meta.total ?? members.length, detail: "Across all school roles", icon: UsersRound },
        { label: "Leadership", value: members.filter((item) => ["dean", "deputy_dean", "cod", "hod"].includes(item.role)).length, detail: "Dean, deputies and heads", icon: ShieldCheck, tone: "info" },
        { label: "Portal access", value: members.filter((item) => item.portal_role).length, detail: "Admins and editors", icon: UserCheck, tone: "success" },
        { label: "Public profiles", value: members.filter((item) => item.is_public).length, detail: "Visible on the website", icon: UserRound, tone: "warning" },
      ]} />
      <SchoolFilterBar>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="relative">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            aria-label="Search school team"
            className="pl-9"
            defaultValue={search}
            placeholder="Search name, email, employee number"
            onKeyDown={(event) => {
              if (event.key === "Enter") updateUrl("search", event.currentTarget.value.trim());
            }}
          />
        </label>
        <Select value={status} onValueChange={(value) => updateUrl("status", value)}>
          <SelectTrigger aria-label="Assignment status"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem><SelectItem value="ended">Ended</SelectItem><SelectItem value="all">All</SelectItem></SelectContent>
        </Select>
      </div>
      </SchoolFilterBar>

      {teamQuery.error ? <Alert variant="destructive"><AlertDescription>{teamQuery.error.message}</AlertDescription></Alert> : null}
      {teamQuery.isPending ? (
        <div className="grid gap-4 lg:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-48" />)}</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {grouped.map((group) => (
            <Card key={group.label}>
              <CardHeader className="pb-3"><CardTitle className="text-base">{group.label} <Badge variant="secondary" className="ml-2">{group.members.length}</Badge></CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {group.members.length === 0 ? <p className="text-sm text-muted-foreground">No matching team members.</p> : group.members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    className="flex w-full cursor-pointer items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => updateUrl("member", member.id)}
                  >
                    <span className="rounded-full bg-primary/10 p-2 text-primary"><UserRound className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{member.full_name || member.email}</span>
                      <span className="block truncate text-xs text-muted-foreground">{member.title || member.role.replaceAll("_", " ")}</span>
                    </span>
                    {member.portal_role ? <Badge variant="outline">{member.portal_role.replaceAll("_", " ")}</Badge> : null}
                  </button>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <TeamMemberSheet
        member={focused}
        open={Boolean(focusedId) || createOpen || createRequested}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            updateUrl(createRequested ? "action" : "member");
          }
        }}
      />
      <TeamImportDialog open={importOpen} onOpenChange={setImportOpen} onComplete={async () => { await teamQuery.refetch(); }} />
    </SchoolWorkspace>
  );
}
