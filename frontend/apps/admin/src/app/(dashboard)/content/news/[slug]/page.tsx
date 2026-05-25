import ClientPage from "./client-page";

export function generateStaticParams() {
  return [{ slug: "new" }];
}

export default function NewsPage() {
  return <ClientPage />;
}
