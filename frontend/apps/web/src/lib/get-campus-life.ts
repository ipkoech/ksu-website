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
type CampusLifeFilters = {
  q?: string;
  type?: string;
  status?: string;
};
type QueryValue = string | number | boolean | undefined;
type QueryParams = Record<string, QueryValue>;

const clubListFields =
  "id,name,slug,club_type,about,mission,objectives,membership_count,meeting_schedule,membership_fee,email,phone,is_active,is_public,display_order";
const clubDetailFields =
  "id,name,slug,club_type,about,mission,objectives,membership_count,meeting_schedule,membership_fee,email,phone,is_active,is_public,display_order";
const accommodationFields =
  "id,name,slug,accommodation_type,gender,about,amenities,rules,total_rooms,capacity,fee_per_semester,fee_per_year,is_active,is_accepting_applications";
const sportsFields =
  "id,name,slug,facility_type,sport_types,about,location,email,phone,is_active";
const artsFields = "id,title,slug,category,about,is_active";
const governanceFields =
  "id,name,slug,acronym,governance_type,about,constitution,mandate,term_start,term_end,email,phone,office_location,is_active";
const faqFields =
  "id,question,answer,answer_plain_text,category,display_order,is_main,is_public,status";
const contactFields =
  "id,name,contact_type,email,phone,extension,physical_address,building,room_number,operating_hours,is_main,is_public,status";

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

function clean(value?: string) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function baseParams(perPage: number, fields: string): QueryParams {
  return { per_page: perPage, fields };
}

function statusParams(
  status: string | undefined,
  targetArea: string,
): QueryParams {
  const value = clean(status);
  if (value === "active") return { is_active: true };
  if (value === "inactive") return { is_active: false };
  if (targetArea === "accommodation" && value === "accepting") {
    return { is_accepting_applications: true };
  }
  if (targetArea === "accommodation" && value === "closed") {
    return { is_accepting_applications: false };
  }
  return {};
}

function listParamsForArea(
  area: string | undefined,
  targetArea: string,
  perPage: number,
  fields: string,
  filters?: CampusLifeFilters,
  typeParam?: string,
) {
  const params = baseParams(perPage, fields);
  if (area === targetArea) {
    if (typeParam) params[typeParam] = clean(filters?.type);
    if (targetArea === "clubs") params.q = clean(filters?.q);
    Object.assign(params, statusParams(filters?.status, targetArea));
  }
  return params;
}

export async function getCampusLifeData(
  segments: string[] = [],
  filters: CampusLifeFilters = {},
): Promise<CampusLifePageData> {
  const [area, slug] = segments;
  const [clubs, accommodations, sports, arts, governance, faqs, contacts] =
    await Promise.all([
      safeList(
        clubsApi.list(
          listParamsForArea(
            area,
            "clubs",
            24,
            clubListFields,
            filters,
            "club_type",
          ),
        ),
      ),
      safeList(
        accommodationsApi.list(
          listParamsForArea(
            area,
            "accommodation",
            16,
            accommodationFields,
            filters,
            "accommodation_type",
          ),
        ),
      ),
      safeList(
        sportsFacilitiesApi.list(
          listParamsForArea(
            area,
            "sports",
            16,
            sportsFields,
            filters,
            "facility_type",
          ),
        ),
      ),
      safeList(
        artsCultureApi.list(
          listParamsForArea(
            area,
            "gallery",
            16,
            artsFields,
            filters,
            "category",
          ),
        ),
      ),
      safeList(
        studentGovernanceApi.list(
          listParamsForArea(
            area,
            "student-life",
            12,
            governanceFields,
            filters,
            "governance_type",
          ),
        ),
      ),
      safeList(
        faqsApi.list({
          scope_type: "student_life",
          per_page: 8,
          fields: faqFields,
        }),
      ),
      safeList(
        contactsApi.list({
          scope_type: "student_life",
          per_page: 8,
          fields: contactFields,
        }),
      ),
    ]);

  const detail: CampusLifePageData["detail"] = {};

  if (area === "clubs" && slug) {
    detail.club = await safeRecord(
      clubsApi.getBySlug(slug, { fields: clubDetailFields }),
    );
  }

  if (area === "accommodation" && slug) {
    detail.accommodation = await safeRecord(
      accommodationsApi.getBySlug(slug, { fields: accommodationFields }),
    );
  }

  if (area === "sports" && slug) {
    detail.sport = await safeRecord(
      sportsFacilitiesApi.getBySlug(slug, { fields: sportsFields }),
    );
  }

  if (area === "gallery" && slug) {
    detail.art = await safeRecord(
      artsCultureApi.getBySlug(slug, { fields: artsFields }),
    );
  }

  if (area === "student-life" && slug) {
    detail.governance = await safeRecord(
      studentGovernanceApi.getBySlug(slug, { fields: governanceFields }),
    );
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
