import { ModuleLanding } from "@/components/dashboard/module-landing";

export default function AdmissionsPage() {
  return (
    <ModuleLanding
      title="Admissions"
      description="Manage intake windows and admission information pages exposed by the main backend."
      items={[
        {
          title: "Information",
          description: "Create and update admission pages, requirements, fee notices, audiences, school scope, and supporting media.",
          href: "/admissions/info",
          icon: "fileText",
          status: "Backed by /api/v1/admissions.",
        },
        {
          title: "Intakes",
          description: "Create and update application windows, deadlines, and open or closed intake states.",
          href: "/admissions/intakes",
          icon: "calendarDays",
          status: "Backed by /api/v1/intakes.",
        },
      ]}
      backendNotes={[
        "Admission information supports title, slug, type, audience levels, school scope, cover image, attachment, publish state, and display order.",
        "Intakes are tied to an academic calendar and expose application windows, capacity, cover image, active state, and open state.",
        "Programme applications are not represented here until backend application endpoints are added.",
      ]}
    />
  );
}
