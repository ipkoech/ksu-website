import ClientPage from "./client-page";

// Admin is a static export. Generate safe placeholders for each supported
// content type so the authenticated, browser-owned detail workspace remains
// addressable without embedding private records at build time.
export function generateStaticParams() {
  return [
    "news",
    "event",
    "story",
    "announcement",
    "calendar_entry",
    "gallery_link",
    "document",
    "download",
  ].map((contentType) => ({ contentType, id: "new" }));
}

export default function SchoolContentDetailPage() {
  return <ClientPage />;
}
