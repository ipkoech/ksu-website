import { redirect } from "next/navigation";

export default function ResearchDonorsPage() {
  redirect("/research/donations?tab=donors");
}
