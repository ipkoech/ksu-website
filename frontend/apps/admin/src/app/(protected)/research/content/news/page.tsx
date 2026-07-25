"use client";

import { newsApi } from "@ksu/api-client";
import { ResearchContentResourcePage } from "../../_components/research-content-resource-page";
import {
  ContentWorkspaceHeader,
  contentColumns,
  contentFilters,
} from "../_components/content-workspace";
import { contentAttachmentRoles } from "@/components/content/content-attachment-roles";

export default function ResearchNewsPage() {
  return (
    <ResearchContentResourcePage
      title="Research News"
      description="Manage news records scoped to research."
      queryKey={["research", "content", "news"]}
      resource={{
        list: newsApi.listAdmin,
        create: newsApi.create,
        update: newsApi.update,
        delete: newsApi.delete,
      }}
      summarySlot={<ContentWorkspaceHeader />}
      listFilters={contentFilters}
      recordColumns={contentColumns}
      getRecordDetailHref={(record) => `/research/content/news/${record.id}`}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "rich_text", label: "Body", type: "richtext" },
        {
          name: "featured_media_id",
          label: "Featured Media",
          type: "media",
          media: {
            mediaType: "image",
            uploadEntityType: "research",
            uploadRole: "featured",
          },
        },
        {
          name: "media_attachments",
          label: "News Media",
          type: "attachments",
          attachments: { entityType: "news", roles: contentAttachmentRoles },
        },
        {
          name: "author_user_id",
          label: "Author",
          type: "entity",
          relation: { adapter: "user", filters: { is_active: true } },
        },
        { name: "published_at", label: "Publish Date", type: "datetime-local" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
            { label: "Scheduled", value: "scheduled" },
            { label: "Archived", value: "archived" },
          ],
        },
        { name: "is_published", label: "Published", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ status: "draft", is_published: false }}
      emptyMessage="No research news records were returned by the main content service."
    />
  );
}
