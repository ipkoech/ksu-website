"use client";

import { useState, type ReactNode } from "react";
import { LinkIcon } from "lucide-react";
import {
  mediaApi,
  useCreateMediaLink,
  useMedia,
  useMediaLinks,
  type Media,
  type MediaFolder,
} from "@ksu/api-client";
import { usePermissions } from "@ksu/auth";
import { EditableServiceResourcePage, type EditableListFilter, type EditableRecordColumn } from "@/components/dashboard/editable-service-resource-page";
import { MediaPicker, getMediaLabel, getMediaUrl, isImageMedia } from "@/components/media";
import { EntityTypeRecordPicker } from "@/components/relationships/entity-picker";
import { relationshipAdapters } from "@/components/relationships/relationship-adapters";
import { DateValue, StatusBadge, titleOf } from "../../_components/research-workspace";
import { ContentWorkspaceHeader } from "../_components/content-workspace";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ImageRenderer,
  Input,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";

const galleryFilters: EditableListFilter[] = [
  { name: "parent_id", label: "Parent Folder", type: "entity", relation: { adapter: "mediaFolder", filters: { scope_type: "research" } } },
];

type GalleryRecord = MediaFolder & Record<string, any>;

const galleryColumns: Array<EditableRecordColumn<GalleryRecord>> = [
  { key: "name", label: "Folder", className: "min-w-[240px]", render: (record) => <span className="font-medium">{titleOf(record)}</span> },
  { key: "slug", label: "Slug", className: "hidden min-w-[160px] md:table-cell", render: (record) => <span>{record.slug}</span> },
  { key: "scope", label: "Scope", className: "hidden w-[120px] lg:table-cell", render: (record) => <span>{record.scope_type ?? "global"}</span> },
  { key: "public", label: "Visibility", className: "w-[120px]", render: (record) => <StatusBadge value={record.is_public ? "public" : "private"} /> },
  { key: "updated", label: "Updated", className: "hidden w-[150px] xl:table-cell", render: (record) => <DateValue value={record.updated_at} /> },
];

function GalleryMobileRecord(record: GalleryRecord, actions: ReactNode) {
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{record.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{[record.slug, record.scope_type ?? "global"].filter(Boolean).join(" · ")}</p>
        </div>
        <div className="shrink-0">{actions}</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-md border px-2 py-1">{record.is_public ? "Public" : "Private"}</span>
        {record.updated_at ? <span className="rounded-md border px-2 py-1">Updated {record.updated_at.slice(0, 10)}</span> : null}
      </div>
    </div>
  );
}

function MediaTile({ media }: { media: Media }) {
  const url = getMediaUrl(media);

  return (
    <div className="rounded-lg border bg-background p-2">
      <div className="flex h-24 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {url && isImageMedia(media) ? (
          <ImageRenderer src={url} alt={getMediaLabel(media)} className="h-full border-0" imageClassName="h-full w-full" />
        ) : (
          <span className="px-3 text-center text-xs text-muted-foreground">{media.media_type ?? media.mime_type ?? "Media"}</span>
        )}
      </div>
      <p className="mt-2 truncate text-sm font-medium">{getMediaLabel(media)}</p>
      <p className="truncate text-xs text-muted-foreground">{media.mime_type ?? media.media_type ?? "File"}</p>
    </div>
  );
}

