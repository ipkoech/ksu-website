import { unstable_cache } from "next/cache";
import {
  ApiClientError,
  publicResearchContextApi,
  type PublicResearchContextResponse,
} from "@ksu/api-client";
import type { AboutResearchTeamEntity } from "../app/about/about-page-model";

export type ResearchSiteContext = {
  researchTeamEntity: AboutResearchTeamEntity;
  researchContext: PublicResearchContextResponse | null;
};

export const getResearchSiteContext = unstable_cache(
  async (): Promise<ResearchSiteContext> => {
    const context = await fetchResearchContext();

    return {
      researchTeamEntity: toResearchTeamEntity(context),
      researchContext: context,
    };
  },
  ["research-site-context"],
  {
    revalidate: 300,
    tags: ["research-site-context"],
  },
);

async function fetchResearchContext(): Promise<PublicResearchContextResponse | null> {
  try {
    const response = await publicResearchContextApi.get({
      fields: "resolved_entity,entity,team,leadership,relationships,division,wing,department",
      include:
        "division:id,name,slug,code,division_type,description,head_message,mission,vision,core_values,email,phone,office_location,operating_hours,cover_image_id;" +
        "wing:id,division_id,name,slug,code,wing_type,description,head_message,mandate,service_charter,email,phone,office_location,operating_hours,cover_image_id,division(id,name,slug,code,division_type);" +
        "department:id,name,slug,code,department_type,wing_id,about,head_message,mission,vision,mandate,core_values,service_charter,guidelines,email,phone,office_location,cover_image_id,is_public,wing(id,name,slug,code,wing_type)",
    });
    return response.data ?? null;
  } catch (error) {
    if (error instanceof ApiClientError) {
      return null;
    }
    throw error;
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
