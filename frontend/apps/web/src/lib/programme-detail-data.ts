import { programmesApi, type Programme } from "@ksu/api-client";
import type { ProgrammeWithRelations } from "@/lib/department-detail-data";

const programmeFields = [
  "id",
  "name",
  "code",
  "slug",
  "level",
  "mode_of_study",
  "duration",
  "credits_required",
  "department_id",
  "department_name",
  "about",
  "objectives",
  "career_prospects",
  "curriculum_overview",
  "entry_requirements",
  "fees_structure",
  "intake_months",
  "min_students",
  "max_students",
  "accreditation_status",
  "accrediting_body",
  "cover_image_id",
  "brochure_id",
  "is_active",
  "display_order",
  "created_at",
  "updated_at",
].join(",");

const programmeRelationInclude = [
  "department:id,name,slug,code",
  "tutors:id,role,is_lead,person_id,person(id,slug,title,first_name,middle_name,last_name,full_name,academic_rank,institutional_role,email)",
  "intakes:id,slots_available,application_deadline,is_active,intake(id,name,slug,application_start,application_end,is_open)",
].join(";");

async function getProgramme(slug: string): Promise<ProgrammeWithRelations | null> {
  try {
    const response = await programmesApi.getBySlug(slug, {
      fields: programmeFields,
      include: programmeRelationInclude,
    });

    return (response.data as ProgrammeWithRelations | undefined) ?? null;
  } catch {
    return null;
  }
}

async function getRelatedProgrammes(programme: Programme | null) {
  if (!programme?.department_id) return [];

  try {
    const response = await programmesApi.list({
      department_id: programme.department_id,
      fields: programmeFields,
      per_page: 4,
    });

    return (response.data ?? []).filter((item) => item.slug !== programme.slug);
  } catch {
    return [];
  }
}

export type ProgrammeDetailData = {
  slug: string;
  programme: ProgrammeWithRelations | null;
  relatedProgrammes: Programme[];
  sourceBacked: boolean;
};

export async function getProgrammeDetailData(
  slug: string,
): Promise<ProgrammeDetailData> {
  const programme = await getProgramme(slug);
  const relatedProgrammes = await getRelatedProgrammes(programme);

  return {
    slug,
    programme,
    relatedProgrammes,
    sourceBacked: Boolean(programme),
  };
}
