import { Metadata } from "next";
import { ResearchDashboardClient } from "./research-dashboard-client";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function ResearchDashboardPage() {
  return <ResearchDashboardClient />;
}
