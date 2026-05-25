import ClientPage from "./client-page";

export function generateStaticParams() {
  return [{ id: "_static" }];
}

export default function RolePage() {
  return <ClientPage />;
}
