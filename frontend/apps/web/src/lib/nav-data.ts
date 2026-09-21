import "server-only";
import { cache } from "react";
import { uncachedPublicFallback } from "./public-fetch";
import {
  clubsApi,
  departmentsApi,
  divisionsApi,
  navigationApi,
  schoolsApi,
  wingsApi,
} from "@ksu/api-client/server";
import type { NavigationData } from "@ksu/api-client/server";
import type {
  MegaMenuData,
  NavAdminUnit,
  NavClub,
  NavDepartment,
  NavSchool,
} from "@ksu/ui/layout/public";
import { normalizePublicListResponse, normalizePublicRecordResponse } from "./web-response-shapes";

export const getNavData = cache(async (): Promise<MegaMenuData> => {
  try {
    const response = await navigationApi.get();
    const normalized = normalizePublicRecordResponse<NavigationData>(response);
    if (normalized === undefined || normalized === null) {
      throw new Error("Empty navigation payload");
    }
    return mapNavigationData(normalized);
  } catch (error) {
    uncachedPublicFallback(null);
    console.warn(
      "Aggregated navigation endpoint unavailable; composing the menu from individual endpoints.",
      error instanceof Error ? error.message : String(error),
    );
    return getNavDataFallback();
  }
});

function mapNavigationData(data: NavigationData): MegaMenuData {
  const schoolsData = nestedList<NavigationData["schools"][number]>(data.schools, "schools");
  const divisionsData = nestedList<NavigationData["divisions"][number]>(data.divisions, "divisions");
  const wingsData = nestedList<NavigationData["wings"][number]>(data.wings, "wings");
  const departmentsData = nestedList<NavigationData["departments"][number]>(data.departments, "departments");
  const clubsData = nestedList<NavigationData["clubs"][number]>(data.clubs, "clubs");
  const schools: NavSchool[] = schoolsData.map((school) => ({
    id: school.id,
    name: school.name,
    slug: school.slug,
  }));

  const divisions: NavAdminUnit[] = uniqueNavUnits(
    divisionsData
      .filter((division) => division.division_type === "division")
      .map((division) => ({
        id: division.id,
        name: division.name,
        slug: division.slug,
      })),
  );

  const wings: NavAdminUnit[] = uniqueNavUnits(
    wingsData.map((wing) => ({
      id: wing.id,
      name: wing.name,
      slug: wing.slug,
      code: wing.code ?? undefined,
    })),
  );

  const adminUnits: NavAdminUnit[] = uniqueNavUnits(
    departmentsData.map((department) => ({
      id: department.id,
      name: department.name,
      slug: department.slug,
      code: department.code ?? undefined,
    })),
  );

  const departments: NavDepartment[] = uniqueNavUnits(
    departmentsData.map((department) => ({
      id: department.id,
      name: department.name,
      slug: department.slug,
      code: department.code ?? undefined,
      school_id: department.school_id ?? undefined,
      department_type: department.department_type ?? undefined,
    })),
  );

  const clubs: NavClub[] = clubsData.map((club) => ({
    id: club.id,
    name: club.name,
    slug: club.slug,
  }));

  return {
    schools,
    departments,
    divisions,
    wings,
    adminUnits,
    clubs,
  };
}

function nestedList<T>(value: unknown, label: string): T[] {
  const normalized = normalizePublicListResponse<T>({ data: value });
  if (!normalized) throw new Error(`Invalid navigation ${label} response`);
  return normalized.data;
}

function settledList<T>(result: PromiseSettledResult<unknown>): T[] {
  if (result.status !== "fulfilled") return [];
  const normalized = normalizePublicListResponse<T>(result.value);
  return normalized ? normalized.data : uncachedPublicFallback([]);
}

