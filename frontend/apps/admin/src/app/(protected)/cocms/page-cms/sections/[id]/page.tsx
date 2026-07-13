import { redirect } from "next/navigation";

export default async function CoCmsPageCmsSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/corporate-communication/page-cms/sections/${id}`);
}
