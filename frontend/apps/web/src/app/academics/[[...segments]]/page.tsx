import { notFound, redirect } from "next/navigation";
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
import type { EntityMediaType } from "@/lib/entity-media-data";

const schoolDetailSections = new Set<SchoolDetailSectionKey>([
  "team",
  "programmes",
  "publications",
  "media",
  "downloads",
  "clubs",
  "contact",
]);

const departmentDetailSections = new Set<DepartmentDetailSectionKey>([
  "team",
  "programmes",
  "publications",
  "services",
  "media",
  "downloads",
  "contact",
]);

const entityMediaTypes = new Set<EntityMediaType>([
  "news",
  "events",
  "blogs",
  "announcements",
  "gallery",
]);

export default async function AcademicsRoutePage({
  params,
  searchParams,
}: {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<{
    level?: string;
    mode_of_study?: string;
    q?: string;
    school_id?: string;
    sort?: string;
  }>;
}) {
  const { segments = [] } = await params;
  const filters = await searchParams;
  const [area, schoolSlug, child, childSlug, departmentChild, mediaChild] = segments;

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

  if (area === "schools" && schoolSlug && child === "news" && !childSlug) {
    redirect(`/academics/schools/${schoolSlug}/media/news`);
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

    if (departmentChild === "news") {
      redirect(`${baseHref}/media/news`);
    }

    const section = (departmentChild ?? "about") as DepartmentDetailSectionKey;
    const mediaType = mediaChild as EntityMediaType | undefined;
    if (mediaChild && (section !== "media" || !entityMediaTypes.has(mediaType!))) {
      notFound();
    }

    if (!departmentChild || departmentDetailSections.has(section)) {
      const [headerConfig, departmentData] = await Promise.all([
        getAcademicsEntityHeader(segments),
        getDepartmentDetailData(childSlug, "academic", filters.q),
      ]);

      return (
        <DepartmentDetailSection
          data={departmentData}
          section={section}
          baseHref={baseHref}
          mediaType={mediaType}
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

    if (child === "news") {
      redirect(`${baseHref}/media/news`);
    }

    const section = (child ?? "about") as DepartmentDetailSectionKey;
    const mediaType = childSlug as EntityMediaType | undefined;
    if (childSlug && (section !== "media" || !entityMediaTypes.has(mediaType!))) {
      notFound();
    }

    if (!child || departmentDetailSections.has(section)) {
      const [headerConfig, departmentData] = await Promise.all([
        getAcademicsEntityHeader(segments),
        getDepartmentDetailData(schoolSlug, "academic", filters.q),
      ]);

      return (
        <DepartmentDetailSection
          data={departmentData}
          section={section}
          baseHref={baseHref}
          mediaType={mediaType}
          header={headerConfig ? <EntityHeader {...headerConfig} /> : undefined}
          navItems={headerConfig?.navItems}
        />
      );
    }
  }

  if (
    area === "schools" &&
    schoolSlug &&
    schoolDetailSections.has(child as SchoolDetailSectionKey)
  ) {
    const section = child as SchoolDetailSectionKey;
    const mediaType = childSlug as EntityMediaType | undefined;
    if (childSlug && (section !== "media" || !entityMediaTypes.has(mediaType!))) {
      notFound();
    }

    const [headerConfig, schoolData] = await Promise.all([
      getAcademicsEntityHeader(segments),
      getSchoolDetailOverviewData(schoolSlug),
    ]);

    return (
      <SchoolDetailSection
        data={schoolData}
        section={section}
        mediaType={mediaType}
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
      heroSize="compact"
    />
  );
}
