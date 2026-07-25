import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [
    { resource: "divisions" },
    { resource: "offices" },
    { resource: "staff-assignments" },
    { resource: "news" },
    { resource: "notices" },
    { resource: "events" },
    { resource: "documents" },
    { resource: "faqs" },
    { resource: "contacts" },
  ];
}

export default async function InstitutionalAdministrationResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  redirect(`/admin/${resource}`);
}
