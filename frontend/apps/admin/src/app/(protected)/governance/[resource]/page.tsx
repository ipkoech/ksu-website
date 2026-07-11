import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [
    { resource: "council" },
    { resource: "divisions" },
    { resource: "wings" },
    { resource: "staff-assignments" },
    { resource: "documents" },
  ];
}

export default async function GovernanceResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  const mappedResource = resource === "wings" ? "offices" : resource;
  redirect(`/admin/${mappedResource}`);
}
