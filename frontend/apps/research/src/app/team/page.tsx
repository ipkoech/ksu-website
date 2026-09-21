import type { Metadata } from "next";
import { ResearchTeamDirectory } from "../../components/team-directory";
import { getResearchSiteContext } from "../../lib/research-site-context";
import { buildTeamMembers } from "../about/about-page-model";
import { publicFrontendUrl } from "../../lib/service-urls";

export const revalidate = 300;
export const metadata: Metadata = {
  title: "Team",
  description: "Meet the Research, Extension, Innovation and Resource Mobilization office team.",
};

export default async function TeamPage() {
  const { researchContext: context } = await getResearchSiteContext();
  // The context also includes parent-division leadership. Only office assignments
  // belong in this directory; researcher status is not office membership.
  const assignments = (context?.team.assignments ?? []).filter(assignment =>
    assignment.is_current && Boolean(assignment.entity_id) && (
      (assignment.entity_type === "wing" && assignment.entity_id === context?.relationships.wing_id) ||
      (assignment.entity_type === "department" && assignment.entity_id === context?.relationships.department_id)
    )
  );
  const members = buildTeamMembers(context ? { ...context.team, assignments } : null);
  const people = members.filter((member, index) => members.findIndex(other => other.id === member.id) === index)
    .map(member => ({ ...member, institutional_role: member.assignmentTitle }));
  return <main id="research-main" className="min-h-screen bg-white"><ResearchTeamDirectory people={people} error={context ? null : "The office directory is temporarily unavailable. Please try again later."} mainSite={publicFrontendUrl} /></main>;
}
