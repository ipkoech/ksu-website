import { resolveMainMediaUrl, type Media } from "@ksu/api-client";

export function getMediaUrl(media?: Media | null) {
  if (!media) return null;
  return (
    resolveMainMediaUrl(media.cdn_url) ??
    resolveMainMediaUrl(media.public_url) ??
    resolveMainMediaUrl(media.url) ??
    resolveMainMediaUrl(media.storage_path) ??
    resolveMainMediaUrl(media.thumbnail_url) ??
    null
  );
}

export function getMediaLabel(media?: Media | null) {
  return media?.title || media?.original_filename || media?.filename || "Selected media";
}

export function isImageMedia(media?: Media | null) {
  if (!media) return false;
  return media.media_type === "image" || media.mime_type?.startsWith("image/");
}

export function formatFileSize(size?: number | null) {
  if (!size) return "";
  if (size >= 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  if (size >= 1024) return `${(size / 1024).toFixed(0)} KB`;
  return `${size} B`;
}

export function mediaMatchesSearch(media: Media, search?: string) {
  const term = search?.trim().toLowerCase();
  if (!term) return true;
  return [media.title, media.original_filename, media.filename, media.alt_text, media.caption, media.mime_type, media.media_type]
    .filter(Boolean)
    .some((part) => String(part).toLowerCase().includes(term));
}

export function mediaAcceptsFile(file: File, accept?: string) {
  if (!accept) return true;
  if (accept === "image/*") return file.type.startsWith("image/");
  const accepted = accept.split(",").map((item) => item.trim()).filter(Boolean);
  if (!accepted.length) return true;
  return accepted.some((item) => {
    if (item.endsWith("/*")) return file.type.startsWith(item.slice(0, -1));
    if (item.startsWith(".")) return file.name.toLowerCase().endsWith(item.toLowerCase());
    return file.type === item;
  });
}
