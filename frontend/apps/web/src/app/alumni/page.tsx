import { PublicSectionPage } from "@/components/public/section-page";
import { getAlumniPageConfig } from "@/lib/public-record-page-data";

export const revalidate = 300;

export default async function AlumniPage() {
  return <PublicSectionPage config={await getAlumniPageConfig()} />;
}