async function getNavDataFallback(): Promise<MegaMenuData> {
  const [schoolsResult, divisionsResult, adminDepartmentsResult, clubsResult] =
    await Promise.allSettled([
      retryOnce(() =>
        schoolsApi.list({
          fields: "id,name,slug",
          per_page: 50,
        }),
      ),
      retryOnce(() =>
        divisionsApi.list({
          fields: "id,name,slug,division_type",
          per_page: 50,
        }),
      ),
      retryOnce(() =>
        departmentsApi.list({
          fields: "id,name,slug,code,school_id,department_type",
          department_type: "administrative",
          per_page: 100,
        }),
      ),
      retryOnce(() =>
        clubsApi.list({
          fields: "id,name,slug",
          per_page: 12,
        }),
      ),
    ]);

  if (
    schoolsResult.status === "rejected" ||
    divisionsResult.status === "rejected" ||
    adminDepartmentsResult.status === "rejected" ||
    clubsResult.status === "rejected"
  ) {
    console.warn(
      "Navigation data unavailable; using the fallback menu.",
      compactFailures({
        schools: rejectionMessage(schoolsResult),
        divisions: rejectionMessage(divisionsResult),
        departments: rejectionMessage(adminDepartmentsResult),
        clubs: rejectionMessage(clubsResult),
      }),
    );
  }

  const schools: NavSchool[] =
    settledList<NavigationData["schools"][number]>(schoolsResult).map((school) => ({
          id: school.id,
          name: school.name,
          slug: school.slug,
        }));

  const divisions: NavAdminUnit[] =
    uniqueNavUnits(
          settledList<NavigationData["divisions"][number]>(divisionsResult)
            .filter((division) => division.division_type === "division")
            .map((division) => ({
              id: division.id,
              name: division.name,
              slug: division.slug,
            })),
        );

  const wingsResult = await Promise.allSettled(
    divisions.map((division) =>
      retryOnce(() =>
        wingsApi.listByDivision(division.id, {
          fields: "id,name,slug,code,wing_type",
          is_active: true,
        }),
      ),
    ),
  );

  if (wingsResult.some((result) => result.status === "rejected")) {
    console.warn("Navigation data unavailable; using the fallback menu.", {
      wings: wingsResult
        .filter((result) => result.status === "rejected")
        .map((result) => rejectionMessage(result)),
    });
  }

  const wings: NavAdminUnit[] = uniqueNavUnits(
    wingsResult.flatMap((result) =>
      settledList<NavigationData["wings"][number]>(result).map((wing) => ({
            id: wing.id,
            name: wing.name,
            slug: wing.slug,
        code: wing.code ?? undefined,
          })),
    ),
  );

  const adminUnits: NavAdminUnit[] = uniqueNavUnits(
    settledList<NavigationData["departments"][number]>(adminDepartmentsResult).map(
      (department) => ({
        id: department.id,
        name: department.name,
        slug: department.slug,
        code: department.code ?? undefined,
      }),
    ),
  );

  const departments: NavDepartment[] = uniqueNavUnits(
    settledList<NavigationData["departments"][number]>(adminDepartmentsResult).map(
      (department) => ({
        id: department.id,
        name: department.name,
        slug: department.slug,
        code: department.code ?? undefined,
        school_id: department.school_id ?? undefined,
        department_type: department.department_type ?? undefined,
      }),
    ),
  );

  const clubs: NavClub[] = settledList<NavigationData["clubs"][number]>(clubsResult).map(
    (club) => ({
      id: club.id,
      name: club.name,
      slug: club.slug,
    }),
  );

  return {
    schools,
    departments,
    divisions,
    wings,
    adminUnits,
    clubs,
  };
}

async function retryOnce<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch {
    return operation();
  }
}

function rejectionMessage(result: PromiseSettledResult<unknown>) {
  if (result.status !== "rejected") {
    return undefined;
  }

  return result.reason instanceof Error
    ? result.reason.message
    : String(result.reason);
}

function compactFailures(failures: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(failures).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  );
}

function uniqueNavUnits<T extends { id: string; slug: string }>(
  items: T[],
): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.id || item.slug;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function emptyNavData(): MegaMenuData {
  return {
    schools: [],
    departments: [],
    divisions: [],
    wings: [],
    adminUnits: [],
    clubs: [],
  };
}
