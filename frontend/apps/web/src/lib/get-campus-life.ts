import {
  accommodationsApi,
  artsCultureApi,
  clubsApi,
  contactsApi,
  faqsApi,
  sportsFacilitiesApi,
  studentGovernanceApi,
  type Accommodation,
  type ArtsCulture,
  type Club,
  type ContactDirectory,
  type FAQ,
  type SportsFacility,
  type StudentGovernance,
} from "@ksu/api-client";

type ListEnvelope<T> = { data?: T[] };
type RecordEnvelope<T> = { data?: T | null };

export interface CampusLifePageData {
  clubs: Club[];
  accommodations: Accommodation[];
  sports: SportsFacility[];
  arts: ArtsCulture[];
  governance: StudentGovernance[];
  faqs: FAQ[];
  contacts: ContactDirectory[];
  detail?: {
    club?: Club | null;
    accommodation?: Accommodation | null;
    sport?: SportsFacility | null;
    art?: ArtsCulture | null;
    governance?: StudentGovernance | null;
  };
}

async function safeList<T>(promise: Promise<ListEnvelope<T>>): Promise<T[]> {
  try {
    const result = await promise;
    return result.data ?? [];
  } catch (error) {
    console.error("Failed to fetch campus life list:", error);
    return [];
  }
}

async function safeRecord<T>(
  promise: Promise<RecordEnvelope<T>>,
): Promise<T | null> {
  try {
    const result = await promise;
    return result.data ?? null;
  } catch (error) {
    console.error("Failed to fetch campus life record:", error);
    return null;
  }
}

export async function getCampusLifeData(
  segments: string[] = [],
): Promise<CampusLifePageData> {
  const [area, slug] = segments;
  const [clubs, accommodations, sports, arts, governance, faqs, contacts] =
    await Promise.all([
      safeList(clubsApi.list({ per_page: 24 })),
      safeList(accommodationsApi.list({ per_page: 16 })),
      safeList(sportsFacilitiesApi.list({ per_page: 16 })),
      safeList(artsCultureApi.list({ per_page: 16 })),
      safeList(studentGovernanceApi.list({ per_page: 12 })),
      safeList(faqsApi.list({ scope_type: "student_life", per_page: 8 })),
      safeList(contactsApi.list({ scope_type: "student_life", per_page: 8 })),
    ]);

  const detail: CampusLifePageData["detail"] = {};

  if (area === "clubs" && slug) {
    detail.club = await safeRecord(clubsApi.getBySlug(slug));
  }

  if (area === "accommodation" && slug) {
    detail.accommodation = await safeRecord(accommodationsApi.getBySlug(slug));
  }

  if (area === "sports" && slug) {
    detail.sport = await safeRecord(sportsFacilitiesApi.getBySlug(slug));
  }

  if (area === "gallery" && slug) {
    detail.art = await safeRecord(artsCultureApi.getBySlug(slug));
  }

  if (area === "student-life" && slug) {
    detail.governance = await safeRecord(studentGovernanceApi.getBySlug(slug));
  }

  return {
    clubs,
    accommodations,
    sports,
    arts,
    governance,
    faqs,
    contacts,
    detail,
  };
}
