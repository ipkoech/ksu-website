import "server-only";
import { admissionsApi, intakesApi, programmesApi } from "@ksu/api-client/server";
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
} from "@ksu/api-client/server";
import { publicFileUrl } from "@/lib/public-media";
import {
  markUncacheableIfFailed,
  uncachedPublicFallback,
} from "@/lib/public-fetch";
import { normalizePublicListResponse } from "@/lib/web-response-shapes";

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

function settledList<T>(result: PromiseSettledResult<unknown>): T[] {
  if (result.status === "rejected") return [];
  const normalized = normalizePublicListResponse<T>(result.value);
  if (!normalized) return uncachedPublicFallback([]);
  return normalized.data;
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

  // Partial admissions content is useful for this request, but an outage
  // must not be persisted as a complete-looking empty admissions page.
  markUncacheableIfFailed([
    intakesResult,
    admissionInfoResult,
    pathwaysResult,
    requirementsResult,
    feeStructuresResult,
    documentsResult,
    faqsResult,
    pageSectionsResult,
    programmesResult,
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
      settledList<Intake>(intakesResult).map(mapIntake),
    admissionInfo:
      settledList<AdmissionInfo>(admissionInfoResult).map(mapAdmissionInfo),
    pathways:
      settledList<AdmissionPathway>(pathwaysResult),
    requirements:
      settledList<AdmissionRequirement>(requirementsResult),
    feeStructures:
      settledList<ProgrammeFeeStructure>(feeStructuresResult),
    documents:
      settledList<AdmissionDocument>(documentsResult),
    faqs: settledList<AdmissionFaq>(faqsResult),
    pageSections:
      settledList<AdmissionPageSection>(pageSectionsResult),
    programmes:
      settledList<Programme>(programmesResult),
  };
}
