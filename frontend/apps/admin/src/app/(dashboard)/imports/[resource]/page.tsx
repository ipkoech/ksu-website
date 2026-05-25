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
  ];
}

export default function ImportPage() {
  return (
    <Suspense>
      <ClientPage />
    </Suspense>
  );
}
