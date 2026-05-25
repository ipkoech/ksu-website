"use client";

import { resolveMainMediaUrl, useUploadMedia } from "@ksu/api-client";

export function useRichTextImageUpload() {
  const uploadMedia = useUploadMedia();

  return async (file: File) => {
    const response = await uploadMedia.mutateAsync({ file, isPublic: true });
    const media = response.data;
    return resolveMainMediaUrl(media.cdn_url || media.public_url || media.url || media.thumbnail_url) || "";
  };
}
