import { redirect } from "next/navigation";
import { EntityHeader } from "@ksu/ui/layout/public";
import {
  DepartmentDetailSection,
  type DepartmentDetailSectionKey,
} from "@/components/public/department-detail-section";
import { ProgrammeDetailPage } from "@/components/public/programme-detail-page";
import { PublicSectionPage } from "@/components/public/section-page";
import { SchoolDetailOverview } from "@/components/public/school-detail-overview";
import {
  SchoolDetailSection,
  type SchoolDetailSectionKey,
} from "@/components/public/school-detail-section";
import { getAcademicsEntityHeader } from "@/lib/entity-header-data";
import { getDepartmentDetailData } from "@/lib/department-detail-data";
import { getProgrammeDetailData } from "@/lib/programme-detail-data";
import { getAcademicsPageConfig } from "@/lib/public-record-page-data";
import { getSchoolDetailOverviewData } from "@/lib/school-detail-data";

const schoolDetailSections = new Set<SchoolDetailSectionKey>([
  "team",
  "programmes",
  "publications",
  "news",
  "downloads",
  "clubs",
  "contact",
]);

const departmentDetailSections = new Set<DepartmentDetailSectionKey>([
  "team",
  "programmes",
  "publications",
  "services",
  "news",
  "downloads",
  "contact",
]);

export default async function AcademicsRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<{ level?: string; q?: string }>;
}) {
  const { segments = [] } = await params;
  const filters = await searchParams;
  const [area, schoolSlug, child, childSlug, departmentChild] = segments;

  if (area === "programmes" && schoolSlug && !child) {
    return <ProgrammeDetailPage data={await getProgrammeDetailData(schoolSlug)} />;
  }

  if (area === "schools" && schoolSlug && !child) {
    const [headerConfig, schoolData] = await Promise.all([
      getAcademicsEntityHeader(segments),
      getSchoolDetailOverviewData(schoolSlug),
    ]);

    return (
      <SchoolDetailOverview
        data={schoolData}
        header={headerConfig ? <EntityHeader {...headerConfig} /> : undefined}
        navItems={headerConfig?.navItems}
      />
    );
  }

  if (area === "schools" && schoolSlug && child === "staff" && !childSlug) {
    redirect(`/academics/schools/${schoolSlug}/team`);
  }

  if (area === "schools" && schoolSlug && child === "documents" && !childSlug) {
    redirect(`/academics/schools/${schoolSlug}/downloads`);
  }

  if (area === "schools" && schoolSlug && child === "departments" && !childSlug) {
    redirect(`/academics/schools/${schoolSlug}`);
  }

  if (area === "schools" && schoolSlug && child === "departments" && childSlug) {
    const baseHref = `/academics/schools/${schoolSlug}/departments/${childSlug}`;

    if (departmentChild === "staff") {
      redirect(`${baseHref}/team`);
    }

    if (departmentChild === "documents") {
      redirect(`${baseHref}/downloads`);
    }

    const section = (departmentChild ?? "about") as DepartmentDetailSectionKey;

    if (!departmentChild || departmentDetailSections.has(section)) {
      const [headerConfig, departmentData] = await Promise.all([
        getAcademicsEntityHeader(segments),
        getDepartmentDetailData(childSlug, "academic"),
      ]);

      return (
        <DepartmentDetailSection
          data={departmentData}
          section={section}
          baseHref={baseHref}
          header={headerConfig ? <EntityHeader {...headerConfig} /> : undefined}
          navItems={headerConfig?.navItems}
        />
      );
    }
  }

  if (area === "departments" && schoolSlug) {
    const baseHref = `/academics/departments/${schoolSlug}`;

    if (child === "staff") {
      redirect(`${baseHref}/team`);
    }

    if (child === "documents") {
      redirect(`${baseHref}/downloads`);
    }

    const section = (child ?? "about") as DepartmentDetailSectionKey;

    if (!child || departmentDetailSections.has(section)) {
      const [headerConfig, departmentData] = await Promise.all([
        getAcademicsEntityHeader(segments),
        getDepartmentDetailData(schoolSlug, "academic"),
      ]);

      return (
        <DepartmentDetailSection
          data={departmentData}
          section={section}
          baseHref={baseHref}
          header={headerConfig ? <EntityHeader {...headerConfig} /> : undefined}
          navItems={headerConfig?.navItems}
        />
      );
    }
  }

  if (
    area === "schools" &&
    schoolSlug &&
    !childSlug &&
    schoolDetailSections.has(child as SchoolDetailSectionKey)
  ) {
    const [headerConfig, schoolData] = await Promise.all([
      getAcademicsEntityHeader(segments),
      getSchoolDetailOverviewData(schoolSlug),
    ]);

    return (
      <SchoolDetailSection
        data={schoolData}
        section={child as SchoolDetailSectionKey}
        header={headerConfig ? <EntityHeader {...headerConfig} /> : undefined}
        navItems={headerConfig?.navItems}
      />
    );
  }

  const headerConfig = await getAcademicsEntityHeader(segments);

  return (
    <PublicSectionPage
      config={await getAcademicsPageConfig(segments, filters)}
      header={headerConfig ? <EntityHeader {...headerConfig} /> : undefined}
    />
  );
}
