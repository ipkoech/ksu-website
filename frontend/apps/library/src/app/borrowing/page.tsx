import { LibraryWorkflowPage } from "../../components/library-workflow-page";

export const metadata = {
  title: "Borrowing",
  description: "Borrowing and access workflow guidance from Kisii University Library.",
};

export const dynamic = "force-dynamic";

export default function BorrowingPage() {
  return (
    <LibraryWorkflowPage
      workflowType="borrowing_access"
      eyebrow="Borrowing"
      title="Borrowing and access guidance for library users."
      body="Review published borrowing steps, access expectations, and support links before using circulation services."
      primaryHref="/catalog"
      primaryLabel="Search catalog"
    />
  );
}
