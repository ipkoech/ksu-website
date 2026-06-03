import BoardMembersRedirectClient from "./redirect-client";

export function generateStaticParams() {
  return [{ id: "_static" }];
}

export default async function BoardMembersRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BoardMembersRedirectClient routeId={id} />;
}
