"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Eye, LinkIcon, Save, Trash2 } from "lucide-react";
import {
  mediaApi,
  useCreateMediaLink,
  useDeleteMedia,
  useDeleteMediaLink,
  useMedia,
  useMediaLinks,
  useUpdateMedia,
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
  getResearchGuidance,
  ResearchSectionGuide,
} from "../../_components/research-guidance";
import { withResearchFieldHelp } from "../../_components/research-resource-page";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  ImageRenderer,
  Input,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Textarea,
} from "@ksu/ui/components";
import { toast } from "@ksu/ui";

const galleryFilters: EditableListFilter[] = [
  { name: "parent_id", label: "Parent Folder", type: "entity", relation: { adapter: "mediaFolder", filters: { scope_type: "research" } } },
];

type GalleryRecord = MediaFolder & Record<string, any>;

function formatResearchEntityType(entityType?: string | null) {
  const labels: Record<string, string> = {
    research: "Research",
    research_project: "Research Project",
    research_center: "Research Center",
    research_grant: "Research Grant",
    research_donor: "Research Donor",
    research_gallery_folder: "Research Gallery Folder",
  };

  if (!entityType) return "Research record";
  return labels[entityType] ?? entityType.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

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

function MediaTile({ media, onInspect }: { media: Media; onInspect: (media: Media) => void }) {
  const url = getMediaUrl(media);

  return (
    <div className="min-w-0 rounded-lg border bg-background p-2">
      <div className="flex aspect-[4/3] min-h-28 items-center justify-center overflow-hidden rounded-md border bg-muted">
        {url && isImageMedia(media) ? (
          <ImageRenderer src={url} alt={getMediaLabel(media)} className="h-full border-0" imageClassName="h-full w-full" />
        ) : (
          <span className="px-3 text-center text-xs text-muted-foreground">{media.media_type ?? media.mime_type ?? "Media"}</span>
        )}
      </div>
      <p className="mt-2 truncate text-sm font-medium">{getMediaLabel(media)}</p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="truncate text-xs text-muted-foreground">{media.mime_type ?? media.media_type ?? "File"}</p>
        <Button type="button" variant="ghost" size="icon" aria-label="Inspect media usage" onClick={() => onInspect(media)}>
          <Eye data-icon />
        </Button>
      </div>
    </div>
  );
}

function GalleryAssetWorkflow() {
  const [mediaId, setMediaId] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [target, setTarget] = useState({ type: "research_project", id: "" });
  const [role, setRole] = useState("gallery");
  const mediaQuery = useMedia({
    page: 1,
    per_page: 6,
    fields: "id,title,alt_text,caption,filename,original_filename,media_type,mime_type,thumbnail_url,public_url,url,is_public,created_at,links",
    include: "links",
  });
  const linkedMediaQuery = useMediaLinks(
    { entity_type: target.type, entity_id: target.id, fields: "id,media_id,entity_type,entity_id,role,is_public,media" },
    { enabled: Boolean(target.type && target.id) },
  );
  const createLink = useCreateMediaLink();
  const deleteLink = useDeleteMediaLink();
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
            dialogTitle="Research Asset Library"
            dialogDescription="Browse existing research-scoped assets or upload a new media file through the main media service."
            uploadLabel="Upload research asset"
            uploadEntityType="research"
            uploadRole={role}
            allowClear
          />
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
            {mediaItems.map((media) => (
              <MediaTile
                key={media.id}
                media={media}
                onInspect={(nextMedia) => {
                  setSelectedMedia(nextMedia);
                  setMediaId(nextMedia.id);
                }}
              />
            ))}
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
                  <div key={link.id} className="flex items-center justify-between gap-3 rounded-md border bg-background p-2 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{getMediaLabel(link.media ?? undefined)}</p>
                      <p className="text-xs text-muted-foreground">{link.role || "gallery"}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={deleteLink.isPending}
                      aria-label="Unlink media"
                      onClick={async () => {
                        await deleteLink.mutateAsync(link.id);
                        toast.success("Media unlinked from research record");
                      }}
                    >
                      <Trash2 data-icon />
                    </Button>
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
      <AssetUsageDrawer
        media={selectedMedia}
        onOpenChange={(open) => {
          if (!open) setSelectedMedia(null);
        }}
      />
    </Card>
  );
}

