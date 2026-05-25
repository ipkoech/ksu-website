import { PublicSectionPage } from "@/components/public/section-page";
import { getAlumniPageConfig } from "@/lib/public-record-page-data";

export default async function AlumniPage() {
  return <PublicSectionPage config={await getAlumniPageConfig()} />;
}
