import { Suspense } from "react";
import ClientPage from "./client-page";

export function generateStaticParams() {
  return [{ id: "new" }, { id: "_static" }];
}

export default function DepartmentPage() {
  return (
    <Suspense>
      <ClientPage />
    </Suspense>
  );
}
