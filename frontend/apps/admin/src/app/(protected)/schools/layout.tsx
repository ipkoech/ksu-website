import { notFound } from "next/navigation";
import { SchoolPortalProvider } from "@/components/schools/school-portal-provider";

export default function SchoolsLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_SCHOOL_PORTAL_ENABLED === "false") {
    notFound();
  }
  return <SchoolPortalProvider>{children}</SchoolPortalProvider>;
}
