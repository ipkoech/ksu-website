import type { ResearchGenericRecord } from "@ksu/api-client";
import { getResearchApiBaseUrl } from "@ksu/api-client";

export type ResearchDownloadKind = "auto" | "resource" | "guideline";

export function getResearchRecordDownloadHref(
  record: ResearchGenericRecord | Record<string, unknown>,
  kind: ResearchDownloadKind = "auto",
) {
  const resolvedKind = kind === "auto" ? inferDownloadKind(record) : kind;
  if (isPublicRecord(record) && hasBackendDownloadSupport(record)) {
    if (resolvedKind === "resource" && record.id) {
      return getResearchDownloadUrl(`/api/v1/resources/${record.id}/download`);
    }
    if (resolvedKind === "guideline" && record.id) {
      return getResearchDownloadUrl(`/api/v1/guidelines/${record.id}/download`);
    }
  }
  return getResearchRecordDirectFileHref(record);
}

export function getResearchRecordDirectFileHref(record: ResearchGenericRecord | Record<string, unknown>) {
  if (!isPublicRecord(record)) return "";
  return (
    textValue(record.document_url) ||
    textValue(record.download_url) ||
    textValue(record.file_url) ||
    textValue(record.pdf_url) ||
    textValue(record.url) ||
    ""
  );
}

export function hasResearchRecordDownload(record: ResearchGenericRecord | Record<string, unknown>) {
  return Boolean(getResearchRecordDownloadHref(record));
}

export function getResearchDownloadUrl(path: string) {
  const baseUrl = getResearchApiBaseUrl().replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function inferDownloadKind(record: ResearchGenericRecord | Record<string, unknown>): ResearchDownloadKind {
  if (textValue(record.resource_type) || hasValues(record.document_media_ids) || hasValues(record.attachment_media_ids)) {
    return "resource";
  }
  if (textValue(record.guideline_type) || hasValues(record.document_id)) {
    return "guideline";
  }
  return "auto";
}

function hasBackendDownloadSupport(record: ResearchGenericRecord | Record<string, unknown>) {
  return Boolean(
    getResearchRecordDirectFileHref(record) ||
      hasValues(record.document_id) ||
      hasValues(record.document_media_ids) ||
      hasValues(record.attachment_media_ids),
  );
}

function isPublicRecord(record: ResearchGenericRecord | Record<string, unknown>) {
  return record.is_public !== false;
}

function hasValues(value: unknown) {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim().length > 0;
  return Boolean(value);
}

function textValue(value: unknown) {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number") return String(value);
  return "";
}
