"use client";

import { useQuery } from "@tanstack/react-query";
import { AttachmentManager } from "@/components/media/attachment-manager";
import {
  relationshipAdapters,
  type RelationshipAdapter,
} from "@/components/relationships/relationship-adapters";
import { Card, CardContent, CardHeader, CardTitle } from "@ksu/ui/components";
import type { ResearchGenericRecord } from "@ksu/api-client";
import {
  ResearchAdminDetailPage,
  ResearchDetailRelationshipTabs,
} from "../../_components/research-admin-detail-page";

type ContentKind = "news" | "blog" | "event" | "announcement" | "slider";

type ContentRecordDetailPageProps = {
  title: string;
  description: string;
  backHref: string;
  entityType: ContentKind;
  resourceType: string;
  resource: {
    get: (id: string) => Promise<{ data?: ResearchGenericRecord }>;
  };
  factFields?: Array<{
    label: string;
    field: string;
    format?: "date" | "datetime" | "label" | "boolean";
    relation?: {
      adapter: keyof typeof relationshipAdapters;
    };
  }>;
  sections?: Array<{ title: string; fields: string[] }>;
};

const scopeAdapters: Partial<Record<string, keyof typeof relationshipAdapters>> = {
  research_center: "researchCenter",
  research_farm: "researchFarm",
  research_grant: "researchGrant",
  research_project: "researchProject",
  research_sustainability: "researchSustainability",
};

const attachmentRoles = [
  { value: "featured", label: "Featured image", mediaType: "image", accept: "image/*" },
  { value: "gallery", label: "Gallery item", mediaType: "image", accept: "image/*" },
  { value: "attachment", label: "Attachment" },
  { value: "document", label: "Document" },
];

const commonFactFields = [
  { label: "Status", field: "status", format: "label" as const },
  { label: "Published", field: "is_published", format: "boolean" as const },
  { label: "Public", field: "is_public", format: "boolean" as const },
  { label: "Featured", field: "is_featured", format: "boolean" as const },
  { label: "Author", field: "author_user_id", relation: { adapter: "user" as const } },
  { label: "Featured Media", field: "featured_media_id", relation: { adapter: "media" as const } },
  { label: "Published At", field: "published_at", format: "datetime" as const },
  { label: "Updated", field: "updated_at", format: "datetime" as const },
];

const commonSections = [
  { title: "Content", fields: ["summary", "excerpt", "plain_text", "rich_text", "content"] },
  { title: "Publishing", fields: ["category", "tags", "valid_from", "valid_to", "archived_at", "display_order"] },
  { title: "SEO", fields: ["meta_title", "meta_description", "keywords"] },
];

export function ContentRecordDetailPage({
  title,
  description,
  backHref,
  entityType,
  resourceType,
  resource,
  factFields = [],
  sections = [],
}: ContentRecordDetailPageProps) {
  return (
    <ResearchAdminDetailPage
      title={title}
      description={description}
      resource={resource}
      backHref={backHref}
      slugParam="id"
      lookup="id"
      labelFields={["status", "is_public", "is_published"]}
      factFields={[...factFields, ...commonFactFields]}
      sections={[...sections, ...commonSections]}
      auditServiceName="main"
      auditResourceTypes={[resourceType, entityType]}
      renderAfter={(record) => (
        <ContentRecordRelations record={record} entityType={entityType} />
      )}
    />
  );
}

function ContentRecordRelations({
  record,
  entityType,
}: {
  record: ResearchGenericRecord;
  entityType: ContentKind;
}) {
  return (
    <ResearchDetailRelationshipTabs
      defaultValue="scope"
      tabs={[
        {
          value: "scope",
          label: "Scope",
          content: <ScopeBindingCard record={record} />,
        },
        {
          value: "media",
          label: "Media",
          content: (
            <AttachmentManager
              entityType={entityType}
              entityId={String(record.id)}
              title="Media Attachments"
              description="Browse, attach, preview, and unlink media assets connected to this research content record."
              roles={attachmentRoles}
            />
          ),
        },
      ]}
    />
  );
}

function ScopeBindingCard({ record }: { record: ResearchGenericRecord }) {
  const scopeType = typeof record.scope_type === "string" ? record.scope_type : "";
  const scopeId = typeof record.scope_id === "string" ? record.scope_id : "";
  const adapterKey = scopeAdapters[scopeType];
  const adapter = adapterKey ? (relationshipAdapters[adapterKey] as RelationshipAdapter) : null;
  const scopeQuery = useQuery({
    queryKey: ["research", "content", "scope", scopeType, scopeId],
    queryFn: () => adapter!.get(scopeId),
    enabled: Boolean(adapter && scopeId),
  });

  let body = "This record is scoped to the research portal.";
  if (adapter && scopeId) {
    if (scopeQuery.isLoading) body = "Loading linked research record...";
    else if (scopeQuery.isError) body = "Unable to load the linked research record.";
    else if (scopeQuery.data) {
      body = [scopeQuery.data.label, scopeQuery.data.description]
        .filter(Boolean)
        .join(" - ");
    } else {
      body = "No linked research record was returned for this scope.";
    }
  } else if (scopeType && scopeType !== "research") {
    body = `The content service returned scope type "${scopeType}", but no supported research adapter is configured for it.`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Research Scope</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}
