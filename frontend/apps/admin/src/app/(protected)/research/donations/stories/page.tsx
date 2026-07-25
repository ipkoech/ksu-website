import { redirect } from "next/navigation";

export default function DonationStoriesPage() {
  redirect("/research/donations?tab=stories");
}
