import { ModuleLanding } from "@/components/dashboard/module-landing";

export default function PeoplePage() {
  return (
    <ModuleLanding
      title="People"
      description="Manage public person profiles and staff assignments used across schools, departments, and governance."
      items={[
        {
          title: "Persons",
          description: "Maintain reusable person profiles, contact details, bios, and profile metadata.",
          href: "/people/persons",
          icon: "users",
          status: "Backed by /api/v1/persons.",
        },
        {
          title: "Staff directory",
          description: "Find staff profiles and manage their active, ended, and reassigned positions.",
          href: "/people/staff",
          icon: "userRound",
          status: "Backed by /api/v1/persons and /api/v1/staff/assignments.",
        },
      ]}
      backendNotes={[
        "Person records and staff assignments are separate backend resources.",
        "Assignment pages must preserve entity type, entity ID, role, dates, and conflict checking behavior.",
      ]}
    />
  );
}
