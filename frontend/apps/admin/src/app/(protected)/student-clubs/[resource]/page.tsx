import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [{ resource: "profiles" }];
}

export default async function StudentClubsResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  await params;
  redirect("/corporate-communication/student-clubs");
}
