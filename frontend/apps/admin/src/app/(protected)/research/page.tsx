import { Metadata } from "next";
import { ResearchDashboardClient } from "./research-dashboard-client";

export const metadata: Metadata = {
  title: "Research Dashboard",
};

export default function ResearchDashboardPage() {
  return <ResearchDashboardClient />;
}
