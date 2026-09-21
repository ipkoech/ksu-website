import { publicResearchContextApi } from "@ksu/api-client";

export async function getResearchOfficeScope() {
  const { data: context } = await publicResearchContextApi.get();
  const departmentId = context.relationships.department_id;
  const wingId = context.relationships.wing_id;
  if (departmentId) return { entity_type: "department", entity_id: departmentId };
  if (wingId) return { entity_type: "wing", entity_id: wingId };
  throw new Error("Configure the research office before adding team members.");
}
