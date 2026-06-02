import { PublicSectionPage } from "@/components/public/section-page";
import { getContactPageConfig } from "@/lib/utility-page-data";

export default async function ContactPage() {
  return <PublicSectionPage config={await getContactPageConfig()} />;
}

