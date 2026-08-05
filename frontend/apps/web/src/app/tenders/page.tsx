import { permanentRedirect } from "next/navigation";

// Tenders are managed entirely on the official procurement portal; this
// route exists so internal links and old bookmarks keep working.
export default function TendersPage() {
  permanentRedirect(
    "https://digital.kisiiuniversity.ac.ke/procurement_portal/tenders",
  );
}
