import { CouncilDashboard } from "../../governance/university-council/_components/council-dashboard";
import { managementBoardGovernanceProfile } from "@/lib/api/organization";

export default function AdminUniversityManagementPage() {
  return <CouncilDashboard profile={managementBoardGovernanceProfile} />;
}