function GalleryAssetWorkflow() {
  const [mediaId, setMediaId] = useState("");
  const [target, setTarget] = useState({ type: "research_project", id: "" });
  const [role, setRole] = useState("gallery");
  const mediaQuery = useMedia({ page: 1, per_page: 6, fields: "id,title,filename,original_filename,media_type,mime_type,thumbnail_url,public_url,url,created_at" });
  const linkedMediaQuery = useMediaLinks(
    { entity_type: target.type, entity_id: target.id, fields: "id,media_id,entity_type,entity_id,role,is_public,media" },
    { enabled: Boolean(target.type && target.id) },
  );
  const createLink = useCreateMediaLink();
  const canAttach = Boolean(mediaId && target.type && target.id);

  const handleAttach = async () => {
    if (!canAttach) {
      toast.error("Choose a media asset and a linked research record first.");
      return;
    }
    try {
      await createLink.mutateAsync({
        media_id: mediaId,
        entity_type: target.type,
        entity_id: target.id,
        role: role.trim() || "gallery",
        is_public: true,
      });
      toast.success("Media linked to research record");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Media link failed");
    }
  };

  const mediaItems = mediaQuery.data?.data ?? [];
  const linkedItems = linkedMediaQuery.data?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Media Assets And Links</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="space-y-3">
          <MediaPicker
            value={mediaId}
            onChange={(value) => setMediaId(value)}
            label="Research media"
            helperText="Browse or upload media through the main media service with entity_type: research."
            uploadEntityType="research"
            uploadRole={role}
            allowClear
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {mediaItems.map((media) => <MediaTile key={media.id} media={media} />)}
          </div>
        </div>

        <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
          <EntityTypeRecordPicker
            typeValue={target.type}
            idValue={target.id}
            onChange={(nextTarget) => setTarget(nextTarget)}
            label="Attach usage"
            description="Select the supported research record that should own this media usage."
            allowNone={false}
            configs={[
              { value: "research_project", label: "Research Project", adapter: relationshipAdapters.researchProject, filters: { is_active: true } },
              { value: "research_center", label: "Research Center", adapter: relationshipAdapters.researchCenter, filters: { is_active: true } },
              { value: "research_grant", label: "Research Grant", adapter: relationshipAdapters.researchGrant, filters: { is_active: true } },
              { value: "research_donor", label: "Research Donor", adapter: relationshipAdapters.researchDonor, filters: { is_active: true } },
            ]}
          />
          <div className="space-y-2">
            <label htmlFor="research-gallery-role" className="text-sm font-medium">Usage role</label>
            <Input id="research-gallery-role" value={role} onChange={(event) => setRole(event.target.value)} placeholder="gallery, featured, attachment" />
          </div>
          <Button type="button" onClick={handleAttach} disabled={createLink.isPending}>
            <LinkIcon data-icon="inline-start" />
            {createLink.isPending ? "Linking..." : "Attach Media"}
          </Button>
          <div className="space-y-2">
            <p className="text-sm font-medium">Linked media</p>
            {target.id && linkedItems.length ? (
              <div className="space-y-2">
                {linkedItems.map((link) => (
                  <div key={link.id} className="rounded-md border bg-background p-2 text-sm">
                    <p className="font-medium">{getMediaLabel(link.media ?? undefined)}</p>
                    <p className="text-xs text-muted-foreground">{link.role || "gallery"}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                Select a supported research record to preview linked media.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResearchGalleryPage() {
  const { hasScope } = usePermissions();
  const canManage = ["media.manage", "media.upload", "content.manage", "research:write"].some((scope) => hasScope(scope));

  return (
    <EditableServiceResourcePage<GalleryRecord, Record<string, any>>
      title="Research Gallery"
      description="Manage research-scoped media folders used by the main media service."
      backHref="/research/content"
      queryKey={["research", "content", "gallery"]}
      summarySlot={<div className="space-y-4"><ContentWorkspaceHeader /><GalleryAssetWorkflow /></div>}
      listFilters={galleryFilters}
      recordColumns={galleryColumns}
      editorMode="sheet"
      renderMobileRecord={GalleryMobileRecord}
      fields={[
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "parent_id", label: "Parent Folder", type: "entity", relation: { adapter: "mediaFolder", filters: { scope_type: "research" }, allowClear: true } },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_public", label: "Public", type: "boolean" },
      ]}
      list={(filters) => mediaApi.listFolders({ scope_type: "research", fields: "id,name,slug,parent_id,description,is_public,scope_type,scope_id,created_at,updated_at", ...filters })}
      create={(payload) => mediaApi.createFolder({ ...payload, scope_type: "research", scope_id: null } as any)}
      update={(id, payload) => mediaApi.updateFolder(id, { ...payload, scope_type: "research", scope_id: null } as any)}
      delete={(id) => mediaApi.deleteFolder(id)}
      getRecordTitle={(record) => record.name}
      getRecordMeta={(record) => [record.scope_type, record.is_public ? "public" : "private"].filter(Boolean).join(" · ")}
      emptyMessage="No research gallery folders were returned by the media service."
      buildPayload={(values) => ({ is_public: true, ...values, scope_type: "research", scope_id: null })}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      resourceKey="content"
    />
  );
}
