import type { Metadata } from "next";
import { GenericRecordGrid } from "../../components/research-listing";
import { ResearchPageIntro, ResearchSection } from "../../components/research-ui";
import { getGuidelines, getResources } from "../../lib/research-public-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forms & Templates",
  description: "Research forms, templates, and resource documents.",
};

export default async function FormsPage() {
  const [resources, guidelines] = await Promise.all([
    getResources(),
    getGuidelines(),
  ]);

  return (
    <main id="research-main" className="min-h-screen bg-white">
      <ResearchPageIntro
        eyebrow="Forms & Templates"
        title="Forms, templates, and practical research resources."
        body="Resource and guideline records provide the backend-backed forms and templates catalogue."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Forms" }]}
      />
      <ResearchSection
        eyebrow="Resources"
        title="Forms and templates"
        body="Resources tagged as forms or templates can be managed from the research service."
        tone="white"
      >
        <GenericRecordGrid
          records={resources}
          labelFields={["resource_type", "category", "status"]}
          hrefBase="/resources-tools"
        />
      </ResearchSection>
      <ResearchSection
        eyebrow="Guidance"
        title="Related guidelines"
        body="Guidelines provide instructions for using the forms and templates."
      >
        <GenericRecordGrid
          records={guidelines}
          labelFields={["guideline_type", "type", "status"]}
          hrefBase="/guidelines"
        />
      </ResearchSection>
    </main>
  );
}
