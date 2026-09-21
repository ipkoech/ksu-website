import "server-only";
import {
  programmesApi,
  testimonialsApi,
  type Programme,
  type Testimonial,
} from "@ksu/api-client/server";
import type { ProgrammeWithRelations } from "@/lib/department-detail-data";
import { uncachedPublicFallback } from "@/lib/public-fetch";
import {
  normalizePublicListResponse,
  normalizePublicRecordResponse,
} from "@/lib/web-response-shapes";

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
  "department:id,name,slug,code,school_id",
  "tutors:id,role,is_lead,person_id,person(id,slug,title,first_name,middle_name,last_name,full_name,academic_rank,institutional_role,email)",
  "intakes:id,slots_available,application_deadline,is_active,intake(id,name,slug,application_start,application_end,is_open)",
  "admission_requirements:id,title,applicant_type,level,minimum_grade,subject_requirements,alternative_qualifications,documents_required,notes,effective_from,effective_to,is_active,display_order",
  "admission_documents:id,title,slug,document_type,applicant_type,summary,external_url,media_id,is_published,display_order",
  "fee_structures:id,title,applicant_type,fee_category,currency,tuition_amount,statutory_amount,other_amount,total_amount,payment_schedule,notes,effective_from,effective_to,is_active,display_order,attachment_media_id",
].join(";");

async function getProgramme(
  slug: string,
): Promise<ProgrammeWithRelations | null> {
  try {
    const response = await programmesApi.getBySlug(slug, {
      fields: programmeFields,
      include: programmeRelationInclude,
    });

    const programme = normalizePublicRecordResponse<ProgrammeWithRelations>(response);
    if (programme === undefined) throw new Error("Invalid programme response");
    return programme;
  } catch {
    return uncachedPublicFallback(null);
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

    const normalized = normalizePublicListResponse<Programme>(response);
    if (!normalized) throw new Error("Invalid related programme response");
    return normalized.data.filter((item) => item.slug !== programme.slug);
  } catch {
    return uncachedPublicFallback([]);
  }
}

const testimonialFields =
  "id,name,role,quote,testimonial_type,photo_id,is_featured,display_order";

async function getTestimonials(
  programme: ProgrammeWithRelations | null,
): Promise<Testimonial[]> {
  if (!programme?.id) return [];

  try {
    const byProgramme = await testimonialsApi.list({
      programme_id: programme.id,
      per_page: 3,
      fields: testimonialFields,
    });
    const programmeTestimonials = normalizePublicListResponse<Testimonial>(byProgramme);
    if (!programmeTestimonials) throw new Error("Invalid programme testimonial response");
    if (programmeTestimonials.data.length) return programmeTestimonials.data;

    const schoolId = (
      programme.department as { school_id?: string | null } | undefined
    )?.school_id;
    if (!schoolId) return [];

    const bySchool = await testimonialsApi.list({
      school_id: schoolId,
      per_page: 3,
      fields: testimonialFields,
    });
    const schoolTestimonials = normalizePublicListResponse<Testimonial>(bySchool);
    if (!schoolTestimonials) throw new Error("Invalid school testimonial response");
    return schoolTestimonials.data;
  } catch {
    return uncachedPublicFallback([]);
  }
}

export type ProgrammeDetailData = {
  slug: string;
  programme: ProgrammeWithRelations | null;
  relatedProgrammes: Programme[];
  testimonials: Testimonial[];
  sourceBacked: boolean;
};

export async function getProgrammeDetailData(
  slug: string,
): Promise<ProgrammeDetailData> {
  const programme = await getProgramme(slug);
  const [relatedProgrammes, testimonials] = await Promise.all([
    getRelatedProgrammes(programme),
    getTestimonials(programme),
  ]);

  return {
    slug,
    programme,
    relatedProgrammes,
    testimonials,
    sourceBacked: Boolean(programme),
  };
}
