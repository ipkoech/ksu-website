import { SchoolPortalProvider } from "@/components/schools/school-portal-provider";

export default function SchoolsLayout({ children }: { children: React.ReactNode }) {
  return <SchoolPortalProvider>{children}</SchoolPortalProvider>;
}
