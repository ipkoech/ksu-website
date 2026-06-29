"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Activity, BadgeCheck, CalendarDays, Handshake, Leaf, NotebookText, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import type { EditableListFilter, EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { eventsApi, researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import {
  DateValue,
  labelize,
  RelationCell,
  researchCount,
  ResearchWorkspaceHeader,
  StatusBadge,
  titleOf,
} from "../../_components/research-workspace";

const environmentImpactParams = { category: "environmental", page: 1, per_page: 6 };
const researchActivityParams = { scope_type: "research", page: 1, per_page: 6, upcoming: true };

export const sustainabilityTabs = [
  { label: "Dashboard", href: "/research/sustainability" },
  { label: "Projects", href: "/research/sustainability/projects" },
  { label: "Partners", href: "/research/sustainability/partners" },
  { label: "Activities", href: "/research/sustainability/activities" },
  { label: "Impact", href: "/research/impact" },
];

export function SustainabilityWorkspaceHeader() {
  return (
    <ResearchWorkspaceHeader
      tabs={sustainabilityTabs}
      metrics={[
        { title: "Active Projects", queryKey: ["research", "sustainability", "metrics", "projects"], queryFn: () => researchCount("sustainability", { status: "active" }), icon: <Leaf className="h-4 w-4" /> },
        { title: "Partners", queryKey: ["research", "sustainability", "metrics", "partners"], queryFn: () => researchCount("partners", { is_active: true }), icon: <Handshake className="h-4 w-4" /> },
        { title: "Activities", queryKey: ["research", "sustainability", "metrics", "activities"], queryFn: () => eventsApi.listAdmin({ scope_type: "research", upcoming: true, per_page: 1 }), icon: <Activity className="h-4 w-4" /> },
        { title: "Impact Records", queryKey: ["research", "sustainability", "metrics", "impact"], queryFn: () => researchCount("impactMetrics", { category: "environmental" }), icon: <BadgeCheck className="h-4 w-4" /> },
        { title: "Impact Stories", queryKey: ["research", "sustainability", "metrics", "stories"], queryFn: () => researchCount("stories", { status: "published" }), icon: <NotebookText className="h-4 w-4" /> },
      ]}
    />
  );
}

