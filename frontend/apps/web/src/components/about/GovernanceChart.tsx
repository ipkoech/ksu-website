import type { UniversityCouncilPageData, UniversityCouncilMemberCard } from "@/lib/about-data";
import { UniversityCouncilCard } from "./UniversityCouncilCard";

export function isGovernmentCouncilMember(member: UniversityCouncilMemberCard) {
  return member.is_ex_officio === true || /government|principal.secretary|cabinet.secretary/i.test(member.appointment_category ?? "");
}

export default function GovernanceChart({ data }: { data: UniversityCouncilPageData }) {
  const regular = data.members.filter(member => !isGovernmentCouncilMember(member));
  const officials = data.members.filter(isGovernmentCouncilMember);
  const groups = [
    { label: "Chairperson", members: data.chairperson ? [data.chairperson] : [], featured: true },
    { label: "Council Members", members: regular, featured: false },
    { label: "Government and Ex-officio Members", members: officials, featured: false },
    { label: "Secretary to Council", members: data.secretary ? [data.secretary] : [], featured: false },
  ].filter(group => group.members.length);
  return (
    <div className="mx-auto max-w-7xl" aria-label="University Council hierarchy">
      {groups.map((group, index) => (
        <section key={group.label} aria-label={group.label} className="py-5">
          {index > 0 ? <div aria-hidden className="mx-auto mb-5 h-8 w-px bg-primary/25" /> : null}
          <div className="flex flex-wrap justify-center gap-5">
            {group.members.map(member => (
              <div key={member.person_id ?? member.id ?? member.name} className={group.featured ? "w-full max-w-[360px]" : "w-[200px] max-w-full"}>
                <UniversityCouncilCard member={member} variant={group.featured ? "featured" : "member"} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
