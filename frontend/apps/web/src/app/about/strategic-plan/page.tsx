import { InstitutionalDocumentPage } from "@/components/about/institutional-document-page";
import { PageShell } from "@/components/site-shell";
import { getQualityAssuranceData } from "@/lib/about-data";
import { publicFileUrl } from "@/lib/public-media";
import { getPublicAboutData } from "@/lib/public-about-data";

export const metadata = { title: "Strategic Plan" };

export default async function StrategicPlanPage() {
  const [about, quality] = await Promise.all([getPublicAboutData(), getQualityAssuranceData()]);
  const resources = quality.documents.filter((document) => [document.title, document.category, document.document_type].filter(Boolean).join(" ").toLowerCase().includes("strategic")).flatMap((document) => { const href = publicFileUrl(document.file_id); return href ? [{ id: document.id, title: document.title, description: document.description, href }] : []; });
  const fallbackPoints = [{ title: "Quality education and training", body: "Strengthen relevant programmes and an excellent student experience." }, { title: "Research and innovation", body: "Generate knowledge and practical solutions for society." }, { title: "Partnerships and outreach", body: "Build purposeful collaboration and deepen community impact." }, { title: "Institutional sustainability", body: "Grow resilient infrastructure, systems and financial capacity." }];
  const points = quality.strategicPriorities.length ? quality.strategicPriorities : fallbackPoints;
  return <PageShell><InstitutionalDocumentPage eyebrow="Strategic Plan" title="A clear direction for enduring impact." introduction={about?.university.strategic_plan_summary || "Kisii University’s strategic direction aligns teaching, research, partnerships and institutional strength with the needs of Kenya and the wider region."} heroImage="/images/backgrounds/KSUB-RollPhotos2025-123.jpg" sectionTitle="Priorities shaping our future" points={points} resources={resources} /></PageShell>;
}
