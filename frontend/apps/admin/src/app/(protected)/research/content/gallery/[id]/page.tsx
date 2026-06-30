"use client";

import { mediaApi, type ResearchGenericRecord } from "@ksu/api-client";
import { AttachmentManager } from "@/components/media/attachment-manager";
import { ResearchAdminDetailPage, ResearchDetailRelationshipTabs } from "../../../_components/research-admin-detail-page";
import { RelatedRecordsCard, RelatedRecordsGrid } from "../../../_components/research-detail-relationships";

export default function ResearchGalleryFolderDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Research Gallery Folder"
      description="View research-scoped folder metadata, contained media assets, usage links, and audit history."
      resource={{
        list: (params) => mediaApi.listFolders({ page: 1, per_page: 100, scope_type: "research", ...params }),
      }}
      backHref="/research/content/gallery"
      slugParam="id"
      lookup="id"
      labelFields={["scope_type", "is_public"]}
      factFields={[
        { label: "Slug", field: "slug" },
        { label: "Scope", field: "scope_type" },
        { label: "Public", field: "is_public", format: "boolean" },
        { label: "Parent Folder", field: "parent_id", relation: { adapter: "mediaFolder" } },
      ]}
      sections={[
        { title: "Folder", fields: ["name", "description", "created_at", "updated_at"] },
      ]}
      auditServiceName="main"
      auditResourceTypes={["media_folder", "media", "gallery"]}
      renderAfter={(record) => <GalleryFolderRelations folder={record} />}
    />
  );
}

function GalleryFolderRelations({ folder }: { folder: ResearchGenericRecord }) {
  const folderId = String(folder.id);

  return (
    <ResearchDetailRelationshipTabs
      defaultValue="assets"
      tabs={[
        {
          value: "assets",
          label: "Assets",
          content: (
            <RelatedRecordsGrid>
              <RelatedRecordsCard
                title="Media Assets"
                queryKey={["research", "content", "gallery", folderId, "assets"]}
                queryFn={async () => {
                  const response = await mediaApi.list({
                    page: 1,
                    per_page: 12,
                    folder_id: folderId,
                    fields: "id,title,filename,original_filename,media_type,mime_type,is_public,created_at",
                  });
                  return { data: (response.data ?? []) as ResearchGenericRecord[] };
                }}
                emptyLabel="No media assets were returned for this folder."
                metaFields={["media_type", "mime_type", "is_public"]}
              />
              <RelatedRecordsCard
                title="Image Assets"
                queryKey={["research", "content", "gallery", folderId, "images"]}
                queryFn={async () => {
                  const response = await mediaApi.list({
                    page: 1,
                    per_page: 12,
                    folder_id: folderId,
                    media_type: "image",
                    fields: "id,title,filename,original_filename,media_type,mime_type,is_public,created_at",
                  });
                  return { data: (response.data ?? []) as ResearchGenericRecord[] };
                }}
                emptyLabel="No image assets were returned for this folder."
                metaFields={["media_type", "mime_type", "is_public"]}
              />
            </RelatedRecordsGrid>
          ),
        },
        {
          value: "links",
          label: "Folder Links",
          content: (
            <AttachmentManager
              entityType="research_gallery_folder"
              entityId={folderId}
              title="Folder Media Links"
              description="Attach, preview, and unlink media usages for this research gallery folder."
              roles={[
                { value: "gallery", label: "Gallery item", mediaType: "image", accept: "image/*" },
                { value: "featured", label: "Featured image", mediaType: "image", accept: "image/*" },
                { value: "attachment", label: "Attachment" },
              ]}
            />
          ),
        },
      ]}
    />
  );
}
