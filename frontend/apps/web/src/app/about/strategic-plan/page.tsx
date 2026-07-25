import { notFound } from "next/navigation";
import { InstitutionalDocumentPage } from "@/components/about/institutional-document-page";
import { PageShell } from "@/components/site-shell";
import { getPublicInstitutionalPage } from "@/lib/public-about-data";

export const metadata = { title: "Strategic Plan" };

export default async function StrategicPlanPage() {
  const page = await getPublicInstitutionalPage("strategic-plan");
  if (!page) notFound();
  return <PageShell><InstitutionalDocumentPage page={page} /></PageShell>;
}
