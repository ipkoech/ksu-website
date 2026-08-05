import { mainApi } from "../client";

const BASE_PATH = "/api/v1/corporate-communication-portal";

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
};
