"use client";

import * as React from "react";
import { ChevronDown, ChevronUp, File, ImageIcon, Link2, Loader2, Trash2 } from "lucide-react";
import { toast } from "@ksu/ui";
import {
  Badge,
  Button,
  ConfirmDialog,
  ImageRenderer,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@ksu/ui/components";
import {
  useCreateMediaLink,
  useDeleteMediaLink,
  useMediaItem,
  useMediaLinks,
  useUpdateMediaLink,
  type Media,
  type MediaLink,
} from "@ksu/api-client";
import { MediaPicker } from "./media-picker";
import { formatFileSize, getMediaLabel, getMediaUrl, isImageMedia } from "./media-utils";

export type AttachmentRoleOption = {
  value: string;
  label: string;
  description?: string;
  mediaType?: string;
  accept?: string;
};

export type PendingMediaAttachment = {
  media_id: string;
  role: string;
  folder_id?: string | null;
  display_order?: number;
  is_public?: boolean;
  media?: Media | null;
};

type MediaLinkWithMedia = MediaLink & {
  media?: Media | null;
};

const defaultRoles: AttachmentRoleOption[] = [
  { value: "cover", label: "Cover image", mediaType: "image", accept: "image/*" },
  { value: "attachment", label: "Attachment" },
  { value: "document", label: "Document" },
  { value: "gallery", label: "Gallery item", mediaType: "image", accept: "image/*" },
  { value: "logo", label: "Logo", mediaType: "image", accept: "image/*" },
  { value: "video", label: "Video", mediaType: "video", accept: "video/*" },
  { value: "poster", label: "Poster", mediaType: "image", accept: "image/*" },
  { value: "cv", label: "CV", mediaType: "document", accept: ".pdf,.doc,.docx" },
  { value: "brochure", label: "Brochure", mediaType: "document", accept: ".pdf,.doc,.docx" },
];

function roleLabel(roles: AttachmentRoleOption[], role: string) {
  return roles.find((item) => item.value === role)?.label ?? role;
}

function AttachmentPreview({ media }: { media?: Media | null }) {
  const url = getMediaUrl(media);

  return (
    <div className="flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted">
      {url && isImageMedia(media) ? (
        <ImageRenderer src={url} alt={getMediaLabel(media)} className="h-full border-0" imageClassName="h-full w-full" />
      ) : isImageMedia(media) ? (
        <ImageIcon className="h-5 w-5 text-muted-foreground" />
      ) : (
        <File className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  );
}

function AttachmentRow({
  mediaId,
  media,
  role,
  roles,
  onRemove,
  onRoleChange,
  onVisibilityChange,
  onMoveUp,
  onMoveDown,
  isPublic,
  canMoveUp,
  canMoveDown,
  disabled,
}: {
  mediaId: string;
  media?: Media | null;
  role: string;
  roles: AttachmentRoleOption[];
  onRemove: () => void;
  onRoleChange?: (role: string) => void;
  onVisibilityChange?: (isPublic: boolean) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isPublic?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  disabled?: boolean;
}) {
  const mediaQuery = useMediaItem(mediaId, { enabled: !media && Boolean(mediaId) });
  const resolvedMedia = media ?? mediaQuery.data?.data ?? null;
  const url = getMediaUrl(resolvedMedia);

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
      <AttachmentPreview media={resolvedMedia} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium">{resolvedMedia ? getMediaLabel(resolvedMedia) : "Loading media..."}</p>
          {onRoleChange ? (
            <Select value={role} disabled={disabled} onValueChange={onRoleChange}>
              <SelectTrigger className="h-7 w-[138px] text-xs">
                <SelectValue aria-label="Attachment role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {roles.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <Badge variant="secondary">{roleLabel(roles, role)}</Badge>
          )}
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {resolvedMedia ? [resolvedMedia.mime_type, formatFileSize(resolvedMedia.file_size ?? resolvedMedia.size)].filter(Boolean).join(" · ") : mediaId}
        </p>
      </div>
      {url ? (
        <Button type="button" variant="outline" size="sm" asChild>
          <a href={url} target="_blank" rel="noreferrer">
            <Link2 data-icon="inline-start" />
            View
          </a>
        </Button>
      ) : null}
      {onVisibilityChange ? (
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch
            checked={isPublic ?? true}
            disabled={disabled}
            onCheckedChange={onVisibilityChange}
            aria-label="Attachment visibility"
          />
          Public
        </label>
      ) : null}
      {onMoveUp && onMoveDown ? (
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" disabled={disabled || !canMoveUp} onClick={onMoveUp} aria-label="Move attachment up">
            <ChevronUp data-icon />
          </Button>
          <Button type="button" variant="ghost" size="icon" disabled={disabled || !canMoveDown} onClick={onMoveDown} aria-label="Move attachment down">
            <ChevronDown data-icon />
          </Button>
        </div>
      ) : null}
      <Button type="button" variant="ghost" size="icon" disabled={disabled} onClick={onRemove} aria-label="Remove attachment">
        <Trash2 data-icon />
      </Button>
    </div>
  );
}

export function useCommitPendingAttachments() {
  const createMediaLink = useCreateMediaLink();

  return async ({
    entityType,
    entityId,
    attachments,
  }: {
    entityType: string;
    entityId: string;
    attachments: PendingMediaAttachment[];
  }) => {
    for (const attachment of attachments) {
      await createMediaLink.mutateAsync({
        media_id: attachment.media_id,
        entity_type: entityType,
        entity_id: entityId,
        role: attachment.role,
        folder_id: attachment.folder_id ?? null,
        display_order: attachment.display_order ?? 100,
        is_public: attachment.is_public ?? true,
      });
    }
  };
}

export type AttachmentManagerProps = {
  entityType: string;
  entityId?: string | null;
  roles?: AttachmentRoleOption[];
  defaultRole?: string;
  title?: string;
  description?: string;
  pendingAttachments?: PendingMediaAttachment[];
  onPendingAttachmentsChange?: (attachments: PendingMediaAttachment[]) => void;
  disabled?: boolean;
  isPublic?: boolean;
  allowVisibilityChange?: boolean;
  uploadEntityType?: string;
  uploadEntityId?: string | null;
};

export function AttachmentManager({
  entityType,
  entityId,
  roles = defaultRoles,
  defaultRole = roles[0]?.value ?? "attachment",
  title = "Attachments",
  description = "Upload or attach files without entering media IDs.",
  pendingAttachments = [],
  onPendingAttachmentsChange,
  disabled,
  isPublic = true,
  allowVisibilityChange = true,
  uploadEntityType,
  uploadEntityId,
}: AttachmentManagerProps) {
  const [role, setRole] = React.useState(defaultRole);
  const [removeTarget, setRemoveTarget] = React.useState<null | { id: string; label: string; pending: boolean }>(null);
  const createMediaLink = useCreateMediaLink();
  const deleteMediaLink = useDeleteMediaLink();
  const updateMediaLink = useUpdateMediaLink();
  const selectedRole = roles.find((item) => item.value === role) ?? roles[0] ?? defaultRoles[0];
  const canPersist = Boolean(entityType && entityId);

  const linksQuery = useMediaLinks(
    {
      entity_type: entityType,
      entity_id: entityId || "",
      fields: "id,media_id,entity_type,entity_id,role,folder_id,display_order,is_public,media",
      include: "media",
    },
    { enabled: canPersist },
  );
  const persistedLinks = (linksQuery.data?.data ?? []) as MediaLinkWithMedia[];

  const addPending = (mediaId: string, media?: Media | null) => {
    if (pendingAttachments.some((item) => item.media_id === mediaId && item.role === selectedRole.value)) {
      toast.info("That attachment is already queued.");
      return;
    }
    onPendingAttachmentsChange?.([
      ...pendingAttachments,
      {
        media_id: mediaId,
        role: selectedRole.value,
        is_public: isPublic,
        display_order: 100,
        media,
      },
    ]);
    toast.success("Attachment queued");
  };

  const addPersisted = async (mediaId: string) => {
    if (!entityId) return;
    if (persistedLinks.some((item) => item.media_id === mediaId && item.role === selectedRole.value)) {
      toast.info("That attachment is already linked.");
      return;
    }

    await createMediaLink.mutateAsync({
      media_id: mediaId,
      entity_type: entityType,
      entity_id: entityId,
      role: selectedRole.value,
      display_order: 100,
      is_public: isPublic,
    });
    toast.success("Attachment linked");
  };

  const handleSelectMedia = async (mediaId: string, media?: Media | null, source?: "upload" | "selection") => {
    if (!mediaId) return;
    if (canPersist) {
      if (source === "upload") {
        const result = await linksQuery.refetch();
        const nextLinks = (result.data?.data ?? []) as MediaLinkWithMedia[];
        const alreadyLinked = nextLinks.some(
          (item) => item.media_id === mediaId && item.role === selectedRole.value,
        );
        if (!alreadyLinked) {
          await addPersisted(mediaId);
          await linksQuery.refetch();
        }
        toast.success("Attachment uploaded and linked");
        return;
      }
      await addPersisted(mediaId);
      return;
    }
    addPending(mediaId, media);
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    if (removeTarget.pending) {
      onPendingAttachmentsChange?.(pendingAttachments.filter((item) => item.media_id !== removeTarget.id));
      setRemoveTarget(null);
      return;
    }

    await deleteMediaLink.mutateAsync(removeTarget.id);
    setRemoveTarget(null);
  };

  const updatePersistedLink = async (link: MediaLinkWithMedia, data: Partial<Pick<MediaLink, "role" | "is_public" | "display_order">>) => {
    await updateMediaLink.mutateAsync({ id: link.id, data });
    await linksQuery.refetch();
  };

  const movePersistedLink = async (link: MediaLinkWithMedia, direction: -1 | 1) => {
    const index = persistedLinks.findIndex((item) => item.id === link.id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= persistedLinks.length) return;
    const next = [...persistedLinks];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    await Promise.all([
      updateMediaLink.mutateAsync({ id: next[index].id, data: { display_order: index } }),
      updateMediaLink.mutateAsync({ id: next[nextIndex].id, data: { display_order: nextIndex } }),
    ]);
    await linksQuery.refetch();
  };

  const updatePendingAttachment = (mediaId: string, role: string, changes: Partial<PendingMediaAttachment>) => {
    onPendingAttachmentsChange?.(
      pendingAttachments.map((attachment) =>
        attachment.media_id === mediaId && attachment.role === role ? { ...attachment, ...changes } : attachment,
      ),
    );
  };

  const movePendingAttachment = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= pendingAttachments.length) return;
    const reordered = [...pendingAttachments];
    [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];
    onPendingAttachmentsChange?.(reordered.map((attachment, order) => ({ ...attachment, display_order: order })));
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          {!canPersist ? <p className="mt-1 text-xs text-muted-foreground">Attachments will be linked after the record is saved.</p> : null}
        </div>
        {roles.length > 1 ? (
          <div className="w-full sm:w-56">
            <Select value={role} disabled={disabled} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Attachment role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {roles.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>

      <MediaPicker
        value=""
        onChange={(mediaId, media, source) => void handleSelectMedia(media?.id ?? mediaId, media, source)}
        mediaType={selectedRole.mediaType}
        accept={selectedRole.accept}
        label={selectedRole.label}
        helperText={selectedRole.description ?? "Choose an existing media item or upload a new attachment."}
        allowClear={false}
        disabled={disabled || createMediaLink.isPending}
        isPublic={isPublic}
        uploadEntityType={canPersist ? entityType : uploadEntityType}
        uploadEntityId={canPersist ? entityId ?? undefined : uploadEntityId ?? undefined}
        uploadRole={selectedRole.value}
      />

      <div className="space-y-3">
        {linksQuery.isLoading ? (
          <div className="flex items-center gap-2 rounded-lg border p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading linked attachments...
          </div>
        ) : null}

        {persistedLinks.map((link, index) => (
          <AttachmentRow
            key={link.id}
            mediaId={link.media_id}
            media={link.media}
            role={link.role}
            roles={roles}
            isPublic={link.is_public}
            canMoveUp={index > 0}
            canMoveDown={index < persistedLinks.length - 1}
            disabled={disabled || deleteMediaLink.isPending || updateMediaLink.isPending}
            onRoleChange={(nextRole) => void updatePersistedLink(link, { role: nextRole })}
            onVisibilityChange={allowVisibilityChange ? (nextPublic) => void updatePersistedLink(link, { is_public: nextPublic }) : undefined}
            onMoveUp={() => void movePersistedLink(link, -1)}
            onMoveDown={() => void movePersistedLink(link, 1)}
            onRemove={() => setRemoveTarget({ id: link.id, label: link.media ? getMediaLabel(link.media) : "attachment", pending: false })}
          />
        ))}

        {pendingAttachments.map((attachment, index) => (
          <AttachmentRow
            key={`${attachment.media_id}-${attachment.role}`}
            mediaId={attachment.media_id}
            media={attachment.media}
            role={attachment.role}
            roles={roles}
            isPublic={attachment.is_public}
            canMoveUp={index > 0}
            canMoveDown={index < pendingAttachments.length - 1}
            disabled={disabled}
            onRoleChange={(nextRole) => updatePendingAttachment(attachment.media_id, attachment.role, { role: nextRole })}
            onVisibilityChange={allowVisibilityChange ? (nextPublic) => updatePendingAttachment(attachment.media_id, attachment.role, { is_public: nextPublic }) : undefined}
            onMoveUp={() => movePendingAttachment(index, -1)}
            onMoveDown={() => movePendingAttachment(index, 1)}
            onRemove={() => setRemoveTarget({ id: attachment.media_id, label: attachment.media ? getMediaLabel(attachment.media) : "queued attachment", pending: true })}
          />
        ))}

        {!linksQuery.isLoading && !persistedLinks.length && !pendingAttachments.length ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <File className="mx-auto h-7 w-7 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">No attachments</p>
            <p className="mt-1 text-xs text-muted-foreground">Attach files using the picker above.</p>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove attachment?"
        description={`This removes ${removeTarget?.label ?? "the attachment"} from this record. The media file remains in the library.`}
        confirmLabel="Remove"
        variant="destructive"
        isLoading={deleteMediaLink.isPending}
        onConfirm={confirmRemove}
      />
    </div>
  );
}
