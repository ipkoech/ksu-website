import { mainApi } from "../client";
import type {
  SchoolPortalCapabilitiesResponse,
  SchoolPortalContextResponse,
  SchoolPortalDashboardRange,
  SchoolPortalDashboardResponse,
  SchoolPortalProfile,
  SchoolPortalProfileUpdate,
} from "./types";

const BASE_PATH = "/api/v1/school-portal";

export const schoolPortalQueryKeys = {
  bootstrap: ["school-portal", "context"] as const,
  root: (schoolId: string) => ["school-portal", schoolId] as const,
  context: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "context"] as const,
  dashboard: (schoolId: string, range: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "dashboard", range] as const,
  profile: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "profile"] as const,
  team: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "team"] as const,
  departments: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "departments"] as const,
  programmes: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "programmes"] as const,
  publications: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "publications"] as const,
  content: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "content"] as const,
  media: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "media"] as const,
  inquiries: (schoolId: string) =>
    [...schoolPortalQueryKeys.root(schoolId), "inquiries"] as const,
};

export const schoolPortalApi = {
  context: () =>
    mainApi.get<{ data: SchoolPortalContextResponse }>(
      "/api/v1/school-portal/context",
    ),
  capabilities: () =>
    mainApi.get<{ data: SchoolPortalCapabilitiesResponse }>(
      `${BASE_PATH}/capabilities`,
    ),
  dashboard: (range: SchoolPortalDashboardRange) =>
    mainApi.get<{ data: SchoolPortalDashboardResponse }>(
      `${BASE_PATH}/dashboard`,
      { range },
    ),
  profile: {
    get: () =>
      mainApi.get<{ data: SchoolPortalProfile }>(`${BASE_PATH}/profile`),
    update: (data: SchoolPortalProfileUpdate) =>
      mainApi.patch<{ data: SchoolPortalProfile }>(
        `${BASE_PATH}/profile`,
        data,
      ),
    setDean: (personId: string, reassignExisting = false) =>
      mainApi.put<{ data: SchoolPortalProfile }>(`${BASE_PATH}/profile/dean`, {
        person_id: personId,
        reassign_existing: reassignExisting,
      }),
    linkMedia: (
      mediaId: string,
      role: "logo" | "cover" | "brochure" | "gallery",
      displayOrder = 100,
    ) =>
      mainApi.post<{ data: SchoolPortalProfile }>(
        `${BASE_PATH}/profile/media`,
        { media_id: mediaId, role, display_order: displayOrder },
      ),
  },
};
