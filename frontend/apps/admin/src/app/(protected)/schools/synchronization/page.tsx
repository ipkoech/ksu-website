"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  RefreshCw,
  Database,
  Users,
  BookOpen,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from "@ksu/ui/components";
import { schoolPortalApi } from "@ksu/api-client";
import { useSchoolPortal } from "@/components/schools/school-portal-provider";
import {
  SchoolWorkspace,
  SchoolWorkspaceHeader,
} from "@/components/schools/shared/school-workspace";

type Metric = { label: string; key: string };
const programmeMetrics: Metric[] = [
  { label: "Fetched from external API", key: "fetched" },
  { label: "Created locally", key: "created" },
  { label: "Updated locally", key: "updated" },
  { label: "Skipped", key: "skipped" },
  { label: "Unmatched departments", key: "unmatched_departments" },
  { label: "Errors", key: "errors" },
];
const lecturerMetrics: Metric[] = [
  { label: "Fetched from external API", key: "fetched" },
  { label: "Matched locally", key: "locally_matched" },
  { label: "Created locally", key: "created" },
  { label: "Updated locally", key: "updated" },
  { label: "Unassigned locally", key: "unassigned" },
  { label: "Errors", key: "errors" },
];

function valueOf(data: Record<string, any> | undefined, key: string) {
  const aliases: Record<string, string[]> = {
    unmatched_departments: ["unmatched_departments", "unmatched_department_count"],
    locally_matched: ["locally_matched", "workflow.matched"],
    unassigned: ["unassigned", "unmatched_departments"],
  };
  const value = (aliases[key] ?? [key]).reduce<any>((found, candidate) => {
    if (found !== undefined) return found;
    if (candidate.startsWith("workflow.")) return data?.workflow?.[candidate.slice(9)];
    return data?.[candidate];
  }, undefined);
  return Array.isArray(value)
    ? value.length
    : typeof value === "number"
      ? value
      : "—";
}

