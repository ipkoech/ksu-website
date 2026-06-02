import { PublicSectionPage } from "@/components/public/section-page";
import { getFaqPageConfig } from "@/lib/utility-page-data";

export default async function FaqPage() {
  return <PublicSectionPage config={await getFaqPageConfig()} />;
}

