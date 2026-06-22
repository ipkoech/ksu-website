import { LibraryWorkflowPage } from "../../components/library-workflow-page";

export const metadata = {
  title: "Digital Scholarship",
  description: "Digital scholarship workflow guidance from Kisii University Library.",
};

export const dynamic = "force-dynamic";

export default function DigitalScholarshipPage() {
  return (
    <LibraryWorkflowPage
      workflowType="digital_scholarship"
      eyebrow="Digital Scholarship"
      title="Digital scholarship support for research projects."
      body="Follow published library guidance for digital scholarship projects, tools, data, and specialist support."
      primaryHref="/specialists"
      primaryLabel="Find support"
    />
  );
}
