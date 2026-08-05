import { admissionsApi, intakesApi, programmesApi } from "@ksu/api-client";
import type {
  AdmissionDocument,
  AdmissionFaq,
  AdmissionInfo,
  AdmissionPageSection,
  AdmissionPathway,
  AdmissionRequirement,
  Intake,
  Programme,
  ProgrammeFeeStructure,
} from "@ksu/api-client";
import { publicFileUrl } from "@/lib/public-media";

export interface AdmissionsIntakeSummary {
  id: string;
  name: string;
  slug: string;
  applicationStart: string;
  applicationEnd: string;
  lateApplicationEnd?: string | null;
  isOpen: boolean;
}

export interface AdmissionsInfoSummary {
  id: string;
  title: string;
  slug: string;
  contentType: string;
  audienceLevels?: string[] | null;
  summary?: string | null;
  content?: string | null;
  externalUrl?: string | null;
  coverImageUrl?: string | null;
  attachmentUrl?: string | null;
}

export interface AdmissionsPageData {
  intakes: AdmissionsIntakeSummary[];
  admissionInfo: AdmissionsInfoSummary[];
  pathways: AdmissionPathway[];
  requirements: AdmissionRequirement[];
  feeStructures: ProgrammeFeeStructure[];
  documents: AdmissionDocument[];
  faqs: AdmissionFaq[];
  pageSections: AdmissionPageSection[];
  programmes: Programme[];
}

function mapIntake(intake: Intake): AdmissionsIntakeSummary {
  return {
    id: intake.id,
    name: intake.name,
    slug: intake.slug,
    applicationStart: intake.application_start,
    applicationEnd: intake.application_end,
    lateApplicationEnd: intake.late_application_end,
    isOpen: intake.is_open,
  };
}

function mapAdmissionInfo(info: AdmissionInfo): AdmissionsInfoSummary {
  return {
    id: info.id,
    title: info.title,
    slug: info.slug,
    contentType: info.content_type,
    audienceLevels: info.audience_levels,
    summary: info.summary,
    content: info.content,
    externalUrl: info.external_url,
    coverImageUrl: publicFileUrl(info.cover_image_id),
    attachmentUrl: publicFileUrl(info.attachment_media_id),
  };
}

export async function getAdmissionsPageData(): Promise<AdmissionsPageData> {
  const [
    intakesResult,
    admissionInfoResult,
    pathwaysResult,
    requirementsResult,
    feeStructuresResult,
    documentsResult,
    faqsResult,
    pageSectionsResult,
    programmesResult,
  ] = await Promise.allSettled([
    intakesApi.list({
      fields:
        "id,name,slug,application_start,application_end,late_application_end,is_open",
      per_page: 6,
    }),
    admissionsApi.list({
      fields:
        "id,title,slug,content_type,audience_levels,summary,content,external_url,cover_image_id,attachment_media_id,display_order",
      per_page: 20,
    }),
    admissionsApi.listPathways({ per_page: 20 }),
    admissionsApi.listRequirements({
      fields:
        "id,title,applicant_type,level,minimum_grade,subject_requirements,alternative_qualifications,documents_required,notes,programme_id,school_id,intake_id,pathway_id,is_active,display_order",
      per_page: 100,
    }),
    admissionsApi.listFeeStructures({
      fields:
        "id,title,applicant_type,fee_category,currency,tuition_amount,statutory_amount,other_amount,total_amount,payment_schedule,notes,programme_id,intake_id,attachment_media_id,is_active,display_order",
      per_page: 100,
    }),
    admissionsApi.listDocuments({
      fields:
        "id,title,slug,document_type,applicant_type,summary,external_url,media_id,pathway_id,programme_id,intake_id,is_published,published_at,expires_at,display_order",
      per_page: 100,
    }),
    admissionsApi.listFaqs({
      fields:
        "id,question,answer,category,applicant_type,pathway_id,is_published,display_order",
      per_page: 50,
    }),
    admissionsApi.listPageSections({
      fields:
        "id,page_key,section_key,title,subtitle,body,layout_variant,settings,items,media_id,is_enabled,display_order",
      per_page: 100,
    }),
    programmesApi.list({
      fields:
        "id,name,slug,level,department_id,entry_requirements,cluster_subjects,intake_months,fees_structure",
      per_page: 12,
    }),
  ]);

  if (intakesResult.status === "rejected") {
    console.error("Failed to fetch admissions intakes:", intakesResult.reason);
  }

  if (admissionInfoResult.status === "rejected") {
    console.error(
      "Failed to fetch admissions information:",
      admissionInfoResult.reason,
    );
  }

  return {
    intakes:
      intakesResult.status === "fulfilled"
        ? (intakesResult.value.data ?? []).map(mapIntake)
        : [],
    admissionInfo:
      admissionInfoResult.status === "fulfilled"
        ? (admissionInfoResult.value.data ?? []).map(mapAdmissionInfo)
        : [],
    pathways:
      pathwaysResult.status === "fulfilled"
        ? (pathwaysResult.value.data ?? [])
        : [],
    requirements:
      requirementsResult.status === "fulfilled"
        ? (requirementsResult.value.data ?? [])
        : [],
    feeStructures:
      feeStructuresResult.status === "fulfilled"
        ? (feeStructuresResult.value.data ?? [])
        : [],
    documents:
      documentsResult.status === "fulfilled"
        ? (documentsResult.value.data ?? [])
        : [],
    faqs:
      faqsResult.status === "fulfilled" ? (faqsResult.value.data ?? []) : [],
    pageSections:
      pageSectionsResult.status === "fulfilled"
        ? (pageSectionsResult.value.data ?? [])
        : [],
    programmes:
      programmesResult.status === "fulfilled"
        ? (programmesResult.value.data ?? [])
        : [],
  };
}
