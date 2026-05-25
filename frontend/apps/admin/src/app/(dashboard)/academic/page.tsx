import { ModuleLanding } from "@/components/dashboard/module-landing";

export default function AcademicPage() {
  return (
    <ModuleLanding
      title="Academic"
      description="Manage schools, departments, and programmes that power the public academic pages."
      items={[
        {
          title: "Schools",
          description: "Create and update school records, leadership details, and public profile content.",
          href: "/academic/schools",
          icon: "building",
          status: "Backed by /api/v1/schools.",
        },
        {
          title: "Departments",
          description: "Manage academic and administrative department records.",
          href: "/academic/departments",
          icon: "building2",
          status: "Backed by /api/v1/departments.",
        },
        {
          title: "Programmes",
          description: "Maintain programme metadata, requirements, modes of study, and public descriptions.",
          href: "/academic/programmes",
          icon: "bookOpen",
          status: "Backed by /api/v1/programmes.",
        },
      ]}
      backendNotes={[
        "List, create, update, and delete flows use the main API academic endpoints.",
        "Detail/edit pages are dynamic record states and should not depend on hard-coded sample records.",
        "Public academic pages consume these records, so admin edits must preserve backend field names and validation.",
      ]}
    />
  );
}
