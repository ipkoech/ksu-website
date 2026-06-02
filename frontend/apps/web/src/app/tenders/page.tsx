import { PublicSectionPage } from "@/components/public/section-page";
import { getTendersPageConfig } from "@/lib/utility-page-data";

export default async function TendersPage() {
  return <PublicSectionPage config={await getTendersPageConfig()} />;
}

