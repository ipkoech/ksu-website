import { InstitutionalDocumentPage } from "@/components/about/institutional-document-page";
import { PageShell } from "@/components/site-shell";
import { getQualityAssuranceData } from "@/lib/about-data";
import { publicFileUrl } from "@/lib/public-media";
import { getPublicAboutData } from "@/lib/public-about-data";

export const metadata = { title: "University Service Charter" };

export default async function ServiceCharterPage() {
  const [about, quality] = await Promise.all([getPublicAboutData(), getQualityAssuranceData()]);
  const resources = quality.documents.filter((document) => [document.title, document.category, document.document_type].filter(Boolean).join(" ").toLowerCase().includes("service")).flatMap((document) => { const href = publicFileUrl(document.file_id); return href ? [{ id: document.id, title: document.title, description: document.description, href }] : []; });
  const introduction = about?.university.charter_summary || quality.overview?.charter_summary || "Our Service Charter defines the standards, responsibilities and timelines through which Kisii University serves students, staff, partners and the public.";
  return <PageShell><InstitutionalDocumentPage eyebrow="University Service Charter" title="Service with clarity, dignity and accountability." introduction={introduction} heroImage="/images/backgrounds/KSUGreenLandscapingMay2026-7466.jpg" sectionTitle="A public promise of dependable service" points={[{ title: "Accessible service", body: "Clear channels help every member of our community find information and assistance." }, { title: "Timely response", body: "Published commitments establish expectations for responsive and dependable support." }, { title: "Fair treatment", body: "Our values of respect, inclusivity and fairness guide every service interaction." }, { title: "Continuous improvement", body: "Feedback and institutional review help us strengthen the quality of service over time." }]} resources={resources} /></PageShell>;
}
