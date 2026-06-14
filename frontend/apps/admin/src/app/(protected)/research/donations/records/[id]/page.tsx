"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../../_components/research-admin-detail-page";

export default function ResearchDonationDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Donation Record"
      description="View donation amount, designation, donor linkage, purpose, and status."
      resource={researchServiceApi.donations}
      backHref="/research/donations/records"
      slugParam="id"
      lookup="id"
      labelFields={["donation_type", "designation", "status"]}
      factFields={[
        { label: "Amount", field: "amount" },
        { label: "Currency", field: "currency" },
        { label: "Date", field: "donation_date", format: "date" },
        { label: "Donor ID", field: "donor_id" },
      ]}
      sections={[
        { title: "Purpose", fields: ["purpose", "notes"] },
        { title: "Payment", fields: ["payment_method", "payment_reference", "receipt_number"] },
      ]}
    />
  );
}
