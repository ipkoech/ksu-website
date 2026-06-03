import { mainApi } from "@ksu/api-client";
import type { EntityHeaderProps } from "@ksu/ui/layout/public";

type EntityHeaderConfig = Omit<EntityHeaderProps, "className">;

type ApiListResponse<T> = {
  data?: T[];
  meta?: {
    total?: number;
    count?: number;
  };
};

type ApiItemResponse<T> = {
  data?: T;
};

type SchoolRecord = {
  id: string;
  name: string;
  slug: string;
  departments?: DepartmentRecord[];
};

type DepartmentRecord = {
  id: string;
  name: string;
  slug: string;
  department_type?: string;
  display_order?: number;
};

type DivisionRecord = {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  division_type?: string | null;
};

type WingRecord = {
  id: string;
  name: string;
  slug: string;
  code?: string | null;
  wing_type?: string | null;
  division_id?: string | null;
  division?: DivisionRecord | null;
};

type PublicationHolder = {
  publications_count?: number;
};

function titleFromSlug(slug?: string) {
  if (!slug) return "Published record";

  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

async function getItem<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T | null> {
  try {
    const response = await mainApi.get<ApiItemResponse<T>>(path, params);
    return response.data ?? null;
  } catch {
    return null;
  }
}

async function getList<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<ApiListResponse<T>> {
  try {
    const response = await mainApi.get<ApiListResponse<T>>(path, params);
    return response;
  } catch {
    return { data: [] };
  }
}

async function hasListItems(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
) {
  const response = await getList<{ id?: string }>(path, params);
  const total = response.meta?.total ?? response.meta?.count;

  if (typeof total === "number") {
    return total > 0;
  }

  return Boolean(response.data?.length);
}

async function hasStaffPublications(
  entity: "schools" | "departments",
  slug: string,
) {
  const response = await getList<PublicationHolder>(
    `/api/v1/${entity}/${slug}/staff`,
    { fields: "id,publications_count" },
  );

  return Boolean(
    response.data?.some((item) => Number(item.publications_count ?? 0) > 0),
  );
}

async function getSchool(slug: string) {
  return getItem<SchoolRecord>(`/api/v1/schools/${slug}`, {
    fields: "id,name,slug",
    include: "departments:id,name,slug,display_order",
  });
}

async function getDepartment(slug: string) {
  return getItem<DepartmentRecord>(`/api/v1/departments/${slug}`, {
    fields: "id,name,slug,department_type",
  });
}

async function getDivision(slug: string) {
  return getItem<DivisionRecord>(`/api/v1/divisions/${slug}`, {
    fields: "id,name,slug,code,division_type",
  });
}

async function getWing(slug: string) {
  return getItem<WingRecord>(`/api/v1/wings/slug/${slug}`, {
    fields: "id,name,slug,code,wing_type,division_id",
    include: "division:id,name,slug,code",
  });
}

function sortDepartments(departments: DepartmentRecord[] = []) {
  return departments
    .slice()
    .sort(
      (first, second) =>
        Number(first.display_order ?? 0) - Number(second.display_order ?? 0) ||
        first.name.localeCompare(second.name),
    );
}

export async function getAcademicsEntityHeader(
  segments: string[] = [],
): Promise<EntityHeaderConfig | null> {
  const [area, firstSlug, child, childSlug] = segments;

  if (area === "schools" && firstSlug && child === "departments" && childSlug) {
    const school = await getSchool(firstSlug);

    return getDepartmentHeader({
      slug: childSlug,
      baseHref: `/academics/schools/${firstSlug}/departments/${childSlug}`,
      parentLabel: school?.name ?? titleFromSlug(firstSlug),
      parentHref: `/academics/schools/${firstSlug}`,
      fallbackType: "academic",
    });
  }

  if (area === "departments" && firstSlug) {
    return getDepartmentHeader({
      slug: firstSlug,
      baseHref: `/academics/departments/${firstSlug}`,
      parentLabel: "Academics",
      parentHref: "/academics",
      fallbackType: "academic",
    });
  }

  if (area === "schools" && firstSlug) {
    return getSchoolHeader(firstSlug);
  }

  return null;
}

export async function getAdministrationEntityHeader(
  segments: string[] = [],
): Promise<EntityHeaderConfig | null> {
  const [area, slug] = segments;

  if (area === "divisions" && slug) {
    const division = await getDivision(slug);
    const baseHref = `/administration/divisions/${slug}`;

    return {
      eyebrow: "Administration Division",
      title: division?.name ?? titleFromSlug(slug),
      href: baseHref,
      parentLabel: "Administration",
      parentHref: "/administration",
      navItems: [
        { label: "Overview", href: baseHref, exact: true },
        { label: "Units", href: `${baseHref}/units` },
        { label: "Team", href: `${baseHref}/team` },
        { label: "Services", href: `${baseHref}/services` },
        { label: "Media", href: `${baseHref}/media` },
        { label: "Downloads", href: `${baseHref}/downloads` },
        { label: "Contact", href: `${baseHref}/contact` },
      ],
    };
  }

  if ((area === "directorates" || area === "units") && slug) {
    if (area === "units") {
      const department = await getDepartment(slug);
      if (department) {
        return getDepartmentHeader({
          slug,
          baseHref: `/administration/units/${slug}`,
          parentLabel: "Administration",
          parentHref: "/administration",
          fallbackType: "administrative",
        });
      }
    }

    const wing = await getWing(slug);
    if (!wing && area === "units") {
      return getDepartmentHeader({
        slug,
        baseHref: `/administration/units/${slug}`,
        parentLabel: "Administration",
        parentHref: "/administration",
        fallbackType: "administrative",
      });
    }
    const baseHref = `/administration/units/${slug}`;

    return {
      eyebrow: "Administrative Unit",
      title: wing?.name ?? titleFromSlug(slug),
      href: baseHref,
      parentLabel: wing?.division?.name ?? "Administration",
      parentHref: wing?.division?.slug
        ? `/administration/divisions/${wing.division.slug}`
        : "/administration",
      navItems: [
        { label: "Overview", href: baseHref, exact: true },
        { label: "Team", href: `${baseHref}/team` },
        { label: "Services", href: `${baseHref}/services` },
        { label: "Media", href: `${baseHref}/media` },
        { label: "Downloads", href: `${baseHref}/downloads` },
        { label: "Contact", href: `${baseHref}/contact` },
      ],
    };
  }

  if (area !== "units" || !slug) {
    return null;
  }

  return getDepartmentHeader({
    slug,
    baseHref: `/administration/units/${slug}`,
    parentLabel: "Administration",
    parentHref: "/administration",
    fallbackType: "administrative",
  });
}

async function getSchoolHeader(slug: string): Promise<EntityHeaderConfig> {
  const school = await getSchool(slug);
  const baseHref = `/academics/schools/${slug}`;
  const [hasPublications, hasClubs] = await Promise.all([
    hasStaffPublications("schools", slug),
    school?.id
      ? hasListItems("/api/v1/clubs", {
          school_id: school.id,
          per_page: 1,
          fields: "id",
        })
      : Promise.resolve(false),
  ]);
  const departmentItems = sortDepartments(school?.departments).map((department) => ({
    label: department.name,
    href: `${baseHref}/departments/${department.slug}`,
  }));

  return {
    eyebrow: "School",
    title: school?.name ?? `${titleFromSlug(slug)} School`,
    href: baseHref,
    parentLabel: "Academics",
    parentHref: "/academics",
    navItems: [
      { label: "About", href: baseHref, exact: true },
      { label: "Departments", children: departmentItems },
      { label: "Team", href: `${baseHref}/team` },
      ...(hasPublications
        ? [{ label: "Publications", href: `${baseHref}/publications` }]
        : []),
      { label: "Media", href: `${baseHref}/media` },
      { label: "Downloads", href: `${baseHref}/downloads` },
      ...(hasClubs ? [{ label: "Clubs", href: `${baseHref}/clubs` }] : []),
      { label: "Contact", href: `${baseHref}/contact` },
    ],
  };
}

async function getDepartmentHeader({
  slug,
  baseHref,
  parentLabel,
  parentHref,
  fallbackType,
}: {
  slug: string;
  baseHref: string;
  parentLabel: string;
  parentHref: string;
  fallbackType: "academic" | "administrative";
}): Promise<EntityHeaderConfig> {
  const [department, hasPublications] = await Promise.all([
    getDepartment(slug),
    hasStaffPublications("departments", slug),
  ]);
  const departmentType = department?.department_type ?? fallbackType;
  const isAcademic = departmentType === "academic";
  const eyebrow = isAcademic
    ? "Academic Department"
    : departmentType === "administrative"
      ? "Administrative Unit"
      : "Department";

  return {
    eyebrow,
    title: department?.name ?? `${titleFromSlug(slug)} Department`,
    href: baseHref,
    parentLabel,
    parentHref,
    navItems: [
      { label: "About", href: baseHref, exact: true },
      { label: "Team", href: `${baseHref}/team` },
      ...(isAcademic
        ? [{ label: "Programmes", href: `${baseHref}/programmes` }]
        : []),
      ...(hasPublications
        ? [{ label: "Publications", href: `${baseHref}/publications` }]
        : []),
      { label: "Services", href: `${baseHref}/services` },
      { label: "Media", href: `${baseHref}/media` },
      { label: "Downloads", href: `${baseHref}/downloads` },
      { label: "Contact", href: `${baseHref}/contact` },
    ],
  };
}
