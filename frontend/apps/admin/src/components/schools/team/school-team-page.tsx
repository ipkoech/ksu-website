"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  schoolPortalApi,
  schoolPortalQueryKeys,
  type SchoolTeamRole,
} from "@ksu/api-client";
import {
  ArrowRight,
  BriefcaseBusiness,
  Crown,
  Download,
  GraduationCap,
  Headphones,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  UserCheck,
  UserCog,
  UserRound,
  UsersRound,
} from "lucide-react";
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
  SchoolWorkspace,
} from "@/components/schools/shared/school-workspace";
import { TeamImportDialog } from "./team-import-dialog";
import { TeamMemberSheet } from "./team-member-sheet";

const GROUPS: Array<{
  label: string;
  description: string;
  roles: SchoolTeamRole[];
  icon: typeof Crown;
  tone: string;
}> = [
  {
    label: "Leadership",
    description: "Dean and deputy dean",
    roles: ["dean", "deputy_dean"],
    icon: Crown,
    tone: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  {
    label: "Department Leadership",
    description: "Department and programme leadership",
    roles: ["cod", "hod", "coordinator"],
    icon: UserCog,
    tone: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  {
    label: "Administrative Staff",
    description: "School operations and portal administration",
    roles: ["school_administrator", "administrative_staff"],
    icon: BriefcaseBusiness,
    tone: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  {
    label: "Lecturers",
    description: "Academic and teaching staff",
    roles: ["lecturer"],
    icon: GraduationCap,
    tone: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  {
    label: "Support Staff",
    description: "Technical and operational support",
    roles: ["technician", "support_staff"],
    icon: Headphones,
    tone: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  },
];

const METRIC_TONES = {
  primary: "bg-primary/10 text-primary",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
};

const ROLE_LABELS: Record<SchoolTeamRole, string> = {
  dean: "Dean",
  deputy_dean: "Deputy Dean",
  cod: "Chair of Department",
  hod: "Head of Department",
  coordinator: "Coordinator",
  school_administrator: "School Administrator",
  administrative_staff: "Administrative Staff",
  lecturer: "Lecturer",
  technician: "Technician",
  support_staff: "Support Staff",
};

function publicRoleLabel(member: { role: SchoolTeamRole; title?: string | null }) {
  return ROLE_LABELS[member.role];
}

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
      <header className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">People & access</p>
            <Badge variant="outline" className="max-w-full font-normal">
              <span className="mr-1.5 size-1.5 rounded-full bg-emerald-500" />
              <span className="truncate">{school.name}</span>
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">School Leadership &amp; Staff</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">
            Keep school leadership, staff assignments, public profiles and portal access organised in one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {can("school.team.bulk") ? (
            <>
              <Button asChild variant="outline">
                <a href={schoolPortalApi.team.templateUrl()} download>
                  <Download className="mr-2 size-4" /> Template
                </a>
              </Button>
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <Upload className="mr-2 size-4" /> Import
              </Button>
            </>
          ) : null}
          {can("school.team.manage") ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 size-4" /> Add member
            </Button>
          ) : null}
        </div>
      </header>

      <section aria-label="Team summary" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <TeamMetric
          label="Team assignments"
          value={teamQuery.data?.meta.total ?? members.length}
          detail="Across all school roles"
          icon={UsersRound}
          tone="primary"
        />
        <TeamMetric
          label="Leadership"
          value={members.filter((item) => ["dean", "deputy_dean", "cod", "hod"].includes(item.role)).length}
          detail="Dean, deputies and heads"
          icon={ShieldCheck}
          tone="info"
        />
        <TeamMetric
          label="Portal access"
          value={members.filter((item) => item.portal_role).length}
          detail="Admins and editors"
          icon={UserCheck}
          tone="success"
        />
        <TeamMetric
          label="Public profiles"
          value={members.filter((item) => item.is_public).length}
          detail="Visible on the website"
          icon={UserRound}
          tone="warning"
        />
      </section>

      <SchoolFilterBar>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <label className="relative">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              aria-label="Search school team"
              className="pl-9"
              defaultValue={search}
              placeholder="Search name, email or employee number"
              onKeyDown={(event) => {
                if (event.key === "Enter") updateUrl("search", event.currentTarget.value.trim());
              }}
            />
          </label>
          <Select value={status} onValueChange={(value) => updateUrl("status", value)}>
            <SelectTrigger aria-label="Assignment status"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
              <SelectItem value="all">All assignments</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </SchoolFilterBar>

      {teamQuery.error ? (
        <Alert variant="destructive"><AlertDescription>{teamQuery.error.message}</AlertDescription></Alert>
      ) : null}
      {teamQuery.isPending ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-48" />)}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {grouped.map((group) => {
            const Icon = group.icon;
            return (
              <Card key={group.label} className="overflow-hidden shadow-sm">
                <CardHeader className="border-b bg-muted/20 p-4">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-xl p-2.5 ${group.tone}`}><Icon className="size-5" /></span>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base">{group.label}</CardTitle>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{group.description}</p>
                    </div>
                    <Badge variant="secondary">{group.members.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5 p-2">
                  {group.members.length === 0 ? (
                    <div className="rounded-lg border border-dashed px-4 py-6 text-center">
                      <p className="text-sm font-medium">No matching team members</p>
                      <p className="mt-1 text-xs text-muted-foreground">Change the filters or add a new assignment.</p>
                    </div>
                  ) : group.members.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent p-3 text-left transition-colors duration-200 hover:border-border hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      onClick={() => updateUrl("member", member.id)}
                    >
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${group.tone}`}>
                        {initials(member.full_name || member.email || "Team member")}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{member.full_name || member.email}</span>
                        <span className="mt-0.5 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
                          <span className="truncate">{publicRoleLabel(member)}</span>
                          {member.department?.name ? (
                            <>
                              <span aria-hidden>·</span>
                              <span className="truncate">{member.department.name}</span>
                            </>
                          ) : null}
                        </span>
                        {member.email ? (
                          <span className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                            <Mail className="size-3 shrink-0" /> {member.email}
                          </span>
                        ) : null}
                      </span>
                      <span className="hidden shrink-0 items-center gap-2 sm:flex">
                        {member.portal_role ? <Badge variant="outline">{member.portal_role.replaceAll("_", " ")}</Badge> : null}
                        {member.is_public ? <Badge variant="secondary">Public</Badge> : null}
                      </span>
                      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
                    </button>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <TeamMemberSheet
        member={focused}
        members={members}
        open={Boolean(focusedId) || createOpen || createRequested}
        onOpenChange={(open) => {
          if (!open) {
            setCreateOpen(false);
            updateUrl(createRequested ? "action" : "member");
          }
        }}
      />
      <TeamImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onComplete={async () => { await teamQuery.refetch(); }}
      />
    </SchoolWorkspace>
  );
}

function TeamMetric({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof UsersRound;
  tone: keyof typeof METRIC_TONES;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex items-center gap-3 p-3 sm:p-4">
        <span className={`rounded-xl p-2.5 ${METRIC_TONES[tone]}`}><Icon className="size-5" /></span>
        <span className="min-w-0">
          <span className="block text-xl font-semibold tracking-tight sm:text-2xl">{value}</span>
          <span className="block truncate text-xs font-medium sm:text-sm">{label}</span>
          <span className="hidden truncate text-xs text-muted-foreground sm:block">{detail}</span>
        </span>
      </CardContent>
    </Card>
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
