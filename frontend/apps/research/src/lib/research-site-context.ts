import { unstable_cache } from "next/cache";
import {
  departmentsApi,
  divisionsApi,
  wingsApi,
  type Department,
  type Division,
  type Wing,
} from "@ksu/api-client";
import {
  resolveResearchTeamEntity,
  type AboutResearchTeamEntity,
} from "../app/about/about-page-model";

export type ResearchSiteContext = {
  researchTeamEntity: AboutResearchTeamEntity;
};

export const getResearchSiteContext = unstable_cache(
  async (): Promise<ResearchSiteContext> => {
    const [departments, wings] = await Promise.all([
      getResearchDepartments(),
      getResearchWings(),
    ]);

    return {
      researchTeamEntity: resolveResearchTeamEntity({ departments, wings }),
    };
  },
  ["research-site-context"],
  {
    revalidate: 300,
    tags: ["research-site-context"],
  },
);

async function getResearchDepartments() {
  try {
    const response = await departmentsApi.list({
      search: "REIRM",
      fields: "id,name,code,slug",
      page: 1,
      per_page: 10,
    });
    return (response.data ?? []) as Pick<Department, "id" | "name" | "code" | "slug">[];
  } catch {
    return [];
  }
}

async function getResearchWings() {
  try {
    const divisionsResponse = await divisionsApi.list({
      fields: "id,name,code",
      is_active: true,
      page: 1,
      per_page: 50,
    });
    const arsa = ((divisionsResponse.data ?? []) as Pick<Division, "id" | "name" | "code">[]).find(
      (division) =>
        compactText(division.code).toUpperCase() === "ARSA" ||
        compactText(division.name).toLowerCase().includes("research"),
    );
    if (!arsa?.id) return [];

    const wingsResponse = await wingsApi.listByDivision(arsa.id, {
      fields: "id,name,code,slug",
      is_active: true,
    });
    return (wingsResponse.data ?? []) as Pick<Wing, "id" | "name" | "code" | "slug">[];
  } catch {
    return [];
  }
}

function compactText(value?: string | number | null) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\s+/g, " ").trim();
}
