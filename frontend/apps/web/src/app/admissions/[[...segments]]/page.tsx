import { AdmissionsContent } from "./admissions-content";
import { getAdmissionsPageData } from "@/lib/get-admissions";

export default async function AdmissionsRoutePage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  const admissionsData = await getAdmissionsPageData();

  return <AdmissionsContent segments={segments} data={admissionsData} />;
}
