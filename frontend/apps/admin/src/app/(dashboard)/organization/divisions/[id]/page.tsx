import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/shared/loading-skeleton";
import ClientPage from "./client-page";

export function generateStaticParams() {
  return [{ id: "new" }, { id: "_static" }];
}

export default function DivisionPage() {
  return (
    <Suspense fallback={<LoadingSkeleton rows={10} />}>
      <ClientPage />
    </Suspense>
  );
}
