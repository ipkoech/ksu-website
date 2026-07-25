import { redirect } from "next/navigation";

export default function ResearchDonationRecordsPage() {
  redirect("/research/donations?tab=records");
}
