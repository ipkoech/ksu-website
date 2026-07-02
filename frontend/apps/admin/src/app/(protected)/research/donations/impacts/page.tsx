import { redirect } from "next/navigation";

export default function DonationImpactsPage() {
  redirect("/research/donations?tab=impacts");
}
