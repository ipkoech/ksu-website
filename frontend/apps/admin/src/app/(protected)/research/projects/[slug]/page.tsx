"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../_components/research-admin-detail-page";

export default function ResearchProjectDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Project"
      description="View public profile fields, project dates, progress, and publication-ready details."
      resource={researchServiceApi.projects}
      backHref="/research/projects"
      publicHrefBase="/projects"
      labelFields={["project_type", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Progress", field: "progress_percentage" },
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Grant", field: "grant_id", relation: { adapter: "researchGrant" } },
        { label: "Public", field: "is_public", format: "boolean" },
        { label: "Featured", field: "is_featured", format: "boolean" },
      ]}
      sections={[
        { title: "Overview", fields: ["summary", "abstract", "background"] },
        { title: "Research Design", fields: ["objectives", "methodology", "expected_outcomes", "deliverables"] },
        { title: "Impact and Funding", fields: ["impact", "budget", "currency"] },
      ]}
      renderAfter={(record) => <ProjectRelations project={record} />}
    />
  );
}

function ProjectRelations({ project }: { project: ResearchGenericRecord }) {
  const projectId = String(project.id);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <RelatedRecordsCard
        title="Related Publications"
        queryKey={["research", "projects", projectId, "publications"]}
        queryFn={() => researchServiceApi.publications.list({ page: 1, per_page: 6, project_id: projectId })}
        emptyLabel="No publications are linked to this project."
      />
      <RelatedRecordsCard
        title="Grant Reports"
        queryKey={["research", "projects", projectId, "grant-reports"]}
        queryFn={() => researchServiceApi.grantReports.list({ page: 1, per_page: 6, project_id: projectId })}
        emptyLabel="No grant reports are linked to this project."
      />
      <RelatedRecordsCard
        title="Research Outputs"
        queryKey={["research", "projects", projectId, "outputs"]}
        queryFn={() => researchServiceApi.outputs.list({ page: 1, per_page: 6, project_id: projectId })}
        emptyLabel="No outputs are linked to this project."
      />
      <RelatedRecordsCard
        title="Impact Records"
        queryKey={["research", "projects", projectId, "impact"]}
        queryFn={() => researchServiceApi.impactMetrics.list({ page: 1, per_page: 6, project_id: projectId })}
        emptyLabel="No impact records are linked to this project."
      />
      <RelatedRecordsCard
        title="Innovations"
        queryKey={["research", "projects", projectId, "innovations"]}
        queryFn={() => researchServiceApi.innovations.list({ page: 1, per_page: 6, project_id: projectId })}
        emptyLabel="No innovations are linked to this project."
      />
      <Card>
        <CardHeader>
          <CardTitle>Partners and Activities</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          The current research project API does not expose direct project-partner or project-activity binding fields. These should be added as explicit backend relationships before this detail view renders those records.
        </CardContent>
      </Card>
    </div>
  );
}

function RelatedRecordsCard({
  title,
  queryKey,
  queryFn,
  emptyLabel,
}: {
  title: string;
  queryKey: readonly unknown[];
  queryFn: () => Promise<{ data?: ResearchGenericRecord[] }>;
  emptyLabel: string;
}) {
  const query = useQuery({ queryKey, queryFn });
  const records = query.data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {query.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading related records...</p>
        ) : query.isError ? (
          <p className="text-sm text-destructive">Unable to load related records.</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          <div className="divide-y rounded-md border">
            {records.map((record) => (
              <div key={record.id} className="p-3">
                <p className="font-medium">{record.title ?? record.name ?? record.code ?? "Untitled related record"}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {[record.status, record.updated_at].filter(Boolean).join(" · ") || "Related research record"}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
