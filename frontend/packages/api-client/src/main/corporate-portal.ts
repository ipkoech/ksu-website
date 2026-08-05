import { mainApi } from "../client";
import { getStoredAccessToken } from "../auth-tokens";
import { getMainApiBaseUrl } from "../service-urls";
import type { SchoolUploadBatch, SchoolUploadBatchFile } from "./types";

const BASE_PATH = "/api/v1/corporate-communication-portal";

// #region upload-batch
export type CorporateUploadBatchFile = SchoolUploadBatchFile;

export interface CorporateUploadBatch
  extends Omit<SchoolUploadBatch, "school_id" | "files"> {
  school_id: string | null;
  portal: string;
  files: CorporateUploadBatchFile[];
}

async function corporatePortalUploadFiles<T>(
  path: string,
  files: File[],
  fields: Record<string, string> = {},
): Promise<T> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
  const token = getStoredAccessToken();
  const response = await fetch(`${getMainApiBaseUrl()}${path}`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || "Upload failed");
  }
  return response.json() as Promise<T>;
}
// #endregion upload-batch

export type CorporatePortalNavigationKey =
  | "dashboard"
  | "review-queue"
  | "records"
  | "website-content"
  | "newsroom"
  | "media"
  | "engagement"
  | "student-life"
  | "oversight";

export interface CorporatePortalContextResponse {
  capabilities: Record<string, boolean>;
  allowed_navigation: CorporatePortalNavigationKey[];
}

export const corporatePortalQueryKeys = {
  bootstrap: ["corporate-portal", "context"] as const,
};

export const corporatePortalApi = {
  context: () =>
    mainApi.get<{ data: CorporatePortalContextResponse }>(
      `${BASE_PATH}/context`,
    ),
  // #region upload-batch
  media: {
    createBatch: (
      files: File[],
      options?: { folderId?: string; isPublic?: boolean },
    ) =>
      corporatePortalUploadFiles<{ data: CorporateUploadBatch }>(
        `${BASE_PATH}/media/batches`,
        files,
        {
          ...(options?.folderId ? { folder_id: options.folderId } : {}),
          ...(options?.isPublic !== undefined
            ? { is_public: String(options.isPublic) }
            : {}),
        },
      ),
    getBatch: (batchId: string) =>
      mainApi.get<{ data: CorporateUploadBatch }>(
        `${BASE_PATH}/media/batches/${batchId}`,
      ),
    retryFile: (batchId: string, fileId: string) =>
      mainApi.post<{ data: CorporateUploadBatchFile }>(
        `${BASE_PATH}/media/batches/${batchId}/files/${fileId}/retry`,
      ),
  },
  // #endregion upload-batch
};
