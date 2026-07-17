import { mainApi } from "../client";
import type {
  SchoolPortalCapabilitiesResponse,
  SchoolPortalContextResponse,
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
};
