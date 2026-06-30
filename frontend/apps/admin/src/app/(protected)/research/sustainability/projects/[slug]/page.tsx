"use client";

import { useQuery } from "@tanstack/react-query";
import { eventsApi, researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import type { ReactNode } from "react";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { DateValue, titleOf } from "../../../_components/research-workspace";
import { SdgBadges } from "../../_components/sustainability-workspace";

export default function SustainabilityInitiativeDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Sustainability Initiative"
      description="View sustainability objectives, approach, activities, impact, and public contact fields."
      resource={researchServiceApi.sustainability}
      backHref="/research/sustainability/projects"
      publicHrefBase="/sustainability"
      auditResourceTypes={["sustainability", "sustainability_project", "research_sustainability"]}
      labelFields={["initiative_type", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Lead", field: "lead_id", relation: { adapter: "person", filters: { status: "active" } } },
        { label: "Research Center", field: "center_id", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Contact", field: "contact_email" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "description"] },
        { title: "Approach", fields: ["objectives", "approach", "activities"] },
        { title: "Impact", fields: ["impact", "website", "video_url", "cover_image_url"] },
      ]}
      renderAfter={(record) => <SustainabilityRelations record={record} />}
    />
  );
}

function SustainabilityRelations({ record }: { record: ResearchGenericRecord }) {
  const projects = useQuery({
    queryKey: ["research", "sustainability", "detail", record.id, "projects"],
    queryFn: () => researchServiceApi.sustainabilityRelations.projects.list(record.id),
  });
  const partners = useQuery({
    queryKey: ["research", "sustainability", "detail", record.id, "partners"],
    queryFn: () => researchServiceApi.sustainabilityRelations.partners.list(record.id),
  });
  const training = useQuery({
    queryKey: ["research", "sustainability", "detail", record.id, "training"],
    queryFn: () => researchServiceApi.sustainabilityRelations.training.list(record.id),
  });
  const stories = useQuery({
    queryKey: ["research", "sustainability", "detail", record.id, "stories"],
    queryFn: () => researchServiceApi.sustainabilityRelations.stories.list(record.id),
  });
  const impactMetrics = useQuery({
    queryKey: ["research", "sustainability", "detail", record.id, "impact-metrics"],
    queryFn: () => researchServiceApi.impactMetrics.list({ page: 1, per_page: 6, category: "environmental" }),
  });
  const activities = useQuery({
    queryKey: ["research", "sustainability", "detail", record.id, "activities"],
    queryFn: () => eventsApi.listAdmin({ page: 1, per_page: 6, scope_type: "research", upcoming: true }),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>SDG Alignment</CardTitle>
        </CardHeader>
        <CardContent>
          <SdgBadges goals={record.sdg_goals} />
          {!record.sdg_goals ? (
            <p className="text-sm text-muted-foreground">No SDG goals are recorded on this sustainability initiative.</p>
          ) : null}
        </CardContent>
      </Card>

      <ResearchDetailRelationshipTabs
        tabs={[
          {
            value: "projects",
            label: "Projects",
            count: projects.data?.data?.length,
            content: <AsyncRelationshipCard title="Related Projects" records={projects.data?.data ?? []} isLoading={projects.isLoading} isError={projects.isError} emptyLabel="No research projects are linked to this sustainability record." render={(project) => <div><p className="font-medium">{titleOf(project)}</p><p className="text-sm text-muted-foreground">{[project.code, project.project_type, project.status].filter(Boolean).join(" · ") || "No project metadata"}</p></div>} />,
          },
          {
            value: "partners",
            label: "Partners",
            count: partners.data?.data?.length,
            content: <AsyncRelationshipCard title="Related Partners" records={partners.data?.data ?? []} isLoading={partners.isLoading} isError={partners.isError} emptyLabel="No partners are linked to this sustainability record." render={(partner) => <div><p className="font-medium">{titleOf(partner)}</p><p className="text-sm text-muted-foreground">{[partner.partner_type, partner.partnership_level, partner.country].filter(Boolean).join(" · ") || "No partner metadata"}</p></div>} />,
          },
          {
            value: "activities",
            label: "Activities",
            count: activities.data?.data?.length,
            content: <AsyncRelationshipCard title="Research-Scoped Activities" records={activities.data?.data ?? []} isLoading={activities.isLoading} isError={activities.isError} emptyLabel="No upcoming research-scoped activities were returned." render={(activity) => <div><p className="font-medium">{titleOf(activity)}</p><p className="text-sm text-muted-foreground">{activity.start_date ? <DateValue value={activity.start_date} /> : "No date"}{activity.location ? ` · ${activity.location}` : ""}</p></div>} />,
          },
          {
            value: "impact",
            label: "Impact",
            count: impactMetrics.data?.data?.length,
            content: <AsyncRelationshipCard title="Environmental Metrics" records={impactMetrics.data?.data ?? []} isLoading={impactMetrics.isLoading} isError={impactMetrics.isError} emptyLabel="No environmental impact metrics were returned." render={(metric) => <div><p className="font-medium">{titleOf(metric)}</p><p className="text-sm text-muted-foreground">{[metric.value, metric.unit, metric.reporting_year].filter(Boolean).join(" · ")}</p></div>} />,
          },
          {
            value: "training",
            label: "Training",
            count: training.data?.data?.length,
            content: <AsyncRelationshipCard title="Related Training" records={training.data?.data ?? []} isLoading={training.isLoading} isError={training.isError} emptyLabel="No training programs are linked to this sustainability record." render={(program) => <div><p className="font-medium">{titleOf(program)}</p><p className="text-sm text-muted-foreground">{[program.code, program.program_type, program.delivery_mode].filter(Boolean).join(" · ") || "No training metadata"}</p></div>} />,
          },
          {
            value: "stories",
            label: "Stories",
            count: stories.data?.data?.length,
            content: <AsyncRelationshipCard title="Impact Stories" records={stories.data?.data ?? []} isLoading={stories.isLoading} isError={stories.isError} emptyLabel="No impact stories are linked to this sustainability record." render={(story) => <div><p className="font-medium">{titleOf(story)}</p><p className="text-sm text-muted-foreground">{[story.story_type, story.story_date, story.status].filter(Boolean).join(" · ") || "No story metadata"}</p></div>} />,
          },
        ]}
        defaultValue="projects"
      />
    </div>
  );
}

function AsyncRelationshipCard({
  title,
  records,
  isLoading,
  isError,
  emptyLabel,
  render,
}: {
  title: string;
  records: ResearchGenericRecord[];
  isLoading: boolean;
  isError: boolean;
  emptyLabel: string;
  render: (record: ResearchGenericRecord) => ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : isError ? (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">Unable to load this relationship data.</p>
        ) : records.length === 0 ? (
          <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div key={record.id} className="rounded-lg border p-3">{render(record)}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
