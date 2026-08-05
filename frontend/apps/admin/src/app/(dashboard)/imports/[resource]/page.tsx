import { Suspense } from "react";
import ClientPage from "./client-page";

export function generateStaticParams() {
  return [
    { resource: "campuses" },
    { resource: "academic-calendars" },
    { resource: "schools" },
    { resource: "departments" },
    { resource: "divisions" },
    { resource: "wings" },
    { resource: "intakes" },
    { resource: "programmes" },
    { resource: "persons" },
    { resource: "staff-assignments" },
    { resource: "faqs" },
    { resource: "research-projects" },
    { resource: "research-publications" },
    { resource: "research-grants" },
    { resource: "research-innovations" },
    { resource: "research-partners" },
    { resource: "research-centers" },
    { resource: "research-outputs" },
    { resource: "research-training" },
    { resource: "research-scholarships" },
    { resource: "research-mentorship" },
    { resource: "research-consultancies" },
    { resource: "research-endowments" },
    { resource: "research-impact-metrics" },
    { resource: "research-themes" },
    { resource: "research-focus-areas" },
    { resource: "research-expertise-tags" },
    { resource: "research-programs" },
    { resource: "research-farms" },
    { resource: "research-sustainability" },
    { resource: "research-donors" },
    { resource: "research-donations" },
    { resource: "research-funders" },
    { resource: "research-journals" },
    { resource: "research-grant-guidelines" },
    { resource: "research-stories" },
  ];
}

export default function ImportPage() {
  return (
    <Suspense>
      <ClientPage />
    </Suspense>
  );
}
