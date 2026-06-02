import { PublicSectionPage } from "@/components/public/section-page";
import { getPrivacyPageConfig } from "@/lib/utility-page-data";

export default function PrivacyPage() {
  return <PublicSectionPage config={getPrivacyPageConfig()} />;
}

