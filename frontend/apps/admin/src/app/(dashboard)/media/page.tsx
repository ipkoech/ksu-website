"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Copy, File, FileText, Folder, Image as ImageIcon, Link2, MoreHorizontal, Pencil, Plus, Trash2, UploadCloud } from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  ImageRenderer,
  Input,
  JsonObjectEditor,
  Label,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@ksu/ui/components";
import {
  useCreateMediaFolder,
  useCreateMediaLink,
  useDeleteMedia,
  useDeleteMediaFolder,
  useDeleteMediaLink,
  useMedia,
  useMediaFolders,
  useMediaItem,
  useUpdateMedia,
  useUpdateMediaFolder,
  useUploadMedia,
  type Media,
  type MediaFolder,
  type MediaFolderCreatePayload,
  type MediaFolderUpdatePayload,
  type MediaLink,
  type MediaUpdatePayload,
} from "@ksu/api-client";
import { DataTable } from "@/components/data-table/data-table";
import { MediaFolderPicker, MainScopePicker } from "@/components/relationships";
import { PageHeader } from "@/components/shared/page-header";
import { PageTransition } from "@/lib/animations";
import { useDeleteConfirm } from "@/hooks/use-delete-confirm";
import { usePermissions } from "@/hooks/use-permissions";
import { formatFileSize, getMediaLabel, getMediaUrl, isImageMedia } from "@/components/media";

type MediaFilter = "all" | "image" | "document" | "video" | "audio" | "file";
type FolderDialogState = { mode: "create" | "edit"; folder?: MediaFolder | null } | null;

type FolderFormState = {
  name: string;
  slug: string;
  parent_id: string;
  description: string;
  is_public: boolean;
  scope_type: string;
  scope_id: string;
};

type UploadFormState = {
  file: File | null;
  folder_id: string;
  is_public: boolean;
  entity_type: string;
  entity_id: string;
  role: string;
};

type MediaFormState = {
  folder_id: string;
  title: string;
  alt_text: string;
  description: string;
  caption: string;
  tags: string;
  credit: string;
  media_type: string;
  thumbnail_url: string;
  is_public: boolean;
  metadata: Record<string, unknown>;
};

type LinkFormState = {
  entity_type: string;
  entity_id: string;
  role: string;
  folder_id: string;
  display_order: number;
  is_public: boolean;
};

const mediaListFields = [
  "id",
  "filename",
  "original_filename",
  "mime_type",
  "file_size",
  "storage_path",
  "public_url",
  "cdn_url",
  "title",
  "alt_text",
  "caption",
  "credit",
  "media_type",
  "thumbnail_url",
  "folder_id",
  "uploaded_by_id",
  "is_public",
  "is_processed",
  "created_at",
].join(",");

const mediaDetailFields = [
  mediaListFields,
  "description",
  "tags",
  "width",
  "height",
  "duration",
  "thumbnails",
  "metadata",
  "links",
].join(",");

const folderFields = "id,name,slug,parent_id,description,is_public,scope_type,scope_id,created_at,updated_at";

const emptyFolderForm: FolderFormState = {
  name: "",
  slug: "",
  parent_id: "",
  description: "",
  is_public: false,
  scope_type: "",
  scope_id: "",
};

const emptyUploadForm: UploadFormState = {
  file: null,
  folder_id: "",
  is_public: false,
  entity_type: "",
  entity_id: "",
  role: "attachment",
};

const emptyLinkForm: LinkFormState = {
  entity_type: "",
  entity_id: "",
  role: "attachment",
  folder_id: "",
  display_order: 100,
  is_public: true,
};

const mediaTypeLabels: Record<string, string> = {
  image: "Image",
  document: "Document",
  video: "Video",
  audio: "Audio",
  file: "File",
};

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function emptyToNull(value?: string | null) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : null;
}

function normalizeComparable(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value) || typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string") return value.trim();
  return value;
}

function valuesEqual(left: unknown, right: unknown) {
  return normalizeComparable(left) === normalizeComparable(right);
}

