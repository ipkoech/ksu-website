import { SchoolRecordDetail } from "@/components/schools/school-record-detail";

export function generateStaticParams() {
  return [
    "departments",
    "programmes",
    "inquiries",
    "publications",
    "team",
    "staff",
    "lecturers",
  ].map((resource) => ({ resource, id: "new" }));
}

export default async function SchoolDetailPage({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  return <SchoolRecordDetail resource={resource} id={id} />;
}
