import "server-only";
import {
  schoolsApi,
  programmesApi,
  intakesApi,
  type Intake,
  type Programme,
  type School,
} from "@ksu/api-client/server";
import { publicFileUrl } from "@/lib/public-media";
import { uncachedPublicFallback } from "@/lib/public-fetch";
import { normalizePublicListResponse } from "@/lib/web-response-shapes";

export interface SchoolCard {
  id: string;
  name: string;
  slug: string;
  coverImage: string | null;
  shortName?: string;
}

export interface ProgrammeCard {
  id: string;
  name: string;
  slug: string;
  level: string;
  duration?: string;
  schoolName?: string;
  coverImage?: string | null;
}

export interface ActiveIntake {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isOpen: boolean;
}

export async function getSchools(): Promise<SchoolCard[]> {
  try {
    const response = await schoolsApi.list({
      fields: "id,name,slug,code,cover_image_id",
      per_page: 8,
    });
    const normalized = normalizePublicListResponse<School>(response);
    if (!normalized) throw new Error("Invalid schools response");

    return normalized.data.map((school) => ({
      id: school.id,
      name: school.name,
      slug: school.slug,
      coverImage: publicFileUrl(school.cover_image_id),
      shortName: school.code,
    }));
  } catch (error) {
    console.error("Failed to fetch schools:", error);
    return uncachedPublicFallback([]);
  }
}

export async function getActiveIntake(): Promise<ActiveIntake | null> {
  try {
    const response = await intakesApi.list({
      is_open: true,
      fields: "id,name,application_start,application_end,is_open",
      per_page: 1,
    });
    const normalized = normalizePublicListResponse<Intake>(response);
    if (!normalized) throw new Error("Invalid intake response");

    const intake = normalized.data[0];
    if (!intake) return null;

    return {
      id: intake.id,
      name: intake.name || "Current Intake",
      startDate: intake.application_start || "",
      endDate: intake.application_end || "",
      isOpen: intake.is_open ?? false,
    };
  } catch (error) {
    console.error("Failed to fetch active intake:", error);
    return uncachedPublicFallback(null);
  }
}

export async function getPostgraduateProgrammes(): Promise<ProgrammeCard[]> {
  try {
    const response = await programmesApi.list({
      level: "postgraduate",
      fields: "id,name,slug,level,duration,cover_image_id,department_name",
      per_page: 10,
    });
    const normalized = normalizePublicListResponse<Programme>(response);
    if (!normalized) throw new Error("Invalid postgraduate programmes response");

    return normalized.data.map((programme) => ({
      id: programme.id,
      name: programme.name,
      slug: programme.slug,
      level: programme.level || "Postgraduate",
      duration: programme.duration,
      schoolName: programme.department_name ?? undefined,
      coverImage: publicFileUrl(programme.cover_image_id),
    }));
  } catch (error) {
    console.error("Failed to fetch postgraduate programmes:", error);
    return uncachedPublicFallback([]);
  }
}

export async function getPhdProgrammes(): Promise<ProgrammeCard[]> {
  try {
    const response = await programmesApi.list({
      level: "phd",
      fields: "id,name,slug,level,duration,cover_image_id,department_name",
      per_page: 6,
    });
    const normalized = normalizePublicListResponse<Programme>(response);
    if (!normalized) throw new Error("Invalid PhD programmes response");

    return normalized.data.map((programme) => ({
      id: programme.id,
      name: programme.name,
      slug: programme.slug,
      level: "PhD",
      duration: programme.duration,
      schoolName: programme.department_name ?? undefined,
      coverImage: publicFileUrl(programme.cover_image_id),
    }));
  } catch (error) {
    console.error("Failed to fetch PhD programmes:", error);
    return uncachedPublicFallback([]);
  }
}

export async function getFeaturedProgrammes(): Promise<ProgrammeCard[]> {
  try {
    const response = await programmesApi.list({
      fields: "id,name,slug,level,duration,cover_image_id,department_name",
      per_page: 8,
    });
    const normalized = normalizePublicListResponse<Programme>(response);
    if (!normalized) throw new Error("Invalid featured programmes response");

    // Shuffle the programmes for variety
    const programmes = normalized.data;
    const shuffled = [...programmes].sort(() => Math.random() - 0.5);

    return shuffled.map((programme) => ({
      id: programme.id,
      name: programme.name,
      slug: programme.slug,
      level: programme.level || "Undergraduate",
      duration: programme.duration,
      schoolName: programme.department_name ?? undefined,
      coverImage: publicFileUrl(programme.cover_image_id),
    }));
  } catch (error) {
    console.error("Failed to fetch featured programmes:", error);
    return uncachedPublicFallback([]);
  }
}
