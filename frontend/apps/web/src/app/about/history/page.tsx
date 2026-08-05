import { redirect } from "next/navigation";

export default function HistoryPage() {
  redirect("/about?history=open");
}
