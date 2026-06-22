import { LibraryWorkflowPage } from "../../components/library-workflow-page";

export const metadata = {
  title: "Remote Access",
  description: "Remote access workflow guidance from Kisii University Library.",
};

export const dynamic = "force-dynamic";

export default function RemoteAccessPage() {
  return (
    <LibraryWorkflowPage
      workflowType="remote_access"
      eyebrow="Remote Access"
      title="Remote access guidance for e-resources and library platforms."
      body="Use the published remote-access workflow to connect to subscribed platforms, databases, and support channels."
      primaryHref="/electronic"
      primaryLabel="Browse e-resources"
    />
  );
}
