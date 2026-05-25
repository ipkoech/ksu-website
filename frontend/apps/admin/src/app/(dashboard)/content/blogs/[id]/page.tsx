import ClientPage from "./client-page";

export function generateStaticParams() {
  return [{ id: "new" }];
}

export default function BlogPage() {
  return <ClientPage />;
}
