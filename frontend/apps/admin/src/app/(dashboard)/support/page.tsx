import { ModuleLanding } from "@/components/dashboard/module-landing";

export default function SupportPage() {
  return (
    <ModuleLanding
      title="Support"
      description="Manage support content currently available in the main portal backend."
      items={[
        {
          title: "FAQs",
          description: "Create and maintain frequently asked questions for public support surfaces.",
          href: "/support/faqs",
          icon: "messageSquare",
          status: "Backed by /api/v1/faqs.",
        },
      ]}
      backendNotes={[
        "FAQ records are the implemented support workflow in the current admin app.",
        "Do not add ticketing, chat, or workflow metrics until matching backend routes and UI flows exist.",
      ]}
    />
  );
}
