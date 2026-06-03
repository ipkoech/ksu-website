import { mainApi } from "@ksu/api-client";
import type { PublicTeamAssignment } from "@/lib/public-team-data";

export type PublicPersonProfile = {
  id: string;
  slug?: string | null;
  title?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  alternative_email?: string | null;
  alternative_phone?: string | null;
  photo_id?: string | null;
  photo_url?: string | null;
  bio?: string | null;
  full_bio?: string | null;
  qualifications?: Array<Record<string, unknown>> | null;
  education_background?: Array<Record<string, unknown>> | null;
  professional_memberships?: Array<Record<string, unknown>> | null;
  awards_honors?: Array<Record<string, unknown>> | null;
  department_id?: string | null;
  department_name?: string | null;
  school_id?: string | null;
  school_name?: string | null;
  academic_rank?: string | null;
  specialization?: string | null;
  research_interests?: string[] | null;
  teaching_areas?: string[] | null;
  courses_taught?: string[] | null;
  office_location?: string | null;
  office_hours?: Record<string, unknown> | string | null;
  office_phone?: string | null;
  institutional_role?: string | null;
  leadership_message?: string | null;
  is_researcher?: boolean | null;
  website_url?: string | null;
  linkedin_url?: string | null;
  google_scholar_id?: string | null;
  google_scholar_url?: string | null;
  orcid?: string | null;
  researchgate_url?: string | null;
  scopus_id?: string | null;
  publications_count?: number | null;
  h_index?: number | null;
  assignments?: PublicPersonAssignment[];
};

export type PublicPersonAssignmentEntity = {
  entity_type?: string | null;
  id?: string | null;
  name?: string | null;
  slug?: string | null;
  kind?: string | null;
};

export type PublicPersonAssignment = PublicTeamAssignment & {
  entity?: PublicPersonAssignmentEntity | null;
};

type PublicPersonResponse = {
  data?: PublicPersonProfile;
};

export async function getPublicPersonProfile(
  personId: string,
): Promise<PublicPersonProfile | null> {
  try {
    const response = await mainApi.get<PublicPersonResponse>(
      `/api/v1/public/people/${encodeURIComponent(personId)}`,
    );

    return response.data ?? null;
  } catch (error) {
    console.error("Failed to load public person profile:", error);
    return null;
  }
}
