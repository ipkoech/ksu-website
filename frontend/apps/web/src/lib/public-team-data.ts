import {
  mainApi,
  publicEntityApi,
  type PublicEntityTeam,
} from "@ksu/api-client";

export type { PublicEntityTeam } from "@ksu/api-client";

export type PublicTeamEntityType =
  | "school"
  | "department"
  | "division"
  | "wing"
  | "directorate"
  | "board"
  | "university";

export type PublicTeamPerson = {
  id: string;
  slug?: string | null;
  title?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  photo_id?: string | null;
  photo_url?: string | null;
  academic_rank?: string | null;
  institutional_role?: string | null;
  specialization?: string | null;
  research_interests?: string[] | null;
  office_location?: string | null;
  office_phone?: string | null;
};

export type PublicTeamAssignment = {
  id: string;
  person_id: string;
  entity_type: string;
  entity_id?: string | null;
  role?: string | null;
  role_label?: string | null;
  role_display?: string | null;
  group?: string | null;
  title?: string | null;
  hierarchy_level?: number | null;
  reports_to_id?: string | null;
  is_primary?: boolean;
  is_acting?: boolean;
  is_current?: boolean;
  display_order?: number | null;
  start_date?: string | null;
  end_date?: string | null;
  term_display?: string | null;
};

export type PublicTeamData = {
  entity?: {
    id?: string | null;
    type?: string | null;
    name?: string | null;
    slug?: string | null;
  } | null;
  assignments: PublicTeamAssignment[];
  persons: Record<string, PublicTeamPerson>;
  groups?: Record<string, PublicTeamAssignment[]>;
  hierarchy?: Array<{
    level?: number | null;
    label?: string | null;
    assignment_ids?: string[];
  }>;
  counts?: {
    assignments?: number;
    persons?: number;
    leadership?: number;
  };
};

type PublicTeamResponse = {
  data?: PublicTeamData;
};

export async function getPublicTeam(
  entityType: PublicTeamEntityType,
  entityId?: string | null,
): Promise<PublicTeamData | null> {
  if (!entityId) return null;

  try {
    const response = await mainApi.get<PublicTeamResponse>("/api/v1/public/team", {
      entity_type: entityType,
      entity_id: entityId,
    });

    return response.data ?? null;
  } catch (error) {
    console.error("Failed to load public team:", error);
    return null;
  }
}

export async function getPublicEntityTeam(
  entityType: "school" | "department",
  entityId?: string | null,
): Promise<PublicEntityTeam | null> {
  if (!entityId) return null;

  try {
    const response =
      entityType === "school"
        ? await publicEntityApi.schoolTeam(entityId)
        : await publicEntityApi.departmentTeam(entityId);
    return response.data ?? null;
  } catch (error) {
    console.error(`Failed to load public ${entityType} team:`, error);
    return null;
  }
}