export function SustainabilityDashboard() {
  const projects = useQuery({
    queryKey: ["research", "sustainability", "dashboard", "projects"],
    queryFn: () => researchServiceApi.sustainability.list({ page: 1, per_page: 5, status: "active" }),
  });
  const metrics = useQuery({
    queryKey: ["research", "sustainability", "dashboard", "impact", environmentImpactParams],
    queryFn: () => researchServiceApi.impactMetrics.list(environmentImpactParams),
  });
  const activities = useQuery({
    queryKey: ["research", "sustainability", "dashboard", "activities", researchActivityParams],
    queryFn: () => eventsApi.listAdmin(researchActivityParams),
  });

  return (
    <div className="grid gap-4 p-4 pt-0 sm:p-6 sm:pt-0 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Active Sustainability Projects</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">Climate, biodiversity, conservation, energy, water, and food security initiatives.</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/research/sustainability/projects">Open</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <DashboardList
            isLoading={projects.isLoading}
            isError={projects.isError}
            emptyLabel="No active sustainability projects were returned."
            records={projects.data?.data ?? []}
            render={(record) => (
              <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{titleOf(record)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{labelize(record.initiative_type)}</span>
                    {record.start_date ? <DateValue value={record.start_date} /> : null}
                    <StatusBadge value={record.status} />
                  </div>
                </div>
                <SdgBadges goals={record.sdg_goals} limit={4} />
              </div>
            )}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Environmental Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardList
              isLoading={metrics.isLoading}
              isError={metrics.isError}
              emptyLabel="No environmental impact metrics were returned."
              records={metrics.data?.data ?? []}
              render={(record) => (
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{titleOf(record)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{formatMetricValue(record)}</span>
                    {record.reporting_year ? ` · ${record.reporting_year}` : ""}
                  </p>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarDays className="h-4 w-4" />
              Research-Scoped Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardList
              isLoading={activities.isLoading}
              isError={activities.isError}
              emptyLabel="No upcoming research-scoped sustainability activities were returned."
              records={activities.data?.data ?? []}
              render={(record) => (
                <div className="rounded-lg border p-3">
                  <p className="text-sm font-medium">{titleOf(record)}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {record.start_date ? <DateValue value={record.start_date} /> : "No date"}
                    {record.location ? ` · ${record.location}` : ""}
                  </p>
                </div>
              )}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const sustainabilityFilters: EditableListFilter[] = [
  { name: "search", label: "Search", type: "text", placeholder: "Search project name, code, or summary" },
  { name: "initiative_type", label: "Theme", type: "select", options: [
    { label: "Climate", value: "climate" },
    { label: "Biodiversity", value: "biodiversity" },
    { label: "Conservation", value: "conservation" },
    { label: "Renewable Energy", value: "renewable_energy" },
    { label: "Circular Economy", value: "circular_economy" },
    { label: "Water", value: "water" },
    { label: "Food Security", value: "food_security" },
  ] },
  { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
  { name: "status", label: "Status", type: "select", options: [
    { label: "Planning", value: "planning" },
    { label: "Active", value: "active" },
    { label: "Completed", value: "completed" },
    { label: "Suspended", value: "suspended" },
  ] },
];

export const sustainabilityColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  { key: "project", label: "Project Title", className: "min-w-[260px]", render: (record) => <span className="font-medium">{titleOf(record)}</span> },
  {
    key: "theme",
    label: "Theme / SDG",
    className: "min-w-[180px]",
    render: (record) => (
      <div className="space-y-1">
        <span>{labelize(record.initiative_type)}</span>
        {Array.isArray(record.sdg_goals) && record.sdg_goals.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {record.sdg_goals.slice(0, 4).map((goal: number) => (
              <span key={goal} className="rounded border px-1.5 py-0.5 text-[11px] text-muted-foreground">SDG {goal}</span>
            ))}
          </div>
        ) : null}
      </div>
    ),
  },
  { key: "partner", label: "Partner", className: "hidden min-w-[180px] lg:table-cell", render: (record) => <RelationshipSummary record={record} collectionKey="partners" emptyLabel="No linked partners exposed" /> },
  { key: "lead", label: "Lead", className: "hidden min-w-[190px] lg:table-cell", render: (record) => <RelationCell id={record.lead_id} adapterKey="person" emptyLabel="No lead" /> },
  { key: "metrics", label: "Metrics", className: "hidden min-w-[150px] xl:table-cell", render: (record) => <RelationshipSummary record={record} collectionKey="metrics" countKeys={["metric_count", "metrics_count"]} emptyLabel="Metrics via Impact" /> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
  { key: "dates", label: "Dates", className: "hidden w-[180px] xl:table-cell", render: (record) => <span>{record.start_date ? <DateValue value={record.start_date} /> : "No dates"}</span> },
];

export const partnerColumns: Array<EditableRecordColumn<ResearchGenericRecord>> = [
  { key: "partner", label: "Partner Name", className: "min-w-[240px]", render: (record) => <span className="font-medium">{titleOf(record)}</span> },
  { key: "type", label: "Type", className: "w-[150px]", render: (record) => <span>{labelize(record.partner_type)}</span> },
  { key: "projects", label: "Linked Projects", className: "hidden min-w-[170px] lg:table-cell", render: (record) => <RelationshipSummary record={record} collectionKey="projects" countKeys={["project_count", "projects_count"]} emptyLabel="No linked projects exposed" /> },
  { key: "contact", label: "Contact", className: "hidden min-w-[220px] lg:table-cell", render: (record) => <span>{[record.email, record.website, record.country].filter(Boolean).join(" · ") || "No contact"}</span> },
  { key: "status", label: "Status", className: "w-[130px]", render: (record) => <StatusBadge value={record.status} /> },
];

export function parseSdgGoals(value: unknown) {
  if (Array.isArray(value)) {
    return value
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item >= 1 && item <= 17);
  }

  if (typeof value !== "string") return null;
  const goals = value
    .split(/[\s,;]+/)
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item >= 1 && item <= 17);

  return goals.length > 0 ? Array.from(new Set(goals)) : null;
}

export function SdgBadges({ goals, limit = 6 }: { goals: unknown; limit?: number }) {
  const parsed = parseSdgGoals(goals);
  if (!parsed?.length) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {parsed.slice(0, limit).map((goal) => (
        <Badge key={goal} variant="outline" className="h-6 rounded-md px-2 text-[11px]">
          SDG {goal}
        </Badge>
      ))}
      {parsed.length > limit ? (
        <Badge variant="secondary" className="h-6 rounded-md px-2 text-[11px]">
          +{parsed.length - limit}
        </Badge>
      ) : null}
    </div>
  );
}

function RelationshipSummary({
  record,
  collectionKey,
  countKeys = [],
  emptyLabel,
}: {
  record: ResearchGenericRecord;
  collectionKey: string;
  countKeys?: string[];
  emptyLabel: string;
}) {
  const collection = record[collectionKey];
  if (Array.isArray(collection) && collection.length > 0) {
    return (
      <div className="flex flex-wrap gap-1">
        {collection.slice(0, 2).map((item: ResearchGenericRecord, index: number) => (
          <Badge key={item.id ?? index} variant="secondary" className="rounded-md">
            {titleOf(item)}
          </Badge>
        ))}
        {collection.length > 2 ? <Badge variant="outline">+{collection.length - 2}</Badge> : null}
      </div>
    );
  }

  for (const key of countKeys) {
    const value = Number(record[key]);
    if (Number.isFinite(value) && value > 0) return <span>{value} linked</span>;
  }

  return <span className="text-muted-foreground">{emptyLabel}</span>;
}

function formatMetricValue(record: ResearchGenericRecord) {
  return [record.value, record.unit].filter(Boolean).join(" ") || "No value";
}

function DashboardList({
  records,
  isLoading,
  isError,
  emptyLabel,
  render,
}: {
  records: ResearchGenericRecord[];
  isLoading: boolean;
  isError: boolean;
  emptyLabel: string;
  render: (record: ResearchGenericRecord) => ReactNode;
}) {
  if (isLoading) {
    return <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div>;
  }

  if (isError) {
    return <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Unable to load this sustainability data.</p>;
  }

  if (records.length === 0) {
    return <p className="rounded-lg border bg-background p-3 text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return <div className="space-y-3">{records.map((record) => <div key={record.id}>{render(record)}</div>)}</div>;
}
