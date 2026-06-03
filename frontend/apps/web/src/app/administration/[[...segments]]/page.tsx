import { notFound, redirect } from "next/navigation";
import { EntityHeader } from "@ksu/ui/layout/public";
import {
  AdministrationOfficeDetailSection,
  type AdministrationOfficeDetailSectionKey,
  type AdministrationMediaType,
} from "@/components/public/administration-office-detail-section";
import {
  DepartmentDetailSection,
  type DepartmentDetailSectionKey,
} from "@/components/public/department-detail-section";
import { PublicSectionPage } from "@/components/public/section-page";
import { getAdministrationEntityHeader } from "@/lib/entity-header-data";
import {
  getAdministrationDirectorateDetailData,
  getAdministrationDivisionDetailData,
} from "@/lib/administration-office-detail-data";
import { getDepartmentDetailData } from "@/lib/department-detail-data";
import { getAdministrationPageConfig } from "@/lib/public-record-page-data";

const administrativeDepartmentSections = new Set<DepartmentDetailSectionKey>([
  "team",
  "publications",
  "services",
  "media",
  "downloads",
  "contact",
]);

const administrationOfficeSections = new Set<AdministrationOfficeDetailSectionKey>([
  "units",
  "schools",
  "team",
  "services",
  "media",
  "downloads",
  "contact",
]);

const administrationMediaTypes = new Set<AdministrationMediaType>([
  "news",
  "events",
  "blogs",
  "announcements",
  "gallery",
]);

const administrationUnitSlugAliases: Record<string, string> = {
  "information-communication-and-technology":
    "information-communication-and-technology-ict",
};

function canonicalAdministrationUnitSlug(slug: string) {
  return administrationUnitSlugAliases[slug] ?? slug;
}

function administrationUnitRedirectPath(
  canonicalSlug: string,
  child?: string,
  grandchild?: string,
) {
  const baseHref = `/administration/units/${canonicalSlug}`;
  if (
    !child ||
    child === "about" ||
    child === "message" ||
    child === "directorates" ||
    child === "units" ||
    child === "schools"
  ) {
    return baseHref;
  }
  return `${baseHref}/${child}${grandchild ? `/${grandchild}` : ""}`;
}

export default async function AdministrationRoutePage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const [area, slug, child, grandchild] = segments;

  if (area === "divisions" && slug) {
    if (child === "message" || child === "about") {
      redirect(`/administration/divisions/${slug}`);
    }
    if (child === "directorates") {
      redirect(`/administration/divisions/${slug}/units`);
    }
    const section = (child ?? "overview") as AdministrationOfficeDetailSectionKey;
    if (child && !administrationOfficeSections.has(section)) notFound();
    const mediaType = grandchild as AdministrationMediaType | undefined;
    if (grandchild && (section !== "media" || !administrationMediaTypes.has(mediaType!))) {
      notFound();
    }

    const [headerConfig, data] = await Promise.all([
      getAdministrationEntityHeader(segments),
      getAdministrationDivisionDetailData(slug),
    ]);

    if (!data) notFound();

    return (
      <AdministrationOfficeDetailSection
        data={data}
        section={section}
        mediaType={mediaType}
        header={headerConfig ? <EntityHeader {...headerConfig} /> : undefined}
      />
    );
  }

  if (area === "directorates" && slug) {
    const canonicalSlug = canonicalAdministrationUnitSlug(slug);
    redirect(administrationUnitRedirectPath(canonicalSlug, child, grandchild));
  }

  if (area === "units" && slug) {
    const canonicalSlug = canonicalAdministrationUnitSlug(slug);
    if (canonicalSlug !== slug) {
      redirect(administrationUnitRedirectPath(canonicalSlug, child, grandchild));
    }
    const baseHref = `/administration/units/${canonicalSlug}`;
    if (child === "message") redirect(baseHref);
    if (child === "directorates" || child === "units" || child === "schools") {
      redirect(baseHref);
    }

    if (child === "staff") {
      redirect(`${baseHref}/team`);
    }

    if (child === "documents") {
      redirect(`${baseHref}/downloads`);
    }

    if (child === "news") {
      redirect(`${baseHref}/media/news`);
    }

    if (child === "programmes") {
      redirect(baseHref);
    }

    const departmentSection = (child ?? "about") as DepartmentDetailSectionKey;
    const departmentMediaType = grandchild as AdministrationMediaType | undefined;
    if (
      grandchild &&
      (departmentSection !== "media" ||
        !administrationMediaTypes.has(departmentMediaType!))
    ) {
      notFound();
    }

    if (!child || administrativeDepartmentSections.has(departmentSection)) {
      const [headerConfig, departmentData] = await Promise.all([
        getAdministrationEntityHeader([area, canonicalSlug, child, grandchild].filter(Boolean)),
        getDepartmentDetailData(canonicalSlug, "administrative"),
      ]);

      if (departmentData.sourceBacked) {
        return (
          <DepartmentDetailSection
            data={departmentData}
            section={departmentSection}
            baseHref={baseHref}
            mediaType={departmentMediaType}
            header={headerConfig ? <EntityHeader {...headerConfig} /> : undefined}
            navItems={headerConfig?.navItems}
          />
        );
      }
    }

    const [headerConfig, data] = await Promise.all([
      getAdministrationEntityHeader([area, canonicalSlug, child, grandchild].filter(Boolean)),
      getAdministrationDirectorateDetailData(canonicalSlug),
    ]);

    if (!data) notFound();
    if (child === "about") redirect(baseHref);
    const section = (child ?? "overview") as AdministrationOfficeDetailSectionKey;
    if (child && !administrationOfficeSections.has(section)) notFound();
    const mediaType = grandchild as AdministrationMediaType | undefined;
    if (grandchild && (section !== "media" || !administrationMediaTypes.has(mediaType!))) {
      notFound();
    }

    return (
      <AdministrationOfficeDetailSection
        data={data}
        section={section}
        mediaType={mediaType}
        header={headerConfig ? <EntityHeader {...headerConfig} /> : undefined}
      />
    );
  }

  const headerConfig = await getAdministrationEntityHeader(segments);

  return (
    <PublicSectionPage
      config={await getAdministrationPageConfig(segments)}
      header={headerConfig ? <EntityHeader {...headerConfig} /> : undefined}
    />
  );
}
