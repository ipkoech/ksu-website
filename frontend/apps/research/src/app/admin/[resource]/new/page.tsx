import { notFound } from "next/navigation";
import { NewRecord } from "../../../../features/admin/record-form";
export default async function Page({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(resource)) notFound();
  return <NewRecord resource={resource} />;
}
