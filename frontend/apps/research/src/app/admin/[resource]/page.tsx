import { notFound } from "next/navigation";
import { ResourceList } from "../../../features/admin/resource-list";
export default async function Page({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(resource)) notFound();
  return <ResourceList resource={resource} />;
}
