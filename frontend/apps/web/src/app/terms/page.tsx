import { PublicSectionPage } from "@/components/public/section-page";
import { getTermsPageConfig } from "@/lib/utility-page-data";

export default function TermsPage() {
  return <PublicSectionPage config={getTermsPageConfig()} />;
}

