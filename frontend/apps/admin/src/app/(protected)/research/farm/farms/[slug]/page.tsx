"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import { researchServiceApi, type ResearchGenericRecord } from "@ksu/api-client";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";

export default function ResearchFarmDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Farm Profile"
      description="View farm facilities, operations, products, capacity, contact details, and public profile fields."
      resource={researchServiceApi.farms}
      backHref="/research/farm/farms"
      publicHrefBase="/farm"
      labelFields={["farm_type", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Size", field: "size_hectares" },
        { label: "Location", field: "location" },
        { label: "County", field: "county" },
        { label: "Public", field: "is_public", format: "boolean" },
      ]}
      sections={[
        { title: "Profile", fields: ["summary", "about", "description"] },
        { title: "Operations", fields: ["activities", "products", "facilities", "capacity_info"] },
        { title: "Contact and Media", fields: ["manager_name", "email", "phone", "address", "cover_image_url"] },
      ]}
      renderAfter={(record) => <FarmRelations farm={record} />}
    />
  );
}

function FarmRelations({ farm }: { farm: ResearchGenericRecord }) {
  const farmId = String(farm.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="projects"
      tabs={[
        {
          value: "projects",
          label: "Projects",
          content: (
            <RelatedRecordsCard
              title="Farm Projects"
              queryKey={["research", "farms", farmId, "projects"]}
              queryFn={() => researchServiceApi.farmRelations.projects.list(farmId)}
              emptyLabel="No projects are linked to this farm site."
            />
          ),
        },
        {
          value: "partners",
          label: "Partners",
          content: (
            <RelatedRecordsCard
              title="Project Partners"
              queryKey={["research", "farms", farmId, "partners"]}
              queryFn={() => researchServiceApi.farmRelations.partners.list(farmId)}
              emptyLabel="No partners are linked through this farm's projects."
            />
          ),
        },
        {
          value: "activities",
          label: "Activities",
          content: (
            <RelatedRecordsCard
              title="Farm Activities"
              queryKey={["research", "farms", farmId, "activities"]}
              queryFn={() => researchServiceApi.farmRelations.activities.list(farmId)}
              emptyLabel="No research-scoped activities are linked to this farm."
            />
          ),
        },
        {
          value: "impact",
          label: "Impact",
          content: (
            <RelatedRecordsCard
              title="Impact Stories"
              queryKey={["research", "farms", farmId, "impact-stories"]}
              queryFn={() => researchServiceApi.farmRelations.impactStories.list(farmId)}
              emptyLabel="No impact stories are linked through this farm's projects."
            />
          ),
        },
      ]}
    />
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
