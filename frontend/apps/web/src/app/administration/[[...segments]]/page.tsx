import { redirect } from "next/navigation";
import { EntityHeader } from "@ksu/ui/layout/public";
import {
  DepartmentDetailSection,
  type DepartmentDetailSectionKey,
} from "@/components/public/department-detail-section";
import { PublicSectionPage } from "@/components/public/section-page";
import { getAdministrationEntityHeader } from "@/lib/entity-header-data";
import { getDepartmentDetailData } from "@/lib/department-detail-data";
import { getAdministrationPageConfig } from "@/lib/public-record-page-data";

const administrativeDepartmentSections = new Set<DepartmentDetailSectionKey>([
  "team",
  "publications",
  "services",
  "news",
  "downloads",
  "contact",
]);

export default async function AdministrationRoutePage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const [area, slug, child] = segments;

  if (area === "units" && slug) {
    const baseHref = `/administration/units/${slug}`;

    if (child === "staff") {
      redirect(`${baseHref}/team`);
    }

    if (child === "documents") {
      redirect(`${baseHref}/downloads`);
    }

    if (child === "programmes") {
      redirect(baseHref);
    }

    const section = (child ?? "about") as DepartmentDetailSectionKey;

    if (!child || administrativeDepartmentSections.has(section)) {
      const [headerConfig, departmentData] = await Promise.all([
        getAdministrationEntityHeader(segments),
        getDepartmentDetailData(slug, "administrative"),
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

  const headerConfig = await getAdministrationEntityHeader(segments);

  return (
    <PublicSectionPage
      config={await getAdministrationPageConfig(segments)}
      header={headerConfig ? <EntityHeader {...headerConfig} /> : undefined}
    />
  );
}
