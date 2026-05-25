import { admissionsApi, intakesApi } from "@ksu/api-client";
import type { AdmissionInfo, Intake } from "@ksu/api-client";
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
  const [intakesResult, admissionInfoResult] = await Promise.allSettled([
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
  };
}
