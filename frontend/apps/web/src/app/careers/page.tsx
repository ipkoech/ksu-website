import { PublicSectionPage } from "@/components/public/section-page";
import { getCareersPageConfig } from "@/lib/utility-page-data";

export default async function CareersPage() {
  return <PublicSectionPage config={await getCareersPageConfig()} />;
}

