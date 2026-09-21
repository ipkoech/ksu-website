import { notFound, redirect } from "next/navigation";
import { getActiveViceChancellor } from "@/lib/vice-chancellor-data";

export const revalidate = 300;

export default async function ViceChancellorProfilePage() {
  const assignment = await getActiveViceChancellor();
  const person = assignment?.person;
  if (!assignment || !person?.id) notFound();
  redirect(`/staff/${person.id}`);
}
