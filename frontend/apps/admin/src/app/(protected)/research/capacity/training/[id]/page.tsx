"use client";

import { researchServiceApi } from "@ksu/api-client";
import { ResearchAdminDetailPage } from "../../../_components/research-admin-detail-page";

export default function TrainingProgramDetailPage() {
  return (
    <ResearchAdminDetailPage
      title="Training Program"
      description="View training schedule, organizer, registration, certification, and audit history."
      resource={researchServiceApi.training}
      backHref="/research/capacity/training"
      slugParam="id"
      lookup="id"
      labelFields={["program_type", "delivery_mode", "status"]}
      factFields={[
        { label: "Code", field: "code" },
        { label: "Center", field: "center_id", relation: { adapter: "researchCenter" } },
        { label: "Organizer", field: "organizer_id", relation: { adapter: "person" } },
        { label: "Start", field: "start_date", format: "date" },
        { label: "End", field: "end_date", format: "date" },
        { label: "Free", field: "is_free", format: "boolean" },
      ]}
      sections={[
        { title: "Program", fields: ["summary", "description", "objectives", "target_audience", "prerequisites"] },
        { title: "Delivery", fields: ["curriculum", "outcomes", "schedule", "duration_hours", "venue", "platform", "meeting_link"] },
        { title: "Registration", fields: ["registration_deadline", "max_participants", "current_registrations", "offers_certificate", "cpd_points"] },
        { title: "Contact", fields: ["contact_name", "contact_email", "contact_phone", "brochure_url"] },
      ]}
      auditResourceTypes={["training_program", "training", "capacity_training"]}
    />
  );
}
