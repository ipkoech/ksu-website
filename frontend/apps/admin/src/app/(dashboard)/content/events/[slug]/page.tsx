import ClientPage from "./client-page";

export function generateStaticParams() {
  return [{ slug: "new" }];
}

export default function EventPage() {
  return <ClientPage />;
}