function parseTags(value: string) {
  const tags = value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return tags.length ? tags : null;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

function getFileIcon(media: Media) {
  if (media.mime_type?.startsWith("image/")) return ImageIcon;
  if (media.mime_type?.startsWith("text/") || media.media_type === "document") return FileText;
  return File;
}

function mediaTypeLabel(value?: string | null, mimeType?: string | null) {
  const type = value || mimeType?.split("/")[0] || "file";
  return mediaTypeLabels[type] ?? type.replace(/_/g, " ");
}

function folderFormFromRecord(folder?: MediaFolder | null): FolderFormState {
  if (!folder) return emptyFolderForm;
  return {
    name: folder.name ?? "",
    slug: folder.slug ?? "",
    parent_id: folder.parent_id ?? "",
    description: folder.description ?? "",
    is_public: folder.is_public,
    scope_type: folder.scope_type ?? "",
    scope_id: folder.scope_id ?? "",
  };
}

function mediaFormFromRecord(media?: Media | null): MediaFormState {
  return {
    folder_id: media?.folder_id ?? "",
    title: media?.title ?? "",
    alt_text: media?.alt_text ?? "",
    description: media?.description ?? "",
    caption: media?.caption ?? "",
    tags: media?.tags?.join(", ") ?? "",
    credit: media?.credit ?? "",
    media_type: media?.media_type ?? "file",
    thumbnail_url: media?.thumbnail_url ?? "",
    is_public: Boolean(media?.is_public),
    metadata: media?.metadata ?? {},
  };
}

function buildFolderPayload(form: FolderFormState): MediaFolderCreatePayload {
  const scopeType = emptyToNull(form.scope_type);
  return {
    name: form.name.trim(),
    slug: form.slug.trim() || slugify(form.name),
    parent_id: emptyToNull(form.parent_id),
    description: emptyToNull(form.description),
    is_public: form.is_public,
    scope_type: scopeType,
    scope_id: scopeType ? emptyToNull(form.scope_id) : null,
  };
}

function buildMediaPayload(form: MediaFormState): MediaUpdatePayload {
  return {
    folder_id: emptyToNull(form.folder_id),
    title: emptyToNull(form.title),
    alt_text: emptyToNull(form.alt_text),
    description: emptyToNull(form.description),
    caption: emptyToNull(form.caption),
    tags: parseTags(form.tags),
    credit: emptyToNull(form.credit),
    media_type: emptyToNull(form.media_type),
    thumbnail_url: emptyToNull(form.thumbnail_url),
    is_public: form.is_public,
    metadata: Object.keys(form.metadata ?? {}).length ? form.metadata : null,
  };
}

function changedMediaPayload(payload: MediaUpdatePayload, current: Media): MediaUpdatePayload {
  const patch: MediaUpdatePayload = {};
  for (const key of Object.keys(payload) as Array<keyof MediaUpdatePayload>) {
    const value = payload[key];
    const currentValue = key === "metadata" ? current.metadata : current[key as keyof Media];
    if (!valuesEqual(value, currentValue)) {
      (patch as Record<string, unknown>)[key] = value;
    }
  }
  return patch;
}

function changedFolderPayload(payload: MediaFolderCreatePayload, current: MediaFolder): MediaFolderUpdatePayload {
  const patch: MediaFolderUpdatePayload = {};
  for (const key of Object.keys(payload) as Array<keyof MediaFolderCreatePayload>) {
    const value = payload[key];
    const currentValue = current[key as keyof MediaFolder];
    if (!valuesEqual(value, currentValue)) {
      (patch as Record<string, unknown>)[key] = value;
    }
  }
  return patch;
}

function MediaPreview({ media, className = "h-12 w-14" }: { media: Media; className?: string }) {
  const Icon = getFileIcon(media);
  const url = getMediaUrl(media);

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted ${className}`}>
      {url && isImageMedia(media) ? (
        <ImageRenderer src={url} alt={getMediaLabel(media)} className="h-full border-0" imageClassName="h-full w-full" />
      ) : (
        <Icon className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  );
}

function FolderSummary({
  folders,
  selectedFolderId,
  onSelect,
  onEdit,
  onDelete,
  canManage,
}: {
  folders: MediaFolder[];
  selectedFolderId: string;
  onSelect: (folderId: string) => void;
  onEdit: (folder: MediaFolder) => void;
  onDelete: (folder: MediaFolder) => void;
  canManage: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Folders</CardTitle>
        <CardDescription>Root media folders and scoped collections.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <button
          type="button"
          className={`flex w-full items-center justify-between rounded-md border p-3 text-left text-sm transition hover:bg-muted/60 ${selectedFolderId === "" ? "border-primary bg-primary/5" : ""}`}
          onClick={() => onSelect("")}
        >
          <span className="font-medium">All media</span>
          <Badge variant="outline">Library</Badge>
        </button>
        {folders.map((folder) => (
          <div key={folder.id} className={`rounded-md border ${selectedFolderId === folder.id ? "border-primary bg-primary/5" : ""}`}>
            <button type="button" className="flex w-full items-start gap-3 p-3 text-left" onClick={() => onSelect(folder.id)}>
              <Folder className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{folder.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {[folder.slug, folder.scope_type, folder.is_public ? "Public" : "Private"].filter(Boolean).join(" · ")}
                </span>
              </span>
            </button>
            {canManage ? (
              <div className="flex justify-end gap-1 border-t px-2 py-1">
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => onEdit(folder)} aria-label="Edit folder">
                  <Pencil data-icon />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" onClick={() => onDelete(folder)} aria-label="Delete folder">
                  <Trash2 data-icon />
                </Button>
              </div>
            ) : null}
          </div>
        ))}
        {!folders.length ? <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No root folders yet.</p> : null}
      </CardContent>
    </Card>
  );
}

function getMediaColumns({
  onEdit,
  onDelete,
  canDelete,
}: {
  onEdit: (media: Media) => void;
  onDelete: (media: Media) => void;
  canDelete: boolean;
}): ColumnDef<Media>[] {
  return [
    {
      accessorKey: "filename",
      header: "File",
      cell: ({ row }) => {
        const media = row.original;
        return (
          <div className="flex min-w-0 items-center gap-3">
            <MediaPreview media={media} />
            <div className="min-w-0">
              <p className="truncate font-medium">{getMediaLabel(media)}</p>
              <p className="truncate text-xs text-muted-foreground">{media.original_filename || media.filename}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "media_type",
      header: "Type",
      cell: ({ row }) => <Badge variant="outline">{mediaTypeLabel(row.original.media_type, row.original.mime_type)}</Badge>,
    },
    {
      accessorKey: "file_size",
      header: "Size",
      cell: ({ row }) => formatFileSize(row.original.file_size ?? row.original.size),
    },
    {
      accessorKey: "alt_text",
      header: "Alt / Caption",
      cell: ({ row }) => (
        <span className="line-clamp-1 max-w-[260px] text-sm text-muted-foreground">
          {row.original.alt_text || row.original.caption || "-"}
        </span>
      ),
    },
    {
      accessorKey: "is_public",
      header: "Visibility",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Badge variant={row.original.is_public ? "default" : "secondary"}>{row.original.is_public ? "Public" : "Private"}</Badge>
          {row.original.is_processed ? <Badge variant="outline">Processed</Badge> : null}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Uploaded",
      cell: ({ row }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const media = row.original;
        const url = getMediaUrl(media);
        return (
          <DropdownActions
            url={url}
            canDelete={canDelete}
            onEdit={() => onEdit(media)}
            onDelete={() => onDelete(media)}
          />
        );
      },
    },
  ];
}

function DropdownActions({
  url,
  canDelete,
  onEdit,
  onDelete,
}: {
  url: string | null;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal data-icon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onEdit}>Edit details</DropdownMenuItem>
          {url ? (
            <>
              <DropdownMenuItem onClick={() => window.open(url, "_blank")}>View file</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(url);
                  toast.success("Media URL copied");
                }}
              >
                Copy URL
              </DropdownMenuItem>
            </>
          ) : null}
          {canDelete ? (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                Delete
              </DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function UploadDialog({
  open,
  onOpenChange,
  onUploaded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: () => void;
}) {
  const uploadMedia = useUploadMedia();
  const [form, setForm] = React.useState<UploadFormState>(emptyUploadForm);

  React.useEffect(() => {
    if (open) setForm(emptyUploadForm);
  }, [open]);

  const upload = async () => {
    if (!form.file) {
      toast.error("Choose a file to upload");
      return;
    }
    if (form.entity_type && !form.entity_id) {
      toast.error("Select the related record for entity-specific storage");
      return;
    }

    await uploadMedia.mutateAsync({
      file: form.file,
      folderId: form.folder_id || undefined,
      isPublic: form.is_public,
      entityType: form.entity_type || undefined,
      entityId: form.entity_id || undefined,
      role: form.role || undefined,
    });
    toast.success("Media uploaded");
    onUploaded();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Upload media</DialogTitle>
          <DialogDescription>Upload into a folder or attach the storage path to a selected university record.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="rounded-lg border p-4">
            <Label htmlFor="media-file">File</Label>
            <Input
              id="media-file"
              type="file"
              className="mt-2"
              onChange={(event) => setForm((current) => ({ ...current, file: event.target.files?.[0] ?? null }))}
            />
            {form.file ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {form.file.name} · {formatFileSize(form.file.size)}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MediaFolderPicker
              value={form.folder_id}
              onChange={(value) => setForm((current) => ({ ...current, folder_id: value }))}
              label="Library folder"
              placeholder="Select folder"
            />
            <div className="space-y-2">
              <Label>Upload role</Label>
              <Input value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} placeholder="cover-image, attachment, gallery" />
            </div>
          </div>

          <MainScopePicker
            label="Entity-specific storage"
            description="Optional. When selected, the backend stores the file under the chosen entity and role."
            typeValue={form.entity_type}
            idValue={form.entity_id}
            onChange={({ type, id }) => setForm((current) => ({ ...current, entity_type: type, entity_id: id }))}
            recordPlaceholder="Search and select related record"
          />

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="cursor-pointer">Public file</Label>
              <p className="text-xs text-muted-foreground">Private files remain visible only to authorized users.</p>
            </div>
            <Switch checked={form.is_public} onCheckedChange={(value) => setForm((current) => ({ ...current, is_public: value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="button" disabled={uploadMedia.isPending} onClick={() => void upload()}>
            {uploadMedia.isPending ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FolderDialog({
  state,
  onOpenChange,
  onSaved,
}: {
  state: FolderDialogState;
  onOpenChange: (state: FolderDialogState) => void;
  onSaved: () => void;
}) {
  const createFolder = useCreateMediaFolder();
  const updateFolder = useUpdateMediaFolder();
  const open = Boolean(state);
  const editingFolder = state?.folder ?? null;
  const [form, setForm] = React.useState<FolderFormState>(emptyFolderForm);

  React.useEffect(() => {
    if (state) setForm(folderFormFromRecord(state.folder));
  }, [state]);

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Folder name is required");
      return;
    }
    const payload = buildFolderPayload(form);
    if (state?.mode === "edit" && editingFolder) {
      const patch = changedFolderPayload(payload, editingFolder);
      if (!Object.keys(patch).length) {
        toast.info("No folder changes to save");
        return;
      }
      await updateFolder.mutateAsync({ id: editingFolder.id, data: patch });
      toast.success("Folder updated");
    } else {
      await createFolder.mutateAsync(payload);
      toast.success("Folder created");
    }
    onSaved();
    onOpenChange(null);
  };

  const isSaving = createFolder.isPending || updateFolder.isPending;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onOpenChange(null)}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{state?.mode === "edit" ? "Edit folder" : "Create folder"}</DialogTitle>
          <DialogDescription>Folders can be public or scoped to a real university record.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="School cover images" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.slug} onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))} placeholder="school-cover-images" />
            </div>
          </div>

          <MediaFolderPicker
            value={form.parent_id}
            onChange={(value) => setForm((current) => ({ ...current, parent_id: value }))}
            label="Parent folder"
            placeholder="Select parent folder"
          />

          <MainScopePicker
            label="Folder scope"
            description="Optional. Scoped folders are visible to users assigned to that entity."
            typeValue={form.scope_type}
            idValue={form.scope_id}
            onChange={({ type, id }) => setForm((current) => ({ ...current, scope_type: type, scope_id: id }))}
            recordPlaceholder="Search and select scope record"
          />

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="What belongs in this folder" />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="cursor-pointer">Public folder</Label>
              <p className="text-xs text-muted-foreground">Public folders can be browsed by all authenticated media users.</p>
            </div>
            <Switch checked={form.is_public} onCheckedChange={(value) => setForm((current) => ({ ...current, is_public: value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(null)}>Cancel</Button>
          <Button type="button" disabled={isSaving} onClick={() => void save()}>{isSaving ? "Saving..." : "Save folder"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MediaDetailSheet({
  media,
  open,
  onOpenChange,
  onSaved,
  canManage,
}: {
  media: Media | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  canManage: boolean;
}) {
  const mediaId = media?.id ?? "";
  const mediaQuery = useMediaItem(mediaId, {
    enabled: open && Boolean(mediaId),
    fields: mediaDetailFields,
    include: "folder:id,name,slug;links:id,media_id,entity_type,entity_id,role,folder_id,display_order,is_public;links.folder:id,name,slug",
  });
  const updateMedia = useUpdateMedia();
  const createLink = useCreateMediaLink();
  const deleteLink = useDeleteMediaLink();
  const detail = mediaQuery.data?.data ?? media;
  const [form, setForm] = React.useState<MediaFormState>(mediaFormFromRecord(media));
  const [linkForm, setLinkForm] = React.useState<LinkFormState>(emptyLinkForm);
  const [removeLink, setRemoveLink] = React.useState<MediaLink | null>(null);

  React.useEffect(() => {
    if (open) {
      setForm(mediaFormFromRecord(detail));
      setLinkForm(emptyLinkForm);
    }
  }, [detail, open]);

  const save = async () => {
    if (!detail) return;
    const payload = changedMediaPayload(buildMediaPayload(form), detail);
    if (!Object.keys(payload).length) {
      toast.info("No media changes to save");
      return;
    }
    await updateMedia.mutateAsync({ id: detail.id, data: payload });
    toast.success("Media updated");
    await mediaQuery.refetch();
    onSaved();
  };

  const addLink = async () => {
    if (!detail) return;
    if (!linkForm.entity_type || !linkForm.entity_id) {
      toast.error("Select the record to attach this media to");
      return;
    }
    await createLink.mutateAsync({
      media_id: detail.id,
      entity_type: linkForm.entity_type,
      entity_id: linkForm.entity_id,
      role: linkForm.role || "attachment",
      folder_id: emptyToNull(linkForm.folder_id),
      display_order: linkForm.display_order,
      is_public: linkForm.is_public,
    });
    toast.success("Media linked");
    setLinkForm(emptyLinkForm);
    await mediaQuery.refetch();
  };

  const confirmRemoveLink = async () => {
    if (!removeLink) return;
    await deleteLink.mutateAsync(removeLink.id);
    setRemoveLink(null);
    toast.success("Media link removed");
    await mediaQuery.refetch();
  };

  const url = detail ? getMediaUrl(detail) : null;
  const links = detail?.links ?? [];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-3xl">
          <SheetHeader>
            <SheetTitle>{detail ? getMediaLabel(detail) : "Media details"}</SheetTitle>
            <SheetDescription>Edit metadata, folder placement, visibility, and entity attachments.</SheetDescription>
          </SheetHeader>

          {detail ? (
            <div className="flex-1 py-4">
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="links">Links</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                    <MediaPreview media={detail} className="h-36 w-full" />
                    <div className="space-y-2 rounded-lg border p-4 text-sm">
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{mediaTypeLabel(detail.media_type, detail.mime_type)}</Badge>
                        <Badge variant={detail.is_public ? "default" : "secondary"}>{detail.is_public ? "Public" : "Private"}</Badge>
                      </div>
                      <p className="break-words font-medium">{detail.original_filename || detail.filename}</p>
                      <p className="text-muted-foreground">{[detail.mime_type, formatFileSize(detail.file_size ?? detail.size)].filter(Boolean).join(" · ")}</p>
                      {detail.width && detail.height ? <p className="text-muted-foreground">{detail.width} x {detail.height}px</p> : null}
                      {url ? (
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <a href={url} target="_blank" rel="noreferrer"><Link2 data-icon="inline-start" /> View</a>
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(url);
                              toast.success("Media URL copied");
                            }}
                          >
                            <Copy data-icon="inline-start" />
                            Copy URL
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Media type</Label>
                      <Select value={form.media_type} onValueChange={(value) => setForm((current) => ({ ...current, media_type: value }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="document">Document</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="audio">Audio</SelectItem>
                            <SelectItem value="file">File</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <MediaFolderPicker
                    value={form.folder_id}
                    onChange={(value) => setForm((current) => ({ ...current, folder_id: value }))}
                    label="Folder"
                    placeholder="Select folder"
                  />

                  <div className="space-y-2">
                    <Label>Alt text</Label>
                    <Input value={form.alt_text} onChange={(event) => setForm((current) => ({ ...current, alt_text: event.target.value }))} placeholder="Describe the image for accessibility" />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Caption</Label>
                      <Textarea value={form.caption} onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Credit</Label>
                      <Input value={form.credit} onChange={(event) => setForm((current) => ({ ...current, credit: event.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label>Thumbnail URL</Label>
                      <Input value={form.thumbnail_url} onChange={(event) => setForm((current) => ({ ...current, thumbnail_url: event.target.value }))} placeholder="/uploads/thumbnails/..." />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="hero, cover, senate" />
                  </div>

                  <div className="space-y-2">
                    <Label>Metadata</Label>
                    <JsonObjectEditor value={form.metadata} onChange={(value) => setForm((current) => ({ ...current, metadata: value as Record<string, unknown> }))} allowCustomFields emptyLabel="No metadata added." />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <Label className="cursor-pointer">Public media</Label>
                      <p className="text-xs text-muted-foreground">Controls direct public access and public content reuse.</p>
                    </div>
                    <Switch checked={form.is_public} onCheckedChange={(value) => setForm((current) => ({ ...current, is_public: value }))} />
                  </div>
                </TabsContent>

                <TabsContent value="links" className="space-y-5">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Attach to record</CardTitle>
                      <CardDescription>Link this media to a selected record without entering IDs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <MainScopePicker
                        label="Related record"
                        typeValue={linkForm.entity_type}
                        idValue={linkForm.entity_id}
                        onChange={({ type, id }) => setLinkForm((current) => ({ ...current, entity_type: type, entity_id: id }))}
                        recordPlaceholder="Search and select record"
                      />
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Role</Label>
                          <Input value={linkForm.role} onChange={(event) => setLinkForm((current) => ({ ...current, role: event.target.value }))} placeholder="attachment" />
                        </div>
                        <div className="space-y-2">
                          <Label>Display order</Label>
                          <Input type="number" value={linkForm.display_order} onChange={(event) => setLinkForm((current) => ({ ...current, display_order: Number(event.target.value) }))} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                          <Label className="cursor-pointer">Public link</Label>
                          <Switch checked={linkForm.is_public} onCheckedChange={(value) => setLinkForm((current) => ({ ...current, is_public: value }))} />
                        </div>
                      </div>
                      <MediaFolderPicker
                        value={linkForm.folder_id}
                        onChange={(value) => setLinkForm((current) => ({ ...current, folder_id: value }))}
                        label="Link folder"
                        placeholder="Optional folder"
                      />
                      <Button type="button" disabled={createLink.isPending || !canManage} onClick={() => void addLink()}>
                        <Plus data-icon="inline-start" />
                        Link media
                      </Button>
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    {links.map((link) => (
                      <div key={link.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <div>
                          <p className="text-sm font-medium capitalize">{link.role.replace(/_/g, " ")}</p>
                          <p className="text-xs text-muted-foreground">
                            {[link.entity_type.replace(/_/g, " "), link.folder?.name, link.is_public ? "Public" : "Private"].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                        {canManage ? (
                          <Button type="button" variant="ghost" size="icon" onClick={() => setRemoveLink(link)} aria-label="Remove media link">
                            <Trash2 data-icon />
                          </Button>
                        ) : null}
                      </div>
                    ))}
                    {!links.length ? <p className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">No record links for this media item.</p> : null}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="p-6 text-sm text-muted-foreground">Select a media item to edit.</div>
          )}

          <SheetFooter className="border-t pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            <Button type="button" disabled={updateMedia.isPending || !detail || !canManage} onClick={() => void save()}>
              {updateMedia.isPending ? "Saving..." : "Save changes"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={Boolean(removeLink)}
        onOpenChange={(nextOpen) => !nextOpen && setRemoveLink(null)}
        title="Remove media link?"
        description="This detaches the media from the selected record. The file remains in the media library."
        confirmLabel="Remove link"
        variant="destructive"
        isLoading={deleteLink.isPending}
        onConfirm={confirmRemoveLink}
      />
    </>
  );
}

export default function MediaPage() {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { confirmDelete, dialog } = useDeleteConfirm();
  const [search, setSearch] = React.useState("");
  const [mediaType, setMediaType] = React.useState<MediaFilter>("all");
  const [folderId, setFolderId] = React.useState("");
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [folderDialog, setFolderDialog] = React.useState<FolderDialogState>(null);
  const [selectedMedia, setSelectedMedia] = React.useState<Media | null>(null);
  const [deleteFolderTarget, setDeleteFolderTarget] = React.useState<MediaFolder | null>(null);

  const mediaQuery = useMedia({
    folder_id: folderId || undefined,
    media_type: mediaType === "all" ? undefined : mediaType,
    search: search || undefined,
    per_page: 100,
    fields: mediaListFields,
  });
  const foldersQuery = useMediaFolders({ fields: folderFields });
  const deleteMedia = useDeleteMedia();
  const deleteFolder = useDeleteMediaFolder();
  const rows = mediaQuery.data?.data ?? [];
  const folders = foldersQuery.data?.data ?? [];
  const canManageMedia = canCreate("media") || canEdit("media");

  const refresh = React.useCallback(async () => {
    await Promise.all([mediaQuery.refetch(), foldersQuery.refetch()]);
  }, [foldersQuery, mediaQuery]);

  const handleDeleteMedia = React.useCallback(
    (media: Media) => {
      confirmDelete(getMediaLabel(media), async () => {
        await deleteMedia.mutateAsync(media.id);
        toast.success("Media deleted");
        await mediaQuery.refetch();
      });
    },
    [confirmDelete, deleteMedia, mediaQuery],
  );

  const columns = React.useMemo(
    () => getMediaColumns({
      onEdit: setSelectedMedia,
      onDelete: handleDeleteMedia,
      canDelete: canDelete("media"),
    }),
    [canDelete, handleDeleteMedia],
  );

  const confirmDeleteFolder = async () => {
    if (!deleteFolderTarget) return;
    await deleteFolder.mutateAsync(deleteFolderTarget.id);
    toast.success("Folder deleted");
    if (folderId === deleteFolderTarget.id) setFolderId("");
    setDeleteFolderTarget(null);
    await refresh();
  };

  return (
    <PageTransition>
      <PageHeader
        title="Media"
        description="Manage uploaded files, folders, metadata, and record attachments."
        actions={
          <div className="flex flex-wrap gap-2">
            {canManageMedia ? (
              <Button type="button" variant="outline" onClick={() => setFolderDialog({ mode: "create" })}>
                <Folder data-icon="inline-start" />
                New Folder
              </Button>
            ) : null}
            {canCreate("media") ? (
              <Button type="button" onClick={() => setUploadOpen(true)}>
                <UploadCloud data-icon="inline-start" />
                Upload
              </Button>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <FolderSummary
          folders={folders}
          selectedFolderId={folderId}
          onSelect={setFolderId}
          onEdit={(folder) => setFolderDialog({ mode: "edit", folder })}
          onDelete={setDeleteFolderTarget}
          canManage={canManageMedia}
        />

        <DataTable
          data={rows}
          columns={columns}
          isLoading={mediaQuery.isLoading}
          emptyMessage="No media files found."
          toolbar={
            <div className="grid gap-3 rounded-lg border bg-card p-3 md:grid-cols-[minmax(0,1fr)_180px_260px]">
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, filename, alt text, or type" />
              <Select value={mediaType} onValueChange={(value) => setMediaType(value as MediaFilter)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="file">Files</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <MediaFolderPicker
                value={folderId}
                onChange={setFolderId}
                placeholder="Filter by folder"
                label=""
              />
            </div>
          }
        />
      </div>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        onUploaded={() => void refresh()}
      />

      <FolderDialog
        state={folderDialog}
        onOpenChange={setFolderDialog}
        onSaved={() => void refresh()}
      />

      <MediaDetailSheet
        media={selectedMedia}
        open={Boolean(selectedMedia)}
        onOpenChange={(open) => {
          if (!open) setSelectedMedia(null);
        }}
        onSaved={() => void refresh()}
        canManage={canManageMedia}
      />

      <ConfirmDialog
        open={Boolean(deleteFolderTarget)}
        onOpenChange={(open) => !open && setDeleteFolderTarget(null)}
        title="Delete folder?"
        description={`This deletes ${deleteFolderTarget?.name ?? "the folder"}. Media files remain in the library unless the backend also restricts them.`}
        confirmLabel="Delete folder"
        variant="destructive"
        isLoading={deleteFolder.isPending}
        onConfirm={confirmDeleteFolder}
      />

      {dialog}
    </PageTransition>
  );
}
