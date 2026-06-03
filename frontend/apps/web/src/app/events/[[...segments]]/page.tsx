import { redirect } from "next/navigation";

export default async function EventsRoutePage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  redirect(`/media/events${segments.length ? `/${segments.join("/")}` : ""}`);
}
