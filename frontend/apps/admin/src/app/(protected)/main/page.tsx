import { Metadata } from "next";
import { MainDashboardClient } from "./main-dashboard-client";

export const metadata: Metadata = {
  title: "Main Dashboard",
};

export default function MainDashboardPage() {
  return <MainDashboardClient />;
}
