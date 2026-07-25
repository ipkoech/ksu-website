import { redirect } from "next/navigation";

export default function DonationSettingsPage() {
  redirect("/research/donations?tab=settings");
}
