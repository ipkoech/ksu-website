"use client";

import { ResearchResourcePage, researchServiceApi } from "../../_components/research-resource-page";

export default function TrainingProgramsPage() {
  return (
    <ResearchResourcePage
      title="Training Programs"
      description="Manage research capacity training programs."
      queryKey={["research", "training"]}
      resource={researchServiceApi.training}
      manageScopes={["training_program.manage", "research:write"]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "Slug" },
        { name: "code", label: "Code" },
        { name: "program_type", label: "Program Type", placeholder: "workshop" },
        { name: "category", label: "Category", placeholder: "research_methods" },
        { name: "center_id", label: "Research Center", type: "entity", relation: { adapter: "researchCenter", filters: { is_active: true } } },
        { name: "organizer_id", label: "Organizer", type: "entity", relation: { adapter: "person", filters: { status: "active" } } },
        { name: "summary", label: "Summary", type: "textarea" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "objectives", label: "Objectives", type: "textarea" },
        { name: "target_audience", label: "Target Audience", type: "textarea" },
        { name: "prerequisites", label: "Prerequisites", type: "textarea" },
        { name: "curriculum", label: "Curriculum", type: "textarea" },
        { name: "outcomes", label: "Outcomes", type: "textarea" },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
        { name: "schedule", label: "Schedule", type: "textarea" },
        { name: "duration_hours", label: "Duration Hours", type: "number" },
        { name: "delivery_mode", label: "Delivery Mode", placeholder: "in_person" },
        { name: "venue", label: "Venue" },
        { name: "platform", label: "Platform" },
        { name: "meeting_link", label: "Meeting Link", type: "url" },
        { name: "registration_deadline", label: "Registration Deadline", type: "datetime-local" },
        { name: "max_participants", label: "Max Participants", type: "number" },
        { name: "is_free", label: "Free", type: "boolean" },
        { name: "fee", label: "Fee", type: "number" },
        { name: "currency", label: "Currency", placeholder: "KES" },
        { name: "offers_certificate", label: "Offers Certificate", type: "boolean" },
        { name: "cpd_points", label: "CPD Points", type: "number" },
        { name: "contact_name", label: "Contact Name" },
        { name: "contact_email", label: "Contact Email", type: "email" },
        { name: "contact_phone", label: "Contact Phone" },
        { name: "cover_image_url", label: "Cover Image URL", type: "url" },
        { name: "brochure_url", label: "Brochure URL", type: "url" },
        { name: "status", label: "Status", placeholder: "draft" },
        { name: "is_active", label: "Active", type: "boolean" },
        { name: "is_featured", label: "Featured", type: "boolean" },
      ]}
      defaults={{ program_type: "workshop", delivery_mode: "in_person", currency: "KES", is_free: true, status: "draft" }}
      emptyMessage="No training programs were returned by the research service."
    />
  );
}
