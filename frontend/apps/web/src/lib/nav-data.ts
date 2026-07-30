import {
  clubsApi,
  departmentsApi,
  divisionsApi,
  schoolsApi,
  wingsApi,
} from "@ksu/api-client";
import type {
  MegaMenuData,
  NavAdminUnit,
  NavClub,
  NavDepartment,
  NavSchool,
} from "@ksu/ui/layout/public";

export async function getNavData(): Promise<MegaMenuData> {
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
    schoolsResult.status === "fulfilled"
      ? (schoolsResult.value.data ?? []).map((school) => ({
          id: school.id,
          name: school.name,
          slug: school.slug,
        }))
      : [];

  const divisions: NavAdminUnit[] =
    divisionsResult.status === "fulfilled"
      ? uniqueNavUnits(
          (divisionsResult.value.data ?? [])
            .filter((division) => division.division_type === "division")
            .map((division) => ({
              id: division.id,
              name: division.name,
              slug: division.slug,
            })),
        )
      : [];

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
      result.status === "fulfilled"
        ? (result.value.data ?? []).map((wing) => ({
            id: wing.id,
            name: wing.name,
            slug: wing.slug,
            code: wing.code,
          }))
        : [],
    ),
  );

  const adminUnits: NavAdminUnit[] =
    adminDepartmentsResult.status === "fulfilled"
      ? uniqueNavUnits(
          (adminDepartmentsResult.value.data ?? []).map((department) => ({
            id: department.id,
            name: department.name,
            slug: department.slug,
            code: department.code,
          })),
        )
      : [];

  const departments: NavDepartment[] =
    adminDepartmentsResult.status === "fulfilled"
      ? uniqueNavUnits(
          (adminDepartmentsResult.value.data ?? []).map((department) => ({
            id: department.id,
            name: department.name,
            slug: department.slug,
            code: department.code,
            school_id: department.school_id ?? undefined,
            department_type: department.department_type ?? undefined,
          })),
        )
      : [];

  const clubs: NavClub[] =
    clubsResult.status === "fulfilled"
      ? (clubsResult.value.data ?? []).map((club) => ({
          id: club.id,
          name: club.name,
          slug: club.slug,
        }))
      : [];

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
