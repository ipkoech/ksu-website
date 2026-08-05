import { mainApi } from "../client";

/**
 * Corporate Communication portal settings + engagement stats client.
 *
 * Backed by services/main `corporate_comm_engagement.py`:
 * - GET/PUT /api/v1/corporate-communication-portal/settings
 * - GET     /api/v1/corporate-communication-portal/settings/team
 * - GET     /api/v1/stats/portal/corporate-communication/engagement
 */

const SETTINGS_PATH = "/api/v1/corporate-communication-portal/settings";
const ENGAGEMENT_PATH =
  "/api/v1/stats/portal/corporate-communication/engagement";

export interface CorporateOfficeChannels {
  email: string | null;
  phone: string | null;
  physical_office: string | null;
  service_hours: string | null;
  escalation_contact: string | null;
}

export interface CorporateSocialLinks {
  facebook: string | null;
  twitter: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
}

export interface CorporateCommSettingsResponse {
  office_channels: CorporateOfficeChannels | null;
  social_links: CorporateSocialLinks | null;
  can_manage: boolean;
}

export interface CorporateCommSettingsUpdate {
  office_channels?: Partial<CorporateOfficeChannels>;
  social_links?: Partial<CorporateSocialLinks>;
}

export interface CorporateCommTeamMember {
  id: string;
  full_name: string;
  email: string;
  last_login_at: string | null;
  roles: string[];
}

export interface CorporateEngagementParams {
  date_from?: string;
  date_to?: string;
  top_limit?: number;
}

export interface CorporateEngagementTopContent {
  entity_type: string | null;
  entity_id: string;
  title: string | null;
  slug: string | null;
  path: string | null;
  views: number;
  visitors: number;
}

export interface CorporateEngagementTrendPoint {
  bucket: string;
  views: number;
  visitors: number;
}

export interface CorporateEngagementPlatformDeliveries {
  platform: string;
  posted: number;
  failed: number;
  pending: number;
  total: number;
}

export interface CorporateEngagementResponse {
  period: { date_from: string; date_to: string };
  website: {
    page_views: number;
    unique_visitors: number;
    views_by_type: { key: string; label: string; views: number }[];
    top_content: CorporateEngagementTopContent[];
    trend: CorporateEngagementTrendPoint[];
  };
  social: {
    totals: { posted: number; failed: number; pending: number; total: number };
    by_platform: CorporateEngagementPlatformDeliveries[];
    /** Always false until platform insights-API adapters exist. */
    social_insights_available: boolean;
    note: string;
  };
  social_insights_available: boolean;
  note: string;
}

export const corporateCommSettingsQueryKeys = {
  settings: ["corporate-communication", "settings"] as const,
  team: ["corporate-communication", "settings", "team"] as const,
  engagement: (params?: CorporateEngagementParams) =>
    ["corporate-communication", "engagement", params ?? {}] as const,
};

export const corporateCommSettingsApi = {
  getSettings: () =>
    mainApi.get<{ data: CorporateCommSettingsResponse }>(SETTINGS_PATH),

  updateSettings: (payload: CorporateCommSettingsUpdate) =>
    mainApi.put<{ data: CorporateCommSettingsResponse }>(
      SETTINGS_PATH,
      payload,
    ),

  listTeam: () =>
    mainApi.get<{ data: { members: CorporateCommTeamMember[] } }>(
      `${SETTINGS_PATH}/team`,
    ),

  engagement: (params?: CorporateEngagementParams) =>
    mainApi.get<{ data: CorporateEngagementResponse }>(
      ENGAGEMENT_PATH,
      params ? { ...params } : undefined,
    ),

  /**
   * Anonymous read of the public corporate-communication settings via the
   * cached public settings route. Returns null when the keys are unseeded.
   */
  publicSocialLinks: async (): Promise<CorporateSocialLinks | null> => {
    const response = await mainApi.get<{
      data: Array<{ key: string; value: unknown }>;
    }>("/api/v1/settings", { category: "corporate_communication" });
    const row = (response.data ?? []).find(
      (setting) => setting.key === "corporate_communication.social_links",
    );
    return row && row.value && typeof row.value === "object"
      ? (row.value as CorporateSocialLinks)
      : null;
  },
};
