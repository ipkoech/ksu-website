import { ClientRedirect } from "@/components/navigation/client-redirect";

export function generateStaticParams() {
  return [{ id: "_static" }];
}

export default async function BoardMembersRedirectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ id?: string }>;
}) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const target = id === "_static" && query.id
    ? `_static?id=${encodeURIComponent(query.id)}`
    : id;
  return <ClientRedirect to={`/organization/governance/${target}`} />;
}
