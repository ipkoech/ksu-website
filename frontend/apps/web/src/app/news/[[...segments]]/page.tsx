import { redirect } from "next/navigation";

export default async function NewsRoutePage({
  params,
}: {
  params: Promise<{ segments?: string[] }>;
}) {
  const { segments = [] } = await params;
  redirect(`/media/news${segments.length ? `/${segments.join("/")}` : ""}`);
}
