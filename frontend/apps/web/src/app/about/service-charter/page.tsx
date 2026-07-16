import { notFound } from "next/navigation";
import { InstitutionalDocumentPage } from "@/components/about/institutional-document-page";
import { PageShell } from "@/components/site-shell";
import { getPublicInstitutionalPage } from "@/lib/public-about-data";

export const metadata = { title: "University Service Charter" };

export default async function ServiceCharterPage() {
  const page = await getPublicInstitutionalPage("service-charter");
  if (!page) notFound();
  return <PageShell><InstitutionalDocumentPage page={page} /></PageShell>;
}
