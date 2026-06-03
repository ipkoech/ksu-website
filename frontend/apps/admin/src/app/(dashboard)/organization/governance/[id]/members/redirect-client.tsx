"use client";

import { useSearchParams } from "next/navigation";
import { ClientRedirect } from "@/components/navigation/client-redirect";

export default function BoardMembersRedirectClient({ routeId }: { routeId: string }) {
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const target =
    routeId === "_static" && queryId
      ? `_static?id=${encodeURIComponent(queryId)}`
      : routeId;

  return <ClientRedirect to={`/organization/governance/${target}`} />;
}
