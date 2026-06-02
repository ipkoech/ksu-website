import { PublicSectionPage } from "@/components/public/section-page";
import { getConferencesPageConfig } from "@/lib/utility-page-data";

export default async function ConferencesPage() {
  return <PublicSectionPage config={await getConferencesPageConfig()} />;
}

