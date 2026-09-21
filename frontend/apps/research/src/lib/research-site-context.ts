import { unstable_cache, unstable_noStore as noStore } from "next/cache";
import {
  ApiClientError,
  publicResearchContextApi,
  type PublicResearchContextResponse,
} from "@ksu/api-client/server";
import type { AboutResearchTeamEntity } from "../app/about/about-page-model";
import { normalizeResearchRecordResponse } from "./research-response-shapes";

export type ResearchSiteContext = {
  researchTeamEntity: AboutResearchTeamEntity;
  researchContext: PublicResearchContextResponse | null;
};

const getCachedResearchContext = unstable_cache(
  async (): Promise<PublicResearchContextResponse> => {
    // Errors must escape the cached function. Caching a null/error fallback
    // would make a temporary outage look like valid empty content.
    const response = await fetchResearchContext();
    if (!response) {
      throw new Error("Research site context unavailable");
    }
    return response;
  },
  [
    "research-site-context",
    process.env.KSU_MAIN_API_URL || process.env.NEXT_PUBLIC_MAIN_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
  ],
  {
    revalidate: 300,
    tags: ["research-site-context"],
  },
);

export async function getResearchSiteContext(): Promise<ResearchSiteContext> {
  let context: PublicResearchContextResponse | null = null;
  try {
    context = await getCachedResearchContext();
  } catch (error) {
    // The cached loader deliberately throws on an unavailable backend so the
    // error is never persisted by `unstable_cache`. The route still renders a
    // safe university-level fallback for this request, which must also remain
    // request-scoped instead of becoming the static page representation.
    noStore();
    console.error("Failed to load research site context:", error);
  }

  return {
    researchTeamEntity: toResearchTeamEntity(context),
    researchContext: context,
  };
}
async function fetchResearchContext(): Promise<PublicResearchContextResponse | null> {
  try {
    const response = await publicResearchContextApi.get({
      fields: "resolved_entity,entity,team,leadership,relationships,division,wing,department",
      include:
        "division:id,name,slug,code,division_type,description,head_message,mission,vision,core_values,email,phone,office_location,operating_hours,cover_image_id;" +
        "wing:id,division_id,name,slug,code,wing_type,description,head_message,mandate,service_charter,email,phone,office_location,operating_hours,cover_image_id,division(id,name,slug,code,division_type);" +
        "department:id,name,slug,code,department_type,wing_id,about,head_message,mission,vision,mandate,core_values,service_charter,guidelines,email,phone,office_location,cover_image_id,is_public,wing(id,name,slug,code,wing_type)",
    });
    const normalized = normalizeResearchRecordResponse<PublicResearchContextResponse>(response);
    if (normalized === undefined) throw new Error("Malformed Research site context response");
    return normalized;
  } catch (error) {
    if (!(error instanceof ApiClientError)) {
      // Network-level failure (gateway unreachable): degrade instead of
      // failing the whole build/request — pages render their fallbacks.
      console.error("Failed to fetch research site context:", error);
    }
    return null;
  }
}

function toResearchTeamEntity(
  context: PublicResearchContextResponse | null,
): AboutResearchTeamEntity {
  const entity = context?.resolved_entity;
  if (!entity?.entity_type || !entity.entity_id || entity.entity_type === "university") {
    return { entity_type: "university" };
  }
  if (
    entity.entity_type === "department" ||
    entity.entity_type === "wing" ||
    entity.entity_type === "division"
  ) {
    return { entity_type: entity.entity_type, entity_id: entity.entity_id };
  }
  return { entity_type: "university" };
}
