import { redirect } from "next/navigation";

export function generateStaticParams() {
  return [
    { resource: "news" },
    { resource: "press-releases" },
    { resource: "notices" },
    { resource: "events" },
    { resource: "homepage-features" },
    { resource: "sliders" },
    { resource: "media-folders" },
    { resource: "media-assets" },
    { resource: "faqs" },
    { resource: "contacts" },
    { resource: "testimonials" },
  ];
}

export default async function CoCmsResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource } = await params;
  redirect(`/corporate-communication/${resource}`);
}
