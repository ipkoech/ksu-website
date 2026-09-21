import { PublicSectionPage } from "@/components/public/section-page";
import { getFaqPageConfig } from "@/lib/utility-page-data";

export const revalidate = 300;

export default async function FaqPage() {
  return <PublicSectionPage config={await getFaqPageConfig()} />;
}

