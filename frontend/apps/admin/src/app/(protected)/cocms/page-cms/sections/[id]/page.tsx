import { redirect } from "next/navigation";

export { generateStaticParams } from "@/app/(protected)/corporate-communication/page-cms/sections/[id]/page";

export default async function CoCmsPageCmsSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/corporate-communication/page-cms/sections/${id}`);
}