function AssetUsageDrawer({
  media,
  onOpenChange,
}: {
  media: Media | null;
  onOpenChange: (open: boolean) => void;
}) {
  const [deleteTarget, setDeleteTarget] = useState<Media | null>(null);
  const [title, setTitle] = useState(media?.title ?? "");
  const [altText, setAltText] = useState(media?.alt_text ?? "");
  const [caption, setCaption] = useState(media?.caption ?? "");
  const [isPublic, setIsPublic] = useState(Boolean(media?.is_public));
  const updateMedia = useUpdateMedia();
  const deleteMedia = useDeleteMedia();
  const usageLinks = media?.links ?? [];

  useEffect(() => {
    setTitle(media?.title ?? "");
    setAltText(media?.alt_text ?? "");
    setCaption(media?.caption ?? "");
    setIsPublic(Boolean(media?.is_public));
  }, [media]);

  const handleUpdateMedia = async () => {
    if (!media) return;
    try {
      await updateMedia.mutateAsync({
        id: media.id,
        data: {
          title: title.trim() || null,
          alt_text: altText.trim() || null,
          caption: caption.trim() || null,
          is_public: isPublic,
        },
      });
      toast.success("Media metadata updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Media update failed");
    }
  };

  const handleDeleteMedia = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMedia.mutateAsync(deleteTarget.id);
      toast.success("Media asset removed");
      setDeleteTarget(null);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Media delete failed");
    }
  };

  return (
    <>
      <Sheet open={Boolean(media)} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Asset Usage</SheetTitle>
          </SheetHeader>
          {media ? (
            <div className="mt-6 space-y-5">
              <MediaTile media={media} onInspect={() => undefined} />
              <div className="space-y-3">
                <label className="space-y-2">
                  <span className="text-sm font-medium">Title</span>
                  <Input value={title} onChange={(event) => setTitle(event.target.value)} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Alt text</span>
                  <Input value={altText} onChange={(event) => setAltText(event.target.value)} />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium">Caption</span>
                  <Textarea value={caption} onChange={(event) => setCaption(event.target.value)} rows={3} />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(event) => setIsPublic(event.target.checked)}
                    className="h-4 w-4 rounded border-muted-foreground"
                  />
                  Public asset
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={handleUpdateMedia} disabled={updateMedia.isPending}>
                    <Save data-icon="inline-start" />
                    {updateMedia.isPending ? "Saving..." : "Save Metadata"}
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => setDeleteTarget(media)} disabled={deleteMedia.isPending}>
                    <Trash2 data-icon="inline-start" />
                    {deleteMedia.isPending ? "Removing..." : "Delete / Archive Asset"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Usage Links</p>
                {usageLinks.length ? (
                  <div className="space-y-2">
                    {usageLinks.map((link) => (
                      <div key={link.id} className="rounded-md border p-3 text-sm">
                        <p className="font-medium">{formatResearchEntityType(link.entity_type)}</p>
                        <p className="text-xs text-muted-foreground">{link.role || "gallery"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                    No usage records were returned for this asset.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete or archive asset?"
        description={`This removes ${deleteTarget ? getMediaLabel(deleteTarget) : "the selected asset"} through the main media service. Existing usage links may stop resolving if the API deletes the file.`}
        confirmLabel="Delete / Archive"
        variant="destructive"
        isLoading={deleteMedia.isPending}
        onConfirm={handleDeleteMedia}
      />
    </>
  );
}

export default function ResearchGalleryPage() {
  const { hasScope } = usePermissions();
  const canManage = ["media.manage", "media.upload", "content.manage", "research:write"].some((scope) => hasScope(scope));
  const guidance = getResearchGuidance("Research Content");

  return (
    <EditableServiceResourcePage<GalleryRecord, Record<string, any>>
      title="Research Gallery"
      description="Manage research-scoped media folders used by the main media service."
      backHref="/research/content"
      queryKey={["research", "content", "gallery"]}
      summarySlot={
        <div className="space-y-4">
          <ContentWorkspaceHeader />
          <GalleryAssetWorkflow />
        </div>
      }
      listFilters={galleryFilters}
      recordColumns={galleryColumns}
      editorMode="sheet"
      tableLayout="compact"
      actionsInMenuOnly
      defaultSort={{ label: "Recently updated", sort: "updated_at", order: "desc" }}
      sortOptions={[
        { label: "Recently updated", sort: "updated_at", order: "desc" },
        { label: "Folder name A-Z", sort: "name", order: "asc" },
      ]}
      toolbarSlot={<ResearchSectionGuide title="Research Content" className="sm:ml-auto" />}
      renderMobileRecord={GalleryMobileRecord}
      fields={withResearchFieldHelp([
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "Slug" },
        { name: "parent_id", label: "Parent Folder", type: "entity", relation: { adapter: "mediaFolder", filters: { scope_type: "research" }, allowClear: true } },
        { name: "description", label: "Description", type: "textarea" },
        { name: "is_public", label: "Public", type: "boolean" },
      ])}
      list={(filters) => mediaApi.listFolders({ scope_type: "research", fields: "id,name,slug,parent_id,description,is_public,scope_type,scope_id,created_at,updated_at", ...filters })}
      create={(payload) => mediaApi.createFolder({ ...payload, scope_type: "research", scope_id: null } as any)}
      update={(id, payload) => mediaApi.updateFolder(id, { ...payload, scope_type: "research", scope_id: null } as any)}
      delete={(id) => mediaApi.deleteFolder(id)}
      getRecordTitle={(record) => record.name}
      getRecordMeta={(record) => [record.scope_type, record.is_public ? "public" : "private"].filter(Boolean).join(" · ")}
      emptyMessage="No research gallery folders were returned by the media service."
      emptyState={guidance?.emptyState}
      buildPayload={(values) => ({ is_public: true, ...values, scope_type: "research", scope_id: null })}
      getRecordDetailHref={(record) => `/research/content/gallery/${record.id}`}
      canCreate={canManage}
      canEdit={canManage}
      canDelete={canManage}
      resourceKey="content"
    />
  );
}
