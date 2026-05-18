import { schoolsApi, programmesApi, intakesApi } from "@ksu/api-client";

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
      limit: 8,
    });

    return (response.data ?? []).map((school) => ({
      id: school.id,
      name: school.name,
      slug: school.slug,
      coverImage: school.cover_image_id ? `/api/files/${school.cover_image_id}` : null,
      shortName: school.code,
    }));
  } catch (error) {
    console.error("Failed to fetch schools:", error);
    return [];
  }
}

export async function getActiveIntake(): Promise<ActiveIntake | null> {
  try {
    const response = await intakesApi.list({
      is_open: true,
      fields: "id,name,application_start,application_end,is_open",
      limit: 1,
    });

    const intake = response.data?.[0];
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
    return null;
  }
}

export async function getPostgraduateProgrammes(): Promise<ProgrammeCard[]> {
  try {
    const response = await programmesApi.list({
      level: "postgraduate",
      fields: "id,name,slug,level,duration,cover_image_id,department_name",
      limit: 10,
    });

    return (response.data ?? []).map((programme) => ({
      id: programme.id,
      name: programme.name,
      slug: programme.slug,
      level: programme.level || "Postgraduate",
      duration: programme.duration,
      schoolName: programme.department_name,
      coverImage: programme.cover_image_id ? `/api/files/${programme.cover_image_id}` : null,
    }));
  } catch (error) {
    console.error("Failed to fetch postgraduate programmes:", error);
    return [];
  }
}

export async function getPhdProgrammes(): Promise<ProgrammeCard[]> {
  try {
    const response = await programmesApi.list({
      level: "phd",
      fields: "id,name,slug,level,duration,cover_image_id,department_name",
      limit: 6,
    });

    return (response.data ?? []).map((programme) => ({
      id: programme.id,
      name: programme.name,
      slug: programme.slug,
      level: "PhD",
      duration: programme.duration,
      schoolName: programme.department_name,
      coverImage: programme.cover_image_id ? `/api/files/${programme.cover_image_id}` : null,
    }));
  } catch (error) {
    console.error("Failed to fetch PhD programmes:", error);
    return [];
  }
}

export async function getFeaturedProgrammes(): Promise<ProgrammeCard[]> {
  try {
    const response = await programmesApi.list({
      fields: "id,name,slug,level,duration,cover_image_id,department_name",
      limit: 8,
    });

    // Shuffle the programmes for variety
    const programmes = response.data ?? [];
    const shuffled = [...programmes].sort(() => Math.random() - 0.5);

    return shuffled.map((programme) => ({
      id: programme.id,
      name: programme.name,
      slug: programme.slug,
      level: programme.level || "Undergraduate",
      duration: programme.duration,
      schoolName: programme.department_name,
      coverImage: programme.cover_image_id ? `/api/files/${programme.cover_image_id}` : null,
    }));
  } catch (error) {
    console.error("Failed to fetch featured programmes:", error);
    return [];
  }
}
