import { notFound } from "next/navigation";
import { RecordDetail } from "../../../../features/admin/record-detail";
export default async function Page({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(resource) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  return <RecordDetail resource={resource} id={id} />;
}
