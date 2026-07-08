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
      schoolsApi.list({
        fields: "id,name,slug",
        per_page: 50,
      }),
      divisionsApi.list({
        fields: "id,name,slug,division_type",
        per_page: 50,
      }),
      departmentsApi.list({
        fields: "id,name,slug,school_id,department_type",
        department_type: "administrative",
        per_page: 100,
      }),
      clubsApi.list({
        fields: "id,name,slug",
        per_page: 12,
      }),
    ]);

  if (
    schoolsResult.status === "rejected" ||
    divisionsResult.status === "rejected" ||
    adminDepartmentsResult.status === "rejected" ||
    clubsResult.status === "rejected"
  ) {
    console.error("Failed to fetch some nav data:", {
      schools:
        schoolsResult.status === "rejected" ? schoolsResult.reason : undefined,
      divisions:
        divisionsResult.status === "rejected"
          ? divisionsResult.reason
          : undefined,
      departments:
        adminDepartmentsResult.status === "rejected"
          ? adminDepartmentsResult.reason
          : undefined,
      clubs: clubsResult.status === "rejected" ? clubsResult.reason : undefined,
    });
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
      ? (divisionsResult.value.data ?? [])
          .filter((division) => division.division_type === "division")
          .map((division) => ({
            id: division.id,
            name: division.name,
            slug: division.slug,
          }))
      : [];

  const wingsResult = await Promise.allSettled(
    divisions.map((division) =>
      wingsApi.listByDivision(division.id, {
        fields: "id,name,slug,wing_type",
        is_active: true,
      }),
    ),
  );

  if (wingsResult.some((result) => result.status === "rejected")) {
    console.error("Failed to fetch some nav data:", {
      wings: wingsResult
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason),
    });
  }

  const wings: NavAdminUnit[] = wingsResult.flatMap((result) =>
    result.status === "fulfilled"
      ? (result.value.data ?? []).map((wing) => ({
          id: wing.id,
          name: wing.name,
          slug: wing.slug,
        }))
      : [],
  );

  const adminUnits: NavAdminUnit[] =
    adminDepartmentsResult.status === "fulfilled"
      ? (adminDepartmentsResult.value.data ?? []).map((department) => ({
          id: department.id,
          name: department.name,
          slug: department.slug,
        }))
      : [];

  const departments: NavDepartment[] =
    adminDepartmentsResult.status === "fulfilled"
      ? (adminDepartmentsResult.value.data ?? [])
          .map((department) => ({
            id: department.id,
            name: department.name,
            slug: department.slug,
            school_id: department.school_id ?? undefined,
            department_type: department.department_type ?? undefined,
          }))
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
