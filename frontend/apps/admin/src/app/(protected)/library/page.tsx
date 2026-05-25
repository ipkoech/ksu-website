import { Metadata } from "next";
import { LibraryDashboardClient } from "./library-dashboard-client";

export const metadata: Metadata = {
  title: "Library Dashboard",
};

export default function LibraryDashboardPage() {
  return <LibraryDashboardClient />;
}
