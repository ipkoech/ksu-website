import { Suspense } from "react";
import ClientPage from "./client-page";

export function generateStaticParams() {
  return [{ id: "_static" }];
}

export default function StaffAssignmentPage() {
  return (
    <Suspense>
      <ClientPage />
    </Suspense>
  );
}
