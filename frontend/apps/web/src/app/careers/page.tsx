import { permanentRedirect } from "next/navigation";

// Job adverts and applications are managed entirely on the official digital
// job portal; this route exists so internal links and old bookmarks keep
// working.
export default function CareersPage() {
  permanentRedirect(
    "https://digital.kisiiuniversity.ac.ke/job_portal/open_adverts",
  );
}
