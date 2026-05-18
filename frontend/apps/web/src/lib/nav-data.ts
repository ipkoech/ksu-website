import { schoolsApi } from "@ksu/api-client";
import type { MegaMenuData, NavSchool, NavClub } from "@ksu/ui/layout/public";

export async function getNavData(): Promise<MegaMenuData> {
  try {
    // Fetch schools with only needed fields
    const schoolsResponse = await schoolsApi.list({
      fields: "id,name,slug",
      limit: 20,
    });

    const schools: NavSchool[] = (schoolsResponse.data ?? []).map((school) => ({
      id: school.id,
      name: school.name,
      slug: school.slug,
    }));

    // TODO: Add clubs API when available
    // const clubsResponse = await clubsApi.list({ fields: "id,name,slug", limit: 10 });
    const clubs: NavClub[] = [];

    return {
      schools,
      clubs,
    };
  } catch (error) {
    console.error("Failed to fetch nav data:", error);
    return {
      schools: [],
      clubs: [],
    };
  }
}
