"use client";

import { resolveMainMediaUrl, useUploadMedia } from "@ksu/api-client";

interface RichTextAttachmentUploadOptions {
  entityType?: string;
  entityId?: string | null;
  role?: string;
}

export function useRichTextAttachmentUpload(options: RichTextAttachmentUploadOptions = {}) {
  const uploadMedia = useUploadMedia();

  return async (file: File) => {
    const shouldLinkToEntity = Boolean(options.entityType && options.entityId);
    const response = await uploadMedia.mutateAsync({
      file,
      isPublic: true,
      entityType: shouldLinkToEntity ? options.entityType : undefined,
      entityId: shouldLinkToEntity ? options.entityId ?? undefined : undefined,
      role: options.role ?? "rich-text-attachment",
    });
    const media = response.data;
    return {
      url: resolveMainMediaUrl(media.cdn_url || media.public_url || media.url || media.thumbnail_url) || "",
      label: media.title || media.original_filename || media.filename || file.name,
    };
  };
}
