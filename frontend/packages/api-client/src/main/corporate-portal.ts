import { mainApi } from "../client";
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
  return mainApi.post<T>(path, formData, { timeoutMs: 120000 });
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
  | "oversight"
  | "settings";

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
