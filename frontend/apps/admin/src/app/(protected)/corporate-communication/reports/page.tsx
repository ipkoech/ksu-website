import { CorporateCommunicationDashboard } from "@/components/analytics/corporate-communication-dashboard";

/** Reports use the same backend-backed dashboard response, with its period and
 * content/source filters providing the supported report dimensions. */
export default function CommunicationsReportsPage() {
  return <CorporateCommunicationDashboard />;
}
