import { AdmissionsNextContent } from "./admissions-next-content";
import { getAdmissionsPageData } from "@/lib/get-admissions";
import { redirect } from "next/navigation";

const sectionByRoute: Record<string, string> = {
  "how-to-apply": "how-to-apply",
  intakes: "intakes",
  requirements: "requirements",
  fees: "fees",
  scholarships: "fees",
  international: "international",
  documents: "requirements",
  brochures: "requirements",
};

export default async function AdmissionsRoutePage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;

  if (segments.length) {
    redirect(`/admissions#${sectionByRoute[segments[0]] ?? "requirements"}`);
  }

  const admissionsData = await getAdmissionsPageData();

  return <AdmissionsNextContent segments={segments} data={admissionsData} />;
}