export default function AcademicSynchronizationPage() {
  const { school, capabilities } = useSchoolPortal();
  const canPreviewProgrammes = capabilities["school.integrations.programmes.preview"] === true;
  const canPreviewLecturers = capabilities["school.integrations.lecturers.preview"] === true;
  const canExportReports = capabilities["school.reports.export"] === true;
  const [department, setDepartment] = useState("all");
  const programmes = useQuery({
    queryKey: ["school-sync", school.id, "programmes"],
    queryFn: async () =>
      (await schoolPortalApi.integrations.preview("programmes")).data,
    enabled: canPreviewProgrammes,
  });
  const lecturers = useQuery({
    queryKey: ["school-sync", school.id, "lecturers"],
    queryFn: async () =>
      (await schoolPortalApi.integrations.preview("lecturers")).data,
    enabled: canPreviewLecturers,
  });
  const loading = programmes.isPending || lecturers.isPending;
  const error = programmes.error || lecturers.error;
  const refresh = () => {
    void programmes.refetch();
    void lecturers.refetch();
  };
  const rows = useMemo(
    () => {
      const lecturerDepartments = Array.isArray(lecturers.data?.departments)
        ? lecturers.data.departments
        : [];
      return department === "all"
        ? lecturerDepartments
        : lecturerDepartments.filter(
            (row: any) =>
              String(row.department_id ?? row.external_department_id) ===
              department,
          );
    },
    [department, lecturers.data?.departments],
  );
  if (!canPreviewProgrammes && !canPreviewLecturers) {
    return (
      <SchoolWorkspace>
        <SchoolWorkspaceHeader
          eyebrow="School integrations"
          title="Academic synchronization"
          description="Synchronization statistics are available only to authorized school integration reviewers."
          icon={Database}
        />
        <Alert>
          <AlertCircle className="size-4" />
          <AlertTitle>Access restricted</AlertTitle>
          <AlertDescription>
            Your current workspace scope does not include permission to view programme or lecturer synchronization results.
          </AlertDescription>
        </Alert>
      </SchoolWorkspace>
    );
  }
  return (
    <SchoolWorkspace>
      <SchoolWorkspaceHeader
        eyebrow="School integrations"
        title="Academic synchronization"
        description={`Statistics for programme and lecturer data received from external systems and applied to ${school.name}.`}
        icon={Database}
        actions={
          <div className="flex flex-wrap gap-2">
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-52" aria-label="Filter department">
                <SelectValue placeholder="All departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All departments</SelectItem>
                {school.departments.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={refresh} disabled={loading}>
              <RefreshCw
                className={loading ? "mr-2 size-4 animate-spin" : "mr-2 size-4"}
              />
              Refresh statistics
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.assign(schoolPortalApi.reportExportUrl("30d", "csv"))}
              disabled={loading || !canExportReports}
              aria-label={canExportReports ? "Export synchronization report as CSV" : "Report export is not authorized"}
            >
              Export report
            </Button>
          </div>
        }
      />
      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Synchronization statistics unavailable</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-3">
            <span>Retry to load the latest integration results.</span>
            <Button variant="outline" size="sm" onClick={refresh}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((key) => (
            <Skeleton key={key} className="h-56" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <StatsCard
            title="Programme statistics"
            icon={BookOpen}
            data={programmes.data}
            metrics={programmeMetrics}
          />
          <StatsCard
            title="Lecturer statistics"
            icon={Users}
            data={lecturers.data}
            metrics={lecturerMetrics}
          />
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-base">Attention</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><Attention label="Unmatched programme departments" value={valueOf(programmes.data, "unmatched_departments")} /><Attention label="Unassigned lecturers" value={valueOf(lecturers.data, "unassigned")} /><Attention label="Lecturer errors" value={valueOf(lecturers.data, "errors")} /></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-base">Last synchronization</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Source systems</span><strong>Programmes · Lecturers</strong></div><div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="secondary">Preview available</Badge></div><div className="flex justify-between"><span className="text-muted-foreground">Records processed</span><strong>{valueOf(programmes.data, "fetched")} programmes · {valueOf(lecturers.data, "fetched")} lecturers</strong></div></CardContent></Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Department breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="p-2">Department</th>
                    <th className="p-2">Programmes fetched</th>
                    <th className="p-2">Lecturers fetched</th>
                    <th className="p-2">Lecturers matched locally</th>
                    <th className="p-2">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: any) => (
                    <tr
                      key={row.department_id ?? row.external_department_id}
                      className="border-b"
                    >
                      <td className="p-2 font-medium">
                        {row.department_name ?? row.name ?? "Unassigned"}
                      </td>
                      <td className="p-2">{row.programmes_fetched ?? "—"}</td>
                      <td className="p-2">
                        {row.fetched_lecturers ?? row.lecturers_fetched ?? "—"}
                      </td>
                      <td className="p-2">
                        {row.matched_local_lecturers ?? "—"}
                      </td>
                      <td className="p-2">
                        <Badge
                          variant={
                            row.missing_department_mapping
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {row.missing_department_mapping
                            ? "Mapping issue"
                            : "None"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No department synchronization records are available.
            </p>
          )}
        </CardContent>
      </Card>
    </SchoolWorkspace>
  );
}

function Attention({ label, value }: { label: string; value: number | string }) { return <div className="flex items-center justify-between rounded-md border p-3"><span>{label}</span><Badge variant={value === 0 ? "secondary" : "destructive"}>{value}</Badge></div>; }

function StatsCard({
  title,
  icon: Icon,
  data,
  metrics,
}: {
  title: string;
  icon: typeof BookOpen;
  data?: Record<string, any>;
  metrics: Metric[];
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-3">
        <Icon className="size-5 text-primary" />
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <div key={metric.key} className="rounded-md border p-3">
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="mt-1 text-xl font-semibold">
              {valueOf(data, metric.key)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
